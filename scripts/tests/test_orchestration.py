import copy, json, pathlib, sys, unittest
from unittest.mock import patch
sys.path.insert(0, str(pathlib.Path(__file__).parents[1]))
from orchestration import *
import orchestration_github as adapter


def manifest(stage="preview_acceptance", status="running"):
    return {"schema":"gameai-run/v1","run_id":"run-74-1","canonical_task_version":3,"canonical_task_digest":"digest","revision":1,"generation":2,"stage":stage,"status":status,"repository":"komekome898-web/GameAI-Hub","issue":74,"binding":{"branch":"feat/74","pr":91,"head_sha":"a"*40,"merge_sha":"c"*40 if stage=="production_acceptance" else None},"profile":{"id":"work-critical" if stage=="production_acceptance" else "work-standard","registry_revision":1,"configuration_status":"CONFIGURED_UNVERIFIED"},"counters":{"acceptance_attempt":0,"repair_revision":0,"infrastructure_retry":0,"infrastructure_failure":0},"max_repair_revision":5,"processed_transition_ids":[],"acceptance_result_ids":[],"acceptance_claim":{"claim_id":"claim-1","attempt_id":"pa-1","environment":"production" if stage=="production_acceptance" else "preview","targets":["/"]},"deployment_origins":{"preview":["https://preview.example/"],"production":["https://game.example/"]}}


