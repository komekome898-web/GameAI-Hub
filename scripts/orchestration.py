#!/usr/bin/env python3
"""Deterministic, fail-closed reducer for GameAI Hub orchestration."""
from __future__ import annotations

import argparse
import copy
import datetime as dt
import json
import pathlib
import re
import sys
import uuid

STATES = {"research", "implementation", "preview_acceptance", "human_merge", "production_acceptance", "terminal"}
STATUSES = {"pending", "running", "passed", "failed", "blocked", "done", "cancelled", "superseded"}
TERMINAL = {"done", "cancelled", "superseded"}
SHA = re.compile(r"^[0-9a-f]{40}$")
GENERIC_LEGAL = {
    ("research", "pending"): {("research", "running")},
    ("research", "running"): {("research", "passed"), ("research", "blocked")},
    ("research", "passed"): {("implementation", "pending")},
    ("implementation", "pending"): {("implementation", "running"), ("implementation", "blocked")},
    ("implementation", "running"): {("preview_acceptance", "pending"), ("implementation", "blocked")},
    ("preview_acceptance", "pending"): {("preview_acceptance", "blocked")},
    ("human_merge", "pending"): {("human_merge", "blocked")},
    ("production_acceptance", "pending"): {("production_acceptance", "blocked")},
}
MACRO = {
    ("research", "pending"): "state:needs-research", ("research", "running"): "state:research-running",
    ("research", "passed"): "state:research-complete", ("implementation", "pending"): "state:needs-implementation",
    ("implementation", "running"): "state:implementation-running", ("preview_acceptance", "pending"): "state:needs-preview-acceptance",
    ("preview_acceptance", "running"): "state:needs-preview-acceptance", ("preview_acceptance", "failed"): "state:acceptance-failed",
    ("human_merge", "pending"): "state:merge-ready", ("production_acceptance", "pending"): "state:needs-production-acceptance",
    ("production_acceptance", "running"): "state:needs-production-acceptance", ("terminal", "done"): "state:done",
}


