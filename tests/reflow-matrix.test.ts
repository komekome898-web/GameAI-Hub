import { describe, expect, test } from "vitest";
import matrix from "../docs/design/visual-layer-v2/TEST-MATRIX.json";
import {
  validateDesignCoverage,
  validateExecutionSubset,
  validateFinalExecution,
  type ReflowCase,
  type ReflowMatrix,
} from "../e2e/acceptance/reflow-matrix";
import {
  reflowEvidenceVersion,
  type ReflowEvidenceRecord,
} from "../e2e/acceptance/manifest";

const sha = "a".repeat(40);
const baseRecord = (
  item: ReflowCase,
  variant = item.variants[0],
  index = 0,
): ReflowEvidenceRecord => ({
  id: `evidence-${item.id}-${variant.id}-${index}`,
  caseId: item.id,
  variantId: variant.id,
  route: variant.route.value,
  state: [variant.state],
  coverage: ["variant-observation"],
  surface:
    item.surfaceRequirement.kind === "dom"
      ? { kind: "dom", selector: item.surfaceRequirement.selector, matched: 1 }
      : { kind: "static", artifact: item.surfaceRequirement.artifact },
  method: "viewport-reflow",
  evidenceClass: "responsive",
  requestedFactor: 1,
  achieved: [
    {
      role: "body",
      baselineFontPx: 16,
      changedFontPx: 16,
      factor: 1,
      baselineLineHeightPx: 24,
      changedLineHeightPx: 24,
    },
  ],
  browser: {
    name: "chromium",
    version: "1",
    viewport: { width: 320, height: 844 },
    dpr: 1,
  },
  diagnostics: {
    documentOverflowPx: 0,
    unownedOverflowingElements: 0,
    clippedText: 0,
    undersizedTargets: 0,
    focusApplicable: true,
    focusReachable: true,
    focusVisible: true,
    orderPreserved: true,
    associationsPreserved: true,
  },
  geometry: {
    layout: "not-applicable",
    nonoverlapping: true,
    contentVisible: true,
    ownedScrollers: 0,
  },
  screenshot: `${item.id}.png`,
  limitations: ["fixture"],
  reviewerDecision: "PASS",
  review: { kind: "automated", reviewer: "fixture" },
  capturedAt: "2026-09-30T12:00:00.000Z",
});
function completeEvidence(complete: ReflowMatrix) {
  const records: ReflowEvidenceRecord[] = [];
  for (const item of complete.cases.filter(
    (entry) => entry.requiredForFinal && entry.phase !== "Production",
  )) {
    item.variants.forEach((variant, index) =>
      records.push(baseRecord(item, variant, index)),
    );
    item.method.forEach((requirement, index) => {
      const record = baseRecord(
        item,
        item.variants[index % item.variants.length],
        100 + index,
      );
      record.coverage = [requirement];
      const spacing = requirement.match(
        /^spacing-(line-height|paragraph|letter|word)$/,
      )?.[1] as "line-height" | "paragraph" | "letter" | "word" | undefined;
      if (spacing || requirement === "text-spacing") {
        record.method = "text-spacing";
        record.evidenceClass = "synthetic";
        record.spacing = {
          override: spacing ?? "line-height",
          language: "ja",
          applicable: true,
        };
      } else if (
        ["synthetic-root-text", "synthetic-computed-text"].includes(
          requirement,
        ) ||
        /^factor-/.test(requirement)
      ) {
        record.method = requirement.startsWith("synthetic-")
          ? (record.method = requirement as typeof record.method)
          : "synthetic-computed-text";
        record.evidenceClass = "synthetic";
        const factor =
          Number(requirement.match(/^factor-(\d+)$/)?.[1] ?? 100) / 100;
        record.requestedFactor = factor;
        record.achieved[0] = {
          role: "body",
          baselineFontPx: 16,
          changedFontPx: 16 * factor,
          factor,
          baselineLineHeightPx: 24,
          changedLineHeightPx: 24 * factor,
        };
      } else if (["browser-zoom", "cdp-pinch"].includes(requirement)) {
        record.method = requirement as typeof record.method;
        record.evidenceClass = "browser";
      } else if (requirement === "os-text") {
        record.method = "os-text";
        record.evidenceClass = "os";
      } else if (requirement === "physical-device") {
        record.method = "physical-device";
        record.evidenceClass = "physical";
      }
      const width = requirement.match(/^viewport-(\d+)$/)?.[1];
      if (width) record.browser.viewport.width = Number(width);
      if (requirement === "independent-review")
        record.review = { kind: "independent", reviewer: "reviewer" };
      records.push(record);
    });
    item.bindings?.forEach((binding, index) => {
      const variant = item.variants.find(({ id }) => id === binding.variantId)!;
      const record = baseRecord(item, variant, 500 + index);
      record.coverage = [...binding.requires];
      const factor =
        Number(
          binding.requires.find((tag) => tag.startsWith("factor-"))?.slice(7) ??
            100,
        ) / 100;
      record.method = binding.requires.includes("synthetic-root-text")
        ? "synthetic-root-text"
        : "synthetic-computed-text";
      record.evidenceClass = "synthetic";
      record.requestedFactor = factor;
      record.achieved[0] = {
        role: "body",
        baselineFontPx: 16,
        changedFontPx: 16 * factor,
        factor,
        baselineLineHeightPx: 24,
        changedLineHeightPx: 24 * factor,
      };
      record.browser.viewport.width = Number(
        binding.requires.find((tag) => tag.startsWith("viewport-"))?.slice(9) ??
          320,
      );
      records.push(record);
    });
  }
  return {
    schema: reflowEvidenceVersion,
    target: {
      sha,
      environment: "local" as const,
      baseUrl: "http://127.0.0.1:3100",
    },
    records,
  };
}

