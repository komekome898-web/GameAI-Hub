import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ChatGptCatTapGame, { projectIdea } from "@/app/articles/chatgpt-cat-tap-game/page";
import { articlePath, getArticle, publishedArticles, validateArticles } from "@/data/articles";
import { interpretProjectIdea } from "@/lib/project";

describe("ChatGPT cat-tap article", () => {
  it("publishes one consistent registry entry for the route", () => {
    const article = getArticle("chatgpt-cat-tap-game");
    expect(article).toBeDefined();
    expect(articlePath(article!)).toBe("/articles/chatgpt-cat-tap-game/");
    expect(publishedArticles).toContain(article);
    expect(validateArticles(publishedArticles)).toEqual([]);
  });

  it("keeps cat, tap/click, score increment, and source attribution in the handoff", () => {
    const html = renderToStaticMarkup(<ChatGptCatTapGame />);
    expect(html).toContain("猫をタップ／クリックするたびスコアが1増える");
    expect(html).toContain("スコア0→1→2");
    expect(html).toContain('href="/project?source=chatgpt-cat-tap-game"');

    const details = interpretProjectIdea(projectIdea).detailCandidates;
    expect(details).toContainEqual(expect.objectContaining({ kind: "entity", text: "猫" }));
    expect(details).toContainEqual(expect.objectContaining({
      kind: "core-mechanic",
      text: "タップ/クリックで得点を増やす",
    }));
    expect(details).toContainEqual(expect.objectContaining({
      kind: "core-loop",
      text: "猫をタップ/クリック → 得点を1増やす",
    }));
    expect(details).not.toContainEqual(expect.objectContaining({ text: "戦闘" }));
    expect(details).not.toContainEqual(expect.objectContaining({ text: expect.stringMatching(/移動|ゴール|収集/) }));
  });
});
