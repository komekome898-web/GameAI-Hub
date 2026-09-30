import { expect, test } from "./fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";
import { applyTextMethod, probeSemanticRow, probeSurface } from "./acceptance/reflow";

test("semantic-row probe catches squeeze without document overflow and accepts wrap/stack", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 600 } });
  const page = await context.newPage();
  await page.setContent(`<style>
    *{box-sizing:border-box} body{margin:0}.row{display:flex;width:320px}.label{width:50px;flex:0 0 50px;min-width:0;overflow-wrap:anywhere}.date{flex:1;white-space:nowrap;overflow:hidden}
  </style><div class="row"><span class="label">通常の入口ラベル</span><small class="date">2026-09-30 verified date extended</small></div>`);
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  expect((await probeSemanticRow(page.locator(".row"), ".label", ".date")).ordinaryLabelSqueezed).toBe(true);

  await page.addStyleTag({ content: ".row{flex-wrap:wrap}.label{width:auto;flex:1 1 100%}.date{flex:none;overflow:visible}" });
  const wrapped = await probeSemanticRow(page.locator(".row"), ".label", ".date");
  expect(wrapped.nonoverlapping).toBe(true);
  expect(wrapped.ordinaryLabelSqueezed).toBe(false);
  await context.close();
});

test("surface probe catches clipping/token overflow but permits an owned code scroller", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 600 } });
  const page = await context.newPage();
  await page.setContent(`<style>*{box-sizing:border-box}.surface{width:300px}.clip{height:20px;overflow:hidden;font-size:18px;line-height:24px}.token{width:100px;white-space:nowrap}.code{width:120px;overflow-x:auto;white-space:pre}</style>
    <main class="surface"><p class="clip">line one<br>line two clipped</p><p class="token">${"UNBROKEN".repeat(30)}</p><pre class="code" data-acceptance-scroll-owner="true"><code>${"code-token-".repeat(30)}</code></pre></main>`);
  const bad = await probeSurface(page, ".surface");
  expect(bad.clippedText.some((item) => item.vertical)).toBe(true);
  expect(bad.clippedText.some((item) => item.horizontal && item.selector === "p")).toBe(true);
  expect(bad.clippedText.some((item) => item.selector === "pre")).toBe(false);
  const widths = await diagnoseWidths(page);
  expect(widths.ownedLocalScrollers).toHaveLength(1);
  expect(() => probeSurface(page, ".missing")).rejects.toThrow(/zero surfaces/);
  await context.close();
});

test("text methods record achieved sizes, detect fixed-px root failure, and restore", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 600 } });
  const page = await context.newPage();
  await page.setContent(`<div class="root-role" style="font-size:1rem">root role <span class="fixed" style="font-size:14px">fixed child</span></div>`);
  const root = await applyTextMethod(page, [{ role: "root", selector: ".root-role" }, { role: "fixed", selector: ".fixed" }], "synthetic-root-text", 2);
  expect(root.sufficient).toBe(false);
  expect(root.measurements.find(({ role }) => role === "fixed")?.achievedFactors[0]).toBeCloseTo(1);
  await root.restore();
  expect(await page.locator(".fixed").evaluate((element) => getComputedStyle(element).fontSize)).toBe("14px");

  const computed = await applyTextMethod(page, [{ role: "root", selector: ".root-role" }, { role: "fixed", selector: ".fixed" }], "synthetic-computed-text", 2);
  expect(computed.measurements.every(({ achievedFactors }) => achievedFactors.every((factor) => factor >= 1.99))).toBe(true);
  await computed.restore();
  const spacing = await applyTextMethod(page, [{ role: "root", selector: ".root-role" }], "spacing-letter", 1);
  expect(await page.locator(".root-role").evaluate((element) => getComputedStyle(element).letterSpacing)).not.toBe("normal");
  await spacing.restore();
  await context.close();
});

test("surface positive case records reachable focus and minimum target", async ({ page }) => {
  await page.setContent(`<main class="surface"><p>自然に折り返す文章です。</p><button style="min-width:44px;min-height:44px">実行</button></main>`);
  const result = await probeSurface(page, ".surface");
  expect(result.matched).toBe(1);
  expect(result.clippedText).toEqual([]);
  expect(result.undersizedTargets).toEqual([]);
  expect(result.focusReachable).toBe(true);
});
