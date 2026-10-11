import { test, expect } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { htmlGameDebugExamples } from "../data/html-game-debug-examples";

const evidence = path.resolve(process.env.BUILDIARY_EVIDENCE_DIR ?? "docs/research/html-game-debug/article-browser");
mkdirSync(evidence, { recursive: true });

for (const width of [1280, 375, 320]) {
  test(`HTML game diagnosis and replay at ${width}px`, async ({ page, request }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const failedResources: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("response", (response) => { if (response.status() >= 400) failedResources.push(new URL(response.url()).pathname); });
    await page.goto("/articles/ai-html-game-not-working/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("AIで作ったHTMLゲームが動かないときの直し方");
    const robots = await page.locator('meta[name="robots"]').evaluateAll((elements) => elements.map((element) => element.getAttribute("content") ?? "").join(","));
    expect(robots).not.toMatch(/noindex|nofollow/);
    await expect(page.getByText("公開準備中の草稿です。", { exact: false })).toHaveCount(0);
    await page.screenshot({ path: path.join(evidence, `article-${width}-closed.png`), fullPage: true });
    await page.getByRole("link", { name: "1回目は遊べるが、やり直すと反応しない", exact: true }).click();
    await expect(page.locator("#reset > h2")).toBeInViewport();
    await page.getByText("ゲームの実演とコードを開く", { exact: true }).click();
    await expect(page.getByText("このページに「ここで詰まった」ボタンはありません。", { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "AIへの相談例", exact: true })).toHaveAttribute("href", "#ask-ai");
    const records: object[] = [];
    for (const example of htmlGameDebugExamples) {
      await page.getByLabel("試す例を選ぶ").selectOption(example.id);
      await expect(page.getByLabel("ゲームのコード")).toHaveValue(example.code);
      const countBefore = pageErrors.length;
      await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
      const frame = page.frameLocator('iframe[title="作ったゲームの動作確認"]');
      await expect(frame.locator("#playerHp")).toHaveText("24");
      await expect(frame.locator("#enemyHp")).toHaveText("18");
      const snapshot = async () => frame.locator("main").evaluate((main) => {
        const doc = main.ownerDocument;
        const fight = doc.querySelector<HTMLButtonElement>("#fight")!;
        const h1 = doc.querySelector("h1")!;
        return { player: doc.querySelector("#playerHp")!.textContent, enemy: doc.querySelector("#enemyHp")!.textContent, name: doc.querySelector("#enemyName")!.textContent, message: doc.querySelector("#message")!.textContent, disabled: fight.disabled, viewport: doc.defaultView!.innerWidth, scrollWidth: doc.documentElement.scrollWidth, heading: h1.textContent, headingSpans: Array.from(h1.querySelectorAll("span"), (span) => ({ text: span.textContent, top: span.getBoundingClientRect().top - h1.getBoundingClientRect().top })) };
      });
      const initial = await snapshot();
      expect(initial.scrollWidth).toBe(initial.viewport);
      await page.locator('iframe[title="作ったゲームの動作確認"]').screenshot({ path: path.join(evidence, `${example.id}-${width}-initial.png`) });
      if (example.id === "syntax-broken" || example.id === "selector-broken") {
        const error = page.locator(".beginner-runtime-error");
        await expect(error).toContainText(example.id === "syntax-broken" ? "Unexpected token" : "Cannot read properties of null");
        await expect(frame.locator("#enemyName")).toHaveText(example.id === "syntax-broken" ? "" : "スライム");
        await frame.locator("#fight").click();
        await frame.locator("#reset").click();
        expect(await snapshot()).toEqual(initial);
        await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
        await expect(page.locator(".beginner-runtime-error")).toBeVisible();
        expect(pageErrors.slice(countBefore)).toHaveLength(2);
      } else {
        for (let round = 1; round <= 2; round++) {
          for (const [player, enemy] of [[20, 12], [16, 6], [16, 0]]) {
            await frame.locator("#fight").click();
            await expect(frame.locator("#playerHp")).toHaveText(String(player));
            await expect(frame.locator("#enemyHp")).toHaveText(String(enemy));
          }
          await expect(frame.locator("#message")).toHaveText("スライムに勝った！");
          await expect(frame.locator("#fight")).toBeDisabled();
          const before = await snapshot();
          const box = await frame.locator("#fight").boundingBox();
          await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
          expect(await snapshot()).toEqual(before);
          await frame.locator("#reset").click();
          await expect(frame.locator("#playerHp")).toHaveText("24");
          await expect(frame.locator("#enemyHp")).toHaveText("18");
          if (example.id === "reset-broken") {
            await expect(frame.locator("#fight")).toBeDisabled();
            const reset = await snapshot();
            const b = await frame.locator("#fight").boundingBox();
            await page.mouse.click(b!.x + b!.width / 2, b!.y + b!.height / 2);
            expect(await snapshot()).toEqual(reset);
            break;
          }
          await expect(frame.locator("#fight")).toBeEnabled();
        }
        await expect(page.locator(".beginner-runtime-error")).toHaveCount(0);
        expect(pageErrors.slice(countBefore)).toEqual([]);
        await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
        await expect(frame.locator("#fight")).toBeEnabled();
        await frame.locator("#fight").click();
        await expect(frame.locator("#playerHp")).toHaveText("20");
        await expect(frame.locator("#enemyHp")).toHaveText("12");
      }
      records.push({ id: example.id, initial, errors: pageErrors.slice(countBefore), pass: true });
    }
    // The warning precedes the selector; unrun edits are not persisted by the shared workspace.
    const switchHelp = page.getByText("例を切り替えると、まだ実行していない編集は消えます。", { exact: false });
    await expect(switchHelp).toBeVisible();
    await expect(page.getByLabel("試す例を選ぶ")).toHaveAccessibleDescription(/切り替える前に「ゲームを表示」/);
    expect(await page.getByLabel("試す例を選ぶ").evaluate((select) => {
      const help = document.getElementById(select.getAttribute("aria-describedby")!);
      return Boolean(help && (help.compareDocumentPosition(select) & Node.DOCUMENT_POSITION_FOLLOWING));
    })).toBe(true);
    await page.getByLabel("ゲームのコード").fill(htmlGameDebugExamples[0].code.replace('"スライム"', '"未実行スライム"'));
    await page.getByLabel("試す例を選ぶ").selectOption("original");
    await page.getByLabel("試す例を選ぶ").selectOption("reset-repaired");
    await expect(page.getByLabel("ゲームのコード")).toHaveValue(htmlGameDebugExamples[0].code);
    // Executed edits return from storage; restore remains explicit.
    await page.getByLabel("ゲームのコード").fill(htmlGameDebugExamples[0].code.replace('"スライム"', '"炎スライム"'));
    await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
    await page.getByLabel("試す例を選ぶ").selectOption("original");
    await page.getByLabel("試す例を選ぶ").selectOption("reset-repaired");
    await expect(page.getByLabel("ゲームのコード")).toHaveValue(/炎スライム/);
    await page.getByRole("button", { name: "掲載完成例へ戻す", exact: true }).click();
    await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
    await expect(page.frameLocator("iframe").locator("#enemyName")).toHaveText("スライム");
    if (width === 1280) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("button", { name: "index.htmlを保存", exact: true }).click(),
      ]);
      expect(download.suggestedFilename()).toBe("index.html");
      expect(readFileSync((await download.path())!, "utf8")).toBe(htmlGameDebugExamples.find((example) => example.id === "reset-repaired")!.code);
    }
    await page.screenshot({ path: path.join(evidence, `article-${width}-expanded.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/articles/ai-html-game-not-working/");
    await page.goto("/articles/");
    await page.getByRole("link", { name: /すべての記事を見る/ }).click();
    await expect(page.locator('a[href="/articles/ai-html-game-not-working/"]').first()).toBeVisible();
    expect(failedResources.filter((resource) => resource !== "/favicon.ico")).toEqual([]);
    const unexpectedConsole = consoleErrors.filter((message) => message !== "Unrecognized Content-Security-Policy directive 'navigate-to'." && !message.includes("status of 404 (Not Found)"));
    expect(unexpectedConsole).toEqual([]);
    writeFileSync(path.join(evidence, `results-${width}.json`), JSON.stringify({ width, cases: records, pageErrors, consoleErrors, failedResources, unexpectedConsole, downloadExactCurrentCodeVerified: width === 1280, publishedIncludedInListingAndSitemap: true, pass: true }, null, 2) + "\n");
  });
}

test("original article keeps victory disabling and second-round replay", async ({ page }) => {
  const errors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/articles/ai-browser-game-how-to/");
  await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
  const game = page.frameLocator("iframe");
  await expect(game.locator("#playerHp")).toHaveText("24");
  await expect(game.locator("#enemyHp")).toHaveText("18");
  for (let round = 0; round < 2; round++) {
    for (const [player, enemy] of [[20, 12], [16, 6], [16, 0]]) {
      await game.locator("#fight").click();
      await expect(game.locator("#playerHp")).toHaveText(String(player));
      await expect(game.locator("#enemyHp")).toHaveText(String(enemy));
    }
    await expect(game.locator("#fight")).toBeDisabled();
    await game.locator("#reset").click();
    await expect(game.locator("#fight")).toBeEnabled();
    await expect(game.locator("#playerHp")).toHaveText("24");
    await expect(game.locator("#enemyHp")).toHaveText("18");
  }
  await page.reload();
  await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
  await expect(game.locator("#playerHp")).toHaveText("24");
  expect(errors).toEqual([]);
  writeFileSync(path.join(evidence, "original-article-results.json"), JSON.stringify({ pass: true, errors, consoleErrors, originalSourceUnchanged: true }, null, 2) + "\n");
});