class Rejected(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise Rejected(message)


def clone(value):
    return copy.deepcopy(value)


def _base_checks(manifest, event, *, source=True):
    required = {"run_id", "canonical_task_version", "expected_manifest_revision", "generation", "transition_id", "repository", "issue"}
    require(isinstance(event, dict) and required <= event.keys(), "malformed operation")
    if event["transition_id"] in manifest.get("processed_transition_ids", []):
        return "duplicate"
    require(manifest["status"] not in TERMINAL, "terminal run ignores late event")
    require(event["run_id"] == manifest["run_id"], "wrong run_id")
    require(event["canonical_task_version"] == manifest["canonical_task_version"], "wrong canonical task version")
    require(event["expected_manifest_revision"] == manifest["revision"], "stale manifest revision")
    require(event["generation"] == manifest["generation"], "stale fencing generation")
    require(event["repository"] == manifest["repository"] and event["issue"] == manifest["issue"], "wrong repository/issue")
    if source:
        require(event.get("from_stage") == manifest["stage"] and event.get("from_status") == manifest["status"], "wrong source state")
    return None


def _commit(manifest, event, operation, mutate):
    duplicate = _base_checks(manifest, event, source=operation not in {"bind_pr", "bind_head"})
    if duplicate:
        return manifest, duplicate
    out = clone(manifest)
    mutate(out)
    out["revision"] += 1
    out.setdefault("processed_transition_ids", []).append(event["transition_id"])
    out.setdefault("events", []).append({"transition_id": event["transition_id"], "operation": operation, "trigger": event.get("trigger", {})})
    return out, "applied"


def reduce(manifest, event, capability="generic"):
    """The sole authoritative mutation engine; adapters supply operation/capability."""
    operation = event.get("operation", "transition")

    def mutate(out):
        if operation == "transition":
            require(capability == "generic", "wrong transition capability")
            destination = (event.get("to_stage"), event.get("to_status"))
            require(destination in GENERIC_LEGAL.get((out["stage"], out["status"]), set()), "privileged or illegal generic transition")
            out["stage"], out["status"] = destination
            if destination[1] == "blocked":
                out["blocked"] = normalized_block(event.get("blocked"), out["issue"])
        elif operation == "bind_pr":
            require(capability == "binding", "binding capability required")
            require(out["stage"] in {"research", "implementation"}, "initial binding closed")
            require(isinstance(event.get("pr"), int) and event["pr"] > 0 and event.get("branch") and SHA.fullmatch(event.get("sha", "")), "invalid PR binding")
            binding = out["binding"]
            if binding.get("pr") is not None:
                require(event.get("recovery") is True, "PR already bound; explicit recovery required")
                out["generation"] += 1
            binding.update(pr=event["pr"], branch=event["branch"], head_sha=event["sha"], merge_sha=None)
            out.pop("human_authorization", None); out["acceptance_claim"] = None
        elif operation == "bind_head":
            require(capability == "binding" and SHA.fullmatch(event.get("sha", "")), "invalid head binding")
            require(out["binding"].get("pr") == event.get("pr") and out["binding"].get("branch") == event.get("branch"), "wrong PR/branch")
            old = out["binding"].get("head_sha")
            require(old != event["sha"], "head already current")
            out["binding"]["head_sha"] = event["sha"]
            out["generation"] += 1
            out.pop("human_authorization", None); out["acceptance_claim"] = None
            out["preview_acceptance"] = "UNTESTED"; out.pop("last_acceptance", None); out["blocking_findings"] = []
            if out["stage"] in {"preview_acceptance", "human_merge"}:
                out["stage"], out["status"] = "preview_acceptance", "pending"
            claim = out.get("codex_outbox")
            if claim and claim.get("base_head_sha") != event["sha"] and claim.get("result_head_sha") != event["sha"]:
                out["stage"], out["status"] = "implementation", "blocked"
                out["blocked"] = normalized_block({"kind": "human", "why": "branch lineage changed during Codex claim", "what": "A different head was observed while a worker held the claim.", "need": "Review the branch and explicitly resume or supersede the claim."}, out["issue"])
        elif operation == "readiness":
            require(capability == "deployment", "deployment observer capability required")
            environment = event.get("environment")
            require(environment in {"preview", "production"}, "invalid environment")
            expected_stage = "preview_acceptance" if environment == "preview" else "production_acceptance"
            require((out["stage"], out["status"]) == (expected_stage, "pending"), "wrong readiness stage")
            expected_sha = out["binding"]["head_sha" if environment == "preview" else "merge_sha"]
            require(event.get("sha") == expected_sha, "readiness SHA mismatch")
            require(event.get("deployment_state") in {"READY", "WAIT", "FAILED"}, "invalid deployment state")
            if event["deployment_state"] != "READY" or not event.get("verified"):
                out["readiness"] = "RETRYABLE WAIT"
                out["status"] = "pending"
                return
            require(event.get("provider") and event.get("deployment_id") and event.get("evidence_source"), "deployment identity required")
            require(event.get("deployed_sha") == expected_sha, "deployed SHA mismatch")
            allowed = out.get("deployment_origins", {}).get(environment, [])
            require(any(event.get("deployment_url", "").startswith(origin) for origin in allowed), "deployment origin not allowed")
            out["status"] = "running"; out["readiness"] = "READY"
            out["acceptance_claim"] = {"claim_id": event["claim_id"], "attempt_id": event["attempt_id"], "environment": environment, "targets": event.get("targets", []), "deployment_url": event["deployment_url"], "provider": event["provider"], "deployment_id": event["deployment_id"], "deployed_sha": event["deployed_sha"], "evidence_source": event["evidence_source"]}
        elif operation == "acceptance":
            require(capability == "acceptance", "acceptance capability required")
            result = event["result"]; _validate_acceptance(out, result)
            claim = out.get("acceptance_claim") or {}
            rid = result["result_id"]
            require(rid not in out.get("acceptance_result_ids", []), "duplicate acceptance result")
            require(result["claim_id"] == claim.get("claim_id") and result["attempt_id"] == claim.get("attempt_id"), "stale acceptance claim")
            require(result["environment"] == claim.get("environment") and result["targets"] == claim.get("targets"), "stale acceptance claim")
            out.setdefault("acceptance_result_ids", []).append(rid); out["counters"]["acceptance_attempt"] += 1
            out["last_acceptance"] = result; out["blocking_findings"] = [f["id"] for f in result["findings"] if f.get("blocking")]
            if result["verdict"] == "PASS":
                if out["stage"] == "preview_acceptance":
                    out["preview_acceptance"] = "PASS"; out["stage"], out["status"] = "human_merge", "pending"
                else:
                    out["stage"], out["status"] = "terminal", "done"
            elif result["verdict"] == "BLOCKED":
                out["status"] = "blocked"; out["blocked"] = normalized_block(result.get("blocked"), out["issue"])
            elif not out["blocking_findings"]:
                out["status"] = "blocked"; out["blocked"] = normalized_block({"kind": "technical", "why": "Acceptance FAIL omitted stable blocking finding IDs", "what": "The result was preserved but cannot safely drive repair.", "need": "Correct and resend the Acceptance result with stable blocking IDs."}, out["issue"])
            elif out["stage"] == "preview_acceptance":
                require(out["counters"]["repair_revision"] < out.get("max_repair_revision", 5), "repair limit reached")
                out["preview_acceptance"] = "FAIL"; out["stage"], out["status"] = "implementation", "pending"
                out["counters"]["repair_revision"] += 1
                out["patch_mode"] = {"findings": out["blocking_findings"], "same_pr": out["binding"]["pr"], "preserve_verified": True, "no_redesign": True}
                out["codex_outbox"] = new_codex_claim(out)
            else:
                out["status"] = "failed"
        elif operation == "approve":
            require(capability == "human", "human authorization capability required")
            require((out["stage"], out["status"]) == ("human_merge", "pending"), "approval target mismatch")
            accepted = out.get("last_acceptance") or {}
            require(out.get("preview_acceptance") == "PASS" and accepted.get("verdict") == "PASS" and accepted.get("sha") == out["binding"].get("head_sha"), "fresh Preview PASS required")
            out["human_authorization"] = {"actor": event["actor"], "authorized_at": event["authorized_at"], "run_id": out["run_id"], "canonical_task_version": out["canonical_task_version"], "pr": out["binding"]["pr"], "head_sha": out["binding"]["head_sha"]}
        elif operation == "merge_observed":
            require(capability == "merge_observer", "merge observer capability required")
            require((out["stage"], out["status"]) == ("human_merge", "pending"), "merge observation source mismatch")
            auth = out.get("human_authorization") or {}
            require(auth.get("head_sha") == event.get("sha") and auth.get("pr") == out["binding"].get("pr"), "merge lacks current exact-SHA authorization")
            require(SHA.fullmatch(event.get("merge_sha", "")), "invalid merge SHA")
            out["binding"]["merge_sha"] = event["merge_sha"]; out["stage"], out["status"] = "production_acceptance", "pending"
            out["profile"]["id"] = "work-critical"; out["acceptance_claim"] = None
        elif operation in {"cancel", "supersede", "migrate_task_version"}:
            require(capability == "human", "human lifecycle capability required")
            out["generation"] += 1; out["acceptance_claim"] = None; out.pop("human_authorization", None); out.pop("codex_claim", None); out.pop("codex_outbox", None)
            if operation == "migrate_task_version":
                require(isinstance(event.get("new_task_version"), int) and event["new_task_version"] > out["canonical_task_version"], "newer task version required")
                out.setdefault("lineage", {})["previous_task_version"] = out["canonical_task_version"]
                out["canonical_task_version"] = event["new_task_version"]; out["canonical_task_digest"] = event["new_task_digest"]
                out["task_comment_id"] = event["new_task_comment_id"]
                out["stage"], out["status"] = "research", "pending"
            else:
                out["stage"], out["status"] = "terminal", "cancelled" if operation == "cancel" else "superseded"
                if operation == "supersede":
                    require(event.get("new_run_id") and isinstance(event.get("new_issue"), int), "verified successor required")
                    out.setdefault("lineage", {}).update(superseded_by=event["new_run_id"], successor_issue=event["new_issue"])
        elif operation == "ci_observed":
            require(capability == "ci_observer", "CI observer capability required")
            require(event.get("sha") == out["binding"].get("head_sha"), "CI SHA mismatch")
            ci = out.get("ci") if isinstance(out.get("ci"), dict) and out["ci"].get("sha") == event["sha"] else {"sha": event["sha"], "checks": {}}
            ci.setdefault("checks", {})[event["check_id"]] = {"name": event["check_name"], "conclusion": event["conclusion"], "source": event["source"]}
            required = out.get("required_ci_checks", ["quality", "beginner-acceptance"]); observed = {x["name"]: x["conclusion"] for x in ci["checks"].values()}
            ci["conclusion"] = "failure" if any(observed.get(name) in {"failure", "cancelled", "timed_out"} for name in required) else "success" if required and all(observed.get(name) == "success" for name in required) else "pending"
            ci["missing_required"] = [name for name in required if name not in observed]
            out["ci"] = ci
        elif operation == "link_hotfix":
            require(capability == "hotfix", "hotfix capability required")
            require((out["stage"], out["status"]) == ("production_acceptance", "failed"), "hotfix parent state mismatch")
            count = out.get("lineage", {}).get("hotfix_count", 0) + 1
            require(count <= event["max_hotfixes"], "hotfix lineage limit reached")
            out["lineage"] = {**out.get("lineage", {}), "root_run_id": out.get("lineage", {}).get("root_run_id", out["run_id"]), "hotfix_count": count, "max_hotfixes": event["max_hotfixes"], "active_child_issue": event["child_issue"], "active_child_run_id": event["child_run_id"]}
        elif operation in {"codex_dispatch", "codex_ack", "codex_result"}:
            require(capability == "codex_bridge", "Codex bridge capability required")
            claim = out.get("codex_outbox") or {}
            require(event.get("claim_id") == claim.get("claim_id") and event.get("fencing_token") == claim.get("fencing_token") and event["generation"] == claim.get("generation"), "stale Codex claim/fence")
            require(claim.get("base_head_sha") == out["binding"].get("head_sha"), "Codex base head changed")
            if operation == "codex_dispatch":
                require(claim.get("state") == "PENDING_DISPATCH", "Codex claim not pending"); claim["state"] = "DISPATCH_REQUESTED"; claim["dispatch_id"] = event["dispatch_id"]
            elif operation == "codex_ack":
                require(claim.get("state") == "DISPATCH_REQUESTED" and event.get("dispatch_id") == claim.get("dispatch_id"), "Codex dispatch correlation mismatch"); claim["state"] = "ACKED"; claim["external_task_id"] = event["external_task_id"]; out["status"] = "running"
            else:
                require(claim.get("state") == "ACKED" and event.get("external_task_id") == claim.get("external_task_id"), "Codex task correlation mismatch")
                require(SHA.fullmatch(event.get("result_head_sha", "")) and event["result_head_sha"] != claim["base_head_sha"], "Codex result head invalid")
                claim["state"] = "RESULT_RECORDED"; claim["result_head_sha"] = event["result_head_sha"]
        elif operation == "hotfix_escalate":
            require(capability == "hotfix" and (out["stage"], out["status"]) == ("production_acceptance", "failed"), "hotfix escalation mismatch")
            out["status"] = "blocked"; out["blocked"] = normalized_block({"kind": "human", "why": "Production hotfix lineage limit reached", "what": "All automatic child-hotfix generations were used.", "need": "Review Production failure evidence and authorize a new plan or cancellation.", "resume": f'Run Orchestration human control for Issue #{out["issue"]}.'}, out["issue"])
        elif operation == "adopt_predecessor":
            require(capability == "human" and out["status"] not in TERMINAL, "successor cannot adopt predecessor")
            require(event.get("predecessor_run_id") and isinstance(event.get("predecessor_issue"), int), "predecessor identity required")
            out.setdefault("lineage", {}).update(predecessor_run_id=event["predecessor_run_id"], predecessor_issue=event["predecessor_issue"])
        else:
            raise Rejected("unsupported operation")

    return _commit(manifest, event, operation, mutate)


def transition(manifest, event):
    event = {**event, "operation": "transition"}
    return reduce(manifest, event, "generic")


def _validate_acceptance(manifest, result):
    validate_json_schema(result, json.loads(pathlib.Path(".github/orchestration/schemas/acceptance.schema.json").read_text()))
    keys = {"schema", "result_id", "claim_id", "run_id", "canonical_task_version", "expected_manifest_revision", "generation", "stage", "attempt_id", "repository", "issue", "pr", "sha", "environment", "targets", "required_profile", "profile_registry_revision", "actor", "actor_provenance", "verdict", "findings"}
    require(isinstance(result, dict) and set(result) <= keys | {"blocked"} and keys <= set(result), "malformed acceptance")
    require(result["schema"] == "gameai-acceptance/v1" and result["verdict"] in {"PASS", "FAIL", "BLOCKED"}, "malformed acceptance")
    expected_environment = "preview" if manifest["stage"] == "preview_acceptance" else "production"
    require(manifest["status"] == "running" and result["stage"] == manifest["stage"] and result["environment"] == expected_environment, "inactive or wrong acceptance stage")
    require(result["run_id"] == manifest["run_id"] and result["canonical_task_version"] == manifest["canonical_task_version"], "wrong run/task")
    require(result["expected_manifest_revision"] == manifest["revision"] and result["generation"] == manifest["generation"], "stale acceptance revision/fence")
    require(result["repository"] == manifest["repository"] and result["issue"] == manifest["issue"] and result["pr"] == manifest["binding"]["pr"], "wrong acceptance target")
    expected_sha = manifest["binding"]["head_sha" if result["environment"] == "preview" else "merge_sha"]
    require(result["sha"] == expected_sha, "wrong SHA")
    require(result["required_profile"] == manifest["profile"]["id"] and result["profile_registry_revision"] == manifest["profile"]["registry_revision"], "wrong profile")
    require(isinstance(result["findings"], list) and all(isinstance(x, dict) and isinstance(x.get("id"), str) and isinstance(x.get("blocking", False), bool) for x in result["findings"]), "malformed findings")
    require(isinstance(result["actor_provenance"], dict) and result["actor_provenance"].get("verified_by") == "github-event-envelope", "unverified provenance")


def validate_json_schema(value, schema, path="$"):
    """Small fail-closed validator for the JSON-Schema keywords used by our contract."""
    expected = schema.get("type")
    types = expected if isinstance(expected, list) else [expected] if expected else []
    checks = {"object": lambda x: isinstance(x, dict), "array": lambda x: isinstance(x, list), "string": lambda x: isinstance(x, str), "integer": lambda x: isinstance(x, int) and not isinstance(x, bool), "boolean": lambda x: isinstance(x, bool), "null": lambda x: x is None}
    if types: require(any(checks[t](value) for t in types), f"schema type violation at {path}")
    if "const" in schema: require(value == schema["const"], f"schema const violation at {path}")
    if "enum" in schema: require(value in schema["enum"], f"schema enum violation at {path}")
    if isinstance(value, str):
        require(len(value) >= schema.get("minLength", 0) and len(value) <= schema.get("maxLength", len(value)), f"schema length violation at {path}")
        if schema.get("pattern"): require(re.search(schema["pattern"], value) is not None, f"schema pattern violation at {path}")
    if isinstance(value, int) and not isinstance(value, bool): require(value >= schema.get("minimum", value), f"schema minimum violation at {path}")
    if isinstance(value, list):
        require(len(value) <= schema.get("maxItems", len(value)), f"schema item limit at {path}")
        if schema.get("items"):
            for index, item in enumerate(value): validate_json_schema(item, schema["items"], f"{path}[{index}]")
    if isinstance(value, dict):
        require(set(schema.get("required", [])) <= set(value), f"schema required property missing at {path}")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False: require(set(value) <= set(properties), f"schema additional property at {path}")
        for key, item in value.items():
            if key in properties: validate_json_schema(item, properties[key], f"{path}.{key}")


def acceptance_event(manifest, result, transition_id):
    return {"operation": "acceptance", "run_id": manifest["run_id"], "canonical_task_version": manifest["canonical_task_version"], "expected_manifest_revision": manifest["revision"], "generation": manifest["generation"], "from_stage": manifest["stage"], "from_status": manifest["status"], "transition_id": transition_id, "repository": manifest["repository"], "issue": manifest["issue"], "result": result}


def normalized_block(value, issue):
    value = value if isinstance(value, dict) else {}
    return {"kind": value.get("kind", "technical"), "why": value.get("why", "Orchestration cannot safely continue."), "what": value.get("what", "A required control-plane check did not complete."), "need": value.get("need", "Review the evidence and resolve the stated condition."), "next": value.get("next", "The current manifest, generation, and SHA will be revalidated."), "resume": value.get("resume", f"Run the Orchestration resume workflow for Issue #{issue}.")}


def new_codex_claim(manifest):
    token = uuid.uuid4().hex
    return {"claim_id": f"codex-{token}", "generation": manifest["generation"], "fencing_token": token, "base_head_sha": manifest["binding"].get("head_sha"), "state": "PENDING_DISPATCH", "idempotency_key": f'{manifest["run_id"]}:{manifest["generation"]}:{manifest["counters"]["repair_revision"]}'}


def create_hotfix(parent, child_issue, max_hotfixes=2):
    require((parent["stage"], parent["status"]) == ("production_acceptance", "failed"), "hotfix requires Production FAIL")
    lineage = clone(parent.get("lineage", {})); count = lineage.get("hotfix_count", parent.get("hotfix_count", 0)) + 1
    require(count <= max_hotfixes, "hotfix lineage limit reached; human escalation required")
    root = lineage.get("root_run_id", parent["run_id"])
    child = clone(parent); child.update(run_id=f"{root}-hotfix-{count}", parent_run_id=parent["run_id"], issue=child_issue, stage="implementation", status="pending", revision=0, generation=1)
    child["lineage"] = {"root_run_id": root, "parent_run_id": parent["run_id"], "hotfix_count": count, "max_hotfixes": max_hotfixes}
    child["binding"] = {"branch": f"hotfix/issue-{child_issue}-{count}", "pr": None, "head_sha": None, "merge_sha": None}
    child["processed_transition_ids"] = []; child["acceptance_result_ids"] = []; child["acceptance_claim"] = None; child.pop("human_authorization", None)
    child["counters"] = {"acceptance_attempt": 0, "repair_revision": 0, "infrastructure_retry": 0, "infrastructure_failure": 0}
    child["profile"]["id"] = "work-critical"
    return child


def production_hotfix(parent):
    """Compatibility helper; adapters must place this in a distinct child Issue."""
    return create_hotfix(parent, parent["issue"])


def projection(manifest, labels):
    return sorted((set(labels) - {x for x in labels if x.startswith("state:")}) | ({MACRO[(manifest["stage"], manifest["status"])]} if (manifest["stage"], manifest["status"]) in MACRO else set()))


def next_action(m):
    if m.get("blocked"): return m["blocked"]["resume"]
    if (m["stage"], m["status"]) == ("human_merge", "pending"): return "Review the merge decision below and authorize the current SHA."
    if m["stage"] == "implementation" and m["status"] == "pending" and m.get("codex_outbox", {}).get("state") == "PENDING_DISPATCH": return "Codex bridge is unverified; use the documented manual same-PR repair fallback."
    return "None — automation is active or awaiting verified external evidence."


def summary(m):
    block = m.get("blocked"); ci = m.get("ci", "UNKNOWN")
    if isinstance(ci, dict): ci = f'{ci.get("conclusion", "UNKNOWN")} for {ci.get("sha", "")}'
    accepted = m.get("last_acceptance") or {}; fresh = accepted.get("verdict") == "PASS" and accepted.get("sha") == m["binding"].get("head_sha")
    lines = ["<!-- gameai-operator-status:v1 -->", "## Orchestration status", f'Issue: #{m["issue"]}', f'Status: {m["stage"]} / {m["status"]}', f'Current PR: {m["binding"].get("pr") or "None"}', f'Current head SHA: {m["binding"].get("head_sha") or "None"}', f'CI: {ci}', f'Preview Acceptance: {m.get("preview_acceptance", "UNTESTED")} ({"fresh for current SHA" if fresh else "not proven for current SHA"})', f'Blocking findings: {", ".join(m.get("blocking_findings", [])) or "None"}', f'Repair revision: {m.get("counters", {}).get("repair_revision", 0)}/{m.get("max_repair_revision", 5)}', f'Work profile: {m["profile"]["id"]} @ revision {m["profile"]["registry_revision"]} ({m["profile"]["configuration_status"]})', f'Bridge health: {json.dumps(m.get("bridge_status", {}), sort_keys=True)}', f'Residual UNTESTED: {", ".join(m.get("untested", [])) or "None"}', f'Next human action: {next_action(m)}']
    if block:
        lines += [f'Why blocked: {block["why"]}', f'What happened: {block["what"]}', f'What you need to do: {block["need"]}', f'What happens after that: {block["next"]}', f'Resume command: {block["resume"]}']
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(); parser.add_argument("command", choices=["transition", "summary", "project"]); parser.add_argument("manifest"); parser.add_argument("--event"); parser.add_argument("--labels", default="")
    args = parser.parse_args(); manifest = json.load(open(args.manifest))
    if args.command == "summary": print(summary(manifest)); return
    if args.command == "project": print(json.dumps(projection(manifest, args.labels.split(",") if args.labels else []))); return
    try:
        out, status = transition(manifest, json.load(open(args.event))); print(json.dumps(out, indent=2)); print(status, file=sys.stderr)
    except (Rejected, KeyError, TypeError, json.JSONDecodeError) as exc:
        print(f"rejected: {exc}", file=sys.stderr); sys.exit(2)


if __name__ == "__main__":
    main()
