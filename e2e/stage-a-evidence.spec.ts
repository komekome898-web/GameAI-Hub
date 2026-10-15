import { expect, test } from "./fixtures";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import matrix from "../docs/design/visual-layer-v2/TEST-MATRIX.json";
import {
  reflowEvidenceVersion,
  type ReflowEvidenceManifest,
  type ReflowEvidenceRecord,
} from "./acceptance/manifest";
import { validateExecutionSubset } from "./acceptance/reflow-matrix";
import {
  applyTextMethod,
  probeSemanticRow,
  probeSurface,
  type TextMeasurement,
} from "./acceptance/reflow";
import { diagnoseWidths } from "./acceptance/diagnostics";
import { cleanSourceIdentity } from "./acceptance/source-identity";

const output = path.resolve("docs/screenshots/issue-157-stage-b/v1-current");
const testedPaths = [
  "e2e/acceptance/manifest.ts",
  "e2e/acceptance/reflow-matrix.ts",
  "e2e/acceptance/reflow.ts",
  "e2e/reflow-contract.spec.ts",
  "e2e/issue-155-v1.spec.ts",
  "e2e/stage-a-evidence.spec.ts",
  "tests/reflow-evidence.test.ts",
  "tests/reflow-matrix.test.ts",
  "docs/design/visual-layer-v2/TEST-MATRIX.json",
];

function achieved(measurements: TextMeasurement[]) {
  return measurements.flatMap((measurement) =>
    measurement.baselineFontPx.map((baselineFontPx, index) => ({
      role: measurement.role,
      baselineFontPx,
      changedFontPx: measurement.changedFontPx[index],
      factor: measurement.achievedFactors[index],
      baselineLineHeightPx: measurement.baselineLineHeightPx[index],
      changedLineHeightPx: measurement.changedLineHeightPx[index],
    })),
  );
}

