import {
  assertReflowEvidenceManifest,
  type ReflowEvidenceManifest,
  type ReflowEvidenceRecord,
} from "./manifest";

export type MatrixStatus =
  | "PLANNED"
  | "IMPLEMENTED"
  | "VERIFIED"
  | "OWNER-DEFERRED";
export type RouteRequirement = {
  kind: "exact" | "prefix" | "pattern";
  value: string;
};
export type SurfaceRequirement =
  | { kind: "dom"; selector: string; maturity: "measured" | "planned" }
  | { kind: "static"; artifact: string };
export type ReflowVariant = {
  id: string;
  state: string;
  route: RouteRequirement;
};
export type ObservationBinding = {
  id: string;
  variantId: string;
  requires: string[];
};
export type ReflowCase = {
  id: string;
  findings: string[];
  phase: string;
  route: string;
  state: string;
  surface: string;
  selector?: string;
  surfaceRequirement: SurfaceRequirement;
  variants: ReflowVariant[];
  bindings?: ObservationBinding[];
  method: string[];
  owner: string;
  requiredForFinal: boolean;
  status: MatrixStatus;
  evidence?: string[];
};
export type ReflowMatrix = {
  schema: "gameai-reflow-matrix/v2";
  cases: ReflowCase[];
};

const findingIds = Array.from(
  { length: 7 },
  (_, index) => `VL-DES-0${index + 1}`,
);
const variantId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function routeMatches(requirement: RouteRequirement, route: string) {
  if (requirement.kind === "exact") return route === requirement.value;
  if (requirement.kind === "prefix") return route.startsWith(requirement.value);
  return new RegExp(requirement.value).test(route);
}

