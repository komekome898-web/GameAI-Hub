'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { Service } from '@/lib/schema';
import { track } from '@/lib/analytics';
import { label } from './ToolsExplorer';
import { OutboundLink } from './OutboundLink';
import { beginnerBrowserToolDecision, stageForToolGoal, useProjectNavigationContext } from '@/lib/project/navigation-context';

const verificationLabel = (status: Service['verificationStatus']) => {
  if (status === 'verified') return '公式資料確認済み';
  if (status === 'partially_verified') return '一部の公式資料を確認';
  if (status === 'stale') return '公式資料の再確認が必要';
  return '公式資料を要確認';
};

const rows: [string, (service: Service) => string][] = [
  ['料金', (service) => service.pricing],
  ['無料枠', (service) => label(service.freePlan)],
  ['商用利用', (service) => label(service.commercialUse)],
  ['API', (service) => label(service.api)],
  ['ゲームエンジン', (service) => service.engines.join('、') || '不明'],
  ['サービス利用環境', (service) => service.platforms.join('、') || '不明'],
  ['主用途', (service) => service.primaryUses.join('、') || '不明'],
  ['長所', (service) => service.strengths.join('。') || '不明'],
  ['制約・弱点', (service) => service.weaknesses.join('。') || '不明'],
  [
    '公式資料の確認',
    (service) => verificationLabel(service.verificationStatus),
  ],
  ['最終確認日', (service) => service.lastVerified],
];

const normalize = (raw: string[], services: Service[]) =>
  [...new Set(raw)]
    .filter((id) => services.some((service) => service.slug === id))
    .slice(0, 4);

const viewedCompareKeys = new Set<string>();

function VerificationLinks({ service }: { service: Service }) {
  const checks: string[] = [];
  if (service.freePlan === 'unknown' || service.freePlan === 'conditional') {
    checks.push('無料枠の対象機能・利用上限');
  }
  if (
    service.commercialUse === 'unknown' ||
    service.commercialUse === 'conditional'
  ) {
    checks.push('生成時プランの商用利用条件・権利範囲');
  }
  if (service.api === 'unknown' || service.api === 'conditional') {
    checks.push('API提供有無・対象プラン・利用上限');
  }

  const sources = service.sources.filter(
    (source) => source.type === 'pricing' || source.type === 'terms',
  );
  if (!checks.length && !sources.length) return null;

  return (
    <div className="compare-verification">
      <strong>契約前の公式確認</strong>
      {checks.length > 0 && (
        <ul>
          {checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>
      )}
      <p>
        {sources.map((source, index) => (
          <span key={source.url}>
            {index > 0 ? ' / ' : ''}
            <a href={source.url} target="_blank" rel="noopener">
              {source.type === 'pricing' ? '公式料金' : '公式規約'} ↗
            </a>
          </span>
        ))}
      </p>
    </div>
  );
}

function ServiceDetailLink({
  service,
  children,
}: {
  service: Service;
  children?: ReactNode;
}) {
  return (
    <Link href={`/tools/${service.slug}`}>{children ?? service.name}</Link>
  );
}

function EvidenceLinks({ service, row }: { service: Service; row: string }) {
  if (!['主用途', '長所', '制約・弱点'].includes(row)) return null;
  const capabilitySources = service.capabilities.map(
    (capability) => capability.sourceUrl,
  );
  const officialSources = service.sources
    .filter((source) => source.type === 'official' || source.type === 'docs')
    .map((source) => source.url);
  const sourceUrl = [...capabilitySources, ...officialSources][0];

  return (
    <span className="compare-evidence-links">
      <ServiceDetailLink service={service}>詳細</ServiceDetailLink>
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener">
          公式根拠 ↗
        </a>
      )}
    </span>
  );
}

export function CompareClient(props: {
  services: Service[];
  initial?: string[];
}) {
  const params = useSearchParams();
  return <CompareClientState {...props} params={params} />;
}

