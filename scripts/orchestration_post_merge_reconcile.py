#!/usr/bin/env python3
"""Owner-only reconciliation for a PR merged before durable Preview PASS/authorization."""
import os
import urllib.request
from urllib.parse import urlparse

import orchestration_github as adapter
from orchestration import Rejected, reduce

MARKER = "<!-- gameai-post-merge-reconcile:v1 -->"
PRODUCTION_URL = "https://game-ai-hub.vercel.app"


def _production_readiness(number, manifest_comment, manifest, merge_sha):
    """Derive exact Production readiness from GitHub's Vercel status for the merge SHA."""
    if (manifest.get("stage"), manifest.get("status")) != ("production_acceptance", "pending"):
        raise Rejected("merge reconciliation did not reach production_acceptance/pending")
    if manifest.get("binding", {}).get("merge_sha") != merge_sha:
        raise Rejected("Production merge SHA does not match the authoritative binding")

    combined = adapter.gh(f"repos/{adapter.REPO}/commits/{merge_sha}/status")
    vercel = [
        status for status in combined.get("statuses", [])
        if status.get("context") == "Vercel"
        and status.get("state") == "success"
        and status.get("target_url")
    ]
    if len(vercel) != 1:
        raise Rejected("exactly one successful Vercel status is required for the merge SHA")

    status = vercel[0]
    target_url = status["target_url"]
    parsed = urlparse(target_url)
    parts = [part for part in parsed.path.split("/") if part]
    expected_owner = adapter.REPO.split("/", 1)[0]
    if (
        parsed.scheme != "https"
        or parsed.netloc != "vercel.com"
        or len(parts) != 3
        or parts[:2] != [expected_owner, "game-ai-hub"]
    ):
        raise Rejected("unexpected Vercel Production deployment target")
    deployment_id = parts[2]

    request = urllib.request.Request(
        PRODUCTION_URL,
        method="GET",
        headers={"User-Agent": "GameAI-Orchestration/1"},
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        if response.status < 200 or response.status >= 400:
            raise Rejected("canonical Production origin is not reachable")

    status_id = str(status.get("id") or "vercel-status")
    readiness_event = adapter.envelope(
        manifest,
        {
            "environment": "production",
            "sha": merge_sha,
            "deployment_state": "READY",
            "verified": True,
            "origin_verified": True,
            "provider": "vercel",
            "deployment_id": deployment_id,
            "deployed_sha": merge_sha,
            "deployment_url": PRODUCTION_URL,
            "evidence_source": f"github-vercel-status:{status_id}:{target_url}",
            "claim_id": f"production-{manifest['generation']}-{merge_sha[:16]}",
            "attempt_id": f"production-{manifest['generation']}-{manifest['revision'] + 1}",
            "targets": ["/"],
            "transition_id": f"production-readiness:{status_id}:{merge_sha}",
            "trigger": {"actor": "github-actions[bot]", "source": "github-vercel-status-reconcile"},
        },
        "readiness",
    )
    ready, readiness_status = reduce(manifest, readiness_event, "deployment")
    if readiness_status != "applied":
        raise Rejected("Production readiness was not applied")
    adapter.write(number, manifest_comment, ready, manifest["revision"])
    adapter.ensure_work_dispatch(number, ready)
    return ready


def reconcile(event):
    issue = event.get("issue") or {}
    event_comment = event.get("comment") or {}
    sender = (event.get("sender") or {}).get("login", "")
    owner = adapter.REPO.split("/", 1)[0]

    if issue.get("pull_request"):
        raise Rejected("post-merge reconcile is accepted only on canonical Issues")
    if sender != owner or event_comment.get("author_association") != "OWNER":
        raise Rejected("only the repository owner may request post-merge reconciliation")

    request = adapter.parse(event_comment.get("body", ""), MARKER)
    if set(request) != {"pr", "head_sha", "merge_sha"}:
        raise Rejected("post-merge reconcile requires exactly pr, head_sha, and merge_sha")

    number = int(issue["number"])
    manifest_comment, manifest = adapter.find_manifest(number)
    adapter.verify_task(number, manifest)

    # Idempotent replay after merge reconciliation may be used solely to derive
    # Production readiness for the already-bound immutable merge SHA.
    if (manifest.get("stage"), manifest.get("status")) == ("production_acceptance", "pending"):
        binding = manifest.get("binding", {})
        if (
            request["pr"] != binding.get("pr")
            or request["head_sha"] != binding.get("head_sha")
            or request["merge_sha"] != binding.get("merge_sha")
        ):
            raise Rejected("Production readiness replay does not match the authoritative merge binding")
        return _production_readiness(number, manifest_comment, manifest, request["merge_sha"])

    if (manifest.get("stage"), manifest.get("status")) != ("human_merge", "pending"):
        raise Rejected("durable fresh Preview PASS must reach human_merge/pending first")
    accepted = manifest.get("last_acceptance") or {}
    if manifest.get("preview_acceptance") != "PASS" or accepted.get("verdict") != "PASS":
        raise Rejected("fresh Preview PASS required")
    if accepted.get("sha") != manifest.get("binding", {}).get("head_sha"):
        raise Rejected("Preview PASS is not for the current bound head")
    if request["pr"] != manifest.get("binding", {}).get("pr") or request["head_sha"] != manifest.get("binding", {}).get("head_sha"):
        raise Rejected("reconcile request does not match current PR/head binding")

    pr = adapter.gh(f"repos/{adapter.REPO}/pulls/{int(request['pr'])}")
    if not pr.get("merged"):
        raise Rejected("PR is not merged")
    if pr.get("head", {}).get("sha") != request["head_sha"]:
        raise Rejected("GitHub-observed merged head does not match request")
    if pr.get("merge_commit_sha") != request["merge_sha"]:
        raise Rejected("GitHub-observed merge SHA does not match request")

    approve_event = adapter.envelope(
        manifest,
        {
            "actor": sender,
            "authorized_at": event_comment.get("created_at"),
            "transition_id": f"post-merge-approve:{event_comment['id']}",
        },
        "approve",
    )
    approved, approve_status = reduce(manifest, approve_event, "human")
    if approve_status != "applied":
        raise Rejected("owner authorization was not applied")

    merge_event = adapter.envelope(
        approved,
        {
            "sha": request["head_sha"],
            "merge_sha": request["merge_sha"],
            "transition_id": f"post-merge-observed:{event_comment['id']}",
        },
        "merge_observed",
    )
    merged, merge_status = reduce(approved, merge_event, "merge_observer")
    if merge_status != "applied":
        raise Rejected("merge observation was not applied")

    adapter.write(number, manifest_comment, merged, manifest["revision"])
    adapter.gate_status(request["head_sha"], "success", f"Issue #{number}: authorized merged PR reconciled")

    # Re-read the authoritative projection after the merge write so Production
    # readiness is fenced to the exact persisted revision and merge binding.
    current_comment, current = adapter.find_manifest(number)
    return _production_readiness(number, current_comment, current, request["merge_sha"])


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    reconcile(event)


if __name__ == "__main__":
    main()
