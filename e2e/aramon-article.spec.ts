import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "./fixtures";

const output = "docs/screenshots/aramon-production-story";
const route = "/articles/aramon-production-story/";
const viewports = [
  { name: "mobile-375", width: 375, height: 812, rootScale: 1 },
  { name: "desktop", width: 1280, height: 900, rootScale: 1 },
  { name: "mobile-320", width: 320, height: 640, rootScale: 1 },
  { name: "mobile-320-root-text-200", width: 320, height: 640, rootScale: 2 },
];

for (const viewport of viewports) {
  test(`Aramon approved article, images and handoffs — ${viewport.name}`, async ({ page }) => {
    await mkdir(output, { recursive: true });
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(route);
    if (viewport.rootScale === 2) {
      await page.evaluate(() => {
        const root = document.documentElement;
        root.style.fontSize = `${parseFloat(getComputedStyle(root).fontSize) * 2}px`;
      });
    }
    await expect(page.getByRole("heading", { level: 1 })).toContainText("荒野モン動を作った流れ");
    await expect(page.getByRole("navigation", { name: "この記事の目次" })).toBeVisible();
    await expect(page.locator(".article-content")).toContainText("Claude Pro で Claude Code");
    await expect(page.locator(".article-content")).toContainText("今回は選択までを確認し、トレーニングは実行していません");
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    const photos = page.locator(".article-content figure img");
    await expect(photos).toHaveCount(3);
    for (const photo of await photos.all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    }
    const dimensions = await photos.evaluateAll(images => images.map(node => {
      const img = node as HTMLImageElement;
      const box = img.getBoundingClientRect();
      return { src: img.getAttribute("src"), alt: img.alt, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, width: box.width, height: box.height };
    }));
    for (const img of dimensions) {
      expect(img.width / img.height).toBeCloseTo(667 / 375, 2);
      expect(img.naturalWidth / img.naturalHeight).toBeCloseTo(667 / 375, 2);
      expect(img.alt).toBeTruthy();
    }
    await expect(page.locator("figcaption")).toHaveText([
      "リアルマップ「荒野」の TEAM 戦で、TIER 2「火炎連砲」を発射している場面",
      "訓練場で TIER 3「魔神炎」を発動した場面",
      "トレーニング画面で「猛勉強」を選択した状態",
    ]);
    await expect(page.getByRole("link", { name: "荒野モン動を遊ぶ" })).toHaveAttribute("href", "https://komekome898-web.github.io/aramon/index.html");
    await expect(page.getByRole("link", { name: "@oryoooo_game", exact: true })).toHaveAttribute("href", "https://x.com/oryoooo_game");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `${output}/article-${viewport.name}.png`, fullPage: true });
    await writeFile(`${output}/metrics-${viewport.name}.json`, JSON.stringify({ viewport, physicalDevice: false, textMethod: viewport.rootScale === 2 ? "synthetic root font 200%" : "none", dimensions, errors }, null, 2));
    const cta = page.getByRole("link", { name: "自分のゲームの最初の制作手順を作る", exact: true }).first();
    await cta.click();
    await expect(page).toHaveURL(/\/project\/?\?source=aramon-production-story/);
    await page.goto("/articles/#all");
    const articleLink = page.getByRole("link", { name: /Claude とのチャットから Claude Code へ 荒野モン動/ });
    await expect(articleLink).toHaveAttribute("href", route);
    await expect(page.locator('a[href="#games"]')).toHaveCount(0);
    await articleLink.locator("strong").click();
    await expect(page).toHaveURL(/\/articles\/aramon-production-story\//);
    await page.getByRole("navigation", { name: "パンくず" }).getByRole("link", { name: "記事", exact: true }).click();
    await expect(page).toHaveURL(/\/articles\/.+#all/);
  });
}
