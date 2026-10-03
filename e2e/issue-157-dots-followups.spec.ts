import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "./fixtures";
import { applyTextMethod } from "./acceptance/reflow";

const output = path.resolve("docs/screenshots/issue-157-stage-b/dots-followups");

async function openDeck(page: Page) {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/articles/#start");
  await expect(page.locator(".creation-deck")).toHaveCount(1);
  if (await page.getByRole("button", { name: "円環で見る" }).count()) await page.getByRole("button", { name: "円環で見る" }).click();
  await expect(page.locator("#start .creation-deck")).toHaveAttribute("data-mode", "deck");
}

async function beginOwnedCdpTouchDrag(page: Page) {
  const stage = page.locator("#start .creation-deck ol");
  const activeCard = stage.locator("li[data-distance='0'] a");
  await activeCard.scrollIntoViewIfNeeded();
  const box = await activeCard.boundingBox();
  expect(box).not.toBeNull();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ id: 7, x: box!.x + box!.width * .72, y: box!.y + 100 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ id: 7, x: box!.x + box!.width * .42, y: box!.y + 102 }] });
  await expect(stage).toHaveAttribute("data-motion", "dragging");
  await expect.poll(() => stage.getAttribute("data-motion-pos")).not.toBe(await stage.getAttribute("data-motion-target"));
  return { stage, box: box!, cdp };
}

test("V-01 keeps every mobile model/value association and desktop headers", async ({ page }) => {
  await mkdir(output, { recursive: true });
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/articles/elevenlabs-v4-game-voice/");
  const section = page.getByRole("heading", { name: "v3 vs v4 vs v4 Turbo" }).locator("..");
  const table = section.locator(".article-decision-table");
  await expect(table.locator("tbody tr")).toHaveCount(6);
  for (const row of await table.locator("tbody tr").all()) {
    await expect(row.locator("td")).toHaveCount(3);
    await expect(row.locator('td[data-label="v3"]')).toHaveCount(1);
    await expect(row.locator('td[data-label="v4"]')).toHaveCount(1);
    await expect(row.locator('td[data-label="v4 Turbo"]')).toHaveCount(1);
  }
  await page.addStyleTag({ content: ".site-header,.skip-link{visibility:hidden!important}" });
  await table.screenshot({ path: path.join(output, "v01-elevenlabs-table-375.png") });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(table.locator("thead")).toBeVisible();
  await expect(table.locator("thead th")).toHaveText(["項目", "v3", "v4", "v4 Turbo"]);
  await table.screenshot({ path: path.join(output, "v01-elevenlabs-table-1440.png") });
});

test("V-03 gives all article copy readable width at root 200%", async ({ page }) => {
  await mkdir(output, { recursive: true });
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/articles/#all");
  await expect(page.locator("#all li")).toHaveCount(16);
  const scale = await applyTextMethod(page, [
    { role: "article-title", selector: "#all .v2-start-card-face strong" },
    { role: "article-description", selector: "#all .v2-start-card-description" },
    { role: "article-metadata", selector: "#all .v2-start-card-meta small" },
  ], "synthetic-root-text", 2);
  expect(scale.sufficient).toBe(true);
  const allocations = await page.locator("#all .v2-start-card").evaluateAll(cards => cards.map(card => {
    const rect = card.getBoundingClientRect();
    const title = card.querySelector<HTMLElement>('strong')!;
    const description = card.querySelector<HTMLElement>('.v2-start-card-description')!;
    return { ratio: title.getBoundingClientRect().width / rect.width, fullText: description.scrollHeight <= description.clientHeight + 1, contained: title.scrollWidth <= title.clientWidth + 1 };
  }));
  expect(allocations).toHaveLength(16);
  expect(allocations.every(a => a.ratio > .8 && a.fullText && a.contained)).toBe(true);
  await page.locator("#all").screenshot({ path: path.join(output, "v03-all-root-200-375.png") });
  await scale.restore();
  await page.setViewportSize({ width: 1440, height: 900 });
  const columns = await page.locator("#all ol").evaluate(row => getComputedStyle(row).gridTemplateColumns.split(" ").length);
  expect(columns).toBeGreaterThanOrEqual(3);
});

