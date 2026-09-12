#!/usr/bin/env python3
"""Fail-closed reducer for GameAI Hub's repository orchestration contracts."""
from __future__ import annotations
import argparse, datetime, json, pathlib, sys

STATES = {"research","implementation","preview_acceptance","human_merge","production_acceptance","terminal"}
STATUSES = {"pending","running","passed","failed","blocked","done","cancelled","superseded"}
TERMINAL = {"done","cancelled","superseded"}
PRIVILEGED_EDGES = {
 ("preview_acceptance","pending","preview_acceptance","running"),
 ("preview_acceptance","running","preview_acceptance","passed"),
 ("preview_acceptance","running","preview_acceptance","failed"),
 ("preview_acceptance","passed","human_merge","pending"),
 ("human_merge","pending","production_acceptance","pending"),
 ("production_acceptance","pending","production_acceptance","running"),
 ("production_acceptance","running","production_acceptance","passed"),
 ("production_acceptance","running","production_acceptance","failed"),
 ("production_acceptance","passed","terminal","done"),
}
LEGAL = {
 ("research","pending"):{("research","running")}, ("research","running"):{("research","passed"),("research","blocked")},
 ("research","passed"):{("implementation","pending")}, ("implementation","pending"):{("implementation","running"),("implementation","blocked")},
 ("implementation","running"):{("preview_acceptance","pending"),("implementation","blocked")},
 ("preview_acceptance","pending"):{("preview_acceptance","running"),("preview_acceptance","blocked")},
 ("preview_acceptance","running"):{("preview_acceptance","passed"),("preview_acceptance","failed"),("preview_acceptance","blocked")},
 ("preview_acceptance","passed"):{("human_merge","pending")}, ("preview_acceptance","failed"):{("implementation","pending"),("preview_acceptance","blocked")},
 ("human_merge","pending"):{("production_acceptance","pending"),("human_merge","blocked")},
 ("production_acceptance","pending"):{("production_acceptance","running"),("production_acceptance","blocked")},
 ("production_acceptance","running"):{("production_acceptance","passed"),("production_acceptance","failed"),("production_acceptance","blocked")},
 ("production_acceptance","passed"):{("terminal","done")}
}
MACRO = {
 ("research","pending"):"state:needs-research", ("research","running"):"state:research-running", ("research","passed"):"state:research-complete",
 ("implementation","pending"):"state:needs-implementation", ("implementation","running"):"state:implementation-running",
 ("preview_acceptance","pending"):"state:needs-preview-acceptance", ("preview_acceptance","running"):"state:needs-preview-acceptance", ("preview_acceptance","failed"):"state:acceptance-failed",
 ("human_merge","pending"):"state:merge-ready", ("production_acceptance","pending"):"state:needs-production-acceptance", ("production_acceptance","running"):"state:needs-production-acceptance", ("terminal","done"):"state:done"
}

class Rejected(ValueError): pass

def require(condition, message):
    if not condition: raise Rejected(message)

def transition(manifest, event, capability="generic"):
    """Pure shared mutation path. A duplicate transition is an exact no-op."""
    required = {"run_id","canonical_task_version","expected_manifest_revision","generation","from_stage","from_status","to_stage","to_status","transition_id","trigger","repository","issue","pr","branch","sha"}
    require(required <= event.keys(), "malformed transition")
    if event["transition_id"] in manifest["processed_transition_ids"]: return manifest, "duplicate"
    require(manifest["status"] not in TERMINAL, "terminal run ignores late event")
    require(event["run_id"] == manifest["run_id"], "wrong run_id")
    require(event["canonical_task_version"] == manifest["canonical_task_version"], "wrong canonical task version")
    require(event["expected_manifest_revision"] == manifest["revision"], "stale manifest revision")
    require(event["generation"] == manifest["generation"], "stale fencing generation")
    require(event["repository"] == manifest["repository"] and event["issue"] == manifest["issue"], "wrong repository/issue")
    require(event["from_stage"] == manifest["stage"] and event["from_status"] == manifest["status"], "wrong source state")
    require(event["to_stage"] in STATES and event["to_status"] in STATUSES, "invalid destination")
    binding=manifest["binding"]
    for key in ("pr","branch"):
        if binding.get(key) is not None: require(event[key] == binding[key], f"wrong {key}")
    expected_sha = binding.get("merge_sha") if manifest["stage"] == "production_acceptance" else binding.get("head_sha")
    if expected_sha is not None: require(event["sha"] == expected_sha, "wrong SHA")
    require((event["to_stage"],event["to_status"]) in LEGAL.get((manifest["stage"],manifest["status"]),set()), "illegal transition")
    edge=(manifest["stage"],manifest["status"],event["to_stage"],event["to_status"])
    require(capability != "generic" or edge not in PRIVILEGED_EDGES, "privileged transition requires specialized reducer")
    out=json.loads(json.dumps(manifest)); out["stage"],out["status"]=event["to_stage"],event["to_status"]
    out["revision"] += 1; out["processed_transition_ids"].append(event["transition_id"])
    out.setdefault("events",[]).append({"transition_id":event["transition_id"],"trigger":event["trigger"]})
    return out, "applied"

