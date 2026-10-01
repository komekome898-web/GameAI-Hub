import type { Metadata } from "next";
import Link from "next/link";
import { articleCategoryLabels, getArticle } from "@/data/articles";
import {
  getStartArticleVisual,
  type StartArticleSlug,
} from "@/lib/article-visuals";
import { CreationDeck } from "@/components/CreationDeck";
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

const intents = [
  {
    href: "#start",
    label: "最初のゲームを動かす",
    detail: "1ファイルの小さなゲームから、確認と修正の流れを覚える",
  },
  {
    href: "#voice",
    label: "音声・3Dを制作へ入れる",
    detail: "代表素材を1点作り、実際のゲーム内で採用可否を確かめる",
  },
  {
    href: "#practice",
    label: "料金・権利・AIの結果を確かめる",
    detail: "公開や購入の前に、一次資料と観察できる結果で判断する",
  },
] as const;

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
        <nav className="hub-intents" aria-label="制作目的から記事を選ぶ">
          {intents.map((intent, index) => (
            <a href={intent.href} key={intent.href}>
              <span>0{index + 1}</span>
              <strong>{intent.label}</strong>
              <small>{intent.detail}</small>
            </a>
          ))}
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
          {group.id === "start" ? <CreationDeck items={group.slugs.map((slug, index) => {
            const article = getArticle(slug)!;
            const visual = getStartArticleVisual(slug as StartArticleSlug);
            return { href: `/articles/${slug}/`, title: article.title, description: article.description, updatedAt: article.updatedAt, label: index === 0 ? "この目的の入口" : articleCategoryLabels[article.category], image: visual };
          })} /> : <ol className="article-cluster-list">
            {group.slugs.map((slug, index) => {
              const article = getArticle(slug);
              if (!article) return null;
              return (
                <li key={slug}>
                  <Link href={`/articles/${slug}/`}>
                    <span className="article-row-order">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="article-row-copy">
                      <small>
                        {index === 0
                          ? "この目的の入口"
                          : articleCategoryLabels[article.category]}{" "}
                        · 更新 {article.updatedAt}
                      </small>
                      <strong>{article.title}</strong>
                      <span>{article.description}</span>
                    </span>
                    <b aria-hidden="true">→</b>
                  </Link>
                </li>
              );
            })}
          </ol>}
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
    </div>
  );
}
