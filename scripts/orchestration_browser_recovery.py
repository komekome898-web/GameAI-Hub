#!/usr/bin/env python3
"""Owner-only recovery for a stranded Production browser-capability attempt."""
import json
import os

import orchestration_github as adapter
from orchestration import Rejected, reduce

MARKER = "<!-- gameai-production-browser-recovery:v1 -->"
ACCEPTANCE = "<!-- gameai-acceptance:v1 -->"
BROWSER_RETRY = "<!-- gameai-browser-capability:v1 -->"
WORK_APP_ID = 1144995


def _same_claim_evidence(pr_number, claim_id):
    acceptance = []
    retry = []
    for comment in adapter.comments(pr_number):
        body = comment.get("body", "")
        if ACCEPTANCE in body:
            try:
                payload = adapter.parse(body, ACCEPTANCE)
            except (Rejected, json.JSONDecodeError):
                payload = None
            if payload and payload.get("claim_id") == claim_id:
                acceptance.append(comment)
        if BROWSER_RETRY in body:
            try:
                payload = adapter.parse(body, BROWSER_RETRY)
            except (Rejected, json.JSONDecodeError):
                payload = None
            app = comment.get("performed_via_github_app") or {}
            if payload and payload.get("claim_id") == claim_id and app.get("id") == WORK_APP_ID and app.get("slug") == "chatgpt-codex-connector":
                retry.append(comment)
    return acceptance, retry


def recover(event):
    issue = event.get("issue") or {}
    comment = event.get("comment") or {}
    sender = (event.get("sender") or {}).get("login", "")
    owner = adapter.REPO.split("/", 1)[0]

    if issue.get("pull_request") or int(issue.get("number", 0)) != 74:
        raise Rejected("browser recovery is accepted only on canonical Issue #74")
    if sender != owner or comment.get("author_association") != "OWNER":
        raise Rejected("only the repository owner may request browser recovery")

    request = adapter.parse(comment.get("body", ""), MARKER)
    required = {"claim_id", "attempt_id", "generation", "manifest_revision", "pr", "merge_sha", "deployment_id"}
    if set(request) != required:
        raise Rejected("browser recovery requires exact current claim fences")

    number = int(issue["number"])
    manifest_comment, manifest = adapter.find_manifest(number)
    adapter.verify_task(number, manifest)
    claim = manifest.get("acceptance_claim") or {}
    binding = manifest.get("binding") or {}

    if (manifest.get("stage"), manifest.get("status")) != ("production_acceptance", "running"):
        raise Rejected("stale browser recovery target is not a running Production acceptance")
    exact = {
        "claim_id": claim.get("claim_id"),
        "attempt_id": claim.get("attempt_id"),
        "generation": manifest.get("generation"),
        "manifest_revision": manifest.get("revision"),
        "pr": binding.get("pr"),
        "merge_sha": binding.get("merge_sha"),
        "deployment_id": claim.get("deployment_id"),
    }
    if request != exact:
        raise Rejected("browser recovery request is stale")
    if claim.get("environment") != "production" or claim.get("sha") != binding.get("merge_sha"):
        raise Rejected("browser recovery claim is not bound to the immutable merged release")

    candidates, signals = _same_claim_evidence(request["pr"], request["claim_id"])
    if candidates:
        raise Rejected("same-claim acceptance candidate already exists")
    if signals:
        raise Rejected("same-claim trusted browser retry signal already exists")

    signal_id = f"owner-recovery:{comment['id']}"
    signal = {
        "schema": "gameai-browser-capability/v1",
        "signal_id": signal_id,
        "claim_id": request["claim_id"],
        "run_id": manifest["run_id"],
        "canonical_task_version": manifest["canonical_task_version"],
        "expected_manifest_revision": manifest["revision"],
        "generation": manifest["generation"],
        "stage": "production_acceptance",
        "attempt_id": request["attempt_id"],
        "repository": manifest["repository"],
        "issue": manifest["issue"],
        "pr": request["pr"],
        "merge_sha": request["merge_sha"],
        "deployment_id": request["deployment_id"],
        "reason": "NO_QUALIFYING_INTERACTIVE_BROWSER",
        "capabilities": {
            "render": False,
            "input": False,
            "click": False,
            "navigation": False,
            "iframe": False,
            "back_forward": False,
        },
    }
    transition_id = f"production-browser-retry:{signal_id}"
    out, status = reduce(
        manifest,
        adapter.envelope(manifest, {"signal": signal, "transition_id": transition_id}, "production_browser_retry"),
        "acceptance",
    )
    adapter.write(number, manifest_comment, out, manifest["revision"])
    if status == "applied" and out.get("stage") == "production_acceptance" and out.get("status") in {"pending", "running"}:
        adapter.ensure_work_dispatch(number, out, record=True)
    return out


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    recover(event)


if __name__ == "__main__":
    main()
