import base64, copy, json, pathlib, sys, unittest
from unittest.mock import patch
sys.path.insert(0, str(pathlib.Path(__file__).parents[1]))
from orchestration import *
import orchestration_github as adapter
import orchestration_observe as observer
import orchestration_post_merge_reconcile as production_reconcile


def manifest(stage="preview_acceptance", status="running"):
    return {"schema":"gameai-run/v1","run_id":"run-74-1","canonical_task_version":3,"canonical_task_digest":"digest","revision":1,"generation":2,"stage":stage,"status":status,"repository":"komekome898-web/GameAI-Hub","issue":74,"binding":{"branch":"feat/74","pr":91,"head_sha":"a"*40,"merge_sha":"c"*40 if stage=="production_acceptance" else None},"profile":{"id":"work-critical" if stage=="production_acceptance" else "work-standard","registry_revision":1,"configuration_status":"CONFIGURED_UNVERIFIED"},"counters":{"acceptance_attempt":0,"repair_revision":0,"infrastructure_retry":0,"infrastructure_failure":0},"max_repair_revision":5,"processed_transition_ids":[],"acceptance_result_ids":[],"acceptance_claim":{"claim_id":"claim-1","attempt_id":"pa-1","environment":"production" if stage=="production_acceptance" else "preview","targets":["/"]},"deployment_origins":{"preview":["https://preview.example/"],"production":["https://game.example/"]}}


