import type { Metadata } from "next";
import Link from "next/link";
import { articleCategoryLabels, getArticle } from "@/data/articles";
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
const groups = [
  {
    id: "start",
    label: "START",
    title: "AIでゲームを作り始める",
    description:
      "まず動く小さなゲームを作り、AIへ渡す条件と完了基準を決めます。",
    slugs: [
      "ai-browser-game-how-to",
      "before-asking-ai-build-game",
      "github-beginner-game-development",
    ],
  },
  {
    id: "voice",
    label: "VOICE",
    title: "ゲーム音声を作る・公開条件を確かめる",
    description:
      "代表セリフの制作から商用公開前の権利確認まで、順番に判断します。",
    slugs: [
      "elevenlabs-game-development-guide",
      "elevenlabs-commercial-use-game",
    ],
  },
  {
    id: "3d",
    label: "3D ASSETS",
    title: "3Dアセットを作る・費用と権利を確かめる",
    description:
      "1点の生成と取り込みを先に試し、料金とライセンスを別々に確認します。",
    slugs: [
      "meshy-game-development-guide",
      "meshy-pricing-credits-game",
      "meshy-commercial-use-game",
    ],
  },
  {
    id: "practice",
    label: "VERIFY",
    title: "AIの結果を検証して次へ進む",
    description:
      "AIの「できた」を鵜呑みにせず、失敗から制作の進め方を整えます。",
    slugs: [
      "ai-completion-claim",
      "ai-delegation-trap",
      "small-first-success",
      "ai-usage-guide",
    ],
  },
] as const;
export default function ArticlesPage() {
  return (
    <div className="page-shell article-hub">
      <header className="page-head">
        <p className="eyebrow">AI GAME DEVELOPMENT LIBRARY</p>
        <h1>
          今の制作判断から、
          <br />
          次に読む記事を選ぶ
        </h1>
        <p className="lead">
          作り始める、音声を入れる、3Dを作る、公開条件を確かめる。検索意図ごとに、次の作業へつながる記事をまとめました。
        </p>
        <nav className="hub-jumps" aria-label="記事カテゴリ">
          <a href="#start">作り始める</a>
          <a href="#voice">音声</a>
          <a href="#3d">3D</a>
          <a href="#practice">検証</a>
        </nav>
      </header>
      {groups.map((group) => (
        <section
          key={group.id}
          id={group.id}
          className="article-cluster"
          aria-labelledby={`${group.id}-title`}
        >
          <div className="section-head">
            <div>
              <span className="system-label">{group.label}</span>
              <h2 id={`${group.id}-title`}>{group.title}</h2>
            </div>
            <p>{group.description}</p>
          </div>
          <div className="article-cluster-grid">
            {group.slugs.map((slug, index) => {
              const article = getArticle(slug);
              if (!article) return null;
              return (
                <Link key={slug} href={`/articles/${slug}/`}>
                  <span>
                    {index === 0
                      ? "まず読む"
                      : articleCategoryLabels[article.category]}{" "}
                    · 更新 {article.updatedAt}
                  </span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <b>この記事を読む →</b>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
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
  );
}
