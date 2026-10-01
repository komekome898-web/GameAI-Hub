import { expect, test } from "./fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";
import {
  applyTextMethod,
  probeSemanticRow,
  probeSurface,
} from "./acceptance/reflow";

test("semantic-row probe catches squeeze without document overflow and accepts wrap/stack", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 600 },
  });
  const page = await context.newPage();
  await page.setContent(`<style>
    *{box-sizing:border-box} body{margin:0}.row{display:flex;width:320px}.label{width:50px;flex:0 0 50px;min-width:0;overflow-wrap:anywhere}.date{flex:1;white-space:nowrap;overflow:hidden}
  </style><div class="row"><span class="label">通常の入口ラベル</span><small class="date">2026-09-30 verified date extended</small></div>`);
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  expect(
    (await probeSemanticRow(page.locator(".row"), ".label", ".date"))
      .ordinaryLabelSqueezed,
  ).toBe(true);

  await page.addStyleTag({
    content:
      ".row{flex-wrap:wrap}.label{width:auto;flex:1 1 100%}.date{flex:none;overflow:visible}",
  });
  const wrapped = await probeSemanticRow(
    page.locator(".row"),
    ".label",
    ".date",
  );
  expect(wrapped.nonoverlapping).toBe(true);
  expect(wrapped.ordinaryLabelSqueezed).toBe(false);
  await context.close();
});

test("surface probe catches clipping/token overflow but permits an owned code scroller", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 600 },
  });
  const page = await context.newPage();
  await page.setContent(`<style>*{box-sizing:border-box}.surface{width:300px}.clip{height:20px;overflow:hidden;font-size:18px;line-height:24px}.token{width:100px;white-space:nowrap}.code{width:120px;overflow-x:auto;white-space:pre}</style>
    <main class="surface"><p class="clip">line one<br>line two clipped</p><p class="token">${"UNBROKEN".repeat(30)}</p><pre class="code" data-acceptance-scroll-owner="true"><code>${"code-token-".repeat(30)}</code></pre></main>`);
  const bad = await probeSurface(page, ".surface");
  expect(bad.clippedText.some((item) => item.vertical)).toBe(true);
  expect(
    bad.clippedText.some((item) =>
      item.horizontal && (item.selector === "p" || item.selector === "p.token")),
  ).toBe(true);
  expect(bad.clippedText.some((item) => item.selector === "pre")).toBe(false);
  const widths = await diagnoseWidths(page);
  expect(widths.ownedLocalScrollers).toHaveLength(1);
  expect(() => probeSurface(page, ".missing")).rejects.toThrow(/zero surfaces/);
  await context.close();
});

test("text methods record achieved sizes, detect fixed-px root failure, and restore", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 600 },
  });
  const page = await context.newPage();
  await page.setContent(
    `<div class="root-role" style="font-size:1rem">root role <span class="fixed" style="font-size:14px">fixed child</span></div>`,
  );
  const root = await applyTextMethod(
    page,
    [
      { role: "root", selector: ".root-role" },
      { role: "fixed", selector: ".fixed" },
    ],
    "synthetic-root-text",
    2,
  );
  expect(root.sufficient).toBe(false);
  expect(
    root.measurements.find(({ role }) => role === "fixed")?.achievedFactors[0],
  ).toBeCloseTo(1);
  await root.restore();
  expect(
    await page
      .locator(".fixed")
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe("14px");

  const computed = await applyTextMethod(
    page,
    [
      { role: "root", selector: ".root-role" },
      { role: "fixed", selector: ".fixed" },
    ],
    "synthetic-computed-text",
    2,
  );
  expect(
    computed.measurements.every(({ achievedFactors }) =>
      achievedFactors.every((factor) => factor >= 1.99),
    ),
  ).toBe(true);
  await computed.restore();
  const spacing = await applyTextMethod(
    page,
    [{ role: "root", selector: ".root-role" }],
    "spacing-letter",
    1,
  );
  expect(
    await page
      .locator(".root-role")
      .evaluate((element) => getComputedStyle(element).letterSpacing),
  ).not.toBe("normal");
  await spacing.restore();
  await expect(
    applyTextMethod(page, [], "synthetic-root-text", 2),
  ).rejects.toThrow(/must not be empty/);
  await page.setContent(
    `<style>.blocked{font-size:14px!important}</style><p class="blocked">blocked</p>`,
  );
  const blocked = await applyTextMethod(
    page,
    [{ role: "blocked", selector: ".blocked" }],
    "synthetic-computed-text",
    2,
  );
  expect(blocked.sufficient).toBe(false);
  await context.close();
});

