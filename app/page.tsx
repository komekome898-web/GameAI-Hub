import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectIdeaForm } from '@/components/ProjectGeneratorClient';

export const metadata:Metadata={title:'作りたいゲームから制作ロードマップを作る',description:'ゲーム案を入力すると、今日やること、制作ロードマップ、使うAI、具体的なPrompt、完了条件を整理します。',alternates:{canonical:'/'},openGraph:{url:'/'}};
const examples=['Unityでモンスター収集RPG','Godotで2Dアクション','Steam向け3Dホラー','フルボイスのノベルゲーム','ブラウザ戦略ゲーム'];
export default function Home(){return <>
  <section className="cockpit-hero">
    <div className="hero-command"><p className="system-label">新規プロジェクト</p><h1>どんなゲームを<br/>作りたいですか？</h1><p className="lead">作りたいゲームを入力すると、<strong>制作順・必要なAI・具体的なPrompt・完了条件</strong>まで整理します。</p><ProjectIdeaForm location="home"/></div>
    <aside className="roadmap-preview" aria-label="入力後に得られる制作計画の例"><header><span>制作ロードマップ例</span><strong>Unity Monster Collection RPG</strong><small>入力後の表示例</small></header><div className="preview-progress"><span>進捗</span><strong>0 / 12</strong><progress value="0" max="12">0 / 12</progress></div><section><h2>今日やること</h2><ol><li><b>01</b><span>戦闘ループを決める<small>成果物：1ページ仕様</small></span><em>Claude</em></li><li><b>02</b><span>Unityプロジェクトを作る<small>成果物：起動確認</small></span><em>Manual</em></li><li><b>03</b><span>戦闘prototypeを作る<small>成果物：操作できるbuild</small></span><em>Codex</em></li></ol></section><div className="preview-stages"><span className="current">01 IDEA</span><i>→</i><span>02 PROTOTYPE</span><i>→</i><span>03 CODE</span></div><p>入力後は「次に何をするか」から始まります。ツール一覧を読むだけでは終わりません。</p></aside>
  </section>
  <section className="home-flow"><div className="section-head"><div><span className="system-label">使い方</span><h2>アイデアから、今日の作業へ</h2></div></div><ol><li><b>01</b><h3>ゲームを説明</h3><p>決まっている条件だけを自由文で入力。</p></li><li><b>02</b><h3>条件を確認</h3><p>推測で埋めず、必要な選択だけ確認。</p></li><li><b>03</b><h3>順番に作る</h3><p>Today・Roadmap・Questを完了条件つきで実行。</p></li></ol></section>
  <section className="example-projects"><div><span className="system-label">プロジェクト例</span><h2>たとえば、こんな計画</h2></div><div className="example-list">{examples.map((item,index)=><Link key={item} href={`/project?idea=${encodeURIComponent(item)}`}><span>{String(index+1).padStart(2,'0')}</span><strong>{item}</strong><small>制作計画を作る →</small></Link>)}</div></section>
  <section className="roadmap-explainer"><div><span className="system-label">成果物でつなぐ制作工程</span><h2>AIではなく、成果物で工程をつなぐ</h2><p>各工程のPromptは「何を作るか」「何を次へ渡すか」「いつ完了か」に接続。プロジェクトに不要な音声や3D工程は加えません。</p></div><div className="blueprint-line"><span>IDEA<small>仕様</small></span><span>PROTOTYPE<small>操作build</small></span><span>VISUALS<small>素材台帳</small></span><span>TEST<small>QA記録</small></span><span>SHIP<small>候補build</small></span></div></section>
  <section className="home-resources"><article><span>AI DATABASE</span><h2>目的からAIを検証</h2><p>コード、声、3Dなど「作るもの」から候補と公式根拠を確認します。</p><Link href="/tools">目的から探す →</Link></article><article><span>GUIDES</span><h2>工程の判断を深掘り</h2><p>制作の進め方と、契約前に確認する条件を読み解きます。</p><Link href="/guides">ガイドを読む →</Link></article></section>
  <section className="final-project-cta"><span className="system-label">制作を始める</span><h2>まず、作りたいゲームを1文で。</h2><p>ツール選びの前に、最初のプレイ可能範囲と今日の作業を決めます。</p><Link className="button" href="/project">制作ロードマップを作る</Link></section>
  </>}
