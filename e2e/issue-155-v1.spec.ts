import { expect, test } from "./fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";

const evidenceDirectory = "docs/screenshots/issue-155-v1/focused-acceptance";

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
    await page.screenshot({
      path: `${evidenceDirectory}/articles-${viewport.width}x${viewport.height}-normal.png`,
      fullPage: true,
    });
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

for (const width of [320, 375]) {
  test(`V1 START cards reflow with synthetic 200% root text at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/articles/");

    const selectors = {
      title: "#start .v2-start-card-face > strong",
      description: "#start .v2-start-card-description",
      label: "#start .v2-start-card-label",
      date: "#start .v2-start-card-meta small",
    };
    const baselineRootPx = await page.evaluate(() => Number.parseFloat(getComputedStyle(document.documentElement).fontSize));
    const baselineSizes = await page.evaluate((targets) => Object.fromEntries(
      Object.entries(targets).map(([name, selector]) => [name, Number.parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize)]),
    ), selectors);

    await page.evaluate((rootPx) => {
      document.documentElement.style.fontSize = `${rootPx * 2}px`;
    }, baselineRootPx);

    const enlargedSizes = await page.evaluate((targets) => Object.fromEntries(
      Object.entries(targets).map(([name, selector]) => [name, Number.parseFloat(getComputedStyle(document.querySelector(selector)!).fontSize)]),
    ), selectors);
    for (const name of Object.keys(selectors))
      expect(enlargedSizes[name], `${name} computed font size`).toBeGreaterThan(baselineSizes[name]);

    const widths = await diagnoseWidths(page);
    expect(widths.documentOverflowPx).toBe(0);
    expect(widths.unownedOverflowingElements).toEqual([]);
    await expect(page.locator("#start li > a")).toHaveCount(3);
    await page.screenshot({
      path: `${evidenceDirectory}/articles-${width}x844-root-text-200.png`,
      fullPage: true,
    });
  });
}

test("V1 START cards contain long Japanese and unbroken ASCII stress content", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/articles/");
  const stress = {
    title: "はじめてのゲーム制作で画面いっぱいに長く続く日本語の題名を読みやすく確認するための検証用タイトル",
    description: "説明文の折り返しを確認します https://example.invalid/" + "unbrokenAsciiToken".repeat(12),
    label: "とても長い日本語の入口ラベル",
  };
  await page.locator("#start .v2-start-card").first().evaluate((card, content) => {
    card.querySelector<HTMLElement>(".v2-start-card-face > strong")!.textContent = content.title;
    card.querySelector<HTMLElement>(".v2-start-card-description")!.textContent = content.description;
    card.querySelector<HTMLElement>(".v2-start-card-label")!.textContent = content.label;
  }, stress);

  const firstCard = page.locator("#start .v2-start-card").first();
  await expect(firstCard).toHaveCount(1);
  await expect(firstCard.locator(".v2-start-card-face > strong")).toHaveText(stress.title);
  await expect(firstCard.locator(".v2-start-card-description")).toHaveText(stress.description);
  await expect(firstCard.locator(".v2-start-card-label")).toHaveText(stress.label);
  const geometry = await firstCard.evaluate((card) => {
    const cardRect = card.getBoundingClientRect();
    const labelRect = card.querySelector<HTMLElement>(".v2-start-card-label")!.getBoundingClientRect();
    const dateRect = card.querySelector<HTMLElement>(".v2-start-card-meta small")!.getBoundingClientRect();
    const textFits = [...card.querySelectorAll<HTMLElement>("strong, .v2-start-card-description, .v2-start-card-label, small")]
      .every((element) => element.scrollWidth <= element.clientWidth + 1 && element.scrollHeight <= element.clientHeight + 1);
    const descendantsContained = [...card.querySelectorAll<HTMLElement>("*")].every((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= cardRect.left - 1 && rect.right <= cardRect.right + 1;
    });
    return {
      textFits,
      descendantsContained,
      metadataGapPx: dateRect.left - labelRect.right,
    };
  });
  expect(geometry.textFits).toBe(true);
  expect(geometry.descendantsContained).toBe(true);
  expect(geometry.metadataGapPx).toBeGreaterThanOrEqual(0);
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  expect((await diagnoseWidths(page)).unownedOverflowingElements).toEqual([]);
  await firstCard.focus();
  await expect(firstCard).toBeFocused();
  expect(await firstCard.evaluate((card) => {
    const style = getComputedStyle(card);
    return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) > 0;
  })).toBe(true);
  await expect(page.locator("#start li").first().locator("a")).toHaveCount(1);
  await page.screenshot({
    path: `${evidenceDirectory}/articles-320x844-long-content.png`,
    fullPage: true,
  });
});

test("mobile menu returns focus on Escape and preserves surrounding keyboard order", async ({
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
