#!/usr/bin/env python3
"""Derive Preview readiness from GitHub's Vercel status and bot evidence."""
import os
import re
import time
from urllib.parse import urlparse

import orchestration_github as adapter
from orchestration import Rejected, reduce

VERCEL_BOT = "vercel[bot]"
PREVIEW_RE = re.compile(r"\[Preview\]\((https://[^)]+\.vercel\.app)\)")
READY_RE = re.compile(r"(?<!!)\[Ready\]\((https://vercel\.com/[^)]+)\)")


def matching_preview(pr_number, deployment_id, attempts=6, delay_seconds=5):
    """Wait briefly for Vercel's mutable PR comment to catch up with status=success."""
    for attempt in range(attempts):
        matches = []
        comments = adapter.gh(
            f"repos/{adapter.REPO}/issues/{pr_number}/comments?per_page=100",
            "--paginate",
        )
        for comment in comments:
            if comment.get("user", {}).get("login") != VERCEL_BOT:
                continue
            body = comment.get("body", "")
            ready = READY_RE.search(body)
            preview = PREVIEW_RE.search(body)
            if not ready or not preview:
                continue
            ready_url = urlparse(ready.group(1))
            ready_parts = [p for p in ready_url.path.split("/") if p]
            if (
                ready_url.scheme == "https"
                and ready_url.netloc == "vercel.com"
                and len(ready_parts) == 3
                and ready_parts[:2] == [adapter.REPO.split("/", 1)[0], "game-ai-hub"]
                and ready_parts[2] == deployment_id
            ):
                matches.append((preview.group(1), comment.get("html_url")))
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            raise Rejected("duplicate Vercel bot Preview evidence records")
        if attempt + 1 < attempts:
            time.sleep(delay_seconds)
    raise Rejected("Vercel bot Preview evidence did not converge within bounded retry")


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    if event.get("context") != "Vercel" or event.get("state") != "success":
        return
    sha = event.get("sha", "")
    target_url = event.get("target_url", "")
    parsed = urlparse(target_url)
    parts = [p for p in parsed.path.split("/") if p]
    if parsed.scheme != "https" or parsed.netloc != "vercel.com" or len(parts) != 3:
        raise Rejected("unexpected Vercel status target")
    if parts[:2] != [adapter.REPO.split("/", 1)[0], "game-ai-hub"]:
        raise Rejected("Vercel project target mismatch")
    deployment_id = parts[2]

    prs = adapter.gh(f"repos/{adapter.REPO}/commits/{sha}/pulls?per_page=100")
    candidates = [p for p in prs if p.get("state") == "open" and p.get("head", {}).get("sha") == sha]
    for pr in candidates:
        query = adapter.gh(
            f'search/issues?q=repo:{adapter.REPO}+is:issue+%22gameai-orchestration-index:v1%22&per_page=100'
        )
        for item in query.get("items", []):
            try:
                comment, manifest = adapter.find_manifest(item["number"])
            except Rejected:
                continue
            if manifest.get("binding", {}).get("pr") != pr["number"]:
                continue
            adapter.verify_task(item["number"], manifest)
            if manifest.get("binding", {}).get("head_sha") != sha:
                return
            if (manifest.get("stage"), manifest.get("status")) != ("preview_acceptance", "pending"):
                return
            preview_url, comment_url = matching_preview(pr["number"], deployment_id)
            status_id = str(event.get("id") or os.environ.get("GITHUB_RUN_ID", "status"))
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
                    "transition_id": f"vercel-status:{status_id}:{sha}",
                    "trigger": {"actor": "vercel[bot]", "source": "github-status-event"},
                },
                "readiness",
            )
            out, _ = reduce(manifest, payload, "deployment")
            adapter.write(item["number"], comment, out, manifest["revision"])
            adapter.ensure_work_dispatch(item["number"], out)
            return


if __name__ == "__main__":
    main()
