#!/usr/bin/env python3
"""GitHub adapter. It never derives correctness from labels or ordinary prose."""
import hashlib, json, os, subprocess, sys, uuid
from orchestration import transition, ingest_acceptance, approve, bind_head, readiness, record_repair, production_hotfix, observe_merge, observe_ci, projection, summary, Rejected

REPO=os.getenv("GITHUB_REPOSITORY","komekome898-web/GameAI-Hub")
MANIFEST="<!-- gameai-run-manifest:v1 -->"
TASK="<!-- gameai-canonical-task:v1 -->"

def gh(*args, input=None):
 p=subprocess.run(["gh","api",*args],input=None if input is None else json.dumps(input),text=True,capture_output=True)
 if p.returncode: raise RuntimeError(p.stderr.strip())
 return json.loads(p.stdout) if p.stdout.strip() else None
def issue(n): return gh(f"repos/{REPO}/issues/{n}")
def comments(n): return gh(f"repos/{REPO}/issues/{n}/comments","--paginate")
def block(marker,data): return marker+"\n```json\n"+json.dumps(data,sort_keys=True,indent=2)+"\n```"
def manifest_body(data): return summary(data)+"\n\n<details><summary>Machine-readable Run Manifest</summary>\n\n"+block(MANIFEST,data)+"\n</details>"
def parse(body,marker):
 if body.count(marker)!=1: raise Rejected("missing or ambiguous marker")
 tail=body.split(marker,1)[1]; start=tail.find("```json\n"); end=tail.find("\n```",start+8)
 if start<0 or end<0: raise Rejected("malformed marker")
 return json.loads(tail[start+8:end])
def find_manifest(n):
 found=[c for c in comments(n) if MANIFEST in c.get("body","")]
 if len(found)!=1: raise Rejected("exactly one Run Manifest comment required")
 return found[0],parse(found[0]["body"],MANIFEST)
def verify_task(n,m):
 found=[c for c in comments(n) if TASK in c.get("body","")]
 if len(found)!=1: raise Rejected("exactly one Canonical Task comment required")
 task=parse(found[0]["body"],TASK); digest=hashlib.sha256(json.dumps(task,sort_keys=True,separators=(",",":")).encode()).hexdigest()
 if task.get("version")!=m["canonical_task_version"] or digest!=m.get("canonical_task_digest"): raise Rejected("canonical task changed; superseding run or authorized migration required")
 return task
def patch_comment(cid,body): gh(f"repos/{REPO}/issues/comments/{cid}","--method","PATCH","--input","-",input={"body":body})
def post(n,body): return gh(f"repos/{REPO}/issues/{n}/comments","--method","POST","--input","-",input={"body":body})
def gate_status(sha,state,description):
 gh(f"repos/{REPO}/statuses/{sha}","--method","POST","--input","-",input={"state":state,"context":"orchestration/exact-head-gate","description":description[:140]})
def write(n,c,m,expected_revision):
 current,latest=find_manifest(n)
 if current["id"]!=c["id"] or latest["revision"]!=expected_revision: raise Rejected("manifest changed before write; re-read and re-evaluate")
 patch_comment(c["id"],manifest_body(m)); reconcile_one(n,m)
def reconcile_one(n,m):
 i=issue(n); names=[x["name"] for x in i.get("labels",[])]; desired=projection(m,names)
 gh(f"repos/{REPO}/issues/{n}/labels","--method","PUT","--input","-",input={"labels":desired})
def labels():
 cfg=json.load(open(".github/orchestration/labels.json"))
 existing={x["name"] for x in gh(f"repos/{REPO}/labels?per_page=100","--paginate")}
 for name,color in cfg.items():
  endpoint=f"repos/{REPO}/labels/{name}" if name in existing else f"repos/{REPO}/labels"
  method="PATCH" if name in existing else "POST"; payload={"color":color} if name in existing else {"name":name,"color":color}
  gh(endpoint,"--method",method,"--input","-",input=payload)
