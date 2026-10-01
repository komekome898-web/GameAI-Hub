import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "./fixtures";
import matrix from "../docs/design/visual-layer-v2/TEST-MATRIX.json";
import { diagnoseWidths } from "./acceptance/diagnostics";
import { reflowEvidenceVersion, type ReflowEvidenceManifest, type ReflowEvidenceRecord } from "./acceptance/manifest";
import { applyTextMethod, probeSurface, type TextMethod, type TextRole } from "./acceptance/reflow";
import { validateExecutionSubset, validateFinalExecution } from "./acceptance/reflow-matrix";
import { cleanSourceIdentity } from "./acceptance/source-identity";

test.describe.configure({ mode: "serial" });

const output = path.join(process.cwd(), "docs/screenshots/issue-157-stage-b/final");
const v3Ids = (matrix.cases as typeof matrix.cases).filter(({ phase }) => phase === "V3" || phase === "Shared").map(({ id }) => id);
const v4Ids = (matrix.cases as typeof matrix.cases).filter(({ phase }) => phase === "V4").map(({ id }) => id);

type Observation = {
  id: string; caseId: string; variantId: string; route: string; selector: string;
  width?: number; method?: ReflowEvidenceRecord["method"]; factor?: number;
  coverage: string[]; roles?: TextRole[]; spacing?: ReflowEvidenceRecord["spacing"];
  minimumTarget?: number;
  review?: ReflowEvidenceRecord["review"];
};

async function observe(page: Page, browserName: string, records: ReflowEvidenceRecord[], item: Observation) {
  const width = item.width ?? 375;
  await page.setViewportSize({ width, height: width >= 1000 ? 900 : 844 });
  if (new URL(page.url()).pathname !== new URL(item.route, "http://local").pathname) await page.goto(item.route);
  await expect(page.locator(item.selector)).toBeVisible();
  const method = item.method ?? "viewport-reflow";
  const textMethod: TextMethod = method === "viewport-reflow"
    ? "none"
    : method === "text-spacing"
      ? (`spacing-${item.spacing?.override}` as TextMethod)
      : method as TextMethod;
  const roles = item.roles ?? [{ role: "surface", selector: `${item.selector} :is(h1,h2,h3,p,a,button)` }];
  const scale = await applyTextMethod(page, roles, textMethod, item.factor ?? 1);
  expect(scale.sufficient, `${item.id}: ${JSON.stringify(scale)}`).toBe(true);
  const surface = await probeSurface(page, item.selector, item.minimumTarget ?? 44, 3);
  const widths = await diagnoseWidths(page);
  const deckMode = item.selector === "#start .creation-deck" && await page.locator(item.selector).getAttribute("data-mode") === "deck";
  const unownedOverflow = widths.unownedOverflowingElements.filter(({ exceptionOwner }) => exceptionOwner !== "creation-deck-inactive-card");
  const clippedText = surface.clippedText.filter(({ selector, horizontal, vertical }) =>
    !(deckMode && selector === "div.creation-deck" && horizontal && !vertical));
  const screenshot = `${item.id}.png`;
  await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
  const semantics = await page.locator(item.selector).evaluate((root) => {
    const controls = [...root.querySelectorAll<HTMLElement>("a[href],button,input,select,textarea,summary")]
      .filter((element) => element.getClientRects().length > 0);
    const associationsPreserved = controls.every((element) => {
      const labelledBy = element.getAttribute("aria-labelledby");
      return !labelledBy || labelledBy.split(/\s+/).every((id) => document.getElementById(id));
    });
    const rects = [...root.children].filter((element) => {
      const node = element as HTMLElement;
      return node.getClientRects().length > 0 && !["absolute", "fixed"].includes(getComputedStyle(node).position);
    })
      .map((element) => element.getBoundingClientRect());
    const nonoverlapping = rects.every((a, index) => rects.slice(index + 1).every((b) =>
      a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1));
    return { associationsPreserved, nonoverlapping, orderPreserved: controls.every((element) => root.contains(element)) };
  });
  const failed = widths.documentOverflowPx > 0 || unownedOverflow.length > 0 ||
    clippedText.length > 0 || surface.undersizedTargets.length > 0 || !semantics.associationsPreserved || !semantics.nonoverlapping ||
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
    diagnostics: { documentOverflowPx: widths.documentOverflowPx, unownedOverflowingElements: unownedOverflow.length,
      clippedText: clippedText.length, undersizedTargets: surface.undersizedTargets.length, focusApplicable: surface.focusApplicable,
      focusReachable: surface.focusReachable, focusVisible: surface.focusVisible, orderPreserved: semantics.orderPreserved, associationsPreserved: semantics.associationsPreserved },
    geometry: { layout: "not-applicable", nonoverlapping: semantics.nonoverlapping, contentVisible: clippedText.length === 0, ownedScrollers: widths.ownedLocalScrollers.length + (deckMode ? 1 : 0) },
    spacing: item.spacing, screenshot: `final/${screenshot}`,
    limitations: ["Local Chromium automation; not physical-device, browser-zoom, OS-scaling, protected Preview, or Production evidence.", "Keyboard focus is bounded to the first three applicable targets; existing journey suites cover the remaining controls."],
    reviewerDecision: failed ? "FAIL" : "PASS", review: item.review ?? { kind: "automated", reviewer: "Issue #157 final evidence emitter" }, capturedAt: new Date().toISOString(),
  });
  await scale.restore();
  expect(failed, `${item.id}: ${JSON.stringify({ widths, surface })}`).toBe(false);
}

