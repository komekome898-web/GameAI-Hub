import { z } from 'zod';

export const productionStageIds = ['concept','prototype','code','visuals','animation','3d','voice','music-sfx','npc-dialogue','integration','testing','publishing'] as const;
export const ProductionStageIdSchema = z.enum(productionStageIds);
export type ProductionStageId = z.infer<typeof ProductionStageIdSchema>;

export const ProjectInputSchema = z.object({
  gameType: z.enum(['2d','3d','browser','mobile','other']),
  genre: z.enum(['rpg','monster-collection','visual-novel','horror','action','puzzle','other']),
  platform: z.enum(['web','mobile','desktop','multi-platform']),
  engine: z.enum(['unity','unreal','godot','other','undecided']).default('undecided'),
  budget: z.enum(['free','low','flexible']),
  experience: z.enum(['beginner','intermediate','advanced']),
  codingPreference: z.enum(['no-code','assisted','code-first']),
  assetRequirements: z.array(z.enum(['concept-art','2d-assets','3d-assets','animation'])).max(4).default([]),
  voiceRequirement: z.enum(['none','optional','required']).default('none'),
  musicRequirement: z.enum(['none','optional','required']).default('none'),
  commercialIntent: z.enum(['personal','commercial','undecided']).default('undecided'),
  integrationImportance: z.enum(['low','medium','high']).default('low'),
});
export type ProjectInput = z.infer<typeof ProjectInputSchema>;

export const defaultProjectInput: ProjectInput = {
  gameType: '2d', genre: 'other', platform: 'desktop', engine: 'undecided', budget: 'low', experience: 'beginner',
  codingPreference: 'assisted', assetRequirements: [], voiceRequirement: 'none',
  musicRequirement: 'none', commercialIntent: 'undecided', integrationImportance: 'low',
};

export const StageDefinitionSchema = z.object({
  id: ProductionStageIdSchema,
  label: z.string().min(1),
  objective: z.string().min(1),
});

export const productionStages = z.array(StageDefinitionSchema).length(productionStageIds.length).parse([
  { id:'concept', label:'企画', objective:'ゲームの核と完成条件を決める' },
  { id:'prototype', label:'プロトタイプ', objective:'最小の遊べる形で成立性を確かめる' },
  { id:'code', label:'コード', objective:'ゲームロジックと操作を実装する' },
  { id:'visuals', label:'ビジュアル', objective:'必要な画面・キャラクター・背景を用意する' },
  { id:'animation', label:'アニメーション', objective:'必要な動きと遷移を実装・検品する' },
  { id:'3d', label:'3D', objective:'モデルやテクスチャを作りゲーム向けに調整する' },
  { id:'voice', label:'音声', objective:'台詞やナレーションを作り権利を確認する' },
  { id:'music-sfx', label:'音楽・効果音', objective:'BGMや効果音を用意し利用条件を確認する' },
  { id:'npc-dialogue', label:'NPC・会話', objective:'会話体験と実行時の安全性を設計する' },
  { id:'integration', label:'統合', objective:'素材と機能をゲーム本体へ組み込む' },
  { id:'testing', label:'テスト', objective:'品質・費用・権利・実機動作を検証する' },
  { id:'publishing', label:'公開', objective:'配布先の要件と最終ライセンスを確認する' },
]);

export const StackToolSchema = z.object({
  stage: ProductionStageIdSchema,
  serviceSlug: z.string().regex(/^[a-z0-9-]+$/),
  reason: z.string().min(1),
  limitation: z.string().min(1),
  alternativeSlugs: z.array(z.string().regex(/^[a-z0-9-]+$/)),
  optional: z.boolean().default(false),
});

export const StackTemplateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  forWhom: z.array(z.string().min(1)).min(1),
  workflow: z.array(ProductionStageIdSchema).min(3),
  tools: z.array(StackToolSchema).min(1),
  limitations: z.array(z.string().min(1)).min(1),
  costVisibility: z.string().min(1),
  commercialCaveats: z.array(z.string().min(1)).min(1),
});
export type StackTemplate = z.infer<typeof StackTemplateSchema>;

const ProjectConditionSchema = z.object({
  field: z.enum(['gameType','genre','platform','engine','budget','experience','codingPreference','voiceRequirement','musicRequirement','commercialIntent','integrationImportance','assetRequirements']),
  operator: z.enum(['equals','includes','not-equals']),
  value: z.string().min(1),
});
export const RecommendationRuleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  stage: ProductionStageIdSchema,
  serviceSlug: z.string().regex(/^[a-z0-9-]+$/),
  conditions: z.array(ProjectConditionSchema),
  reasonTemplate: z.string().min(1),
  priority: z.number().int().min(0),
  optional: z.boolean().default(false),
});
export type RecommendationRule = z.infer<typeof RecommendationRuleSchema>;
