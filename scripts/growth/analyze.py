#!/usr/bin/env python3
"""Offline, provenance-preserving growth diagnostics. No API, network or write to site."""
import argparse
import hashlib
import json
import math
import subprocess
from decimal import Decimal, InvalidOperation, ROUND_CEILING
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit


QUALITY_FLAGS = {
    'observed', 'synthetic', 'api_failure', 'delayed', 'unknown',
    'unreconciled_testing', 'metric_scope_pending_confirmation', 'history_changes',
    'page_aggregation', 'partial_query_coverage', 'selected_rows',
    'native_search_source', 'direct_zero_engagement_majority',
    'session_source_attributed_pageviews_not_landing_sessions',
}
SOURCE_KINDS = {
    'measurement_report', 'reader_feedback', 'demand_research',
    'repository_source', 'owned_publication', 'execution_result',
    'independent_review', 'distribution_observation', 'competitor_document',
    'primary_document', 'commercial_terms', 'financial_record', 'cost_estimate', 'approval_record',
}
ROLE_KINDS = {
    'reader_demand': {'reader_feedback', 'demand_research'},
    'owned_asset': {'repository_source', 'owned_publication'},
    'incremental_value': {'repository_source', 'execution_result', 'independent_review'},
    'distribution_route': {'distribution_observation', 'owned_publication'},
}


class EvidenceError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise EvidenceError(message)


def count(value, field):
    require(value is None or (type(value) is int and value >= 0), f'{field}: expected nonnegative integer or null')


def validate(bundle):
    require(bundle.get('version') == 1, 'unsupported evidence version')
    require(bundle.get('site') == 'https://game-ai-hub.vercel.app', 'wrong site')
    sources = bundle['sources']
    periods = bundle['periods']
    require(isinstance(sources, dict) and isinstance(periods, dict) and isinstance(bundle.get('observations'), list), 'sources/periods must be objects and observations an array')
    for key, source in sources.items():
        require(isinstance(source, dict), f'{key}: source must be an object')
        require(all(source.get(x) for x in ('locator', 'retrieved_at', 'method', 'coverage')), f'{key}: incomplete provenance')
        if source.get('evidence_kind') is not None:
            require(isinstance(source['evidence_kind'], str) and source['evidence_kind'] in SOURCE_KINDS, f'{key}: unknown evidence kind')
        if source.get('observed_text') is not None:
            require(isinstance(source['observed_text'], str) and bool(source['observed_text'].strip()), f'{key}: invalid observed_text')
            require(source.get('observed_text_sha256') == hashlib.sha256(source['observed_text'].encode()).hexdigest(), f'{key}: observed text hash mismatch')
    for key, period in periods.items():
        require(date.fromisoformat(period['start']) <= date.fromisoformat(period['end']), f'{key}: reversed dates')
        require(period.get('timezone'), f'{key}: missing timezone status')
    ids = set()
    dimension_keys = set()
    for row in bundle['observations']:
        require(isinstance(row, dict), 'observation must be an object')
        require(row['id'] not in ids, f"duplicate observation {row['id']}")
        ids.add(row['id'])
        require(row['source'] in sources, f"{row['id']}: missing source")
        require(row['period'] in periods, f"{row['id']}: missing period")
        require(row.get('scope') in {'sc_page', 'sc_query', 'sc_page_query', 'sc_page_total', 'sc_query_total', 'sc_property_total', 'ga_site', 'ga_article_total', 'ga_hub', 'ga_home', 'ga_page', 'ga_event', 'ga_source_report'}, f"{row['id']}: unknown scope")
        require(isinstance(row.get('dimensions'), dict) and all(isinstance(v, str) for v in row['dimensions'].values()), 'invalid dimensions')
        dimension_key = (row['source'], row['period'], row['scope'], tuple(sorted(row['dimensions'].items())))
        require(dimension_key not in dimension_keys, f"duplicate dimensions in {row['scope']}")
        dimension_keys.add(dimension_key)
        if 'page' in row['dimensions']:
            require(row['dimensions']['page'].startswith('/') and not row['dimensions']['page'].startswith('//'), 'page must be a relative path on the configured site')
        required_dimensions = {'sc_page': {'page'}, 'sc_query': {'query'}, 'sc_page_query': {'page', 'query'}}.get(row['scope'])
        require(required_dimensions is None or set(row['dimensions']) == required_dimensions, 'scope/dimension mismatch')
        if row['scope'].startswith('sc_'):
            require({'clicks', 'impressions', 'position'} <= row['metrics'].keys(), 'search metrics must be explicit; use null for missing')
        quality = row.get('quality')
        require(isinstance(quality, list) and bool(quality) and all(isinstance(q, str) and q in QUALITY_FLAGS for q in quality), f"{row['id']}: quality must be a nonempty array of known status tokens")
        for metric, value in row['metrics'].items():
            if metric == 'position':
                require(value is None or (type(value) in (int, float) and math.isfinite(value) and value >= 0), 'invalid position')
            else:
                count(value, metric)
        if 'clicks' in row['metrics']:
            require('impressions' in row['metrics'], 'clicks require explicit impressions, including null')
            c, i = row['metrics']['clicks'], row['metrics']['impressions']
            require(c is None or i is None or c <= i, 'clicks exceed impressions')
        if row['scope'] == 'sc_page_query':
            require(set(row['dimensions']) == {'page', 'query'}, 'joined evidence requires BOTH observed dimensions')
    reviews = bundle.get('reviews', [])
    require(isinstance(reviews, list) and all(isinstance(r, dict) for r in reviews), 'reviews must be an array of objects')
    require(len({r.get('id') for r in reviews}) == len(reviews), 'duplicate review id')
    return bundle


def ctr(row):
    require(row['scope'] in ('sc_page', 'sc_query', 'sc_page_query', 'sc_page_total', 'sc_query_total', 'sc_property_total'), 'CTR needs a Search Console row')
    c, i = (row['metrics'].get(k) for k in ('clicks', 'impressions'))
    return c / i if c is not None and i is not None and i > 0 else None