describe("Visual Layer all-phase matrix", () => {
  test("has complete, owned design coverage", () =>
    expect(validateDesignCoverage(matrix).cases.length).toBeGreaterThan(20));
  test("does not falsely count planned implementation as final PASS", () =>
    expect(() =>
      validateFinalExecution(matrix, { target: { sha }, records: [] }, sha),
    ).toThrow(/PLANNED/));
  test("binds route, surface, and every declared variant", () => {
    const item = validateDesignCoverage(matrix).cases.find(
      ({ id }) => id === "VL-V1-METADATA",
    )!;
    const records = item.variants.map((variant, index) =>
      baseRecord(item, variant, index),
    );
    records[0].coverage = item.method;
    records[0].method = "synthetic-computed-text";
    records[0].evidenceClass = "synthetic";
    records[0].coverage = records[0].coverage.filter(
      (tag) =>
        !tag.startsWith("factor-") &&
        !tag.startsWith("viewport-") &&
        tag !== "synthetic-root-text",
    );
    const evidence = {
      schema: reflowEvidenceVersion,
      target: {
        sha,
        environment: "local" as const,
        baseUrl: "http://127.0.0.1:3100",
      },
      records,
    };
    expect(() =>
      validateExecutionSubset(matrix, evidence, sha, [item.id]),
    ).toThrow(/missing (?:evidence requirement|bound observation)/);
    const full = completeEvidence({
      schema: "gameai-reflow-matrix/v2",
      cases: [item],
    });
    expect(() =>
      validateExecutionSubset(matrix, full, sha, [item.id]),
    ).not.toThrow();
    const wrongRoute = structuredClone(full);
    wrongRoute.records[0].route = "/";
    expect(() =>
      validateExecutionSubset(matrix, wrongRoute, sha, [item.id]),
    ).toThrow(/wrong route/);
    const wrongSurface = structuredClone(full);
    if (wrongSurface.records[0].surface.kind === "dom")
      wrongSurface.records[0].surface.selector = "main";
    expect(() =>
      validateExecutionSubset(matrix, wrongSurface, sha, [item.id]),
    ).toThrow(/wrong surface/);
    const missingVariant = structuredClone(full);
    missingVariant.records = missingVariant.records.filter(
      (record) => record.variantId !== "metadata-150",
    );
    expect(() =>
      validateExecutionSubset(matrix, missingVariant, sha, [item.id]),
    ).toThrow(/missing required variant/);
  });
  test("does not let pinch or requested scale substitute for achieved text enlargement", () => {
    const item = validateDesignCoverage(matrix).cases.find(
      ({ id }) => id === "VL-V1-METADATA",
    )!;
    const evidence = completeEvidence({
      schema: "gameai-reflow-matrix/v2",
      cases: [item],
    });
    const factor200 = evidence.records.find(({ coverage }) =>
      coverage.includes("factor-200"),
    )!;
    factor200.method = "cdp-pinch";
    factor200.evidenceClass = "browser";
    expect(() =>
      validateExecutionSubset(matrix, evidence, sha, [item.id]),
    ).toThrow(/text-enlargement method/);
  });
  test("requires scale and viewport tags in the same declared observation", () => {
    const item = validateDesignCoverage(matrix).cases.find(
      ({ id }) => id === "VL-V1-METADATA",
    )!;
    const evidence = completeEvidence({
      schema: "gameai-reflow-matrix/v2",
      cases: [item],
    });
    const scaled = evidence.records.find(
      ({ coverage }) =>
        coverage.includes("factor-200") && coverage.includes("viewport-375"),
    )!;
    scaled.coverage = scaled.coverage.filter((tag) => tag !== "viewport-375");
    const unrelated = baseRecord(item, item.variants[0], 999);
    unrelated.coverage = ["viewport-375"];
    unrelated.browser.viewport.width = 375;
    evidence.records.push(unrelated);
    expect(() =>
      validateExecutionSubset(matrix, evidence, sha, [item.id]),
    ).toThrow(/missing bound observation/);
  });
  test("binds every final case to complete exact-SHA PASS records", () => {
    const complete = structuredClone(matrix) as unknown as ReflowMatrix;
    complete.cases.forEach((item) => {
      if (item.requiredForFinal && item.phase !== "Production") {
        item.status = "VERIFIED";
        item.evidence = ["manifest.json"];
      }
    });
    const evidence = completeEvidence(complete);
    expect(() => validateFinalExecution(complete, evidence, sha)).not.toThrow();
    evidence.records[0].diagnostics.clippedText = 1;
    expect(() => validateFinalExecution(complete, evidence, sha)).toThrow(
      /PASS contradicts/,
    );
  });
});
