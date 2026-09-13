#!/usr/bin/env python3
"""Reconcile Preview readiness after PR/head observation has converged."""
from urllib.parse import urlparse

import orchestration_github as adapter
from orchestration import Rejected, reduce
from orchestration_vercel_readiness import matching_preview


def current_vercel_success(sha):
    combined = adapter.gh(f"repos/{adapter.REPO}/commits/{sha}/status")
    matches = [
        status for status in combined.get("statuses", [])
        if status.get("context") == "Vercel" and status.get("state") == "success"
    ]
    if not matches:
        return None
    if len(matches) != 1:
        raise Rejected("ambiguous Vercel success status for current head")
    status = matches[0]
    target_url = status.get("target_url", "")
    parsed = urlparse(target_url)
    parts = [p for p in parsed.path.split("/") if p]
    if parsed.scheme != "https" or parsed.netloc != "vercel.com" or len(parts) != 3:
        raise Rejected("unexpected Vercel status target")
    if parts[:2] != [adapter.REPO.split("/", 1)[0], "game-ai-hub"]:
        raise Rejected("Vercel project target mismatch")
    return status, parts[2]


def main():
    query = adapter.gh(
        f'search/issues?q=repo:{adapter.REPO}+is:issue+%22gameai-orchestration-index:v1%22&per_page=100'
    )
    for item in query.get("items", []):
        try:
            comment, manifest = adapter.find_manifest(item["number"])
        except Rejected:
            continue
        if (manifest.get("stage"), manifest.get("status")) != ("preview_acceptance", "pending"):
            continue
        adapter.verify_task(item["number"], manifest)
        binding = manifest.get("binding", {})
        pr_number = binding.get("pr")
        sha = binding.get("head_sha")
        if not pr_number or not sha:
            continue
        pr = adapter.gh(f"repos/{adapter.REPO}/pulls/{pr_number}")
        if pr.get("state") != "open" or pr.get("head", {}).get("sha") != sha:
            continue
        observed = current_vercel_success(sha)
        if not observed:
            continue
        status, deployment_id = observed
        preview_url, comment_url = matching_preview(pr_number, deployment_id)
        target_url = status["target_url"]
        status_id = str(status.get("id") or "status")
        payload = adapter.envelope(
            manifest,
            {
                "environment": "preview",
                "sha": sha,
                "deployment_state": "READY",
                "verified": True,
                "origin_verified": True,
                "provider": "vercel",
                "deployment_id": deployment_id,
                "deployed_sha": sha,
                "deployment_url": preview_url,
                "evidence_source": f"{target_url} | {comment_url}",
                "claim_id": f"preview-{manifest['generation']}-{sha[:16]}",
                "attempt_id": f"preview-{manifest['generation']}-{manifest['revision'] + 1}",
                "targets": ["/"],
                "transition_id": f"vercel-reconcile:{status_id}:{sha}",
                "trigger": {"actor": "github-actions[bot]", "source": "github-current-status-reconcile"},
            },
            "readiness",
        )
        out, _ = reduce(manifest, payload, "deployment")
        adapter.write(item["number"], comment, out, manifest["revision"])


if __name__ == "__main__":
    main()