def base(m, operation, **extra):
    if operation == "readiness":
        extra.setdefault("profile_registry_revision", m["profile"]["registry_revision"])
    return {"operation":operation,"run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],"expected_manifest_revision":m["revision"],"generation":m["generation"],"from_stage":m["stage"],"from_status":m["status"],"transition_id":extra.pop("transition_id","t1"),"repository":m["repository"],"issue":m["issue"],**extra}


def result(m, verdict="PASS"):
    env="production" if m["stage"]=="production_acceptance" else "preview"
    value={"schema":"gameai-acceptance/v1","result_id":"result-1","claim_id":"claim-1","run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],"expected_manifest_revision":m["revision"],"generation":m["generation"],"stage":m["stage"],"attempt_id":"pa-1","repository":m["repository"],"issue":m["issue"],"pr":91,"sha":m["binding"]["merge_sha" if env=="production" else "head_sha"],"environment":env,"targets":["/"],"required_profile":m["profile"]["id"],"profile_registry_revision":1,"actor":"work-app[bot]","actor_provenance":{"verified_by":"github-event-envelope","sender":"work-app[bot]","actor_type":"Bot","app_id":"1"},"verdict":verdict,"findings":[] if verdict=="PASS" else [{"id":"P1-001","blocking":True}]}
    if env=="production" and verdict=="PASS": value["browser_evidence"]={"capabilities":{"render":True,"input":True,"click":True,"navigation":True,"iframe":"performed","back_forward":"performed"},"evidence":["browser-session:1"]}
    return value


def browser_retry(m, signal_id="no-browser-1"):
    claim=m["acceptance_claim"]
    return {"schema":"gameai-browser-capability/v1","signal_id":signal_id,"claim_id":claim["claim_id"],"run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],"expected_manifest_revision":m["revision"],"generation":m["generation"],"stage":"production_acceptance","attempt_id":claim["attempt_id"],"repository":m["repository"],"issue":m["issue"],"pr":91,"merge_sha":m["binding"]["merge_sha"],"deployment_id":claim.get("deployment_id","deploy-1"),"reason":"NO_QUALIFYING_INTERACTIVE_BROWSER","capabilities":{"render":False,"input":False,"click":False,"navigation":False,"iframe":False,"back_forward":False}}


class ReducerTests(unittest.TestCase):
    @patch.object(adapter, "gh")
    def test_readiness_envelope_reads_registry_from_default_branch(self, gh):
        registry={"schema":"gameai-work-profiles/v1","revision":2,"profiles":{"work-standard":{}}}
        gh.side_effect=[
            {"default_branch":"main"},
            {"type":"file","encoding":"base64","content":base64.b64encode(json.dumps(registry).encode()).decode()},
        ]
        m=manifest("preview_acceptance","pending")
        event=adapter.readiness_envelope(m,{"transition_id":"ready-2"})
        self.assertEqual(event["profile_registry_revision"],2)
        self.assertIn("ref=main",gh.call_args_list[1].args[0])

    @patch.object(production_reconcile, "_ensure_production_work_dispatch")
    @patch.object(adapter, "authoritative_profile_registry")
    def test_duplicate_production_reconciliation_only_reprojects_dispatch(self, registry, dispatch):
        registry.return_value={"schema":"gameai-work-profiles/v1","revision":2,"profiles":{"work-critical":{}}}
        m=manifest("production_acceptance","pending");m["profile"]["registry_revision"]=2
        m["acceptance_claim"].update(
            generation=2,expected_manifest_revision=1,environment="production",sha="c"*40,
            required_profile="work-critical",profile_registry_revision=2,
        )
        out=production_reconcile._production_readiness(74,{"id":9},m,"c"*40)
        self.assertIs(out,m)
        dispatch.assert_called_once_with(m)

    def test_no_browser_signal_creates_fresh_fenced_production_attempt(self):
        m=manifest("production_acceptance","running");m["acceptance_claim"].update(deployment_id="deploy-1",deployment_url="https://game.example/",sha="c"*40,pr=91)
        signal=browser_retry(m)
        out,status=reduce(m,base(m,"production_browser_retry",signal=signal,transition_id="production-browser-retry:no-browser-1"),"acceptance")
        self.assertEqual(status,"applied")
        self.assertEqual((out["generation"],out["counters"]["infrastructure_retry"]),(3,1))
        self.assertEqual((out["acceptance_claim"]["claim_id"],out["acceptance_claim"]["attempt_id"]),("production-3-cccccccccccccccc","production-3-2"))
        self.assertEqual((out["binding"],out["acceptance_claim"]["deployment_id"]),(m["binding"],"deploy-1"))

    def test_browser_retry_rejects_stale_signal_and_duplicate_is_noop(self):
        m=manifest("production_acceptance","running");m["acceptance_claim"]["deployment_id"]="deploy-1"
        event=base(m,"production_browser_retry",signal=browser_retry(m),transition_id="production-browser-retry:no-browser-1")
        with self.assertRaisesRegex(Rejected,"stale browser retry deployment"):
            reduce(m,{**event,"signal":{**event["signal"],"deployment_id":"old"}},"acceptance")
        out,_=reduce(m,event,"acceptance")
        replay={**event,"expected_manifest_revision":out["revision"]}
        self.assertEqual(reduce(out,replay,"acceptance"),(out,"duplicate"))

    def test_browser_retry_cap_is_visible_and_does_not_redispatch(self):
        m=manifest("production_acceptance","running");m["acceptance_claim"]["deployment_id"]="deploy-1";m["counters"]["infrastructure_retry"]=3;m["max_infrastructure_retry"]=3
        out,_=reduce(m,base(m,"production_browser_retry",signal=browser_retry(m),transition_id="production-browser-retry:cap"),"acceptance")
        self.assertEqual((out["status"],out["blocked"]["kind"]),("blocked","technical"))
        self.assertEqual(out["generation"],m["generation"])

    def test_production_pass_requires_real_interactive_browser_evidence(self):
        m=manifest("production_acceptance","running");r=result(m);r.pop("browser_evidence")
        with self.assertRaisesRegex(Rejected,"interactive browser evidence"):
            reduce(m,acceptance_event(m,r,"pass-without-browser"),"acceptance")

    def test_claim_scoped_model_override_does_not_leak_to_retry_generation(self):
        m=manifest("production_acceptance","running");m["acceptance_claim"].update(deployment_id="deploy-1",runtime_model_override={"model":"GPT-5.6 Sol","generation":2})
        out,_=reduce(m,base(m,"production_browser_retry",signal=browser_retry(m),transition_id="production-browser-retry:override"),"acceptance")
        self.assertNotIn("runtime_model_override",out["acceptance_claim"])
        self.assertEqual(out["acceptance_claim"]["required_profile"],"work-critical")

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

    def test_owner_resume_retries_blocked_production_with_new_fence(self):
        m=manifest("production_acceptance","blocked")
        m["blocked"]={"kind":"technical"};m["blocking_findings"]=["EV-PROD-001"]
        m["acceptance_result_ids"]=["old-result"];m["last_acceptance"]={"result_id":"old-result"}
        old_claim=m["acceptance_claim"].copy()
        event=base(m,"resume",pr=91,head_sha="a"*40,merge_sha="c"*40)
        out,_=reduce(m,event,"human")
        self.assertEqual((out["stage"],out["status"],out["generation"]),("production_acceptance","pending",3))
        self.assertEqual(out["counters"]["infrastructure_retry"],1)
        self.assertEqual(out["binding"],m["binding"])
        self.assertEqual(out["acceptance_result_ids"],["old-result"])
        self.assertEqual(out["last_acceptance"],m["last_acceptance"])
        self.assertIsNone(out["acceptance_claim"])
        self.assertNotIn("blocked",out)
        ready=base(out,"readiness",transition_id="ready-after-resume",environment="production",sha="c"*40,deployed_sha="c"*40,deployment_state="READY",deployment_url="https://game.example/",provider="vercel",deployment_id="d1",evidence_source="status",claim_id="claim-new",attempt_id="pa-new",targets=["/"],verified=True)
        running,_=reduce(out,ready,"deployment")
        stale=acceptance_event(running,result(m),"stale-result")
        stale["result"]["generation"]=old_claim.get("generation",2)
        with self.assertRaisesRegex(Rejected,"stale acceptance revision/fence|inactive or wrong acceptance stage"): reduce(running,stale,"acceptance")

    def test_resume_rejects_wrong_actor_state_and_release_binding(self):
        m=manifest("production_acceptance","blocked")
        event=base(m,"resume",pr=91,head_sha="a"*40,merge_sha="c"*40)
        with self.assertRaisesRegex(Rejected,"capability"): reduce(m,event,"generic")
        with self.assertRaisesRegex(Rejected,"binding"): reduce(m,{**event,"merge_sha":"d"*40},"human")
        preview=manifest("preview_acceptance","blocked")
        with self.assertRaisesRegex(Rejected,"target"): reduce(preview,base(preview,"resume",pr=91,head_sha="a"*40,merge_sha="c"*40),"human")

    def test_resumed_production_readiness_creates_fresh_noncolliding_claim(self):
        m=manifest("production_acceptance","blocked");m["acceptance_result_ids"]=["production-2-result"]
        resumed,_=reduce(m,base(m,"resume",pr=91,head_sha="a"*40,merge_sha="c"*40),"human")
        ready=base(resumed,"readiness",transition_id="production-readiness:3:status:c",environment="production",sha="c"*40,deployed_sha="c"*40,deployment_state="READY",deployment_url="https://game.example/",provider="vercel",deployment_id="d1",evidence_source="status",claim_id="production-3-c",attempt_id="production-3-3",targets=["/"],verified=True)
        out,_=reduce(resumed,ready,"deployment")
        self.assertEqual(out["acceptance_claim"]["claim_id"],"production-3-c")
        self.assertEqual(out["acceptance_result_ids"],["production-2-result"])

    def test_resume_preserves_old_claim_and_readiness_pins_new_registry_revision(self):
        m=manifest("production_acceptance","blocked")
        m["acceptance_claim"].update(profile_registry_revision=1,generation=2)
        old_claim=copy.deepcopy(m["acceptance_claim"])
        resumed,_=reduce(m,base(m,"resume",pr=91,head_sha="a"*40,merge_sha="c"*40),"human")
        self.assertEqual(resumed["acceptance_claim_history"],[old_claim])
        ready=base(resumed,"readiness",transition_id="ready-registry-2",profile_registry_revision=2,environment="production",sha="c"*40,deployed_sha="c"*40,deployment_state="READY",deployment_url="https://game.example/",provider="vercel",deployment_id="d2",evidence_source="status",claim_id="production-3-c",attempt_id="production-3-3",targets=["/"],verified=True)
        out,_=reduce(resumed,ready,"deployment")
        self.assertEqual(out["profile"]["registry_revision"],2)
        self.assertEqual(out["acceptance_claim"]["profile_registry_revision"],2)
        self.assertEqual(out["acceptance_claim_history"],[old_claim])
        dispatch=adapter.parse(adapter.render_work_dispatch(out),adapter.WORK_DISPATCH)
        self.assertEqual(dispatch["profile_registry_revision"],2)

    def test_stale_current_claim_is_fenced_not_rewritten(self):
        m=manifest("production_acceptance","pending")
        m["acceptance_claim"].update(profile_registry_revision=1,generation=2,sha="c"*40,pr=91)
        old_claim=copy.deepcopy(m["acceptance_claim"])
        event=base(m,"refresh_profile_registry",profile_registry_revision=2,transition_id="profile-registry-refresh:2:2")
        out,status=reduce(m,event,"deployment")
        self.assertEqual(status,"applied")
        self.assertEqual((out["generation"],out["acceptance_claim"]),(3,None))
        self.assertEqual(out["acceptance_claim_history"],[old_claim])
        self.assertEqual(m["acceptance_claim"],old_claim)
        replay={**event,"expected_manifest_revision":out["revision"]}
        self.assertEqual(reduce(out,replay,"deployment"),(out,"duplicate"))
        ready=base(out,"readiness",transition_id="production-readiness:3:d2",profile_registry_revision=2,environment="production",sha="c"*40,deployed_sha="c"*40,deployment_state="READY",deployment_url="https://game.example/",provider="vercel",deployment_id="d2",evidence_source="status",claim_id="production-3-c",attempt_id="production-3-3",targets=["/"],verified=True)
        fresh,_=reduce(out,ready,"deployment")
        dispatch=adapter.parse(adapter.render_work_dispatch(fresh),adapter.WORK_DISPATCH)
        self.assertEqual((fresh["generation"],dispatch["profile_registry_revision"]),(3,2))
        self.assertEqual(fresh["acceptance_claim_history"],[old_claim])

    def test_readiness_cannot_silently_rewrite_issued_stale_claim(self):
        m=manifest("production_acceptance","pending")
        ready=base(m,"readiness",profile_registry_revision=2,environment="production",sha="c"*40,deployed_sha="c"*40,deployment_state="READY",deployment_url="https://game.example/",provider="vercel",deployment_id="d2",evidence_source="status",claim_id="claim-new",attempt_id="pa-new",targets=["/"],verified=True)
        with self.assertRaisesRegex(Rejected,"must be fenced"):
            reduce(m,ready,"deployment")

    def test_readiness_rejects_registry_revision_rollback(self):
        m=manifest("production_acceptance","pending");m["profile"]["registry_revision"]=2;m["acceptance_claim"]=None
        ready=base(m,"readiness",profile_registry_revision=1,environment="production",sha="c"*40,deployed_sha="c"*40,deployment_state="READY",deployment_url="https://game.example/",provider="vercel",deployment_id="d2",evidence_source="status",claim_id="claim-new",attempt_id="pa-new",targets=["/"],verified=True)
        with self.assertRaisesRegex(Rejected,"registry revision"):
            reduce(m,ready,"deployment")

    def test_readiness_requires_verified_identity_origin_and_environment(self):
        m=manifest("production_acceptance","pending");m["acceptance_claim"]=None
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
        self.assertEqual((out["stage"],out["patch_mode"]["same_pr"],out["codex_outbox"]["generation"],out["codex_outbox"]["dispatch_mode"]),("implementation",91,2,"NEW_TASK"))

    def test_new_task_dispatch_is_fenced_to_existing_pr_and_findings(self):
        m=manifest();out,_=reduce(m,acceptance_event(m,result(m,"FAIL"),"fail"),"acceptance")
        claim=out["codex_outbox"];dispatch_id=f'new-task:{claim["claim_id"]}'
        event=base(out,"codex_dispatch",transition_id=dispatch_id,claim_id=claim["claim_id"],fencing_token=claim["fencing_token"],dispatch_id=dispatch_id)
        out,_=reduce(out,event,"codex_bridge");body=adapter.render_codex_dispatch(out);contract=adapter.parse(body,adapter.CODEX_DISPATCH)
        self.assertEqual((contract["dispatch_mode"],contract["pr"],contract["branch"],contract["base_head_sha"]),("NEW_TASK",91,"feat/74","a"*40))
        self.assertEqual(contract["finding_ids"],["P1-001"])
        self.assertIn("do not redesign, restart, or create a duplicate PR",body)
        self.assertIn("Do not attempt to resume",body)

    @patch.object(adapter,"post")
    @patch.object(adapter,"comments")
    def test_dispatch_projection_is_idempotent_after_crash(self, comments, post):
        m=manifest();out,_=reduce(m,acceptance_event(m,result(m,"FAIL"),"fail"),"acceptance")
        claim=out["codex_outbox"];dispatch_id=f'new-task:{claim["claim_id"]}'
        out,_=reduce(out,base(out,"codex_dispatch",transition_id=dispatch_id,claim_id=claim["claim_id"],fencing_token=claim["fencing_token"],dispatch_id=dispatch_id),"codex_bridge")
        existing={"id":12,"user":{"login":"github-actions[bot]","type":"Bot"},"body":adapter.render_codex_dispatch(out)}
        comments.return_value=[existing]
        self.assertTrue(adapter.ensure_codex_dispatch(74,out));post.assert_not_called()

    def test_work_dispatch_is_fenced_to_entire_current_claim(self):
        m=manifest();m["acceptance_claim"].update({
            "run_id":m["run_id"],"canonical_task_version":m["canonical_task_version"],
            "expected_manifest_revision":m["revision"],"generation":m["generation"],
            "stage":m["stage"],"repository":m["repository"],"issue":74,"pr":91,
            "sha":"a"*40,"required_profile":"work-standard","profile_registry_revision":1,
            "deployment_url":"https://preview.example/exact","provider":"vercel",
            "deployment_id":"deploy-1","deployed_sha":"a"*40,"evidence_source":"status",
        })
        body=adapter.render_work_dispatch(m);contract=adapter.parse(body,adapter.WORK_DISPATCH)
        self.assertEqual(contract["dispatch_id"],"work:claim-1")
        self.assertEqual(contract["profile_registry_revision"],1)
        self.assertEqual(contract["expected_manifest_revision"],1)
        self.assertEqual(contract["deployment_url"],"https://preview.example/exact")
        self.assertIn("same-claim candidate already exists",body)

    @patch.object(adapter,"post")
    @patch.object(adapter,"comments")
    @patch.object(adapter,"gh")
    def test_work_dispatch_replay_is_noop(self, gh, comments, post):
        m=manifest();m["acceptance_claim"].update({"expected_manifest_revision":1,"pr":91,"sha":"a"*40})
        gh.return_value={"state":"open","head":{"sha":"a"*40}}
        existing={"id":12,"user":{"login":"github-actions[bot]","type":"Bot"},"body":adapter.render_work_dispatch(m)}
        comments.return_value=[existing]
        self.assertTrue(adapter.ensure_work_dispatch(74,m));post.assert_not_called()

    @patch.object(adapter,"post")
    @patch.object(adapter,"comments",return_value=[])
    @patch.object(adapter,"gh")
    def test_work_dispatch_rejects_stale_pr_head(self, gh, comments, post):
        m=manifest();m["acceptance_claim"].update({"expected_manifest_revision":1,"pr":91,"sha":"a"*40})
        gh.return_value={"state":"open","head":{"sha":"b"*40}}
        with self.assertRaisesRegex(Rejected,"stale"):
            adapter.ensure_work_dispatch(74,m)
        post.assert_not_called()

    @patch.object(adapter,"post")
    @patch.object(adapter,"comments",return_value=[])
    @patch.object(adapter,"gh")
    def test_fresh_production_retry_dispatch_is_exactly_once_and_capability_based(self, gh, comments, post):
        m=manifest("production_acceptance","running");m["acceptance_claim"].update({"expected_manifest_revision":1,"generation":2,"pr":91,"sha":"c"*40,"deployment_id":"deploy-1","environment":"production"})
        gh.return_value={"merged":True,"merge_commit_sha":"c"*40}
        self.assertTrue(adapter.ensure_work_dispatch(74,m))
        body=post.call_args.args[1]
        self.assertIn("capability-based handshake",body)
        self.assertIn("No branded browser product is required",body)
        post.reset_mock();comments.return_value=[{"id":12,"user":{"login":"github-actions[bot]","type":"Bot"},"body":body}]
        self.assertTrue(adapter.ensure_work_dispatch(74,m));post.assert_not_called()

    def test_each_new_codex_task_identity_is_recorded_and_cannot_be_reused(self):
        m=manifest();out,_=reduce(m,acceptance_event(m,result(m,"FAIL"),"fail"),"acceptance")
        claim=out["codex_outbox"];dispatch_id=f'new-task:{claim["claim_id"]}'
        out,_=reduce(out,base(out,"codex_dispatch",transition_id=dispatch_id,claim_id=claim["claim_id"],fencing_token=claim["fencing_token"],dispatch_id=dispatch_id),"codex_bridge")
        ack=base(out,"codex_ack",transition_id="ack-1",claim_id=claim["claim_id"],fencing_token=claim["fencing_token"],dispatch_id=dispatch_id,external_task_id="thread-new-1")
        out,_=reduce(out,ack,"codex_bridge")
        self.assertEqual(out["codex_tasks"],[{"external_task_id":"thread-new-1","claim_id":claim["claim_id"],"dispatch_id":dispatch_id,"generation":2,"base_head_sha":"a"*40}])

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


class CheckRunObservationTests(unittest.TestCase):
    def actions_check(self, name, run_id):
        return {"name":name,"app":{"slug":"github-actions"},"details_url":f"https://github.com/example/repo/actions/runs/{run_id}/job/99"}

    @patch.object(observer.adapter,"gh")
    def test_actions_checks_job_projects_to_quality_workflow(self, gh):
        gh.return_value={"name":"quality"}
        self.assertEqual(observer.workflow_check_name(self.actions_check("checks",101)),"quality")
        gh.assert_called_once_with(f"repos/{adapter.REPO}/actions/runs/101")

    @patch.object(observer.adapter,"gh")
    def test_actions_e2e_job_projects_to_beginner_acceptance_workflow(self, gh):
        gh.return_value={"name":"beginner-acceptance"}
        self.assertEqual(observer.workflow_check_name(self.actions_check("e2e",202)),"beginner-acceptance")

    @patch.object(observer.adapter,"gh")
    def test_external_check_name_is_preserved(self, gh):
        check={"name":"Vercel Preview Comments","app":{"slug":"vercel"},"details_url":"https://example.test/check"}
        self.assertEqual(observer.workflow_check_name(check),"Vercel Preview Comments")
        gh.assert_not_called()

    @patch.object(observer.adapter,"gh",side_effect=RuntimeError("workflow unavailable"))
    def test_actions_workflow_lookup_failure_falls_back_to_raw_name(self, gh):
        self.assertEqual(observer.workflow_check_name(self.actions_check("checks",303)),"checks")

    @patch.object(observer.adapter,"write")
    @patch.object(observer.adapter,"verify_task")
    @patch.object(observer.adapter,"find_manifest")
    @patch.object(observer.adapter,"gh")
    def test_wrong_sha_observation_remains_ignored(self, gh, find_manifest, verify_task, write):
        m=manifest("implementation","running")
        find_manifest.return_value=({"id":1},m)
        gh.side_effect=[{"items":[{"number":74}]},{"head":{"repo":{"full_name":adapter.REPO},"sha":"b"*40,"ref":"feat/74"}}]
        observer.observe_check_run({"number":91},{"sha":"a"*40,"check_id":"1","check_name":"quality","conclusion":"success","source":"suite"})
        verify_task.assert_called_once_with(74,m)
        write.assert_not_called()


class WorkExecutionStateTests(unittest.TestCase):
    def emitted(self):
        m=manifest("production_acceptance","pending")
        m["acceptance_claim"].update({"generation":2,"sha":"c"*40,"expected_manifest_revision":1})
        event=base(m,"work_dispatch_emitted",claim_id="claim-1",attempt_id="pa-1",sha="c"*40,dispatch_id="work:claim-1",dispatch_comment_id=44,observed_at="2026-09-19T00:00:00Z",deadline_at="2026-09-19T01:00:00Z",transition_id="emit-44")
        return reduce(m,event,"work_bridge")[0]

    def test_dispatch_emitted_is_not_execution_ack(self):
        out=self.emitted()
        self.assertEqual((out["status"],out["work_execution"]["status"]),("pending","contract_emitted"))
        self.assertEqual(out["work_execution"]["bridge_capability"],"UNVERIFIED")
        self.assertIn("native Work execution has not been acknowledged",next_action(out))

    def test_ack_is_fenced_and_duplicate_is_idempotent(self):
        m=self.emitted()
        ack=base(m,"work_execution_ack",claim_id="claim-1",attempt_id="pa-1",sha="c"*40,dispatch_id="work:claim-1",external_execution_id="work-run-17",observed_at="2026-09-19T00:05:00Z",transition_id="ack-17")
        with self.assertRaisesRegex(Rejected,"stale Work claim"):
            reduce(m,{**ack,"claim_id":"old"},"work_bridge")
        out,_=reduce(m,ack,"work_bridge")
        self.assertEqual((out["status"],out["work_execution"]["status"]),("running","execution_acknowledged"))
        self.assertEqual(reduce(out,{**ack,"expected_manifest_revision":out["revision"]},"work_bridge"),(out,"duplicate"))

    def test_unacknowledged_dispatch_times_out_fail_closed(self):
        m=self.emitted(); binding=m["binding"].copy(); repair=m["counters"]["repair_revision"]
        event=base(m,"work_execution_timeout",claim_id="claim-1",attempt_id="pa-1",sha="c"*40,dispatch_id="work:claim-1",deadline_at="2026-09-19T01:00:00Z",observed_at="2026-09-19T01:00:00Z",transition_id="timeout-17")
        out,_=reduce(m,event,"work_bridge")
        self.assertEqual((out["status"],out["work_execution"]["status"],out["bridge_status"]["work"]),("blocked","timed_out","BLOCKED_UNVERIFIED"))
        self.assertEqual((out["binding"],out["counters"]["repair_revision"]),(binding,repair))

    def test_trusted_result_is_implicit_ack_and_result_received(self):
        m=self.emitted(); r=result(m); r["expected_manifest_revision"]=m["revision"]
        out,_=reduce(m,acceptance_event(m,r,"result-after-emission"),"acceptance")
        self.assertEqual(out["work_execution"]["status"],"result_received")
        self.assertEqual((out["stage"],out["status"]),("terminal","done"))


if __name__ == "__main__": unittest.main()
