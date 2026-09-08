import type { BuildChecklistStep, PlanTool } from "./types";

export type ContextualProjectTool = {
  tool: PlanTool;
  artifact: string;
  preparation: string;
  reason: string;
  returnInstruction: string;
  alternative: string;
};

const contextualRules = {
  voice: {
    serviceSlug: "elevenlabs",
    artifact: "台詞ID付きの代表音声3件（WAVまたはMP3など、公式対応形式を確認）",
    preparation: "短い台詞、読み方、感情、話者の同意を準備します。",
    reason:
      "このQuestでは、ゲーム内で再生して発音と音量を検品できる音声ファイルが必要なためです。",
    returnInstruction:
      "生成した音声ファイルを台詞IDが分かる名前で保存し、このProjectへ戻ってゲームへの組み込みと完了条件の確認を続けます。",
    alternative:
      "外部ツールを使わない場合は、自分で代表台詞を録音するか、同じ長さの仮音声で組み込みを先に検証できます。",
  },
  "assets-3d": {
    serviceSlug: "meshy",
    artifact:
      "対象エンジンへ取り込める代表3Dモデル1点（対応形式は公式情報で確認）",
    preparation:
      "用途、見た目、スケール、UV・rig・collisionの要否を準備します。",
    reason:
      "このQuestでは、対象環境へimportしてスケール・材質・性能を検品できる3Dモデルが必要なためです。",
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
