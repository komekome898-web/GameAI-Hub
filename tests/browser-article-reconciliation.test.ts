import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { articleMetadata, getArticle } from "@/data/articles";

const page = readFileSync("app/articles/ai-browser-game-how-to/page.tsx", "utf8");

describe("browser article reconciliation", () => {
  it("keeps the SEO title and GameBuildiary reader-facing brand", () => {
    const article = getArticle("ai-browser-game-how-to")!;
    expect(article.title).toBe("AIでブラウザゲームを作る方法｜初心者向け1画面バトルの作り方");
    expect(page).toContain("export const metadata = articleMetadata(article)");
    expect(page).toContain("title={article.title}");
    expect(page).not.toMatch(/seoTitle|seoDescription|baseMetadata/);
    expect(articleMetadata(article).title).toBe(article.title);
    expect(article.description).not.toContain("勝敗");
    expect(page).toContain("GameBuildiary");
    expect(page).not.toMatch(/GameAI Hub|>Hub</);
  });

  it("provides an exact generation prompt without an unrequested defeat", () => {
    const prompt = page.slice(page.indexOf("const firstGenerationPrompt"), page.indexOf("const starterGame"));
    for (const term of ["2Dブラウザゲーム", "index.html", "HTML、CSS、JavaScript", "外部ライブラリ", "外部ネットワーク通信", "味方1体と敵1体", "HP", "反撃", "勝利結果", "もう一度", "初心者", "コード全文を省略せず"])
      expect(prompt).toContain(term);
    expect(prompt).not.toMatch(/敗北|負け|勝敗の両方/);
  });

  it("separates variable AI criteria from the deterministic example exercise", () => {
    expect(page).toContain("AI生成版の成功条件（名前や数値は自由）");
    expect(page).toContain("ゴーレム、HPが30と20、damageが5");
    expect(page).toContain("掲載例の名前、HP 24／18、3回で勝利");
    expect(page).toContain("AI生成版ではなく、上の「掲載完成例へ戻す」");
    expect(page).toContain("掲載完成例専用の成功条件");
    for (const checkpoint of ["Step A — 表示", "Step B — HP変化", "Step C — 結果＋もう一度"])
      expect(page).toContain(checkpoint);
  });
  it("explains the displayed version and explicit execution after loading", () => {
    expect(page).toContain("保存されるのは 最後に「ゲームを表示」した版です");
    expect(page).toContain("再表示して動作を確かめてから保存してください");
    expect(page).toContain("ファイルを選び「ゲームを表示」を押します");
    expect(page).toContain("表示枠による保護は引き継がれません");
    expect(page).toContain("個人情報やAPIキー");
  });

  it("keeps GitHub branch completion distinct from integration and preserves return guidance", () => {
    const github = readFileSync("app/articles/github-beginner-game-development/page.tsx", "utf8");
    expect(github).toContain("新しいbranchへ保存しただけでは mainなどの元のbranchに反映されません");
    expect(github).toContain("統合する操作は別に必要です");
    expect(github).toContain("保存したbranchのCode画面にindex.htmlが残っている");
    expect(github).toContain("showProjectCta={false}");
    expect(github).toContain('<ReturnToProject position="start" />');
    expect(github).toContain('<ReturnToProject position="end" />');
    expect(github).toContain("同じ制作状態は復元できません");
    expect(github).toContain("全手順を通した実測はしていない");
    expect(github).toContain("保護設定を外さず 所有者へ確認");
    expect(github).not.toMatch(/GameAI\s+Hub|元のHub|全文をHub/);
    expect(github).toContain('href="/articles/ai-browser-game-how-to/"');
    const article = getArticle("github-beginner-game-development")!;
    expect(article.title).toBe("GitHubの使い方と画面の見方｜初心者がゲームのHTMLを保存するまで");
    expect(articleMetadata(article).alternates?.canonical).toBe("/articles/github-beginner-game-development/");
    expect(new Set(article.sources.map(source => source.url)).size).toBe(article.sources.length);
    expect(article.sources.filter(source => source.verifiedAt === "2026-10-04")).toHaveLength(6);
    expect(article.sources.filter(source => source.verifiedAt === "2026-09-04")).toHaveLength(6);
    expect(article.editorialNote).toContain("その他の項目は今回再確認していません");
    for (const slug of ["ai-browser-game-how-to", "github-beginner-game-development"]) {
      const record = getArticle(slug)!;
      expect(record.updatedAt).toBe("2026-10-04");
      expect(record.lastVerifiedAt).toBe(slug === "ai-browser-game-how-to" ? "2026-09-08" : "2026-10-04");
    }
  });
});