def compatible(rows):
    require(bool(rows), 'no rows')
    for key in ('source', 'period', 'scope'):
        require(len({row[key] for row in rows}) == 1, f'incompatible {key}')
    require(len({tuple(sorted(row['dimensions'].items())) for row in rows}) == len(rows), 'duplicate dimensions')


def aggregate_search(rows):
    compatible(rows)
    require(all(row['scope'] in ('sc_page', 'sc_query', 'sc_page_query') for row in rows), 'not search detail rows')
    metrics = {}
    for key in ('clicks', 'impressions'):
        values = [r['metrics'].get(key) for r in rows]
        metrics[key] = sum(values) if all(v is not None for v in values) else None
    # Position weights are impression counts, never the number of rows.
    metrics['position'] = None
    if metrics['impressions'] and all(r['metrics'].get('position') is not None for r in rows):
        metrics['position'] = sum(r['metrics']['position'] * r['metrics']['impressions'] for r in rows) / metrics['impressions']
    metrics['ctr'] = metrics['clicks'] / metrics['impressions'] if metrics['clicks'] is not None and metrics['impressions'] else None
    return metrics


def observed_pairs(bundle):
    # No Cartesian join between separate page and query exports.
    return [r for r in bundle['observations'] if r['scope'] == 'sc_page_query']


def page_query_coverage(bundle):
    """Visible literal query rows only; absence never becomes an invented query."""
    groups = {}
    for row in observed_pairs(bundle):
        key = (row['source'], row['period'], row['dimensions']['page'])
        groups.setdefault(key, []).append(row)
    pages = {(r['source'], r['period'], r['dimensions']['page']): r
             for r in bundle['observations'] if r['scope'] == 'sc_page'}
    result = []
    for key, rows in groups.items():
        page = pages.get(key)
        partial = aggregate_search(rows)
        eligible = all(recommendation_eligibility(r, key[1])['eligible'] for r in rows)
        eligible = eligible and page is not None and recommendation_eligibility(page, key[1])['eligible']
        checks = {metric: partial[metric] <= page['metrics'][metric]
                  if eligible and partial[metric] is not None and page['metrics'][metric] is not None else None
                  for metric in ('clicks', 'impressions')}
        result.append({'source': key[0], 'period': key[1], 'page': key[2],
                       'literal_query_evidence': [r['id'] for r in rows],
                       'visible_literal_row_count': len(rows), 'visible_partial_sum': partial,
                       'page_evidence': page['id'] if page else None,
                       'reported_page_metrics': page['metrics'] if page else None,
                       'comparison_eligible': bool(eligible), 'within_page_counts': checks,
                       'status': 'compatible_partial_coverage' if eligible and all(v is True for v in checks.values())
                                 else 'inspect_count_compatibility' if eligible else 'unmatched_or_ineligible',
                       'interpretation': 'Partial visible literal query rows; equality is not required. Anonymization, omitted rows and aggregation may differ. No residual is assigned to unseen queries. Source metadata is retained unchanged.'})
    return result


def git_root(path):
    """Discover an actual checkout, including worktrees; no assumed directory depth."""
    directory = path.resolve()
    while not directory.is_dir() and directory != directory.parent:
        directory = directory.parent
    try:
        result = subprocess.run(['git', '-C', str(directory), 'rev-parse', '--show-toplevel'],
                                capture_output=True, text=True, check=False)
    except FileNotFoundError:
        # Without git, existing checkout markers still protect files conservatively.
        return next((p for p in (directory, *directory.parents) if (p / '.git').exists()), None)
    return Path(result.stdout.strip()).resolve() if result.returncode == 0 else None


def protect_private_paths(evidence, output, brief=None, public_repo_root=None, script=None):
    require(output is not None, 'private diagnostics require --output outside the public repository')
    paths = [evidence, output] + ([brief] if brief is not None else [])
    roots = set()
    for path in [script or Path(__file__), *paths]:
        lexical_parent = path.absolute().parent
        directories = [lexical_parent, path.resolve().parent]
        # A directory symlink may leave the checkout before git sees it.
        directories.extend(p for p in (lexical_parent, *lexical_parent.parents) if (p / '.git').exists())
        roots.update(root for directory in directories if (root := git_root(directory)) is not None)
    if public_repo_root is not None:
        root = public_repo_root.resolve()
        require(git_root(root) == root, '--public-repo-root must name an actual Git checkout root')
        roots.add(root)
    for path in paths:
        # Check lexical and resolved locations: neither a repo symlink to private data
        # nor an external symlink into a checkout is an allowed private path.
        locations = (path.absolute(), path.resolve())
        require(not any(location.is_relative_to(root) for root in roots for location in locations),
                'private evidence, brief and diagnostics must stay outside Git repositories')


def cohort_rate(numerator, denominator):
    """Only explicit matched-cohort action rates; never divide arbitrary GA PV."""
    for key in ('source', 'period', 'host', 'cohort_id', 'unit'):
        require(numerator.get(key) and numerator.get(key) == denominator.get(key), f'incompatible rate {key}')
    require(numerator['unit'] in ('sessions', 'users'), 'rate requires matched sessions/users, not PV')
    require(numerator.get('status') == denominator.get('status') == 'observed', 'rate needs observed data')
    require(numerator.get('subset_of') == denominator.get('id'), 'numerator must be an explicitly verified subset')
    for item in (numerator, denominator):
        count(item.get('value'), 'rate value')
    n, d = numerator.get('value'), denominator.get('value')
    require(n is None or d is None or n <= d, 'subset exceeds cohort')
    return n / d if n is not None and d is not None and d else None