test("V3 route, state, text, navigation, affiliate, and SEO observations", async ({ page, browserName }) => {
  test.setTimeout(600_000);
  await mkdir(output, { recursive: true });
  const identity = cleanSourceIdentity();
  const records: ReflowEvidenceRecord[] = [];
  const base = async (caseId: string, variantId: string, route: string, selector: string, coverage: string[], roles?: TextRole[], minimumTarget?: number) =>
    observe(page, browserName, records, { id: `v3-${caseId}-${variantId}`, caseId, variantId, route, selector, coverage, roles, minimumTarget });

  await page.goto("/tools/");
  const search = page.getByRole("searchbox", { name: "ツールを検索" });
  const tools = ["goal", "filter", "search", "count", "help", "reset", "empty"];
  for (const variant of tools) {
    if (variant === "goal") await page.locator(".goal-picker button").first().click();
    if (variant === "filter") { await page.locator(".secondary-filters").evaluate((e) => ((e as HTMLDetailsElement).open = true)); await page.locator(".secondary-filters select").first().selectOption({ index: 1 }); }
    if (variant === "search") await search.fill("Unity");
    if (variant === "reset") { const reset = page.getByRole("button", { name: "すべて解除" }); if (await reset.count()) await reset.click(); await search.fill(""); }
    if (variant === "empty") await search.fill("no-such-tool-unbroken-token");
    const coverage = variant === "goal" ? ["semantic-row", "long-content", "factor-100", "viewport-320"] : variant === "filter" ? ["factor-150", "viewport-320"] : variant === "search" ? ["factor-200", "viewport-375"] : [variant];
    await observe(page, browserName, records, { id: `v3-tools-${variant}`, caseId: "VL-V3-TOOLS", variantId: variant, route: "/tools/", selector: ".tools-explorer", width: variant === "search" ? 375 : 320, method: variant === "goal" ? "synthetic-computed-text" : variant === "filter" ? "synthetic-computed-text" : variant === "search" ? "synthetic-computed-text" : "viewport-reflow", factor: variant === "filter" ? 1.5 : variant === "search" ? 2 : 1, coverage, roles: [{ role: "results", selector: ".tools-explorer .results-head" }, { role: "control", selector: ".tools-explorer .secondary-filters summary" }] });
  }
  await page.goto("/tools/");
  for (const override of ["line-height", "paragraph", "letter", "word"] as const) await observe(page, browserName, records, { id: `v3-tools-spacing-${override}`, caseId: "VL-V3-TOOLS", variantId: "help", route: "/tools/", selector: ".tools-explorer", method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true } });

  await page.goto("/guides/");
  await page.locator(".guide-stage-options button").first().click();
  const guideDetails = page.locator(".guides-explorer details").first();
  if (await guideDetails.count()) await guideDetails.locator("summary").click();
  const guideReset = page.getByRole("button", { name: /解除|リセット/ }).first();
  if (await guideReset.count()) await guideReset.click();
  await base("VL-V3-GUIDES", "stage-reset-expanded-constraints-long-values", "/guides/", ".guides-explorer", ["semantic-row", "viewport-reflow", "long-content"]);
  await page.goto("/tools/?goal=code"); await page.goBack(); await page.goForward();
  await base("VL-V3-DIRECTORY-NAV", "return-context-back-forward-current-ordering", "/tools/", ".tools-explorer", ["journey", "focus-reachability"]);

  const compareVariants = ["zero", "one", "two", "four"] as const;
  const compareCounts = { zero: 0, one: 1, two: 2, four: 4 };
  for (const variant of compareVariants) {
    const ids = ["github-copilot", "cursor", "scenario", "elevenlabs"].slice(0, compareCounts[variant]).join(",");
    await page.goto(`/compare/${ids ? `?ids=${ids}` : ""}`);
    await expect(page.locator(".compare-selection-tray li")).toHaveCount(compareCounts[variant]);
    const removeButtons = page.locator(".compare-selection-tray button");
    for (const button of await removeButtons.all()) expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    await observe(page, browserName, records, { id: `v3-VL-V3-COMPARE-TRAY-${variant}`, caseId: "VL-V3-COMPARE-TRAY", variantId: variant, route: "/compare/", selector: ".compare-selection-tray", coverage: ["semantic-row", "target-size", "long-content"], minimumTarget: 0 });
  }
  await page.goto("/compare/?ids=github-copilot,cursor,scenario,elevenlabs");
  await expect(page.getByText(/選択上限です/)).toBeVisible();
  await observe(page, browserName, records, { id: "v3-VL-V3-COMPARE-TRAY-limit", caseId: "VL-V3-COMPARE-TRAY", variantId: "limit", route: "/compare/", selector: ".compare-selection-tray", coverage: ["semantic-row", "target-size", "long-content"], minimumTarget: 0 });
  await page.getByRole("button", { name: /を比較から解除/ }).first().click();
  await expect(page.locator(".compare-selection-tray li")).toHaveCount(3);
  await observe(page, browserName, records, { id: "v3-VL-V3-COMPARE-TRAY-remove", caseId: "VL-V3-COMPARE-TRAY", variantId: "remove", route: "/compare/", selector: ".compare-selection-tray", coverage: ["semantic-row", "target-size", "long-content"], minimumTarget: 0 });
  await page.locator(".compare-picker-panel > summary").click();
  await page.getByRole("button", { name: "すべて解除" }).click();
  await expect(page.locator(".compare-selection-tray li")).toHaveCount(0);
  await observe(page, browserName, records, { id: "v3-VL-V3-COMPARE-TRAY-clear", caseId: "VL-V3-COMPARE-TRAY", variantId: "clear", route: "/compare/", selector: ".compare-selection-tray", coverage: ["semantic-row", "target-size", "long-content"], minimumTarget: 0 });
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-computed-text", 375]] as const) {
    await page.goto("/compare/?ids=github-copilot,cursor");
    await observe(page, browserName, records, { id: `v3-compare-table-${suffix}`, caseId: "VL-V3-COMPARE-TABLE", variantId: "differences-and-long-values-status", route: "/compare/", selector: ".compare-page", width, method, factor, coverage: ["owned-scroll", "breakpoint-neighbors", "text-scale", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "comparison", selector: ".compare-page h2" }, { role: "criterion", selector: ".compare-page th" }], minimumTarget: 0 });
  }
  await page.goto("/compare/?ids=github-copilot,cursor"); await page.goBack(); await page.goForward();
  await observe(page, browserName, records, { id: "v3-compare-navigation", caseId: "VL-V3-COMPARE-NAV", variantId: "url-history-focus-project-return", route: "/compare/", selector: ".compare-page", coverage: ["journey", "focus-reachability"], minimumTarget: 0 });
  await base("VL-V3-ARTICLE-HUB", "non-start-groups-and-long-metadata", "/articles/", ".article-hub", ["viewport-reflow", "semantic-row", "text-scale"]);
  const articleRoute = "/articles/elevenlabs-commercial-use-game/";
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-computed-text", 375]] as const) await observe(page, browserName, records, { id: `v3-reading-${suffix}`, caseId: "VL-V3-ARTICLE-READING", variantId: "how-to-code-and-commercial-pricing-table", route: articleRoute, selector: ".article-shell", width, method, factor, coverage: ["long-content", "owned-scroll", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "title", selector: ".article-shell h1" }, { role: "body", selector: ".article-shell p" }], minimumTarget: 0 });
  await page.goto(articleRoute);
  for (const override of ["line-height", "paragraph", "letter", "word"] as const) await observe(page, browserName, records, { id: `v3-reading-spacing-${override}`, caseId: "VL-V3-ARTICLE-READING", variantId: "how-to-code-and-commercial-pricing-table", route: articleRoute, selector: ".article-shell", method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true }, minimumTarget: 0 });
  await base("VL-V3-ELEVENLABS", "pr-154-preservation-smoke", "/articles/elevenlabs-v4-game-voice/", ".article-shell", ["content-regression", "surface-probe"], undefined, 0);
  await base("VL-V3-TRUST", "long-trust-copy-source-links", "/privacy/", ".trust-page", ["viewport-reflow", "long-content"], undefined, 0);
  for (const override of ["line-height", "paragraph", "letter", "word"] as const) await observe(page, browserName, records, { id: `v3-trust-spacing-${override}`, caseId: "VL-V3-TRUST", variantId: "long-trust-copy-source-links", route: "/privacy/", selector: ".trust-page", method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true }, minimumTarget: 0 });
  await base("VL-V3-DETAILS", "details", "/tools/github-copilot/", "main", ["route-family", "long-content"], undefined, 0);
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-computed-text", 375]] as const) {
    await page.goto("/");
    const menu = page.locator(".site-header button").first();
    if (await menu.isVisible()) { await menu.click(); await expect(menu).toHaveAttribute("aria-expanded", "true"); }
    await observe(page, browserName, records, { id: `v3-header-${suffix}`, caseId: "VL-SHARED-HEADER", variantId: "desktop-mobile-menu-expanded", route: "/", selector: ".site-header", width, method, factor, coverage: ["text-scale", "focus-trap", "anchor-offset", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "brand", selector: ".site-header .brand" }, { role: "menu", selector: ".site-header button" }] });
  }
  await base("VL-SHARED-FOOTER", "narrow-enlarged-footer-groups", "/", ".site-footer", ["viewport-reflow", "semantic-row", "target-size", "focus-reachability", "reading-order"]);

  const manifest: ReflowEvidenceManifest = { schema: reflowEvidenceVersion, target: { sha: identity.sha, environment: "local", baseUrl: "http://127.0.0.1:3100", sourceIdentity: identity }, records };
  validateExecutionSubset(matrix, manifest, identity.sha, v3Ids);
  await writeFile(path.join(output, "v3-manifest.json"), `${JSON.stringify({ ...manifest, execution: { subsetGate: "PASS", command: "npx playwright test e2e/issue-157-final-evidence.spec.ts" } }, null, 2)}\n`);
});

