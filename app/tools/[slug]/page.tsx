import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAlternatives,getService,getServices } from '@/lib/services';
import { OutboundLink } from '@/components/OutboundLink';
import { ToolView } from '@/components/ToolView';
import { serializeJsonLd } from '@/lib/json-ld';
import { absoluteSiteUrl } from '@/lib/site';
import { verificationStatusLabel } from '@/lib/verification-status';
import { serviceCategoryLabel } from '@/lib/service-labels';

const label=(v:string)=>({yes:'あり',no:'なし',conditional:'条件付き',unknown:'不明',not_applicable:'対象外'}[v]??v);

export function generateStaticParams(){return getServices().map(s=>({slug:s.slug}));}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;const s=getService(slug);if(!s)return {};
  return {title:`${s.name}：ゲーム開発での使い方・料金・商用利用`,description:s.conclusion,alternates:{canonical:`/tools/${slug}/`},openGraph:{title:`${s.name} | GameAI Hub`,description:s.summary,url:`/tools/${slug}/`}}
}

export default async function ToolPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const s=getService(slug);if(!s)notFound();const alternatives=getAlternatives(s);
  const crumbs={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"ホーム","item":absoluteSiteUrl('/')},{"@type":"ListItem","position":2,"name":"ツール","item":absoluteSiteUrl('/tools/')},{"@type":"ListItem","position":3,"name":s.name,"item":absoluteSiteUrl(`/tools/${encodeURIComponent(s.slug)}/`)}]};
  return <article className="detail">
    <ToolView slug={s.slug}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(crumbs)}}/>
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><Link href="/tools">ツール</Link><span>/</span><span>{s.name}</span></nav>
    <header className="tool-hero">
      <div className="tool-hero-copy"><div className="card-top"><span className="tag">{serviceCategoryLabel(s.category)}</span><span className={`status ${s.verificationStatus}`}>{verificationStatusLabel(s.verificationStatus)}</span></div><h1>{s.name}</h1><p className="lead">{s.summary}</p><OutboundLink service={s} page={`/tools/${s.slug}`}/></div>
      <dl className="quick-facts"><div><dt>無料枠</dt><dd>{label(s.freePlan)}</dd></div><div><dt>商用利用</dt><dd>{label(s.commercialUse)}</dd></div><div><dt>API</dt><dd>{label(s.api)}</dd></div><div><dt>最終確認</dt><dd>{s.lastVerified}</dd></div></dl>
    </header>
    <section className="verdict"><p className="eyebrow">WORKFLOW FIT</p><h2>{s.conclusion}</h2><p>以下は掲載情報と公式資料の確認状態に基づく判断材料です。プロジェクト全体の制作順はProject Generatorで確認してください。</p></section>
    <div className="two-col"><section className="content-card positive"><p className="section-label">GOOD FIT</p><h2>この条件なら候補</h2><ul>{s.recommendedFor.map(x=><li key={x}>{x}</li>)}</ul></section><section className="content-card"><p className="section-label">POOR FIT</p><h2>別候補も検討する条件</h2><ul>{s.notRecommendedFor.map(x=><li key={x}>{x}</li>)}</ul></section></div>
    <section><p className="section-label">VERIFIED USES</p><h2>制作工程での用途</h2><div className="tags">{s.primaryUses.map(x=><span key={x}>{x}</span>)}</div><p className="tool-builder-link"><Link className="button ghost" href="/project">自分の条件で制作計画を作る</Link></p></section>
    <section><p className="section-label">TERMS & PRICING</p><h2>料金・利用条件</h2><dl className="specs"><div><dt>料金</dt><dd>{s.pricing}</dd></div><div><dt>無料枠</dt><dd>{label(s.freePlan)}</dd></div><div><dt>商用利用</dt><dd>{label(s.commercialUse)} <small>（法的保証ではありません。公式規約を確認してください）</small></dd></div><div><dt>API</dt><dd>{label(s.api)}</dd></div><div><dt>対応環境</dt><dd>{s.platforms.join('、')}</dd></div><div><dt>ゲームエンジン</dt><dd>{s.engines.join('、')||'不明'}</dd></div></dl></section>
    <div className="two-col"><section className="content-card"><p className="section-label">STRENGTHS</p><h2>採用する理由</h2><ul>{s.strengths.map(x=><li key={x}>{x}</li>)}</ul></section><section className="content-card"><p className="section-label">KNOWN LIMITATIONS</p><h2>導入前に確認する制約</h2><ul>{s.weaknesses.map(x=><li key={x}>{x}</li>)}</ul></section></div>
    <section><p className="section-label">ALTERNATIVES</p><h2>代替候補</h2>{alternatives.length?<><div className="alternative-list">{alternatives.map(a=><Link key={a.id} href={`/tools/${a.slug}`}><strong>{a.name}</strong><span>{a.summary}</span><b>詳細 →</b></Link>)}</div><Link className="button ghost" href={`/compare?ids=${[s.slug,...alternatives.map(a=>a.slug)].slice(0,4).join(',')}`}>代替候補と比較する</Link></>:<p>現在、同一用途で十分に検証できた比較候補はありません。Project Generatorで制作条件を指定すると、手動確認が必要な候補も区別して確認できます。</p>}</section>
    <section className="sources"><p className="section-label">SOURCES</p><h2>情報源</h2><ul>{s.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener">{source.label} ↗</a><span>{source.type}</span></li>)}</ul><p><strong>最終確認日:</strong> {s.lastVerified} ／ <strong>公式資料の確認状態:</strong> {verificationStatusLabel(s.verificationStatus)}</p></section>
  </article>
}
