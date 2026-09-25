import type { Metadata } from "next";
import Link from "next/link";
import { ProjectIdeaForm } from "@/components/ProjectGeneratorClient";

export const metadata: Metadata = {
  title: "作りたいゲームから制作ロードマップを作る",
  description:
    "ゲーム案を入力すると、今日やること、制作ロードマップ、使うAI、具体的なPrompt、完了条件を整理します。",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};
const examples = [
  "Unityでモンスター収集RPG",
  "Godotで2Dアクション",
  "Steam向け3Dホラー",
  "フルボイスのノベルゲーム",
  "ブラウザ戦略ゲーム",
];
export default function Home() {
  return (
    <>
      <section className="studio-hero">
        <div className="hero-command">
          <p className="system-label">はじめてのAIゲーム制作ナビ</p>
          <h1>
            ゲームを作ったことがなくても、<span>次の1作業から</span>
            <span>完成へ進める。</span>
          </h1>
          <p className="lead">
            作りたいゲームを1文で書くと、
            <strong>
              使うAI、コピーする指示、実際の操作、できたと判断する条件
            </strong>
            を1ステップずつ返します。AIツールを探すだけの一覧ではありません。
          </p>
          <ul className="hero-trust" aria-label="AI Iterproofで分かること">
            <li>今日やることは最大3つ</li>
            <li>最初の目標は「ゲームが動く」</li>
            <li>詰まった時の相談文も作成</li>
          </ul>
          <ProjectIdeaForm location="home" />
        </div>
        <aside
          className="deliverable-board"
          aria-label="入力後に得られる制作ナビの表示例"
        >
          <header>
            <div>
              <span>入力後の表示例</span>
              <strong>モンスター収集ゲーム</strong>
            </div>
            <small>最初の1作業</small>
          </header>
          <div className="board-now">
            <span>まず動かすもの</span>
            <h2>1体対1体のバトル</h2>
            <p>
              味方と敵を表示し、「たたかう」でHPが減り、勝敗とやり直しまで動かします。
            </p>
          </div>
          <dl className="board-gates">
            <div>
              <dt>コピーするもの</dt>
              <dd>1つのHTMLを作る、このゲーム専用のAI指示</dd>
            </div>
            <div>
              <dt>できた条件</dt>
              <dd>行動 → 勝敗 → やり直しを自分で操作できる</dd>
            </div>
          </dl>
          <div className="board-evidence">
            <span>詰まったら</span>
            <p>
              <strong>いまの作業と成功条件</strong>
              を入れた相談文をコピーして、使用中のAIへそのまま渡せます。
            </p>
          </div>
          <ol className="board-route" aria-label="制作ナビの流れ">
            <li className="current">
              <b>01</b>
              <span>動かす</span>
            </li>
            <li>
              <b>02</b>
              <span>確かめる</span>
            </li>
            <li>
              <b>03</b>
              <span>できた</span>
            </li>
            <li>
              <b>04</b>
              <span>次へ</span>
            </li>
          </ol>
        </aside>
      </section>
      <section className="home-paths" aria-labelledby="home-paths-title">
        <div className="section-head">
          <div>
            <span className="system-label">CHOOSE YOUR NEXT STEP</span>
            <h2 id="home-paths-title">今やりたいことは、3つから。</h2>
          </div>
          <p>
            迷ったら「ゲームを作る」から。条件に合う最初の作業を先に決めます。
          </p>
        </div>
        <div className="home-path-grid">
          <Link className="is-primary" href="/project">
            <span>01 / BUILD</span>
            <h3>ゲームを作る</h3>
            <p>ゲーム案から、今日の作業・Prompt・完了条件を作る。</p>
            <b>制作ナビを始める →</b>
          </Link>
          <Link href="/tools">
            <span>02 / CHOOSE</span>
            <h3>AI・ツールを選ぶ</h3>
            <p>声、3D、コードなど、作る成果物から候補と根拠を確認。</p>
            <b>目的から探す →</b>
          </Link>
          <Link href="/articles/">
            <span>03 / LEARN</span>
            <h3>記事で調べる</h3>
            <p>作り方、料金、商用利用を、次の作業につながる順番で読む。</p>
            <b>目的別の記事へ →</b>
          </Link>
        </div>
      </section>
      <section className="home-flow">
        <div className="section-head">
          <div>
            <span className="system-label">HOW IT WORKS</span>
            <h2>読む・選ぶだけで終わらない。</h2>
          </div>
          <p>
            入力したゲーム条件を保ち、成果物を確かめながら次の工程へ進めます。
          </p>
        </div>
        <ol>
          <li>
            <b>01</b>
            <h3>1作業に絞る</h3>
            <p>最初に動かす範囲と必要なAIを整理。</p>
          </li>
          <li>
            <b>02</b>
            <h3>完了条件で確かめる</h3>
            <p>AIの回答ではなく、実際の操作結果を確認。</p>
          </li>
          <li>
            <b>03</b>
            <h3>成果物を次へ渡す</h3>
            <p>できたものを保持して次のtaskへ進む。</p>
          </li>
        </ol>
      </section>
      <section className="home-featured" aria-labelledby="home-featured-title">
        <div className="section-head">
          <div>
            <span className="system-label">PRACTICAL ROUTES</span>
            <h2 id="home-featured-title">制作段階から、必要な記事へ。</h2>
          </div>
          <Link href="/articles/">すべての記事を見る →</Link>
        </div>
        <div className="home-featured-grid">
          <article>
            <span>FIRST PLAYABLE</span>
            <h3>AIでブラウザゲームを作る</h3>
            <p>1つのHTMLで最初のプレイ可能版を作り、動作を検証します。</p>
            <Link href="/articles/ai-browser-game-how-to/">
              初心者向け手順を読む →
            </Link>
          </article>
          <article>
            <span>VOICE</span>
            <h3>ゲーム音声を作る</h3>
            <p>代表セリフを先に試し、採用後に商用条件を確認します。</p>
            <Link href="/articles/elevenlabs-game-development-guide/">
              ElevenLabs実践ガイド →
            </Link>
          </article>
          <article>
            <span>3D ASSETS</span>
            <h3>3Dアセットを作る</h3>
            <p>1点をゲームへ取り込み、品質・料金・権利を順に判断します。</p>
            <Link href="/articles/meshy-game-development-guide/">
              Meshy実践ガイド →
            </Link>
          </article>
        </div>
      </section>
      <section className="example-projects">
        <div>
          <span className="system-label">TRY YOUR IDEA</span>
          <h2>ゲーム案を選んで試す</h2>
          <p>例を選んでも、ゲームの種類や条件を勝手に置き換えません。</p>
        </div>
        <div className="example-list">
          {examples.slice(0, 3).map((item, index) => (
            <Link key={item} href={`/project?idea=${encodeURIComponent(item)}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
              <small>制作手順を作る →</small>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
