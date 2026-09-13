#!/usr/bin/env python3
"""Relay an owner-authored Issue transition command into repository_dispatch."""
import json
import os

import orchestration_github as adapter
from orchestration import Rejected

MARKER = "<!-- gameai-transition-command:v1 -->"


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    issue = event.get("issue") or {}
    comment = event.get("comment") or {}
    sender = (event.get("sender") or {}).get("login", "")
    owner = adapter.REPO.split("/", 1)[0]

    if issue.get("pull_request"):
        raise Rejected("transition commands are accepted only on canonical Issues")
    if sender != owner or comment.get("author_association") != "OWNER":
        raise Rejected("only the repository owner may issue transition commands")

    command = adapter.parse(comment.get("body", ""), MARKER)
    allowed = {"to_stage", "to_status"}
    if set(command) != allowed:
        raise Rejected("transition command must contain exactly to_stage and to_status")

    number = int(issue["number"])
    _, manifest = adapter.find_manifest(number)
    adapter.verify_task(number, manifest)

    transition_id = f"owner-comment:{comment['id']}"
    payload = adapter.envelope(
        manifest,
        {
            "to_stage": command["to_stage"],
            "to_status": command["to_status"],
            "transition_id": transition_id,
            "trigger": {
                "actor": "github-actions[bot]",
                "source": "owner-issue-comment",
                "comment_id": comment["id"],
                "requested_by": sender,
            },
        },
        "transition",
    )
    adapter.gh(
        f"repos/{adapter.REPO}/dispatches",
        "--method",
        "POST",
        "--input",
        "-",
        input={"event_type": "orchestration-transition", "client_payload": payload},
    )


if __name__ == "__main__":
    main()
