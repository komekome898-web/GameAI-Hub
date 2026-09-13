#!/usr/bin/env python3
"""Ingest metadata-only Codex bridge smoke ACKs from the trusted connector App."""
import os
import re

import orchestration_github as adapter
from orchestration import Rejected, reduce

ACK_PREFIX = "gameai-codex-bridge-smoke-ack:v1"
ACK = re.compile(r"<!--\s*gameai-codex-bridge-smoke-ack:v1\s+([a-z0-9][a-z0-9-]{0,127})\s*-->")
CODEX_APP_ID = 1144995
CODEX_APP_SLUG = "chatgpt-codex-connector"
CODEX_BOT = "chatgpt-codex-connector[bot]"


def trusted_ack(event, comment):
    if event.get("action") != "created" or event.get("issue", {}).get("pull_request"):
        raise Rejected("Codex bridge ACK must be a newly created Issue comment")
    if event.get("repository", {}).get("full_name") != adapter.REPO:
        raise Rejected("wrong ACK repository")
    event_comment = event.get("comment", {})
    issue_number = event.get("issue", {}).get("number")
    expected_issue_url = f"https://api.github.com/repos/{adapter.REPO}/issues/{issue_number}"
    if event_comment.get("id") != comment.get("id") or comment.get("issue_url") != expected_issue_url:
        raise Rejected("ACK event/comment target mismatch")
    app = comment.get("performed_via_github_app") or {}
    actor = comment.get("user") or {}
    if app.get("id") != CODEX_APP_ID or app.get("slug") != CODEX_APP_SLUG:
        raise Rejected("ACK was not written through the trusted Codex connector App")
    if actor.get("login") != CODEX_BOT or actor.get("type") != "Bot":
        raise Rejected("ACK was not written by the Codex connector bot")
    if event.get("sender", {}).get("login") != CODEX_BOT or event.get("sender", {}).get("type") != "Bot":
        raise Rejected("ACK webhook sender does not match the Codex connector bot")
    body = comment.get("body", "")
    matches = ACK.findall(body)
    if len(matches) != 1 or body.count(ACK_PREFIX) != 1:
        raise Rejected("malformed or ambiguous Codex bridge ACK")
    return matches[0]


def trusted_challenge(issue_number, ack_comment, marker_id):
    """Require one earlier repository-owner challenge for this exact marker."""
    marker = f"<!-- {ACK_PREFIX} {marker_id} -->"
    owner = adapter.REPO.split("/", 1)[0]
    challenges = [
        comment
        for comment in adapter.comments(issue_number)
        if comment.get("id", 0) < ack_comment["id"]
        and comment.get("user", {}).get("login") == owner
        and comment.get("user", {}).get("type") == "User"
        and comment.get("body", "").count(marker) == 1
        and "@codex" in comment.get("body", "")
    ]
    if len(challenges) != 1:
        raise Rejected("ACK does not match exactly one trusted owner-issued Codex challenge")
    return challenges[0]


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    event_comment = event.get("comment", {})
    if ACK_PREFIX not in event_comment.get("body", ""):
        return
    comment_id = int(event_comment.get("id", 0))
    if comment_id <= 0:
        raise Rejected("ACK comment identity missing")
    # Re-fetch the durable REST resource instead of trusting mutable webhook fields.
    comment = adapter.gh(f"repos/{adapter.REPO}/issues/comments/{comment_id}")
    marker_id = trusted_ack(event, comment)
    issue_number = int(event["issue"]["number"])
    challenge = trusted_challenge(issue_number, comment, marker_id)
    manifest_comment, manifest = adapter.find_manifest(issue_number)
    adapter.verify_task(issue_number, manifest)
    payload = adapter.envelope(
        manifest,
        {
            "transition_id": f"codex-bridge-comment:{comment_id}",
            "bridge": "codex",
            "observation": "VERIFIED",
            "evidence": {
                "comment_id": comment_id,
                "challenge_comment_id": challenge["id"],
                "marker_id": marker_id,
                "source": comment.get("html_url"),
                "observed_at": comment.get("created_at"),
                "actor": CODEX_BOT,
                "app_id": CODEX_APP_ID,
                "app_slug": CODEX_APP_SLUG,
            },
            "trigger": {
                "actor": CODEX_BOT,
                "comment_id": comment_id,
                "source": "trusted-codex-connector-issue-comment",
            },
        },
        "bridge_observed",
    )
    out, _ = reduce(manifest, payload, "bridge_observer")
    adapter.write(issue_number, manifest_comment, out, manifest["revision"])


if __name__ == "__main__":
    main()
