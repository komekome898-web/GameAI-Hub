#!/usr/bin/env python3
"""GitHub adapter for the reducer. Comments are optimistic cooperative storage, not CAS."""
import hashlib, json, os, subprocess, sys, urllib.request, uuid
from orchestration import Rejected, acceptance_event, create_hotfix, projection, reduce, summary

REPO = os.getenv("GITHUB_REPOSITORY", "komekome898-web/GameAI-Hub")
MANIFEST = "<!-- gameai-run-manifest:v1 -->"
TASK = "<!-- gameai-canonical-task:v1 -->"
INDEX = "<!-- gameai-orchestration-index:v1 -->"
MAX_PAYLOAD = 128 * 1024


def gh(*args, input=None):
    proc = subprocess.run(["gh", "api", *args], input=None if input is None else json.dumps(input), text=True, capture_output=True)
    if proc.returncode: raise RuntimeError(proc.stderr.strip())
    return json.loads(proc.stdout) if proc.stdout.strip() else None


def issue(number): return gh(f"repos/{REPO}/issues/{number}")
def comments(number): return gh(f"repos/{REPO}/issues/{number}/comments", "--paginate")
def block(marker, data): return marker + "\n```json\n" + json.dumps(data, sort_keys=True, indent=2) + "\n```"


def strict_json(raw):
    require_size = len(raw.encode()) <= MAX_PAYLOAD
    if not require_size: raise Rejected("payload too large")
    def pairs(items):
        out = {}
        for key, value in items:
            if key in out: raise Rejected(f"duplicate JSON key: {key}")
            out[key] = value
        return out
    return json.loads(raw, object_pairs_hook=pairs)


def parse(body, marker):
    if body.count(marker) != 1: raise Rejected("missing or ambiguous marker")
    tail = body.split(marker, 1)[1]; start = tail.find("```json\n"); end = tail.find("\n```", start + 8)
    if start < 0 or end < 0: raise Rejected("malformed marker")
    return strict_json(tail[start + 8:end])


def trusted_comment(comment):
    author = comment.get("user", {})
    return author.get("login") in {"github-actions[bot]", REPO.split("/", 1)[0]} and author.get("type") in {"Bot", "User"}


def _authoritative(number, marker, expected_id=None):
    candidates = [c for c in comments(number) if marker in c.get("body", "") and trusted_comment(c)]
    if expected_id is not None: candidates = [c for c in candidates if c["id"] == expected_id]
    if len(candidates) != 1: raise Rejected(f"exactly one trusted {marker} comment required")
    return candidates[0]


def find_manifest(number):
    indexes = [c for c in comments(number) if INDEX in c.get("body", "") and trusted_comment(c)]
    expected = parse(indexes[0]["body"], INDEX).get("manifest_comment_id") if len(indexes) == 1 else None
    comment = _authoritative(number, MANIFEST, expected)
    manifest = parse(comment["body"], MANIFEST)
    if manifest.get("manifest_comment_id") not in {None, comment["id"]}: raise Rejected("manifest identity mismatch")
    return comment, manifest


def find_task(number, manifest=None):
    expected = manifest.get("task_comment_id") if manifest else None
    comment = _authoritative(number, TASK, expected)
    return comment, parse(comment["body"], TASK)


