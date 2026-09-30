export const evidenceManifestVersion = "gameai-rendered-evidence/v1" as const;
export const reflowEvidenceVersion = "gameai-reflow-evidence/v2" as const;

export type EvidenceRecord = {
  id: string;
  route: string;
  viewport: { width: number; height: number };
  zoom: { mode: "none" | "browser-emulation"; factor: number };
  emulation: { viewport: boolean; physicalDevice: boolean; userAgentProfile?: string };
  state: string[];
  screenshot: string;
  diagnostics: {
    documentOverflowPx: number;
    ownedLocalScrollers: number;
    unownedOverflowingElements: number;
  };
  provenance: { capturedAt: string; runner: string; note?: string };
};

export type EvidenceManifest = {
  schema: typeof evidenceManifestVersion;
  target: {
    sha: string;
    environment: "local" | "preview" | "production";
    baseUrl: string;
  };
  records: EvidenceRecord[];
};

export function assertEvidenceManifest(value: unknown): asserts value is EvidenceManifest {
  if (!value || typeof value !== "object") throw new Error("manifest must be an object");
  const manifest = value as Partial<EvidenceManifest>;
  if (manifest.schema !== evidenceManifestVersion) throw new Error("unsupported evidence schema");
  if (!manifest.target || !/^[0-9a-f]{7,40}$/.test(manifest.target.sha)) throw new Error("target.sha must be a Git SHA");
  if (!manifest.target.baseUrl || !["local", "preview", "production"].includes(manifest.target.environment ?? ""))
    throw new Error("target environment is incomplete");
  try { new URL(manifest.target.baseUrl); } catch { throw new Error("target.baseUrl must be an absolute URL"); }
  if (!Array.isArray(manifest.records) || manifest.records.length === 0) throw new Error("manifest needs evidence records");
  const ids = new Set<string>();
  for (const record of manifest.records) {
    if (!record.id || ids.has(record.id)) throw new Error("record ids must be non-empty and unique");
    ids.add(record.id);
    if (!record.route.startsWith("/")) throw new Error(`${record.id}: route must be root-relative`);
    if (!Number.isInteger(record.viewport.width) || !Number.isInteger(record.viewport.height) || record.viewport.width <= 0 || record.viewport.height <= 0) throw new Error(`${record.id}: invalid viewport`);
    if (!Number.isFinite(record.zoom.factor) || record.zoom.factor < 1) throw new Error(`${record.id}: invalid zoom factor`);
    if (!record.screenshot || !Array.isArray(record.state)) throw new Error(`${record.id}: missing state or screenshot`);
    if (record.emulation.physicalDevice && record.emulation.viewport)
      throw new Error(`${record.id}: viewport emulation cannot be physical-device evidence`);
    for (const value of Object.values(record.diagnostics))
      if (!Number.isFinite(value) || value < 0) throw new Error(`${record.id}: invalid diagnostics`);
    if (!record.provenance.runner || Number.isNaN(Date.parse(record.provenance.capturedAt))) throw new Error(`${record.id}: missing provenance`);
  }
}

export type ReflowEvidenceRecord = {
  id: string;
  caseId: string;
  route: string;
  state: string[];
  coverage: string[];
  surface: { selector: string; matched: number };
  method: "viewport-reflow" | "synthetic-root-text" | "synthetic-computed-text" | "text-spacing" | "browser-zoom" | "cdp-pinch" | "os-text" | "physical-device";
  evidenceClass: "responsive" | "synthetic" | "browser" | "os" | "physical";
  requestedFactor: number;
  achieved: Array<{ role: string; baselineFontPx: number; changedFontPx: number; factor: number }>;
  browser: { name: string; version: string; viewport: { width: number; height: number }; dpr: number };
  diagnostics: { documentOverflowPx: number; unownedOverflowingElements: number; clippedText: number; undersizedTargets: number; focusReachable: boolean; focusVisible: boolean; orderPreserved: boolean; associationsPreserved: boolean };
  geometry: { layout: "inline" | "stacked" | "not-applicable"; nonoverlapping: boolean; contentVisible: boolean; ownedScrollers: number };
  spacing?: { override: "line-height" | "paragraph" | "letter" | "word"; language: string; applicable: boolean };
  screenshot: string;
  limitations: string[];
  reviewerDecision: "PASS" | "FAIL" | "PENDING";
  review: { kind: "automated" | "independent"; reviewer: string };
};

export type ReflowEvidenceManifest = {
  schema: typeof reflowEvidenceVersion;
  target: { sha: string; environment: "local" | "preview" | "production"; baseUrl: string; worktreeDiffHash?: string };
  records: ReflowEvidenceRecord[];
};

