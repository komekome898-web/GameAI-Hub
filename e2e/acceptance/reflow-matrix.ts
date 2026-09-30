export type MatrixStatus = "PLANNED" | "IMPLEMENTED" | "VERIFIED" | "OWNER-DEFERRED";
export type ReflowCase = {
  id: string; findings: string[]; phase: string; route: string; state: string;
  surface: string; selector: string; method: string[]; owner: string; requiredForFinal: boolean;
  status: MatrixStatus; evidence?: string[];
};
export type ReflowMatrix = { schema: "gameai-reflow-matrix/v1"; cases: ReflowCase[] };

const findingIds = Array.from({ length: 7 }, (_, index) => `VL-DES-0${index + 1}`);

export function validateDesignCoverage(value: unknown): ReflowMatrix {
  if (!value || typeof value !== "object") throw new Error("matrix must be an object");
  const matrix = value as ReflowMatrix;
  if (matrix.schema !== "gameai-reflow-matrix/v1" || !Array.isArray(matrix.cases)) throw new Error("unsupported matrix schema");
  const ids = new Set<string>();
  for (const item of matrix.cases) {
    if (!/^VL-(?:V[0-4]|SHARED|FINAL|PROD)-[A-Z0-9-]+$/.test(item.id) || ids.has(item.id)) throw new Error(`invalid or duplicate case id: ${item.id}`);
    ids.add(item.id);
    if (!item.phase || !item.route || !item.state || !item.surface || !item.selector || !item.owner) throw new Error(`${item.id}: incomplete ownership`);
    if (!item.method.length || !item.findings.length || item.findings.some((id) => !findingIds.includes(id))) throw new Error(`${item.id}: invalid method/finding coverage`);
    if (!(["PLANNED", "IMPLEMENTED", "VERIFIED", "OWNER-DEFERRED"] as string[]).includes(item.status)) throw new Error(`${item.id}: invalid status`);
    if (item.status === "VERIFIED" && !item.evidence?.length) throw new Error(`${item.id}: verified requires evidence`);
    if (item.status === "OWNER-DEFERRED" && item.phase !== "Production") throw new Error(`${item.id}: only Production may be owner-deferred`);
  }
  for (const finding of findingIds) if (!matrix.cases.some(({ findings }) => findings.includes(finding))) throw new Error(`${finding}: orphan finding`);
  for (const phase of ["V0", "V1", "V2", "V3", "V4", "Shared", "Final", "Production"])
    if (!matrix.cases.some((item) => item.phase === phase)) throw new Error(`${phase}: missing phase coverage`);
  const requiredByPhase: Record<string, string[]> = {
    V0: findingIds, V1: ["VL-DES-01", "VL-DES-02", "VL-DES-05", "VL-DES-07"],
    V2: ["VL-DES-01", "VL-DES-02", "VL-DES-03", "VL-DES-04", "VL-DES-05", "VL-DES-07"],
    V3: ["VL-DES-01", "VL-DES-02", "VL-DES-03", "VL-DES-04", "VL-DES-05", "VL-DES-07"],
    V4: findingIds, Shared: ["VL-DES-01", "VL-DES-02", "VL-DES-03", "VL-DES-04", "VL-DES-05", "VL-DES-07"], Final: findingIds,
  };
  for (const [phase, findings] of Object.entries(requiredByPhase))
    for (const finding of findings)
      if (!matrix.cases.some((item) => item.phase === phase && item.findings.includes(finding))) throw new Error(`${phase}: missing ${finding} coverage`);
  return matrix;
}

export function validateFinalExecution(value: unknown, evidence: unknown, expectedSha: string) {
  const matrix = validateDesignCoverage(value);
  const incomplete = matrix.cases.filter((item) => item.requiredForFinal && item.phase !== "Production" && item.status !== "VERIFIED");
  if (incomplete.length) throw new Error(`final execution incomplete: ${incomplete.map(({ id, status }) => `${id}=${status}`).join(", ")}`);
  if (!/^[0-9a-f]{40}$/.test(expectedSha)) throw new Error("final evidence requires an exact 40-character SHA");
  assertReflowEvidenceManifest(evidence, expectedSha);
  const validated = evidence as ReflowEvidenceManifest;
  const byCase = new Map<string, ReflowEvidenceManifest["records"]>();
  const requiredIds = new Set(matrix.cases.filter((entry) => entry.requiredForFinal && entry.phase !== "Production").map(({ id }) => id));
  for (const record of validated.records) {
    if (!requiredIds.has(record.caseId)) throw new Error(`${record.caseId}: evidence is not a required final case`);
    byCase.set(record.caseId, [...(byCase.get(record.caseId) ?? []), record]);
    if (record.reviewerDecision !== "PASS" || record.diagnostics.documentOverflowPx > 0 || record.diagnostics.unownedOverflowingElements > 0
      || record.diagnostics.clippedText > 0 || record.diagnostics.undersizedTargets > 0 || !record.diagnostics.focusReachable || !record.diagnostics.focusVisible
      || !record.diagnostics.orderPreserved || !record.diagnostics.associationsPreserved || !record.geometry.nonoverlapping || !record.geometry.contentVisible)
      throw new Error(`${record.caseId}: final evidence is not accepted`);
  }
  for (const item of matrix.cases.filter((entry) => entry.requiredForFinal && entry.phase !== "Production")) {
    const records = byCase.get(item.id) ?? [];
    if (!records.length) throw new Error(`${item.id}: missing accepted evidence records`);
    if (!records.some(({ state }) => state.includes(item.state))) throw new Error(`${item.id}: required state was not evidenced`);
    const covered = new Set(records.flatMap(({ coverage }) => coverage));
    for (const requirement of item.method) if (!covered.has(requirement)) throw new Error(`${item.id}: missing evidence requirement ${requirement}`);
    const evidenceMethods = ["viewport-reflow", "synthetic-root-text", "synthetic-computed-text", "text-spacing", "browser-zoom", "cdp-pinch", "os-text", "physical-device"];
    for (const method of item.method.filter((value) => evidenceMethods.includes(value)))
      if (!records.some((record) => record.method === method && record.coverage.includes(method))) throw new Error(`${item.id}: required method ${method} was not executed`);
    for (const [tag, factor] of [["factor-100", 1], ["factor-150", 1.5], ["factor-200", 2]] as const)
      if (item.method.includes(tag) && !records.some((record) => record.coverage.includes(tag) && Math.abs(record.requestedFactor - factor) <= 0.02))
        throw new Error(`${item.id}: ${tag} factor was not achieved`);
    for (const width of [320, 375, 390, 1440]) {
      const tag = `viewport-${width}`;
      if (item.method.includes(tag) && !records.some((record) => record.coverage.includes(tag) && record.browser.viewport.width === width))
        throw new Error(`${item.id}: ${tag} was not evidenced`);
    }
    for (const variant of ["line-height", "paragraph", "letter", "word"] as const) {
      const tag = `spacing-${variant}`;
      if (item.method.includes(tag) && !records.some((record) => record.coverage.includes(tag) && record.method === "text-spacing" && record.spacing?.override === variant))
        throw new Error(`${item.id}: ${tag} was not evidenced`);
    }
    if (item.method.includes("independent-review") && !records.some(({ review }) => review.kind === "independent"))
      throw new Error(`${item.id}: independent review evidence is missing`);
  }
  return matrix;
}
import { assertReflowEvidenceManifest, type ReflowEvidenceManifest } from "./manifest";
