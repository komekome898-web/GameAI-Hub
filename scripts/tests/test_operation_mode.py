"""Owner-directed entrypoint and side-effect regressions; no live services."""
import contextlib
import importlib
import io
import json
import os
import pathlib
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(pathlib.Path(__file__).parents[1]))
import orchestration_mode as mode
import orchestration_github as adapter

# Include every legacy ingress, recovery path and dispatch/child-creation sink.
ENTRYPOINTS = {
    'orchestration_github': ['init', 'ingest', 'dispatch', 'ensure_codex_dispatch', 'ensure_work_dispatch', 'create_child_hotfix'],
    'orchestration_hotfix_reconcile': ['ensure_child', 'reconcile_issue', 'reconcile_all'],
    'orchestration_work_ingress': ['main'],
    'orchestration_browser_recovery': ['recover', 'main'],
    'orchestration_transition_relay': ['main'],
    'orchestration_human_acceptance': ['main'],
    'orchestration_post_merge_recovery_driver': ['main', '_production_readiness'],
    'orchestration_post_merge_reconcile': ['main', 'reconcile', 'reconcile_production_pending', '_production_readiness'],
    'orchestration_production_reconcile': ['main'],
    'orchestration_preview_readiness_reconcile': ['main'],
    'orchestration_vercel_readiness': ['main'],
    'orchestration_work_watchdog': ['main', 'reconcile_issue'],
    'orchestration_event_ingress': ['main'],
}


class OperationModeTests(unittest.TestCase):
    def test_repository_defaults_to_owner_directed(self):
        self.assertEqual(json.loads(mode.CONFIG.read_text())['mode'], 'owner-directed')
        self.assertFalse(mode.legacy_automation_enabled())

    def test_missing_malformed_unknown_and_duplicate_config_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            config = pathlib.Path(directory) / 'mode.json'
            with patch.object(mode, 'CONFIG', config):
                self.assertFalse(mode.legacy_automation_enabled())
                for content in ['{}', 'null', '[]', 'invalid', '{"mode":"legacy-automatic"}',
                                '{"schema":"gameai-operation-mode/v1","mode":"unknown"}',
                                '{"schema":"gameai-operation-mode/v1","mode":"owner-directed","mode":"legacy-automatic"}']:
                    config.write_text(content)
                    self.assertFalse(mode.legacy_automation_enabled(), content)
                config.write_text('{"schema":"gameai-operation-mode/v1","mode":"legacy-automatic"}')
                self.assertTrue(mode.legacy_automation_enabled())

    def test_all_disabled_entrypoints_stop_before_inputs_network_or_mutations(self):
        # Omitted event/input arguments intentionally prove the guard runs first.
        with patch.object(adapter, 'gh') as gh, patch.object(adapter, 'write') as write, \
             patch.object(adapter, 'post') as post, patch.object(adapter, 'find_manifest') as find, \
             patch('urllib.request.urlopen') as urlopen, contextlib.redirect_stdout(io.StringIO()):
            for module, names in ENTRYPOINTS.items():
                for name in names:
                    with self.subTest(module=module, function=name):
                        self.assertFalse(getattr(importlib.import_module(module), name)())
            for mock in [gh, write, post, find, urlopen]:
                mock.assert_not_called()

    def test_owner_resume_cannot_retry_or_advance_generation(self):
        with patch.dict(os.environ, {'ORCH_OPERATION': 'resume'}), \
             patch.object(adapter, 'find_manifest') as find, patch.object(adapter, 'write') as write:
            self.assertFalse(adapter.human())
            find.assert_not_called()
            write.assert_not_called()

    def test_dispatch_and_hotfix_sinks_ignore_even_runnable_legacy_state(self):
        hotfix = importlib.import_module('orchestration_hotfix_reconcile')
        manifest = {'stage': 'production_acceptance', 'status': 'failed',
                    'last_acceptance': {'verdict': 'FAIL', 'result_id': 'result'},
                    'codex_outbox': {'state': 'DISPATCH_REQUESTED', 'dispatch_mode': 'NEW_TASK'},
                    'acceptance_claim': {'claim_id': 'current'}, 'generation': 15}
        before = json.dumps(manifest, sort_keys=True)
        with patch.object(adapter, 'gh') as gh, patch.object(adapter, 'post') as post:
            self.assertFalse(adapter.ensure_codex_dispatch(74, manifest))
            self.assertFalse(adapter.ensure_work_dispatch(74, manifest, record=True))
            self.assertFalse(adapter.create_child_hotfix(74, {}, manifest, 'result'))
            self.assertFalse(hotfix.ensure_child(74, manifest, {}))
            gh.assert_not_called()
            post.assert_not_called()
        self.assertEqual(json.dumps(manifest, sort_keys=True), before)

    def test_event_or_environment_cannot_enable_legacy(self):
        with patch.dict(os.environ, {'ORCH_MODE': 'legacy-automatic', 'GITHUB_ACTOR': 'komekome898-web',
                                   'ORCH_PAYLOAD': '{"mode":"legacy-automatic"}'}):
            self.assertFalse(mode.legacy_automation_enabled())
            self.assertFalse(adapter.ingest())

    def test_scheduled_projection_cannot_dispatch_existing_claim(self):
        with patch.dict(os.environ, {'ORCH_ISSUE': '74'}), \
             patch.object(adapter, 'find_manifest', return_value=({}, {'acceptance_claim': {'claim_id': 'old'}})), \
             patch.object(adapter, 'reconcile_one') as projection, \
             patch.object(adapter, 'post') as post, patch.object(adapter, 'gh') as gh:
            adapter.reconcile()
            projection.assert_called_once()
            post.assert_not_called()
            gh.assert_not_called()

    def test_every_workflow_script_entry_is_classified(self):
        import re
        root = pathlib.Path(__file__).resolve().parents[2]
        retained = {('orchestration_github', name) for name in ['bind', 'human', 'labels', 'reconcile']}
        retained.add(('orchestration_observe', 'main'))
        seen = set()
        for workflow in (root / '.github/workflows').glob('*.yml'):
            for module, command in re.findall(r'python scripts/(orchestration\w*)\.py(?: ([a-z]+))?', workflow.read_text()):
                entry = (module, command or ('reconcile_all' if module == 'orchestration_hotfix_reconcile' else 'main'))
                seen.add(entry)
                if entry in retained:
                    continue
                self.assertIn(entry[1], ENTRYPOINTS.get(entry[0], []), (workflow.name, entry))
                self.assertTrue(hasattr(getattr(importlib.import_module(entry[0]), entry[1]), '__wrapped__'))
        self.assertTrue(retained.issubset(seen))
        self.assertIn(('orchestration_work_ingress', 'main'), seen)
        self.assertIn(('orchestration_post_merge_recovery_driver', 'main'), seen)

    def test_observation_and_human_approval_are_not_disabled(self):
        observer = importlib.import_module('orchestration_observe')
        for function in [observer.main, observer.observe_check_run, adapter.observe, adapter.bind, adapter.human]:
            self.assertFalse(hasattr(function, '__wrapped__'))


