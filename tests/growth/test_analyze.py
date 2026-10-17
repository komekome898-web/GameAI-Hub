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

    def test_same_traffic_different_primary_findings_changes_action(self):
        bundle = fixture()
        candidate = {'id': 'save-to-play', 'target_url': bundle['site'] + '/articles/example-a/',
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
        bundle['opportunities'] = [{'id': 'runnable-example', 'target_url': bundle['site'] + '/articles/example-a/',
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
        bundle['opportunities'] = [{'id': 'missing-step', 'target_url': bundle['site'] + '/articles/example-a/',
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

    def test_acquisition_requires_new_value_and_can_expand_beyond_current_queries(self):
        bundle = fixture()
        candidate = {'id': 'new-reader-case', 'target_url': bundle['site'] + '/articles/example-a/',
            'reader_question': 'Can someone with only a phone build beyond a toy?', 'current_location': 'Existing case study',
            'finding': 'Verified synthetic sources show unmet environment and repair questions',
            'proposed_change': 'Use owned playable work with a concrete repair example and existing distribution',
            'delta_status': 'verified', 'delta_description': 'Synthetic comparison: current text lacks the new traceable repair artifact',
            'evidence': ['synthetic'], 'coverage': 'missing', 'finding_status': 'verified', 'change_size': 'article',
            'acquisition_evidence': {key: ['synthetic'] for key in ['reader_demand', 'owned_asset', 'incremental_value', 'distribution_route']}}
        bundle['opportunities'] = [candidate]
        self.assertEqual(growth.assess_opportunities(bundle)['primary_experiment'], 'new-reader-case')
        candidate['delta_status'] = 'duplicates_existing'
        self.assertIsNone(growth.assess_opportunities(bundle)['primary_experiment'])
        candidate['delta_status'] = 'verified'
        candidate['coverage'] = 'complete'
        self.assertIsNone(growth.assess_opportunities(bundle)['primary_experiment'])
        candidate['acquisition_evidence'].pop('incremental_value')
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

    def test_brief_must_have_known_evidence_and_comparison(self):
        with self.assertRaises(growth.EvidenceError):
            growth.validate_brief({'target_url': 'https://game-ai-hub.vercel.app/'}, fixture())


if __name__ == '__main__':
    unittest.main()
