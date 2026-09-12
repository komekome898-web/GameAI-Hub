import copy, json, pathlib, sys, unittest
sys.path.insert(0,str(pathlib.Path(__file__).parents[1]))
from orchestration import *

def manifest():
 return {"schema":"gameai-run/v1","run_id":"run-74-1","canonical_task_version":3,"revision":1,"generation":2,"stage":"preview_acceptance","status":"running","repository":"komekome898-web/GameAI-Hub","issue":74,"binding":{"branch":"feat/74","pr":91,"head_sha":"a"*40,"merge_sha":None},"profile":{"id":"work-standard","registry_revision":1,"configuration_status":"CONFIGURED_UNVERIFIED"},"counters":{"acceptance_attempt":0,"repair_revision":0,"infrastructure_retry":0},"processed_transition_ids":[],"acceptance_claim":{"attempt_id":"pa-1","environment":"preview","targets":["/"]}}
def event(m=None):
 m=m or manifest(); return {"run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],"expected_manifest_revision":m["revision"],"generation":m["generation"],"from_stage":m["stage"],"from_status":m["status"],"to_stage":"human_merge","to_status":"pending","transition_id":"t1","trigger":{"delivery_id":"d1","actor":"github-actions"},"repository":m["repository"],"issue":m["issue"],"pr":m["binding"]["pr"],"branch":m["binding"]["branch"],"sha":m["binding"]["head_sha"]}
def acceptance(m=None):
 m=m or manifest(); return {"schema":"gameai-acceptance/v1","run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],"stage":m["stage"],"attempt_id":"pa-1","repository":m["repository"],"issue":m["issue"],"pr":m["binding"]["pr"],"sha":m["binding"]["head_sha"],"environment":"preview","targets":["/"],"required_profile":"work-standard","profile_registry_revision":1,"actor":"work-app[bot]","actor_provenance":{"verified_by":"github-event-sender"},"expected_manifest_revision":m["revision"],"generation":m["generation"],"verdict":"PASS","findings":[]}
class T(unittest.TestCase):
 def rejected(self,m,e,text):
  with self.assertRaisesRegex(Rejected,text): transition(m,e)
 def test_01_duplicate_transition_noop(self):
  m=manifest(); m["processed_transition_ids"]=["t1"]; self.assertEqual(transition(m,event(m)),(m,"duplicate"))
 def test_02_stale_revision(self):
  e=event();e["expected_manifest_revision"]=0;self.rejected(manifest(),e,"stale manifest")
 def test_03_wrong_pr(self): e=event();e["pr"]=92;self.rejected(manifest(),e,"wrong pr")
 def test_04_wrong_sha(self): e=event();e["sha"]="b"*40;self.rejected(manifest(),e,"wrong SHA")
 def test_05_wrong_run(self): e=event();e["run_id"]="old";self.rejected(manifest(),e,"wrong run_id")
 def test_06_wrong_task_version(self): e=event();e["canonical_task_version"]=2;self.rejected(manifest(),e,"wrong canonical")
 def test_07_stale_acceptance(self):
  r=acceptance();r["attempt_id"]="old"
  with self.assertRaisesRegex(Rejected,"stale acceptance"):ingest_acceptance(manifest(),r,{"acceptance_actors":["work-app[bot]"]})
 def test_08_duplicate_fail_no_retry(self):
  m=manifest();r=acceptance();r["verdict"]="FAIL";m,_=ingest_acceptance(m,r,{"acceptance_actors":[r["actor"]]}); before=m["counters"]["repair_revision"];m,s=ingest_acceptance(m,r,{"acceptance_actors":[r["actor"]]});self.assertEqual((s,m["counters"]["repair_revision"]),("duplicate",before))
 def test_09_malformed(self):
  with self.assertRaisesRegex(Rejected,"malformed"):ingest_acceptance(manifest(),{}, {})
 def test_10_unauthorized_actor(self):
  with self.assertRaisesRegex(Rejected,"unauthorized"):ingest_acceptance(manifest(),acceptance(),{"acceptance_actors":[]})
 def test_11_two_labels_reconciled(self): self.assertEqual(projection(manifest(),["state:done","state:preview-ready","severity:P1"]),["severity:P1","state:needs-preview-acceptance"])
 def test_12_stale_codex_claim_blocks(self):
  m=manifest();m["codex_claim"]={"base_head_sha":"a"*40}; o=bind_head(m,"b"*40,"human");self.assertEqual((o["status"],o["blocked"]["kind"]),("blocked","human"))
 def test_13_approval_invalidated(self):
  m=manifest();m["stage"]="human_merge";m["status"]="pending";m=approve(m,"owner",m["run_id"],m["canonical_task_version"],91,"a"*40,{"human_approvers":["owner"]});self.assertNotIn("human_authorization",bind_head(m,"b"*40))
 def test_14_preview_fail_same_pr(self):
  m=manifest();m["status"]="failed";o=record_repair(m,["P1-001"]);self.assertEqual(o["patch_mode"]["same_pr"],91)
 def test_15_production_fail_child(self):
  m=manifest();m["stage"]="production_acceptance";m["status"]="failed";m["binding"]["merge_sha"]="c"*40;o=production_hotfix(m);self.assertEqual((o["parent_run_id"],o["binding"]["pr"]),(m["run_id"],None))
 def test_16_retry_max(self):
  m=manifest();m["status"]="failed";m["counters"]["repair_revision"]=5
  with self.assertRaisesRegex(Rejected,"limit"):record_repair(m,["P1-001"])
 def test_17_terminal_late_ignored(self):
  m=manifest();m["stage"]="terminal";m["status"]="superseded"
  with self.assertRaisesRegex(Rejected,"terminal"):transition(m,event(m))
 def test_18_profile_pinned(self):
  r=acceptance();r["profile_registry_revision"]=2
  with self.assertRaisesRegex(Rejected,"wrong profile"):ingest_acceptance(manifest(),r,{"acceptance_actors":[r["actor"]]})
 def test_19_readiness_mismatch_not_fail(self):
  m=manifest();m["stage"]="production_acceptance";m["status"]="pending";m["binding"]["merge_sha"]="c"*40;e=event(m);e.update(from_stage=m["stage"],from_status=m["status"],sha="b"*40,to_stage="production_acceptance",to_status="running")
  self.rejected(m,e,"wrong SHA")
 def test_20_summary_canonical(self):
  s=summary(manifest());self.assertIn("Current PR: 91",s);self.assertIn("work-standard @ revision 1",s);self.assertIn("Residual UNTESTED",s)
if __name__=="__main__":unittest.main()