def recommendation_eligibility(row, target_period):
    """Metric eligibility only; does not infer reader intent or a cause from prose."""
    reasons = []
    if row['period'] != target_period:
        reasons.append('period_mismatch')
    reasons.extend(sorted(set(row['quality']) & {
        'api_failure', 'delayed', 'unknown', 'unreconciled_testing',
        'metric_scope_pending_confirmation', 'history_changes',
    }))
    pv, users = row['metrics'].get('pv'), row['metrics'].get('active_users')
    if pv is not None and users is not None and users > pv:
        reasons.append('PV_USER_SCOPE')
    if row.get('status', 'observed') != 'observed':
        reasons.append('not_observed')
    return {'eligible': not reasons, 'reasons': reasons}


def review_input_digest(bundle, candidate):
    refs = set(candidate['evidence'])
    for values in candidate.get('acquisition_evidence', {}).values():
        refs.update(values)
    observations = {row['id']: row for row in bundle['observations']}
    inputs = {ref: observations[ref] if ref in observations else bundle['sources'][ref] for ref in sorted(refs)}
    source_ids = {observations[ref]['source'] for ref in refs if ref in observations}
    linked_sources = {ref: bundle['sources'][ref] for ref in sorted(source_ids)}
    payload = {'candidate': candidate, 'period': bundle['periods'][candidate['target_period']], 'evidence': inputs, 'linked_measurement_sources': linked_sources}
    return hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def acquisition_reference_eligibility(bundle, observations, ref, role, target_period):
    if ref in observations:
        row = observations[ref]
        result = recommendation_eligibility(row, target_period)
        reasons = list(result['reasons'])
        if role != 'reader_demand' or row['scope'] != 'sc_page_query':
            reasons.append('metric_cannot_substitute_for_role_document')
        if row['metrics'].get('impressions') is None or row['metrics'].get('impressions', 0) <= 0:
            reasons.append('no_observed_query_demand')
        return {'eligible': not reasons, 'reasons': reasons}
    source = bundle['sources'][ref]
    reasons = []
    if source.get('evidence_kind') not in ROLE_KINDS[role]:
        reasons.append('wrong_evidence_kind_for_role')
    text = source.get('observed_text')
    if not isinstance(text, str) or not text.strip():
        reasons.append('missing_source_content')
    elif source.get('observed_text_sha256') != hashlib.sha256(text.encode()).hexdigest():
        reasons.append('source_content_hash_mismatch')
    return {'eligible': not reasons, 'reasons': reasons}


def acquisition_review_status(bundle, candidate):
    record = next((r for r in bundle.get('reviews', []) if r.get('id') == candidate.get('independent_review_id')), None)
    if record is None:
        return {'supported': False, 'reason': 'requires_independent_primary_source_review'}
    if record.get('candidate_id') != candidate['id'] or record.get('verdict') != 'supported':
        return {'supported': False, 'reason': 'review_not_supporting_candidate'}
    if not record.get('reviewer') or not record.get('producer') or record['reviewer'] == record['producer']:
        return {'supported': False, 'reason': 'review_not_independent'}
    source = bundle['sources'].get(record.get('review_source'), {})
    text = source.get('observed_text')
    if source.get('evidence_kind') != 'independent_review' or not isinstance(text, str) or not text.strip() or source.get('observed_text_sha256') != hashlib.sha256(text.encode()).hexdigest():
        return {'supported': False, 'reason': 'review_requires_retained_source_content'}
    if record.get('reviewed_input_sha256') != review_input_digest(bundle, candidate):
        return {'supported': False, 'reason': 'review_stale_after_candidate_or_evidence_change'}
    return {'supported': True, 'reason': 'independent_review_record_matches_inputs', 'review_id': record['id']}


