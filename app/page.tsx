import type { Metadata } from 'next';
import Link from 'next/link';
import { stackTemplates } from '@/data/stack-templates';

export const metadata:Metadata={title:'作りたいゲームからAI開発構成を決める',description:'ゲームの条件を入力すると、必要な制作工程、AIツール候補、順番、代替案、費用と商用利用の確認事項を整理します。',alternates:{canonical:'/'},openGraph:{url:'/'}};

export default function Home(){
  return <>
    <section className="decision-hero">
      <div>
        <p className="eyebrow">AI GAME DEVELOPMENT DECISION BUILDER</p>
        <h1>何を作りたい<br/>ですか？</h1>
        <p className="lead">ゲームの種類、予算、経験、必要な素材を選ぶと、制作工程ごとのAIツール候補と採用理由、代替案、確認すべき制約を順番に整理します。</p>
        <div className="hero-actions"><Link className="button" href="/builder">AI開発構成を作る</Link><Link className="button ghost" href="/compare">ツールを比較する</Link></div>
        <p className="decision-note">推薦順位をアフィリエイト報酬で変更しません。未確認の料金・商用条件は「不明」として残します。</p>
      </div>
      <aside className="decision-output" aria-label="Builderで得られる内容">
        <p className="panel-kicker">YOUR OUTPUT</p><h2>調査結果ではなく、制作の開始手順</h2>
        <ol><li><span>01</span><strong>必要な制作工程</strong></li><li><span>02</span><strong>工程ごとの候補と理由</strong></li><li><span>03</span><strong>代替案・制約・未確認事項</strong></li><li><span>04</span><strong>次に着手する順番</strong></li></ol>
      </aside>
    </section>
    <section className="stack-preview">
      <div className="section-head"><div><p className="eyebrow">QUICK START</p><h2>近いゲームから工程を見る</h2><p className="lead">既成Stackは完成品のランキングではなく、Builderへ条件を引き継ぐためのクイックスタートです。</p></div><Link className="text-link" href="/stacks">8つのStackを見る →</Link></div>
      <div className="stack-mini-grid">{stackTemplates.slice(0,4).map(stack=><Link key={stack.slug} href={`/stacks/${stack.slug}`}><span>{stack.workflow.length}工程</span><h3>{stack.title}</h3><p>{stack.summary}</p><b>工程案を確認 →</b></Link>)}</div>
    </section>
    <section className="decision-paths"><div><p className="eyebrow">OTHER PATHS</p><h2>候補をすでに知っている場合</h2><p>ツール詳細と比較表は、Builderで得た候補を検証するために利用できます。</p></div><div className="hero-actions"><Link className="button ghost" href="/compare">ツールを比較する</Link><Link className="text-link" href="/tools">ツール一覧を見る →</Link></div></section>
  </>
}
