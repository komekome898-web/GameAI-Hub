import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedGame, getPublishedGames, gameMetadata, gamePath } from "@/data/games";
import { ArticleReturnLink } from "@/components/ArticleReturnLink";
import { GamePlayLink } from "@/components/GamePlayLink";
import { absoluteSiteUrl } from "@/lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return getPublishedGames().map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const game = getPublishedGame((await params).slug);
  if (!game) notFound();
  return gameMetadata(game);
}
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const game = getPublishedGame((await params).slug);
  if (!game) notFound();
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "VideoGame", "@id": absoluteSiteUrl(gamePath(game)), name: game.title, description: game.description, url: game.playUrl, image: absoluteSiteUrl(game.image.src), genre: game.genre, author: { "@type": "Person", name: game.author.name, ...(game.author.socialUrl ? { sameAs: game.author.socialUrl } : {}) } }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "ホーム", item: absoluteSiteUrl("/") }, { "@type": "ListItem", position: 2, name: "AIで作ったゲームを遊ぶ", item: absoluteSiteUrl("/articles/#games") }, { "@type": "ListItem", position: 3, name: game.title, item: absoluteSiteUrl(gamePath(game)) }] }] };
  return <div className="visual-layer-v2"><div className="page-shell article-shell game-detail">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav className="breadcrumbs" aria-label="パンくず"><Link href="/">ホーム</Link><span aria-hidden="true"> / </span><ArticleReturnLink slug={game.slug} purpose="games" label="作品一覧へ戻る" /><span aria-hidden="true"> / </span><span>{game.title}</span></nav>
    <article className="article-content">
      <header className="page-head"><p className="eyebrow">AIで作ったゲームを遊ぶ</p><h1>{game.title}</h1><p className="lead">{game.description}</p><p>{game.genre}</p>
        <figure className="game-hero"><Image src={game.image.src} width={game.image.width} height={game.image.height} sizes="(max-width: 767px) 100vw, 760px" alt={game.image.alt} /><figcaption>{game.image.credit}</figcaption></figure>
        <GamePlayLink href={game.playUrl} slug={game.slug} placement="top" />
      </header>
      <section><h2>どんなゲーム？</h2><p>{game.about}</p><h3>見どころ</h3><ul>{game.highlights.map(text => <li key={text}>{text}</li>)}</ul></section>
      <section><h2>遊び方と操作</h2><ol>{game.howToPlay.map(text => <li key={text}>{text}</li>)}</ol><p>{game.controls}</p><h3>確認した環境</h3><p>{game.platformNote}</p><ul>{game.verifiedDevices.map(text => <li key={text}>{text}</li>)}</ul><p>上記の確認は、すべての端末・OS・ブラウザでの動作を保証するものではありません。</p><h3>料金・登録条件</h3><p>{game.pricingAndRegistration}</p></section>
      <section><h2>作者と制作の工夫</h2><p>作者：{game.author.name}{game.author.socialUrl && <> · <a href={game.author.socialUrl} target="_blank" rel="noopener noreferrer">{game.author.socialLabel ?? "作者のSNS"}</a></>}</p><h3>使ったAIと役割</h3><dl>{game.aiRoles.map(ai => <div key={ai.name}><dt>{ai.name}</dt><dd>{ai.role}</dd></div>)}</dl><h3>人が確かめ、工夫したこと</h3><p>{game.humanContribution}</p>{game.productionArticle && <p>{game.productionArticle.href.startsWith("/") ? <Link href={game.productionArticle.href}>{game.productionArticle.title} →</Link> : <a href={game.productionArticle.href} target="_blank" rel="noopener noreferrer">{game.productionArticle.title} ↗<span className="sr-only">（外部サイト・新しいタブ）</span></a>}</p>}</section>
      <section><h2>ゲームを遊んでみる</h2><GamePlayLink href={game.playUrl} slug={game.slug} placement="bottom" /><p><ArticleReturnLink slug={game.slug} purpose="games" label="作品一覧へ戻る" /></p></section>
      <aside className="sources"><p>紹介情報の確認：{game.updatedAt}</p><ul>{game.sources.map(source => <li key={source.href}><a href={source.href}>{source.label}</a></li>)}</ul></aside>
    </article>
  </div></div>;
}
