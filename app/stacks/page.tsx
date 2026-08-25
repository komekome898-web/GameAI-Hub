import type { Metadata } from 'next';
import Link from 'next/link';
import { stackTemplates } from '@/data/stack-templates';
import { productionStages } from '@/lib/domain';

export const metadata:Metadata={title:'ゲーム制作Stackテンプレート',description:'ゲーム種別ごとに、対象、制作順、必要なAIツール候補、費用の見え方、商用利用の注意点を確認できます。',alternates:{canonical:'/stacks/'},openGraph:{url:'/stacks/'}};
const stageName=new Map(productionStages.map(stage=>[stage.id,stage.label]));

export default function StacksPage(){return <>
  <section className="page-hero compact"><p className="eyebrow">PRODUCTION STACK TEMPLATES</p><h1>ゲーム制作を、<br/>工程から組み立てる。</h1><p className="lead">似た企画の工程案を出発点に、必要・任意のツール、制約、費用の確認範囲を把握できます。条件に合わせる場合はBuilderへ進んでください。</p></section>
  <section className="stack-directory" aria-labelledby="stack-list-heading"><div className="section-head"><div><p className="eyebrow">8 STARTING POINTS</p><h2 id="stack-list-heading">制作するゲームに近い構成</h2></div></div>
    <div className="stack-grid">{stackTemplates.map(stack=><article key={stack.slug}>
      <header><span>{stack.forWhom[0]}</span><h2><Link href={`/stacks/${stack.slug}`}>{stack.title}</Link></h2><p>{stack.summary}</p></header>
      <div className="stage-strip" aria-label="制作工程">{stack.workflow.map((stage,index)=><span key={`${stage}-${index}`}>{stageName.get(stage)}</span>)}</div>
      <dl><div><dt>候補</dt><dd>{stack.tools.length}ツール（任意 {stack.tools.filter(tool=>tool.optional).length}）</dd></div><div><dt>費用</dt><dd>{stack.costVisibility}</dd></div><div><dt>注意</dt><dd>{stack.commercialCaveats[0]}</dd></div></dl>
      <Link className="text-link" href={`/stacks/${stack.slug}`}>工程と制約を確認 →</Link>
    </article>)}</div>
  </section>
</>}
