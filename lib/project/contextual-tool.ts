import type { BuildChecklistStep, PlanTool } from "./types";

export type ContextualProjectTool = {
  tool: PlanTool;
  artifact: string;
  preparation: string;
  reason: string;
  kind: "voice" | "model-3d";
  inspectionItems: readonly string[];
  returnInstruction: string;
  alternative: string;
};

const contextualRules = {
  voice: {
    kind: "voice",
    serviceSlug: "elevenlabs",
    artifact: "台詞ID付きの代表音声3件（WAVまたはMP3など、公式対応形式を確認）",
    preparation:
      "CTAを開く前に、実際に読み上げる代表台詞を1〜3本決め、読み方、感情、話者の同意を準備します。",
    reason:
      "このQuestでは、ゲーム内で再生して発音と音量を検品できる音声ファイルが必要なためです。",
    inspectionItems: [
      "ファイル名と台詞IDを対応させる",
      "ゲームへ組み込んで発音と音量を確認する",
      "意図した再生タイミングで再生されるか確認する",
    ],
    returnInstruction:
      "生成した音声ファイルを台詞IDが分かる名前で保存し、このProjectへ戻ってゲームへの組み込みと完了条件の確認を続けます。",
    alternative:
      "外部ツールを使わない場合は、自分で代表台詞を録音するか、同じ長さの仮音声で組み込みを先に検証できます。",
  },
  "assets-3d": {
    kind: "model-3d",
    serviceSlug: "meshy",
    artifact:
      "対象エンジンへ取り込める代表3Dモデル1点（対応形式は公式情報で確認）",
    preparation:
      "CTAを開く前に、生成対象を1つ選び、その用途と外観を短く決めます。UV・texture・rigは必要な場合だけ指定します。",
    reason:
      "このQuestでは、対象環境へimportしてスケール・材質・性能を検品できる3Dモデルが必要なためです。",
    inspectionItems: [
      "import後のscale、orientation、material、textureを確認する",
      "ゲーム側で必要なcollisionを設定して確認する",
      "対象端末でpolygon数と描画performanceを確認する",
    ],
    returnInstruction:
      "生成したモデルと利用条件の記録を保存し、このProjectへ戻ってimportと実機検品を続けます。",
    alternative:
      "外部ツールを使わない場合は、基本形状や手元の利用可能な仮モデルでimport・collision・性能を先に検証できます。",
  },
} as const;

/** Selects by task capability and an already product-fit, adoptable candidate only. */
export function contextualProjectTool(
  step: BuildChecklistStep,
): ContextualProjectTool | null {
  const rule = contextualRules[step.id as keyof typeof contextualRules];
  if (!rule) return null;
  const tool = step.tools.find(
    (candidate) =>
      candidate.serviceSlug === rule.serviceSlug &&
      (candidate.role === "primary" || candidate.role === "alternative"),
  );
  return tool ? { tool, ...rule } : null;
}

export type ContextualGenerationInput = {
  dialogue?: string;
  pronunciation?: string;
  emotion?: string;
  speaker?: string;
  outputFormat?: "wav" | "mp3";
  subject?: string;
  purpose?: string;
  appearance?: string;
  style?: string;
};

const clean = (value: string | undefined) => value?.trim().slice(0, 240) ?? "";

export function buildContextualGenerationPrompt(
  recommendation: ContextualProjectTool,
  input: ContextualGenerationInput,
): string | null {
  if (recommendation.kind === "voice") {
    const dialogue = clean(input.dialogue);
    if (!dialogue || !input.outputFormat) return null;
    return dialogue;
  }
  const subject = clean(input.subject);
  const appearance = clean(input.appearance);
  if (!subject || !appearance) return null;
  const optional = [
    clean(input.purpose) && `用途: ${clean(input.purpose)}`,
    clean(input.style) && `スタイル: ${clean(input.style)}`,
  ].filter(Boolean);
  return [
    `対象: ${subject}`,
    ...optional,
    `外観description: ${appearance}`,
    "必要条件:",
    "- game-readyで、対象エンジンが公式対応する形式でimportできること",
    "- 過剰なpolygon数を避けること",
    "- UV / textureは用途に必要な場合だけ含めること",
    "- rigは動かすキャラクター等、本当に必要な場合だけ含めること",
    "未指定の世界観や重要デザインは追加しないこと。",
  ].join("\n");
}
