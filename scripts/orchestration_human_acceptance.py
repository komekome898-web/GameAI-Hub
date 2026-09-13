#!/usr/bin/env python3
"""Accept an exact Work candidate only after an explicit owner attestation."""
import os

import orchestration_github as adapter
from orchestration import Rejected, acceptance_event, reduce

MARKER = "<!-- gameai-human-acceptance-attestation:v1 -->"
ACCEPTANCE_MARKER = "<!-- gameai-acceptance:v1 -->"
WORK_APP_ID = 1144995


def main():
    event = adapter.strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    issue = event.get("issue") or {}
    comment = event.get("comment") or {}
    sender = (event.get("sender") or {}).get("login", "")
    owner = adapter.REPO.split("/", 1)[0]

    if not issue.get("pull_request"):
        raise Rejected("human Acceptance attestation is accepted only on the bound PR")
    if sender != owner or comment.get("author_association") != "OWNER":
        raise Rejected("only the repository owner may attest an Acceptance candidate")

    command = adapter.parse(comment.get("body", ""), MARKER)
    if set(command) != {"canonical_issue", "candidate_comment_id", "result_id"}:
        raise Rejected("attestation must contain exactly canonical_issue, candidate_comment_id, and result_id")

    canonical_issue = int(command["canonical_issue"])
    pr_number = int(issue["number"])
    manifest_comment, manifest = adapter.find_manifest(canonical_issue)
    adapter.verify_task(canonical_issue, manifest)
    if manifest.get("binding", {}).get("pr") != pr_number:
        raise Rejected("attestation PR is not the Manifest-bound PR")
    if (manifest.get("stage"), manifest.get("status")) not in {("preview_acceptance", "running"), ("production_acceptance", "running")}:
        raise Rejected("Acceptance is not currently running")

    candidate = adapter.gh(f"repos/{adapter.REPO}/issues/comments/{int(command['candidate_comment_id'])}")
    if candidate.get("issue_url", "").rstrip("/").split("/")[-1] != str(pr_number):
        raise Rejected("candidate comment is not on the bound PR")
    app = candidate.get("performed_via_github_app") or {}
    if int(app.get("id") or 0) != WORK_APP_ID:
        raise Rejected("candidate was not written through the observed ChatGPT/Codex connector app")

    result = adapter.parse(candidate.get("body", ""), ACCEPTANCE_MARKER)
    if result.get("result_id") != command["result_id"]:
        raise Rejected("attested result_id does not match candidate")

    # Replace self-asserted placeholder provenance with the observed GitHub envelope.
    # Owner-attestation details remain in the reducer event trigger audit record so the
    # Acceptance result itself continues to satisfy the strict gameai-acceptance/v1 schema.
    result["actor"] = candidate.get("user", {}).get("login", "")
    result["actor_provenance"] = {
        "verified_by": "github-event-envelope",
        "sender": candidate.get("user", {}).get("login", ""),
        "actor_type": "human-attested-work-candidate",
        "app_id": str(WORK_APP_ID),
    }

    transition_id = f"human-attested-acceptance:{comment['id']}:{result['result_id']}"
    out, status = reduce(manifest, acceptance_event(manifest, result, transition_id), "acceptance")
    if status == "applied":
        out.setdefault("events", [])[-1]["trigger"] = {
            "actor": sender,
            "source": "owner-human-attestation",
            "candidate_comment_id": candidate["id"],
            "attestation_comment_id": comment["id"],
            "work_app_id": WORK_APP_ID,
        }
    adapter.write(canonical_issue, manifest_comment, out, manifest["revision"])
    if status == "applied":
        adapter.ensure_codex_dispatch(canonical_issue, out)


if __name__ == "__main__":
    main()