test("E-01 measures actual Deck title line-height and description paragraph spacing", async ({ page }) => {
  await mkdir(output, { recursive: true });
  await openDeck(page);
  const line = await applyTextMethod(page, [
    { role: "deck-title", selector: "#start .v2-start-card-face > strong" },
    { role: "deck-description", selector: "#start .v2-start-card-description" },
  ], "spacing-line-height");
  expect(line.sufficient).toBe(true);
  const ratios = line.measurements.flatMap((measurement) => measurement.changedLineHeightPx.map((height, index) => height! / measurement.changedFontPx[index]));
  expect(ratios.every((ratio) => Math.abs(ratio - 1.5) < .02)).toBe(true);
  await page.addStyleTag({ content: ".site-header,.skip-link{visibility:hidden!important}" });
  await page.locator("#start .creation-deck").screenshot({ path: path.join(output, "e01-deck-line-height.png") });
  await line.restore();
  const paragraph = await applyTextMethod(page, [{ role: "deck-description", selector: "#start .v2-start-card-description" }], "spacing-paragraph");
  expect(paragraph.sufficient).toBe(true);
  const paragraphSpacing = await page.locator("#start .v2-start-card-description").evaluateAll((items) => ({
    values: items.map((item) => Number.parseFloat(getComputedStyle(item).marginBottom)),
  }));
  const descriptionFonts = paragraph.measurements[0].changedFontPx;
  expect(paragraphSpacing.values.every((value, index) => Math.abs(value / descriptionFonts[index] - 2) < .02)).toBe(true);
  await page.locator("#start .creation-deck").screenshot({ path: path.join(output, "e01-deck-paragraph-spacing.png") });
  await paragraph.restore();
});

test("E-02 cancels owned gestures and preserves click and list preference recovery", async ({ page }) => {
  await openDeck(page);
  const deck = page.locator("#start .creation-deck");
  const count = page.locator(".creation-deck-status");

  let drag = await beginOwnedCdpTouchDrag(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(drag.stage).toHaveAttribute("data-motion", "idle");
  await expect(drag.stage).toHaveAttribute("data-motion-raf", "0");
  await drag.cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await drag.cdp.detach();
  await page.getByRole("button", { name: "次の記事" }).click();
  await expect(count).toContainText("2件目");

  drag = await beginOwnedCdpTouchDrag(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(drag.stage).toHaveAttribute("data-motion", "idle");
  await expect(drag.stage).toHaveAttribute("data-motion-raf", "0");
  await drag.cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await drag.cdp.detach();
  await page.evaluate(() => Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" }));
  await page.getByRole("button", { name: "前の記事" }).click();
  await expect(count).toContainText("1件目");

  drag = await beginOwnedCdpTouchDrag(page);
  await drag.cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [
    { id: 7, x: drag.box.x + drag.box.width * .42, y: drag.box.y + 102 },
    { id: 99, x: drag.box.x + 20, y: drag.box.y + 20 },
  ] });
  await expect(drag.stage).toHaveAttribute("data-motion", "idle");
  await expect(drag.stage).toHaveAttribute("data-motion-raf", "0");
  await drag.cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await drag.cdp.detach();
  await page.getByRole("button", { name: "次の記事" }).click();
  await expect(count).toContainText("2件目");

  drag = await beginOwnedCdpTouchDrag(page);
  await drag.cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ id: 7, x: drag.box.x + drag.box.width * .12, y: drag.box.y + 102 }] });
  await drag.cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await drag.cdp.detach();
  await expect(page).toHaveURL(/\/articles\/(?:\?hubArticle=[^#]+)?#start$/);
  const expectedHref = await deck.locator("li[data-distance='0'] a").getAttribute("href");
  const expectedUrl = new URL(expectedHref!, page.url()).href;
  await deck.locator("li[data-distance='0'] .v2-start-card-read").click();
  await expect(page).toHaveURL(expectedUrl);

  await page.goto("/articles/#start");
  await expect(page.getByRole("button", { name: "一覧で見る" })).toBeVisible();
  await page.getByRole("button", { name: "一覧で見る" }).click();
  await expect(deck).toHaveAttribute("data-mode", "list");
  await page.reload();
  await expect(deck).toHaveAttribute("data-mode", "list");

  await writeFile(path.join(output, "INDEX.json"), `${JSON.stringify({
    testedConditions: {
      "V-01": ["v01-elevenlabs-table-375.png", "v01-elevenlabs-table-1440.png"],
      "V-02": ["../v2-project/project-tokens-100.png", "../v2-project/project-tokens-150.png", "../v2-project/project-tokens-200.png"],
      "V-03": ["v03-voice-root-200-375.png", "v03-3d-root-200-375.png"],
      "E-01": ["e01-deck-line-height.png", "e01-deck-paragraph-spacing.png"],
      "E-02": "native Chromium/CDP touch ownership plus controlled hidden visibility and additional-pointer interruption; no physical touch or OS tab switch",
    },
    viewportMethods: ["375px viewport", "1440px adjacent desktop", "synthetic-root-text 200%", "spacing-line-height", "spacing-paragraph"],
  }, null, 2)}\n`);
});
