"""Synthetic arithmetic and evidence contracts; no actual revenue or strategic proof."""
import copy
import hashlib
import json
import unittest
from pathlib import Path
from test_analyze import fixture, growth, acquisition_fixture


def quantity(value, unit, state='assumption', evidence=None):
    return {'state': state, 'value': value, 'unit': unit,
            'basis': 'Synthetic explicit scenario input; not an observed site result.',
            'evidence': evidence or []}


def commercial_fixture():
    bundle = fixture()
    bundle['decision_objective'] = 'profitability'
    bundle['business_scope'] = 'fictional-publication'
    for id, kind in [('terms', 'commercial_terms'), ('ledger', 'financial_record'), ('review', 'independent_review')]:
        text = 'Synthetic ' + kind + '; fictional fixture, not an actual agreement or account.'
        bundle['sources'][id] = {**bundle['sources']['synthetic'], 'evidence_kind': kind,
                                 'observed_text': text, 'observed_text_sha256': hashlib.sha256(text.encode()).hexdigest()}
    packet = {'text': 'Synthetic analyst statement; source-reading review remains required.', 'evidence': ['synthetic']}
    case = {'id': 'current', 'candidate_id': None, 'period': 'test', 'currency': 'USD',
            'revenue_source': 'affiliate', 'availability': 'pending',
            'revenue_attribution': {'business': 'fictional-publication', 'recognition': 'included', 'settlement': 'cash', 'basis': 'Synthetic publication revenue only', 'evidence': ['synthetic']},
            'buyer_problem': packet, 'terms_conditions': packet, 'opportunity_cost': packet,
            'adoption_conditions': packet, 'conversion_path': [{'stage': 'reader to paid outcome', 'status': 'unknown', 'evidence': []}],
            'cost_scope': 'Synthetic future creation and maintenance within test horizon; paid ledger separate.',
            'costs': {'future_cash': quantity('100', 'USD'), 'future_hours': quantity('5', 'hours'),
                      'hourly_value': quantity(None, 'USD/hour', 'unknown'), 'per_outcome': quantity('2', 'USD'),
                      'per_outcome_hours': quantity('0', 'hours'),
                      'per_outcome_stage': 'approved', 'sunk_cash': quantity('9999', 'USD')},
            'reward_model': {'kind': 'fixed', 'accrual_horizon': 'within_case_period', 'outcome_stage': 'approved',
                             'amount': quantity('12', 'USD', 'contractual', ['terms'])},
            'actuals': {'period': 'test', 'eligible_readers': quantity(None, 'readers', 'unknown'),
                        'approved_count': quantity(None, 'outcomes', 'unknown'), 'paid_count': quantity(None, 'outcomes', 'unknown'),
                        'paid_revenue': quantity(None, 'USD', 'unknown')},
            'reader_scenarios': [{'id': 'explicit-hypothesis', 'eligible_readers': quantity('100', 'readers')}]}
    bundle['profitability_cases'] = [copy.deepcopy(case)]
    return bundle


def decision_fixture(bundle):
    other = copy.deepcopy(bundle['profitability_cases'][0])
    other['id'] = 'alternative'
    bundle['profitability_cases'].append(other)
    decision = {'status': 'bounded_research', 'previous_case_id': 'current', 'selected_case_id': None,
                'comparison': [{'case_id': id, 'reason': 'Synthetic tradeoff', 'evidence': ['synthetic']} for id in ['current', 'alternative']],
                'opportunity_cost': 'Synthetic forgone alternative', 'reversal_conditions': 'Synthetic new evidence',
                'next_evidence_action': 'Read terms before ranking', 'research_budget': 'Synthetic 1 hour, no expenditure',
                'independent_review_id': 'economic-review', 'selected_role': 'research'}
    bundle['reviews'] = [{'id': 'economic-review', 'reviewer': 'other-test-reviewer', 'producer': 'test-producer',
                          'verdict': 'supported', 'review_source': 'review',
                          'reviewed_economic_decision_sha256': growth.economic_decision_digest(bundle, decision)}]
    return decision


