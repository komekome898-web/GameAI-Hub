import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/articles/ai-browser-game-how-to/page.tsx", "utf8");

describe("browser article reconciliation", () => {
  it("keeps the SEO title and AI Iterproof reader-facing brand", () => {
    expect(page).toContain("AIでブラウザゲームを作る方法【初心者向け】1つのHTMLをAIで作って動かす");
    expect(page).toContain("AI Iterproof");
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
});