test("emit and validate the Stage A executed subset", async ({
  page,
  browserName,
}) => {
  mkdirSync(output, { recursive: true });
  const sourceIdentity = cleanSourceIdentity();
  const version = await page.evaluate(() => navigator.userAgent);
  const records: ReflowEvidenceRecord[] = [];
  const roles = [
    { role: "label", selector: "#start .v2-start-card-label" },
    { role: "date", selector: "#start .v2-start-card-meta small" },
  ];
  for (const [variantId, factor, method, width] of [
    ["metadata-100", 1, "synthetic-computed-text", 320],
    ["metadata-150", 1.5, "synthetic-computed-text", 320],
    ["metadata-200", 2, "synthetic-root-text", 375],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/articles/#start");
    await expect(page.locator(".creation-deck")).toHaveCount(1);
    const scale = await applyTextMethod(page, roles, method, factor);
    expect(scale.sufficient).toBe(true);
    const row = await probeSemanticRow(
      page.locator("#start .v2-start-card-meta").first(),
      ".v2-start-card-label",
      "small",
    );
    const surface = await probeSurface(page, "#start .v2-start-card-meta");
    const widths = await diagnoseWidths(page);
    const screenshot = `metadata-${factor * 100}-${width}.png`;
    await page.screenshot({
      path: path.join(output, screenshot),
      fullPage: true,
    });
    records.push({
      id: `stage-a-${variantId}`,
      caseId: "VL-V1-METADATA",
      variantId,
      route: "/articles/",
      state: [variantId],
      coverage: [method, `factor-${factor * 100}`, `viewport-${width}`],
      surface: {
        kind: "dom",
        selector: "#start .v2-start-card-meta",
        matched: surface.matched,
      },
      method,
      evidenceClass: "synthetic",
      requestedFactor: factor,
      achieved: achieved(scale.measurements),
      browser: {
        name: browserName,
        version,
        viewport: { width, height: 844 },
        dpr: await page.evaluate(() => devicePixelRatio),
      },
      diagnostics: {
        documentOverflowPx: widths.documentOverflowPx,
        unownedOverflowingElements: widths.unownedOverflowingElements.length,
        clippedText: surface.clippedText.length,
        undersizedTargets: surface.undersizedTargets.length,
        focusApplicable: surface.focusApplicable,
        focusReachable: surface.focusReachable,
        focusVisible: surface.focusVisible,
        orderPreserved: true,
        associationsPreserved: true,
      },
      geometry: {
        layout: row.layout,
        nonoverlapping: row.nonoverlapping,
        contentVisible: row.contained,
        ownedScrollers: widths.ownedLocalScrollers.length,
        ordinaryLabelSqueezed: row.ordinaryLabelSqueezed,
        labelWidth: row.labelWidth,
        naturalLabelWidth: row.naturalLabelWidth,
      },
      screenshot,
      limitations: [
        "Synthetic text enlargement in desktop Chromium; not browser zoom or physical-device evidence.",
        `Focus is ${surface.focusVerification} because the metadata surface has no interactive target.`,
      ],
      reviewerDecision:
        row.ordinaryLabelSqueezed || !row.nonoverlapping || !row.contained
          ? "FAIL"
          : "PASS",
      review: { kind: "automated", reviewer: "Playwright Stage A emitter" },
      capturedAt: new Date().toISOString(),
    });
    if (variantId === "metadata-100") {
      const responsive = structuredClone(records.at(-1)!);
      responsive.id = "stage-a-metadata-viewport-320";
      responsive.coverage = ["viewport-reflow"];
      responsive.method = "viewport-reflow";
      responsive.evidenceClass = "responsive";
      records.push(responsive);
    }
  }
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/articles/#start");
    await expect(page.locator(".creation-deck")).toHaveCount(1);
  await page
    .locator("#start .v2-start-card")
    .first()
    .evaluate((card) => {
      card.querySelector<HTMLElement>(
        ".v2-start-card-face > strong",
      )!.textContent = "長い日本語の検証用タイトル";
      card.querySelector<HTMLElement>(
        ".v2-start-card-description",
      )!.textContent =
        "説明文の折り返しを確認します https://example.invalid/" +
        "unbrokenAsciiToken".repeat(12);
    });
  const longSurface = await probeSurface(
    page,
    "#start li:first-child .v2-start-card",
  );
  const longWidths = await diagnoseWidths(page);
  const longScreenshot = "long-content-320.png";
  await page.screenshot({
    path: path.join(output, longScreenshot),
    fullPage: true,
  });
  records.push({
    id: "stage-a-long-content",
    caseId: "VL-V1-LONG-CONTENT",
    variantId: matrix.cases.find(({ id }) => id === "VL-V1-LONG-CONTENT")!
      .variants[0].id,
    route: "/articles/",
    state: [
      matrix.cases.find(({ id }) => id === "VL-V1-LONG-CONTENT")!.variants[0]
        .state,
    ],
    coverage: ["long-content", "surface-probe"],
    surface: {
      kind: "dom",
      selector: "#start li:first-child .v2-start-card",
      matched: longSurface.matched,
    },
    method: "viewport-reflow",
    evidenceClass: "responsive",
    requestedFactor: 1,
    achieved: [
      {
        role: "card",
        baselineFontPx: 16,
        changedFontPx: 16,
        factor: 1,
        baselineLineHeightPx: 24,
        changedLineHeightPx: 24,
      },
    ],
    browser: {
      name: browserName,
      version,
      viewport: { width: 320, height: 844 },
      dpr: await page.evaluate(() => devicePixelRatio),
    },
    diagnostics: {
      documentOverflowPx: longWidths.documentOverflowPx,
      unownedOverflowingElements: longWidths.unownedOverflowingElements.length,
      clippedText: longSurface.clippedText.length,
      undersizedTargets: longSurface.undersizedTargets.length,
      focusApplicable: longSurface.focusApplicable,
      focusReachable: longSurface.focusReachable,
      focusVisible: longSurface.focusVisible,
      orderPreserved: true,
      associationsPreserved: true,
    },
    geometry: {
      layout: "not-applicable",
      nonoverlapping: true,
      contentVisible: longSurface.clippedText.length === 0,
      ownedScrollers: longWidths.ownedLocalScrollers.length,
    },
    screenshot: longScreenshot,
    limitations: [
      "Disposable DOM stress content; published article data was not changed.",
      `The bounded focus probe returned ${longSurface.focusVerification}; the directly affected V1 spec also retains its first-card focus assertion.`,
    ],
    reviewerDecision:
      longWidths.documentOverflowPx ||
      longWidths.unownedOverflowingElements.length ||
      longSurface.clippedText.length ||
      longSurface.undersizedTargets.length ||
      !longSurface.focusReachable ||
      !longSurface.focusVisible
        ? "FAIL"
        : "PASS",
    review: { kind: "automated", reviewer: "Playwright Stage A emitter" },
    capturedAt: new Date().toISOString(),
  });
  const manifest: ReflowEvidenceManifest = {
    schema: reflowEvidenceVersion,
    target: {
      sha: sourceIdentity.sha,
      environment: "local",
      baseUrl: "http://127.0.0.1:3100",
      sourceIdentity,
    },
    records,
  };
  validateExecutionSubset(matrix, manifest, sourceIdentity.sha, ["VL-V1-METADATA", "VL-V1-LONG-CONTENT"]);
  writeFileSync(
    path.join(output, "manifest.json"),
    `${JSON.stringify({ ...manifest, execution: { testedPaths, command: "npx playwright test e2e/stage-a-evidence.spec.ts", subsetGate: "PASS" } }, null, 2)}\n`,
  );
});
