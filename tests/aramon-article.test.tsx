import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AramonProductionStory, { metadata } from "@/app/articles/aramon-production-story/page";
import { aramonImages, aramonImagesReady } from "@/app/articles/aramon-production-story/images";
import { articles, articlePath, getArticle, getArticleGroups, validateArticles } from "@/data/articles";
import sitemap from "@/app/sitemap";

vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));

const article = getArticle("aramon-production-story")!;
const html = () => renderToStaticMarkup(<AramonProductionStory />);

describe("approved Aramon production story", () => {
  it("preserves historical experience, capture context, and the unexecuted training selection", () => {
    const content = html();
    for (const text of [
      "Claude Pro で Claude Code", "マルチプレイやリアルマップ", "ChatGPT が便利", "Suno",
      "2026 年 10 月 4 日に記事編集時のプレイ確認", "667×375",
      "TIER 2「火炎連砲」", "TIER 3 技は「魔神炎」",
      "今回は選択までを確認し、トレーニングは実行していません",
      "技を試す訓練場と、この育成画面は別の画面です",
    ]) expect(content).toContain(text);
    expect(content).not.toContain("Claude Max");
    expect(content).toContain('href="https://komekome898-web.github.io/aramon/index.html"');
    expect(content).toContain("荒野モン動を遊ぶ");
    expect(content).toContain('href="https://x.com/oryoooo_game"');
    expect(content).toContain('"@type":"Person","name":"おりょう","url":"https://x.com/oryoooo_game"');
  });

  it("stages the exact three image slots without broken image requests or substitute images", () => {
    expect(aramonImagesReady).toBe(false);
    expect(aramonImages.map(photo => photo.src)).toEqual([
      "/images/articles/aramon-production-story/team-flame-barrage.png",
      "/images/articles/aramon-production-story/training-demon-flame.png",
      "/images/articles/aramon-production-story/mastermon-training.jpg",
    ]);
    for (const photo of aramonImages) {
      expect([photo.width, photo.height]).toEqual([667, 375]);
      expect(photo.alt).toBeTruthy();
      expect(html()).toContain(photo.caption);
    }
    expect(aramonImages[0].alt).toContain("TIER 2「火炎連砲」");
    expect(aramonImages[1].alt).toContain("実3Dの訓練場");
    expect(aramonImages[2].alt).toContain("未実行");
    expect(html()).not.toContain("<img");
    expect(html()).toContain("掲載予定の写真3枚は準備中");
  });

  it("keeps this unfinished draft out of listings, sitemap and indexing", () => {
    expect(article.publicationStatus).toBe("draft");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe(articlePath(article));
    expect(metadata.authors).toEqual([{ name: "おりょう" }]);
    expect(getArticleGroups().flatMap(group => group.articles).some(item => item.slug === article.slug)).toBe(false);
    expect(sitemap().some(item => item.url.endsWith(articlePath(article)))).toBe(false);
  });

  it("joins the existing practice flow when published without enabling games or editing other records", () => {
    const candidate = articles.map(item => item.slug === article.slug ? { ...item, publicationStatus: "published" as const } : item);
    expect(validateArticles(candidate)).toEqual([]);
    const groups = getArticleGroups(candidate);
    expect(groups.find(group => group.id === "practice")!.articles.at(-1)?.slug).toBe(article.slug);
    expect(groups.find(group => group.id === "games")!.articles).toEqual([]);
    for (const link of article.related) expect(html()).toContain(`href="${link.href}"`);
    expect(html()).toContain('href="/project?source=aramon-production-story"');
  });
});
