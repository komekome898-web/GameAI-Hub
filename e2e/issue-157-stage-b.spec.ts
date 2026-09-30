import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const evidence = path.join(process.cwd(), "docs/evidence/issue-157-stage-b/screenshots");

test("shared visual layer reflows across representative routes", async ({ page }) => {
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
  await page.getByRole("button", { name: "次の記事" }).click();
  await expect(page.locator(".creation-deck-count")).toContainText("3件中2件目");
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

test("reading and trust planes remain readable and preserve ElevenLabs v4", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  for (const route of ["/articles/elevenlabs-v4-game-voice/", "/privacy/", "/methodology/", "/affiliate-disclosure/"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
