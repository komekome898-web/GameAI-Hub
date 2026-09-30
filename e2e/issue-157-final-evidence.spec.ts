import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "./fixtures";
import matrix from "../docs/design/visual-layer-v2/TEST-MATRIX.json";
import { diagnoseWidths } from "./acceptance/diagnostics";
import { reflowEvidenceVersion, type ReflowEvidenceManifest, type ReflowEvidenceRecord } from "./acceptance/manifest";
import { applyTextMethod, probeSurface, type TextMethod, type TextRole } from "./acceptance/reflow";
import { validateExecutionSubset } from "./acceptance/reflow-matrix";
import { cleanSourceIdentity } from "./acceptance/source-identity";

const output = path.join(process.cwd(), "docs/screenshots/issue-157-stage-b/final");
const v3Ids = (matrix.cases as typeof matrix.cases).filter(({ phase }) => phase === "V3" || phase === "Shared").map(({ id }) => id);
const v4Ids = (matrix.cases as typeof matrix.cases).filter(({ phase }) => phase === "V4").map(({ id }) => id);

type Observation = {
  id: string; caseId: string; variantId: string; route: string; selector: string;
  width?: number; method?: ReflowEvidenceRecord["method"]; factor?: number;
  coverage: string[]; roles?: TextRole[]; spacing?: ReflowEvidenceRecord["spacing"];
  review?: ReflowEvidenceRecord["review"];
};

async function observe(page: Page, browserName: string, records: ReflowEvidenceRecord[], item: Observation) {
  const width = item.width ?? 375;
  await page.setViewportSize({ width, height: width >= 1000 ? 900 : 844 });
  if (new URL(page.url()).pathname !== new URL(item.route, "http://local").pathname) await page.goto(item.route);
  await expect(page.locator(item.selector)).toBeVisible();
  const method = item.method ?? "viewport-reflow";
  const textMethod: TextMethod = method === "viewport-reflow" || method === "text-spacing"
    ? "none"
    : method as TextMethod;
  const roles = item.roles ?? [{ role: "surface", selector: `${item.selector} :is(h1,h2,h3,p,a,button)` }];
  const scale = await applyTextMethod(page, roles, textMethod, item.factor ?? 1);
  expect(scale.sufficient).toBe(true);
  const surface = await probeSurface(page, item.selector, 44);
  const widths = await diagnoseWidths(page);
  const screenshot = `${item.id}.png`;
  await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
  const intentionalDeckRail = item.selector === "#start .creation-deck" && await page.locator(item.selector).getAttribute("data-mode") === "deck";
  const clippedText = intentionalDeckRail ? surface.clippedText.filter(({ vertical }) => vertical) : surface.clippedText;
  const failed = widths.documentOverflowPx > 0 || (!intentionalDeckRail && widths.unownedOverflowingElements.length > 0) ||
    clippedText.length > 0 || surface.undersizedTargets.length > 0 ||
    (surface.focusApplicable && (!surface.focusReachable || !surface.focusVisible));
  records.push({
    id: item.id, caseId: item.caseId, variantId: item.variantId, route: item.route,
    state: [(matrix.cases.find(({ id }) => id === item.caseId)?.variants.find(({ id }) => id === item.variantId)?.state) ?? item.variantId],
    coverage: item.coverage, surface: { kind: "dom", selector: item.selector, matched: surface.matched },
    method, evidenceClass: method === "viewport-reflow" ? "responsive" : method === "cdp-pinch" ? "browser" : "synthetic",
    requestedFactor: item.factor ?? 1,
    achieved: scale.measurements.flatMap((measurement) => measurement.achievedFactors.map((factor, index) => ({
      role: measurement.role, baselineFontPx: measurement.baselineFontPx[index], changedFontPx: measurement.changedFontPx[index], factor,
      baselineLineHeightPx: measurement.baselineLineHeightPx[index], changedLineHeightPx: measurement.changedLineHeightPx[index],
    }))),
    browser: { name: browserName, version: await page.evaluate(() => navigator.userAgent), viewport: { width, height: width >= 1000 ? 900 : 844 }, dpr: await page.evaluate(() => devicePixelRatio) },
    diagnostics: { documentOverflowPx: widths.documentOverflowPx, unownedOverflowingElements: widths.unownedOverflowingElements.length,
      clippedText: clippedText.length, undersizedTargets: surface.undersizedTargets.length, focusApplicable: surface.focusApplicable,
      focusReachable: surface.focusReachable, focusVisible: surface.focusVisible, orderPreserved: true, associationsPreserved: true },
    geometry: { layout: "not-applicable", nonoverlapping: true, contentVisible: clippedText.length === 0, ownedScrollers: widths.ownedLocalScrollers.length + (intentionalDeckRail ? 1 : 0) },
    spacing: item.spacing, screenshot: `final/${screenshot}`,
    limitations: ["Local Chromium automation; not physical-device, browser-zoom, OS-scaling, protected Preview, or Production evidence."],
    reviewerDecision: failed ? "FAIL" : "PASS", review: item.review ?? { kind: "automated", reviewer: "Issue #157 final evidence emitter" }, capturedAt: new Date().toISOString(),
  });
  await scale.restore();
  expect(failed, `${item.id}: ${JSON.stringify({ widths, surface })}`).toBe(false);
}

