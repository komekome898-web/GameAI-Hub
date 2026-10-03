import type { Metadata } from "next";
import Link from "next/link";
import { site, siteDescriptionLines } from "@/lib/site";
import { ProjectIdeaForm } from "@/components/ProjectGeneratorClient";

import { ArticleBrowser } from "@/components/ArticleBrowser";
import { getHubGroups } from "@/lib/article-hub-groups";

export const metadata: Metadata = {
  title: "作りたいゲームから制作ロードマップを作る",
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const examples = ["Unityでモンスター収集RPG", "Godotで2Dアクション", "Steam向け3Dホラー"];

export default function Home() {
  return <div className="home-v2-route">
    <header className="home-brand-intro" aria-labelledby="home-title">
      <h1 id="home-title">{site.name}<span>{site.nickname}</span></h1>
      <p className="home-outcome home-brand-description">{siteDescriptionLines.map(line => <span key={line}>{line}</span>)}</p>
    </header>
    <section className="home-category-entry" aria-labelledby="home-categories-title">
      <h2 id="home-categories-title">気になる制作から、めくって探す。</h2>
      <ArticleBrowser groups={getHubGroups()} home />
    </section>
    <section className="home-execution-hero" aria-labelledby="home-idea-title">
      <div className="home-execution-copy">
        <h2 id="home-idea-title">作りたいものが決まったら</h2>
        <ProjectIdeaForm location="home" />
        <a className="home-example-link" href="#home-example">入力後の完成イメージを見る <span aria-hidden="true">↓</span></a>
      </div>
      <aside className="home-output-cue" aria-label="入力後に得られるもの">
        <span>入力後に得られるもの</span>
        <strong>迷わず始められる、最初の1作業</strong>
        <ul><li>具体的な操作とAIへの指示</li><li>自分で確認できる完了条件</li><li>詰まった時の戻り方</li></ul>
      </aside>
    </section>

    <section className="home-example" id="home-example" aria-labelledby="home-example-title">
      <div className="section-head"><div><span className="system-label">PROJECT PREVIEW</span><h2 id="home-example-title">入力後は、次の作業だけに集中。</h2></div><p>例：モンスター収集ゲームの最初のプレイ可能版</p></div>
      <div className="home-task-preview">
        <div><span>今やること</span><h3>1体対1体のバトルを動かす</h3><p>味方と敵を表示し、「たたかう」でHPが減り、勝敗とやり直しまで操作できる状態にします。</p></div>
        <dl><div><dt>成果物</dt><dd>ブラウザで動く1つのHTML</dd></div><div><dt>できた条件</dt><dd>行動 → 勝敗 → やり直しを自分で確認できる</dd></div></dl>
      </div>
    </section>

    <section className="home-paths" aria-labelledby="home-paths-title">
      <div className="section-head"><div><span className="system-label">次の目的</span><h2 id="home-paths-title">必要な入口だけを選ぶ。</h2></div><p>新しく始める時はProjectへ。途中の制作課題や調査には、目的別の入口を使えます。</p></div>
      <div className="home-path-grid">
        <Link className="is-primary" href="/project"><span>作る</span><h3>ゲーム案から始める</h3><p>今日の作業・Prompt・完了条件を作る。</p><b>Projectを始める →</b></Link>
        <Link href="/tools"><span>選ぶ</span><h3>制作課題に合うAIを探す</h3><p>声、3D、コードなど、必要な成果物から候補を確認。</p><b>AI・ツールへ →</b></Link>
        <Link href="/articles"><span>学ぶ</span><h3>手順と判断材料を読む</h3><p>作り方、料金、商用利用を次の作業につながる順番で読む。</p><b>記事へ →</b></Link>
      </div>
    </section>

    <section className="home-continuation" aria-labelledby="home-continuation-title">
      <div><span className="system-label">続け方</span><h2 id="home-continuation-title">成果物を確かめて、次へ。</h2><p>入力したゲーム条件を保ったまま、作業 → 確認 → 完了 → 次の作業へ進みます。</p></div>
      <ol><li><b>1</b><span>作業を1つに絞る</span></li><li><b>2</b><span>完了条件を操作して確認</span></li><li><b>3</b><span>結果を次の作業へつなぐ</span></li></ol>
    </section>

    <section className="home-featured" aria-labelledby="home-featured-title">
      <div className="section-head"><div><span className="system-label">実践記事</span><h2 id="home-featured-title">制作段階ごとの手順。</h2></div><Link href="/articles">すべての記事を見る →</Link></div>
      <div className="home-resource-list">
        <Link href="/articles/ai-browser-game-how-to/"><strong>最初のプレイ可能版</strong><span>AIでブラウザゲームを作り、動作を検証する</span></Link>
        <Link href="/articles/elevenlabs-game-development-guide/"><strong>ゲーム音声</strong><span>代表セリフを試し、採用条件を確認する</span></Link>
        <Link href="/articles/meshy-game-development-guide/"><strong>3Dアセット</strong><span>1点をゲームへ取り込み、品質と条件を判断する</span></Link>
      </div>
    </section>

    <section className="example-projects" aria-labelledby="home-ideas-title">
      <div><span className="system-label">入力例</span><h2 id="home-ideas-title">案を選んで試す</h2><p>例を選んでも、ゲームの種類や条件を勝手に置き換えません。</p></div>
      <div className="example-list">{examples.map((item, index) => <Link key={item} href={`/project?idea=${encodeURIComponent(item)}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong><small>制作手順を作る →</small></Link>)}</div>
    </section>

    <aside className="home-trust-note" aria-label="情報の扱い"><strong>根拠と入力内容を大切にします。</strong><p>ゲーム案はアクセス解析へ送りません。料金や商用条件は一次情報で確認し、不明な点を推測で埋めません。</p><Link href="/methodology">調査・評価方法を見る →</Link></aside>
  </div>;
}
