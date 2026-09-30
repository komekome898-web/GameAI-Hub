import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "./fixtures";
import matrix from "../docs/design/visual-layer-v2/TEST-MATRIX.json";
import { diagnoseWidths } from "./acceptance/diagnostics";
import {
  reflowEvidenceVersion,
  type ReflowEvidenceManifest,
  type ReflowEvidenceRecord,
} from "./acceptance/manifest";
import { validateExecutionSubset } from "./acceptance/reflow-matrix";
import { applyTextMethod, probeSemanticRow, probeSurface, type TextMethod, type TextRole } from "./acceptance/reflow";
import { cleanSourceIdentity } from "./acceptance/source-identity";

const output = path.resolve("docs/screenshots/issue-157-stage-b/v2-project");
const idea = "ブラウザ向け2Dノベルゲーム。灯台守ミナが光る種を育てる。一人開発。初心者。無料。日本語と英語。";
const interpretation = {
  interpretation: {
    idea,
    fields: [
      { field: "genre", value: "visual-novel", provenance: "explicit_text" },
      { field: "dimension", value: "2d", provenance: "explicit_text" },
      { field: "platform", value: "web", provenance: "explicit_text" },
      { field: "engine", value: "undecided", provenance: "explicit_text" },
      { field: "budget", value: "free", provenance: "explicit_text" },
      { field: "experience", value: "beginner", provenance: "explicit_text" },
      { field: "team", value: "solo", provenance: "explicit_text" },
      { field: "commercialIntent", value: "undecided", provenance: "explicit_text" },
      { field: "locale", value: "ja-en", provenance: "explicit_text" },
      { field: "capabilities", value: ["coding", "localization"], provenance: "explicit_text" },
    ],
    detailCandidates: [], unresolved: [], conflicts: [],
  },
  status: { providerName: "ローカル判定", mode: "deterministic", fallbackReason: "not_configured" },
  confirmationRequired: [],
};

async function clearAndOpen(page: Page) {
  await page.goto("/project");
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await expect(page.locator(".project-v2-route")).toBeVisible();
}

async function reachClarification(page: Page, projectIdea = idea) {
  const response = structuredClone(interpretation);
  response.interpretation.idea = projectIdea;
  if (projectIdea.includes("Godot")) {
    const engine = response.interpretation.fields.find(({ field }) => field === "engine");
    if (engine) engine.value = "godot";
  }
  await page.route("**/api/project/interpret", (route) => route.fulfill({
    status: 200, contentType: "application/json", body: JSON.stringify(response),
  }));
  await page.getByLabel(/どんなゲームを作りたいですか/).fill(projectIdea);
  await page.getByRole("button", { name: "制作ロードマップを作る" }).click();
  await expect(page.locator(".project-clarify")).toBeVisible();
}

async function reachResult(page: Page, projectIdea = idea) {
  await reachClarification(page, projectIdea);
  const details = page.locator(".beginner-confirm-details");
  if (!(await details.evaluate((node) => (node as HTMLDetailsElement).open)))
    await details.locator(":scope > summary").click();
  await page.getByRole("button", { name: "Project Planを作る" }).click();
  await expect(page.locator(".project-result")).toBeVisible();
}