def assess_opportunities(bundle):
    """Choose a narrow useful action from cited findings, not traffic totals alone.

    Explicit policy: verified access blocker; observed unmet task; intent mismatch;
    otherwise investigate/retain. Within a class prefer observed page-query evidence,
    then an observed existing page, and a smaller implementation. No effect score.
    """
    evidence = {r['id']: r for r in bundle['observations']}
    valid_ids = set(evidence) | set(bundle['sources'])
    assessed = []
    original_candidates = {}
    action = {'blocked': 'restore_access', 'missing': 'complete_reader_task',
              'mismatch': 'align_intent', 'complete': 'retain', 'unknown': 'investigate'}
    order = {'restore_access': 0, 'complete_reader_task': 1, 'align_intent': 2, 'investigate': 3, 'retain': 4}
    size = {'section': 0, 'article': 1, 'redesign': 2}
    for candidate in bundle.get('opportunities', []):
        require(urlsplit(candidate['target_url']).netloc == urlsplit(bundle['site']).netloc, 'opportunity targets another host')
        for field in ('reader_question', 'current_location', 'finding', 'proposed_change'):
            require(bool(candidate.get(field)), f'opportunity missing {field}')
        require(candidate['id'] not in original_candidates, 'duplicate candidate id')
        original_candidates[candidate['id']] = candidate
        target_period = candidate.get('target_period')
        require(target_period in bundle['periods'], 'candidate requires a known target_period')
        refs = candidate['evidence']
        require(refs and set(refs) <= valid_ids, 'opportunity lacks known evidence')
        require(candidate['coverage'] in action, 'unknown coverage')
        require(candidate['change_size'] in size, 'unknown implementation size')
        require(candidate.get('finding_status') in ('verified', 'hypothesis'), 'finding needs verification state')
        chosen = action[candidate['coverage']] if candidate['finding_status'] == 'verified' else 'investigate'
        observed = []
        eligibility = {}
        for ref in refs:
            if ref not in evidence:
                continue
            row = evidence[ref]
            eligibility[ref] = recommendation_eligibility(row, target_period)
            if not eligibility[ref]['eligible']:
                continue
            reach = row['metrics'].get('impressions') if row['scope'].startswith('sc_') else row['metrics'].get('pv')
            if reach is not None and reach > 0:
                observed.append(row)
        # Reach strength means actual observed connection, not forecast audience size.
        path = urlsplit(candidate['target_url']).path.rstrip('/')
        connected = [r for r in observed if r['dimensions'].get('page', '').rstrip('/') == path]
        strength = 0 if any(r['scope'] == 'sc_page_query' for r in connected) else 1 if any(r['scope'] in ('sc_page', 'ga_page') for r in connected) else 2
        if strength == 2 and chosen not in ('retain', 'investigate'):
            chosen = 'investigate'
        assessed.append({**candidate, 'metric_evidence_eligibility': eligibility, 'action': chosen, 'observed_connection': ['page_query', 'page', 'unconnected'][strength],
                         '_order': (order[chosen], strength, size[candidate['change_size']])})
    assessed.sort(key=lambda item: item['_order'])
    for item in assessed:
        item.pop('_order')
    acquisition = []
    for candidate in assessed:
        package = candidate.get('acquisition_evidence')
        if not package:
            continue
        require(set(package) == {'reader_demand', 'owned_asset', 'incremental_value', 'distribution_route'}, 'acquisition requires demand, asset, incremental value and distribution evidence')
        require(all(refs and set(refs) <= valid_ids for refs in package.values()), 'unknown acquisition evidence')
        acquisition_eligibility = {}
        for role, refs in package.items():
            usable = []
            rejected = {}
            for ref in refs:
                check = acquisition_reference_eligibility(bundle, evidence, ref, role, candidate['target_period'])
                if check['eligible']:
                    usable.append(ref)
                else:
                    rejected[ref] = check['reasons']
            acquisition_eligibility[role] = {'usable_refs': usable, 'rejected_observations': rejected}
        candidate['acquisition_evidence_eligibility'] = acquisition_eligibility
        role_kinds = {bundle['sources'][ref].get('evidence_kind') for ref in acquisition_eligibility['incremental_value']['usable_refs'] if ref in bundle['sources']}
        artifact_backed_delta = bool(role_kinds & {'repository_source', 'execution_result'})
        candidate['incremental_value_has_concrete_artifact'] = artifact_backed_delta
        review = acquisition_review_status(bundle, original_candidates[candidate['id']])
        candidate['independent_review_eligibility'] = review
        require(candidate.get('delta_status') in ('verified', 'duplicates_existing', 'unverified'), 'acquisition needs explicit existing-content delta status')
        require(candidate.get('delta_description'), 'acquisition needs a concrete existing/new artifact comparison')
        if candidate['finding_status'] == 'verified' and candidate['coverage'] in ('missing', 'mismatch') and candidate['delta_status'] == 'verified' and all(r['usable_refs'] for r in acquisition_eligibility.values()) and artifact_backed_delta and review['supported']:
            acquisition.append(candidate['id'])
    output = {'policy': 'Verified access blocker > observed unmet reader task > observed intent mismatch; prefer direct page-query evidence then existing page and narrower change. Metric evidence must match target_period and pass quality checks; failed/delayed/unknown/unreconciled testing, history and PV_USER_SCOPE evidence is excluded. This routes analyst-declared findings, not semantic diagnosis from primary text or an impact score. Acquisition experiments require separately cited demand, owned asset, incremental value and distribution; existing search counts are not a market ceiling.',
            'first_action': next((r['id'] for r in assessed if r['action'] not in ('retain', 'investigate') and not r.get('acquisition_evidence')), None),
            'acquisition_experiments': acquisition,
            'primary_experiment': acquisition[0] if len(acquisition) == 1 else None,
            'candidates': assessed}
    if bundle.get('decision_objective') == 'profitability':
        output['reader_task_first_action'] = output.pop('first_action')
        output['reader_acquisition_primary_experiment'] = output.pop('primary_experiment')
        output['recommendation_scope'] = 'Reader utility/acquisition only. These are not profitability recommendations; compare commercial cases in the private brief.'
    return output


