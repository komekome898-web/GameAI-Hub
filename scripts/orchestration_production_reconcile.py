#!/usr/bin/env python3
"""Repository-owned exact-release Production readiness relay."""
from orchestration_mode import legacy_only
import os

import orchestration_github as adapter
from orchestration import Rejected
from orchestration_post_merge_reconcile import reconcile_production_pending


@legacy_only
def main():
    requested = os.getenv("ORCH_ISSUE")
    numbers = [int(requested)] if requested else [item["number"] for item in adapter.gh(f'search/issues?q=repo:{adapter.REPO}+is:issue+%22gameai-orchestration-index:v1%22&per_page=100').get("items", [])]
    for number in numbers:
        try:
            reconcile_production_pending(number)
        except Rejected:
            continue


if __name__ == "__main__":
    main()