test("semantic rows preserve scoped typography and group inline fragments by line", async ({
  page,
}) => {
  await page.setContent(
    `<style>*{box-sizing:border-box}body{margin:0;font:48px Arial}.row{display:flex;width:320px;font:16px/1.5 Arial}.row .label{width:50px;flex:0 0 50px;min-width:0;overflow-wrap:anywhere}.date{font-size:12px;align-self:start}</style><div class="row"><span class="label">Ordinary entry label</span><small class="date">2026-09-30</small></div>`,
  );
  const squeezed = await probeSemanticRow(
    page.locator(".row"),
    ".label",
    ".date",
  );
  expect(squeezed.naturalLabelWidth).toBeGreaterThan(130);
  expect(squeezed.naturalLabelWidth).toBeLessThan(160);
  expect(squeezed.ordinaryLabelSqueezed).toBe(true);

  await page.setContent(
    `<style>*{box-sizing:border-box}.row{display:flex;width:320px;font:16px/1.5 Arial}.label{white-space:nowrap}.date{margin-left:auto}</style><div class="row"><span class="label"><b>New</b> label</span><small class="date">2026-09-30</small></div>`,
  );
  expect(
    (await probeSemanticRow(page.locator(".row"), ".label", ".date"))
      .ordinaryLabelSqueezed,
  ).toBe(false);
  await page.addStyleTag({
    content: ".label{white-space:normal;max-width:90px;overflow-wrap:anywhere}",
  });
  await page.locator(".label").evaluate((node) => {
    node.textContent =
      "Genuinely very long label that must wrap across the entire available row because its natural width exceeds the row";
  });
  expect(
    (await probeSemanticRow(page.locator(".row"), ".label", ".date"))
      .ordinaryLabelSqueezed,
  ).toBe(false);
});

test("focus visibility requires a keyboard-focus-specific visual change", async ({
  page,
}) => {
  await page.setContent(
    `<main><button class="ornamental">No indicator</button><button class="real">Real indicator</button></main><style>button{width:140px;height:48px;outline:none!important}.ornamental,.ornamental:focus,.ornamental:focus-visible{box-shadow:0 3px 5px #777}.real:focus-visible{box-shadow:0 0 0 4px #08f}</style>`,
  );
  const ornamental = await probeSurface(page, ".ornamental");
  expect(ornamental.focusReachable).toBe(true);
  expect(ornamental.focusVisible).toBe(false);
  expect(ornamental.focusVerification).toBe("unverified");
  const real = await probeSurface(page, ".real");
  expect(real.focusReachable).toBe(true);
  expect(real.focusVisible).toBe(true);
  expect(real.focusVerification).toBe("verified");
});

test("surface positive case records reachable focus and minimum target", async ({
  page,
}) => {
  await page.setContent(
    `<main class="surface"><p>自然に折り返す文章です。</p><button style="min-width:44px;min-height:44px">実行</button></main>`,
  );
  const result = await probeSurface(page, ".surface");
  expect(result.matched).toBe(1);
  expect(result.clippedText).toEqual([]);
  expect(result.undersizedTargets).toEqual([]);
  expect(result.focusReachable).toBe(true);
});
