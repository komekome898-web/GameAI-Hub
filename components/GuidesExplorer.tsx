'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Guide } from '@/data/guides';

const stages = [
  { id: 'start', label: '始める', help: '作る範囲とAIへの渡し方を決める' },
  { id: 'build', label: '作る', help: '小さく遊べる成果物まで進める' },
  { id: 'review', label: '見直す', help: 'AIに任せる範囲と検証方法を整える' },
] as const;

type Stage = typeof stages[number]['id'];
type Resource = {
  href: string;
  kind: '制作ガイド' | '解説記事';
  stage: Stage;
  title: string;
  task: string;
  input: string;
  output: string;
  verified: string;
};

export function GuidesExplorer({ guides }: { guides: Guide[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawStage = searchParams.get('stage');
  const stage: Stage | 'all' = stages.some((item) => item.id === rawStage) ? rawStage as Stage : 'all';
  const guideResources: Resource[] = guides.map((guide) => ({
    href: `/guides/${guide.slug}`,
    kind: '制作ガイド',
    stage: guide.productionStage,
    title: guide.title,
    task: guide.queryFamily,
    input: guide.audience,
    output: guide.outcome,
    verified: guide.lastVerified,
  }));
  const resources: Resource[] = [
    ...guideResources,
    {
      href: '/articles/ai-usage-guide', kind: '解説記事', stage: 'review', title: 'AIの正しい使い方',
      task: 'AIへの依頼とレビュー方法を整える', input: 'AIの出力を制作に使いたい人',
      output: 'プロンプト、レビュー、用途別の使い分け', verified: '2026-08-29',
    },
    {
      href: '/articles/ai-fantasy', kind: '解説記事', stage: 'review', title: 'AIに幻想を抱くあなたへ',
      task: 'AIに任せる範囲を見直す', input: 'AI開発の期待と実際に差がある人',
      output: 'AIとの現実的な距離感と、人が確認する範囲', verified: '2026-08-29',
    },
  ];
  const shown = stage === 'all' ? resources : resources.filter((item) => item.stage === stage);

  function chooseStage(next: Stage | 'all') {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('stage'); else params.set('stage', next);
    router.push(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  }

  return <div className="guides-explorer">
    <nav className="guide-stage-nav" aria-labelledby="guide-stage-title">
      <div><p className="section-label">CHOOSE A STAGE</p><h2 id="guide-stage-title">今の作業はどこですか？</h2></div>
      <div className="guide-stage-options">
        {stages.map((item) => <button key={item.id} type="button" aria-pressed={stage === item.id} onClick={() => chooseStage(item.id)}><strong>{item.label}</strong><span>{item.help}</span></button>)}
      </div>
      <div className="guide-stage-status" aria-live="polite">
        <span>{stage === 'all' ? 'すべての制作段階を表示中' : `「${stages.find((item) => item.id === stage)?.label}」を表示中`}</span>
        {stage !== 'all' && <button type="button" className="button ghost" onClick={() => chooseStage('all')}>選択を解除</button>}
      </div>
    </nav>

    <aside className="guide-start-path" aria-labelledby="guide-start-title">
      <div><p className="section-label">RECOMMENDED START</p><h2 id="guide-start-title">まだ作業を分けていないなら</h2><p>ゲーム全体をAIに任せず、最初の1作業と検証条件を固定します。</p></div>
      <Link className="button" href="/guides/codex-game-development-brief">実装ブリーフから始める</Link>
    </aside>

    <section className="guide-resource-section" aria-labelledby="guide-resource-title">
      <div className="guide-results-head"><div><p className="section-label">TASK RESOURCES</p><h2 id="guide-resource-title">{stage === 'all' ? '作業別のガイド' : `${stages.find((item) => item.id === stage)?.label}ためのガイド`}</h2></div><p aria-live="polite">{shown.length}件</p></div>
      <div className="guide-resource-list">
        {shown.map((item) => <article key={item.href}>
          <div className="guide-resource-kind"><span>{item.kind}</span><small>最終確認 {item.verified}</small></div>
          <div><p className="guide-task">作業：{item.task}</p><h3><Link href={item.href}>{item.title}</Link></h3></div>
          <dl><div><dt>前提・入力</dt><dd>{item.input}</dd></div><div><dt>得られる成果</dt><dd>{item.output}</dd></div></dl>
          <Link className="guide-resource-action" href={item.href}>{item.kind === '制作ガイド' ? '手順を開く' : '解説を読む'} →</Link>
        </article>)}
      </div>
    </section>
  </div>;
}
