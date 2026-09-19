import copy
import pathlib
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).parents[1]))

from orchestration import Rejected
import orchestration_browser_recovery as recovery
import orchestration_github as adapter


def stranded_manifest():
    merge_sha = "a6a117f19c5f575bde848ab06cd6cc5b67e7bab9"
    return {
        "schema": "gameai-run/v1",
        "run_id": "GAI-74-v1-test",
        "canonical_task_version": 1,
        "revision": 55,
        "generation": 15,
        "stage": "production_acceptance",
        "status": "running",
        "repository": "komekome898-web/GameAI-Hub",
        "issue": 74,
        "binding": {"branch": "feat/issue-74-orchestration", "pr": 76, "head_sha": "5" * 40, "merge_sha": merge_sha},
        "profile": {"id": "work-critical", "registry_revision": 1, "configuration_status": "CONFIGURED_UNVERIFIED"},
        "counters": {"acceptance_attempt": 0, "repair_revision": 0, "infrastructure_retry": 0, "infrastructure_failure": 0},
        "max_infrastructure_retry": 3,
        "processed_transition_ids": [],
        "acceptance_claim": {
            "claim_id": "production-15-a6a117f19c5f575b",
            "attempt_id": "production-15-55",
            "run_id": "GAI-74-v1-test",
            "canonical_task_version": 1,
            "expected_manifest_revision": 55,
            "generation": 15,
            "stage": "production_acceptance",
            "repository": "komekome898-web/GameAI-Hub",
            "issue": 74,
            "pr": 76,
            "sha": merge_sha,
            "deployed_sha": merge_sha,
            "environment": "production",
            "targets": ["/"],
            "deployment_url": "https://game-ai-hub.vercel.app",
            "provider": "vercel",
            "deployment_id": "7eGAvQCg2T6wnYZPF9yPoRt2JWAq",
            "evidence_source": "github-vercel-status:test",
            "required_profile": "work-critical",
            "profile_registry_revision": 1,
            "runtime_model_override": {"model": "GPT-5.6 Sol", "generation": 15},
        },
    }


def request_for(m):
    c = m["acceptance_claim"]
    return {
        "claim_id": c["claim_id"],
        "attempt_id": c["attempt_id"],
        "generation": m["generation"],
        "manifest_revision": m["revision"],
        "pr": m["binding"]["pr"],
        "merge_sha": m["binding"]["merge_sha"],
        "deployment_id": c["deployment_id"],
    }


def event_for(m, comment_id=9001):
    body = adapter.block(recovery.MARKER, request_for(m))
    return {
        "issue": {"number": 74},
        "comment": {"id": comment_id, "author_association": "OWNER", "body": body},
        "sender": {"login": "komekome898-web"},
    }


class BrowserRecoveryTests(unittest.TestCase):
    @patch.object(recovery.adapter, "ensure_work_dispatch")
    @patch.object(recovery.adapter, "write")
    @patch.object(recovery.adapter, "comments", return_value=[])
    @patch.object(recovery.adapter, "verify_task")
    @patch.object(recovery.adapter, "find_manifest")
    def test_successful_stranded_recovery_is_fresh_fenced_and_override_does_not_leak(self, find_manifest, verify_task, comments, write, dispatch):
        m = stranded_manifest()
        find_manifest.return_value = ({"id": 1}, m)
        out = recovery.recover(event_for(m))
        self.assertEqual((out["generation"], out["counters"]["infrastructure_retry"]), (16, 1))
        self.assertEqual(out["acceptance_claim"]["claim_id"], "production-16-a6a117f19c5f575b")
        self.assertEqual(out["acceptance_claim"]["deployment_id"], m["acceptance_claim"]["deployment_id"])
        self.assertEqual(out["binding"], m["binding"])
        self.assertNotIn("runtime_model_override", out["acceptance_claim"])
        dispatch.assert_called_once_with(74, out, record=True)

    @patch.object(recovery.adapter, "comments", return_value=[])
    @patch.object(recovery.adapter, "verify_task")
    @patch.object(recovery.adapter, "find_manifest")
    def test_stale_request_is_rejected(self, find_manifest, verify_task, comments):
        m = stranded_manifest()
        find_manifest.return_value = ({"id": 1}, m)
        event = event_for(m)
        payload = request_for(m)
        payload["manifest_revision"] = 54
        event["comment"]["body"] = adapter.block(recovery.MARKER, payload)
        with self.assertRaisesRegex(Rejected, "stale"):
            recovery.recover(event)

    @patch.object(recovery.adapter, "ensure_work_dispatch")
    @patch.object(recovery.adapter, "write")
    @patch.object(recovery.adapter, "comments", return_value=[])
    @patch.object(recovery.adapter, "verify_task")
    @patch.object(recovery.adapter, "find_manifest")
    def test_duplicate_owner_request_becomes_stale_after_first_recovery(self, find_manifest, verify_task, comments, write, dispatch):
        m = stranded_manifest()
        find_manifest.return_value = ({"id": 1}, m)
        event = event_for(m)
        out = recovery.recover(event)
        find_manifest.return_value = ({"id": 1}, out)
        with self.assertRaisesRegex(Rejected, "stale"):
            recovery.recover(event)

    @patch.object(recovery.adapter, "comments")
    @patch.object(recovery.adapter, "verify_task")
    @patch.object(recovery.adapter, "find_manifest")
    def test_candidate_race_is_rejected(self, find_manifest, verify_task, comments):
        m = stranded_manifest()
        find_manifest.return_value = ({"id": 1}, m)
        candidate = {"claim_id": m["acceptance_claim"]["claim_id"]}
        comments.return_value = [{"id": 2, "body": adapter.block(recovery.ACCEPTANCE, candidate)}]
        with self.assertRaisesRegex(Rejected, "candidate already exists"):
            recovery.recover(event_for(m))

    @patch.object(recovery.adapter, "comments")
    @patch.object(recovery.adapter, "verify_task")
    @patch.object(recovery.adapter, "find_manifest")
    def test_trusted_retry_signal_race_is_rejected(self, find_manifest, verify_task, comments):
        m = stranded_manifest()
        find_manifest.return_value = ({"id": 1}, m)
        signal = {"claim_id": m["acceptance_claim"]["claim_id"]}
        comments.return_value = [{
            "id": 3,
            "body": adapter.block(recovery.BROWSER_RETRY, signal),
            "performed_via_github_app": {"id": recovery.WORK_APP_ID, "slug": "chatgpt-codex-connector"},
        }]
        with self.assertRaisesRegex(Rejected, "retry signal already exists"):
            recovery.recover(event_for(m))

    @patch.object(recovery.adapter, "ensure_work_dispatch")
    @patch.object(recovery.adapter, "write")
    @patch.object(recovery.adapter, "comments", return_value=[])
    @patch.object(recovery.adapter, "verify_task")
    @patch.object(recovery.adapter, "find_manifest")
    def test_recovery_honors_retry_cap_without_redispatch(self, find_manifest, verify_task, comments, write, dispatch):
        m = stranded_manifest()
        m["counters"]["infrastructure_retry"] = 3
        find_manifest.return_value = ({"id": 1}, m)
        out = recovery.recover(event_for(m))
        self.assertEqual((out["status"], out["blocked"]["kind"]), ("blocked", "technical"))
        dispatch.assert_not_called()


if __name__ == "__main__":
    unittest.main()