export function validateDesignCoverage(value: unknown): ReflowMatrix {
  if (!value || typeof value !== "object")
    throw new Error("matrix must be an object");
  const matrix = value as ReflowMatrix;
  if (
    matrix.schema !== "gameai-reflow-matrix/v2" ||
    !Array.isArray(matrix.cases)
  )
    throw new Error("unsupported matrix schema");
  const ids = new Set<string>();
  for (const item of matrix.cases) {
    if (
      !/^VL-(?:V[0-4]|SHARED|FINAL|PROD)-[A-Z0-9-]+$/.test(item.id) ||
      ids.has(item.id)
    )
      throw new Error(`invalid or duplicate case id: ${item.id}`);
    ids.add(item.id);
    if (
      !item.phase ||
      !item.route ||
      !item.state ||
      !item.surface ||
      !item.owner ||
      !item.surfaceRequirement
    )
      throw new Error(`${item.id}: incomplete ownership`);
    if (
      item.surfaceRequirement.kind === "dom" &&
      (!item.surfaceRequirement.selector ||
        !["measured", "planned"].includes(item.surfaceRequirement.maturity))
    )
      throw new Error(`${item.id}: invalid DOM surface`);
    if (
      item.surfaceRequirement.kind === "static" &&
      !item.surfaceRequirement.artifact
    )
      throw new Error(`${item.id}: invalid static artifact`);
    if (
      !item.variants?.length ||
      new Set(item.variants.map(({ id }) => id)).size !== item.variants.length
    )
      throw new Error(
        `${item.id}: explicit variants are required and must be unique`,
      );
    for (const variant of item.variants) {
      if (
        !variantId.test(variant.id) ||
        !variant.state ||
        !["exact", "prefix", "pattern"].includes(variant.route?.kind) ||
        !variant.route.value
      )
        throw new Error(`${item.id}: invalid variant ${variant.id}`);
      if (variant.route.kind === "pattern") {
        try {
          new RegExp(variant.route.value);
        } catch {
          throw new Error(`${item.id}: invalid route pattern`);
        }
      }
    }
    for (const binding of item.bindings ?? []) {
      if (
        !variantId.test(binding.id) ||
        !item.variants.some(({ id }) => id === binding.variantId) ||
        !binding.requires.length ||
        binding.requires.some((tag) => !item.method.includes(tag))
      )
        throw new Error(
          `${item.id}: invalid observation binding ${binding.id}`,
        );
    }
    if (
      !item.method.length ||
      !item.findings.length ||
      item.findings.some((id) => !findingIds.includes(id))
    )
      throw new Error(`${item.id}: invalid method/finding coverage`);
    if (
      !(
        ["PLANNED", "IMPLEMENTED", "VERIFIED", "OWNER-DEFERRED"] as string[]
      ).includes(item.status)
    )
      throw new Error(`${item.id}: invalid status`);
    if (item.status === "VERIFIED" && !item.evidence?.length)
      throw new Error(`${item.id}: verified requires evidence`);
    if (item.status === "OWNER-DEFERRED" && item.phase !== "Production")
      throw new Error(`${item.id}: only Production may be owner-deferred`);
  }
  for (const finding of findingIds)
    if (!matrix.cases.some(({ findings }) => findings.includes(finding)))
      throw new Error(`${finding}: orphan finding`);
  for (const phase of [
    "V0",
    "V1",
    "V2",
    "V3",
    "V4",
    "Shared",
    "Final",
    "Production",
  ])
    if (!matrix.cases.some((item) => item.phase === phase))
      throw new Error(`${phase}: missing phase coverage`);
  const requiredByPhase: Record<string, string[]> = {
    V0: findingIds,
    V1: ["VL-DES-01", "VL-DES-02", "VL-DES-05", "VL-DES-07"],
    V2: [
      "VL-DES-01",
      "VL-DES-02",
      "VL-DES-03",
      "VL-DES-04",
      "VL-DES-05",
      "VL-DES-07",
    ],
    V3: [
      "VL-DES-01",
      "VL-DES-02",
      "VL-DES-03",
      "VL-DES-04",
      "VL-DES-05",
      "VL-DES-07",
    ],
    V4: findingIds,
    Shared: [
      "VL-DES-01",
      "VL-DES-02",
      "VL-DES-03",
      "VL-DES-04",
      "VL-DES-05",
      "VL-DES-07",
    ],
    Final: findingIds,
  };
  for (const [phase, findings] of Object.entries(requiredByPhase))
    for (const finding of findings)
      if (
        !matrix.cases.some(
          (item) => item.phase === phase && item.findings.includes(finding),
        )
      )
        throw new Error(`${phase}: missing ${finding} coverage`);
  return matrix;
}

const textScaleMethods = new Set([
  "synthetic-root-text",
  "synthetic-computed-text",
  "browser-zoom",
  "os-text",
]);
function assertRecordBinding(item: ReflowCase, record: ReflowEvidenceRecord) {
  const variant = item.variants.find(({ id }) => id === record.variantId);
  if (!variant)
    throw new Error(`${item.id}: undeclared variant ${record.variantId}`);
  if (!routeMatches(variant.route, record.route))
    throw new Error(`${item.id}/${variant.id}: wrong route ${record.route}`);
  if (!record.state.includes(variant.state))
    throw new Error(
      `${item.id}/${variant.id}: required state was not evidenced`,
    );
  if (item.surfaceRequirement.kind === "dom") {
    if (
      record.surface.kind !== "dom" ||
      record.surface.selector !== item.surfaceRequirement.selector
    )
      throw new Error(`${item.id}/${variant.id}: wrong surface`);
  } else if (
    record.surface.kind !== "static" ||
    record.surface.artifact !== item.surfaceRequirement.artifact
  )
    throw new Error(`${item.id}/${variant.id}: wrong static artifact`);
  for (const tag of record.coverage.filter((value) =>
    /^factor-(100|150|200)$/.test(value),
  )) {
    const factor = Number(tag.slice(7)) / 100;
    if (
      !textScaleMethods.has(record.method) ||
      Math.abs(record.requestedFactor - factor) > 0.02 ||
      record.achieved.some(
        ({ factor: actual }) => Math.abs(actual - factor) > 0.05,
      )
    )
      throw new Error(
        `${item.id}/${variant.id}: ${tag} was not achieved by a text-enlargement method`,
      );
  }
  for (const tag of record.coverage.filter((value) =>
    /^viewport-\d+$/.test(value),
  ))
    if (record.browser.viewport.width !== Number(tag.slice(9)))
      throw new Error(`${item.id}/${variant.id}: ${tag} viewport mismatch`);
}