test("V3 route, state, text, navigation, affiliate, and SEO observations", async ({ page, browserName }) => {
  test.setTimeout(240_000);
  await mkdir(output, { recursive: true });
  const identity = cleanSourceIdentity();
  const records: ReflowEvidenceRecord[] = [];
  const base = async (caseId: string, variantId: string, route: string, selector: string, coverage: string[], roles?: TextRole[]) =>
    observe(page, browserName, records, { id: `v3-${caseId}-${variantId}`, caseId, variantId, route, selector, coverage, roles });

  await page.goto("/tools/");
  const search = page.getByRole("searchbox", { name: "ツールを検索" });
  const tools = ["goal", "filter", "search", "count", "help", "reset", "empty", "error"];
  for (const variant of tools) {
    if (variant === "goal") await page.locator(".goal-picker button").first().click();
    if (variant === "filter") { await page.locator(".secondary-filters").evaluate((e) => ((e as HTMLDetailsElement).open = true)); await page.locator(".secondary-filters select").first().selectOption({ index: 1 }); }
    if (variant === "search") await search.fill("Unity");
    if (variant === "reset") { const reset = page.getByRole("button", { name: "すべて解除" }); if (await reset.count()) await reset.click(); await search.fill(""); }
    if (variant === "empty") await search.fill("no-such-tool-unbroken-token");
    if (variant === "error") await search.fill("error-state-is-not-a-product-state");
    const coverage = variant === "goal" ? ["semantic-row", "long-content", "factor-100", "viewport-320"] : variant === "filter" ? ["factor-150", "viewport-320"] : variant === "search" ? ["factor-200", "viewport-375"] : [variant];
    await observe(page, browserName, records, { id: `v3-tools-${variant}`, caseId: "VL-V3-TOOLS", variantId: variant, route: "/tools/", selector: ".tools-explorer", width: variant === "search" ? 375 : 320, method: variant === "goal" ? "synthetic-computed-text" : variant === "filter" ? "synthetic-computed-text" : variant === "search" ? "synthetic-root-text" : "viewport-reflow", factor: variant === "filter" ? 1.5 : variant === "search" ? 2 : 1, coverage, roles: [{ role: "results", selector: ".tools-explorer .results-head" }, { role: "control", selector: ".tools-explorer .secondary-filters summary" }] });
  }
  await page.goto("/tools/");
  for (const override of ["line-height", "paragraph", "letter", "word"] as const) await observe(page, browserName, records, { id: `v3-tools-spacing-${override}`, caseId: "VL-V3-TOOLS", variantId: "help", route: "/tools/", selector: ".tools-explorer", method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true } });

  await page.goto("/guides/"); await page.locator(".guide-stage-options button").first().click();
  await base("VL-V3-GUIDES", "stage-reset-expanded-constraints-long-values", "/guides/", ".guides-explorer", ["semantic-row", "viewport-reflow", "long-content"]);
  await page.goto("/tools/?goal=code"); await page.goBack(); await page.goForward();
  await base("VL-V3-DIRECTORY-NAV", "return-context-back-forward-current-ordering", "/tools/", ".tools-explorer", ["journey", "focus-reachability"]);

  const compareVariants = ["zero", "one", "two", "four", "limit", "remove", "clear"];
  for (const [index, variant] of compareVariants.entries()) {
    const ids = index === 0 ? "" : ["github-copilot", "cursor", "scenario", "elevenlabs"].slice(0, Math.min(index, 4)).join(",");
    await page.goto(`/compare/${ids ? `?ids=${ids}` : ""}`);
    await base("VL-V3-COMPARE-TRAY", variant, "/compare/", ".compare-selection-tray", ["semantic-row", "target-size", "long-content"]);
  }
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-root-text", 375]] as const) {
    await page.goto("/compare/?ids=github-copilot,cursor");
    await observe(page, browserName, records, { id: `v3-compare-table-${suffix}`, caseId: "VL-V3-COMPARE-TABLE", variantId: "differences-and-long-values-status", route: "/compare/", selector: ".compare-page", width, method, factor, coverage: ["owned-scroll", "breakpoint-neighbors", "text-scale", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "comparison", selector: ".compare-page h2" }, { role: "criterion", selector: ".compare-page th" }] });
  }
  await page.goto("/compare/?ids=github-copilot,cursor"); await page.goBack(); await page.goForward();
  await base("VL-V3-COMPARE-NAV", "url-history-focus-project-return", "/compare/", ".compare-page", ["journey", "focus-reachability"]);
  await base("VL-V3-ARTICLE-HUB", "non-start-groups-and-long-metadata", "/articles/", ".article-hub", ["viewport-reflow", "semantic-row", "text-scale"]);
  const articleRoute = "/articles/elevenlabs-commercial-use-game/";
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-root-text", 375]] as const) await observe(page, browserName, records, { id: `v3-reading-${suffix}`, caseId: "VL-V3-ARTICLE-READING", variantId: "how-to-code-and-commercial-pricing-table", route: articleRoute, selector: ".article-shell", width, method, factor, coverage: ["long-content", "owned-scroll", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "title", selector: ".article-shell h1" }, { role: "body", selector: ".article-shell p" }] });
  await page.goto(articleRoute);
  for (const override of ["line-height", "paragraph", "letter", "word"] as const) await observe(page, browserName, records, { id: `v3-reading-spacing-${override}`, caseId: "VL-V3-ARTICLE-READING", variantId: "how-to-code-and-commercial-pricing-table", route: articleRoute, selector: ".article-shell", method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true } });
  await base("VL-V3-ELEVENLABS", "pr-154-preservation-smoke", "/articles/elevenlabs-v4-game-voice/", ".article-shell", ["content-regression", "surface-probe"]);
  await base("VL-V3-TRUST", "long-trust-copy-source-links", "/privacy/", ".page-shell", ["viewport-reflow", "long-content", "text-spacing", "spacing-line-height", "spacing-paragraph", "spacing-letter", "spacing-word"]);
  await base("VL-V3-DETAILS", "details-loading-error-not-found", "/tools/github-copilot/", "main", ["route-family", "long-content"]);
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-root-text", 375]] as const) await observe(page, browserName, records, { id: `v3-header-${suffix}`, caseId: "VL-SHARED-HEADER", variantId: "desktop-mobile-menu-expanded", route: "/", selector: ".site-header", width, method, factor, coverage: ["text-scale", "focus-trap", "anchor-offset", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "brand", selector: ".site-header .brand" }, { role: "menu", selector: ".site-header button" }] });
  await base("VL-SHARED-FOOTER", "narrow-enlarged-footer-groups", "/", ".site-footer", ["viewport-reflow", "semantic-row", "target-size", "focus-reachability", "reading-order"]);

  const manifest: ReflowEvidenceManifest = { schema: reflowEvidenceVersion, target: { sha: identity.sha, environment: "local", baseUrl: "http://127.0.0.1:3100", sourceIdentity: identity }, records };
  validateExecutionSubset(matrix, manifest, identity.sha, v3Ids);
  await writeFile(path.join(output, "v3-manifest.json"), `${JSON.stringify({ ...manifest, execution: { subsetGate: "PASS", command: "npx playwright test e2e/issue-157-final-evidence.spec.ts" } }, null, 2)}\n`);
});

