import type { Metadata } from "next";
import Link from "next/link";
import { ArticleBrowser } from "@/components/ArticleBrowser";
import { getHubGroups } from "@/lib/article-hub-groups";
export const metadata: Metadata = {
  title: "AIゲーム開発の記事・実践ガイド",
  description:
    "AIでゲームを作り始める手順、音声・3Dツールの使い方、商用利用・料金判断を目的別に探せる記事ハブ。",
  alternates: { canonical: "/articles/" },
  openGraph: {
    url: "/articles/",
    title: "AIゲーム開発の記事・実践ガイド",
    description:
      "作り始める、制作ツールを使う、公開条件を確かめる。目的から次に読む記事を選べます。",
  },
};
export default function ArticlesPage() {
  return (
    <div className="visual-layer-v2 articles-v2-route">
      <div className="v2-atrium-art" aria-hidden="true" />
      <div className="page-shell article-hub v2-atrium-content">
        <header className="page-head">
        <p className="eyebrow">AI GAME DEVELOPMENT LIBRARY</p>
        <h1>今の制作課題から、次に読む手順を選ぶ</h1>
        <p className="lead">
          ゲームを動かす、素材を作る、公開条件を確かめる。読み終えた後に何を作り、どう確認するかが分かる記事を目的別に探せます。
        </p>
        </header>
        <ArticleBrowser groups={getHubGroups()} />
        <section className="hub-project-cta">
        <div>
          <span className="system-label">READ → BUILD</span>
          <h2>自分のゲーム条件へ置き換える</h2>
          <p>
            記事の一般手順を、あなたのゲームの今日の作業・Prompt・完了条件へ変換します。
          </p>
        </div>
        <Link className="button" href="/project">
          制作手順を作る
        </Link>
        </section>
      </div>
    </div>
  );
}
