#!/usr/bin/env python3
"""Trusted ingress for a ChatGPT Work candidate written through its GitHub App."""
import json
import os

import orchestration_github as adapter
from orchestration import Rejected, acceptance_event, reduce

ACCEPTANCE = "<!-- gameai-acceptance:v1 -->"
REPLAY = "<!-- gameai-work-ingress-replay:v1 -->"
WORK_APP_ID = 1144995


def _candidate_from_event(event):
    event_comment = event.get("comment", {})
    body = event_comment.get("body", "")
    if ACCEPTANCE in body:
        return adapter.gh(f"repos/{adapter.REPO}/issues/comments/{int(event_comment['id'])}")
    if REPLAY in body:
        owner = adapter.REPO.split("/", 1)[0]
        if event_comment.get("user", {}).get("login") != owner:
            raise Rejected("replay request must be created by repository owner")
        replay = adapter.parse(body, REPLAY)
        candidate_id = int(replay.get("candidate_comment_id", 0))
        if candidate_id <= 0:
            raise Rejected("replay request missing candidate_comment_id")
        return adapter.gh(f"repos/{adapter.REPO}/issues/comments/{candidate_id}")
    return None


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    if event.get("action") != "created" or not event.get("issue", {}).get("pull_request"):
        return
    pr_number = int(event["issue"]["number"])
    comment = _candidate_from_event(event)
    if comment is None:
        return
    app = comment.get("performed_via_github_app") or {}
    if app.get("id") != WORK_APP_ID or app.get("slug") != "chatgpt-codex-connector":
        raise Rejected("candidate was not written through the observed ChatGPT Work connector")
    result = adapter.parse(comment["body"], ACCEPTANCE)
    issue_number = int(result.get("issue", 0))
    manifest_comment, manifest = adapter.find_manifest(issue_number)
    adapter.verify_task(issue_number, manifest)
    claim = manifest.get("acceptance_claim") or {}
    if result.get("claim_id") != claim.get("claim_id") or result.get("pr") != pr_number:
        raise Rejected("candidate is not for the current claim and PR")

    candidates = []
    for possible in adapter.comments(pr_number):
        if ACCEPTANCE not in possible.get("body", ""):
            continue
        try:
            parsed = adapter.parse(possible["body"], ACCEPTANCE)
        except (Rejected, json.JSONDecodeError):
            continue
        possible_app = possible.get("performed_via_github_app") or {}
        if parsed.get("claim_id") == claim.get("claim_id") and possible_app.get("id") == WORK_APP_ID:
            candidates.append(possible)
    if len(candidates) != 1 or candidates[0]["id"] != comment["id"]:
        raise Rejected("exactly one trusted candidate is required for the current Work claim")

    result["actor"] = comment.get("user", {}).get("login", "")
    result["actor_provenance"] = {
        "verified_by": "github-event-envelope",
        "sender": comment.get("user", {}).get("login", ""),
        "actor_type": "chatgpt-work-connector",
        "app_id": str(WORK_APP_ID),
    }
    out, status = reduce(manifest, acceptance_event(manifest, result, result["result_id"]), "acceptance")
    if status == "applied":
        out.setdefault("work_bridge_evidence", []).append({
            "claim_id": claim["claim_id"],
            "candidate_comment_id": comment["id"],
            "app_id": WORK_APP_ID,
            "observation": "CONFIGURED_UNVERIFIED",
        })
        out.setdefault("bridge_status", {})["work"] = "CONFIGURED_UNVERIFIED"
    adapter.write(issue_number, manifest_comment, out, manifest["revision"])


if __name__ == "__main__":
    main()