export function validateExecutionSubset(
  value: unknown,
  evidence: unknown,
  expectedSha: string,
  requiredCaseIds: string[],
) {
  const matrix = validateDesignCoverage(value);
  assertReflowEvidenceManifest(evidence, expectedSha);
  const validated = evidence as ReflowEvidenceManifest;
  const requested = new Set(requiredCaseIds);
  const cases = matrix.cases.filter(({ id }) => requested.has(id));
  if (cases.length !== requested.size)
    throw new Error("executed subset includes unknown case IDs");
  const byCase = new Map<string, ReflowEvidenceRecord[]>();
  for (const record of validated.records) {
    const item = cases.find(({ id }) => id === record.caseId);
    if (!item) continue;
    assertRecordBinding(item, record);
    if (record.reviewerDecision !== "PASS")
      throw new Error(
        `${record.caseId}: executed subset evidence is not accepted`,
      );
    byCase.set(item.id, [...(byCase.get(item.id) ?? []), record]);
  }
  for (const item of cases) {
    const records = byCase.get(item.id) ?? [];
    for (const variant of item.variants)
      if (!records.some((record) => record.variantId === variant.id))
        throw new Error(`${item.id}: missing required variant ${variant.id}`);
    for (const binding of item.bindings ?? [])
      if (
        !records.some(
          (record) =>
            record.variantId === binding.variantId &&
            binding.requires.every((tag) => record.coverage.includes(tag)),
        )
      )
        throw new Error(`${item.id}: missing bound observation ${binding.id}`);
    const covered = new Set(records.flatMap(({ coverage }) => coverage));
    for (const requirement of item.method)
      if (!covered.has(requirement))
        throw new Error(
          `${item.id}: missing evidence requirement ${requirement}`,
        );
    for (const method of item.method.filter((value) =>
      [
        "viewport-reflow",
        "synthetic-root-text",
        "synthetic-computed-text",
        "text-spacing",
        "browser-zoom",
        "cdp-pinch",
        "os-text",
        "physical-device",
      ].includes(value),
    ))
      if (
        !records.some(
          (record) =>
            record.method === method && record.coverage.includes(method),
        )
      )
        throw new Error(
          `${item.id}: required method ${method} was not executed`,
        );
    for (const variant of [
      "line-height",
      "paragraph",
      "letter",
      "word",
    ] as const) {
      const tag = `spacing-${variant}`;
      if (
        item.method.includes(tag) &&
        !records.some(
          (record) =>
            record.coverage.includes(tag) &&
            record.method === "text-spacing" &&
            record.spacing?.override === variant,
        )
      )
        throw new Error(`${item.id}: ${tag} was not evidenced`);
    }
    if (
      item.method.includes("independent-review") &&
      !records.some(({ review }) => review.kind === "independent")
    )
      throw new Error(`${item.id}: independent review evidence is missing`);
  }
  return matrix;
}

export function validateFinalExecution(
  value: unknown,
  evidence: unknown,
  expectedSha: string,
) {
  const matrix = validateDesignCoverage(value);
  const required = matrix.cases.filter(
    (item) => item.requiredForFinal && item.phase !== "Production",
  );
  const incomplete = required.filter((item) => item.status !== "VERIFIED");
  if (incomplete.length)
    throw new Error(
      `final execution incomplete: ${incomplete.map(({ id, status }) => `${id}=${status}`).join(", ")}`,
    );
  if (!/^[0-9a-f]{40}$/.test(expectedSha))
    throw new Error("final evidence requires an exact 40-character SHA");
  return validateExecutionSubset(
    matrix,
    evidence,
    expectedSha,
    required.map(({ id }) => id),
  );
}