def diagnose(bundle):
    validate(bundle)
    rows = bundle['observations']
    warnings = []
    for row in rows:
        for state in ('api_failure', 'delayed', 'unknown'):
            if state in row['quality']:
                warnings.append({'code': state.upper(), 'evidence': [row['id']], 'action': 'Preserve observation state separately from measured zero.'})
        if any(v is None for v in row['metrics'].values()):
            warnings.append({'code': 'MISSING', 'evidence': [row['id']], 'action': 'Keep null; request the named metric, never replace with zero.'})
        pv, users = row['metrics'].get('pv'), row['metrics'].get('active_users')
        if pv is not None and users is not None and users > pv:
            warnings.append({'code': 'PV_USER_SCOPE', 'evidence': [row['id']], 'action': 'Inspect metric/dimension scope and collection. Do not infer bots, popularity or a reader conversion rate.'})
        if row['scope'] == 'ga_hub' and 'history_changes' in row['quality']:
            warnings.append({'code': 'HISTORY_PV', 'evidence': [row['id']], 'action': 'PV includes history changes; use same-cohort sessions and actual article opens for hub transition analysis.'})
        if 'unreconciled_testing' in row['quality']:
            warnings.append({'code': 'TRAFFIC_QUALITY', 'evidence': [row['id']], 'action': 'Keep observed totals; split owner/test traffic before interpreting real-reader growth.'})
        if row['scope'].startswith('sc_') and row['metrics'].get('clicks') == 0 and row['metrics'].get('impressions', 0):
            n = row['metrics']['impressions']
            warnings.append({'code': 'ZERO_CLICKS', 'evidence': [row['id']], 'action': 'Inspect intent and current result alternatives before choosing a change.', 'zero_click_upper_95_iid_diagnostic': 1 - 0.05 ** (1 / n), 'assumption': 'Descriptive binomial sensitivity only; repeated impressions/query mix violate independent identical trials. Not a forecast or title diagnosis.'})
    coverage = []
    reconciliation = []
    for source, period in sorted({(r['source'], r['period']) for r in rows if r['scope'].startswith('sc_')}):
        selected = [r for r in rows if r['source'] == source and r['period'] == period]
        totals = {r['scope']: r for r in selected if r['scope'].endswith('_total')}
        if 'sc_page_total' in totals and 'sc_query_total' in totals:
            coverage.append({'source': source, 'period': period, 'page': totals['sc_page_total']['metrics'],
                             'query': totals['sc_query_total']['metrics'], 'comparable': False,
                             'reason': 'Different aggregation/visible query coverage; do not subtract or infer hidden query demand.'})
        for scope in ('sc_page', 'sc_query'):
            details = [r for r in selected if r['scope'] == scope]
            total = totals.get(scope + '_total')
            if details and total:
                aggregated = aggregate_search(details)
                match = {k: aggregated[k] == total['metrics'].get(k) if aggregated[k] is not None and total['metrics'].get(k) is not None else None for k in ('clicks', 'impressions')}
                reconciliation.append({'source': source, 'period': period, 'scope': scope, 'row_count': len(details),
                                       'sum': aggregated, 'reported_total': total['metrics'], 'matches': match})
                if False in match.values():
                    warnings.append({'code': 'TABLE_TOTAL_MISMATCH', 'evidence': [total['id']],
                                     'action': 'Check omitted rows, source freshness and transcription. Never silently scale rows to total.'})
    return {
        'version': 1, 'sources': bundle['sources'], 'periods': bundle['periods'], 'observations': rows,
        'opportunity_assessment': assess_opportunities(bundle),
        'search_pages': [{'evidence': r['id'], 'dimensions': r['dimensions'], 'metrics': r['metrics'], 'ctr': ctr(r), 'source': r['source'], 'period': r['period'], 'quality': r['quality']} for r in rows if r['scope'] == 'sc_page'],
        'observed_page_query_pairs': observed_pairs(bundle),
        'page_query_coverage': page_query_coverage(bundle),
        'reported_search_totals': [r for r in rows if r['scope'] in ('sc_property_total', 'sc_page_total', 'sc_query_total')],
        'query_coverage': coverage, 'table_reconciliation': reconciliation, 'warnings': warnings,
        'profitability_analysis': profitability_cases(bundle),
        'definitions': {'pv': 'GA screenPageViews; repeated page/history events, not readers', 'active_users': 'GA active users; non-additive across rows, not proven external humans', 'clicks': 'Search Console Google search clicks, not GA sessions', 'missing': 'null = not observed; 0 = reported zero', 'hub_transition': 'requires matched sessions/actual link opens, never article PV / hub PV'},
    }


def commercial_quantity(item, unit, bundle, states=None):
    """Typed inputs: contract terms, observations, assumptions and unknowns stay distinct."""
    require(isinstance(item, dict), 'commercial quantity must be an object')
    state = item.get('state')
    require(state in (states or {'contractual', 'observed', 'assumption', 'unknown'}), 'invalid commercial quantity state')
    require(item.get('unit') == unit, 'commercial unit/currency mismatch')
    refs = item.get('evidence')
    require(isinstance(refs, list) and all(isinstance(r, str) and r in bundle['sources'] for r in refs), 'invalid commercial source references')
    require(isinstance(item.get('basis'), str) and bool(item['basis'].strip()), 'commercial quantity requires basis or missing reason')
    if state == 'unknown':
        require(item.get('value') is None, 'unknown commercial value must be null')
        return None
    require(isinstance(item.get('value'), str), 'commercial decimal values must be explicit strings')
    try:
        value = Decimal(item['value'])
    except InvalidOperation:
        raise EvidenceError('invalid commercial decimal') from None
    require(value.is_finite() and value >= 0, 'commercial value must be finite and nonnegative')
    if state in ('contractual', 'observed'):
        require(bool(refs), 'contract/observation requires retained evidence')
        kinds = {'commercial_terms'} if state == 'contractual' else {'financial_record', 'measurement_report'}
        for ref in refs:
            source = bundle['sources'][ref]
            text = source.get('observed_text')
            require(source.get('evidence_kind') in kinds and isinstance(text, str) and bool(text.strip())
                    and source.get('observed_text_sha256') == hashlib.sha256(text.encode()).hexdigest(),
                    'contract/observation requires appropriate retained source content and hash')
    if unit == 'fraction':
        require(value <= 1, 'fraction exceeds one')
    if unit in ('outcomes', 'periods', 'readers'):
        require(value == value.to_integral_value(), 'count must be an integer')
    return value


