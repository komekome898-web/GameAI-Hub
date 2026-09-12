import pathlib, sys, unittest
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).parents[1]))
import orchestration_hotfix_reconcile as hotfix
from orchestration import Rejected


def parent_manifest(count=0, maximum=2):
    return {
        "schema": "gameai-run/v1",
        "run_id": "run-74",
        "canonical_task_version": 1,
        "canonical_task_digest": "digest",
        "revision": 4,
        "generation": 2,
        "stage": "production_acceptance",
        "status": "failed",
        "repository": "komekome898-web/GameAI-Hub",
        "issue": 74,
        "binding": {"branch": "feat/74", "pr": 91, "head_sha": "a" * 40, "merge_sha": "b" * 40},
        "profile": {"id": "work-critical", "registry_revision": 1, "configuration_status": "UNCONFIGURED"},
        "counters": {"acceptance_attempt": 1, "repair_revision": 0, "infrastructure_retry": 0, "infrastructure_failure": 0},
        "processed_transition_ids": [],
        "last_acceptance": {"result_id": "prod-fail-1", "verdict": "FAIL"},
        "lineage": {"hotfix_count": count, "max_hotfixes": maximum},
    }


class HotfixReconcileTests(unittest.TestCase):
    def test_parent_failure_is_the_durable_pending_operation(self):
        op = hotfix.pending_operation(parent_manifest())
        self.assertEqual(op["result_id"], "prod-fail-1")
        self.assertEqual(op["count"], 1)
        self.assertIn("run-74:prod-fail-1:1", op["operation_id"])

    @patch.object(hotfix, "_issues")
    def test_crash_after_child_issue_creation_reuses_exact_child_without_search_index(self, issues):
        op = hotfix.pending_operation(parent_manifest())
        issues.return_value = [{"number": 100, "title": op["title"], "body": op["marker"]}]
        self.assertEqual(hotfix.find_existing_child(op)["number"], 100)

    @patch.object(hotfix.adapter, "reconcile_one")
    @patch.object(hotfix.adapter, "find_manifest")
    def test_already_linked_parent_is_idempotent(self, find_manifest, reconcile_one):
        parent = parent_manifest()
        parent["lineage"]["active_child_issue"] = 100
        child = {"issue": 100}
        find_manifest.side_effect = [({"id": 1}, parent), ({"id": 2}, child)]
        self.assertFalse(hotfix.reconcile_issue(74))
        reconcile_one.assert_called_once_with(100, child)

    @patch.object(hotfix.adapter, "write")
    @patch.object(hotfix, "ensure_child")
    @patch.object(hotfix.adapter, "find_manifest")
    def test_crash_before_parent_link_replay_links_existing_child(self, find_manifest, ensure_child, write):
        parent = parent_manifest()
        child = {"run_id": "run-74-hotfix-1"}
        find_manifest.side_effect = [({"id": 1}, parent), ({"id": 1}, parent)]
        ensure_child.return_value = (100, child)
        self.assertTrue(hotfix.reconcile_issue(74))
        linked = write.call_args.args[2]
        self.assertEqual(linked["lineage"]["active_child_issue"], 100)
        self.assertEqual(linked["lineage"]["hotfix_count"], 1)

    @patch.object(hotfix.adapter, "write")
    @patch.object(hotfix.adapter, "find_manifest")
    def test_lineage_exhaustion_escalates_without_child_creation(self, find_manifest, write):
        parent = parent_manifest(count=2, maximum=2)
        find_manifest.return_value = ({"id": 1}, parent)
        self.assertTrue(hotfix.reconcile_issue(74))
        blocked = write.call_args.args[2]
        self.assertEqual(blocked["status"], "blocked")
        self.assertEqual(blocked["blocked"]["kind"], "human")

    @patch.object(hotfix.adapter, "comments")
    @patch.object(hotfix.adapter, "find_manifest")
    @patch.object(hotfix, "find_existing_child")
    def test_crash_after_child_manifest_creation_reuses_manifest_and_repairs_index(self, find_child, find_manifest, comments):
        parent = parent_manifest()
        op = hotfix.pending_operation(parent)
        find_child.return_value = {"number": 100, "title": op["title"], "body": op["marker"]}
        child = {"run_id": "run-74-hotfix-1", "parent_run_id": "run-74", "task_comment_id": 7, "manifest_comment_id": 8}
        find_manifest.return_value = ({"id": 8}, child)
        comments.return_value = []
        with patch.object(hotfix.adapter, "post") as post, patch.object(hotfix.adapter, "reconcile_one"):
            issue_number, recovered = hotfix.ensure_child(74, parent, op)
        self.assertEqual((issue_number, recovered["run_id"]), (100, "run-74-hotfix-1"))
        self.assertTrue(any(hotfix.adapter.INDEX in call.args[1] for call in post.call_args_list))


if __name__ == "__main__":
    unittest.main()