def init():
 n=int(os.environ["ORCH_ISSUE"]); version=int(os.environ["ORCH_TASK_VERSION"]); i=issue(n)
 if any(MANIFEST in c.get("body","") for c in comments(n)): return
 critical=os.getenv("ORCH_CRITICAL","false").lower()=="true"; profile="work-critical" if critical else "work-standard"
 task={"schema":"gameai-task/v1","task_id":f"GAI-{n}","version":version,"user_goal":i["body"] or i["title"],"invariants":["independent_acceptance_required","no_automatic_merge","preview_evidence_cannot_substitute_production","untested_cannot_become_pass"],"scope":{"include":[],"exclude":[]},"acceptance":{},"permissions":{"merge":False,"production_mutation":False},"orchestration_policy":{"max_repair_revision":5}}
 existing=[c for c in comments(n) if TASK in c.get("body","")]
 if len(existing)>1: raise Rejected("ambiguous Canonical Task bootstrap")
 if existing:
  task=parse(existing[0]["body"],TASK)
  if task.get("version")!=version: raise Rejected("existing Canonical Task version differs; explicit supersession is required")
 else: post(n,block(TASK,task))
 digest=hashlib.sha256(json.dumps(task,sort_keys=True,separators=(",",":")).encode()).hexdigest()
 m={"schema":"gameai-run/v1","run_id":f"GAI-{n}-v{version}-{uuid.uuid4().hex[:8]}","canonical_task_version":version,"canonical_task_digest":digest,"revision":0,"generation":1,"stage":"research","status":"pending","repository":REPO,"issue":n,"binding":{"branch":None,"pr":None,"head_sha":None,"merge_sha":None},"profile":{"id":profile,"registry_revision":1,"configuration_status":"UNCONFIGURED"},"counters":{"acceptance_attempt":0,"repair_revision":0,"infrastructure_retry":0,"infrastructure_failure":0},"processed_transition_ids":[],"bridge_status":{"codex":"NEEDS EXPERIMENT","work":"UNCONFIGURED"},"untested":["Codex bridge","Work trigger/writeback/model attestation","Preview readiness","Production readiness"]}
 c=post(n,manifest_body(m)); reconcile_one(n,m)

def create_hotfix_issue(parent,task):
 count=parent.get("hotfix_count",0)+1
 title=f'[Hotfix] Issue #{parent["issue"]} production failure {count}'
 correlation=f'<!-- gameai-hotfix-parent:{parent["run_id"]}:{count} -->'
 matches=gh(f'search/issues?q=repo:{REPO}+is:issue+"{correlation}"').get("items",[])
 if matches:
  created=matches[0]
 else: created=gh(f"repos/{REPO}/issues","--method","POST","--input","-",input={"title":title,"body":correlation+f'\nLinked Production hotfix for #{parent["issue"]}. Parent run: `{parent["run_id"]}`.'})
 child=production_hotfix(parent,created["number"])
 existing=comments(created["number"])
 if not any(TASK in x.get("body","") for x in existing): post(created["number"],block(TASK,task))
 if not any(MANIFEST in x.get("body","") for x in existing): post(created["number"],manifest_body(child))
 find_manifest(created["number"]); reconcile_one(created["number"],child)
 return created["number"]