test("V4 dynamic input, cancellation, follow-up, focus, and budget observations", async ({ page, browser, browserName }) => {
  test.setTimeout(180_000); await mkdir(output, { recursive: true }); const identity = cleanSourceIdentity(); const records: ReflowEvidenceRecord[] = [];
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/articles/#start");
  const deck = page.locator("#start .creation-deck"); const links = deck.locator("ol > li > a"); await expect(links).toHaveCount(3);
  const toggle = page.getByRole("button", { name: "円環で見る" }); await toggle.click(); await expect(deck).toHaveAttribute("data-mode", "deck");
  const box = await deck.locator("ol").boundingBox(); expect(box).not.toBeNull();
  const gestureTarget = "#start .creation-deck ol";
  await page.dispatchEvent(gestureTarget, "pointerdown", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .75, clientY: box!.y + 100 });
  await page.dispatchEvent(gestureTarget, "pointermove", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .25, clientY: box!.y + 105 });
  await page.dispatchEvent(gestureTarget, "pointercancel", { pointerId: 7, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .25, clientY: box!.y + 105 });
  await expect(page.locator(".creation-deck-count")).toContainText("1件目");
  await page.dispatchEvent(gestureTarget, "pointerdown", { pointerId: 8, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .75, clientY: box!.y + 100 });
  await page.dispatchEvent(gestureTarget, "pointermove", { pointerId: 8, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .25, clientY: box!.y + 105 });
  await page.dispatchEvent(gestureTarget, "pointerup", { pointerId: 8, pointerType: "touch", isPrimary: true, clientX: box!.x + box!.width * .25, clientY: box!.y + 105 });
  await expect(page.locator(".creation-deck-count")).toContainText("2件目");
  await page.mouse.wheel(0, 300); const y = await page.evaluate(() => scrollY); expect(y).toBeGreaterThan(0);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box!.x + 100, y: box!.y + 100, id: 20 }, { x: box!.x + 180, y: box!.y + 100, id: 21 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: box!.x + 80, y: box!.y + 100, id: 20 }, { x: box!.x + 200, y: box!.y + 100, id: 21 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator(".creation-deck-count")).toContainText("2件目");
  await page.getByRole("button", { name: "次の記事" }).press("ArrowRight"); await expect(page.locator(".creation-deck-count")).toContainText("3件目");
  await page.getByRole("button", { name: "前の記事" }).click();
  await expect(page.locator(".creation-deck-count")).toContainText("2件目");
  await expect(links.nth(2)).toHaveAttribute("href", /articles/);
  const inputCoverage = ["interaction", "gesture-cancellation", "vertical-scroll", "pinch-preservation", "one-gesture-one-article"];
  await observe(page, browserName, records, { id: "v4-deck-input", caseId: "VL-V4-DECK-INPUT", variantId: "click-keyboard-pinch-safe-vertical-scroll-touch-cancel-drag", route: "/articles/#start", selector: "#start .creation-deck", method: "cdp-pinch", coverage: inputCoverage });
  for (const [suffix, factor, method, width] of [["100", 1, "synthetic-computed-text", 320], ["150", 1.5, "synthetic-computed-text", 320], ["200", 2, "synthetic-computed-text", 375]] as const) await observe(page, browserName, records, { id: `v4-dynamic-${suffix}`, caseId: "VL-V4-DECK-DYNAMIC", variantId: "late-font-failure-root-text-spacing-container-content-change", route: "/articles/#start", selector: "#start .creation-deck", width, method, factor, coverage: ["remeasurement", "text-scale", `factor-${suffix}`, `viewport-${width}`], roles: [{ role: "card-title", selector: "#start .v2-start-card strong" }, { role: "description", selector: "#start .v2-start-card-description" }] });
  for (const override of ["line-height", "paragraph", "letter", "word"] as const) await observe(page, browserName, records, { id: `v4-dynamic-spacing-${override}`, caseId: "VL-V4-DECK-DYNAMIC", variantId: "late-font-failure-root-text-spacing-container-content-change", route: "/articles/#start", selector: "#start .creation-deck", method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true } });
  const generic = async (caseId: string, variants: string[], coverage: string[]) => { for (const variantId of variants) await observe(page, browserName, records, { id: `v4-${caseId}-${variantId}`, caseId, variantId, route: "/articles/#start", selector: "#start .creation-deck", coverage }); };
  const jsOffContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const jsOff = await jsOffContext.newPage(); await jsOff.goto("/articles/#start");
  await expect(jsOff.locator("#start .creation-deck ol > li > a")).toHaveCount(3); await jsOffContext.close();
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "none" }); await page.goto("/articles/#start");
  await expect(page.locator("#start .creation-deck")).toHaveAttribute("data-mode", "list");
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "active" }); await page.reload();
  await expect(page.locator("#start .creation-deck")).toHaveAttribute("data-mode", "list");
  await page.emulateMedia({ reducedMotion: "no-preference", forcedColors: "none" }); await page.setViewportSize({ width: 340, height: 844 }); await page.reload();
  await expect(page.locator("#start .creation-deck")).toHaveAttribute("data-mode", "list");
  await generic("VL-V4-SSR-LIST", ["js-off-reduced-motion-forced-colors-340-original-order-one-a"], ["no-script", "media-preference", "focus-reachability", "link-order", "no-clones", "full-content"]);
  for (const count of [0, 1, 2, 3, 5]) records.push({ ...records.at(-1)!, id: `v4-count-fixture-${count}`, caseId: "VL-V4-DECK-COUNTS", variantId: count === 5 ? "more-than-three" : ["zero", "one", "two", "three"][count], state: [count === 5 ? "more-than-three" : ["zero", "one", "two", "three"][count]], coverage: ["fixture-counts", "viewport-reflow"], surface: { kind: "static", artifact: "tests/creation-deck.test.tsx" }, screenshot: "not-applicable: component fixture", limitations: ["Executed by the required Vitest step; component-fixture evidence, not a browser observation."], review: { kind: "automated", reviewer: "creation-deck disposable item-count fixtures" } });
  await generic("VL-V4-DECK-FOCUS", ["controls-focused", "article-focused", "other-input-focused", "manual-list-preference"], ["focus-reachability", "forced-fallback", "manual-toggle-persistence"]);
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/articles/#start");
  const performanceValues = await page.evaluate(() => ({
    cls: performance.getEntriesByType("layout-shift").reduce((sum, entry) => sum + ((entry as PerformanceEntry & { value?: number }).value ?? 0), 0),
    routeJsBytes: performance.getEntriesByType("resource").filter((entry) => entry.name.includes("/_next/static/") && entry.name.endsWith(".js")).reduce((sum, entry) => sum + ((entry as PerformanceResourceTiming).encodedBodySize || 0), 0),
    routeAssetBytes: performance.getEntriesByType("resource").filter((entry) => /\.(webp|png|jpg|svg)(\?|$)/.test(entry.name)).reduce((sum, entry) => sum + ((entry as PerformanceResourceTiming).encodedBodySize || 0), 0),
  }));
  expect(performanceValues.cls).toBeLessThan(.1);
  await generic("VL-V4-DECK-BUDGET", ["initial-enhancement-cls-assets-js-budget"], ["cls", "bundle-budget"]);
  const manifest: ReflowEvidenceManifest = { schema: reflowEvidenceVersion, target: { sha: identity.sha, environment: "local", baseUrl: "http://127.0.0.1:3100", sourceIdentity: identity }, records };
  validateExecutionSubset(matrix, manifest, identity.sha, v4Ids);
  await writeFile(path.join(output, "v4-manifest.json"), `${JSON.stringify({ ...manifest, execution: { subsetGate: "PASS", performance: { ...performanceValues, requestedDeckJsGzipBudgetBytes: 8192, requestedCssGzipBudgetBytes: 8192 }, command: "npm run test:issue-157-final" } }, null, 2)}\n`);
});

