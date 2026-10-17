#!/usr/bin/env python3
"""Offline, provenance-preserving growth diagnostics. No API, network or write to site."""
import argparse
import hashlib
import json
import math
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit


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
    for key, source in sources.items():
        require(all(source.get(x) for x in ('locator', 'retrieved_at', 'method', 'coverage')), f'{key}: incomplete provenance')
    for key, period in periods.items():
        require(date.fromisoformat(period['start']) <= date.fromisoformat(period['end']), f'{key}: reversed dates')
        require(period.get('timezone'), f'{key}: missing timezone status')
    ids = set()
    dimension_keys = set()
    for row in bundle['observations']:
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
        require(row.get('quality'), f"{row['id']}: missing quality status")
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


def assess_opportunities(bundle):
    """Choose a narrow useful action from cited findings, not traffic totals alone.

    Explicit policy: verified access blocker; observed unmet task; intent mismatch;
    otherwise investigate/retain. Within a class prefer observed page-query evidence,
    then an observed existing page, and a smaller implementation. No effect score.
    """
    evidence = {r['id']: r for r in bundle['observations']}
    valid_ids = set(evidence) | set(bundle['sources'])
    assessed = []
    action = {'blocked': 'restore_access', 'missing': 'complete_reader_task',
              'mismatch': 'align_intent', 'complete': 'retain', 'unknown': 'investigate'}
    order = {'restore_access': 0, 'complete_reader_task': 1, 'align_intent': 2, 'investigate': 3, 'retain': 4}
    size = {'section': 0, 'article': 1, 'redesign': 2}
    for candidate in bundle.get('opportunities', []):
        require(urlsplit(candidate['target_url']).netloc == urlsplit(bundle['site']).netloc, 'opportunity targets another host')
        for field in ('reader_question', 'current_location', 'finding', 'proposed_change'):
            require(bool(candidate.get(field)), f'opportunity missing {field}')
        refs = candidate['evidence']
        require(refs and set(refs) <= valid_ids, 'opportunity lacks known evidence')
        require(candidate['coverage'] in action, 'unknown coverage')
        require(candidate['change_size'] in size, 'unknown implementation size')
        require(candidate.get('finding_status') in ('verified', 'hypothesis'), 'finding needs verification state')
        chosen = action[candidate['coverage']] if candidate['finding_status'] == 'verified' else 'investigate'
        observed = []
        for ref in refs:
            if ref not in evidence:
                continue
            row = evidence[ref]
            if set(row['quality']) & {'api_failure', 'delayed', 'unknown'}:
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
        assessed.append({**candidate, 'action': chosen, 'observed_connection': ['page_query', 'page', 'unconnected'][strength],
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
        require(candidate.get('delta_status') in ('verified', 'duplicates_existing', 'unverified'), 'acquisition needs explicit existing-content delta status')
        require(candidate.get('delta_description'), 'acquisition needs a concrete existing/new artifact comparison')
        if candidate['finding_status'] == 'verified' and candidate['coverage'] in ('missing', 'mismatch') and candidate['delta_status'] == 'verified':
            acquisition.append(candidate['id'])
    return {'policy': 'Verified access blocker > observed unmet reader task > observed intent mismatch; prefer direct page-query evidence then existing page and narrower change. This is an inspectable editorial policy, not an impact score. Acquisition experiments require separately cited demand, owned asset, incremental value and distribution; existing search counts are not a market ceiling.',
            'first_action': next((r['id'] for r in assessed if r['action'] not in ('retain', 'investigate') and not r.get('acquisition_evidence')), None),
            'acquisition_experiments': acquisition,
            'primary_experiment': acquisition[0] if len(acquisition) == 1 else None,
            'candidates': assessed}


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
        'reported_search_totals': [r for r in rows if r['scope'] in ('sc_property_total', 'sc_page_total', 'sc_query_total')],
        'query_coverage': coverage, 'table_reconciliation': reconciliation, 'warnings': warnings,
        'definitions': {'pv': 'GA screenPageViews; repeated page/history events, not readers', 'active_users': 'GA active users; non-additive across rows, not proven external humans', 'clicks': 'Search Console Google search clicks, not GA sessions', 'missing': 'null = not observed; 0 = reported zero', 'hub_transition': 'requires matched sessions/actual link opens, never article PV / hub PV'},
    }


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
    return {'contract': 'pass', 'meaning': 'Required fields and evidence IDs exist; does not certify strategy correctness.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('evidence', type=Path)
    parser.add_argument('--brief', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        payload = args.evidence.read_bytes()
        bundle = json.loads(payload)
        repo = Path(__file__).resolve().parents[2]
        if bundle.get('synthetic') is not True:
            require(not args.evidence.resolve().is_relative_to(repo), 'private evidence must stay outside the public repository')
            require(args.output is not None and not args.output.resolve().is_relative_to(repo), 'private diagnostics require --output outside the public repository')
            require(args.brief is None or not args.brief.resolve().is_relative_to(repo), 'private brief must stay outside the public repository')
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
