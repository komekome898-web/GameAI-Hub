#!/usr/bin/env python3
"""Crash-safe reconciliation for Production hotfix child creation.

The durable trigger is the parent Run Manifest itself: a Production Acceptance
FAIL plus its persisted last_acceptance result. That record is written before
any child Issue side effect, so reconciliation can resume after any later crash.
"""
import json
import os
import subprocess

import orchestration_github as adapter
from orchestration import Rejected, create_hotfix, reduce


def pending_operation(parent):
    if (parent.get("stage"), parent.get("status")) != ("production_acceptance", "failed"):
        return None
    if parent.get("lineage", {}).get("active_child_issue"):
        return None
    result = parent.get("last_acceptance") or {}
    if result.get("verdict") != "FAIL" or not result.get("result_id"):
        return None
    lineage = parent.get("lineage", {})
    count = lineage.get("hotfix_count", 0) + 1
    maximum = lineage.get("max_hotfixes", 2)
    operation_id = f'{parent["run_id"]}:{result["result_id"]}:{count}'
    return {
        "operation_id": operation_id,
        "result_id": result["result_id"],
        "count": count,
        "maximum": maximum,
        "title": f'Hotfix for Issue #{parent["issue"]} (generation {count}, result {result["result_id"]})',
        "marker": f'<!-- gameai-hotfix-operation:{operation_id} -->',
    }


def gh_pages(endpoint):
    """Return every GitHub API page as one parsed list using gh --slurp.

    `gh api --paginate` emits one JSON document per page. `--slurp` converts
    those documents into a single outer JSON array so one json.loads is safe.
    """
    proc = subprocess.run(
        ["gh", "api", endpoint, "--paginate", "--slurp"],
        text=True,
        capture_output=True,
    )
    if proc.returncode:
        raise RuntimeError(proc.stderr.strip())
    if not proc.stdout.strip():
        return []
    pages = json.loads(proc.stdout)
    if not isinstance(pages, list):
        raise Rejected("paginated GitHub response must be an outer JSON array")
    return pages


def _issues():
    issues = []
    for page in gh_pages(f"repos/{adapter.REPO}/issues?state=all&per_page=100"):
        if not isinstance(page, list):
            raise Rejected("issues page must be a JSON array")
        issues.extend(page)
    return issues


def find_existing_child(op):
    matches = []
    for candidate in _issues():
        if "pull_request" in candidate or candidate.get("title") != op["title"]:
            continue
        body = candidate.get("body") or ""
        # New children carry the operation marker. Exact-title fallback also
        # recovers a child created by the older PR #79 helper before this patch.
        if op["marker"] in body or body.startswith("Production Acceptance failed for parent Issue #"):
            matches.append(candidate)
    if len(matches) > 1:
        raise Rejected("ambiguous Production hotfix child operation")
    return matches[0] if matches else None


def ensure_index(issue_number, manifest_comment, child):
    indexes = [c for c in adapter.comments(issue_number) if adapter.INDEX in c.get("body", "") and adapter.trusted_comment(c)]
    if len(indexes) > 1:
        raise Rejected("ambiguous child orchestration index")
    if not indexes:
        adapter.post(issue_number, adapter.block(adapter.INDEX, {
            "schema": "gameai-orchestration-index/v1",
            "manifest_comment_id": manifest_comment["id"],
            "task_comment_id": child["task_comment_id"],
        }))


def ensure_child(parent_issue, parent, op):
    created = find_existing_child(op)
    if created is None:
        created = adapter.gh(
            f"repos/{adapter.REPO}/issues",
            "--method", "POST", "--input", "-",
            input={
                "title": op["title"],
                "body": (
                    f'{op["marker"]}\n'
                    f"Production Acceptance failed for parent Issue #{parent_issue}. "
                    "This child preserves the same Canonical Task and requires a separate human-authorized merge."
                ),
            },
        )
    child_issue = created["number"]

    try:
        child_comment, child = adapter.find_manifest(child_issue)
        if child.get("parent_run_id") != parent["run_id"]:
            raise Rejected("existing child belongs to a different parent run")
        if child.get("manifest_comment_id") is None:
            child["manifest_comment_id"] = child_comment["id"]
            adapter.patch_comment(child_comment["id"], adapter.render_manifest(child))
    except Rejected as original:
        # If there is already a trusted manifest but it is malformed/ambiguous,
        # fail closed instead of posting a second authoritative manifest.
        trusted_manifests = [c for c in adapter.comments(child_issue) if adapter.MANIFEST in c.get("body", "") and adapter.trusted_comment(c)]
        if trusted_manifests:
            raise original
        _, task = adapter.find_task(parent_issue, parent)
        try:
            child_task, existing_task = adapter.find_task(child_issue)
        except Rejected:
            child_task = adapter.post(child_issue, adapter.block(adapter.TASK, task))
            existing_task = task
        if existing_task != task:
            raise Rejected("hotfix child task mismatch")
        child = create_hotfix(parent, child_issue, op["maximum"])
        child["task_comment_id"] = child_task["id"]
        child_comment = adapter.post(child_issue, adapter.render_manifest(child))
        child["manifest_comment_id"] = child_comment["id"]
        adapter.patch_comment(child_comment["id"], adapter.render_manifest(child))

    ensure_index(child_issue, child_comment, child)
    adapter.reconcile_one(child_issue, child)
    return child_issue, child


def reconcile_issue(parent_issue):
    parent_comment, parent = adapter.find_manifest(parent_issue)

    active_child = parent.get("lineage", {}).get("active_child_issue")
    if active_child:
        try:
            _, child = adapter.find_manifest(active_child)
            adapter.reconcile_one(active_child, child)
        except Rejected:
            pass
        return False

    op = pending_operation(parent)
    if op is None:
        return False

    if op["count"] > op["maximum"]:
        event = adapter.envelope(parent, {"transition_id": f'hotfix-escalate:{op["operation_id"]}'}, "hotfix_escalate")
        out, status = reduce(parent, event, "hotfix")
        if status == "applied":
            adapter.write(parent_issue, parent_comment, out, parent["revision"])
        return True

    child_issue, child = ensure_child(parent_issue, parent, op)

    # Re-read after every child-side effect. The parent may have been updated by
    # an earlier replay before this run reached the reciprocal link.
    parent_comment, current = adapter.find_manifest(parent_issue)
    if current.get("lineage", {}).get("active_child_issue"):
        return False
    if (current.get("stage"), current.get("status")) != ("production_acceptance", "failed"):
        return False

    event = adapter.envelope(current, {
        "transition_id": f'hotfix-link:{op["operation_id"]}',
        "child_issue": child_issue,
        "child_run_id": child["run_id"],
        "max_hotfixes": op["maximum"],
    }, "link_hotfix")
    linked, status = reduce(current, event, "hotfix")
    if status == "applied":
        adapter.write(parent_issue, parent_comment, linked, current["revision"])
    return True


def reconcile_all():
    requested = os.getenv("ORCH_ISSUE", "").strip()
    if requested:
        number = int(requested)
        if number > 0:
            reconcile_issue(number)
        return

    # Scan all Issues using the same pagination-safe path as child rediscovery.
    # This avoids the Search API's first-page/indexing limitations for recovery.
    for item in _issues():
        if "pull_request" in item:
            continue
        try:
            reconcile_issue(item["number"])
        except Rejected:
            continue


if __name__ == "__main__":
    reconcile_all()
