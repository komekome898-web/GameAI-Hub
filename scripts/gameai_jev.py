#!/usr/bin/env python3
"""CLI for bounded, non-authoritative Jev shadow operations."""
from __future__ import annotations

import argparse
import json
import os
import sys

from scripts.jev.client import JevClient, JevTechnicalFailure
from scripts.jev.config import JevConfig
from scripts.jev.browser.policy import browser_preflight
from scripts.jev.policy import patch_scope, research_source_triage, reviewer_routing
from scripts.jev.redact import assert_clean
from scripts.jev.schemas import MAX_STATE_BYTES


COMMANDS = {
    "reviewer-routing": reviewer_routing,
    "patch-scope": patch_scope,
    "source-triage": research_source_triage,
}


def _read_input(path: str) -> dict[str, object]:
    stream = sys.stdin if path == "-" else open(path, "rb")
    try:
        raw = stream.read(MAX_STATE_BYTES + 1)
    finally:
        if stream is not sys.stdin:
            stream.close()
    if isinstance(raw, str):
        raw = raw.encode()
    if len(raw) > MAX_STATE_BYTES:
        raise ValueError("input exceeds the bounded JSON size limit")
    parsed = json.loads(raw)
    if not isinstance(parsed, dict):
        raise ValueError("input must be a JSON object")
    return parsed


def run_command(command: str, path: str) -> int:
    try:
        facts = _read_input(path)
        if command == "browser-preflight":
            output = browser_preflight(facts)
        else:
            config = JevConfig.from_env()
            output = COMMANDS[command](JevClient(config), facts).as_dict()
            assert_clean(output, known_secrets=(config.api_key,))
        print(json.dumps(output, sort_keys=True))
        return 0
    except (OSError, json.JSONDecodeError, ValueError, JevTechnicalFailure) as exc:
        print(json.dumps({"status": "TECHNICAL_FAILURE", "detail": str(exc), "authoritative": False}))
        return 1


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
    parser.add_argument("command", choices=("smoke", *COMMANDS, "browser-preflight"))
    parser.add_argument("--input", default="-", help="bounded JSON object file, or - for stdin")
    args = parser.parse_args()
    return smoke() if args.command == "smoke" else run_command(args.command, args.input)


if __name__ == "__main__":
    sys.exit(main())
