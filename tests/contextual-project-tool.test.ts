import { describe, expect, it } from "vitest";
import {
  buildChecklist,
  buildContextualGenerationPrompt,
  contextualProjectTool,
  generateProjectPlan,
  type ProjectBrief,
} from "@/lib/project";

const brief = (patch: Partial<ProjectBrief> = {}): ProjectBrief => ({
  idea: "テスト用のゲーム",
  genre: "action",
  dimension: "2d",
  platform: "desktop",
  engine: "unity",
  budget: "low",
  experience: "intermediate",
  team: "solo",
  commercialIntent: "personal",
  capabilities: ["coding"],
  locale: "ja",
  details: [],
  ...patch,
});

const recommendations = (value: ProjectBrief) =>
  buildChecklist(generateProjectPlan(value))
    .map((step) => ({ step, recommendation: contextualProjectTool(step) }))
    .filter((item) => item.recommendation);

describe("contextual Project tools", () => {
  it("offers ElevenLabs only on the explicit voice task", () => {
    const found = recommendations(brief({ capabilities: ["coding", "voice"] }));
    expect(found).toHaveLength(1);
    expect(found[0].step.id).toBe("voice");
    expect(found[0].recommendation?.tool.serviceSlug).toBe("elevenlabs");
    expect(found[0].recommendation?.alternative).toContain("自分で");
    expect(buildContextualGenerationPrompt(found[0].recommendation!, {})).toBeNull();
    expect(buildContextualGenerationPrompt(found[0].recommendation!, { dialogue: "明示した代表台詞" })).toBeNull();
    const voicePrompt = buildContextualGenerationPrompt(found[0].recommendation!, { dialogue: "明示した代表台詞", outputFormat: "wav" })!;
    expect(voicePrompt).toBe("明示した代表台詞");
    expect(voicePrompt).not.toMatch(/検品表|再生タイミングを確認/);
    expect(found[0].recommendation?.inspectionItems.join(" ")).toMatch(/発音.*音量.*再生タイミング/);
    expect(voicePrompt).not.toContain("ここから先は危険だ");
  });

  it("does not offer ElevenLabs without a voice capability", () => {
    expect(
      recommendations(brief()).some(
        ({ recommendation }) =>
          recommendation?.tool.serviceSlug === "elevenlabs",
      ),
    ).toBe(false);
  });

  it("offers Meshy only on the 3D asset task", () => {
    const found = recommendations(
      brief({
        dimension: "3d",
        capabilities: ["coding", "assets-3d"],
      }),
    );
    expect(found).toHaveLength(1);
    expect(found[0].step.id).toBe("assets-3d");
    expect(found[0].recommendation?.tool.serviceSlug).toBe("meshy");
    expect(found[0].recommendation?.alternative).toContain("仮モデル");
    expect(buildContextualGenerationPrompt(found[0].recommendation!, { subject: "明示した対象" })).toBeNull();
    const modelPrompt = buildContextualGenerationPrompt(found[0].recommendation!, { subject: "明示した対象", appearance: "明示した外観" })!;
    expect(modelPrompt).toMatch(/対象: 明示した対象.*外観description: 明示した外観/s);
    expect(modelPrompt).toContain("rigは動かすキャラクター等、本当に必要な場合だけ");
    expect(modelPrompt).not.toContain("collision");
    expect(found[0].recommendation?.inspectionItems.join(" ")).toMatch(/scale.*material.*collision.*performance/);
    expect(modelPrompt).not.toContain("古い木製の宝箱");
  });

  it("does not offer Meshy for a 2D-only Project", () => {
    expect(
      recommendations(brief({ capabilities: ["coding", "art-2d"] })),
    ).toEqual([]);
  });

  it("ignores affiliate-like metadata and requires an adoptable product-fit candidate", () => {
    const voice = buildChecklist(
      generateProjectPlan(brief({ capabilities: ["coding", "voice"] })),
    ).find((step) => step.id === "voice")!;
    const baseline = contextualProjectTool(voice)?.tool.serviceSlug;
    const changed = {
      ...voice,
      tools: voice.tools.map((tool) => ({
        ...tool,
        affiliateStatus: "inactive",
        commission: 999,
      })) as typeof voice.tools,
    };
    expect(contextualProjectTool(changed)?.tool.serviceSlug).toBe(baseline);
    expect(
      contextualProjectTool({
        ...voice,
        tools: voice.tools.map((tool) => ({
          ...tool,
          role: "review" as const,
        })),
      }),
    ).toBeNull();
  });
});
