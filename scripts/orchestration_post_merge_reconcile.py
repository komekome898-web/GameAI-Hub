#!/usr/bin/env python3
"""Owner-only reconciliation for a PR merged before durable Preview PASS/authorization."""
import os

import orchestration_github as adapter
from orchestration import Rejected, reduce

MARKER = "<!-- gameai-post-merge-reconcile:v1 -->"


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
    return merged


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    reconcile(event)


if __name__ == "__main__":
    main()
