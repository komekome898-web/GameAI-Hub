import { describe, expect, test } from "vitest";
import matrix from "../docs/design/visual-layer-v2/TEST-MATRIX.json";
import { validateDesignCoverage, validateFinalExecution, type ReflowMatrix } from "../e2e/acceptance/reflow-matrix";
import { reflowEvidenceVersion } from "../e2e/acceptance/manifest";

describe("Visual Layer all-phase matrix", () => {
  test("has complete, owned design coverage", () => expect(validateDesignCoverage(matrix).cases.length).toBeGreaterThan(20));
  test("does not falsely count planned implementation as final PASS", () =>
    expect(() => validateFinalExecution(matrix, { target: { sha: "a".repeat(40) }, records: [] }, "a".repeat(40))).toThrow(/PLANNED/));
  test("rejects missing surfaces, stale short SHAs, and synthetic physical claims", () => {
    const missing = structuredClone(matrix) as typeof matrix;
    missing.cases[0].selector = "";
    expect(() => validateDesignCoverage(missing)).toThrow(/incomplete ownership/);
    const complete = structuredClone(matrix) as unknown as ReflowMatrix;
    complete.cases.forEach((item) => { if (item.requiredForFinal && item.phase !== "Production") { item.status = "VERIFIED"; item.evidence = ["local.json"]; } });
    expect(() => validateFinalExecution(complete, { target: { sha: "abc1234" }, records: [] }, "abc1234")).toThrow(/exact 40/);
    expect(() => validateFinalExecution(complete, { schema: reflowEvidenceVersion, target: { sha: "b".repeat(40), environment: "local", baseUrl: "http://127.0.0.1:3100" }, records: [] }, "a".repeat(40))).toThrow(/does not match/);
  });
  test("binds every final case to one complete, exact-SHA PASS record", () => {
    const complete = structuredClone(matrix) as unknown as ReflowMatrix;
    complete.cases.forEach((item) => { if (item.requiredForFinal && item.phase !== "Production") { item.status = "VERIFIED"; item.evidence = ["manifest.json"]; } });
    const sha = "a".repeat(40);
    const records = (item: ReflowMatrix["cases"][number]) => item.method.map((requirement, index) => {
      const method = requirement.startsWith("spacing-") ? "text-spacing" : ["synthetic-root-text", "synthetic-computed-text", "text-spacing", "browser-zoom", "cdp-pinch", "os-text", "physical-device"].includes(requirement) ? requirement : "viewport-reflow";
      const factor = requirement === "factor-150" ? 1.5 : requirement === "factor-200" ? 2 : 1;
      const width = Number(requirement.match(/^viewport-(\d+)$/)?.[1] ?? 320);
      const spacingVariant = requirement.match(/^spacing-(line-height|paragraph|letter|word)$/)?.[1] ?? (method === "text-spacing" ? "line-height" : undefined);
      return {
      id: `evidence-${item.id}-${index}`, caseId: item.id, route: "/", state: [item.state], coverage: [requirement], surface: { selector: "main", matched: 1 },
      method, evidenceClass: method.startsWith("synthetic") || method === "text-spacing" ? "synthetic" : method === "physical-device" ? "physical" : method === "os-text" ? "os" : method === "viewport-reflow" ? "responsive" : "browser", requestedFactor: factor,
      achieved: [{ role: "body", baselineFontPx: 16, changedFontPx: 16 * factor, factor }],
      browser: { name: "chromium", version: "1", viewport: { width, height: 844 }, dpr: 1 },
      diagnostics: { documentOverflowPx: 0, unownedOverflowingElements: 0, clippedText: 0, undersizedTargets: 0, focusReachable: true, focusVisible: true, orderPreserved: true, associationsPreserved: true },
      geometry: { layout: "not-applicable", nonoverlapping: true, contentVisible: true, ownedScrollers: 0 },
      ...(spacingVariant ? { spacing: { override: spacingVariant, language: "ja", applicable: true } } : {}),
      screenshot: `${item.id}-${index}.png`, limitations: ["Test fixture."], reviewerDecision: "PASS", review: { kind: requirement === "independent-review" ? "independent" : "automated", reviewer: "reviewer" },
    }});
    const evidence = { schema: reflowEvidenceVersion, target: { sha, environment: "local", baseUrl: "http://127.0.0.1:3100" },
      records: complete.cases.filter((item) => item.requiredForFinal && item.phase !== "Production").flatMap(records) };
    expect(() => validateFinalExecution(complete, evidence, sha)).not.toThrow();
    evidence.records[0].diagnostics.clippedText = 1;
    expect(() => validateFinalExecution(complete, evidence, sha)).toThrow(/PASS contradicts/);
  });
});
