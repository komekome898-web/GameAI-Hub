import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "./fixtures";
import { acceptanceViewports, installAcceptanceNetworkGuard } from "./acceptance/fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";
import { evidenceManifestVersion, type EvidenceRecord } from "./acceptance/manifest";

const routes = [
  { id: "tools", path: "/tools/" },
  { id: "guides", path: "/guides/" },
  { id: "tool-detail", path: "/tools/meshy/" },
  { id: "guide-detail", path: "/guides/ai-2d-rpg-workflow/" },
] as const;

test("Slice 5 directories and representative details reflow at every acceptance viewport", async ({ page, context }) => {
  test.setTimeout(180_000);
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  const evidenceDir = path.join("docs", "screenshots", "issue-137-slice5");
  await mkdir(evidenceDir, { recursive: true });
  const records: EvidenceRecord[] = [];

  for (const viewport of acceptanceViewports) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const widths = await diagnoseWidths(page);
      expect(widths.documentOverflowPx, `${route.path} at ${viewport.width}px`).toBe(0);
      expect(widths.unownedOverflowingElements, `${route.path} unowned overflow`).toEqual([]);
      const screenshot = `${route.id}-${viewport.id}.png`;
      await page.screenshot({ path: path.join(evidenceDir, screenshot), fullPage: true });
      records.push({
        id: `${route.id}-${viewport.id}`,
        route: route.path,
        viewport,
        zoom: { mode: "none", factor: 1 },
        emulation: { viewport: true, physicalDevice: false },
        state: ["default", "browser-emulated", "ga4-collector-blocked"],
        screenshot,
        diagnostics: {
          documentOverflowPx: widths.documentOverflowPx,
          ownedLocalScrollers: widths.ownedLocalScrollers.length,
          unownedOverflowingElements: widths.unownedOverflowingElements.length,
        },
        provenance: {
          capturedAt: new Date().toISOString(),
          runner: "Playwright Chromium viewport emulation",
          note: "Responsive evidence only; not physical-device evidence.",
        },
      });
    }
  }
  expect(collectorAttempts).toEqual([]);
  await writeFile(path.join(evidenceDir, "manifest.json"), `${JSON.stringify({
    schema: evidenceManifestVersion,
    target: { sha: process.env.EVIDENCE_SHA ?? "0000000", environment: "local", baseUrl: "http://127.0.0.1:3100" },
    records,
  }, null, 2)}\n`);
});

test("Tools keeps criteria, URL history, evidence and empty recovery understandable", async ({ page, context }) => {
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  await page.goto("/tools/");
  await page.getByRole("button", { name: "3Dモデル" }).click();
  await expect(page).toHaveURL(/goal=3d/);
  await expect(page.getByLabel("適用中の絞り込み")).toContainText("成果物: 3Dモデル");
  await expect(page.getByText(/件の候補/)).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("button", { name: "すべて表示" })).toHaveAttribute("aria-pressed", "true");

  const filters = page.locator(".secondary-filters");
  await filters.locator(":scope > summary").click();
  await page.getByLabel("ツールを検索").fill("NoMatchingToolToken_1234567890");
  await expect(page.getByText("条件に合う候補がありません")).toBeVisible();
  await page.getByRole("button", { name: "条件を解除" }).click();
  await expect(page.getByText("条件に合う候補がありません")).toHaveCount(0);
  await expect(page.locator(".tool-rows article").first()).toContainText("ソース最終確認");
  expect(collectorAttempts).toEqual([]);
});

test("Guides stage state survives history and keeps prerequisite/output visible", async ({ page }) => {
  await page.goto("/guides/");
  const buildStage = page.getByRole("button", { name: /^作る / });
  await buildStage.focus();
  await expect(buildStage).toBeFocused();
  await buildStage.press("Enter");
  await expect(page).toHaveURL(/stage=build/);
  const first = page.locator(".guide-resource-list article").first();
  await expect(first.getByText("前提・入力")).toBeVisible();
  await expect(first.getByText("得られる成果")).toBeVisible();
  await expect(page.getByText("「作る」を表示中")).toBeVisible();
  await page.getByRole("button", { name: "選択を解除" }).click();
  await expect(page).not.toHaveURL(/stage=/);
  await buildStage.press("Enter");
  await expect(page).toHaveURL(/stage=build/);
  await page.goBack();
  await expect(page).not.toHaveURL(/stage=/);
  await page.getByRole("link", { name: "手順を開く →" }).first().click();
  await expect(page.getByRole("navigation", { name: "パンくず" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "今の作業はどこですか？" })).toBeVisible();
});

test("Tool affiliate and non-affiliate destinations retain disclosure and rel behavior", async ({ page, context }) => {
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  await page.goto("/tools/meshy/");
  await expect(page.locator('a[rel="sponsored nofollow noopener"]')).toHaveAttribute("href", "https://www.meshy.ai?via=gameaihub");
  await expect(page.getByText(/アフィリエイト/).first()).toBeVisible();
  await page.goto("/tools/github-copilot/");
  await expect(page.locator('a[rel="sponsored nofollow noopener"]')).toHaveCount(0);
  await expect(page.locator('a[rel="noopener"]').filter({ hasText: /公式/ }).first()).toBeVisible();
  expect(collectorAttempts).toEqual([]);
});
