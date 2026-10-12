import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const origin = process.env.ARTICLE_HELP_BASE_URL ?? "http://127.0.0.1:3100";
const production = origin === "https://game-ai-hub.vercel.app";
const evidence = process.env.ARTICLE_HELP_EVIDENCE ?? "test-results/browser-game-article-help";
const previewGuidance = "画面が変わらない場合は、この記事の「6. 動かないときは症状から1つ戻る」を確認し、押した操作・期待した表示・実際の表示・エラーを添えてAIに相談してください。";
const errorGuidance = "「エラー概要をコピー」で内容をコピーし、押した操作・期待した表示・実際の表示と一緒に、利用するAIの入力欄へ貼り付けて相談してください。";

for (const view of [
  { name: "desktop", width: 1280, height: 900, textScale: 1 },
  { name: "375", width: 375, height: 812, textScale: 1 },
  { name: "320", width: 320, height: 740, textScale: 1 },
  { name: "320-root-font-200", width: 320, height: 740, textScale: 2 },
]) {
  test(`browser game article: manual help, real errors, copy and recovery at ${view.name}`, async ({ page, context }) => {
    test.setTimeout(120_000);
    await mkdir(evidence, { recursive: true });
    const pageErrors: string[] = [];
    const analyticsRequests: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("request", (request) => {
      if (/google-analytics\.com|googletagmanager\.com/.test(request.url())) analyticsRequests.push(request.url());
    });
    await page.setViewportSize(view);
    // Every production case has a fresh context; this must be its first navigation.
    if (production) {
      await page.goto(`${origin}/privacy/?gameai_analytics=off`);
      await expect.poll(() => page.evaluate(() => ({
        excluded: window.__gameAIAnalyticsExcluded,
        eligible: window.__gameAIAnalyticsEligible,
        gtag: typeof window.gtag,
      }))).toEqual({ excluded: true, eligible: false, gtag: "undefined" });
    }
    await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin });
    await page.goto(`${origin}/articles/ai-browser-game-how-to/`);
    if (view.textScale === 2) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
    if (production) await expect.poll(() => page.evaluate(() => window.__gameAIAnalyticsExcluded)).toBe(true);
    const editor = page.getByLabel("ゲームのコード", { exact: true });
    const starter = await editor.inputValue();
    const show = page.getByRole("button", { name: "ゲームを表示", exact: true });
    const frame = page.frameLocator('iframe[title="作ったゲームの動作確認"]');
    const guidance = page.locator(".beginner-game-preview > p");
    const alert = page.locator(".beginner-runtime-error");
    const geometry: object[] = [];
    const capture = async (state: string, selector: string) => {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.locator(selector).evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "center" }));
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
      geometry.push({ state, ...dimensions });
      await page.screenshot({ path: path.join(evidence, `${view.name}-${state}.png`) });
    };
    const fight = async () => {
      await page.locator("iframe").evaluate((element) => element.scrollIntoView({ behavior: "instant", block: "center" }));
      await frame.locator("#fight").click();
    };

    await show.click();
    await expect(guidance).toContainText(previewGuidance);
    await expect(page.locator(".beginner-workspace")).not.toContainText(/ここで詰まった|相談例をコピー|自動で渡/);
    await expect(page.getByRole("heading", { name: "6. 動かないときは症状から1つ戻る", exact: true })).toHaveCount(1);
    await expect(frame.locator("#enemyHp")).toHaveText("18");
    await fight();
    await expect(frame.locator("#playerHp")).toHaveText("20");
    await expect(frame.locator("#enemyHp")).toHaveText("12");
    await page.getByRole("button", { name: "この版は動いたと記録", exact: true }).click();
    await capture("normal-guidance", ".beginner-game-preview > p");

    for (const kind of ["error", "rejection"] as const) {
      const message = kind === "error" ? "ARTICLE_HELP_QA_ERROR" : "ARTICLE_HELP_QA_REJECTION_".padEnd(600, "X");
      const failure = kind === "error" ? `throw new Error("${message}");` : `return Promise.reject(new Error("${message}"));`;
      const broken = starter.replace('fight.addEventListener("click", () => {', `fight.addEventListener("click", () => { ${failure}`);
      expect(broken).not.toBe(starter);
      await editor.fill(broken);
      await show.click();
      await fight();
      await expect(alert).toContainText(message);
      await expect(alert).toContainText(errorGuidance);
      await expect(frame.locator("#enemyHp")).toHaveText("18");
      const copy = alert.getByRole("button", { name: "エラー概要をコピー", exact: true });
      await expect(copy).toBeVisible();
      await copy.click();
      await expect(alert.getByRole("status")).toHaveText("エラー概要をコピーしました。");
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(`ゲーム内エラー: ${message}`);
      await capture(kind, ".beginner-runtime-error");
      await page.getByRole("button", { name: "動いた版へ戻す", exact: true }).click();
      await expect(editor).toHaveValue(starter);
      await expect(alert).toHaveCount(0);
      await fight();
      await expect(frame.locator("#enemyHp")).toHaveText("12");
    }

    // Re-display corrected source and check the article's full completion criteria.
    await editor.fill(starter);
    await show.click();
    for (const [player, enemy] of [[20, 12], [16, 6], [16, 0]]) {
      await fight();
      await expect(frame.locator("#playerHp")).toHaveText(String(player));
      await expect(frame.locator("#enemyHp")).toHaveText(String(enemy));
    }
    await expect(frame.locator("#message")).toHaveText("スライムに勝った！");
    await expect(frame.locator("#fight")).toBeDisabled();
    await frame.locator("#reset").click();
    await expect(frame.locator("#fight")).toBeEnabled();
    await expect(frame.locator("#playerHp")).toHaveText("24");
    await expect(frame.locator("#enemyHp")).toHaveText("18");
    await expect(alert).toHaveCount(0);
    await capture("recovered", ".beginner-game-preview > p");
    expect(pageErrors.filter((message) => !message.startsWith("ARTICLE_HELP_QA_"))).toEqual([]);
    expect(analyticsRequests).toEqual([]);
    await writeFile(path.join(evidence, `${view.name}-results.json`), JSON.stringify({
      pass: true, origin, production, view, geometry, intentionalFixtureErrors: pageErrors,
      analyticsRequests, clipboard: "real browser read/write", restoredStarter: true,
    }, null, 2) + "\n");
  });
}