def commercial_case_digest(bundle, case):
    refs = set()
    def visit(value):
        if isinstance(value, dict):
            for field in ('evidence', 'offering_evidence', 'authorization_evidence'):
                if isinstance(value.get(field), list):
                    refs.update(value[field])
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)
    visit(case)
    payload = {'business_scope': bundle.get('business_scope'), 'case': case, 'periods': {id: bundle['periods'][id] for id in sorted({case['period'], case['actuals']['period']})},
               'sources': {ref: bundle['sources'][ref] for ref in sorted(refs)}}
    return hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def profitability_cases(bundle):
    objective = bundle.get('decision_objective', 'reader_growth')
    require(objective in ('reader_growth', 'profitability'), 'unknown decision objective')
    cases = bundle.get('profitability_cases', [])
    require(isinstance(cases, list), 'profitability_cases must be an array')
    ids = set()
    candidates = {c['id'] for c in bundle.get('opportunities', [])}
    results = []
    def render(value):
        return str(value) if value is not None else None
    for case in cases:
        require(isinstance(case, dict) and isinstance(case.get('id'), str) and case['id'] not in ids, 'invalid/duplicate commercial case')
        ids.add(case['id'])
        require(case.get('candidate_id') is None or case['candidate_id'] in candidates, 'unknown commercial candidate')
        require(case.get('period') in bundle['periods'], 'commercial case needs explicit horizon period')
        currency = case.get('currency')
        require(isinstance(currency, str) and len(currency) == 3 and currency.isalpha() and currency.isupper(), 'commercial currency must be explicit')
        require(case.get('revenue_source') in ('affiliate', 'ads', 'own_product', 'service', 'none'), 'unknown revenue source')
        require(case.get('availability') in ('available', 'pending', 'unavailable', 'unknown'), 'revenue availability required')
        require(isinstance(bundle.get('business_scope'), str) and bool(bundle['business_scope'].strip()), 'commercial cases require business_scope')
        attribution = case.get('revenue_attribution')
        require(isinstance(attribution, dict) and attribution.get('business') and attribution.get('basis')
                and attribution.get('recognition') in ('included', 'excluded', 'unknown')
                and attribution.get('settlement') in ('cash', 'noncash_credit', 'unknown')
                and isinstance(attribution.get('evidence'), list)
                and all(ref in bundle['sources'] for ref in attribution['evidence']), 'explicit revenue business/settlement attribution required')
        require(attribution['recognition'] != 'included' or attribution['business'] == bundle['business_scope'],
                'another business revenue cannot be included in site revenue')
        if case['revenue_source'] == 'own_product':
            product = case.get('product_status')
            require(isinstance(product, dict) and product.get('state') in ('unprovided', 'prototype_only', 'offered')
                    and product.get('sales_authorization') in ('approved', 'not_requested', 'unknown'), 'own product needs provision and sales authorization states')
            require(case['availability'] != 'available' or (product['state'] == 'offered' and product['sales_authorization'] == 'approved'),
                    'unprovided/prototype/unapproved product cannot be available')
            if case['availability'] == 'available':
                for field, kind in (('offering_evidence', 'owned_publication'), ('authorization_evidence', 'approval_record')):
                    refs = product.get(field)
                    require(isinstance(refs, list) and bool(refs), 'available own product requires offering and sales approval evidence')
                    for ref in refs:
                        source = bundle['sources'].get(ref, {})
                        text = source.get('observed_text')
                        require(source.get('evidence_kind') == kind and isinstance(text, str) and bool(text.strip())
                                and source.get('observed_text_sha256') == hashlib.sha256(text.encode()).hexdigest(),
                                'available own product needs appropriate retained offering/approval records')

        for field in ('buyer_problem', 'conversion_path', 'terms_conditions', 'opportunity_cost', 'adoption_conditions'):
            require(bool(case.get(field)), f'commercial case missing {field}')
        # Descriptive fields require cited sources; their meaning is reviewed separately.
        for field in ('buyer_problem', 'terms_conditions', 'opportunity_cost', 'adoption_conditions'):
            packet = case[field]
            require(isinstance(packet, dict) and bool(packet.get('text')) and isinstance(packet.get('evidence'), list)
                    and all(ref in bundle['sources'] for ref in packet['evidence']), 'commercial narrative needs text and source references')
        require(isinstance(case['conversion_path'], list), 'conversion_path must be an array')
        for stage in case['conversion_path']:
            require(isinstance(stage, dict) and stage.get('stage') and stage.get('status') in ('implemented', 'observed', 'unknown', 'missing')
                    and isinstance(stage.get('evidence'), list) and all(ref in bundle['sources'] for ref in stage['evidence']), 'invalid conversion stage')
        require(case.get('cost_scope'), 'commercial case needs production and maintenance cost scope')
        costs = case['costs']
        cash = commercial_quantity(costs['future_cash'], currency, bundle, {'contractual', 'assumption', 'unknown'})
        hours = commercial_quantity(costs['future_hours'], 'hours', bundle, {'assumption', 'unknown'})
        wage = commercial_quantity(costs['hourly_value'], currency + '/hour', bundle, {'contractual', 'assumption', 'unknown'})
        variable = commercial_quantity(costs['per_outcome'], currency, bundle, {'contractual', 'assumption', 'unknown'})
        outcome_hours = commercial_quantity(costs['per_outcome_hours'], 'hours', bundle, {'assumption', 'unknown'})
        require(costs.get('per_outcome_stage') in ('approved', 'paid'), 'variable cost needs approved/paid outcome stage')
        if 'sunk_cash' in costs:
            commercial_quantity(costs['sunk_cash'], currency, bundle)
        model = case['reward_model']
        require(model.get('accrual_horizon') == 'within_case_period', 'reward accrual must be limited to case horizon')
        require(model.get('outcome_stage') in ('approved', 'paid'), 'reward needs approved/paid outcome stage')
        require(costs['per_outcome_stage'] == model['outcome_stage'], 'reward and variable cost outcome stages differ')
        if model.get('kind') == 'fixed':
            reward = commercial_quantity(model['amount'], currency, bundle)
        else:
            require(model.get('kind') == 'revenue_share', 'unknown reward model')
            basis = model['eligible_sale_basis']
            require(isinstance(basis, dict) and all(isinstance(basis.get(k), str) and basis[k].strip()
                    for k in ('plan', 'price_basis', 'discount_basis', 'excluded_components', 'recurrence_basis')), 'rate reward requires eligible sale/plan/discount/recurrence basis')
            rate = commercial_quantity(model['rate'], 'fraction', bundle, {'contractual', 'assumption', 'unknown'})
            if 'sale_schedule' in model:
                schedule = model['sale_schedule']
                require(isinstance(schedule, list) and bool(schedule), 'sale schedule needs explicit phases')
                require('eligible_sale_per_period' not in model and 'commission_periods' not in model,
                        'use either phased schedule or uniform sale periods, not both')
                phase_totals = []
                phase_ids = set()
                for phase in schedule:
                    require(phase.get('id') and phase['id'] not in phase_ids and phase.get('basis'), 'sale phase needs unique id and discount/renewal basis')
                    phase_ids.add(phase['id'])
                    sale = commercial_quantity(phase['eligible_sale'], currency, bundle)
                    periods = commercial_quantity(phase['periods'], 'periods', bundle, {'contractual', 'assumption', 'unknown'})
                    phase_totals.append(sale * periods if sale is not None and periods is not None else None)
                eligible_total = sum(phase_totals) if all(value is not None for value in phase_totals) else None
            else:
                sale = commercial_quantity(model['eligible_sale_per_period'], currency, bundle)
                periods = commercial_quantity(model['commission_periods'], 'periods', bundle, {'contractual', 'assumption', 'unknown'})
                eligible_total = sale * periods if sale is not None and periods is not None else None
            reward = rate * eligible_total if rate is not None and eligible_total is not None else None
        if attribution['settlement'] != 'cash':
            reward = None  # Credits/unknown settlement are not converted into cash earnings.
        actuals = case.get('actuals', {})
        require(isinstance(actuals, dict) and actuals.get('period') in bundle['periods'], 'actuals need explicit observation period')
        for key, unit in (('eligible_readers', 'readers'), ('approved_count', 'outcomes'), ('paid_count', 'outcomes'), ('paid_revenue', currency)):
            require(key in actuals, f'actuals must explicitly preserve {key}, including unknown')
            commercial_quantity(actuals[key], unit, bundle, {'observed', 'unknown'})
            if key in ('approved_count', 'paid_count', 'paid_revenue') and actuals[key]['state'] == 'observed':
                require(all(bundle['sources'][ref].get('evidence_kind') == 'financial_record' for ref in actuals[key]['evidence']), 'approved/paid outcomes and paid revenue need financial records, not analytics proxies')
        economic_cost = cash + hours * wage if all(v is not None for v in (cash, hours, wage)) else None
        margin = reward - variable if reward is not None and variable is not None else None
        economic_margin = margin - outcome_hours * wage if all(v is not None for v in (margin, outcome_hours, wage)) else None
        def threshold(cost, unit_margin):
            return int((cost / unit_margin).to_integral_value(rounding=ROUND_CEILING)) if cost is not None and unit_margin is not None and unit_margin > 0 else None
        cash_count, economic_count = threshold(cash, margin), threshold(economic_cost, economic_margin)
        scenarios = case.get('reader_scenarios', [])
        require(isinstance(scenarios, list), 'reader_scenarios must be an array')
        sensitivity = []
        for scenario in scenarios:
            require(scenario.get('id'), 'scenario requires id')
            readers = commercial_quantity(scenario['eligible_readers'], 'readers', bundle, {'assumption', 'observed', 'unknown'})
            sensitivity.append({'id': scenario['id'], 'input': scenario['eligible_readers'],
                                'cash_required_outcome_rate': render(Decimal(cash_count) / readers) if readers and cash_count is not None else None,
                                'economic_required_outcome_rate': render(Decimal(economic_count) / readers) if readers and economic_count is not None else None,
                                'meaning': 'Integer required outcomes / eligible readers, not predicted CVR. Rates above one indicate infeasibility if at most one modeled outcome per reader.'})
        results.append({'id': case['id'], 'candidate_id': case.get('candidate_id'), 'period': case['period'], 'currency': currency,
                        'input_case': case, 'input_digest': commercial_case_digest(bundle, case),
                        'calculation_kind': 'conditional_input_arithmetic_not_earnings_guarantee',
                        'outcome_stage': model['outcome_stage'], 'approved_is_not_paid': True,
                        'recognized_site_paid_revenue': actuals['paid_revenue']['value'] if attribution['recognition'] == 'included' and attribution['settlement'] == 'cash' and actuals['paid_revenue']['state'] == 'observed' else None,
                        'revenue_attribution': attribution,
                        'reward_per_outcome': render(reward), 'margin_per_outcome': render(margin), 'economic_margin_per_outcome': render(economic_margin),
                        'per_outcome_hours': render(outcome_hours),
                        'future_cash_cost': render(cash), 'future_hours': render(hours), 'economic_cost': render(economic_cost),
                        'cash_break_even_outcomes': cash_count, 'economic_break_even_outcomes': economic_count,
                        'unknown_or_nonpositive_margin': margin is None or margin <= 0,
                        'economic_cost_formula': 'future_cash + future_hours * hourly_value; sunk costs excluded',
                        'economic_cost_symbolic': f"{render(cash) if cash is not None else 'C'} + {render(hours) if hours is not None else 'H'} * {render(wage) if wage is not None else 'w'}",
                        'break_even_formula': 'cash: ceil(future_cash/(reward-variable_cash)); economic: ceil((future_cash+fixed_hours*wage)/(reward-variable_cash-variable_hours*wage)); same outcome stage only',
                        'reader_sensitivity': sensitivity,
                        'interpretation': 'Only the named outcome stage is modeled. Approved outcomes do not establish paid outcomes or cash recovery. Contract terms do not establish sales, retention, approval or payment. Missing values remain null. No automatic economic ranking.'})
    return {'objective': objective, 'cases': results, 'recommended_case': None,
            'selection': 'Independent evidence-backed decision in private brief; arithmetic/contract pass does not establish strategic superiority.'}


