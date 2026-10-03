import { expect, test } from "./fixtures";
import {
  acceptanceViewports,
  captureEvidence,
  installAcceptanceNetworkGuard,
  stressContracts,
  stressValues,
  writeEvidenceManifest,
} from "./acceptance/fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";
import {
  assertEvidenceManifest,
  evidenceManifestVersion,
  type EvidenceManifest,
} from "./acceptance/manifest";
import { execFileSync } from "node:child_process";

const mobileViewports = acceptanceViewports.filter((viewport) => viewport.width < 400);
const configuredSha = process.env.ACCEPTANCE_TARGET_SHA ?? process.env.GITHUB_SHA;
const targetSha = configuredSha?.match(/^[0-9a-f]{7,40}$/)?.[0]
  ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
test.describe("Issue 137 Slice 0 rendered baselines", () => {
  for (const viewport of acceptanceViewports) {
    test(`Home is capturable with provenance at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1, name: /GameBuildiary/ })).toBeVisible();
      const diagnostics = await diagnoseWidths(page);
      const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
      if (viewport.width < 400) {
        // Approved category-first Home retains a bounded brand and visible category CTA.
        expect(heading?.height, "Home H1 must use the bounded scale").toBeLessThan(150);
        const primaryAction = await page.locator(".home-category-entry .v2-start-card-read").first().boundingBox();
        expect(primaryAction?.y, "the category entry must remain in the first-view composition").toBeLessThan(viewport.height);
      }
      const record = await captureEvidence(page, testInfo, {
        id: `home-${viewport.id}`,
        route: "/",
        viewport: { width: viewport.width, height: viewport.height },
        zoom: { mode: "none", factor: 1 },
        emulation: { viewport: true, physicalDevice: false, userAgentProfile: "Desktop Chrome" },
        state: [viewport.width < 400 ? "shared-category-ring-home-composition" : "desktop-reference"],
        diagnostics: {
          documentOverflowPx: diagnostics.documentOverflowPx,
          ownedLocalScrollers: diagnostics.ownedLocalScrollers.length,
          unownedOverflowingElements: diagnostics.unownedOverflowingElements.length,
        },
        provenance: {
          capturedAt: new Date().toISOString(),
          runner: "Playwright Chromium viewport emulation",
          note: "Responsive evidence only; not a physical-device claim.",
        },
      });
      const manifest: EvidenceManifest = {
        schema: evidenceManifestVersion,
        target: { sha: targetSha, environment: "local", baseUrl: "http://127.0.0.1:3100" },
        records: [record],
      };
      assertEvidenceManifest(manifest);
      await writeEvidenceManifest(testInfo, manifest);
    });
  }

  for (const viewport of mobileViewports) {
    test(`Compare has no document-level overflow at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/compare");
      await expect(page.locator(".compare-picker-panel")).toHaveAttribute("open", "");
      await expect(page.getByLabel("候補を検索")).toBeVisible();
      const diagnostics = await diagnoseWidths(page);
      expect(diagnostics.documentOverflowPx, "Compare must not overflow the document").toBe(0);
      expect(
        diagnostics.unownedOverflowingElements.length,
        "all horizontal scrolling must be contained by an intentional local owner",
      ).toBe(0);
    });
  }

  test("Compare supports the four-candidate stress contract", async ({ page }) => {
    await page.setViewportSize(acceptanceViewports[1]);
    await page.goto(`/compare?ids=${stressValues.compareCandidateIds.join(",")}`);
    await expect(page.locator(".compare-picker-panel > summary")).toContainText("4 / 4件");
    await expect(page.locator(".compare-mobile article")).toHaveCount(4);
    const selectionTray = page.getByRole("region", { name: "4件を比較" });
    const remove = selectionTray.getByRole("button", { name: "Meshyを比較から解除" });
    await remove.focus();
    await expect(remove).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator(".compare-picker-panel > summary")).toContainText("3 / 4件");
    await expect(page.getByRole("region", { name: "3件を比較" })).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get("ids")).toBe("github-copilot,cursor,elevenlabs");
  });
});

