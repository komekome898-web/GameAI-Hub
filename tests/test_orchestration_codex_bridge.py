import copy
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).parents[1] / "scripts"))

from orchestration import Rejected, reduce  # noqa: E402
import orchestration_codex_bridge_ingress as ingress  # noqa: E402
from orchestration_codex_bridge_ingress import trusted_ack, trusted_challenge  # noqa: E402


def manifest():
    return {
        "schema": "gameai-run/v1",
        "run_id": "GAI-74-v1-test",
        "canonical_task_version": 1,
        "revision": 45,
        "generation": 13,
        "stage": "human_merge",
        "status": "pending",
        "repository": "komekome898-web/GameAI-Hub",
        "issue": 74,
        "binding": {"branch": "feat/issue-74-orchestration", "pr": 76, "head_sha": "a" * 40, "merge_sha": None},
        "bridge_status": {"codex": "NEEDS EXPERIMENT", "work": "CONFIGURED_UNVERIFIED", "deployment": "DISABLED_UNVERIFIED", "merge_gate": "UNVERIFIED"},
        "untested": ["Codex bridge", "Work trigger/writeback/model attestation", "Preview readiness", "Production readiness", "repository merge-gate enforcement"],
        "processed_transition_ids": [],
        "events": [],
    }


def observation(source, transition_id="codex-bridge-comment:5654282406"):
    return {
        "operation": "bridge_observed",
        "run_id": source["run_id"],
        "canonical_task_version": source["canonical_task_version"],
        "expected_manifest_revision": source["revision"],
        "generation": source["generation"],
        "from_stage": source["stage"],
        "from_status": source["status"],
        "transition_id": transition_id,
        "repository": source["repository"],
        "issue": source["issue"],
        "bridge": "codex",
        "observation": "VERIFIED",
        "evidence": {
            "comment_id": 5654282406,
            "challenge_comment_id": 5654243280,
            "marker_id": "codex-bridge-smoke-20260914-a",
            "source": "https://github.com/komekome898-web/GameAI-Hub/issues/74#issuecomment-5654282406",
            "observed_at": "2026-09-14T00:00:00Z",
            "actor": "chatgpt-codex-connector[bot]",
            "app_id": 1144995,
            "app_slug": "chatgpt-codex-connector",
        },
    }


class ReducerBridgeObservationTests(unittest.TestCase):
    def test_trusted_observation_records_only_codex_bridge_metadata(self):
        before = manifest()
        out, status = reduce(before, observation(before), "bridge_observer")
        self.assertEqual(status, "applied")
        self.assertEqual((out["stage"], out["status"]), (before["stage"], before["status"]))
        self.assertEqual(out["revision"], before["revision"] + 1)
        self.assertEqual(out["bridge_status"]["codex"], "VERIFIED")
        self.assertNotIn("Codex bridge", out["untested"])
        self.assertEqual(out["untested"], before["untested"][1:])
        self.assertEqual(out["bridge_status"]["merge_gate"], "UNVERIFIED")
        self.assertEqual(out["bridge_status"]["deployment"], "DISABLED_UNVERIFIED")
        self.assertNotIn("production", out)
        self.assertNotIn("runtime_model", out)
        expected = copy.deepcopy(before)
        expected["revision"] += 1
        expected["processed_transition_ids"].append("codex-bridge-comment:5654282406")
        expected["events"].append({"transition_id": "codex-bridge-comment:5654282406", "operation": "bridge_observed", "trigger": {}})
        expected["bridge_status"]["codex"] = "VERIFIED"
        expected["untested"].remove("Codex bridge")
        expected["codex_bridge_evidence"] = [observation(before)["evidence"]]
        self.assertEqual(out, expected)

    def test_replay_is_idempotent_even_with_original_revision(self):
        before = manifest()
        out, _ = reduce(before, observation(before), "bridge_observer")
        replayed, status = reduce(out, observation(before), "bridge_observer")
        self.assertEqual(status, "duplicate")
        self.assertEqual(replayed, out)

    def test_stale_distinct_observation_is_rejected(self):
        before = manifest()
        out, _ = reduce(before, observation(before), "bridge_observer")
        with self.assertRaisesRegex(Rejected, "stale manifest revision"):
            reduce(out, observation(before, "codex-bridge-comment:5654282407"), "bridge_observer")

    def test_wrong_capability_and_terminal_manifest_are_rejected(self):
        before = manifest()
        with self.assertRaisesRegex(Rejected, "bridge observer capability"):
            reduce(before, observation(before), "generic")
        before["stage"], before["status"] = "terminal", "done"
        event = observation(before)
        with self.assertRaisesRegex(Rejected, "terminal run"):
            reduce(before, event, "bridge_observer")


class TrustedAckTests(unittest.TestCase):
    def setUp(self):
        self.comment = {
            "id": 5654282406,
            "issue_url": "https://api.github.com/repos/komekome898-web/GameAI-Hub/issues/74",
            "html_url": "https://github.com/komekome898-web/GameAI-Hub/issues/74#issuecomment-5654282406",
            "body": "<!-- gameai-codex-bridge-smoke-ack:v1 codex-bridge-smoke-20260914-a -->\n\n[View task](https://chatgpt.com/s/example)",
            "user": {"login": "chatgpt-codex-connector[bot]", "type": "Bot"},
            "performed_via_github_app": {"id": 1144995, "slug": "chatgpt-codex-connector"},
        }
        self.event = {
            "action": "created",
            "repository": {"full_name": "komekome898-web/GameAI-Hub"},
            "issue": {"number": 74},
            "comment": {"id": 5654282406},
            "sender": {"login": "chatgpt-codex-connector[bot]", "type": "Bot"},
        }

    def test_accepts_proven_connector_ack(self):
        self.assertEqual(trusted_ack(self.event, self.comment), "codex-bridge-smoke-20260914-a")

    def test_rejects_spoofed_or_malformed_ack(self):
        for patch in (
            {"performed_via_github_app": None},
            {"performed_via_github_app": {"id": 1144995, "slug": "spoof"}},
            {"user": {"login": "attacker", "type": "User"}},
            {"body": "<!-- gameai-codex-bridge-smoke-ack:v1 -->"},
            {"body": self.comment["body"] + "\n<!-- gameai-codex-bridge-smoke-ack:v1 duplicate -->"},
        ):
            candidate = copy.deepcopy(self.comment)
            candidate.update(patch)
            with self.subTest(patch=patch), self.assertRaises(Rejected):
                trusted_ack(self.event, candidate)

    def test_requires_one_earlier_owner_issued_challenge(self):
        challenge = {
            "id": 5654243280,
            "user": {"login": "komekome898-web", "type": "User"},
            "body": "@codex smoke\n<!-- gameai-codex-bridge-smoke-ack:v1 codex-bridge-smoke-20260914-a -->",
        }
        original = ingress.adapter.comments
        try:
            ingress.adapter.comments = lambda issue: [challenge, self.comment]
            self.assertEqual(trusted_challenge(74, self.comment, "codex-bridge-smoke-20260914-a"), challenge)
            ingress.adapter.comments = lambda issue: [{**challenge, "user": {"login": "attacker", "type": "User"}}, self.comment]
            with self.assertRaises(Rejected):
                trusted_challenge(74, self.comment, "codex-bridge-smoke-20260914-a")
        finally:
            ingress.adapter.comments = original


if __name__ == "__main__":
    unittest.main()