class ProfitabilityTests(unittest.TestCase):
    def test_contract_approved_threshold_is_not_paid_revenue(self):
        bundle = commercial_fixture()
        result = growth.diagnose(bundle)
        economics = result['profitability_analysis']
        self.assertIsNone(economics['recommended_case'])
        case = economics['cases'][0]
        self.assertEqual(case['cash_break_even_outcomes'], 10)
        self.assertEqual(case['outcome_stage'], 'approved')
        self.assertTrue(case['approved_is_not_paid'])
        self.assertIsNone(case['input_case']['actuals']['paid_revenue']['value'])
        self.assertIsNone(case['economic_cost'])
        self.assertIsNone(case['economic_break_even_outcomes'])
        self.assertEqual(case['future_hours'], '5')
        self.assertEqual(case['reader_sensitivity'][0]['cash_required_outcome_rate'], '0.1')
        self.assertNotIn('first_action', result['opportunity_assessment'])
        self.assertNotIn('primary_experiment', result['opportunity_assessment'])
        self.assertIn('reader_task_first_action', result['opportunity_assessment'])

    def test_hour_value_future_maintenance_and_sunk_cost(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['costs']['hourly_value'] = quantity('20', 'USD/hour')
        result = growth.profitability_cases(bundle)['cases'][0]
        self.assertEqual(result['economic_cost'], '200')
        self.assertEqual(result['economic_break_even_outcomes'], 20)
        case['costs']['future_hours']['value'] = '10'
        self.assertEqual(growth.profitability_cases(bundle)['cases'][0]['economic_break_even_outcomes'], 30)

    def test_rate_reward_uses_eligible_discounted_basis_and_periods_not_list_price(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['reward_model'] = {'kind': 'revenue_share', 'accrual_horizon': 'within_case_period', 'outcome_stage': 'approved',
                                'rate': quantity('0.25', 'fraction', 'contractual', ['terms']),
                                'eligible_sale_per_period': quantity('20', 'USD'), 'commission_periods': quantity('2', 'periods'),
                                'eligible_sale_basis': {'plan': 'Synthetic eligible plan', 'price_basis': 'eligible net sale, not list price',
                                                        'discount_basis': 'Synthetic discounted20; no actual sale', 'excluded_components': 'tax/refunds excluded',
                                                        'recurrence_basis': 'two hypothetical periods inside horizon, not lifetime guarantee'}}
        self.assertEqual(growth.profitability_cases(bundle)['cases'][0]['reward_per_outcome'], '10.00')
        case['reward_model']['commission_periods']['value'] = '1'
        self.assertEqual(growth.profitability_cases(bundle)['cases'][0]['reward_per_outcome'], '5.00')
        case['reward_model']['eligible_sale_per_period'] = quantity(None, 'USD', 'unknown')
        self.assertIsNone(growth.profitability_cases(bundle)['cases'][0]['cash_break_even_outcomes'])
        del case['reward_model']['eligible_sale_basis']['discount_basis']
        with self.assertRaises(growth.EvidenceError):
            growth.profitability_cases(bundle)

    def test_unknown_zero_negative_nan_currency_and_count_states(self):
        for mutate in [lambda c: c['costs']['future_cash'].update(value='NaN'),
                       lambda c: c['costs']['future_cash'].update(value='-1'),
                       lambda c: c['costs']['future_cash'].update(unit='JPY'),
                       lambda c: c['actuals']['paid_count'].update(state='assumption', value='4'),
                       lambda c: c['reward_model'].update(outcome_stage='paid')]:
            bundle = commercial_fixture()
            mutate(bundle['profitability_cases'][0])
            with self.assertRaises(growth.EvidenceError):
                growth.profitability_cases(bundle)
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['reward_model']['amount'] = quantity(None, 'USD', 'unknown')
        self.assertIsNone(growth.profitability_cases(bundle)['cases'][0]['reward_per_outcome'])
        case['reward_model']['amount'] = quantity('0', 'USD')
        self.assertTrue(growth.profitability_cases(bundle)['cases'][0]['unknown_or_nonpositive_margin'])
        self.assertIsNone(growth.profitability_cases(bundle)['cases'][0]['cash_break_even_outcomes'])

    def test_contract_and_observed_values_require_typed_retained_sources(self):
        bundle = commercial_fixture()
        bundle['profitability_cases'][0]['reward_model']['amount']['evidence'] = ['synthetic']
        with self.assertRaises(growth.EvidenceError):
            growth.profitability_cases(bundle)
        bundle = commercial_fixture()
        bundle['profitability_cases'][0]['actuals']['paid_revenue'] = quantity('0', 'USD', 'observed', ['ledger'])
        self.assertEqual(growth.profitability_cases(bundle)['cases'][0]['input_case']['actuals']['paid_revenue']['value'], '0')
        bundle['sources']['ledger']['evidence_kind'] = 'measurement_report'
        with self.assertRaises(growth.EvidenceError):
            growth.profitability_cases(bundle)

    def test_selection_requires_previous_alternative_and_bound_review(self):
        bundle = commercial_fixture()
        decision = decision_fixture(bundle)
        growth.validate_profitability_decision(decision, bundle)
        for field in ('comparison', 'next_evidence_action', 'research_budget', 'independent_review_id'):
            changed = copy.deepcopy(decision)
            changed.pop(field)
            with self.assertRaises(growth.EvidenceError):
                growth.validate_profitability_decision(changed, bundle)
        bundle['profitability_cases'][0]['costs']['future_cash']['value'] = '200'
        with self.assertRaises(growth.EvidenceError):
            growth.validate_profitability_decision(decision, bundle)

    def test_review_invalidates_changed_terms_or_decision(self):
        bundle = commercial_fixture()
        decision = decision_fixture(bundle)
        bundle['sources']['terms']['observed_text'] += ' changed conditions'
        bundle['sources']['terms']['observed_text_sha256'] = hashlib.sha256(bundle['sources']['terms']['observed_text'].encode()).hexdigest()
        with self.assertRaises(growth.EvidenceError):
            growth.validate_profitability_decision(decision, bundle)
        bundle = commercial_fixture()
        decision = decision_fixture(bundle)
        decision['opportunity_cost'] += ' changed'
        with self.assertRaises(growth.EvidenceError):
            growth.validate_profitability_decision(decision, bundle)

    def test_integer_outcome_rate_and_ga_proxy_rejection(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['costs']['future_cash']['value'] = '101'
        case['reader_scenarios'][0]['eligible_readers']['value'] = '10'
        result = growth.profitability_cases(bundle)['cases'][0]
        self.assertEqual(result['cash_break_even_outcomes'], 11)
        self.assertEqual(result['reader_sensitivity'][0]['cash_required_outcome_rate'], '1.1')
        bundle['sources']['ledger']['evidence_kind'] = 'measurement_report'
        for key in ('approved_count', 'paid_count'):
            case['actuals'][key] = quantity('1', 'outcomes', 'observed', ['ledger'])
            with self.assertRaises(growth.EvidenceError):
                growth.profitability_cases(bundle)
            case['actuals'][key] = quantity(None, 'outcomes', 'unknown')

    def test_comparison_requires_same_currency_horizon_and_role(self):
        for field, value in [('currency', 'EUR'), ('period', 'different')]:
            bundle = commercial_fixture()
            decision = decision_fixture(bundle)
            bundle['periods']['different'] = {'start': '2026-02-01', 'end': '2026-02-28', 'timezone': 'UTC'}
            if field == 'currency':
                # Change every currency-denominated unit too so rejection concerns comparison.
                case = bundle['profitability_cases'][1]
                case['currency'] = value
                for q in [case['costs'][key] for key in ['future_cash', 'hourly_value', 'per_outcome', 'sunk_cash']] + [case['reward_model']['amount'], case['actuals']['paid_revenue']]:
                    q['unit'] = q['unit'].replace('USD', value)
            else:
                bundle['profitability_cases'][1][field] = value
            with self.assertRaises(growth.EvidenceError):
                growth.validate_profitability_decision(decision, bundle)
        bundle = commercial_fixture()
        decision = decision_fixture(bundle)
        del decision['selected_role']
        with self.assertRaises(growth.EvidenceError):
            growth.validate_profitability_decision(decision, bundle)

    def test_actual_period_definition_is_bound_to_review(self):
        bundle = commercial_fixture()
        bundle['periods']['actual'] = {'start': '2025-12-01', 'end': '2025-12-31', 'timezone': 'UTC'}
        bundle['profitability_cases'][0]['actuals']['period'] = 'actual'
        decision = decision_fixture(bundle)
        growth.validate_profitability_decision(decision, bundle)
        bundle['periods']['actual']['timezone'] = 'unconfirmed boundary'
        with self.assertRaises(growth.EvidenceError):
            growth.validate_profitability_decision(decision, bundle)

    def test_single_three_twelve_period_scenarios_are_not_retention_claims(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['costs']['per_outcome'] = quantity('0', 'USD')
        case['reward_model'] = {'kind': 'revenue_share', 'outcome_stage': 'approved', 'accrual_horizon': 'within_case_period',
                                'rate': quantity('0.2', 'fraction'), 'eligible_sale_per_period': quantity('8', 'USD'),
                                'commission_periods': quantity('1', 'periods'),
                                'eligible_sale_basis': {k: 'Synthetic conditional scenario' for k in ['plan', 'price_basis', 'discount_basis', 'excluded_components', 'recurrence_basis']}}
        counts = []
        for periods in ('1', '3', '12'):
            case['reward_model']['commission_periods']['value'] = periods
            counts.append(growth.profitability_cases(bundle)['cases'][0]['cash_break_even_outcomes'])
        self.assertEqual(counts, [63, 21, 6])
        case['reward_model']['commission_periods'] = quantity(None, 'periods', 'unknown')
        self.assertIsNone(growth.profitability_cases(bundle)['cases'][0]['cash_break_even_outcomes'])

    def test_first_period_discount_schedule_is_not_uniform_renewal(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['costs']['per_outcome'] = quantity('0', 'USD')
        case['reward_model'] = {'kind': 'revenue_share', 'outcome_stage': 'approved', 'accrual_horizon': 'within_case_period',
                                'rate': quantity('0.2', 'fraction'),
                                'eligible_sale_basis': {k: 'Fictional discount/renewal phases' for k in ['plan', 'price_basis', 'discount_basis', 'excluded_components', 'recurrence_basis']},
                                'sale_schedule': [{'id': 'discount', 'basis': 'Fictional first period', 'eligible_sale': quantity('3', 'USD'), 'periods': quantity('1', 'periods')},
                                                  {'id': 'renewal', 'basis': 'Fictional two full renewals', 'eligible_sale': quantity('8', 'USD'), 'periods': quantity('2', 'periods')}]}
        result = growth.profitability_cases(bundle)['cases'][0]
        self.assertEqual(result['reward_per_outcome'], '3.8')
        self.assertEqual(result['cash_break_even_outcomes'], 27)
        case['reward_model']['sale_schedule'][1]['eligible_sale'] = quantity(None, 'USD', 'unknown')
        self.assertIsNone(growth.profitability_cases(bundle)['cases'][0]['reward_per_outcome'])

    def test_qualified_reader_acquisition_does_not_become_economic_recommendation(self):
        bundle = commercial_fixture()
        reader = acquisition_fixture()
        bundle['sources'].update(reader['sources'])
        bundle['opportunities'] = reader['opportunities']
        bundle['reviews'] = reader['reviews']
        result = growth.diagnose(bundle)
        self.assertEqual(result['opportunity_assessment']['reader_acquisition_primary_experiment'], 'new-reader-case')
        self.assertNotIn('primary_experiment', result['opportunity_assessment'])
        self.assertIsNone(result['profitability_analysis']['recommended_case'])

    def test_unprovided_product_is_not_available_or_business_core(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['revenue_source'] = 'own_product'
        case['product_status'] = {'state': 'prototype_only', 'sales_authorization': 'not_requested'}
        case['availability'] = 'unavailable'
        growth.profitability_cases(bundle)
        case['availability'] = 'available'
        with self.assertRaises(growth.EvidenceError):
            growth.profitability_cases(bundle)
        case['product_status'].update(state='offered', sales_authorization='approved')
        with self.assertRaises(growth.EvidenceError):
            growth.profitability_cases(bundle)  # Labels alone are insufficient.
        case['availability'] = 'unavailable'
        decision = decision_fixture(bundle)
        decision.update(status='maintain', selected_role='business_core', selected_case_id='current')
        with self.assertRaises(growth.EvidenceError):
            growth.validate_profitability_decision(decision, bundle)

    def test_offering_and_authorization_source_changes_invalidate_review(self):
        for changed in ('offering', 'authorization'):
            bundle = commercial_fixture()
            case = bundle['profitability_cases'][0]
            case.update(revenue_source='own_product', availability='available',
                        product_status={'state': 'offered', 'sales_authorization': 'approved',
                                        'offering_evidence': ['offering'], 'authorization_evidence': ['authorization']})
            for id, kind in [('offering', 'owned_publication'), ('authorization', 'approval_record')]:
                text = 'Fictional retained ' + id
                bundle['sources'][id] = {**bundle['sources']['synthetic'], 'evidence_kind': kind,
                    'observed_text': text, 'observed_text_sha256': hashlib.sha256(text.encode()).hexdigest()}
            decision = decision_fixture(bundle)
            growth.validate_profitability_decision(decision, bundle)
            text = 'Changed fictional ' + changed
            bundle['sources'][changed].update(observed_text=text,
                observed_text_sha256=hashlib.sha256(text.encode()).hexdigest())
            with self.assertRaises(growth.EvidenceError):
                growth.validate_profitability_decision(decision, bundle)

    def test_separate_game_revenue_and_noncash_credit_are_not_site_cash(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['actuals']['paid_revenue'] = quantity('400', 'USD', 'observed', ['ledger'])
        case['revenue_attribution'].update(business='another-game-business', recognition='included')
        with self.assertRaises(growth.EvidenceError):
            growth.profitability_cases(bundle)
        case['revenue_attribution']['recognition'] = 'excluded'
        result = growth.profitability_cases(bundle)['cases'][0]
        self.assertIsNone(result['recognized_site_paid_revenue'])
        self.assertEqual(result['input_case']['actuals']['paid_revenue']['value'], '400')
        case['revenue_attribution'].update(business=bundle['business_scope'], recognition='included', settlement='noncash_credit')
        self.assertIsNone(growth.profitability_cases(bundle)['cases'][0]['recognized_site_paid_revenue'])
        self.assertIsNone(growth.profitability_cases(bundle)['cases'][0]['reward_per_outcome'])

    def test_cross_currency_research_explicitly_forbids_profit_ranking(self):
        bundle = commercial_fixture()
        decision = decision_fixture(bundle)
        case = bundle['profitability_cases'][1]
        case['currency'] = 'JPY'
        for q in [case['costs'][key] for key in ['future_cash', 'hourly_value', 'per_outcome', 'sunk_cash']] + [case['reward_model']['amount'], case['actuals']['paid_revenue']]:
            q['unit'] = q['unit'].replace('USD', 'JPY')
        decision['comparison_basis'] = {'kind': 'qualitative_research_priority', 'reason': 'No exchange rate supplied; compare validation burden, not nominal returns', 'no_cross_currency_profit_ranking': True}
        bundle['reviews'][0]['reviewed_economic_decision_sha256'] = growth.economic_decision_digest(bundle, decision)
        growth.validate_profitability_decision(decision, bundle)
        decision['comparison_basis']['no_cross_currency_profit_ranking'] = False
        with self.assertRaises(growth.EvidenceError):
            growth.validate_profitability_decision(decision, bundle)

    def test_support_time_changes_economic_not_cash_break_even(self):
        bundle = commercial_fixture()
        case = bundle['profitability_cases'][0]
        case['costs']['hourly_value'] = quantity('20', 'USD/hour')
        case['costs']['per_outcome_hours'] = quantity('0.25', 'hours')
        result = growth.profitability_cases(bundle)['cases'][0]
        self.assertEqual(result['cash_break_even_outcomes'], 10)
        self.assertEqual(result['economic_margin_per_outcome'], '5.00')
        self.assertEqual(result['economic_break_even_outcomes'], 40)
        case['costs']['per_outcome_hours'] = quantity(None, 'hours', 'unknown')
        result = growth.profitability_cases(bundle)['cases'][0]
        self.assertIsNone(result['economic_break_even_outcomes'])
        self.assertEqual(result['cash_break_even_outcomes'], 10)

    def test_public_fixture_is_only_synthetic(self):
        fragment = json.loads((Path(__file__).resolve().parents[2] / 'scripts/growth/profitability.synthetic.json').read_text())
        self.assertNotIn('site', fragment)
        self.assertNotIn('observations', fragment)
        bundle = fixture()
        bundle.update(fragment)
        self.assertIs(bundle['synthetic'], True)
        self.assertEqual(growth.diagnose(bundle)['profitability_analysis']['cases'][0]['cash_break_even_outcomes'], 10)