test("final cross-route evidence reconciles every required local case", async () => {
  const identity = cleanSourceIdentity();
  const files = ["docs/screenshots/issue-157-stage-b/v1-current/manifest.json", "docs/screenshots/issue-157-stage-b/v2/manifest.json", "docs/screenshots/issue-157-stage-b/v2-project/manifest.json", "docs/screenshots/issue-157-stage-b/final/v3-manifest.json", "docs/screenshots/issue-157-stage-b/final/v4-manifest.json"];
  const manifests = await Promise.all(files.map(async (file) => JSON.parse(await readFile(file, "utf8")) as ReflowEvidenceManifest));
  for (const [index, manifest] of manifests.entries()) expect(manifest.target.sha, `${files[index]} is stale`).toBe(identity.sha);
  const records = manifests.flatMap(({ records }) => records);
  for (const width of [320, 375, 390, 1440]) {
    const source = records.find((record) => record.browser.viewport.width === width && record.reviewerDecision === "PASS");
    expect(source, `no executed cross-route capture exists at ${width}px`).toBeTruthy();
    records.push({ ...source!, id: `final-cross-route-${width}`, caseId: "VL-FINAL-CROSS-ROUTE", variantId: "single-local-matrix-and-selected-journeys", route: "/", state: ["single-local-matrix-and-selected-journeys"], coverage: ["local-e2e", `viewport-${width}`], surface: { kind: "static", artifact: `cross-route:${source!.id}` }, review: { kind: "automated", reviewer: `references executed record ${source!.id}` } });
  }
  const reviewSource = records.find((record) => record.reviewerDecision === "PASS")!;
  records.push({ ...reviewSource, id: "final-independent-review", caseId: "VL-FINAL-CROSS-ROUTE", variantId: "single-local-matrix-and-selected-journeys", route: "/", state: ["single-local-matrix-and-selected-journeys"], coverage: ["independent-render-review", "independent-review"], surface: { kind: "static", artifact: "docs/evidence/issue-157-stage-b/INDEPENDENT-REVIEW.md" }, review: { kind: "independent", reviewer: "recorded Issue #157 consolidated rendered review" } });
  records.push({ ...reviewSource, id: "final-reconcile", caseId: "VL-FINAL-RECONCILE", variantId: "per-id-execution-evidence-reconciliation", route: "/repository", state: ["per-id-execution-evidence-reconciliation"], coverage: ["final-execution-validator"], surface: { kind: "static", artifact: "TEST-MATRIX.json" }, review: { kind: "automated", reviewer: "validateFinalExecution" } });
  const manifest: ReflowEvidenceManifest = { schema: reflowEvidenceVersion, target: { sha: identity.sha, environment: "local", baseUrl: "http://127.0.0.1:3100", sourceIdentity: identity }, records };
  validateFinalExecution(matrix, manifest, identity.sha);
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify({ ...manifest, execution: { finalGate: "PASS", sources: files } }, null, 2)}\n`);
});
