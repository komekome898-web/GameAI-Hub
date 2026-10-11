import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, "article-browser");
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.BUILDIARY_CHROMIUM || "/usr/bin/chromium" });
const result = { browser: browser.version(), date: new Date().toISOString(), method: "local production build; CSS viewport widths; effective160px/DPR2 is reflow stress, not native browser zoom or a physical device", viewports: [] };
try {
  for (const width of [1280, 375, 320, 160]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: width === 160 ? 2 : 1 });
    await page.goto(`${process.env.BUILDIARY_LOCAL_URL || "http://127.0.0.1:3105"}/articles/ai-html-game-not-working/`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.getByRole("complementary", { name: "この記事の読み方" }).waitFor();
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.screenshot({ path: path.join(output, `viewport-${width}-top.png`) });
    await page.locator("#selector").screenshot({ path: path.join(output, `viewport-${width}-selector-section.png`) });
    await page.getByText("ゲームの実演とコードを開く", { exact: true }).click();
    await page.getByRole("button", { name: "ゲームを表示", exact: true }).click();
    const game = page.frameLocator("iframe");
    await game.locator("#enemyName").getByText("スライム", { exact: true }).waitFor();
    const iframe = page.locator("iframe");
    await iframe.scrollIntoViewIfNeeded();
    const iframeBox = await iframe.boundingBox();
    const resetBefore = await game.locator("#reset").boundingBox();
    const innerScrollBefore = await game.locator("html").evaluate((html) => html.ownerDocument.defaultView.scrollY);
    await page.mouse.move(iframeBox.x + iframeBox.width / 2, iframeBox.y + iframeBox.height / 2);
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(250);
    const resetAfter = await game.locator("#reset").boundingBox();
    const iframeBoxAfter = await iframe.boundingBox();
    const innerScrollAfter = await game.locator("html").evaluate((html) => html.ownerDocument.defaultView.scrollY);
    const resetReachableByOrdinaryWheel = resetAfter.y >= iframeBoxAfter.y && resetAfter.y + resetAfter.height <= iframeBoxAfter.y + iframeBoxAfter.height;
    if (!resetReachableByOrdinaryWheel) throw new Error(`Reset unreachable by wheel at ${width}`);
    await page.locator(".beginner-game-preview").screenshot({ path: path.join(output, `viewport-${width}-demo.png`) });
    const host = await page.evaluate(() => ({ viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    const frame = await game.locator("main").evaluate((main) => ({ viewport: main.ownerDocument.defaultView.innerWidth, scrollWidth: main.ownerDocument.documentElement.scrollWidth, heading: main.querySelector("h1").textContent, phrases: [...main.querySelectorAll("h1 span")].map((span) => span.textContent) }));
    result.viewports.push({ width, host, frame, resetBefore, resetAfter, iframeBoxBefore: iframeBox, iframeBoxAfter, innerScrollBefore, innerScrollAfter, resetReachableByOrdinaryWheel });
    await page.close();
  }
} finally {
  await browser.close();
  writeFileSync(path.join(output, "visual-metrics.json"), JSON.stringify(result, null, 2) + "\n");
}
console.log(JSON.stringify(result.viewports));