export function assertReflowEvidenceManifest(value: unknown, expectedSha?: string): asserts value is ReflowEvidenceManifest {
  if (!value || typeof value !== "object") throw new Error("reflow manifest must be an object");
  const manifest = value as ReflowEvidenceManifest;
  if (manifest.schema !== reflowEvidenceVersion) throw new Error("unsupported reflow evidence schema");
  if (!/^[0-9a-f]{40}$/.test(manifest.target?.sha ?? "")) throw new Error("target.sha must be an exact Git SHA");
  if (!["local", "preview", "production"].includes(manifest.target.environment)) throw new Error("invalid target environment");
  try { new URL(manifest.target.baseUrl); } catch { throw new Error("target.baseUrl must be absolute"); }
  if (expectedSha && manifest.target.sha !== expectedSha) throw new Error("evidence SHA does not match target SHA");
  if (!Array.isArray(manifest.records) || manifest.records.length === 0) throw new Error("reflow manifest needs records");
  const methods = new Set(["viewport-reflow", "synthetic-root-text", "synthetic-computed-text", "text-spacing", "browser-zoom", "cdp-pinch", "os-text", "physical-device"]);
  const methodClasses: Record<string, string> = { "viewport-reflow": "responsive", "synthetic-root-text": "synthetic", "synthetic-computed-text": "synthetic", "text-spacing": "synthetic", "browser-zoom": "browser", "cdp-pinch": "browser", "os-text": "os", "physical-device": "physical" };
  const ids = new Set<string>();
  for (const record of manifest.records) {
    if (!record.id || ids.has(record.id)) throw new Error("record IDs must be non-empty and unique"); ids.add(record.id);
    if (!record.caseId || !record.route.startsWith("/") || !Array.isArray(record.state) || !record.state.length || record.state.some((item) => !item)
      || !Array.isArray(record.coverage) || !record.coverage.length || record.coverage.some((item) => !item)) throw new Error(`${record.id}: invalid case/route/state/coverage`);
    if (!record.surface?.selector || !Number.isInteger(record.surface.matched) || record.surface.matched <= 0) throw new Error(`${record.id}: missing or zero matched surface`);
    if (!methods.has(record.method) || record.evidenceClass !== methodClasses[record.method]) throw new Error(`${record.id}: method/evidence classification mismatch`);
    if (!["PASS", "FAIL", "PENDING"].includes(record.reviewerDecision)) throw new Error(`${record.id}: invalid reviewer decision`);
    if (!record.review?.reviewer || !["automated", "independent"].includes(record.review.kind)) throw new Error(`${record.id}: invalid review provenance`);
    if (!Number.isFinite(record.requestedFactor) || record.requestedFactor < 1 || !record.achieved.length || record.achieved.some(({ baselineFontPx, changedFontPx, factor }) =>
      ![baselineFontPx, changedFontPx, factor].every((number) => Number.isFinite(number) && number > 0) || Math.abs(changedFontPx / baselineFontPx - factor) > 0.02)) throw new Error(`${record.id}: invalid achieved text sizes`);
    if (!record.geometry || !["inline", "stacked", "not-applicable"].includes(record.geometry.layout)
      || typeof record.geometry.nonoverlapping !== "boolean" || typeof record.geometry.contentVisible !== "boolean"
      || !Number.isInteger(record.geometry.ownedScrollers) || record.geometry.ownedScrollers < 0) throw new Error(`${record.id}: invalid geometry`);
    if (record.method === "text-spacing" && (!record.spacing || !record.spacing.language || typeof record.spacing.applicable !== "boolean" || !["line-height", "paragraph", "letter", "word"].includes(record.spacing.override))) throw new Error(`${record.id}: spacing applicability is required`);
    if (!Array.isArray(record.limitations) || record.limitations.some((item) => typeof item !== "string")) throw new Error(`${record.id}: invalid limitations`);
    if ([record.diagnostics.focusReachable, record.diagnostics.focusVisible, record.diagnostics.orderPreserved, record.diagnostics.associationsPreserved].some((value) => typeof value !== "boolean")) throw new Error(`${record.id}: invalid focus/order diagnostic`);
    for (const value of [record.browser.viewport.width, record.browser.viewport.height, record.browser.dpr, record.diagnostics.documentOverflowPx, record.diagnostics.unownedOverflowingElements, record.diagnostics.clippedText, record.diagnostics.undersizedTargets])
      if (!Number.isFinite(value) || value < 0) throw new Error(`${record.id}: invalid browser/diagnostic number`);
    if (record.browser.viewport.width <= 0 || record.browser.viewport.height <= 0 || record.browser.dpr <= 0) throw new Error(`${record.id}: browser geometry must be positive`);
    if (record.reviewerDecision === "PASS" && (record.diagnostics.documentOverflowPx > 0 || record.diagnostics.unownedOverflowingElements > 0
      || record.diagnostics.clippedText > 0 || record.diagnostics.undersizedTargets > 0 || !record.diagnostics.focusReachable || !record.diagnostics.focusVisible
      || !record.diagnostics.orderPreserved || !record.diagnostics.associationsPreserved || !record.geometry.nonoverlapping || !record.geometry.contentVisible))
      throw new Error(`${record.id}: PASS contradicts diagnostics or geometry`);
    if (!record.screenshot || !record.browser.name || !record.browser.version) throw new Error(`${record.id}: incomplete capture provenance`);
  }
}
