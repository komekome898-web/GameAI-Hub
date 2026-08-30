'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { track } from '@/lib/analytics';
import type { Service } from '@/lib/schema';
import { serviceCategoryLabels as categoryLabels } from '@/lib/service-labels';
import { hasDocumentedCommercialUse, verificationStatusLabel } from '@/lib/verification-status';

const goalGroups = [
  {
    id: 'production', label: '制作する', goals: [
      ['code', 'コード'], ['ui', 'UI'], ['character', 'キャラクター'], ['2d', '2D画像'],
      ['3d', '3Dモデル'], ['animation', 'アニメーション'],
    ],
  },
  {
    id: 'story-audio', label: '音・物語を作る', goals: [
      ['voice', '声'], ['music', 'BGM'], ['sfx', '効果音'], ['npc', 'NPC会話'], ['localization', '翻訳'],
    ],
  },
  {
    id: 'quality-release', label: '品質を上げて公開する', goals: [
      ['test', 'テスト'], ['trailer', 'トレーラー'], ['store', 'ストア素材'],
    ],
  },
] as const;

const goalCategories: Record<string, string[]> = {
  code: ['coding-agent', 'ide-ai', 'general-llm'],
  ui: ['2d-image', 'concept-art', 'no-code-low-code'],
  character: ['character-consistency', 'concept-art', '2d-image', '3d-model'],
  '2d': ['2d-image', 'concept-art', 'texture-material'],
  '3d': ['3d-model', 'texture-material', 'rigging'],
  animation: ['animation', 'rigging'],
  voice: ['voice'], music: ['music'], sfx: ['sfx'], npc: ['npc-dialogue', 'general-llm'],
  localization: ['localization'], test: ['qa-testing'], trailer: ['video-trailer'], store: ['marketing-store-assets'],
};

const goalLabels = Object.fromEntries(
  goalGroups.flatMap((group) => group.goals.map(([id, label]) => [id, label])),
) as Record<string, string>;

const filterKeys = ['goal', 'q', 'category', 'engine', 'free', 'commercial', 'api', 'verified'] as const;

