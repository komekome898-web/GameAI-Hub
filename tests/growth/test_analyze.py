"""Synthetic fixtures only: these numbers are NOT site performance."""
import copy
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('growth_analyze', ROOT / 'scripts/growth/analyze.py')
growth = importlib.util.module_from_spec(spec)
spec.loader.exec_module(growth)


def fixture():
    return {'version': 1, 'synthetic': True, 'site': 'https://game-ai-hub.vercel.app',
            'sources': {'synthetic': {'locator': 'synthetic fixture, not real analytics', 'retrieved_at': '2026-01-01', 'method': 'test construction', 'coverage': 'synthetic only'}},
            'periods': {'test': {'start': '2026-01-01', 'end': '2026-01-28', 'timezone': 'test-only UTC'}},
            'observations': [row('a', '/articles/example-a/', 2, 20, 4), row('b', '/articles/example-b/', 1, 5, 9)]}


def row(id, page, clicks, impressions, position):
    return {'id': id, 'source': 'synthetic', 'period': 'test', 'scope': 'sc_page', 'dimensions': {'page': page}, 'metrics': {'clicks': clicks, 'impressions': impressions, 'position': position}, 'quality': ['synthetic']}


def acquisition_fixture():
    bundle = fixture()
    kinds = {'demand': 'reader_feedback', 'asset': 'repository_source',
             'delta': 'execution_result', 'distribution': 'distribution_observation', 'review': 'independent_review'}
    for key, kind in kinds.items():
        text = f'Synthetic retained {kind} content; not a site observation or semantic analysis benchmark.'
        bundle['sources'][key] = {**bundle['sources']['synthetic'], 'evidence_kind': kind,
                                  'observed_text': text, 'observed_text_sha256': growth.hashlib.sha256(text.encode()).hexdigest()}
    candidate = {'id': 'new-reader-case', 'target_period': 'test', 'target_url': bundle['site'] + '/articles/example-a/',
                 'reader_question': 'Synthetic reader task', 'current_location': 'Synthetic section',
                 'finding': 'Analyst-declared synthetic finding', 'proposed_change': 'Synthetic traceable artifact',
                 'delta_status': 'verified', 'delta_description': 'Synthetic explicit old/new artifact comparison',
                 'evidence': ['demand', 'asset', 'delta', 'distribution'], 'coverage': 'missing',
                 'finding_status': 'verified', 'change_size': 'article', 'independent_review_id': 'review-1',
                 'acquisition_evidence': {'reader_demand': ['demand'], 'owned_asset': ['asset'],
                                          'incremental_value': ['delta'], 'distribution_route': ['distribution']}}
    bundle['opportunities'] = [candidate]
    bundle['reviews'] = [{'id': 'review-1', 'candidate_id': candidate['id'], 'reviewer': 'synthetic-independent-reviewer',
                          'producer': 'synthetic-producer', 'review_source': 'review', 'verdict': 'supported'}]
    stamp_review(bundle)
    return bundle


def stamp_review(bundle):
    bundle['reviews'][0]['reviewed_input_sha256'] = growth.review_input_digest(bundle, bundle['opportunities'][0])