class AffiliateDeliveryTests(unittest.TestCase):
    """Execute the actual delivery shell against local Git and a recording gh stub."""
    def test_branch_and_draft_pr_leave_main_unchanged(self):
        self._delivery(changed=True)

    def test_no_change_creates_neither_branch_nor_pr(self):
        self._delivery(changed=False)

    def _delivery(self, changed):
        import subprocess
        import textwrap
        root = pathlib.Path(__file__).resolve().parents[2]
        workflow = (root / '.github/workflows/register-affiliate.yml').read_text()
        delivery = workflow.split('      - name: Commit to a dedicated branch and open a draft PR\n', 1)[1]
        script = textwrap.dedent(delivery.split('        run: |\n', 1)[1])
        with tempfile.TemporaryDirectory() as directory:
            location = pathlib.Path(directory)
            repo = location / 'repo'
            repo.mkdir()
            env = {**os.environ, 'GIT_CONFIG_GLOBAL': '/dev/null', 'GIT_CONFIG_NOSYSTEM': '1',
                   'AFFILIATE_SERVICE': 'fixture-service', 'GITHUB_RUN_ID': '123', 'GITHUB_RUN_ATTEMPT': '1'}
            def git(*args):
                return subprocess.run(['git', *args], cwd=repo, env=env, check=True, capture_output=True, text=True).stdout.strip()
            git('init', '--initial-branch=main')
            git('config', 'user.name', 'Test')
            git('config', 'user.email', 'test@example.invalid')
            (repo / 'data').mkdir()
            for name in ['affiliate-programs.json', 'services.json']:
                (repo / 'data' / name).write_text('{}\n')
            git('add', 'data')
            git('commit', '-m', 'fixture')
            base = git('rev-parse', 'HEAD')
            remote = location / 'remote.git'
            git('init', '--bare', str(remote))
            git('remote', 'add', 'origin', str(remote))
            git('push', 'origin', 'main')
            bin_dir = location / 'bin'
            bin_dir.mkdir()
            capture = location / 'gh-args'
            gh = bin_dir / 'gh'
            gh.write_text('#!/bin/sh\nprintf "%s\\n" "$@" > "$TEST_GH_ARGS"\n')
            gh.chmod(0o755)
            env.update(PATH=str(bin_dir) + os.pathsep + env['PATH'], TEST_GH_ARGS=str(capture))
            if changed:
                (repo / 'data/services.json').write_text('{"fixture":true}\n')
            # Keep the workflow's body-file write inside the isolated fixture too.
            script = script.replace('/tmp/affiliate-pr-body.md', str(location / 'body.md'))
            subprocess.run(['bash', '-e', '-o', 'pipefail', '-c', script], cwd=repo, env=env, check=True, capture_output=True, text=True)
            self.assertEqual(git('ls-remote', 'origin', 'refs/heads/main').split()[0], base)
            if changed:
                self.assertEqual(git('branch', '--show-current'), 'affiliate/update-123-1')
                self.assertEqual(git('ls-remote', 'origin', 'refs/heads/affiliate/update-123-1').split()[0], git('rev-parse', 'HEAD'))
                args = capture.read_text().splitlines()
                self.assertEqual(args[:7], ['pr', 'create', '--base', 'main', '--head', 'affiliate/update-123-1', '--draft'])
                self.assertNotIn('merge', args)
                self.assertEqual(git('diff', '--name-only', base), 'data/services.json')
            else:
                self.assertEqual(git('branch', '--show-current'), 'main')
                self.assertFalse(capture.exists())


if __name__ == '__main__':
    unittest.main()