function CompareClientState({
  services,
  initial,
  params,
}: {
  services: Service[];
  initial?: string[];
  params: Readonly<URLSearchParams>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const projectContext = useProjectNavigationContext();
  const paramsKey = params.toString();
  const raw = params.get('ids');
  const defaults = useMemo(() => initial ?? [], [initial]);
  const [ids, setIds] = useState(() =>
    normalize(
      raw === null ? defaults : raw.split(',').filter(Boolean),
      services,
    ),
  );
  const [differencesOnly, setDifferencesOnly] = useState(
    () => params.get('diff') === '1',
  );
  const [pickerQuery, setPickerQuery] = useState('');
  const [pickerOpen, setPickerOpen] = useState(ids.length < 2);

  const selected = useMemo(
    () =>
      ids
        .map((id) => services.find((service) => service.slug === id))
        .filter((service): service is Service => Boolean(service)),
    [ids, services],
  );
  const differenceCount = useMemo(
    () => rows.filter(([, get]) => new Set(selected.map(get)).size > 1).length,
    [selected],
  );
  const leadingDifferences = useMemo(
    () =>
      rows
        .filter(([, get]) => new Set(selected.map(get)).size > 1)
        .filter(([name, get]) => name !== '料金' || selected.some(service => /[¥￥$€]\s*\d|[0-9][0-9,.]*\s*(?:円|USD|ドル)/i.test(get(service))))
        .slice(0, 3)
        .map(([name, get]) => ({ name, values: selected.map(get) })),
    [selected],
  );
  const orderedRows = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          Number(new Set(selected.map(b[1])).size > 1) -
          Number(new Set(selected.map(a[1])).size > 1),
      ),
    [selected],
  );
  const visibleServices = useMemo(() => {
    const query = pickerQuery.trim().toLocaleLowerCase('ja');
    if (!query) return services;
    return services.filter((service) =>
      `${service.name} ${service.summary} ${service.primaryUses.join(' ')} ${service.category}`
        .toLocaleLowerCase('ja')
        .includes(query),
    );
  }, [pickerQuery, services]);

  const stage = params.get('stage') ?? stageForToolGoal[params.get('goal') ?? ''];
  const validStage = stage && compareStageCategories[stage] ? stage : null;
  const beginnerBrowser = projectContext?.brief.experience === 'beginner' && projectContext.brief.platform === 'web';
  const showBeginnerDecision = beginnerBrowser && (validStage === 'code' || (!validStage && selected.some(service => service.capabilities.some(item => item.id === 'coding'))));
  const browserCandidates = showBeginnerDecision ? selected.filter(service => beginnerBrowserToolDecision(service).status === 'browser') : [];
  const stageMatches = validStage
    ? selected.filter((service) =>
        compareStageCategories[validStage].includes(service.category),
      )
    : [];
  const officialSourceCount = selected.filter(
    (service) => service.verificationStatus === 'verified',
  ).length;

  useEffect(() => {
    const routeParams = new URLSearchParams(paramsKey);
    const routeRaw = routeParams.get('ids');
    const routeIds = normalize(
      routeRaw === null ? defaults : routeRaw.split(',').filter(Boolean),
      services,
    );
    const routeDifferencesOnly = routeParams.get('diff') === '1';
    const sync = window.setTimeout(() => {
      setIds((current) =>
        current.join(',') === routeIds.join(',') ? current : routeIds,
      );
      setDifferencesOnly((current) =>
        current === routeDifferencesOnly ? current : routeDifferencesOnly,
      );
    }, 0);
    return () => window.clearTimeout(sync);
  }, [defaults, paramsKey, services]);

  function updateUrl(nextIds: string[], nextDifferencesOnly = differencesOnly) {
    const next = new URLSearchParams(paramsKey);
    if (nextIds.length) next.set('ids', nextIds.join(','));
    else next.delete('ids');
    if (nextDifferencesOnly) next.set('diff', '1');
    else next.delete('diff');
    const href = next.size ? `${pathname}?${next}` : pathname;
    const current = `${pathname}${paramsKey ? `?${paramsKey}` : ''}`;
    if (href !== current) router.push(href, { scroll: false });
  }

  const lastViewed = useRef('');
  useEffect(() => {
    const key = selected.map((service) => service.slug).join(',');
    if (key && key !== lastViewed.current && !viewedCompareKeys.has(key)) {
      lastViewed.current = key;
      viewedCompareKeys.add(key);
      track('compare_view', {
        services: selected.map((service) => service.slug),
        page: '/compare',
      });
    }
  }, [selected]);

  function toggle(id: string) {
    const nextIds = ids.includes(id)
      ? ids.filter((item) => item !== id)
      : ids.length < 4
        ? [...ids, id]
        : ids;
    setIds(nextIds);
    updateUrl(nextIds);
  }

  return (
    <>
      {(validStage || projectContext) && (
        <div className="compare-context">
          <strong>
            {validStage ? `制作中の「${phaseLabelsForCompare(validStage)}」工程で使う候補を比較しています。` : '制作中のゲームで使う候補を比較しています。'}
          </strong>
          <Link href={projectContext ? `${projectContext.returnUrl}#${beginnerBrowser ? 'beginner-action-title' : 'build-progress-title'}` : '/project'}>{projectContext ? '制作中のゲームに戻る →' : 'Projectへ戻る →'}</Link>
        </div>
      )}

      {showBeginnerDecision && selected.length > 0 && <section className="compare-decision" aria-labelledby="beginner-compare-title">
        <h2 id="beginner-compare-title">今回の選び方：ブラウザでAIへ依頼する</h2>
        <p>今は最初の index.html を作る段階です。AIを使う場所と、完成したゲームを遊ぶ場所は別です。</p>
        <p>{browserCandidates.length ? <><strong>{browserCandidates.map(service => service.name).join(' / ')}</strong>は、掲載情報でブラウザ利用とコード支援を確認できる候補です。制作中の作業へ戻り、案内されているAIへの指示を使えます。</> : '選択中の候補には、ブラウザ利用とコード支援の両方を公式確認できたものがありません。作業へ戻って案内されているAIを確認してください。'}</p>
        <ul>{selected.map(service => <li key={service.id}><strong>{service.name}：</strong>{beginnerBrowserToolDecision(service).reason} <EvidenceLinks service={service} row="主用途" /></li>)}</ul>
        <p>スマートフォンだけでの制作可否や無料枠の上限は、ブラウザ対応だけでは判断できません。</p>
      </section>}

      {selected.length >= 2 ? (
        <section
          className="compare-decision"
          aria-labelledby="compare-decision-title"
        >
          <span>最初に判断</span>
          <h2 id="compare-decision-title">
            {validStage
              ? `「${phaseLabelsForCompare(validStage)}」工程との用途一致`
              : '選択中の候補で、先に判断材料を確認'}
          </h2>
          <p className="compare-selected-services">
            選択候補：
            {selected.map((service, index) => (
              <span key={service.id}>
                {index > 0 ? ' / ' : ''}
                <ServiceDetailLink service={service} />
              </span>
            ))}
          </p>
          {leadingDifferences.length > 0 && (
            <div
              className="compare-leading-differences"
              aria-label="主要な差分"
            >
              <strong>先に見る主要差分</strong>
              <ul>
                {leadingDifferences.map((difference) => (
                  <li key={difference.name}>
                    <span>{difference.name}</span>
                    {difference.values.map((value, index) => (
                      <span key={selected[index].id}>
                        <ServiceDetailLink service={selected[index]} />：{value}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showBeginnerDecision ? <p>始め方の違いは上の「今回の選び方」で確認できます。以下は利用条件と機能を詳しく確認するための差分です。</p> : validStage && stageMatches.length ? (
            <p>
              登録カテゴリがこの工程と一致する候補：
              <strong>
                {stageMatches.map((service) => service.name).join('、')}
              </strong>
              。カテゴリの一致は、 機能・品質の検証や順位を意味しません。
            </p>
          ) : (
            <p>
              選択中の情報だけでは優先順位を確定できません。差分と公式確認事項を見て、制作条件に合う候補を絞ってください。
            </p>
          )}
          <p>
            <strong>
              {selected.length}候補中{officialSourceCount}候補
            </strong>
            が「公式資料確認済み」です。
            価格・権利・提供機能は契約前に各公式ページで再確認してください。
          </p>
          <ul>
            {selected.map((service) => (
              <li key={service.id}>
                <strong>
                  <ServiceDetailLink service={service} />
                </strong>{' '}
                — {service.primaryUses.join('、')}。注意：
                {service.weaknesses[0]}{' '}
                <EvidenceLinks service={service} row="制約・弱点" />
              </li>
            ))}
          </ul>
          <p>価格、権利、品質を推測して勝者を決めません。</p>
        </section>
      ) : (
        <p className="notice">
          あと{2 - selected.length}
          件選ぶと違いを比較できます。比較候補を開き、制作工程に合うツールを選んでください。
        </p>
      )}

      <details
        className="compare-picker-panel"
        open={selected.length < 2 || pickerOpen}
        onToggle={(event) => setPickerOpen(event.currentTarget.open)}
      >
        <summary>
          比較候補を{selected.length >= 2 ? '変更する' : '選ぶ'}
          <span>（{selected.length} / 4件）</span>
        </summary>
        <div className="compare-selection-head">
          <p>
            <strong>{selected.length} / 4</strong> 件を選択中。
            {selected.length >= 4
              ? '上限に達しました。解除すると別のツールを選べます。'
              : `あと${4 - selected.length}件選べます。`}
          </p>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setIds([]);
                updateUrl([]);
              }}
            >
              すべて解除
            </button>
          )}
        </div>
        <label className="compare-picker-search">
          <span>候補を検索</span>
          <input
            type="search"
            value={pickerQuery}
            onChange={(event) => setPickerQuery(event.target.value)}
            placeholder="ツール名・用途で検索"
            aria-describedby="compare-picker-count"
          />
        </label>
        <p id="compare-picker-count" role="status" aria-live="polite">
          {visibleServices.length}件の候補を表示
        </p>
        <fieldset className="picker">
          <legend>比較するツール</legend>
          {visibleServices.map((service) => {
            const blocked = !ids.includes(service.slug) && ids.length >= 4;
            return (
              <label
                key={service.id}
                title={blocked ? '最大4件まで比較できます' : undefined}
              >
                <input
                  type="checkbox"
                  checked={ids.includes(service.slug)}
                  disabled={blocked}
                  onChange={() => toggle(service.slug)}
                />
                {service.name}
                {blocked && (
                  <span className="sr-only">（上限のため選択できません）</span>
                )}
              </label>
            );
          })}
        </fieldset>
        {visibleServices.length === 0 && (
          <p className="notice">
            該当する候補がありません。検索語を短くして再度お試しください。
          </p>
        )}
      </details>

      {selected.length >= 2 && (
        <div className="compare-view-options">
          <label>
            <input
              type="checkbox"
              checked={differencesOnly}
              onChange={(event) => {
                const next = event.target.checked;
                setDifferencesOnly(next);
                updateUrl(ids, next);
              }}
            />{' '}
            差分のみ表示
          </label>
          <span>
            {differencesOnly ? '差分のみ表示中。' : '全項目を表示中。'}
            {differenceCount}項目に差分
          </span>
        </div>
      )}

      <div className="compare-scroll">
        <table>
          <caption>
            差分のある項目を先に、共通項目を後に表示します。サービス利用環境は、そのAIサービスを使う環境であり、ゲームの出力先ではありません。
          </caption>
          <thead>
            <tr>
              <th scope="col">比較項目</th>
              {selected.map((service) => (
                <th scope="col" key={service.id}>
                  <ServiceDetailLink service={service} />
                  <button
                    className="compare-remove"
                    type="button"
                    onClick={() => toggle(service.slug)}
                    aria-label={`${service.name}を比較から解除`}
                  >
                    解除
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderedRows.map(([name, get]) => {
              const values = selected.map(get);
              const differs = new Set(values).size > 1;
              if (differencesOnly && !differs) return null;
              return (
                <tr key={name} className={differs ? 'different' : ''}>
                  <th scope="row">
                    {name}
                    {differs && <span className="diff">差分</span>}
                  </th>
                  {selected.map((service, index) => (
                    <td key={service.id}>
                      {values[index]}
                      <EvidenceLinks service={service} row={name} />
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <th scope="row">公式確認</th>
              {selected.map((service) => (
                <td key={service.id}>
                  <VerificationLinks service={service} />
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">次の行動</th>
              {selected.map((service) => (
                <td key={service.id}>
                  <OutboundLink
                    service={service}
                    page="/compare"
                    placement="table"
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <section
        className="compare-mobile"
        aria-labelledby="mobile-compare-heading"
      >
        <h2 id="mobile-compare-heading" className="sr-only">
          選択したツールの比較結果
        </h2>
        {selected.length === 2 ? (
          <div className="paired-fields">
            {orderedRows.map(([name, get]) => {
              const differs = new Set(selected.map(get)).size > 1;
              if (differencesOnly && !differs) return null;
              return (
                <section key={name} className={differs ? 'different' : ''}>
                  <h3>
                    {name}
                    {differs && <span className="diff">差分</span>}
                  </h3>
                  <div>
                    {selected.map((service) => (
                      <dl key={service.id}>
                        <dt>
                          <ServiceDetailLink service={service} />
                        </dt>
                        <dd>
                          {get(service)}{' '}
                          <EvidenceLinks service={service} row={name} />
                        </dd>
                      </dl>
                    ))}
                  </div>
                </section>
              );
            })}
            {selected.map((service) => (
              <article key={service.id}>
                <h3>
                  <ServiceDetailLink service={service} />
                  の公式確認と次の行動
                </h3>
                <VerificationLinks service={service} />
                <OutboundLink
                  service={service}
                  page="/compare"
                  placement="mobile-paired"
                />
              </article>
            ))}
          </div>
        ) : (
          selected.map((service) => (
            <article key={service.id}>
              <header>
                <h2>
                  <ServiceDetailLink service={service} />
                </h2>
                <button type="button" onClick={() => toggle(service.slug)}>
                  比較から解除
                </button>
              </header>
              <dl>
                {orderedRows.map(([name, get]) => {
                  const differs = new Set(selected.map(get)).size > 1;
                  if (differencesOnly && !differs) return null;
                  return (
                    <div key={name} className={differs ? 'different' : ''}>
                      <dt>
                        {name}
                        {differs && <span className="diff">差分</span>}
                      </dt>
                      <dd>
                        {get(service)}{' '}
                        <EvidenceLinks service={service} row={name} />
                      </dd>
                    </div>
                  );
                })}
              </dl>
              <VerificationLinks service={service} />
              <OutboundLink
                service={service}
                page="/compare"
                placement="mobile-card"
              />
            </article>
          ))
        )}
      </section>
    </>
  );
}

const phaseLabelsForCompare = (stage: string) =>
  ({
    code: 'コード',
    voice: '声・音声',
    '3d': '3D素材',
    visuals: '2Dビジュアル',
    animation: 'アニメーション',
    'music-sfx': 'BGM・SFX',
    'npc-dialogue': 'NPC会話',
    localization: '翻訳',
    testing: 'テスト',
    publishing: '公開素材',
  })[stage] ?? stage;

const compareStageCategories: Record<string, string[]> = {
  code: ['coding-agent', 'ide-ai', 'general-llm'],
  voice: ['voice'],
  '3d': ['3d-model', 'texture-material', 'rigging'],
  visuals: ['2d-image', 'concept-art', 'character-consistency'],
  animation: ['animation', 'rigging'],
  'music-sfx': ['music', 'sfx'],
  'npc-dialogue': ['npc-dialogue'],
  localization: ['localization'],
  testing: ['qa-testing'],
  publishing: ['marketing-store-assets', 'video-trailer'],
};