export function ToolsExplorer({ services, initialCategory }: { services: Service[]; initialCategory?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const engines = useMemo(() => [...new Set(services.flatMap((service) => service.engines))].sort(), [services]);
  const categories = useMemo(() => [...new Set(services.map((service) => service.category))].sort(), [services]);
  const allowedGoals = useMemo(() => new Set(Object.keys(goalCategories)), []);

  const rawGoal = searchParams.get('goal') ?? 'all';
  const rawCategory = searchParams.get('category') ?? initialCategory ?? 'all';
  const rawEngine = searchParams.get('engine') ?? 'all';
  const goal = allowedGoals.has(rawGoal) ? rawGoal : 'all';
  const category = categories.includes(rawCategory as Service['category']) ? rawCategory : 'all';
  const engine = engines.includes(rawEngine) ? rawEngine : 'all';
  const queryParam = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(queryParam);
  const free = searchParams.get('free') === '1';
  const commercial = ['yes|conditional', '1'].includes(searchParams.get('commercial') ?? '');
  const api = searchParams.get('api') === '1';
  const verified = searchParams.get('verified') === '1';

  const replaceFilters = useCallback((updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') next.delete(key);
      else next.set(key, value);
    });
    const nextQuery = next.toString();
    startTransition(() => router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false }));
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const syncQueryFromHistory = () => setQuery(new URLSearchParams(window.location.search).get('q') ?? '');
    window.addEventListener('popstate', syncQueryFromHistory);
    return () => window.removeEventListener('popstate', syncQueryFromHistory);
  }, []);

  useEffect(() => {
    if (query === queryParam) return;
    const timeout = window.setTimeout(() => replaceFilters({ q: query }), 180);
    return () => window.clearTimeout(timeout);
  }, [query, queryParam, replaceFilters]);

  function reset() {
    setQuery('');
    const next = new URLSearchParams(searchParams.toString());
    filterKeys.forEach((key) => next.delete(key));
    const nextQuery = next.toString();
    startTransition(() => router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false }));
  }

  const shown = useMemo(
    () => services
      .filter((service) =>
        (goal === 'all' || goalCategories[goal]?.includes(service.category)) &&
        (category === 'all' || service.category === category) &&
        (!query || `${service.name} ${service.summary} ${service.primaryUses.join(' ')}`
          .toLocaleLowerCase('ja').includes(query.trim().toLocaleLowerCase('ja'))) &&
        (!free || service.freePlan === 'yes') &&
        (!commercial || hasDocumentedCommercialUse(service)) &&
        (!api || service.api === 'yes') &&
        (!verified || service.verificationStatus === 'verified') &&
        (engine === 'all' || service.engines.includes(engine)))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [api, category, commercial, engine, free, goal, query, services, verified],
  );

  const activeFilters = [
    goal !== 'all' ? {
      id: 'goal',
      label: `成果物: ${goalLabels[goal] ?? goal}`,
      clear: () => replaceFilters({ goal: null }),
    } : null,
    query ? { id: 'q', label: `検索: ${query}`, clear: () => { setQuery(''); replaceFilters({ q: null }); } } : null,
    category !== 'all' ? {
      id: 'category', label: `カテゴリ: ${categoryLabels[category as Service['category']]}`,
      clear: () => replaceFilters({ category: null }),
    } : null,
    engine !== 'all' ? { id: 'engine', label: `利用環境: ${engine}`, clear: () => replaceFilters({ engine: null }) } : null,
    free ? { id: 'free', label: '無料枠あり', clear: () => replaceFilters({ free: null }) } : null,
    commercial ? {
      id: 'commercial', label: '商用条件の公式情報あり', clear: () => replaceFilters({ commercial: null }),
    } : null,
    api ? { id: 'api', label: 'APIあり', clear: () => replaceFilters({ api: null }) } : null,
    verified ? {
      id: 'verified', label: '公式資料確認済み', clear: () => replaceFilters({ verified: null }),
    } : null,
  ].filter((item): item is { id: string; label: string; clear: () => void } => Boolean(item));

  const hasAdvancedFilters = category !== 'all' || engine !== 'all' || free || commercial || api || verified;

  return (
    <>
      <div className="filter-panel tool-search-panel">
        <div className="filter-copy"><span>QUICK SEARCH</span><strong>名前・用途からすぐ探す</strong></div>
        <label htmlFor="tool-search">
          ツールを検索
          <input
            id="tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="例: Unity、音声、プロトタイプ"
            autoComplete="off"
            aria-describedby="tool-search-help"
          />
        </label>
        <p id="tool-search-help">名称・説明・主な用途を横断して検索します。</p>
      </div>

      <div className="goal-groups" aria-labelledby="goal-picker-title">
        <div className="goal-picker-heading">
          <p className="section-label">DELIVERABLE FIRST</p>
          <h2 id="goal-picker-title">次に作るものから絞る</h2>
          <button type="button" className="button ghost" aria-pressed={goal === 'all'} onClick={() => replaceFilters({ goal: null })}>
            すべて表示
          </button>
        </div>
        {goalGroups.map((group) => (
          <fieldset className="goal-picker" key={group.id}>
            <legend>{group.label}</legend>
            {group.goals.map(([id, name]) => (
              <button key={id} type="button" aria-pressed={goal === id} onClick={() => replaceFilters({ goal: id })}>
                {name}
              </button>
            ))}
          </fieldset>
        ))}
      </div>

      <details className="secondary-filters" open={hasAdvancedFilters || undefined}>
        <summary>料金・公式情報・利用環境で絞り込む</summary>
        <div>
          <label>
            カテゴリ
            <select value={category} onChange={(event) => replaceFilters({ category: event.target.value })}>
              <option value="all">すべてのカテゴリ</option>
              {categories.map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}
            </select>
          </label>
          <label>
            利用環境
            <select value={engine} onChange={(event) => replaceFilters({ engine: event.target.value })}>
              <option value="all">すべての利用環境</option>
              {engines.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label><input type="checkbox" checked={free} onChange={(event) => replaceFilters({ free: event.target.checked ? '1' : null })}/>無料枠あり</label>
          <label><input type="checkbox" checked={commercial} onChange={(event) => replaceFilters({ commercial: event.target.checked ? 'yes|conditional' : null })}/>商用条件の公式情報あり</label>
          <label><input type="checkbox" checked={api} onChange={(event) => replaceFilters({ api: event.target.checked ? '1' : null })}/>APIあり</label>
          <label><input type="checkbox" checked={verified} onChange={(event) => replaceFilters({ verified: event.target.checked ? '1' : null })}/>公式資料確認済みのみ</label>
          <small>「商用条件あり」は無条件の商用利用可を意味しません。各サービスの公式規約を確認してください。</small>
        </div>
      </details>

      {activeFilters.length > 0 && (
        <div className="active-filter-summary" aria-label="適用中の絞り込み">
          <strong>適用中</strong>
          {activeFilters.map((filter) => (
            <button key={filter.id} type="button" className="button ghost" onClick={filter.clear}>{filter.label}を解除</button>
          ))}
          <button type="button" className="button ghost" onClick={reset}>すべて解除</button>
        </div>
      )}

      <div className="results-head">
        <p aria-live="polite" aria-busy={isPending}><strong>{shown.length}</strong> 件の候補{isPending ? 'を更新中' : ''}</p>
        <span>制作順から決めるなら <Link href="/project">Project Generatorへ</Link></span>
      </div>

      <div className="tool-rows">
        {shown.map((service) => (
          <article key={service.id}>
            <div className="tool-rank"><span>{categoryLabels[service.category]}</span><small>{goal === 'all' ? '調査候補' : '用途カテゴリ一致'}</small></div>
            <div><h2><Link href={`/tools/${service.slug}`}>{service.name}</Link></h2><p>{service.summary}</p></div>
            <dl>
              <div><dt>無料</dt><dd>{label(service.freePlan)}</dd></div>
              <div><dt>商用</dt><dd>{label(service.commercialUse)}</dd></div>
              <div><dt>API</dt><dd>{label(service.api)}</dd></div>
              <div><dt>公式資料</dt><dd>{verificationStatusLabel(service.verificationStatus)}</dd></div>
            </dl>
            <div className="tool-row-actions">
              <Link href={`/tools/${service.slug}`}>根拠と制約</Link>
              <Link href={`/compare?ids=${service.slug}`} onClick={() => track('compare_start', { services: [service.slug], page: '/tools' })}>比較する</Link>
            </div>
          </article>
        ))}
      </div>

      {!shown.length && (
        <div className="no-results">
          <strong>条件に合う候補がありません</strong>
          <p>公式情報が未確認・条件付きの項目を除外している可能性があります。</p>
          <button className="button ghost" onClick={reset}>条件を解除</button>
        </div>
      )}
    </>
  );
}

export const label = (value: string) =>
  ({ yes: 'あり', no: 'なし', conditional: '条件付き', unknown: '不明', not_applicable: '対象外' })[value] ?? value;