def base(m, operation, **extra):
    return {"operation":operation,"run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],"expected_manifest_revision":m["revision"],"generation":m["generation"],"from_stage":m["stage"],"from_status":m["status"],"transition_id":extra.pop("transition_id","t1"),"repository":m["repository"],"issue":m["issue"],**extra}


def result(m, verdict="PASS"):
    env="production" if m["stage"]=="production_acceptance" else "preview"
    return {"schema":"gameai-acceptance/v1","result_id":"result-1","claim_id":"claim-1","run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],"expected_manifest_revision":m["revision"],"generation":m["generation"],"stage":m["stage"],"attempt_id":"pa-1","repository":m["repository"],"issue":m["issue"],"pr":91,"sha":m["binding"]["merge_sha" if env=="production" else "head_sha"],"environment":env,"targets":["/"],"required_profile":m["profile"]["id"],"profile_registry_revision":1,"actor":"work-app[bot]","actor_provenance":{"verified_by":"github-event-envelope","sender":"work-app[bot]","actor_type":"Bot","app_id":"1"},"verdict":verdict,"findings":[] if verdict=="PASS" else [{"id":"P1-001","blocking":True}]}


class ReducerTests(unittest.TestCase):
    def test_generic_cannot_forge_preview_pass(self):
        m=manifest(); e=base(m,"transition",to_stage="preview_acceptance",to_status="passed",trigger={})
        with self.assertRaisesRegex(Rejected,"privileged"): reduce(m,e,"generic")

    def test_generic_cannot_cross_merge_or_finish(self):
        for m,to in [(manifest("human_merge","pending"),("production_acceptance","pending")),(manifest("production_acceptance","running"),("terminal","done"))]:
            with self.assertRaisesRegex(Rejected,"privileged"): reduce(m,base(m,"transition",to_stage=to[0],to_status=to[1],trigger={}),"generic")

    def test_duplicate_is_noop(self):
        m=manifest("implementation","pending");m["processed_transition_ids"]=["t1"]
        self.assertEqual(reduce(m,base(m,"transition",to_stage="implementation",to_status="running"),"generic"),(m,"duplicate"))

    def test_initial_bind_and_idempotent_duplicate(self):
        m=manifest("implementation","pending");m["binding"]={"branch":None,"pr":None,"head_sha":None,"merge_sha":None}
        e=base(m,"bind_pr",pr=92,branch="feat/74",sha="b"*40)
        out,_=reduce(m,e,"binding");self.assertEqual((out["binding"]["pr"],out["binding"]["head_sha"]),(92,"b"*40))
        self.assertEqual(reduce(out,{**e,"expected_manifest_revision":out["revision"]},"binding")[1],"duplicate")

    def test_rebind_requires_recovery(self):
        m=manifest("implementation","pending")
        with self.assertRaisesRegex(Rejected,"explicit recovery"): reduce(m,base(m,"bind_pr",pr=92,branch="other",sha="b"*40),"binding")

    def test_pass_a_head_b_reacceptance_and_approval_rejected(self):
        m=manifest(); m,_=reduce(m,acceptance_event(m,result(m),"pass-a"),"acceptance")
        self.assertEqual((m["stage"],m["preview_acceptance"]),("human_merge","PASS"))
        changed,_=reduce(m,base(m,"bind_head",transition_id="head-b",pr=91,branch="feat/74",sha="b"*40),"binding")
        self.assertEqual((changed["stage"],changed["status"],changed["preview_acceptance"]),("preview_acceptance","pending","UNTESTED"))
        approve=base(changed,"approve",actor="owner",authorized_at="2026-01-01T00:00:00Z")
        with self.assertRaisesRegex(Rejected,"approval target"): reduce(changed,approve,"human")

    def test_pass_b_then_approval_allowed(self):
        m=manifest();m["binding"]["head_sha"]="b"*40;r=result(m);r["sha"]="b"*40
        m,_=reduce(m,acceptance_event(m,r,"pass-b"),"acceptance")
        out,_=reduce(m,base(m,"approve",actor="owner",authorized_at="2026-01-01T00:00:00Z"),"human")
        self.assertEqual(out["human_authorization"]["head_sha"],"b"*40)

    def test_merge_observation_is_fenced_and_revisioned(self):
        m=manifest("human_merge","pending");m["preview_acceptance"]="PASS";m["last_acceptance"]={"verdict":"PASS","sha":"a"*40};m["human_authorization"]={"pr":91,"head_sha":"a"*40}
        out,_=reduce(m,base(m,"merge_observed",sha="a"*40,merge_sha="c"*40),"merge_observer")
        self.assertEqual((out["revision"],out["stage"]),(2,"production_acceptance"))
        with self.assertRaisesRegex(Rejected,"wrong source|terminal"): reduce(out,{**base(m,"merge_observed",transition_id="replay",sha="a"*40,merge_sha="c"*40),"expected_manifest_revision":out["revision"]},"merge_observer")

    def test_readiness_requires_verified_identity_origin_and_environment(self):
        m=manifest("production_acceptance","pending")
        common=base(m,"readiness",environment="production",sha="c"*40,deployed_sha="c"*40,deployment_state="READY",deployment_url="https://game.example/x",provider="vercel",deployment_id="d1",evidence_source="api",claim_id="claim-2",attempt_id="p-1",targets=[],verified=True)
        for key,value,text in [("verified",False,"identity"),("environment","prod","environment"),("deployment_url","https://evil.example/","origin")]:
            e={**common,key:value}
            if key=="verified":
                out,_=reduce(m,e,"deployment");self.assertEqual(out["readiness"],"RETRYABLE WAIT")
            else:
                with self.assertRaisesRegex(Rejected,text): reduce(m,e,"deployment")
        out,_=reduce(m,{**common,"verified":True},"deployment");self.assertEqual(out["acceptance_claim"]["claim_id"],"claim-2")

    def test_claim_id_exact_and_schema_extra_rejected(self):
        m=manifest();r=result(m);r["claim_id"]="wrong"
        with self.assertRaisesRegex(Rejected,"stale acceptance claim"): reduce(m,acceptance_event(m,r,"x"),"acceptance")
        r=result(m);r["extra"]="no"
        with self.assertRaisesRegex(Rejected,"schema additional"): reduce(m,acceptance_event(m,r,"y"),"acceptance")

    def test_wrong_environment_and_inactive_result_rejected(self):
        m=manifest();r=result(m);r["environment"]="production"
        with self.assertRaisesRegex(Rejected,"wrong acceptance"): reduce(m,acceptance_event(m,r,"x"),"acceptance")
        m["status"]="blocked";r=result(m)
        with self.assertRaisesRegex(Rejected,"inactive"): reduce(m,acceptance_event(m,r,"y"),"acceptance")

    def test_preview_fail_creates_fenced_outbox(self):
        m=manifest();out,_=reduce(m,acceptance_event(m,result(m,"FAIL"),"fail"),"acceptance")
        self.assertEqual((out["stage"],out["patch_mode"]["same_pr"],out["codex_outbox"]["generation"]),("implementation",91,2))

    def test_malformed_fail_visible_technical_block(self):
        m=manifest();r=result(m,"FAIL");r["findings"]=[]
        out,_=reduce(m,acceptance_event(m,r,"fail"),"acceptance")
        self.assertEqual((out["status"],out["blocked"]["kind"]),("blocked","technical"))

    def test_cancel_supersede_and_migrate_fence_generation(self):
        for operation in ("cancel","supersede"):
            m=manifest();out,_=reduce(m,base(m,operation,new_run_id="next",new_issue=75),"human")
            self.assertEqual((out["stage"],out["generation"]),("terminal",3))
        m=manifest();out,_=reduce(m,base(m,"migrate_task_version",new_task_version=4,new_task_digest="new",new_task_comment_id=99),"human")
        self.assertEqual((out["canonical_task_version"],out["stage"],out["generation"]),(4,"research",3))

    def test_hotfix_distinct_issue_and_global_bound(self):
        m=manifest("production_acceptance","failed")
        child=create_hotfix(m,100);self.assertEqual((child["issue"],child["lineage"]["hotfix_count"]),(100,1))
        child["stage"],child["status"]="production_acceptance","failed"
        grand=create_hotfix(child,101);self.assertEqual(grand["lineage"]["hotfix_count"],2)
        grand["stage"],grand["status"]="production_acceptance","failed"
        with self.assertRaisesRegex(Rejected,"lineage limit"): create_hotfix(grand,102)

    def test_human_summary_first_and_actionable(self):
        m=manifest("human_merge","pending");m["preview_acceptance"]="PASS";m["last_acceptance"]={"verdict":"PASS","sha":"a"*40}
        rendered=adapter.render_manifest(m)
        self.assertLess(rendered.index("## Orchestration status"),rendered.index(adapter.MANIFEST))
        self.assertIn("authorize the current SHA",rendered);self.assertIn("fresh for current SHA",rendered)

    def test_block_contract_has_five_fields(self):
        block=normalized_block({},74);self.assertEqual(set(block),{"kind","why","what","need","next","resume"})

    def test_strict_json_rejects_duplicate_and_size(self):
        with self.assertRaisesRegex(Rejected,"duplicate"): adapter.strict_json('{"a":1,"a":2}')
        with self.assertRaisesRegex(Rejected,"large"): adapter.strict_json('{"a":"'+'x'*adapter.MAX_PAYLOAD+'"}')

    @patch.object(adapter,"comments")
    def test_untrusted_duplicate_marker_is_ignored(self, comments):
        m=manifest();trusted={"id":1,"user":{"login":"github-actions[bot]","type":"Bot"},"body":adapter.block(adapter.MANIFEST,m)};fake={"id":2,"user":{"login":"attacker","type":"User"},"body":adapter.block(adapter.MANIFEST,m)}
        comments.return_value=[trusted,fake]
        found,_=adapter.find_manifest(74);self.assertEqual(found["id"],1)

    def test_ci_exact_sha_only(self):
        m=manifest("implementation","running")
        with self.assertRaisesRegex(Rejected,"CI SHA"): reduce(m,base(m,"ci_observed",sha="b"*40,check_id="1",check_name="quality",conclusion="success",source="suite"),"ci_observer")
        out,_=reduce(m,base(m,"ci_observed",sha="a"*40,check_id="1",check_name="quality",conclusion="success",source="suite"),"ci_observer");self.assertEqual(out["ci"]["conclusion"],"pending")


if __name__ == "__main__": unittest.main()