def ingest_acceptance(manifest, result, trusted):
    required={"schema","run_id","canonical_task_version","expected_manifest_revision","generation","stage","claim_id","attempt_id","repository","issue","pr","sha","environment","targets","required_profile","profile_registry_revision","actor","actor_provenance","verdict","findings"}
    allowed=required
    require(isinstance(result,dict) and required <= result.keys() and result.keys() <= allowed and result["schema"]=="gameai-acceptance/v1", "malformed acceptance")
    require(result["environment"] in {"preview","production"}, "invalid acceptance environment")
    require(result["verdict"] in {"PASS","FAIL","BLOCKED"} and isinstance(result["findings"],list), "malformed acceptance")
    if manifest["status"] in TERMINAL: return manifest,"ignored-terminal"
    claim=manifest.get("acceptance_claim") or {}; keys=("attempt_id","environment","targets")
    rid=f'{result["claim_id"]}:{result["attempt_id"]}:{result["sha"]}:{result["verdict"]}'
    if rid in manifest.get("acceptance_result_ids",[]):
     previous=manifest.get("last_acceptance") or {}
     require(result["claim_id"]==previous.get("claim_id") and result["run_id"]==manifest["run_id"] and result["sha"]==previous.get("sha"),"duplicate identity mismatch")
     return manifest,"duplicate"
    require(manifest["status"]=="running" and claim, "acceptance requires active running claim")
    require(result["run_id"]==manifest["run_id"],"wrong run_id"); require(result["canonical_task_version"]==manifest["canonical_task_version"],"wrong canonical task version")
    require(result["expected_manifest_revision"]==manifest["revision"] and result["generation"]==manifest["generation"],"stale acceptance revision/fence")
    require(result["stage"]==manifest["stage"],"stale acceptance stage")
    expected_environment="production" if manifest["stage"]=="production_acceptance" else "preview"
    require(result["environment"]==expected_environment,"wrong acceptance environment")
    require(result["repository"]==manifest["repository"] and result["issue"]==manifest["issue"],"wrong target")
    require(result["pr"]==manifest["binding"]["pr"],"wrong PR")
    sha=manifest["binding"]["merge_sha"] if result["stage"]=="production_acceptance" else manifest["binding"]["head_sha"]
    require(result["sha"]==sha,"wrong SHA")
    require(all(result[k]==claim.get(k) for k in keys) and result.get("claim_id")==claim.get("claim_id"),"stale acceptance claim")
    require(result["required_profile"]==manifest["profile"]["id"] and result["profile_registry_revision"]==manifest["profile"]["registry_revision"],"wrong profile")
    require(result["actor"] in trusted.get("acceptance_actors",[]) and result["actor_provenance"].get("verified_by")=="github-event-sender","unauthorized actor")
    out=json.loads(json.dumps(manifest)); seen=out.setdefault("acceptance_result_ids",[])
    seen.append(rid); out["counters"]["acceptance_attempt"] += 1; out["last_acceptance"] = result
    out["status"]={"PASS":"passed","FAIL":"failed","BLOCKED":"blocked"}[result["verdict"]]; out["blocking_findings"]=[f.get("id") for f in result["findings"] if isinstance(f,dict) and f.get("blocking")]; out["preview_acceptance"]=result["verdict"] if result["stage"]=="preview_acceptance" else out.get("preview_acceptance","UNTESTED")
    if out.get("repair_pending"):
      out["counters"]["repair_revision"]+=1; out.pop("repair_pending")
      if out["counters"]["repair_revision"]>=5 and result["verdict"]=="FAIL": out["status"]="blocked"; out["automatic_redispatch_allowed"]=False; out["blocked"]={"kind":"human","why":"maximum five valid repair cycles reached","resume":f'Issue #{out["issue"]} を再開'}
    out["revision"]+=1
    if result["verdict"]=="PASS" and result["stage"]=="preview_acceptance": out["stage"],out["status"]="human_merge","pending"
    if result["verdict"]=="PASS" and result["stage"]=="production_acceptance": out["stage"],out["status"]="terminal","done"
    return out,"applied"

