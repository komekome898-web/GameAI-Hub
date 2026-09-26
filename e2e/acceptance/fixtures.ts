import type { BrowserContext, Page, TestInfo } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { googleAnalyticsRequest } from "../fixtures";
import type { EvidenceManifest, EvidenceRecord } from "./manifest";

export const acceptanceViewports = [
  { id: "mobile-320", width: 320, height: 844 },
  { id: "mobile-375", width: 375, height: 844 },
  { id: "mobile-390", width: 390, height: 844 },
  { id: "desktop-1440", width: 1440, height: 900 },
] as const;

export const stressValues = Object.freeze({
  longJapaneseHeading:
    "初心者が長い日本語のゲーム企画を安全に最初のプレイ可能な一作業へ分解するための見出し",
  longGameIdea:
    "海面上昇後の東京で、記憶を失った灯台守が光る種を育てながら沈没図書館を探索する、ブラウザ向け一人用2D物語パズルゲーム。戦闘ではなく環境の観察と光の反射が中心。",
  unbrokenToken: `https://example.invalid/${"unbroken-token-".repeat(18)}`,
  secretSentinel: "GAMEAI_ACCEPTANCE_SECRET_MUST_NOT_LEAK",
  compareCandidateIds: ["github-copilot", "cursor", "elevenlabs", "meshy"],
});

export type StressState =
  | "long-japanese-heading"
  | "long-game-idea"
  | "unbroken-token-url"
  | "empty"
  | "error"
  | "expanded-disclosure-menu"
  | "table-code"
  | "compare-four-candidates";

export const stressContracts: ReadonlyArray<{
  id: StressState;
  requiredState: string;
  sensitive: boolean;
}> = Object.freeze([
  { id: "long-japanese-heading", requiredState: "自然な日本語改行を検査", sensitive: false },
  { id: "long-game-idea", requiredState: "入力、確認、handoffで原文を保持", sensitive: true },
  { id: "unbroken-token-url", requiredState: "文書幅ではなく所有scroller内に収容", sensitive: true },
  { id: "empty", requiredState: "次の操作を示す空状態", sensitive: false },
  { id: "error", requiredState: "復旧可能で長文errorも文書幅を拡張しない", sensitive: true },
  { id: "expanded-disclosure-menu", requiredState: "展開状態、focus、Escape、戻り先を検査", sensitive: false },
  { id: "table-code", requiredState: "table/codeが明示所有する局所scrollerを検査", sensitive: true },
  { id: "compare-four-candidates", requiredState: "最大4候補の選択、解除、比較を検査", sensitive: false },
]);

export async function installAcceptanceNetworkGuard(context: BrowserContext) {
  const collectorAttempts: string[] = [];
  await context.route(googleAnalyticsRequest, (route) => {
    collectorAttempts.push(route.request().url());
    return route.abort("blockedbyclient");
  });
  return collectorAttempts;
}

export async function captureEvidence(
  page: Page,
  testInfo: TestInfo,
  record: Omit<EvidenceRecord, "screenshot">,
): Promise<EvidenceRecord> {
  const screenshot = testInfo.outputPath(`${record.id}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  return { ...record, screenshot: path.basename(screenshot) };
}

export async function writeEvidenceManifest(
  testInfo: TestInfo,
  manifest: EvidenceManifest,
) {
  const output = testInfo.outputPath("evidence-manifest.json");
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return output;
}
