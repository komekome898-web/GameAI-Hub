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
  if (!Array.isArray(manifest.records) || manifest.records.length === 0) throw new Error("manifest needs evidence records");
  for (const record of manifest.records) {
    if (!record.route.startsWith("/")) throw new Error(`${record.id}: route must be root-relative`);
    if (record.viewport.width <= 0 || record.viewport.height <= 0) throw new Error(`${record.id}: invalid viewport`);
    if (record.zoom.factor < 1) throw new Error(`${record.id}: invalid zoom factor`);
    if (record.emulation.physicalDevice && record.emulation.viewport)
      throw new Error(`${record.id}: viewport emulation cannot be physical-device evidence`);
    if (!record.provenance.capturedAt || !record.provenance.runner) throw new Error(`${record.id}: missing provenance`);
  }
}
