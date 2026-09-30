import { expect, test } from "./fixtures";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const evidence = path.join(process.cwd(), "docs/evidence/issue-157-stage-b/screenshots");

test("shared visual layer reflows across representative routes", async ({ page }) => {
  test.setTimeout(90_000);
  await mkdir(evidence, { recursive: true });
  for (const width of [320, 375, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    for (const [name, route, selector] of [
      ["home", "/", ".home-execution-hero"],
      ["project", "/project/", ".project-start-page"],
      ["tools", "/tools/", ".tools-explorer"],
      ["compare", "/compare/", ".compare-page"],
      ["articles", "/articles/", ".article-hub"],
    ] as const) {
      await page.goto(route);
      await expect(page.locator(selector)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      if (width === 390 || width === 1440) await page.screenshot({ path: path.join(evidence, `${name}-${width}.png`), fullPage: true });
    }
  }
});

test("Creation Deck is explicit, preserves links, and retains a list fallback", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/articles/#start");
  const deck = page.locator("#start .creation-deck");
  const links = deck.locator("ol > li > a");
  await expect(links).toHaveCount(3);
  await expect(deck).toHaveAttribute("data-mode", "list");
  await page.getByRole("button", { name: "円環で見る" }).click();
  await expect(deck).toHaveAttribute("data-mode", "deck");
  const stage = deck.locator("ol");
  const followingSection = page.locator("#start").locator("xpath=following-sibling::section[1]");
  const sampleGeometry = async () => page.evaluate(() => new Promise<{ stage: number; next: number; content: number }[]>((resolve) => {
    const samples: { stage: number; next: number; content: number }[] = [];
    const collect = () => {
      const stageElement = document.querySelector("#start .creation-deck ol");
      const next = document.querySelector("#start")?.nextElementSibling;
      const content = Math.max(...Array.from(stageElement?.children ?? [], (child) => (child as HTMLElement).scrollHeight), 0);
      samples.push({ stage: stageElement?.getBoundingClientRect().height ?? 0, next: next?.getBoundingClientRect().top ?? 0, content });
      if (samples.length === 8) resolve(samples);
      else setTimeout(collect, 100);
    };
    collect();
  }));
  const assertSettled = (samples: { stage: number; next: number; content: number }[]) => {
    const tail = samples.slice(-4);
    expect(Math.max(...tail.map(({ stage: height }) => height)) - Math.min(...tail.map(({ stage: height }) => height))).toBeLessThanOrEqual(1);
    expect(Math.max(...tail.map(({ next }) => next)) - Math.min(...tail.map(({ next }) => next))).toBeLessThanOrEqual(1);
    expect(Math.max(...samples.map(({ stage: height }) => height))).toBeLessThan(1000);
    for (const { stage: height, content } of tail) expect(height).toBeGreaterThanOrEqual(content + 15);
  };
  assertSettled(await sampleGeometry());
  await expect(stage).toBeVisible();
  await expect(followingSection).toBeVisible();
  await page.getByRole("button", { name: "次の記事" }).click();
  await expect(page.locator(".creation-deck-count")).toContainText("3件中2件目");
  await page.getByRole("button", { name: "次の記事" }).press("ArrowLeft");
  await expect(page.locator(".creation-deck-count")).toContainText("3件中1件目");
  await links.nth(2).focus();
  await expect(page.locator(".creation-deck-count")).toContainText("3件中3件目");
  await expect(links.nth(2)).toBeFocused();
  await page.setViewportSize({ width: 600, height: 844 });
  assertSettled(await sampleGeometry());
  await page.evaluate(() => { document.documentElement.style.fontSize = "150%"; });
  assertSettled(await sampleGeometry());
  await page.evaluate(() => {
    document.documentElement.style.letterSpacing = ".12em";
    document.documentElement.style.wordSpacing = ".16em";
  });
  assertSettled(await sampleGeometry());
  await page.evaluate(async () => { await document.fonts.ready; });
  assertSettled(await sampleGeometry());
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "";
    document.documentElement.style.letterSpacing = "";
    document.documentElement.style.wordSpacing = "";
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assertSettled(await sampleGeometry());
  await page.screenshot({ path: path.join(evidence, "creation-deck-mode-390.png"), fullPage: true });
  await page.reload();
  await expect(deck).toHaveAttribute("data-mode", "deck");
  await page.getByRole("button", { name: "一覧で見る" }).click();
  await expect(deck).toHaveAttribute("data-mode", "list");
  await page.locator("body").click({ position: { x: 1, y: 1 } });
  await page.screenshot({ path: path.join(evidence, "creation-deck-list-390.png"), fullPage: true });

  await page.setViewportSize({ width: 320, height: 844 });
  await expect(page.getByRole("button", { name: "円環で見る" })).toHaveCount(0);
  await expect(links).toHaveCount(3);
});

test("Creation Deck remains usable when session storage is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", { configurable: true, value: () => { throw new DOMException("blocked"); } });
    Object.defineProperty(Storage.prototype, "setItem", { configurable: true, value: () => { throw new DOMException("blocked"); } });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/articles/#start");
  const toggle = page.getByRole("button", { name: "円環で見る" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(page.locator("#start .creation-deck")).toHaveAttribute("data-mode", "deck");
  await page.getByRole("button", { name: "次の記事" }).click();
  await expect(page.locator(".creation-deck-count")).toContainText("3件中2件目");
});

test("reading and trust planes remain readable and preserve ElevenLabs v4", async ({ page }) => {
  await mkdir(evidence, { recursive: true });
  await page.setViewportSize({ width: 375, height: 844 });
  for (const route of ["/articles/elevenlabs-v4-game-voice/", "/privacy/", "/methodology/", "/affiliate-disclosure/"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    if (route.startsWith("/articles/")) {
      const homeCrumb = page.locator(".breadcrumbs a").first();
      const box = await homeCrumb.boundingBox();
      expect(box?.width ?? 0).toBeGreaterThan(30);
      expect(await homeCrumb.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top))).size;
      })).toBe(1);
      await page.screenshot({ path: path.join(evidence, "article-breadcrumb-375.png"), fullPage: true });
    }
  }
});