test("stress fixture covers every required state and distinguishes owned scrollers", async ({ page, context }) => {
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.setContent(`<!doctype html><html lang="ja"><head><style>
    * { box-sizing: border-box } body { margin: 0; padding: 16px; overflow-wrap: anywhere; font: 16px/1.6 sans-serif }
    [data-acceptance-scroll-owner] { max-width: 100%; overflow-x: auto; border: 1px solid #777 }
    table { width: 720px } pre { width: 640px; white-space: pre }
  </style></head><body>
    <main>
      <h1>${stressValues.longJapaneseHeading}</h1>
      <label>ゲーム案<textarea>${stressValues.longGameIdea}${stressValues.secretSentinel}</textarea></label>
      <p>${stressValues.unbrokenToken}</p>
      <section role="status" aria-label="empty-state">候補はまだありません。条件を選んでください。</section>
      <section role="alert">読み込みに失敗しました。再試行できます。</section>
      <details open><summary>開示を閉じる</summary><p>展開済みの説明</p></details>
      <nav aria-label="expanded-menu"><a href="#fixture">メニュー項目</a></nav>
      <div data-acceptance-scroll-owner="true"><table><tbody><tr><td>比較表</td><td>${stressValues.unbrokenToken}</td></tr></tbody></table></div>
      <pre data-acceptance-scroll-owner="true"><code>const token = "${stressValues.unbrokenToken}";</code></pre>
      <fieldset aria-label="compare-candidates">${stressValues.compareCandidateIds.map((id) => `<label><input type="checkbox" value="${id}">${id}</label>`).join("")}</fieldset>
    </main>
  </body></html>`);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("初心者");
  await expect(page.getByRole("status", { name: "empty-state" })).toBeVisible();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.locator("details")).toHaveAttribute("open", "");
  await expect(page.getByRole("navigation", { name: "expanded-menu" })).toBeVisible();
  const candidates = page.getByRole("group", { name: "compare-candidates" }).getByRole("checkbox");
  await expect(candidates).toHaveCount(4);
  for (const candidate of await candidates.all()) await candidate.check();
  for (const candidate of await candidates.all()) await expect(candidate).toBeChecked();
  await page.locator("details > summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("details")).not.toHaveAttribute("open", "");
  expect(stressContracts.map(({ id }) => id)).toEqual([
    "long-japanese-heading",
    "long-game-idea",
    "unbroken-token-url",
    "empty",
    "error",
    "expanded-disclosure-menu",
    "table-code",
    "compare-four-candidates",
  ]);
  const diagnostics = await diagnoseWidths(page);
  expect(diagnostics.documentOverflowPx).toBe(0);
  expect(diagnostics.ownedLocalScrollers.length).toBeGreaterThanOrEqual(2);
  expect(diagnostics.unownedOverflowingElements).toEqual([]);
  expect(collectorAttempts).toEqual([]);
  expect(JSON.stringify(diagnostics)).not.toContain(stressValues.longGameIdea);
  expect(JSON.stringify(diagnostics)).not.toContain(stressValues.secretSentinel);
});

test("manifest contract rejects physical-device claims made from emulation", () => {
  expect(() =>
    assertEvidenceManifest({
      schema: evidenceManifestVersion,
      target: { sha: "df048d7", environment: "local", baseUrl: "http://127.0.0.1:3100" },
      records: [{
        id: "invalid",
        route: "/",
        viewport: { width: 390, height: 844 },
        zoom: { mode: "none", factor: 1 },
        emulation: { viewport: true, physicalDevice: true },
        state: [],
        screenshot: "invalid.png",
        diagnostics: { documentOverflowPx: 0, ownedLocalScrollers: 0, unownedOverflowingElements: 0 },
        provenance: { capturedAt: "2026-09-26T00:00:00.000Z", runner: "test" },
      }],
    }),
  ).toThrow(/cannot be physical-device evidence/);
});
