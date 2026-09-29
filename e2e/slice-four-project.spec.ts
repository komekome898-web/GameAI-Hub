import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "./fixtures";
import {
  acceptanceViewports,
  installAcceptanceNetworkGuard,
} from "./acceptance/fixtures";
import { diagnoseWidths } from "./acceptance/diagnostics";
import {
  evidenceManifestVersion,
  type EvidenceRecord,
} from "./acceptance/manifest";

const longIdea =
  "日本語と英語を切り替えられる短いノベルゲーム。ブラウザで遊べて、選択肢によって灯台の明かりと島の住人の反応が変わる。初心者が一人で無料から作り、入力した世界観と仕組みは変えない。";

const interpretedBrief = {
  interpretation: {
    idea: longIdea,
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
    detailCandidates: [],
    unresolved: [],
    conflicts: [],
  },
  status: {
    providerName: "ローカル判定",
    mode: "deterministic",
    fallbackReason: "not_configured",
  },
  confirmationRequired: [],
};

test("Slice 4 empty and clarification states reflow at every acceptance viewport", async ({
  page,
  context,
}) => {
  test.setTimeout(120_000);
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  const evidenceDir = path.join("docs", "screenshots", "issue-137-slice4");
  await mkdir(evidenceDir, { recursive: true });
  const records: EvidenceRecord[] = [];

  for (const viewport of acceptanceViewports) {
    await page.setViewportSize(viewport);
    await page.goto("/project");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      history.replaceState(null, "", "/project");
    });
    await page.reload();
    await expect(page.getByText("ステップ 1 / 3 · アイデア")).toBeVisible();
    const ideaField = page.getByLabel(/どんなゲームを作りたいですか？/);
    await expect(ideaField).toBeVisible();
    expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);

    await page.route("**/api/project/interpret", (route) => route.abort());
    await ideaField.fill(longIdea);
    await page.getByRole("button", { name: "制作ロードマップを作る" }).click();
    await expect(page.getByText("ステップ 2 / 3 · 条件を確認")).toBeVisible();
    await expect(page.getByText(longIdea, { exact: true })).toBeVisible();
    const widths = await diagnoseWidths(page);
    expect(widths.documentOverflowPx).toBe(0);
    expect(widths.unownedOverflowingElements).toEqual([]);

    const screenshot = `clarification-${viewport.id}.png`;
    await page.screenshot({
      path: path.join(evidenceDir, screenshot),
      fullPage: true,
    });
    records.push({
      id: `project-clarification-${viewport.id}`,
      route: "/project/",
      viewport,
      zoom: { mode: "none", factor: 1 },
      emulation: { viewport: true, physicalDevice: false },
      state: ["clarification", "long-japanese-input", "ga4-collector-blocked"],
      screenshot,
      diagnostics: {
        documentOverflowPx: widths.documentOverflowPx,
        ownedLocalScrollers: widths.ownedLocalScrollers.length,
        unownedOverflowingElements: widths.unownedOverflowingElements.length,
      },
      provenance: {
        capturedAt: new Date().toISOString(),
        runner: "Playwright Chromium viewport emulation",
        note: "Responsive evidence only; not physical-device or soft-keyboard evidence.",
      },
    });
    await page.unroute("**/api/project/interpret");
  }

  expect(collectorAttempts).toEqual([]);
  await writeFile(
    path.join(evidenceDir, "manifest.json"),
    `${JSON.stringify(
      {
        schema: evidenceManifestVersion,
        target: {
          sha: process.env.EVIDENCE_SHA ?? "0000000",
          environment: "local",
          baseUrl: "http://127.0.0.1:3100",
        },
        records,
      },
      null,
      2,
    )}\n`,
  );
});

test("validation preserves input and gives a focused recovery target", async ({ page }) => {
  await page.goto("/project");
  await page.route("**/api/project/interpret", (route) => route.abort());
  await page.getByLabel(/どんなゲームを作りたいですか？/).fill(longIdea);
  await page.getByRole("button", { name: "制作ロードマップを作る" }).click();
  const details = page.locator(".beginner-confirm-details");
  if (!(await details.evaluate((node) => (node as HTMLDetailsElement).open)))
    await details.locator(":scope > summary").click();
  await page.getByRole("button", { name: "Project Planを作る" }).click();
  await expect(page.locator("#clarify-error")).toContainText(
    "入力済みの内容は消えていません",
  );
  await expect(page.getByText(longIdea, { exact: true })).toBeVisible();
  await expect(page.locator("select:focus").first()).toBeVisible();
});

test("generated current task, recovery, completion, and local restore stay task-first", async ({
  page,
  context,
}) => {
  test.setTimeout(120_000);
  const collectorAttempts = await installAcceptanceNetworkGuard(context);
  await page.route("**/api/project/interpret", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(interpretedBrief),
    }),
  );
  await page.goto("/project");
  await page.getByLabel(/どんなゲームを作りたいですか？/).fill(longIdea);
  await page.getByRole("button", { name: "制作ロードマップを作る" }).click();
  const details = page.locator(".beginner-confirm-details");
  if (!(await details.evaluate((node) => (node as HTMLDetailsElement).open)))
    await details.locator(":scope > summary").click();
  await page.getByRole("button", { name: "Project Planを作る" }).click();
  await expect(page.getByText("ステップ 3 / 3 · 制作を進める")).toBeVisible();
  await expect(page.getByRole("heading", { name: /今はこれだけ/ })).toBeVisible();
  await expect(page.locator(".project-supporting-details")).not.toHaveAttribute("open", "");

  const evidenceDir = path.join("docs", "screenshots", "issue-137-slice4");
  for (const viewport of acceptanceViewports) {
    await page.setViewportSize(viewport);
    expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
    await page.screenshot({
      path: path.join(evidenceDir, `current-task-${viewport.id}.png`),
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "ここで詰まった" }).click();
  await expect(page.getByRole("heading", { name: "AIへ渡すトラブル相談" })).toBeVisible();
  await page.getByLabel("困っていること・表示されたエラー").fill(
    "VeryLongRuntimeErrorTokenWithoutBreaks_".repeat(15),
  );
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  await page.screenshot({
    path: path.join(evidenceDir, "recovery-mobile-390.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "完了条件を確認して「できた」へ" }).click();
  const current = page.locator(".action-step.is-current");
  for (const checkbox of await current.locator(".done-criteria input").all())
    await checkbox.check();
  await current.locator(".completion-control input").check();
  await expect(page.locator(".build-progress span")).toContainText(/1 \/ \d+ 完了/);
  await page.reload();
  await expect(page.locator(".build-progress span")).toContainText(/1 \/ \d+ 完了/);
  await expect(page.getByText(longIdea, { exact: true })).toHaveCount(0);
  expect(collectorAttempts).toEqual([]);
});
