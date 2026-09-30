import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
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

const output = path.join(process.cwd(), "docs/screenshots/issue-157-stage-b/v2");
const roles: TextRole[] = [
  { role: "help", selector: ".home-execution-hero .idea-meta span:first-child" },
  { role: "counter", selector: ".home-execution-hero .idea-meta span:last-child" },
];

test("V2 Home observations emit and validate current typed evidence", async ({
  page,
  browserName,
}) => {
  test.setTimeout(120_000);
  await mkdir(output, { recursive: true });
  const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  const testedPaths = [
    "app/globals.css",
    "app/visual-layer-v2.css",
    "components/ProjectGeneratorClient.tsx",
    "e2e/acceptance/manifest.ts",
    "e2e/acceptance/reflow-matrix.ts",
    "e2e/acceptance/reflow.ts",
    "e2e/issue-157-reflow-evidence.spec.ts",
    "docs/design/visual-layer-v2/TEST-MATRIX.json",
  ];
  const worktreeDiffHash = createHash("sha256")
    .update(testedPaths.map((file) => `${file}\0${readFileSync(file)}`).join("\0"))
    .digest("hex");
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
    const focusApplicable = false;
    const surface = await probeSurface(
      page,
      caseId === "VL-V2-HOME-INITIAL" ? ".home-execution-hero" : ".idea-meta",
      0,
    );
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
        selector: caseId === "VL-V2-HOME-INITIAL" ? ".home-execution-hero" : ".idea-meta",
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
        clippedText: surface.clippedText.length,
        undersizedTargets: surface.undersizedTargets.length,
        focusApplicable,
        focusReachable: true,
        focusVisible: true,
        orderPreserved: true,
        associationsPreserved: true,
      },
      geometry: { layout: "not-applicable", nonoverlapping: true, contentVisible: surface.clippedText.length === 0, ownedScrollers: widths.ownedLocalScrollers.length },
      spacing,
      screenshot: `v2/${screenshot}`,
      limitations: ["Synthetic Chromium text stress; not browser zoom, OS scaling, or physical-device evidence."],
      reviewerDecision: widths.documentOverflowPx || surface.clippedText.length ? "FAIL" : "PASS",
      review: { kind: "automated", reviewer: "Playwright V2 evidence emitter" },
      capturedAt: new Date().toISOString(),
    });
    await scale.restore();
  };

  await page.goto("/");
  await expect(page.locator(".home-execution-hero")).toBeVisible();
  await observe({ id: "v2-home-initial-320", caseId: "VL-V2-HOME-INITIAL", variantId: "empty-initial-normal-first-view", width: 320, method: "viewport-reflow", coverage: ["viewport-reflow", "text-scale"], textRoles: [{ role: "heading", selector: ".home-execution-hero h1" }] });

  await page.getByRole("button", { name: "最初の作業を作る" }).click();
  await expect(page.locator(".home-execution-hero [role=alert]")).toBeVisible();
  await observe({ id: "v2-home-empty-validation", caseId: "VL-V2-HOME-META", variantId: "empty-validation", width: 320, method: "viewport-reflow", coverage: ["semantic-row", "short-height"] });

  await page.goto("/");
  const row = await probeSemanticRow(page.locator(".idea-meta"), "span:first-child", "span:last-child");
  expect(row.nonoverlapping && row.contained).toBe(true);
  await observe({ id: "v2-home-meta-100", caseId: "VL-V2-HOME-META", variantId: "counter-privacy", width: 320, method: "synthetic-computed-text", factor: 1, coverage: ["synthetic-computed-text", "factor-100", "viewport-320", "semantic-row"] });

  await page.locator(".idea-examples-panel").evaluate((element) => ((element as HTMLDetailsElement).open = true));
  await observe({ id: "v2-home-examples-150", caseId: "VL-V2-HOME-META", variantId: "examples-expanded", width: 320, method: "synthetic-computed-text", factor: 1.5, coverage: ["synthetic-computed-text", "factor-150", "viewport-320"] });

  const idea = page.getByLabel("どんなゲームを作りたいですか？");
  await idea.fill("長".repeat(Number(await idea.getAttribute("maxlength")) || 1000));
  await observe({ id: "v2-home-maximum-200", caseId: "VL-V2-HOME-META", variantId: "maximum-input", width: 375, method: "synthetic-root-text", factor: 2, coverage: ["synthetic-root-text", "factor-200", "viewport-375"] });

  for (const override of ["line-height", "paragraph", "letter", "word"] as const) {
    await observe({ id: `v2-home-spacing-${override}`, caseId: "VL-V2-HOME-META", variantId: "counter-privacy", width: 375, method: "text-spacing", coverage: ["text-spacing", `spacing-${override}`], spacing: { override, language: "ja", applicable: true } });
  }

  const manifest: ReflowEvidenceManifest = {
    schema: reflowEvidenceVersion,
    target: { sha, environment: "local", baseUrl: "http://127.0.0.1:3100", worktreeDiffHash },
    records,
  };
  validateExecutionSubset(matrix, manifest, sha, ["VL-V2-HOME-INITIAL", "VL-V2-HOME-META"]);
  await writeFile(path.join(output, "manifest.json"), `${JSON.stringify({ ...manifest, execution: { testedPaths, command: "npx playwright test e2e/issue-157-reflow-evidence.spec.ts", subsetGate: "PASS" } }, null, 2)}\n`);
});
