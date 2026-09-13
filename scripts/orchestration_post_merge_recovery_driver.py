#!/usr/bin/env python3
"""Replay an owner-authorized post-merge recovery from a same-repo recovery PR event."""
import os

import orchestration_github as adapter
from orchestration import Rejected
from orchestration_post_merge_reconcile import MARKER, reconcile

RECOVERY_PR = 101
CANONICAL_ISSUE = 74


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    pr = event.get("pull_request") or {}
    if event.get("action") != "ready_for_review" or int(pr.get("number", 0)) != RECOVERY_PR:
        return
    if pr.get("head", {}).get("repo", {}).get("full_name") != adapter.REPO:
        raise Rejected("recovery PR must originate from the same repository")

    owner = adapter.REPO.split("/", 1)[0]
    candidates = []
    for comment in adapter.comments(CANONICAL_ISSUE):
        if MARKER not in comment.get("body", ""):
            continue
        if comment.get("user", {}).get("login") != owner or comment.get("author_association") != "OWNER":
            continue
        candidates.append(comment)
    if len(candidates) != 1:
        raise Rejected("exactly one owner post-merge reconcile request is required")

    comment = candidates[0]
    reconcile({
        "issue": {"number": CANONICAL_ISSUE},
        "comment": comment,
        "sender": {"login": owner},
    })


if __name__ == "__main__":
    main()
