import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "./fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";
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
  type TextMethod,
  type TextRole,
} from "./acceptance/reflow";
import matrix from "../docs/design/visual-layer-v2/TEST-MATRIX.json";
import { cleanSourceIdentity } from "./acceptance/source-identity";

const output = path.join(process.cwd(), "docs/screenshots/issue-157-stage-b/v2");
const roles: TextRole[] = [
  { role: "counter", selector: ".home-execution-hero .idea-meta span:first-child" },
  { role: "privacy-help", selector: ".home-execution-hero .idea-meta span:last-child" },
];

test("V2 Home observations emit and validate current typed evidence", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);
  await mkdir(output, { recursive: true });
  const sourceIdentity = cleanSourceIdentity();
  const sha = sourceIdentity.sha;
  const version = await page.context().browser()!.version();
  const records: ReflowEvidenceRecord[] = [];

  const observe = async ({
    id,
    caseId,
    variantId,
    width,
    method,
    factor = 1,
    coverage,
    textRoles = roles,
    probeSelector = ".idea-meta",
    spacing,
  }: {
    id: string;
    caseId: string;
    variantId: string;
    width: number;
    method: "viewport-reflow" | "synthetic-root-text" | "synthetic-computed-text" | "text-spacing";
    factor?: number;
    coverage: string[];
    textRoles?: TextRole[];
    probeSelector?: string;
    spacing?: ReflowEvidenceRecord["spacing"];
  }) => {
    await page.setViewportSize({ width, height: 640 });
    const selected: TextMethod = spacing
      ? (`spacing-${spacing.override}` as TextMethod)
      : method === "viewport-reflow" || method === "text-spacing"
        ? "none"
        : method;
    const scale = await applyTextMethod(page, textRoles, selected, factor);
    expect(scale.sufficient).toBe(true);
    const declaredSelector = caseId === "VL-V2-HOME-INITIAL"
      ? ".home-execution-hero"
      : ".idea-meta";
    const surface = await probeSurface(page, declaredSelector, 44);
    const childSurface = probeSelector === declaredSelector
      ? surface
      : await probeSurface(page, probeSelector, 0);
    const row = await probeSemanticRow(
      page.locator(".idea-meta"),
      "span:first-child",
      "span:last-child",
    );
    const relationships = await page.evaluate(() => {
      const form = document.querySelector(".home-execution-hero form");
      const textarea = form?.querySelector("textarea");
      const button = form?.querySelector('button[type="submit"]');
      const describedBy = textarea?.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? [];
      const associationsPreserved = describedBy.length > 0 && describedBy.every((id) => Boolean(document.getElementById(id)));
      const orderPreserved = Boolean(
        textarea && button &&
        (textarea.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING),
      );
      return { associationsPreserved, orderPreserved };
    });
    const widths = await diagnoseWidths(page);
    const screenshot = `${id}.png`;
    await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
    records.push({
      id,
      caseId,
      variantId,
      route: "/",
      state: [variantId],
      coverage,
      surface: {
        kind: "dom",
        selector: declaredSelector,
        matched: surface.matched,
      },
      method,
      evidenceClass: method === "viewport-reflow" ? "responsive" : "synthetic",
      requestedFactor: factor,
      achieved: scale.measurements.flatMap((measurement) =>
        measurement.achievedFactors.map((achievedFactor, index) => ({
          role: measurement.role,
          baselineFontPx: measurement.baselineFontPx[index],
          changedFontPx: measurement.changedFontPx[index],
          factor: achievedFactor,
          baselineLineHeightPx: measurement.baselineLineHeightPx[index],
          changedLineHeightPx: measurement.changedLineHeightPx[index],
        })),
      ),
      browser: { name: browserName, version, viewport: { width, height: 640 }, dpr: await page.evaluate(() => devicePixelRatio) },
      diagnostics: {
        documentOverflowPx: widths.documentOverflowPx,
        unownedOverflowingElements: widths.unownedOverflowingElements.length,
        clippedText: surface.clippedText.length + childSurface.clippedText.length,
        undersizedTargets: surface.undersizedTargets.length,
        focusApplicable: surface.focusApplicable,
        focusReachable: surface.focusReachable,
        focusVisible: surface.focusVisible,
        orderPreserved: relationships.orderPreserved,
        associationsPreserved: relationships.associationsPreserved,
      },
      geometry: {
        layout: row.layout,
        nonoverlapping: row.nonoverlapping,
        contentVisible: surface.clippedText.length === 0 && childSurface.clippedText.length === 0 && row.contained,
        ownedScrollers: widths.ownedLocalScrollers.length,
        ordinaryLabelSqueezed: row.ordinaryLabelSqueezed,
        labelWidth: row.labelWidth,
        naturalLabelWidth: row.naturalLabelWidth,
      },
      spacing,
      screenshot: `v2/${screenshot}`,
      limitations: [
        "Synthetic Chromium text stress; not browser zoom, OS scaling, or physical-device evidence.",
        ...(surface.focusFailures.length ? [`Focus failures: ${JSON.stringify(surface.focusFailures)}`] : []),
      ],
      reviewerDecision:
        widths.documentOverflowPx ||
        surface.clippedText.length ||
        surface.undersizedTargets.length ||
        (surface.focusApplicable && (!surface.focusReachable || !surface.focusVisible)) ||
        !relationships.orderPreserved ||
        !relationships.associationsPreserved ||
        !row.nonoverlapping ||
        !row.contained ||
        row.ordinaryLabelSqueezed
          ? "FAIL"
          : "PASS",
      review: { kind: "automated", reviewer: "Playwright V2 evidence emitter" },
      capturedAt: new Date().toISOString(),
    });
    await scale.restore();
  };

  await page.goto("/");
  await expect(page.locator(".home-execution-hero")).toBeVisible();
  await observe({ id: "v2-home-initial-320", caseId: "VL-V2-HOME-INITIAL", variantId: "empty-initial-normal-first-view", width: 320, method: "viewport-reflow", coverage: ["viewport-reflow"], textRoles: [{ role: "heading", selector: ".home-execution-hero h1" }], probeSelector: ".home-execution-hero .project-idea-card" });
  await observe({ id: "v2-home-initial-150", caseId: "VL-V2-HOME-INITIAL", variantId: "empty-initial-normal-first-view", width: 375, method: "synthetic-root-text", factor: 1.5, coverage: ["synthetic-root-text", "text-scale", "factor-150", "viewport-375"], textRoles: [{ role: "heading", selector: ".home-execution-hero h1" }, ...roles], probeSelector: ".home-execution-hero .project-idea-card" });

  await page.getByRole("button", { name: "最初の作業を作る" }).click();
  await expect(page.locator(".home-execution-hero [role=alert]")).toBeVisible();
  await observe({ id: "v2-home-empty-validation", caseId: "VL-V2-HOME-META", variantId: "empty-validation", width: 320, method: "viewport-reflow", coverage: ["semantic-row", "short-height"], textRoles: [{ role: "validation-error", selector: ".home-execution-hero .form-error" }, { role: "cta", selector: ".home-execution-hero button[type=submit]" }], probeSelector: ".home-execution-hero .project-idea-card" });

  await page.goto("/");
  await observe({ id: "v2-home-meta-100", caseId: "VL-V2-HOME-META", variantId: "counter-privacy", width: 320, method: "synthetic-computed-text", factor: 1, coverage: ["synthetic-computed-text", "factor-100", "viewport-320", "semantic-row"] });

  await page.locator(".idea-examples-panel").evaluate((element) => ((element as HTMLDetailsElement).open = true));
  await observe({ id: "v2-home-examples-150", caseId: "VL-V2-HOME-META", variantId: "examples-expanded", width: 320, method: "synthetic-computed-text", factor: 1.5, coverage: ["synthetic-computed-text", "factor-150", "viewport-320"], textRoles: [{ role: "examples-summary", selector: ".idea-examples-panel summary" }, { role: "example-control", selector: ".idea-examples-panel .idea-examples button" }, ...roles], probeSelector: ".home-execution-hero .project-idea-card" });

  const idea = page.getByLabel("どんなゲームを作りたいですか？");
  await idea.fill("長".repeat(Number(await idea.getAttribute("maxlength")) || 1000));
  await observe({ id: "v2-home-maximum-200", caseId: "VL-V2-HOME-META", variantId: "maximum-input", width: 375, method: "synthetic-computed-text", factor: 2, coverage: ["synthetic-computed-text", "factor-200", "viewport-375"], textRoles: [{ role: "maximum-input", selector: ".home-execution-hero textarea" }, { role: "cta", selector: ".home-execution-hero button[type=submit]" }, ...roles], probeSelector: ".home-execution-hero .project-idea-card" });

  for (const override of ["line-height", "paragraph", "letter", "word"] as const) {
    await observe({ id: `v2-home-spacing-${override}`, caseId: "VL-V2-HOME-META", variantId: "counter-privacy", width: 375, method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true } });
  }

  const manifest: ReflowEvidenceManifest = {
    schema: reflowEvidenceVersion,
    target: { sha, environment: "local", baseUrl: "http://127.0.0.1:3100", sourceIdentity },
    records,
  };
  const manifestPath = path.join(output, "manifest.json");
  const execution = {
    sourceIdentity,
    command: "npx playwright test e2e/issue-157-reflow-evidence.spec.ts",
    subsetGate: "PENDING",
    reasons: [] as string[],
  };
  try {
    validateExecutionSubset(matrix, manifest, sha, ["VL-V2-HOME-INITIAL", "VL-V2-HOME-META"]);
    execution.subsetGate = "PASS";
  } catch (error) {
    execution.subsetGate = "FAIL";
    execution.reasons.push(error instanceof Error ? error.message : String(error));
    await writeFile(manifestPath, `${JSON.stringify({ ...manifest, execution }, null, 2)}\n`);
    throw error;
  }
  await writeFile(manifestPath, `${JSON.stringify({ ...manifest, execution }, null, 2)}\n`);
});
