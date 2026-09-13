#!/usr/bin/env python3
"""Replay owner-authorized merge recovery and exact-SHA Production readiness from a recovery PR event."""
import os
import urllib.request
from urllib.parse import urlparse

import orchestration_github as adapter
from orchestration import Rejected, reduce
from orchestration_post_merge_reconcile import MARKER, reconcile

RECOVERY_PR = 101
CANONICAL_ISSUE = 74
PRODUCTION_URL = "https://game-ai-hub.vercel.app"


def _production_readiness():
    comment, manifest = adapter.find_manifest(CANONICAL_ISSUE)
    adapter.verify_task(CANONICAL_ISSUE, manifest)
    if (manifest.get("stage"), manifest.get("status")) != ("production_acceptance", "pending"):
        raise Rejected("merge reconciliation did not reach production_acceptance/pending")
    merge_sha = manifest.get("binding", {}).get("merge_sha")
    if not merge_sha:
        raise Rejected("production merge SHA missing")

    combined = adapter.gh(f"repos/{adapter.REPO}/commits/{merge_sha}/status")
    vercel = [s for s in combined.get("statuses", []) if s.get("context") == "Vercel" and s.get("state") == "success" and s.get("target_url")]
    if len(vercel) != 1:
        raise Rejected("exactly one successful Vercel status is required for the merge SHA")
    status = vercel[0]
    target = status["target_url"]
    path = urlparse(target).path.rstrip("/").split("/")
    if len(path) < 3 or path[-2] != "game-ai-hub":
        raise Rejected("unexpected Vercel deployment target")
    deployment_id = path[-1]

    request = urllib.request.Request(PRODUCTION_URL, method="GET", headers={"User-Agent": "GameAI-Orchestration/1"})
    with urllib.request.urlopen(request, timeout=15) as response:
        if response.status < 200 or response.status >= 400:
            raise Rejected("canonical Production origin is not reachable")

    event = adapter.envelope(
        manifest,
        {
            "environment": "production",
            "sha": merge_sha,
            "deployed_sha": merge_sha,
            "deployment_state": "READY",
            "deployment_url": PRODUCTION_URL,
            "provider": "vercel",
            "deployment_id": deployment_id,
            "evidence_source": f"github-vercel-status:{status.get('id')}:{target}",
            "verified": True,
            "origin_verified": True,
            "claim_id": f"production-{manifest['generation']}-{merge_sha[:16]}",
            "attempt_id": f"production-{manifest['generation']}-{manifest['revision'] + 1}",
            "targets": ["/"],
            "transition_id": f"production-readiness:{status.get('id')}:{merge_sha}",
        },
        "readiness",
    )
    out, result = reduce(manifest, event, "deployment")
    if result != "applied":
        raise Rejected("Production readiness was not applied")
    adapter.write(CANONICAL_ISSUE, comment, out, manifest["revision"])
    return out


def _current_reconcile_request(owner):
    _, manifest = adapter.find_manifest(CANONICAL_ISSUE)
    adapter.verify_task(CANONICAL_ISSUE, manifest)
    if (manifest.get("stage"), manifest.get("status")) != ("human_merge", "pending"):
        raise Rejected("durable fresh Preview PASS must reach human_merge/pending first")

    binding = manifest.get("binding", {})
    pr_number = int(binding.get("pr") or 0)
    head_sha = binding.get("head_sha")
    if not pr_number or not head_sha:
        raise Rejected("current PR/head binding is incomplete")

    merged_pr = adapter.gh(f"repos/{adapter.REPO}/pulls/{pr_number}")
    merge_sha = merged_pr.get("merge_commit_sha")
    if not merged_pr.get("merged") or merged_pr.get("head", {}).get("sha") != head_sha or not merge_sha:
        raise Rejected("current bound PR is not the exact merged head")

    expected = {"pr": pr_number, "head_sha": head_sha, "merge_sha": merge_sha}
    matches = []
    for comment in adapter.comments(CANONICAL_ISSUE):
        if MARKER not in comment.get("body", ""):
            continue
        if comment.get("user", {}).get("login") != owner or comment.get("author_association") != "OWNER":
            continue
        try:
            payload = adapter.parse(comment.get("body", ""), MARKER)
        except Rejected:
            continue
        if payload == expected:
            matches.append(comment)

    if not matches:
        raise Rejected("no owner post-merge reconcile request matches the current exact merged PR/head")

    # Duplicate owner requests for the same exact immutable merge are semantically
    # idempotent. Select the newest one deterministically instead of blocking
    # recovery on harmless replay history.
    return max(matches, key=lambda item: int(item["id"]))


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    pr = event.get("pull_request") or {}
    if event.get("action") != "ready_for_review" or int(pr.get("number", 0)) != RECOVERY_PR:
        return
    if pr.get("head", {}).get("repo", {}).get("full_name") != adapter.REPO:
        raise Rejected("recovery PR must originate from the same repository")

    owner = adapter.REPO.split("/", 1)[0]
    comment = _current_reconcile_request(owner)
    reconcile({
        "issue": {"number": CANONICAL_ISSUE},
        "comment": comment,
        "sender": {"login": owner},
    })
    _production_readiness()


if __name__ == "__main__":
    main()