def readiness(manifest, claim, actor, trusted):
    required={"run_id","canonical_task_version","expected_manifest_revision","generation","repository","issue","pr","sha","environment","deployment_url","deployment_state"}
    require(required <= claim.keys(),"malformed readiness claim"); require(actor in trusted.get("state_actors",[]),"unauthorized readiness actor")
    require(claim["environment"] in {"preview","production"},"invalid readiness environment")
    require(claim["run_id"]==manifest["run_id"] and claim["canonical_task_version"]==manifest["canonical_task_version"],"wrong run/task")
    require(claim["expected_manifest_revision"]==manifest["revision"] and claim["generation"]==manifest["generation"],"stale readiness claim")
    require(claim["repository"]==manifest["repository"] and claim["issue"]==manifest["issue"] and claim["pr"]==manifest["binding"]["pr"],"wrong readiness target")
    expected=manifest["binding"]["merge_sha"] if claim["environment"]=="production" else manifest["binding"]["head_sha"]
    require(claim["sha"]==expected,"readiness SHA mismatch")
    out=json.loads(json.dumps(manifest))
    if claim["deployment_state"]!="READY": out["readiness"]="RETRYABLE WAIT"; out["revision"]+=1; return out
    stage="production_acceptance" if claim["environment"]=="production" else "preview_acceptance"; require(manifest["stage"]==stage and manifest["status"]=="pending","wrong readiness stage")
    attempt=claim.get("attempt_id",f'{claim["environment"]}-{manifest["counters"]["acceptance_attempt"]+1}')
    claim_id=claim.get("claim_id",f'{manifest["run_id"]}:{manifest["generation"]}:{attempt}:{claim["sha"]}')
    out["status"]="running"; out["acceptance_claim"]={"claim_id":claim_id,"attempt_id":attempt,"environment":claim["environment"],"targets":claim.get("targets",[]),"deployment_url":claim["deployment_url"]}; out["revision"]+=1; return out

def approve(manifest, actor, run_id, task_version, pr, sha, trusted, authorized_at=None):
    require(actor in trusted.get("human_approvers",[]),"authorization must be human")
    require(manifest["run_id"]==run_id and manifest["canonical_task_version"]==task_version and manifest["stage"]=="human_merge" and manifest["binding"]["pr"]==pr and manifest["binding"]["head_sha"]==sha,"approval target mismatch")
    accepted=manifest.get("last_acceptance") or {}
    require(accepted.get("stage")=="preview_acceptance" and accepted.get("verdict")=="PASS" and accepted.get("sha")==sha,"current head lacks Preview Acceptance PASS")
    authorized_at=authorized_at or datetime.datetime.now(datetime.timezone.utc).isoformat()
    out=json.loads(json.dumps(manifest)); out["human_authorization"]={"actor":actor,"authorized_at":authorized_at,"run_id":out["run_id"],"canonical_task_version":out["canonical_task_version"],"pr":pr,"head_sha":sha}; out["revision"]+=1; return out

