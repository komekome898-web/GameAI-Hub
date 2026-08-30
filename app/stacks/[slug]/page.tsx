import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStackTemplate, getStackTemplatePreset, stackTemplates } from '@/data/stack-templates';
import { productionStages } from '@/lib/domain';
import { getService } from '@/lib/services';
import { serializeJsonLd } from '@/lib/json-ld';
import { site } from '@/lib/site';
import { StackAction, StackView } from '@/components/StackAnalytics';
import { getStagePlan, recommendProject } from '@/lib/recommendation/engine';
import { verificationStatusLabel } from '@/lib/verification-status';

const stageById=new Map(productionStages.map(stage=>[stage.id,stage]));
const status=(value:string)=>({yes:'あり',no:'なし',conditional:'条件付き',unknown:'不明',not_applicable:'対象外'}[value]??value);
export function generateStaticParams(){return stackTemplates.map(stack=>({slug:stack.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const stack=getStackTemplate(slug);if(!stack)return {};return {title:stack.title,description:stack.summary,alternates:{canonical:`/stacks/${slug}/`},openGraph:{title:`${stack.title} | GameAI Hub`,description:stack.summary,url:`/stacks/${slug}/`}};}

export default async function StackPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const stack=getStackTemplate(slug);if(!stack)notFound();
  const preset=getStackTemplatePreset(slug)!;
  const generated=recommendProject(preset);
  const compareIds=stack.tools.map(tool=>tool.serviceSlug).filter((value,index,array)=>array.indexOf(value)===index).slice(0,4).join(',');
  const crumbs={"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"ホーム","item":`${site.url}/`},{"@type":"ListItem","position":2,"name":"Stack","item":`${site.url}/stacks/`},{"@type":"ListItem","position":3,"name":stack.title,"item":`${site.url}/stacks/${slug}/`}]};
  return <article className="stack-detail">
    <StackView slug={slug}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(crumbs)}}/>
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span>/</span><Link href="/stacks">Stack</Link><span>/</span><span>{stack.title}</span></nav>
    <header className="stack-hero"><p className="eyebrow">PRODUCTION PLAN</p><h1>{stack.title}</h1><p className="lead">{stack.summary}</p><p className="notice">これは既成テンプレートの候補です。現在の条件への推薦ではありません。条件付き・不明の項目はBuilderであなたの条件に照らして確認してください。</p><div className="hero-actions"><StackAction className="button" event="stack_to_builder" slug={slug} href={`/builder?template=${stack.slug}`}>この構成を条件に合わせる</StackAction><StackAction className="button ghost" event="compare_start" slug={slug} href={`/compare?ids=${compareIds}`}>候補を比較する</StackAction></div></header>
    <section className="stack-fit"><div><p className="section-label">WHO THIS IS FOR</p><h2>この構成が合う人</h2><ul>{stack.forWhom.map(item=><li key={item}>{item}</li>)}</ul></div><div><p className="section-label">NOT A COMPLETE FIT</p><h2>別途設計が必要な範囲</h2><ul>{stack.limitations.map(item=><li key={item}>{item}</li>)}</ul></div></section>
    <section><p className="section-label">ORDERED WORKFLOW</p><h2>制作工程・成果物・受け渡し</h2><ol className="workflow-map">{stack.workflow.map((id,index)=>{const stage=stageById.get(id);const plan=getStagePlan(id,preset);const hasTool=stack.tools.some(tool=>tool.stage===id);return <li key={`${id}-${index}`}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{stage?.label} {!hasTool&&<small>（手動工程）</small>}</strong><p><b>成果物:</b> {plan.deliverable}</p><p><b>完了条件:</b> {plan.acceptanceCriteria.join(' / ')}</p><p><b>手作業:</b> {plan.manualTasks.join(' / ')}</p><p><b>次工程への受け渡し:</b> {plan.handoff}</p></div></li>})}</ol></section>
    <section><p className="section-label">DETERMINISTIC COVERAGE</p><h2>入力プリセットによる全12工程の判定</h2><p>以下は編集記事の候補とは別に、Builderと同じ決定ロジックで生成した結果です。差があれば手動確認対象として見える化します。</p><ol className="workflow-map">{generated.stages.map((stage,index)=>{const editorial=stack.tools.find(tool=>tool.stage===stage.stage);const generatedSlugs=[stage.primary?.service.slug,...stage.reviewCandidates.map(item=>item.service.slug)].filter(Boolean);const agrees=editorial&&generatedSlugs.includes(editorial.serviceSlug);const state=stage.requirement==='excluded'?'対象外':stage.primary?(editorial&&!agrees?'要手動確認':'条件一致候補あり'):stage.reviewCandidates.length?'要手動確認':'検証済み一致候補なし（手動工程）';return <li key={stage.stage}><span>{String(index+1).padStart(2,'0')}</span><div><strong>{stageById.get(stage.stage)?.label} — {state}</strong><p>{stage.requirement==='excluded'?'入力条件から省略します。':stage.primary?`生成候補: ${stage.primary.service.name}`:stage.reviewCandidates.length?`確認候補: ${stage.reviewCandidates.map(item=>item.service.name).join('、')}`:stage.manualFallback}</p>{editorial&&<p>編集テンプレート: {getService(editorial.serviceSlug)?.name}（{agrees?'生成結果と一致':'生成結果と不一致・手動確認'}）</p>}</div></li>})}</ol></section>
    <section className="manual-stage"><p className="section-label">MANUAL FOUNDATION</p><h2>AI候補とは別に必須の制作基盤</h2><ul><li>ゲームエンジン／プロジェクト設定</li><li>バージョン管理／ビルドパイプライン</li><li>アセット／ライセンス台帳</li><li>配布・ストア設定</li></ul><p>特定ベンダーは推薦しません。担当、保存場所、確認手順を制作開始時に決めてください。</p></section>
    <section><p className="section-label">TOOLS IN CONTEXT</p><h2>工程ごとの候補・代替・制約</h2><div className="stack-tools">{stack.tools.map(tool=>{const service=getService(tool.serviceSlug);if(!service)return null;const alternatives=tool.alternativeSlugs.map(getService).filter(Boolean);return <article key={`${tool.stage}-${tool.serviceSlug}`}>
      <header><div><span className="tag">{tool.optional?'任意工程':'必要工程'} · {stageById.get(tool.stage)?.label}</span><h3><Link href={`/tools/${service.slug}`}>{service.name}</Link></h3></div><Link className="text-link" href={`/tools/${service.slug}`}>詳細 →</Link></header>
      <dl><div><dt>候補の位置付け</dt><dd>テンプレート候補（個別条件への推薦ではありません）</dd></div><div><dt>公式資料の確認状態</dt><dd>{verificationStatusLabel(service.verificationStatus)}</dd></div><div><dt>選ぶ理由</dt><dd>{tool.reason}</dd></div><div><dt>完了物</dt><dd>{stageById.get(tool.stage)?.objective}</dd></div><div><dt>既知の制約</dt><dd>{tool.limitation}</dd></div><div><dt>無料枠</dt><dd>{status(service.freePlan)}</dd></div><div><dt>商用利用</dt><dd>{status(service.commercialUse)}（条件付き・不明はBuilderで条件を指定し、公開前に公式規約を確認）</dd></div></dl>
      <div className="stack-alternatives"><strong>代替案</strong>{alternatives.length?alternatives.map(alt=><Link key={alt?.slug} href={`/tools/${alt?.slug}`}>{alt?.name}</Link>):<span>検証済みの代替候補なし</span>}</div>
    </article>})}</div></section>
    <section className="stack-checks"><div><p className="section-label">COST VISIBILITY</p><h2>費用として分かる範囲</h2><p>{stack.costVisibility}</p></div><div><p className="section-label">COMMERCIAL USE</p><h2>公開前の確認事項</h2><ul>{stack.commercialCaveats.map(item=><li key={item}>{item}</li>)}</ul></div></section>
    <section className="stack-next"><p className="eyebrow">NEXT ACTION</p><h2>自分の条件で工程を確定する</h2><p>このテンプレートをBuilderへ引き継ぎ、不要な工程や予算、経験、商用利用の条件を反映してください。</p><div className="hero-actions"><StackAction className="button" event="stack_to_builder" slug={slug} href={`/builder?template=${stack.slug}`}>Builderで調整する</StackAction><StackAction className="button ghost" event="compare_start" slug={slug} href={`/compare?ids=${compareIds}`}>掲載候補を比較する</StackAction></div></section>
  </article>
}