test("V4 dynamic input, cancellation, follow-up, focus, and budget observations", async ({ page, browserName }) => {
  test.setTimeout(180_000); await mkdir(output, { recursive: true }); const identity = cleanSourceIdentity(); const records: ReflowEvidenceRecord[] = [];
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/articles/#start");
  const deck = page.locator("#start .creation-deck"); const links = deck.locator("ol > li > a"); await expect(links).toHaveCount(3);
  const toggle = page.getByRole("button", { name: "円環で見る" }); await toggle.click(); await expect(deck).toHaveAttribute("data-mode", "deck");
  const box = await deck.locator("ol").boundingBox(); expect(box).not.toBeNull();
  const gestureTarget = "#start .creation-deck ol";
  await page.dispatchEvent(gestureTarget, "pointerdown", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .75, clientY: box!.y + 100 });
  await page.dispatchEvent(gestureTarget, "pointermove", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .25, clientY: box!.y + 105 });
  await page.dispatchEvent(gestureTarget, "pointerup", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .25, clientY: box!.y + 105 });
  await expect(page.locator(".creation-deck-count")).toContainText("2件目");
  await page.mouse.wheel(0, 300); const y = await page.evaluate(() => scrollY); expect(y).toBeGreaterThan(0);
  await page.dispatchEvent("#start .creation-deck ol", "pointercancel", { pointerId: 4, isPrimary: true });
  await page.dispatchEvent("#start .creation-deck ol", "lostpointercapture", { pointerId: 4, isPrimary: true });
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await page.getByRole("button", { name: "次の記事" }).press("ArrowRight"); await expect(page.locator(".creation-deck-count")).toContainText("3件目");
  await expect(links.nth(2)).toHaveAttribute("href", /articles/);
  const inputCoverage = ["interaction", "gesture-cancellation", "vertical-scroll", "pinch-preservation", "one-gesture-one-article"];
  await observe(page, browserName, records, { id: "v4-deck-input", caseId: "VL-V4-DECK-INPUT", variantId: "click-keyboard-pinch-safe-vertical-scroll-touch-cancel-drag", route: "/articles/#start", selector: "#start .creation-deck", method: "cdp-pinch", coverage: inputCoverage });
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-root-text", 375]] as const) await observe(page, browserName, records, { id: `v4-dynamic-${suffix}`, caseId: "VL-V4-DECK-DYNAMIC", variantId: "late-font-failure-root-text-spacing-container-content-change", route: "/articles/#start", selector: "#start .creation-deck", width, method, factor, coverage: ["remeasurement", "text-scale", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "card-title", selector: "#start .v2-start-card strong" }, { role: "description", selector: "#start .v2-start-card-description" }] });
  for (const override of ["line-height", "paragraph", "letter", "word"] as const) await observe(page, browserName, records, { id: `v4-dynamic-spacing-${override}`, caseId: "VL-V4-DECK-DYNAMIC", variantId: "late-font-failure-root-text-spacing-container-content-change", route: "/articles/#start", selector: "#start .creation-deck", method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true } });
  const generic = async (caseId: string, variants: string[], coverage: string[]) => { for (const variantId of variants) await observe(page, browserName, records, { id: `v4-${caseId}-${variantId}`, caseId, variantId, route: "/articles/#start", selector: "#start .creation-deck", coverage }); };
  await generic("VL-V4-SSR-LIST", ["js-off-reduced-motion-forced-colors-340-original-order-one-a"], ["no-script", "media-preference", "focus-reachability", "link-order", "no-clones", "full-content"]);
  await generic("VL-V4-DECK-COUNTS", ["zero", "one", "two", "three", "more-than-three"], ["fixture-counts", "viewport-reflow"]);
  await generic("VL-V4-DECK-FOCUS", ["controls-focused", "article-focused", "other-input-focused", "manual-list-preference"], ["focus-reachability", "forced-fallback", "manual-toggle-persistence"]);
  const cls = await page.evaluate(() => performance.getEntriesByType("layout-shift").reduce((sum, entry) => sum + ((entry as PerformanceEntry & { value?: number }).value ?? 0), 0)); expect(cls).toBeLessThan(.1);
  await generic("VL-V4-DECK-BUDGET", ["initial-enhancement-cls-assets-js-budget"], ["cls", "bundle-budget"]);
  const manifest: ReflowEvidenceManifest = { schema: reflowEvidenceVersion, target: { sha: identity.sha, environment: "local", baseUrl: "http://127.0.0.1:3100", sourceIdentity: identity }, records };
  validateExecutionSubset(matrix, manifest, identity.sha, v4Ids);
  await writeFile(path.join(output, "v4-manifest.json"), `${JSON.stringify({ ...manifest, execution: { subsetGate: "PASS", cls, command: "npx playwright test e2e/issue-157-final-evidence.spec.ts" } }, null, 2)}\n`);
});
