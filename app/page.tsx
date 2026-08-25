import Link from 'next/link';
import { getServices } from '@/lib/services';

const intents=[
  ['AIでコーディング','AIコーディング','実装・補完・デバッグ'],
  ['キャラ・背景を生成','AI画像','2Dアセット制作'],
  ['BGM・効果音を生成','AI BGM / SFX','サウンド制作'],
  ['AI音声を導入','AI音声','ボイス・ナレーション'],
  ['3Dモデルを生成','AI 3D','3Dアセット制作'],
  ['ゲームを丸ごと生成','AIゲーム生成','プロトタイプ制作']
];

export default function Home(){
  const services=getServices();
  const verified=services.filter(s=>s.verificationStatus==='verified').length;
  return <>
    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow">AI GAME DEVELOPMENT TOOL FINDER</p>
        <h1>ゲーム開発AIを、<br/><span>条件で選ぶ。</span></h1>
        <p className="lead">宣伝文句ではなく、料金・商用利用・無料枠・API・対応環境を同じ基準で比較。制作工程から最短で候補を絞れます。</p>
        <div className="hero-actions">
          <Link className="button" href="/tools">ツールを探す</Link>
          <Link className="button ghost" href="/compare">横並びで比較</Link>
        </div>
        <div className="hero-stats" aria-label="サイト情報">
          <div><strong>{services.length}</strong><span>掲載ツール</span></div>
          <div><strong>{verified}</strong><span>検証済み</span></div>
          <div><strong>4</strong><span>最大同時比較</span></div>
        </div>
      </div>
      <aside className="hero-panel">
        <p className="panel-kicker">DECISION FLOW</p>
        <h2>「何を作るか」から選ぶ</h2>
        <ol>
          <li><span>01</span><div><strong>制作工程を選択</strong><small>コード・画像・音声・3Dなど</small></div></li>
          <li><span>02</span><div><strong>条件を確認</strong><small>無料枠・商用利用・API</small></div></li>
          <li><span>03</span><div><strong>公式情報へ進む</strong><small>出典と最終確認日を表示</small></div></li>
        </ol>
      </aside>
    </section>

    <section className="intent-section">
      <div className="section-head">
        <div><p className="eyebrow">CHOOSE YOUR WORKFLOW</p><h2>制作工程から探す</h2></div>
        <Link className="text-link" href="/tools">すべてのツールを見る →</Link>
      </div>
      <div className="intent-grid">{intents.map(([label,category,desc],index)=><Link key={category} href={`/tools?category=${encodeURIComponent(category)}`}>
        <span className="intent-no">0{index+1}</span>
        <div><strong>{label}</strong><p>{desc}</p></div>
        <b>{services.filter(s=>s.category===category).length}件 →</b>
      </Link>)}</div>
    </section>

    <section className="compare-promo">
      <div><p className="eyebrow">COMPARE WITH CONTEXT</p><h2>違いだけを、すぐ見つける。</h2><p>最大4サービスを同じ軸で比較。値が異なる行を視覚的に示し、「不明」は不明のまま表示します。</p></div>
      <Link className="button light" href="/compare">比較を始める</Link>
    </section>

    <section className="principles">
      <div className="section-head"><div><p className="eyebrow">EDITORIAL PRINCIPLES</p><h2>判断材料を、広告より上に置く</h2></div></div>
      <div className="principle-grid">
        <article><span>01</span><h3>報酬で順位を変えない</h3><p>アフィリエイトの有無を評価や掲載順位に使用しません。</p></article>
        <article><span>02</span><h3>確認日と出典を明示</h3><p>各ツールページから公式情報へ辿れるようにしています。</p></article>
        <article><span>03</span><h3>分からないことは「不明」</h3><p>推測で埋めず、確認できない情報はそのまま表示します。</p></article>
      </div>
      <Link className="text-link" href="/methodology">調査・評価方法を読む →</Link>
    </section>
  </>
}