def ingest():
 payload=json.loads(os.environ.get("ORCH_PAYLOAD","{}")); n=int(payload.get("issue",0)); c,m=find_manifest(n); task=verify_task(n,m); kind=os.environ.get("ORCH_EVENT_NAME")
 trusted=json.load(open(".github/orchestration/trusted-actors.json")); sender=os.environ.get("ORCH_SENDER","")
 try:
  if kind=="orchestration-transition":
   if sender not in trusted.get("state_actors",[]) or payload.get("trigger",{}).get("actor")!=sender: raise Rejected("unauthorized transition actor")
   out,_=transition(m,payload)
  elif kind=="orchestration-acceptance":
   payload["actor"]=sender; out,_=ingest_acceptance(m,payload,trusted)
  elif kind=="orchestration-human-approval": out=approve(m,sender,m["run_id"],m["canonical_task_version"],m["binding"]["pr"],m["binding"]["head_sha"],trusted)
  elif kind=="orchestration-readiness": out=readiness(m,payload,sender,trusted)
  else: raise Rejected("unsupported event")
  if kind=="orchestration-acceptance" and out["stage"]=="preview_acceptance" and out["status"]=="failed": out=record_repair(out,out.get("blocking_findings",[]))
  if kind=="orchestration-acceptance" and out["stage"]=="production_acceptance" and out["status"]=="failed":
   write(n,c,out,m["revision"])
   child_issue=create_hotfix_issue(out,task); linked=json.loads(json.dumps(out)); linked["hotfix_count"]=linked.get("hotfix_count",0)+1; linked["active_hotfix_issue"]=child_issue; linked["blocked"]={"kind":"human","why":"Production Acceptance failed","what":f'Created linked hotfix Issue #{child_issue}',"need":"Review and authorize the hotfix when its exact SHA passes Preview Acceptance","resume":f'Issue #{child_issue} を再開'}; linked["status"]="blocked"; linked["revision"]+=1
   write(n,c,linked,out["revision"]); return
  write(n,c,out,m["revision"])
  if kind=="orchestration-human-approval": gate_status(out["binding"]["head_sha"],"success","Human authorized the exact Preview-accepted SHA")
 except (Rejected,KeyError,TypeError,json.JSONDecodeError) as e:
  post(n,f"Orchestration input archived without state change: `{type(e).__name__}: {e}`")
  raise
def observe():
 e=json.load(open(os.environ["ORCH_GITHUB_EVENT"])); delivery=os.getenv("GITHUB_RUN_ID","unknown")+":"+os.getenv("GITHUB_RUN_ATTEMPT","1"); pr=e.get("pull_request")
 if not pr and e.get("workflow_run"):
  run=e["workflow_run"]
  for ref in run.get("pull_requests",[]):
   _observe_bound_pr(gh(f'repos/{REPO}/pulls/{ref["number"]}'),"workflow-run:"+str(run.get("id",delivery)),run.get("conclusion"),run.get("head_sha"),run.get("name","quality"))
  return
 if not pr:return
 _observe_bound_pr(pr,"pull-request:"+delivery)

def _observe_bound_pr(pr,transition_id,ci_conclusion=None,observed_sha=None,check_name="quality"):
 # Association is accepted only from an exact manifest PR binding; prose/branch/Fixes are ignored.
 q=gh(f"search/issues?q=repo:{REPO}+is:issue+%22gameai-run-manifest:v1%22&per_page=100")
 for it in q.get("items",[]):
  try:c,m=find_manifest(it["number"])
  except Rejected:continue
  if m["binding"].get("pr")!=pr["number"]:continue
  verify_task(it["number"],m)
  if ci_conclusion is not None:
   if observed_sha!=pr["head"]["sha"]: return
   new,status=observe_ci(m,pr["number"],observed_sha,ci_conclusion,transition_id,check_name)
   if status in {"duplicate","ignored-late"}: return
   write(it["number"],c,new,m["revision"]); return
  if pr.get("merged"):
   new,status=observe_merge(m,pr["number"],pr["head"]["sha"],pr.get("merge_commit_sha"),transition_id)
   if status in {"duplicate","ignored-late"}: return
  else:
   new=bind_head(m,pr["head"]["sha"],os.getenv("GITHUB_ACTOR","github"))
   if new["binding"].get("head_sha")!=m["binding"].get("head_sha"): gate_status(new["binding"]["head_sha"],"pending","Awaiting Preview Acceptance and exact-SHA human authorization")
  write(it["number"],c,new,m["revision"]); return
def reconcile():
 n=os.getenv("ORCH_ISSUE")
 nums=[int(n)] if n else [x["number"] for x in gh(f"search/issues?q=repo:{REPO}+is:issue+%22gameai-run-manifest:v1%22&per_page=100").get("items",[])]
 for n in nums:
  try:_,m=find_manifest(n);reconcile_one(n,m)
  except Rejected:pass
if __name__=="__main__":
 {"init":init,"ingest":ingest,"observe":observe,"reconcile":reconcile,"labels":labels}[sys.argv[1]]()
