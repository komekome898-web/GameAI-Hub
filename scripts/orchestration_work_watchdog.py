#!/usr/bin/env python3
"""Fail closed when a Work dispatch contract receives no ACK or result."""
import datetime as dt
import os

import orchestration_github as adapter
from orchestration import Rejected, reduce


def reconcile_issue(number, now=None):
    comment, manifest = adapter.find_manifest(number)
    adapter.verify_task(number, manifest)
    execution = manifest.get("work_execution") or {}
    if execution.get("status") != "contract_emitted":
        return manifest
    now = now or dt.datetime.now(dt.timezone.utc)
    deadline = dt.datetime.fromisoformat(execution["deadline_at"].replace("Z", "+00:00"))
    if now < deadline:
        return manifest
    claim = manifest.get("acceptance_claim") or {}
    observed_at = now.isoformat().replace("+00:00", "Z")
    event = adapter.envelope(manifest, {
        "claim_id": claim.get("claim_id"), "attempt_id": claim.get("attempt_id"), "sha": claim.get("sha"),
        "dispatch_id": execution.get("dispatch_id"), "deadline_at": execution["deadline_at"], "observed_at": observed_at,
        "transition_id": f"work-execution-timeout:{execution.get('dispatch_id')}:{execution['deadline_at']}",
    }, "work_execution_timeout")
    out, status = reduce(manifest, event, "work_bridge")
    if status == "applied":
        adapter.write(number, comment, out, manifest["revision"])
    return out


def main():
    requested = os.getenv("ORCH_ISSUE")
    numbers = [int(requested)] if requested else [item["number"] for item in adapter.gh(f'search/issues?q=repo:{adapter.REPO}+is:issue+%22gameai-orchestration-index:v1%22&per_page=100').get("items", [])]
    for number in numbers:
        try:
            reconcile_issue(number)
        except Rejected:
            continue


if __name__ == "__main__":
    main()