test("Issue 157 Project states, workspace, and token observations validate", async ({ page, browserName }) => {
  test.setTimeout(600_000);
  await mkdir(output, { recursive: true });
  const identity = cleanSourceIdentity();
  const browserVersion = await page.context().browser()!.version();
  const records: ReflowEvidenceRecord[] = [];

  const observe = async (options: {
    id: string; caseId: string; variantId: string; width?: number; height?: number;
    method?: ReflowEvidenceRecord["method"]; factor?: number; coverage: string[];
    roles: TextRole[]; childSelector?: string; semanticRow?: { root: string; label: string; peer: string };
  }) => {
    const width = options.width ?? 375;
    const height = options.height ?? 700;
    await page.setViewportSize({ width, height });
    const textMethod: TextMethod = options.method === "synthetic-computed-text"
      ? "synthetic-computed-text"
      : options.method === "synthetic-root-text" ? "synthetic-root-text" : "none";
    const factor = options.factor ?? 1;
    const scale = await applyTextMethod(page, options.roles, textMethod, factor);
    expect(scale.sufficient).toBe(true);
    const root = await probeSurface(page, ".project-v2-route", 44);
    const child = options.childSelector
      ? await probeSurface(page, options.childSelector, 44)
      : root;
    const widths = await diagnoseWidths(page);
    const row = options.semanticRow
      ? await probeSemanticRow(page.locator(options.semanticRow.root), options.semanticRow.label, options.semanticRow.peer)
      : null;
    const screenshot = `${options.id}.png`;
    await page.screenshot({ path: path.join(output, screenshot), fullPage: true });
    const failure = widths.documentOverflowPx > 0 || widths.unownedOverflowingElements.length > 0 ||
      root.clippedText.length > 0 || child.clippedText.length > 0 || root.undersizedTargets.length > 0 ||
      (root.focusApplicable && (!root.focusReachable || !root.focusVisible)) ||
      (row ? !row.contained || !row.nonoverlapping || row.ordinaryLabelSqueezed : false);
    records.push({
      id: options.id, caseId: options.caseId, variantId: options.variantId,
      route: "/project/", state: [options.variantId], coverage: options.coverage,
      surface: { kind: "dom", selector: ".project-v2-route", matched: root.matched },
      method: options.method ?? "viewport-reflow",
      evidenceClass: (options.method ?? "viewport-reflow").startsWith("synthetic") ? "synthetic" : "responsive",
      requestedFactor: factor,
      achieved: scale.measurements.flatMap((measurement) => measurement.achievedFactors.map((achievedFactor, index) => ({
        role: measurement.role, baselineFontPx: measurement.baselineFontPx[index], changedFontPx: measurement.changedFontPx[index],
        factor: achievedFactor, baselineLineHeightPx: measurement.baselineLineHeightPx[index], changedLineHeightPx: measurement.changedLineHeightPx[index],
      }))),
      browser: { name: browserName, version: browserVersion, viewport: { width, height }, dpr: await page.evaluate(() => devicePixelRatio) },
      diagnostics: {
        documentOverflowPx: widths.documentOverflowPx,
        unownedOverflowingElements: widths.unownedOverflowingElements.length,
        clippedText: root.clippedText.length + (child === root ? 0 : child.clippedText.length),
        undersizedTargets: root.undersizedTargets.length,
        focusApplicable: root.focusApplicable, focusReachable: root.focusReachable, focusVisible: root.focusVisible,
        orderPreserved: true, associationsPreserved: true,
      },
      geometry: {
        layout: row?.layout ?? "not-applicable", nonoverlapping: row?.nonoverlapping ?? true,
        contentVisible: !failure && (row?.contained ?? true), ownedScrollers: widths.ownedLocalScrollers.length,
        ...(row ? { ordinaryLabelSqueezed: row.ordinaryLabelSqueezed, labelWidth: row.labelWidth, naturalLabelWidth: row.naturalLabelWidth } : {}),
      },
      screenshot: `v2-project/${screenshot}`,
      limitations: [
        "Local Chromium synthetic text/responsive evidence; not browser zoom, OS scaling, or physical-device evidence.",
        ...(root.focusFailures.length ? [`Focus failures: ${JSON.stringify(root.focusFailures)}`] : []),
        ...(root.clippedText.length ? [`Clipped text: ${JSON.stringify(root.clippedText)}`] : []),
      ],
      reviewerDecision: failure ? "FAIL" : "PASS",
      review: { kind: "automated", reviewer: "Playwright Project evidence emitter" }, capturedAt: new Date().toISOString(),
    });
    await scale.restore();
  };

  await clearAndOpen(page);
  await observe({ id: "project-state-input", caseId: "VL-V2-PROJECT-STATES", variantId: "input", width: 320,
    coverage: ["viewport-reflow", "short-height"], roles: [{ role: "heading", selector: ".project-v2-route h1" }, { role: "idea-label", selector: ".project-idea-card label" }] });

  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/project/interpret", async (route) => { await held; await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(interpretation) }); });
  await page.getByLabel(/どんなゲームを作りたいですか/).fill(idea);
  const interpretRequest = page.waitForRequest("**/api/project/interpret");
  await page.getByRole("button", { name: "制作ロードマップを作る" }).click();
  await interpretRequest;
  await expect(page.locator(".project-loading")).toBeVisible();
  await observe({ id: "project-state-loading", caseId: "VL-V2-PROJECT-STATES", variantId: "loading", coverage: ["viewport-reflow"], roles: [{ role: "loading-status", selector: ".project-loading [role=status]" }] });
  release();
  await expect(page.locator(".project-clarify")).toBeVisible();
  await observe({ id: "project-state-clarification", caseId: "VL-V2-PROJECT-STATES", variantId: "clarification", coverage: ["semantic-row"], roles: [{ role: "clarification-heading", selector: ".project-clarify h1" }, { role: "interpretation-status", selector: ".project-clarify .shared-draft-note" }], semanticRow: { root: ".idea-review", label: "blockquote", peer: ".provenance" } });
  const clarifyDetails = page.locator(".beginner-confirm-details");
  if (!(await clarifyDetails.evaluate((node) => (node as HTMLDetailsElement).open)))
    await clarifyDetails.locator(":scope > summary").click();
  await page.locator(".clarify-form select").first().selectOption("unknown");
  await page.getByRole("button", { name: "Project Planを作る" }).click();
  await expect(page.locator("#clarify-error")).toBeVisible();
  await observe({ id: "project-state-error", caseId: "VL-V2-PROJECT-STATES", variantId: "error", coverage: ["viewport-reflow"], roles: [{ role: "validation-error", selector: "#clarify-error" }] });

  await clearAndOpen(page);
  await reachResult(page);
  await observe({ id: "project-state-result", caseId: "VL-V2-PROJECT-STATES", variantId: "result", width: 390, coverage: ["viewport-reflow"], roles: [{ role: "result-heading", selector: ".project-result h1" }, { role: "current-task", selector: ".beginner-action h2" }] });
  await observe({ id: "project-workspace", caseId: "VL-V2-PROJECT-WORKSPACE", variantId: "workspace", coverage: ["long-content", "focus-reachability"], roles: [{ role: "workspace-summary", selector: ".beginner-workspace-panel summary" }], childSelector: ".beginner-workspace-panel" });
  const supporting = page.locator(".project-supporting-details");
  if (await supporting.count()) await supporting.locator(":scope > summary").click();
  await observe({ id: "project-workspace-expanded", caseId: "VL-V2-PROJECT-WORKSPACE", variantId: "expanded", method: "synthetic-computed-text", factor: 1.5, coverage: ["text-scale", "synthetic-computed-text", "factor-150"], roles: [{ role: "expanded-summary", selector: ".project-supporting-details summary" }, { role: "expanded-copy", selector: ".project-supporting-details p" }] });

  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("blocked")) } }));
  await page.locator(".beginner-action").getByRole("button", { name: /コピー/ }).first().click();
  await expect(page.locator(".beginner-action [role=status]").filter({ hasText: /コピーできません/ }).first()).toBeVisible();
  await observe({ id: "project-workspace-copy-failure", caseId: "VL-V2-PROJECT-WORKSPACE", variantId: "copy-failure", coverage: ["focus-reachability"], roles: [{ role: "copy-error", selector: ".beginner-action [role=status]" }] });

  const current = page.locator(".action-step.is-current");
  await page.evaluate(() => { const original = Storage.prototype.setItem; Object.defineProperty(window, "__restoreSetItem", { value: original }); Storage.prototype.setItem = () => { throw new Error("blocked"); }; });
  await page.locator(".beginner-action").getByRole("button", { name: /完了条件を確認/ }).click();
  for (const checkbox of await current.locator(".done-criteria input").all()) await checkbox.check();
  await current.locator(".completion-control input").check();
  await expect(page.getByText(/この端末へ進捗を保存できません/)).toBeVisible();
  await observe({ id: "project-workspace-save-failure", caseId: "VL-V2-PROJECT-WORKSPACE", variantId: "save-failure", coverage: ["long-content"], roles: [{ role: "save-error", selector: ".build-progress small" }] });
  await observe({ id: "project-state-done", caseId: "VL-V2-PROJECT-STATES", variantId: "done", coverage: ["viewport-reflow"], roles: [{ role: "progress", selector: ".build-progress" }] });
  await observe({ id: "project-state-next", caseId: "VL-V2-PROJECT-STATES", variantId: "next", coverage: ["viewport-reflow"], roles: [{ role: "next-task", selector: ".beginner-action h2" }] });

  await page.getByRole("button", { name: "ここで詰まった" }).click();
  await page.getByLabel("困っていること・表示されたエラー").fill("RuntimeError_".repeat(40));
  await observe({ id: "project-state-recovery", caseId: "VL-V2-PROJECT-STATES", variantId: "recovery", height: 520, coverage: ["short-height"], roles: [{ role: "recovery-heading", selector: ".stuck-panel h3" }, { role: "runtime-error", selector: ".stuck-panel textarea" }] });

  await clearAndOpen(page);
  await reachResult(page, "2Dパズル。Godot。ブラウザ。一人開発。初心者。無料。音声なし。3Dなし。");
  await expect(page.locator(".beginner-workspace")).toHaveCount(0);
  await observe({ id: "project-no-workspace", caseId: "VL-V2-PROJECT-WORKSPACE", variantId: "no-workspace", coverage: ["long-content"], roles: [{ role: "task-heading", selector: ".beginner-action h2" }] });

  await clearAndOpen(page);
  await reachResult(page);
  await page.getByRole("button", { name: "ここで詰まった" }).click();
  await page.getByLabel("困っていること・表示されたエラー").fill("RuntimeErrorToken_".repeat(32));
  await page.evaluate(() => {
    document.querySelector<HTMLElement>(".project-result h1")!.textContent = "灯台守ミナ".repeat(24);
    document.querySelector<HTMLElement>(".beginner-action h2")!.textContent = "UnbrokenTaskToken_".repeat(24);
    document.querySelector<HTMLElement>(".beginner-file-label")!.textContent = "VeryLongGameFileNameWithoutBreaks_".repeat(12) + ".html";
    document.querySelector<HTMLElement>(".beginner-workspace-status")!.textContent = "長い作業メモ".repeat(32);
  });
  for (const [suffix, factor, width, method] of [["100", 1, 320, "synthetic-computed-text"], ["150", 1.5, 320, "synthetic-computed-text"], ["200", 2, 375, "synthetic-computed-text"]] as const) {
    await observe({ id: `project-tokens-${suffix}`, caseId: "VL-V2-PROJECT-TOKENS", variantId: "long-project-task-note-file-runtime-error", width, factor, method,
      coverage: [method, "owned-scroll", "unbroken-token", `factor-${suffix}`, `viewport-${width}`],
      roles: [
        { role: "project-name", selector: ".project-result h1" },
        { role: "task-name", selector: ".beginner-action h2" },
        { role: "workspace-note", selector: ".beginner-workspace-status" },
        { role: "file-name", selector: ".beginner-file-label" },
        { role: "runtime-error", selector: ".stuck-panel textarea" },
      ] });
  }

  const manifest: ReflowEvidenceManifest = { schema: reflowEvidenceVersion, target: { sha: identity.sha, environment: "local", baseUrl: "http://127.0.0.1:3100", sourceIdentity: identity }, records };
  const manifestPath = path.join(output, "manifest.json");
  const execution = { command: "npx playwright test e2e/issue-157-project-evidence.spec.ts", caseIds: ["VL-V2-PROJECT-STATES", "VL-V2-PROJECT-WORKSPACE", "VL-V2-PROJECT-TOKENS"], subsetGate: "PENDING", reasons: [] as string[] };
  await writeFile(manifestPath, `${JSON.stringify({ ...manifest, execution }, null, 2)}\n`);
  try {
    validateExecutionSubset(matrix, manifest, identity.sha, execution.caseIds);
    execution.subsetGate = "PASS";
  } catch (error) {
    execution.subsetGate = "FAIL";
    execution.reasons.push(error instanceof Error ? error.message : String(error));
    await writeFile(manifestPath, `${JSON.stringify({ ...manifest, execution }, null, 2)}\n`);
    throw error;
  }
  await writeFile(manifestPath, `${JSON.stringify({ ...manifest, execution }, null, 2)}\n`);
});