def bind_head(manifest, new_sha, actor="github"):
    out=json.loads(json.dumps(manifest)); old=out["binding"].get("head_sha"); out["binding"]["head_sha"]=new_sha
    if old != new_sha:
     out.pop("human_authorization",None); out["acceptance_claim"]=None; out["generation"]+=1; out["revision"]+=1
     if out["stage"] in {"preview_acceptance","human_merge"}:
      out["stage"],out["status"]="preview_acceptance","pending"; out["preview_acceptance"]="UNTESTED"; out["blocking_findings"]=[]
    claim=out.get("codex_claim")
    if claim and claim.get("base_head_sha") != new_sha: out["stage"]="implementation"; out["status"]="blocked"; out["blocked"]={"kind":"human","why":"branch lineage changed during Codex claim","actor":actor,"resume":"Issue #%s を再開"%out["issue"]}
    return out

def record_repair(manifest, finding_ids):
    require(manifest["stage"]=="preview_acceptance" and manifest["status"]=="failed","repair requires valid Preview FAIL")
    require(finding_ids and all(isinstance(x,str) for x in finding_ids),"stable finding IDs required")
    out=json.loads(json.dumps(manifest)); require(out["counters"]["repair_revision"]<5,"repair limit reached")
    out["stage"]="implementation"; out["status"]="pending"; out["repair_pending"]={"finding_ids":finding_ids}; out["patch_mode"]={"findings":finding_ids,"same_pr":out["binding"]["pr"],"preserve_verified":True,"no_redesign":True}; out["revision"]+=1
    return out

def production_hotfix(parent, child_issue=None):
    require(parent["stage"]=="production_acceptance" and parent["status"]=="failed","hotfix requires Production FAIL")
    count=parent.get("hotfix_count",0)+1; out=json.loads(json.dumps(parent)); out["run_id"]=parent["run_id"]+"-hotfix-"+str(count); out["parent_run_id"]=parent["run_id"]; out["parent_issue"]=parent["issue"]; out["issue"]=child_issue or parent["issue"]; out["failure_evidence"]=parent.get("last_acceptance"); out["stage"]="implementation"; out["status"]="pending"; out["revision"]=0; out["generation"]=1; out["binding"]={"branch":"hotfix/issue-%s-%s"%(parent["issue"],count),"pr":None,"head_sha":None,"merge_sha":None}; out["processed_transition_ids"]=[]; out["acceptance_result_ids"]=[]; out["counters"]={"acceptance_attempt":0,"repair_revision":0,"infrastructure_retry":0,"infrastructure_failure":0}; out["profile"]={"id":"work-critical","registry_revision":parent["profile"]["registry_revision"],"configuration_status":parent["profile"]["configuration_status"]}; out.pop("human_authorization",None); out.pop("acceptance_claim",None); return out

def observe_merge(manifest, pr, head_sha, merge_sha, transition_id):
    """Apply a merged-PR event once, without allowing reruns to resurrect a run."""
    if transition_id in manifest.get("processed_transition_ids",[]): return manifest,"duplicate"
    if manifest["status"] in TERMINAL or manifest["stage"]=="production_acceptance": return manifest,"ignored-late"
    require(manifest["stage"]=="human_merge" and manifest["status"]=="pending","merge observed from invalid state")
    require(manifest["binding"].get("pr")==pr,"merge PR mismatch")
    auth=manifest.get("human_authorization") or {}
    valid=manifest["binding"].get("head_sha")==head_sha and auth.get("run_id")==manifest["run_id"] and auth.get("canonical_task_version")==manifest["canonical_task_version"] and auth.get("pr")==pr and auth.get("head_sha")==head_sha
    out=json.loads(json.dumps(manifest)); out["processed_transition_ids"].append(transition_id)
    out.setdefault("events",[]).append({"transition_id":transition_id,"trigger":"pull_request.closed"})
    if not valid:
     out["status"]="blocked"; out["blocked"]={"kind":"human","why":"merge observed without current exact-SHA authorization","what":"GitHub merged a SHA that the orchestration gate had not authorized","need":"Review repository protection and the merged change","resume":f'Issue #{out["issue"]} を再開'}
    else:
     out["binding"]["merge_sha"]=merge_sha; out["stage"],out["status"]="production_acceptance","pending"; out["profile"]={"id":"work-critical","registry_revision":out["profile"]["registry_revision"],"configuration_status":out["profile"]["configuration_status"]}
    out["revision"]+=1
    return out,"applied"

