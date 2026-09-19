#!/usr/bin/env python3
"""CLI for safe, synthetic Jev shadow smoke checks."""
from __future__ import annotations

import argparse
import json
import os
import sys

from scripts.jev.client import JevClient, JevTechnicalFailure
from scripts.jev.config import JevConfig
from scripts.jev.policy import patch_scope
from scripts.jev.redact import assert_clean


def smoke() -> int:
    if not os.environ.get("TYPESAFE_API_KEY"):
        print(json.dumps({"status": "UNAVAILABLE", "key_present": False, "authoritative": False}))
        return 2
    config = JevConfig.from_env()
    try:
        result = patch_scope(client=JevClient(config), facts={
            "task_id": "synthetic-smoke", "declared_scope": ["advisory_shadow_classifier"],
            "changed_paths": ["scripts/jev/example.py"], "change_categories": ["internal_tooling"],
            "scope_exclusions": ["orchestration_authority"],
        })
    except JevTechnicalFailure as exc:
        print(json.dumps({"status": "TECHNICAL_FAILURE", "key_present": True,
            "requested_model": config.requested_model, "response_model": exc.response_model,
            "detail": str(exc), "authoritative": False}))
        return 1
    data = result.as_dict()
    data["key_present"] = True
    data["fixture"] = "synthetic"
    assert_clean(data, known_secrets=(config.api_key,))
    print(json.dumps(data, sort_keys=True))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="GameAI Hub Jev shadow tools")
    parser.add_argument("command", choices=("smoke",))
    args = parser.parse_args()
    return smoke() if args.command == "smoke" else 2


if __name__ == "__main__":
    sys.exit(main())
