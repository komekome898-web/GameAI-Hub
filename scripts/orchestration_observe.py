#!/usr/bin/env python3
"""Race-safe GitHub PR/check observer for orchestration runtime."""
import os
import re

import orchestration_github as adapter
from orchestration import Rejected, reduce


def workflow_check_name(check):
    """Project Actions job check-runs to their parent workflow name."""
    raw_name = check.get("name", "check-run")
    if check.get("app", {}).get("slug") != "github-actions":
        return raw_name

    match = re.search(r"/actions/runs/(\d+)(?:/|$)", check.get("details_url", ""))
    if not match:
        return raw_name

    try:
        run = adapter.gh(f"repos/{adapter.REPO}/actions/runs/{match.group(1)}")
    except RuntimeError:
        return raw_name
    workflow_name = run.get("name") if isinstance(run, dict) else None
    return workflow_name if isinstance(workflow_name, str) and workflow_name else raw_name


def observe_check_run(pr, ci):
    query = adapter.gh(
        f'search/issues?q=repo:{adapter.REPO}+is:issue+%22gameai-orchestration-index:v1%22&per_page=100'
    )
    for item in query.get("items", []):
        try:
            comment, manifest = adapter.find_manifest(item["number"])
        except Rejected:
            continue
        if manifest["binding"].get("pr") != pr["number"]:
            continue

        adapter.verify_task(item["number"], manifest)
        observed = adapter.gh(f"repos/{adapter.REPO}/pulls/{pr['number']}")
        observed_head = observed.get("head", {})
        observed_repo = observed_head.get("repo", {}).get("full_name")
        current_sha = observed_head.get("sha")
        current_branch = observed_head.get("ref")

        if observed_repo != adapter.REPO:
            raise Rejected("cross-repository PR observation forbidden")
        if ci["sha"] != current_sha:
            return

        out = manifest
        if out["binding"].get("head_sha") != current_sha:
            bind_payload = adapter.envelope(
                out,
                {
                    "pr": pr["number"],
                    "branch": current_branch,
                    "sha": current_sha,
                    "transition_id": f"head:{pr['number']}:{current_sha}",
                },
                "bind_head",
            )
            out, _ = reduce(out, bind_payload, "binding")
            adapter.gate_status(
                current_sha,
                "pending",
                f"Issue #{item['number']}: awaiting fresh Preview PASS and authorization",
            )

        ci_payload = adapter.envelope(
            out,
            {
                **ci,
                "transition_id": f"check-run:{ci['check_id']}:{ci['sha']}:{ci['conclusion']}",
            },
            "ci_observed",
        )
        out, _ = reduce(out, ci_payload, "ci_observer")
        adapter.write(item["number"], comment, out, manifest["revision"])
        return


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    if "check_run" not in event:
        adapter.observe()
        return

    check = event["check_run"]
    ci = {
        "sha": check["head_sha"],
        "check_id": str(check["id"]),
        "check_name": workflow_check_name(check),
        "conclusion": check.get("conclusion", "unknown"),
        "source": check.get("html_url", "check_run"),
    }
    for pr in check.get("pull_requests", []):
        observe_check_run(pr, ci)


if __name__ == "__main__":
    main()