def observe_ci(manifest, pr, sha, conclusion, transition_id, check_name="quality", required_checks=("quality",)):
    if transition_id in manifest.get("processed_transition_ids",[]): return manifest,"duplicate"
    if manifest["status"] in TERMINAL or manifest["binding"].get("pr")!=pr or manifest["binding"].get("head_sha")!=sha: return manifest,"ignored-late"
    out=json.loads(json.dumps(manifest)); ci=out.get("ci") if isinstance(out.get("ci"),dict) and out["ci"].get("sha")==sha else {"sha":sha,"checks":{}}; ci.setdefault("checks",{})[check_name]=conclusion; ci["conclusion"]="success" if all(ci["checks"].get(x)=="success" for x in required_checks) else "pending"; out["ci"]=ci; out["processed_transition_ids"].append(transition_id); out.setdefault("events",[]).append({"transition_id":transition_id,"trigger":"workflow_run.completed"})
    if ci["conclusion"]=="success" and out["stage"]=="implementation" and out["status"]=="running": out["stage"],out["status"]="preview_acceptance","pending"
    out["revision"]+=1; return out,"applied"

def projection(manifest, labels): return sorted((set(labels)-{x for x in labels if x.startswith("state:")}) | ({MACRO[(manifest["stage"],manifest["status"])]} if (manifest["stage"],manifest["status"]) in MACRO else set()))

def summary(m):
    block=m.get("blocked"); actions={("human_merge","pending"):"Review the merge decision and authorize the current SHA"}; action=block.get("resume",f'Issue #{m["issue"]} を再開') if block else actions.get((m["stage"],m["status"]),"None")
    ci=m.get("ci","UNKNOWN"); ci_text=ci.get("conclusion","UNKNOWN")+" @ "+ci.get("sha","") if isinstance(ci,dict) else ci
    c=m.get("counters",{})
    return "\n".join(["<!-- gameai-operator-status:v1 -->",f'Issue: #{m["issue"]}',f'Status: {m["stage"]} / {m["status"]}',f'Current PR: {m["binding"].get("pr") or "None"}',f'Current head SHA: {m["binding"].get("head_sha") or "None"}',f'CI: {ci_text}',f'Preview Acceptance: {m.get("preview_acceptance","UNTESTED")}',f'Repair revision: {c.get("repair_revision",0)}/5',f'Blocking findings: {", ".join(m.get("blocking_findings",[])) or "None"}',f'Work profile: {m["profile"]["id"]} @ revision {m["profile"]["registry_revision"]} ({m["profile"]["configuration_status"]})',f'Bridge status: {json.dumps(m.get("bridge_status",{}),sort_keys=True)}',f'Residual UNTESTED: {", ".join(m.get("untested",[])) or "None"}',f'Recommended human action: {action}'] + ([] if not block else [f'Why blocked: {block.get("why","unknown")}',f'What happened: {block.get("what","See evidence")}',f'What you need to do: {block.get("need","Resolve the blocker")}',f'What happens after that: orchestration revalidates current manifest and SHA',f'Resume command: {action}']))

def main():
    p=argparse.ArgumentParser(); p.add_argument("command",choices=["transition","summary","project"]); p.add_argument("manifest"); p.add_argument("--event"); p.add_argument("--labels",default="")
    a=p.parse_args(); m=json.load(open(a.manifest))
    if a.command=="summary": print(summary(m)); return
    if a.command=="project": print(json.dumps(projection(m,a.labels.split(",") if a.labels else []))); return
    try: out,status=transition(m,json.load(open(a.event))); print(json.dumps(out,indent=2)); print(status,file=sys.stderr)
    except (Rejected,KeyError,TypeError,json.JSONDecodeError) as e: print(f"rejected: {e}",file=sys.stderr); sys.exit(2)
if __name__=="__main__": main()