class DiagnosticsTests(unittest.TestCase):
    def test_weighted_position_and_ctr_are_recomputed(self):
        result = growth.aggregate_search(fixture()['observations'])
        self.assertEqual(result['position'], 5)
        self.assertEqual(result['ctr'], 3 / 25)

    def test_missing_is_not_zero_or_ignored_in_aggregate(self):
        bundle = fixture()
        bundle['observations'][0]['metrics']['clicks'] = None
        self.assertIsNone(growth.aggregate_search(bundle['observations'])['clicks'])
        self.assertIsNone(growth.ctr(bundle['observations'][0]))
        self.assertIn('MISSING', [w['code'] for w in growth.diagnose(bundle)['warnings']])

    def test_zero_impressions_has_no_ctr(self):
        self.assertIsNone(growth.ctr(row('zero', '/zero', 0, 0, 0)))

    def test_page_and_query_marginals_never_become_pairs(self):
        bundle = fixture()
        q = copy.deepcopy(bundle['observations'][0])
        q.update(id='q', scope='sc_query', dimensions={'query': 'synthetic query'})
        bundle['observations'].append(q)
        self.assertEqual(growth.observed_pairs(bundle), [])
        q.update(id='pair', scope='sc_page_query', dimensions={'page': '/articles/example-a/', 'query': 'synthetic query'})
        self.assertEqual(len(growth.observed_pairs(bundle)), 1)

    def test_mixed_period_source_scope_and_duplicate_rows_rejected(self):
        for key, value in [('period', 'other'), ('source', 'other'), ('scope', 'sc_query')]:
            rows = fixture()['observations']
            rows[1][key] = value
            with self.assertRaises(growth.EvidenceError):
                growth.aggregate_search(rows)
        rows = fixture()['observations']
        rows[1]['dimensions'] = rows[0]['dimensions']
        with self.assertRaises(growth.EvidenceError):
            growth.aggregate_search(rows)

    def test_invalid_provenance_counts_dates_and_join_rejected(self):
        for mutate in [lambda b: b['observations'][0].update(source='unknown'),
                       lambda b: b['observations'][0]['metrics'].update(clicks=-1),
                       lambda b: b['observations'][0]['metrics'].update(clicks=True),
                       lambda b: b['observations'][0]['metrics'].update(clicks=21),
                       lambda b: b['periods']['test'].update(end='2025-01-01'),
                       lambda b: b['observations'][0].update(scope='sc_page_query')]:
            bundle = fixture()
            mutate(bundle)
            with self.assertRaises(growth.EvidenceError):
                growth.validate(bundle)

    def test_history_warning_and_zero_click_sensitivity_are_separate(self):
        bundle = fixture()
        bundle['observations'][0]['metrics']['clicks'] = 0
        hub = row('hub', '/articles/', 0, 0, 0)
        hub.update(scope='ga_hub', metrics={'pv': 90}, quality=['history_changes'])
        bundle['observations'].append(hub)
        report = growth.diagnose(bundle)
        warnings = {w['code']: w for w in report['warnings']}
        self.assertIn('HISTORY_PV', warnings)
        self.assertAlmostEqual(warnings['ZERO_CLICKS']['zero_click_upper_95_iid_diagnostic'], 1 - .05 ** (1/20))
        self.assertNotIn('transition_rate', report)

    def test_cli_reproducible_and_invalid_input_exits_nonzero(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'synthetic.json'
            path.write_text(json.dumps(fixture()))
            cmd = [sys.executable, str(ROOT / 'scripts/growth/analyze.py'), str(path)]
            a = subprocess.check_output(cmd)
            self.assertEqual(a, subprocess.check_output(cmd))
            self.assertEqual(len(json.loads(a)['input_sha256']), 64)
            path.write_text('{"version": 99}')
            self.assertNotEqual(subprocess.run(cmd, capture_output=True).returncode, 0)

    def test_reconciles_each_source_separately_and_flags_transcription_error(self):
        bundle = fixture()
        total = row('total', '/ignored', 3, 26, 5)
        total.update(scope='sc_page_total', dimensions={})
        bundle['observations'].append(total)
        result = growth.diagnose(bundle)
        self.assertEqual(result['table_reconciliation'][0]['matches'], {'clicks': True, 'impressions': False})
        self.assertIn('TABLE_TOTAL_MISMATCH', [w['code'] for w in result['warnings']])

    def test_nonfinite_position_and_wrong_dimensions_rejected(self):
        for mutate in [lambda b: b['observations'][0]['metrics'].update(position=float('nan')),
                       lambda b: b['observations'][0].update(dimensions={'query': 'wrong scope'}),
                       lambda b: b['observations'][0].update(dimensions={'page': 'https://other.test/path'})]:
            bundle = fixture()
            mutate(bundle)
            with self.assertRaises(growth.EvidenceError):
                growth.validate(bundle)

    def test_private_cli_does_not_print_diagnostics_to_stdout(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'private.json'
            bundle = fixture()
            bundle.pop('synthetic')
            path.write_text(json.dumps(bundle))
            cmd = [sys.executable, str(ROOT / 'scripts/growth/analyze.py'), str(path)]
            denied = subprocess.run(cmd, capture_output=True)
            self.assertNotEqual(denied.returncode, 0)
            self.assertEqual(denied.stdout, b'')
            public_output = subprocess.run(cmd + ['--output', str(ROOT / 'must-not-create-private-diagnostics.json')], capture_output=True)
            self.assertNotEqual(public_output.returncode, 0)
            self.assertFalse((ROOT / 'must-not-create-private-diagnostics.json').exists())
            output = Path(tmp) / 'private-output.json'
            accepted = subprocess.run(cmd + ['--output', str(output)], capture_output=True)
            self.assertEqual(accepted.returncode, 0)
            self.assertEqual(accepted.stdout, b'')
            self.assertTrue(output.exists())

    def test_nonrepo_snapshot_accepts_private_sibling_paths(self):
        with tempfile.TemporaryDirectory() as tmp:
            private = Path(tmp)
            script = private / 'scripts/growth/analyze.py'
            script.parent.mkdir(parents=True)
            script.write_bytes((ROOT / 'scripts/growth/analyze.py').read_bytes())
            data = private / 'observations.json'
            bundle = fixture()
            bundle.pop('synthetic')
            data.write_text(json.dumps(bundle))
            output = private / 'result.json'
            run = subprocess.run([sys.executable, str(script), str(data), '--output', str(output)], capture_output=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            self.assertTrue(output.exists())

    def test_private_paths_respect_git_roots_symlinks_and_boundaries(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            repo, outside = base / 'public', base / 'public-sibling'
            repo.mkdir()
            outside.mkdir()
            subprocess.run(['git', 'init', '-q', str(repo)], check=True)
            script = outside / 'analyze.py'
            data, output = outside / 'input.json', outside / 'out.json'
            data.write_text('{}')
            growth.protect_private_paths(data, output, public_repo_root=repo, script=script)
            for path in (repo / 'private.json', repo / 'nested/out.json'):
                with self.assertRaises(growth.EvidenceError):
                    growth.protect_private_paths(data, path, script=script)
            external_link = outside / 'into-repo'
            external_link.symlink_to(repo, target_is_directory=True)
            with self.assertRaises(growth.EvidenceError):
                growth.protect_private_paths(data, external_link / 'output.json', script=script)
            repo_dir_link = repo / 'private-directory'
            repo_dir_link.symlink_to(outside, target_is_directory=True)
            with self.assertRaises(growth.EvidenceError):
                growth.protect_private_paths(data, repo_dir_link / 'output.json', script=script)
            repo_link = repo / 'points-out.json'
            repo_link.symlink_to(data)
            with self.assertRaises(growth.EvidenceError):
                growth.protect_private_paths(repo_link, output, script=script)
            with self.assertRaises(growth.EvidenceError):
                growth.protect_private_paths(data, output, public_repo_root=outside, script=script)

    def test_literal_query_partial_coverage_preserves_unprovided_metadata(self):
        bundle = fixture()
        page = bundle['observations'][0]
        page['metrics'].update(clicks=0, impressions=57)
        bundle['observations'] = [page]
        bundle['sources']['synthetic']['unprovided_query_metadata'] = [
            {'operator': 'site:', 'impressions': 1, 'literal_query': None},
            {'operator': 'site:', 'impressions': 1, 'literal_query': None}]
        for i, impressions in enumerate([26, 2, 1, 1, 1, 1]):
            q = row('q' + str(i), '/articles/example-a/', 0, impressions, 7)
            q.update(scope='sc_page_query', dimensions={'page': '/articles/example-a/', 'query': 'literal-' + str(i)})
            bundle['observations'].append(q)
        result = growth.diagnose(bundle)
        coverage = result['page_query_coverage'][0]
        self.assertEqual(coverage['visible_partial_sum']['impressions'], 32)
        self.assertEqual(coverage['reported_page_metrics']['impressions'], 57)
        self.assertEqual(coverage['status'], 'compatible_partial_coverage')
        self.assertEqual(coverage['visible_literal_row_count'], 6)
        self.assertEqual(len(result['observed_page_query_pairs']), 6)
        self.assertEqual(result['sources'], bundle['sources'])
        self.assertNotIn('residual', coverage)
        self.assertNotIn('TABLE_TOTAL_MISMATCH', [w['code'] for w in result['warnings']])
        for field in ('period', 'source'):
            changed = copy.deepcopy(bundle)
            if field == 'period':
                changed['periods']['same-dates-other-boundary'] = dict(bundle['periods']['test'])
                changed['observations'][0]['period'] = 'same-dates-other-boundary'
            else:
                changed['sources']['other'] = dict(bundle['sources']['synthetic'])
                changed['observations'][0]['source'] = 'other'
            self.assertFalse(growth.diagnose(changed)['page_query_coverage'][0]['comparison_eligible'])
        changed = copy.deepcopy(bundle)
        changed['observations'][0]['dimensions']['page'] = '/other/'
        self.assertFalse(growth.diagnose(changed)['page_query_coverage'][0]['comparison_eligible'])
        changed = copy.deepcopy(bundle)
        changed['observations'][0]['quality'] = ['api_failure']
        self.assertFalse(growth.diagnose(changed)['page_query_coverage'][0]['comparison_eligible'])
        changed = copy.deepcopy(bundle)
        changed['observations'][0]['metrics']['impressions'] = 20
        self.assertEqual(growth.diagnose(changed)['page_query_coverage'][0]['status'], 'inspect_count_compatibility')

    def test_declared_classification_routes_actions_not_semantic_analysis(self):
        # Routing contract only: these labels are supplied by an analyst.
        # This is not a test of interpreting primary text or diagnosing causes.
        bundle = fixture()
        candidate = {'id': 'save-to-play', 'target_period': 'test', 'target_url': bundle['site'] + '/articles/example-a/',
                     'reader_question': 'How do I share a working file?', 'current_location': 'section 4',
                     'finding': 'Source inspection shows a missing publishing step', 'proposed_change': 'Add branch-aware publication steps',
                     'evidence': ['a', 'synthetic'], 'coverage': 'missing', 'finding_status': 'verified', 'change_size': 'section'}
        bundle['opportunities'] = [candidate]
        for coverage, expected in [('missing', 'complete_reader_task'), ('mismatch', 'align_intent'), ('blocked', 'restore_access'), ('complete', 'retain')]:
            candidate['coverage'] = coverage
            result = growth.assess_opportunities(bundle)
            self.assertEqual(result['candidates'][0]['action'], expected)
            self.assertEqual(result['first_action'], None if coverage == 'complete' else 'save-to-play')
        candidate['coverage'] = 'missing'
        candidate['finding_status'] = 'hypothesis'
        self.assertIsNone(growth.assess_opportunities(bundle)['first_action'])

    def test_existing_feature_counterexample_suppresses_addition(self):
        bundle = fixture()
        bundle['opportunities'] = [{'id': 'runnable-example', 'target_period': 'test', 'target_url': bundle['site'] + '/articles/example-a/',
            'reader_question': 'Can I play the example?', 'current_location': 'workspace section',
            'finding': 'Already has runnable example and recovery', 'proposed_change': 'Keep existing implementation',
            'evidence': ['a'], 'coverage': 'complete', 'finding_status': 'verified', 'change_size': 'section'}]
        self.assertEqual(growth.assess_opportunities(bundle)['candidates'][0]['action'], 'retain')
        self.assertIsNone(growth.assess_opportunities(bundle)['first_action'])

    def test_cohort_rate_rejects_mixed_period_unit_host_and_history_pv(self):
        denominator = {'id': 'hub', 'source': 'synthetic', 'period': 'test', 'host': 'example.test',
                       'cohort_id': 'matched-sessions', 'unit': 'sessions', 'status': 'observed', 'value': 10}
        numerator = {**denominator, 'id': 'open', 'subset_of': 'hub', 'value': 2}
        self.assertEqual(growth.cohort_rate(numerator, denominator), .2)
        for key, value in [('period', 'other'), ('unit', 'pv'), ('host', 'another.test'), ('cohort_id', 'other'), ('status', 'api_failure')]:
            with self.assertRaises(growth.EvidenceError):
                growth.cohort_rate({**numerator, key: value}, denominator)
        denominator['unit'] = numerator['unit'] = 'pv'
        with self.assertRaises(growth.EvidenceError):
            growth.cohort_rate(numerator, denominator)

    def test_api_failure_delay_missing_and_observed_zero_stay_distinct(self):
        bundle = fixture()
        failed = row('failed', '/failure', None, None, None)
        failed['quality'] = ['api_failure']
        delayed = row('delayed', '/delay', None, None, None)
        delayed['quality'] = ['delayed']
        zero = row('zero', '/zero', 0, 0, None)
        bundle['observations'].extend([failed, delayed, zero])
        result = growth.diagnose(bundle)
        codes = {w['code'] for w in result['warnings']}
        self.assertTrue({'API_FAILURE', 'DELAYED', 'MISSING'} <= codes)
        rows = {r['evidence']: r for r in result['search_pages']}
        self.assertIsNone(rows['failed']['metrics']['clicks'])
        self.assertEqual(rows['zero']['metrics']['clicks'], 0)

    def test_failed_or_missing_reach_cannot_select_observed_opportunity(self):
        bundle = fixture()
        bundle['opportunities'] = [{'id': 'missing-step', 'target_period': 'test', 'target_url': bundle['site'] + '/articles/example-a/',
            'reader_question': 'How to publish?', 'current_location': 'section 4', 'finding': 'missing step',
            'proposed_change': 'add verified steps', 'evidence': ['a'], 'coverage': 'missing',
            'finding_status': 'verified', 'change_size': 'section'}]
        for quality, reach in [(['api_failure'], None), (['delayed'], 20), (['unknown'], 20), (['synthetic'], None), (['synthetic'], 0)]:
            bundle['observations'][0]['quality'] = quality
            bundle['observations'][0]['metrics'].update(clicks=None, impressions=reach, position=None)
            self.assertIsNone(growth.assess_opportunities(bundle)['first_action'])

    def test_duplicate_total_dimensions_rejected(self):
        bundle = fixture()
        total = row('total', '/ignored', 3, 25, 5)
        total.update(scope='sc_page_total', dimensions={})
        bundle['observations'].extend([total, {**total, 'id': 'second-total'}])
        with self.assertRaises(growth.EvidenceError):
            growth.validate(bundle)

    def test_synthetic_brief_passes_and_unknown_evidence_or_forecast_fails(self):
        brief = json.loads((ROOT / 'scripts/growth/brief.synthetic.json').read_text())
        self.assertEqual(growth.validate_brief(brief, fixture())['contract'], 'pass')
        for mutate in [lambda b: b.update(evidence=['not-observed']), lambda b: b.update(effect_estimate=2)]:
            altered = copy.deepcopy(brief)
            mutate(altered)
            with self.assertRaises(growth.EvidenceError):
                growth.validate_brief(altered, fixture())

    def test_acquisition_requires_new_value_and_independent_source_review(self):
        bundle = acquisition_fixture()
        candidate = bundle['opportunities'][0]
        self.assertEqual(growth.assess_opportunities(bundle)['primary_experiment'], 'new-reader-case')
        candidate['delta_status'] = 'duplicates_existing'
        stamp_review(bundle)
        self.assertIsNone(growth.assess_opportunities(bundle)['primary_experiment'])
        candidate['delta_status'] = 'verified'
        candidate['coverage'] = 'complete'
        stamp_review(bundle)
        self.assertIsNone(growth.assess_opportunities(bundle)['primary_experiment'])
        candidate['acquisition_evidence'].pop('incremental_value')
        with self.assertRaises(growth.EvidenceError):
            growth.assess_opportunities(bundle)

    def test_acquisition_cannot_bypass_bad_metric_eligibility(self):
        for quality, metrics in [(['api_failure'], {'clicks': None, 'impressions': None, 'position': None}),
                                 (['unreconciled_testing'], {'clicks': 1, 'impressions': 20, 'position': 4})]:
            bundle = acquisition_fixture()
            bundle['observations'][0].update(scope='sc_page_query', dimensions={'page': '/articles/example-a/', 'query': 'synthetic query'}, quality=quality, metrics=metrics)
            candidate = bundle['opportunities'][0]
            candidate['evidence'] = ['a']
            candidate['acquisition_evidence'] = {role: ['a'] for role in growth.ROLE_KINDS}
            stamp_review(bundle)
            result = growth.assess_opportunities(bundle)
            self.assertIsNone(result['primary_experiment'])
            self.assertEqual(result['candidates'][0]['action'], 'investigate')
            self.assertTrue(all(not role['usable_refs'] for role in result['candidates'][0]['acquisition_evidence_eligibility'].values()))

    def test_source_ids_and_verified_labels_alone_do_not_promote(self):
        bundle = acquisition_fixture()
        bundle.pop('reviews')
        result = growth.assess_opportunities(bundle)
        self.assertIsNone(result['primary_experiment'])
        self.assertEqual(result['candidates'][0]['independent_review_eligibility']['reason'], 'requires_independent_primary_source_review')
        bundle = acquisition_fixture()
        candidate = bundle['opportunities'][0]
        candidate['acquisition_evidence']['reader_demand'] = ['asset']
        stamp_review(bundle)
        self.assertIsNone(growth.assess_opportunities(bundle)['primary_experiment'])
        self.assertIn('wrong_evidence_kind_for_role', growth.assess_opportunities(bundle)['candidates'][0]['acquisition_evidence_eligibility']['reader_demand']['rejected_observations']['asset'])

    def test_review_invalidates_after_source_or_candidate_change(self):
        for change in ('candidate', 'source'):
            bundle = acquisition_fixture()
            if change == 'candidate':
                bundle['opportunities'][0]['proposed_change'] = 'different synthetic artifact'
            else:
                source = bundle['sources']['delta']
                source['observed_text'] = 'Changed synthetic evidence content'
                source['observed_text_sha256'] = growth.hashlib.sha256(source['observed_text'].encode()).hexdigest()
            result = growth.assess_opportunities(bundle)
            self.assertIsNone(result['primary_experiment'])
            self.assertEqual(result['candidates'][0]['independent_review_eligibility']['reason'], 'review_stale_after_candidate_or_evidence_change')

    def test_quality_requires_known_token_array_not_string_or_nested_data(self):
        for bad in ['api_failure', True, ['unexpected_flag'], [{'api_failure': True}], [], None]:
            bundle = fixture()
            bundle['observations'][0]['quality'] = bad
            with self.assertRaises(growth.EvidenceError):
                growth.validate(bundle)

    def test_scope_anomaly_or_testing_traffic_cannot_choose_first_action(self):
        for quality, metrics, reason in [(['observed'], {'pv': 2, 'active_users': 5}, 'PV_USER_SCOPE'),
                                         (['unreconciled_testing'], {'pv': 20, 'active_users': 5}, 'unreconciled_testing')]:
            bundle = fixture()
            bundle['observations'][0].update(scope='ga_page', quality=quality, metrics=metrics)
            bundle['opportunities'] = [{'id': 'bad-pv', 'target_period': 'test', 'target_url': bundle['site'] + '/articles/example-a/',
                'reader_question': 'Synthetic task', 'current_location': 'section', 'finding': 'Supplied classification',
                'proposed_change': 'Change', 'evidence': ['a'], 'coverage': 'missing', 'finding_status': 'verified', 'change_size': 'section'}]
            result = growth.assess_opportunities(bundle)
            self.assertIsNone(result['first_action'])
            self.assertIn(reason, result['candidates'][0]['metric_evidence_eligibility']['a']['reasons'])

    def test_old_positive_row_cannot_support_current_period_candidate(self):
        bundle = fixture()
        bundle['periods']['old'] = {'start': '2025-01-01', 'end': '2025-01-28', 'timezone': 'UTC'}
        bundle['observations'][0]['period'] = 'old'
        candidate = {'id': 'stale', 'target_period': 'test', 'target_url': bundle['site'] + '/articles/example-a/',
                     'reader_question': 'Synthetic task', 'current_location': 'section', 'finding': 'Supplied classification',
                     'proposed_change': 'Change', 'evidence': ['a'], 'coverage': 'missing', 'finding_status': 'verified', 'change_size': 'section'}
        bundle['opportunities'] = [candidate]
        result = growth.assess_opportunities(bundle)
        self.assertIsNone(result['first_action'])
        self.assertIn('period_mismatch', result['candidates'][0]['metric_evidence_eligibility']['a']['reasons'])
        candidate.pop('target_period')
        with self.assertRaises(growth.EvidenceError):
            growth.assess_opportunities(bundle)

    def test_property_total_preserved_without_comparing_to_page_sum(self):
        bundle = fixture()
        total = row('property', '/ignored', 3, 22, 5)
        total.update(scope='sc_property_total', dimensions={})
        bundle['observations'].append(total)
        result = growth.diagnose(bundle)
        self.assertEqual(result['reported_search_totals'][0]['metrics']['impressions'], 22)
        self.assertEqual(result['table_reconciliation'], [])
        self.assertNotIn('TABLE_TOTAL_MISMATCH', [w['code'] for w in result['warnings']])

    def test_users_above_pageviews_prompts_scope_check_not_bot_label(self):
        bundle = fixture()
        ga = row('ga-synthetic', '/articles/example-a/', 0, 0, 0)
        ga.update(scope='ga_page', metrics={'pv': 2, 'active_users': 5})
        bundle['observations'].append(ga)
        warning = next(w for w in growth.diagnose(bundle)['warnings'] if w['code'] == 'PV_USER_SCOPE')
        self.assertEqual(warning['evidence'], ['ga-synthetic'])
        self.assertIn('Do not infer bots', warning['action'])

    def test_review_binds_indirect_measurement_source_content(self):
        bundle = acquisition_fixture()
        bundle['opportunities'][0]['evidence'].append('a')
        stamp_review(bundle)
        self.assertEqual(growth.assess_opportunities(bundle)['primary_experiment'], 'new-reader-case')
        bundle['sources']['synthetic']['coverage'] = 'Changed source coverage without changing observation values'
        result = growth.assess_opportunities(bundle)
        self.assertIsNone(result['primary_experiment'])
        self.assertEqual(result['candidates'][0]['independent_review_eligibility']['reason'], 'review_stale_after_candidate_or_evidence_change')

    def test_duplicate_candidate_ids_rejected(self):
        bundle = acquisition_fixture()
        bundle['opportunities'].append(copy.deepcopy(bundle['opportunities'][0]))
        with self.assertRaises(growth.EvidenceError):
            growth.assess_opportunities(bundle)

    def test_brief_must_have_known_evidence_and_comparison(self):
        with self.assertRaises(growth.EvidenceError):
            growth.validate_brief({'target_url': 'https://game-ai-hub.vercel.app/'}, fixture())


if __name__ == '__main__':
    unittest.main()
