import { expect, test } from "vitest";
import {
  assertReflowEvidenceManifest,
  reflowEvidenceVersion,
} from "../e2e/acceptance/manifest";

const valid = () => ({
  schema: reflowEvidenceVersion,
  target: {
    sha: "a".repeat(40),
    environment: "local" as const,
    baseUrl: "http://127.0.0.1:3100",
  },
  records: [
    {
      id: "record",
      caseId: "VL-V1-METADATA",
      variantId: "metadata-200",
      route: "/articles/",
      state: ["metadata-200"],
      coverage: ["synthetic-computed-text", "factor-200"],
      surface: {
        kind: "dom" as const,
        selector: "#start .v2-start-card-meta",
        matched: 1,
      },
      method: "synthetic-computed-text" as const,
      requestedFactor: 2,
      achieved: [
        {
          role: "label",
          baselineFontPx: 12,
          changedFontPx: 24,
          factor: 2,
          baselineLineHeightPx: 18,
          changedLineHeightPx: 36,
        },
      ],
      evidenceClass: "synthetic" as const,
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
      screenshot: "capture.png",
      geometry: {
        layout: "stacked" as const,
        nonoverlapping: true,
        contentVisible: true,
        ownedScrollers: 0,
      },
      limitations: [
        "Synthetic computed text; not browser zoom or physical-device evidence.",
      ],
      reviewerDecision: "PASS" as const,
      review: { kind: "automated" as const, reviewer: "Playwright" },
      capturedAt: "2026-09-30T12:00:00.000Z",
    },
  ],
});

test("accepts compatible explicit reflow evidence", () =>
  expect(() =>
    assertReflowEvidenceManifest(valid(), "a".repeat(40)),
  ).not.toThrow());
test("rejects zero surfaces, stale SHA, synthetic physical classification, and unachieved PASS scale", () => {
  const zero = valid();
  if (zero.records[0].surface.kind === "dom")
    zero.records[0].surface.matched = 0;
  expect(() => assertReflowEvidenceManifest(zero)).toThrow(/zero matched/);
  expect(() => assertReflowEvidenceManifest(valid(), "b".repeat(40))).toThrow(
    /does not match/,
  );
  const mislabeled = valid();
  (mislabeled.records[0] as { evidenceClass: string }).evidenceClass =
    "physical";
  expect(() => assertReflowEvidenceManifest(mislabeled)).toThrow(
    /classification mismatch/,
  );
  const unchanged = valid();
  unchanged.records[0].achieved[0] = {
    role: "label",
    baselineFontPx: 14,
    changedFontPx: 14,
    factor: 1,
    baselineLineHeightPx: 20,
    changedLineHeightPx: 20,
  };
  expect(() => assertReflowEvidenceManifest(unchanged)).toThrow(
    /did not achieve requested/,
  );
});
