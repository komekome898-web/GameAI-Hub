import { expect, test } from "./fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";

const startHrefs = [
  "/articles/ai-browser-game-how-to/",
  "/articles/before-asking-ai-build-game/",
  "/articles/github-beginner-game-development/",
];

test("V1 keeps the article hub static, complete, and responsive", async ({
  browser,
}) => {
  test.setTimeout(90_000);
  for (const viewport of [
    { width: 320, height: 844 },
    { width: 375, height: 844 },
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport });
    const backgroundRequests: string[] = [];
    const page = await context.newPage();
    page.on("request", (request) => {
      if (request.url().includes("/visual-v2/backgrounds/mint-atrium-"))
        backgroundRequests.push(request.url());
    });
    await page.goto("http://127.0.0.1:3100/articles/");

    await expect(page.locator(".article-cluster-list")).toHaveCount(4);
    await expect(page.locator("#start li > a")).toHaveCount(3);
    expect(await page.locator("#start li > a").evaluateAll((links) => links.map((link) => link.getAttribute("href")))).toEqual(startHrefs);
    await expect(page.locator("#start button")).toHaveCount(0);
    await expect(page.locator("#start img")).toHaveCount(3);
    expect(await page.locator("#start img").evaluateAll((images) => images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);

    const widths = await diagnoseWidths(page);
    expect(widths.documentOverflowPx).toBe(0);
    expect(widths.unownedOverflowingElements).toEqual([]);
    if (viewport.width <= 340) expect(backgroundRequests).toEqual([]);
    else expect(backgroundRequests).toHaveLength(1);
    await context.close();
  }
});

test("V1 remains readable without JavaScript and in forced colors", async ({
  browser,
}) => {
  const noScript = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 844 },
  });
  const noScriptPage = await noScript.newPage();
  await noScriptPage.goto("http://127.0.0.1:3100/articles/");
  await expect(noScriptPage.locator("#start li > a")).toHaveCount(3);
  await expect(noScriptPage.locator("#start .v2-start-card-description")).toHaveCount(3);
  expect((await diagnoseWidths(noScriptPage)).documentOverflowPx).toBe(0);
  await noScript.close();

  const forced = await browser.newContext({ viewport: { width: 375, height: 844 } });
  const forcedPage = await forced.newPage();
  await forcedPage.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await forcedPage.goto("http://127.0.0.1:3100/articles/");
  await expect(forcedPage.locator("#start li > a")).toHaveCount(3);
  await forcedPage.locator("#start li > a").first().focus();
  await expect(forcedPage.locator("#start li > a").first()).toBeFocused();
  expect((await diagnoseWidths(forcedPage)).documentOverflowPx).toBe(0);
  await forced.close();

  const failure = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await failure.route("**/visual-v2/thumbnails/*.webp", (route) => route.abort());
  const failurePage = await failure.newPage();
  await failurePage.goto("http://127.0.0.1:3100/articles/");
  const imageWells = await failurePage.locator("#start .v2-start-card-image").evaluateAll((wells) =>
    wells.map((well) => {
      const box = well.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }),
  );
  expect(imageWells.every((well) => Math.abs(well.width / well.height - 1.5) < 0.02)).toBe(true);
  await expect(failurePage.locator("#start li > a")).toHaveCount(3);
  expect((await diagnoseWidths(failurePage)).documentOverflowPx).toBe(0);
  await failure.close();

  const zoomed = await browser.newContext({ viewport: { width: 320, height: 844 } });
  const zoomedPage = await zoomed.newPage();
  await zoomedPage.goto("http://127.0.0.1:3100/articles/");
  const cdp = await zoomed.newCDPSession(zoomedPage);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  await expect.poll(() => zoomedPage.evaluate(() => window.visualViewport?.scale ?? 1)).toBeGreaterThanOrEqual(1.9);
  await expect(zoomedPage.locator("#start li > a")).toHaveCount(3);
  expect((await diagnoseWidths(zoomedPage)).documentOverflowPx).toBe(0);
  await cdp.detach();
  await zoomed.close();
});

test("mobile menu retains its focus trap and Escape return focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/articles/");
  const menuButton = page.getByRole("button", { name: "メニューを開く" });
  await menuButton.click();
  await expect(page.getByRole("dialog", { name: "サイトメニュー" })).toBeVisible();
  await expect(page.getByRole("button", { name: "メニューを閉じる" }).last()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menuButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("link", { name: "GameAI Hub ホーム" })).toBeFocused();
});
