export const evidenceManifestVersion = "gameai-rendered-evidence/v1" as const;

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