def validate_profitability_decision(decision, bundle):
    require(isinstance(decision, dict), 'profitability brief requires explicit economic comparison')
    results = profitability_cases(bundle)
    cases = {case['id']: case for case in results['cases']}
    require(decision.get('status') in ('maintain', 'change', 'bounded_research'), 'economic decision status required')
    compared = decision.get('comparison')
    require(isinstance(compared, list) and len(compared) >= 2, 'compare current strategy and a commercial alternative')
    ids = [item.get('case_id') for item in compared]
    require(len(set(ids)) == len(ids) and set(ids) <= set(cases), 'invalid/duplicate compared commercial case')
    require(decision.get('previous_case_id') in ids, 'comparison must include previous strategy')
    comparable = len({cases[id]['currency'] for id in ids}) == 1 and len({json.dumps(bundle['periods'][cases[id]['period']], sort_keys=True) for id in ids}) == 1
    if not comparable:
        basis = decision.get('comparison_basis', {})
        require(decision.get('status') == 'bounded_research' and decision.get('selected_role') == 'research'
                and basis.get('kind') == 'qualitative_research_priority' and basis.get('reason')
                and basis.get('no_cross_currency_profit_ranking') is True,
                'economic comparison requires same currency/horizon or explicit qualitative bounded research without cross-unit profit ranking')
    require(decision.get('selected_role') in ('limited_profitability_test', 'business_core', 'research'),
            'distinguish a limited profitability test from a business core or research')
    selected = decision.get('selected_case_id')
    require(selected in ids or (selected is None and decision['status'] == 'bounded_research'), 'selected commercial case must be compared')
    require(decision['status'] != 'maintain' or selected == decision['previous_case_id'], 'maintain must select prior strategy')
    require(decision['status'] != 'change' or selected != decision['previous_case_id'], 'change must select another strategy')
    if selected is not None:
        chosen = cases[selected]['input_case']
        attribution = chosen['revenue_attribution']
        require(attribution['business'] == bundle['business_scope'] and attribution['recognition'] != 'excluded', 'cannot select another business as site profitability strategy')
        if decision['selected_role'] == 'business_core':
            require(chosen['availability'] == 'available' and attribution['recognition'] == 'included'
                    and attribution['settlement'] == 'cash', 'business core requires available attributable cash revenue path')
        if chosen['revenue_source'] == 'own_product' and chosen['availability'] != 'available':
            require(decision['status'] == 'bounded_research' and decision['selected_role'] == 'research', 'unprovided product is a research candidate, not an available business')

    for item in compared:
        require(item.get('reason') and isinstance(item.get('evidence'), list)
                and all(ref in bundle['sources'] for ref in item['evidence']), 'comparison needs reasoning and known evidence')
    for field in ('opportunity_cost', 'reversal_conditions', 'next_evidence_action'):
        require(bool(decision.get(field)), f'economic decision missing {field}')
    if decision['status'] == 'bounded_research':
        require(bool(decision.get('research_budget')), 'bounded research requires explicit time/cash bound, unknown is not unlimited')
    review = next((r for r in bundle.get('reviews', []) if r.get('id') == decision.get('independent_review_id')), None)
    require(review is not None and review.get('verdict') == 'supported' and review.get('reviewer')
            and review.get('producer') and review['reviewer'] != review['producer'], 'economic selection requires independent review')
    source = bundle['sources'].get(review.get('review_source'), {})
    text = source.get('observed_text')
    require(source.get('evidence_kind') == 'independent_review' and isinstance(text, str) and bool(text.strip())
            and source.get('observed_text_sha256') == hashlib.sha256(text.encode()).hexdigest(), 'economic review requires retained independent source')
    digest = economic_decision_digest(bundle, decision)
    require(review.get('reviewed_economic_decision_sha256') == digest, 'economic review stale or missing decision/case/source digest')
    return digest