def verify_task(number, manifest):
    _, task = find_task(number, manifest)
    digest = hashlib.sha256(json.dumps(task, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    if task.get("version") != manifest["canonical_task_version"] or digest != manifest.get("canonical_task_digest"):
        raise Rejected("canonical task changed; authorized migration required")


def patch_comment(cid, body): return gh(f"repos/{REPO}/issues/comments/{cid}", "--method", "PATCH", "--input", "-", input={"body": body})
def post(number, body): return gh(f"repos/{REPO}/issues/{number}/comments", "--method", "POST", "--input", "-", input={"body": body})
def gate_status(sha, state, description):
    return gh(f"repos/{REPO}/statuses/{sha}", "--method", "POST", "--input", "-", input={"state": state, "context": "gameai/orchestration-authorization", "description": description[:140]})


def render_manifest(manifest):
    return summary(manifest) + "\n\n<details><summary>Machine state (do not edit)</summary>\n\n" + block(MANIFEST, manifest) + "\n</details>"


def write(number, comment, manifest, expected_revision):
    current, latest = find_manifest(number)
    if current["id"] != comment["id"] or latest["revision"] != expected_revision: raise Rejected("manifest changed before write; re-read and replay event")
    patch_comment(comment["id"], render_manifest(manifest)); reconcile_one(number, manifest)


def reconcile_one(number, manifest):
    names = [label["name"] for label in issue(number).get("labels", [])]
    gh(f"repos/{REPO}/issues/{number}/labels", "--method", "PUT", "--input", "-", input={"labels": projection(manifest, names)})


def labels():
    config = json.load(open(".github/orchestration/labels.json")); existing = {x["name"] for x in gh(f"repos/{REPO}/labels?per_page=100", "--paginate")}
    for name, color in config.items():
        endpoint = f"repos/{REPO}/labels/{name}" if name in existing else f"repos/{REPO}/labels"
        gh(endpoint, "--method", "PATCH" if name in existing else "POST", "--input", "-", input={"color": color} if name in existing else {"name": name, "color": color})


def init():
    number = int(os.environ["ORCH_ISSUE"]); version = int(os.environ["ORCH_TASK_VERSION"]); source = issue(number)
    try:
        existing_comment, existing_manifest = find_manifest(number)
        indexes = [c for c in comments(number) if INDEX in c.get("body", "") and trusted_comment(c)]
        if not indexes: post(number, block(INDEX, {"schema": "gameai-orchestration-index/v1", "manifest_comment_id": existing_comment["id"], "task_comment_id": existing_manifest["task_comment_id"]}))
        return
    except Rejected: pass
    critical = os.getenv("ORCH_CRITICAL", "false").lower() == "true"; profile = "work-critical" if critical else "work-standard"
    task = {"schema": "gameai-task/v1", "task_id": f"GAI-{number}", "version": version, "user_goal": source["body"] or source["title"], "invariants": ["independent_acceptance_required", "no_automatic_merge", "preview_evidence_cannot_substitute_production", "untested_cannot_become_pass"], "scope": {"include": [], "exclude": []}, "acceptance": {}, "permissions": {"merge": False, "production_mutation": False}, "orchestration_policy": {"max_repair_revision": 5}}
    try: task_comment, existing = find_task(number)
    except Rejected: task_comment = post(number, block(TASK, task)); existing = task
    if existing != task: raise Rejected("partial initialization found a different trusted task; migrate explicitly")
    digest = hashlib.sha256(json.dumps(task, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    profiles = json.load(open(".github/orchestration/profiles.json"))
    preview_origins = [x for x in os.getenv("ORCH_PREVIEW_ORIGINS", "").split(",") if x]; production_origins = [x for x in os.getenv("ORCH_PRODUCTION_ORIGINS", "").split(",") if x]
    manifest = {"schema": "gameai-run/v1", "run_id": f"GAI-{number}-v{version}-{uuid.uuid4().hex[:8]}", "canonical_task_version": version, "canonical_task_digest": digest, "task_comment_id": task_comment["id"], "revision": 0, "generation": 1, "stage": "research", "status": "pending", "repository": REPO, "issue": number, "binding": {"branch": None, "pr": None, "head_sha": None, "merge_sha": None}, "profile": {"id": profile, "registry_revision": profiles["revision"], "configuration_status": "UNCONFIGURED"}, "counters": {"acceptance_attempt": 0, "repair_revision": 0, "infrastructure_retry": 0, "infrastructure_failure": 0}, "max_repair_revision": 5, "processed_transition_ids": [], "bridge_status": {"codex": "NEEDS EXPERIMENT", "work": "DISABLED_UNVERIFIED", "deployment": "DISABLED_UNVERIFIED", "merge_gate": "UNVERIFIED"}, "deployment_origins": {"preview": preview_origins, "production": production_origins}, "untested": ["Codex bridge", "Work trigger/writeback/model attestation", "Preview readiness", "Production readiness", "repository merge-gate enforcement"]}
    created = post(number, render_manifest(manifest)); manifest["manifest_comment_id"] = created["id"]
    patch_comment(created["id"], render_manifest(manifest)); post(number, block(INDEX, {"schema": "gameai-orchestration-index/v1", "manifest_comment_id": created["id"], "task_comment_id": task_comment["id"]})); reconcile_one(number, manifest)


def envelope(manifest, payload, operation):
    return {"operation": operation, "run_id": manifest["run_id"], "canonical_task_version": manifest["canonical_task_version"], "expected_manifest_revision": manifest["revision"], "generation": manifest["generation"], "from_stage": manifest["stage"], "from_status": manifest["status"], "transition_id": payload.get("transition_id") or os.getenv("GITHUB_RUN_ID") + ":" + os.getenv("GITHUB_RUN_ATTEMPT", "1"), "repository": manifest["repository"], "issue": manifest["issue"], **payload}


def ingest():
    raw = os.environ.get("ORCH_PAYLOAD", "{}"); payload = strict_json(raw); number = int(payload.get("issue", 0)); comment, manifest = find_manifest(number); verify_task(number, manifest)
    kind = os.environ.get("ORCH_EVENT_NAME"); trusted = json.load(open(".github/orchestration/trusted-actors.json")); sender = os.environ.get("ORCH_SENDER", "")
    try:
        if kind == "orchestration-transition":
            if sender not in trusted.get("state_actors", []) or payload.get("trigger", {}).get("actor") != sender: raise Rejected("unauthorized transition actor")
            out, _ = reduce(manifest, {**payload, "operation": "transition"}, "generic")
        elif kind == "orchestration-acceptance":
            if sender not in trusted.get("acceptance_actors", []): raise Rejected("unauthorized acceptance actor")
            payload["actor"] = sender; payload["actor_provenance"] = {"verified_by": "github-event-envelope", "sender": sender, "actor_type": os.getenv("ORCH_ACTOR_TYPE", "unknown"), "app_id": os.getenv("ORCH_APP_ID")}
            out, mutation_status = reduce(manifest, acceptance_event(manifest, payload, payload["result_id"]), "acceptance")
        elif kind == "orchestration-readiness":
            if sender not in trusted.get("deployment_observers", []): raise Rejected("unauthorized deployment observer")
            payload = observed_deployment(payload)
            out, mutation_status = reduce(manifest, envelope(manifest, payload, "readiness"), "deployment")
        elif kind in {"orchestration-codex-dispatch", "orchestration-codex-ack", "orchestration-codex-result"}:
            if sender not in trusted.get("codex_bridge_actors", []): raise Rejected("unauthorized Codex bridge actor")
            operation = "codex_dispatch" if kind.endswith("dispatch") else "codex_ack" if kind.endswith("ack") else "codex_result"
            out, mutation_status = reduce(manifest, envelope(manifest, payload, operation), "codex_bridge")
        else: raise Rejected("unsupported generic event; human/lifecycle operations require workflow_dispatch")
        write(number, comment, out, manifest["revision"])
        if kind == "orchestration-acceptance" and mutation_status == "applied" and out["stage"] == "production_acceptance" and out["status"] == "failed": create_child_hotfix(number, comment, out, payload["result_id"])
    except (Rejected, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise Rejected(f"input archived in workflow log without state change: {exc}") from exc


def observed_deployment(payload):
    """Derive Vercel readiness and SHA from its API; discard caller assertions."""
    if payload.get("provider") != "vercel" or not payload.get("deployment_id"): raise Rejected("supported provider/deployment ID required")
    token = os.environ.get("ORCH_VERCEL_TOKEN")
    if not token: raise Rejected("deployment observer disabled until Vercel credentials are configured")
    request = urllib.request.Request(f"https://api.vercel.com/v13/deployments/{payload['deployment_id']}", headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(request, timeout=15) as response: observed = strict_json(response.read().decode())
    metadata = observed.get("meta", {}); deployed_sha = metadata.get("githubCommitSha") or metadata.get("gitCommitSha")
    return {**payload, "deployment_state": "READY" if observed.get("readyState") == "READY" else "WAIT", "deployment_url": "https://" + observed["url"], "deployed_sha": deployed_sha, "sha": deployed_sha, "verified": True, "evidence_source": f"vercel-api:{observed.get('uid')}", "deployment_id": observed.get("uid") or payload["deployment_id"]}


def human():
    number = int(os.environ["ORCH_ISSUE"]); comment, manifest = find_manifest(number); verify_task(number, manifest)
    trusted = json.load(open(".github/orchestration/trusted-actors.json")); actor = os.environ.get("GITHUB_ACTOR", "")
    if actor not in trusted.get("human_approvers", []): raise Rejected("human approver not enrolled")
    operation = os.environ["ORCH_OPERATION"]
    payload = {"actor": actor, "authorized_at": os.environ.get("ORCH_AUTHORIZED_AT"), "new_task_version": int(os.environ["ORCH_NEW_TASK_VERSION"]) if os.environ.get("ORCH_NEW_TASK_VERSION") else None}
    if operation == "migrate_task_version":
        _, old_task = find_task(number, manifest); new_task = dict(old_task); new_task["version"] = payload["new_task_version"]; new_task["user_goal"] = issue(number).get("body") or issue(number).get("title")
        existing = []
        for candidate in comments(number):
            if TASK in candidate.get("body", "") and trusted_comment(candidate):
                parsed = parse(candidate["body"], TASK)
                if parsed.get("version") == payload["new_task_version"]: existing.append((candidate, parsed))
        if existing:
            if len(existing) != 1 or existing[0][1] != new_task: raise Rejected("ambiguous task migration record")
            task_comment = existing[0][0]
        else: task_comment = post(number, block(TASK, new_task))
        payload["new_task_comment_id"] = task_comment["id"]
        payload["new_task_digest"] = hashlib.sha256(json.dumps(new_task, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    if operation == "supersede":
        successor_issue = int(os.environ.get("ORCH_SUCCESSOR_ISSUE", "0")); successor_comment, successor = find_manifest(successor_issue); verify_task(successor_issue, successor)
        if successor["canonical_task_digest"] != manifest["canonical_task_digest"]: raise Rejected("successor task contract mismatch")
        predecessor = envelope(successor, {"transition_id": f'predecessor:{manifest["run_id"]}', "predecessor_run_id": manifest["run_id"], "predecessor_issue": number}, "adopt_predecessor")
        linked_successor, _ = reduce(successor, predecessor, "human"); write(successor_issue, successor_comment, linked_successor, successor["revision"])
        payload.update(new_run_id=successor["run_id"], new_issue=successor_issue)
    out, _ = reduce(manifest, envelope(manifest, payload, operation), "human"); write(number, comment, out, manifest["revision"])
    if operation == "approve": gate_status(out["binding"]["head_sha"], "success", f"Issue #{number}: exact-SHA human authorization recorded")


def bind():
    payload = strict_json(os.environ["ORCH_PAYLOAD"]); number = int(payload["issue"]); comment, manifest = find_manifest(number); verify_task(number, manifest)
    trusted = json.load(open(".github/orchestration/trusted-actors.json")); actor = os.environ.get("GITHUB_ACTOR", "")
    if actor not in trusted.get("state_actors", []): raise Rejected("unauthorized binding actor")
    observed = gh(f"repos/{REPO}/pulls/{int(payload['pr'])}")
    if observed.get("head", {}).get("repo", {}).get("full_name") != REPO: raise Rejected("cross-repository PR binding forbidden")
    if observed.get("head", {}).get("ref") != payload.get("branch") or observed.get("head", {}).get("sha") != payload.get("sha"): raise Rejected("PR branch/head does not match GitHub observation")
    out, _ = reduce(manifest, envelope(manifest, payload, "bind_pr"), "binding"); write(number, comment, out, manifest["revision"])
    gate_status(out["binding"]["head_sha"], "pending", f"Issue #{number}: awaiting fresh Preview PASS and authorization")


def create_child_hotfix(parent_issue, parent_comment, parent, result_id):
    count = parent.get("lineage", {}).get("hotfix_count", 0) + 1; maximum = parent.get("lineage", {}).get("max_hotfixes", 2)
    if count > maximum:
        current_comment, current_parent = find_manifest(parent_issue)
        escalated, _ = reduce(current_parent, envelope(current_parent, {"transition_id": f"hotfix-escalate:{count}"}, "hotfix_escalate"), "hotfix")
        write(parent_issue, current_comment, escalated, current_parent["revision"]); return
    title = f"Hotfix for Issue #{parent_issue} (generation {count}, result {result_id})"
    found = gh(f"search/issues?q=repo:{REPO}+is:issue+in:title+%22{title.replace(' ', '+')}%22&per_page=10").get("items", [])
    created = found[0] if len(found) == 1 and found[0]["title"] == title else gh(f"repos/{REPO}/issues", "--method", "POST", "--input", "-", input={"title": title, "body": f"Production Acceptance failed for parent Issue #{parent_issue}. This child preserves the same Canonical Task and requires a separate human-authorized merge."})
    try:
        existing_comment, existing_child = find_manifest(created["number"])
        child = existing_child
        indexes = [c for c in comments(created["number"]) if INDEX in c.get("body", "") and trusted_comment(c)]
        if not indexes: post(created["number"], block(INDEX, {"schema": "gameai-orchestration-index/v1", "manifest_comment_id": existing_comment["id"], "task_comment_id": child["task_comment_id"]}))
    except Rejected:
        _, task = find_task(parent_issue, parent)
        try: child_task, existing_task = find_task(created["number"])
        except Rejected: child_task = post(created["number"], block(TASK, task)); existing_task = task
        if existing_task != task: raise Rejected("hotfix child task mismatch")
        child = create_hotfix(parent, created["number"], maximum); child["task_comment_id"] = child_task["id"]
        child_comment = post(created["number"], render_manifest(child)); child["manifest_comment_id"] = child_comment["id"]; patch_comment(child_comment["id"], render_manifest(child))
        post(created["number"], block(INDEX, {"schema": "gameai-orchestration-index/v1", "manifest_comment_id": child_comment["id"], "task_comment_id": child_task["id"]}))
    current_comment, current_parent = find_manifest(parent_issue)
    event = envelope(current_parent, {"transition_id": f'hotfix-link:{child["run_id"]}', "child_issue": created["number"], "child_run_id": child["run_id"], "max_hotfixes": maximum}, "link_hotfix")
    linked, status = reduce(current_parent, event, "hotfix")
    if status == "applied": write(parent_issue, current_comment, linked, current_parent["revision"])
    reconcile_one(created["number"], child)


def observe():
    event = strict_json(open(os.environ["ORCH_GITHUB_EVENT"]).read())
    if "check_run" in event:
        check = event["check_run"]
        for pr in check.get("pull_requests", []): _observe_pr(pr, ci={"sha": check["head_sha"], "check_id": str(check["id"]), "check_name": check.get("name", "check-run"), "conclusion": check.get("conclusion", "unknown"), "source": check.get("html_url", "check_run")})
        return
    if event.get("pull_request"): _observe_pr(event["pull_request"])


def _observe_pr(pr, ci=None):
    query = gh(f"search/issues?q=repo:{REPO}+is:issue+%22gameai-orchestration-index:v1%22&per_page=100")
    for item in query.get("items", []):
        try: comment, manifest = find_manifest(item["number"])
        except Rejected: continue
        if manifest["binding"].get("pr") != pr["number"]: continue
        verify_task(item["number"], manifest)
        if ci:
            payload = envelope(manifest, {**ci, "transition_id": f'check-run:{ci["check_id"]}:{ci["sha"]}:{ci["conclusion"]}'}, "ci_observed")
            out, _ = reduce(manifest, payload, "ci_observer")
        elif pr.get("merged"):
            auth = manifest.get("human_authorization") or {}
            if auth.get("head_sha") != pr["head"]["sha"] or auth.get("pr") != pr["number"]:
                gate_status(pr["head"]["sha"], "failure", f"Issue #{item['number']}: merge lacked exact-SHA authorization")
            payload = envelope(manifest, {"sha": pr["head"]["sha"], "merge_sha": pr["merge_commit_sha"], "transition_id": f'pr-merged:{pr["number"]}:{pr["merge_commit_sha"]}'}, "merge_observed")
            out, _ = reduce(manifest, payload, "merge_observer")
        elif manifest["binding"].get("head_sha") != pr["head"]["sha"]:
            payload = envelope(manifest, {"pr": pr["number"], "branch": pr["head"]["ref"], "sha": pr["head"]["sha"], "transition_id": f'head:{pr["number"]}:{pr["head"]["sha"]}'}, "bind_head")
            out, _ = reduce(manifest, payload, "binding")
            gate_status(pr["head"]["sha"], "pending", f"Issue #{item['number']}: awaiting fresh Preview PASS and authorization")
        else: return
        write(item["number"], comment, out, manifest["revision"]); return


def reconcile():
    number = os.getenv("ORCH_ISSUE"); numbers = [int(number)] if number else [x["number"] for x in gh(f"search/issues?q=repo:{REPO}+is:issue+%22gameai-orchestration-index:v1%22&per_page=100").get("items", [])]
    for number in numbers:
        try: _, manifest = find_manifest(number); reconcile_one(number, manifest)
        except Rejected: pass


if __name__ == "__main__":
    {"init": init, "ingest": ingest, "human": human, "bind": bind, "observe": observe, "reconcile": reconcile, "labels": labels}[sys.argv[1]]()
