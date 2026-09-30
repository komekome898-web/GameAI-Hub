import { expect, test } from "vitest";
import { assertReflowEvidenceManifest, reflowEvidenceVersion } from "../e2e/acceptance/manifest";

const valid = () => ({ schema: reflowEvidenceVersion, target: { sha: "a".repeat(40), environment: "local" as const, baseUrl: "http://127.0.0.1:3100" }, records: [{
  id: "record", caseId: "VL-V1-META", route: "/articles/", state: ["metadata"], coverage: ["surface-probe"], surface: { selector: "#start", matched: 1 },
  method: "synthetic-computed-text" as const, requestedFactor: 2, achieved: [{ role: "label", baselineFontPx: 12, changedFontPx: 24, factor: 2 }],
  evidenceClass: "synthetic" as const,
  browser: { name: "chromium", version: "1", viewport: { width: 320, height: 844 }, dpr: 1 },
  diagnostics: { documentOverflowPx: 0, unownedOverflowingElements: 0, clippedText: 0, undersizedTargets: 0, focusReachable: true, focusVisible: true, orderPreserved: true, associationsPreserved: true }, screenshot: "capture.png",
  geometry: { layout: "stacked" as const, nonoverlapping: true, contentVisible: true, ownedScrollers: 0 },
  limitations: ["Synthetic computed text; not browser zoom or physical-device evidence."], reviewerDecision: "PENDING" as const, review: { kind: "automated" as const, reviewer: "Playwright" },
}] });

test("accepts compatible explicit reflow evidence", () => expect(() => assertReflowEvidenceManifest(valid(), "a".repeat(40))).not.toThrow());
test("rejects zero surfaces, stale SHA, and synthetic physical classification", () => {
  const zero = valid(); zero.records[0].surface.matched = 0;
  expect(() => assertReflowEvidenceManifest(zero)).toThrow(/zero matched/);
  expect(() => assertReflowEvidenceManifest(valid(), "b".repeat(40))).toThrow(/does not match/);
  const mislabeled = valid(); (mislabeled.records[0] as { evidenceClass: string }).evidenceClass = "physical";
  expect(() => assertReflowEvidenceManifest(mislabeled)).toThrow(/classification mismatch/);
});