def economic_decision_digest(bundle, decision):
    """Fingerprint for a real independent reviewer, not an automatic review verdict."""
    cases = {case['id']: case for case in profitability_cases(bundle)['cases']}
    ids = [item['case_id'] for item in decision['comparison']]
    refs = {ref for item in decision['comparison'] for ref in item['evidence']}
    payload = {'objective': bundle.get('decision_objective'), 'decision': decision,
               'case_digests': {id: cases[id]['input_digest'] for id in ids},
               'comparison_sources': {ref: bundle['sources'][ref] for ref in sorted(refs)}}
    return hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def validate_brief(brief, bundle):
    """Structural evidence contract; human source review remains independently required."""
    validate(bundle)
    ids = {r['id'] for r in bundle['observations']} | set(bundle['sources'])
    for key in ('target_url', 'reader_problem', 'changes', 'reader_value', 'effort', 'mechanism', 'alternatives', 'observation_plan', 'reversal_condition', 'evidence'):
        require(bool(brief.get(key)), f'brief missing {key}')
    require(brief['target_url'].startswith(bundle['site'] + '/'), 'brief targets another site')
    require(set(brief['evidence']) <= ids, 'brief references unknown evidence')
    require(len(brief['alternatives']) >= 3, 'compare search, navigation/content and distribution choices')
    for alternative in brief['alternatives']:
        require(all(alternative.get(k) for k in ('option', 'decision', 'reason', 'evidence')), 'incomplete alternative')
        require(set(alternative['evidence']) <= ids, 'unknown alternative evidence')
    require(brief.get('effect_estimate') is None, 'numerical effect prediction requires a separately reviewed model')
    if bundle.get('decision_objective') == 'profitability':
        validate_profitability_decision(brief.get('profitability_decision'), bundle)
    return {'contract': 'pass', 'meaning': 'Required fields and evidence IDs exist; does not certify strategy correctness.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('evidence', type=Path)
    parser.add_argument('--brief', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--public-repo-root', type=Path, help='Optional actual checkout root when running a private extracted snapshot')
    args = parser.parse_args()
    try:
        payload = args.evidence.read_bytes()
        bundle = json.loads(payload)
        if bundle.get('synthetic') is not True:
            protect_private_paths(args.evidence, args.output, args.brief, args.public_repo_root)
        result = diagnose(bundle)
        result['input_sha256'] = hashlib.sha256(payload).hexdigest()
        if args.brief:
            result['brief_validation'] = validate_brief(json.loads(args.brief.read_text()), bundle)
        rendered = json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
        if args.output:
            require(args.output.resolve() != args.evidence.resolve() and (args.brief is None or args.output.resolve() != args.brief.resolve()), 'output must not overwrite evidence or brief')
            args.output.write_text(rendered)
        else:
            print(rendered, end='')
    except (EvidenceError, KeyError, ValueError) as error:
        parser.exit(2, f'Invalid growth evidence: {error}\n')


if __name__ == '__main__':
    main()
