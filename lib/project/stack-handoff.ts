import { getStackTemplate, getStackTemplatePreset } from '@/data/stack-templates';
import type { ProjectBrief } from './types';

export const stackConditionFields = ['genre', 'dimension', 'platform', 'engine', 'budget', 'experience', 'commercialIntent'] as const;
export type StackConditionField = typeof stackConditionFields[number];

/** Only equivalent scalar conditions cross the legacy Builder/Project boundary.
 * Asset requirements are not the same as a wish to use AI for that asset.
 * Keep the remaining settings visible as reference, not fabricated capabilities.
 */
export function projectStackHandoff(slug: string | null) {
  const preset = getStackTemplatePreset(slug);
  const template = slug ? getStackTemplate(slug) : undefined;
  if (!preset || !template) return null;
  const conditions: Partial<Pick<ProjectBrief, StackConditionField>> = {
    genre: preset.genre, platform: preset.platform, engine: preset.engine,
    budget: preset.budget, experience: preset.experience, commercialIntent: preset.commercialIntent,
  };
  if (preset.gameType === '2d' || preset.gameType === '3d') conditions.dimension = preset.gameType;
  const assets = { 'concept-art': 'コンセプトアート', '2d-assets': '2D素材', '3d-assets': '3D素材', animation: 'アニメーション' };
  const requirement = { none: 'なし', optional: '任意', required: '必須' };
  const reference = [
    `コード制作方針：${{ 'no-code': 'ノーコード', assisted: 'AI支援', 'code-first': 'コード中心' }[preset.codingPreference]}`,
    `必要素材：${preset.assetRequirements.map(value => assets[value]).join('・') || '指定なし'}`,
    `音声：${requirement[preset.voiceRequirement]}`,
    `BGM：${requirement[preset.musicRequirement]}`,
    `連携の重要度：${{ low: '低', medium: '中', high: '高' }[preset.integrationImportance]}`,
  ];
  if (!conditions.dimension) reference.unshift(`ゲーム形式：${{ browser: 'ブラウザ', mobile: 'モバイル', other: 'その他', '2d': '2D', '3d': '3D' }[preset.gameType]}（2D/3Dは未指定）`);
  return { slug: template.slug, title: template.title, conditions, reference };
}

export function inheritStackConditions(brief: ProjectBrief, handoff: ReturnType<typeof projectStackHandoff>, conflicts: string[]) {
  const next = { ...brief };
  const inherited = new Set<StackConditionField>();
  for (const field of stackConditionFields) {
    const value = handoff?.conditions[field];
    // Explicit text, including contradictory text left unresolved by the
    // interpreter, always takes precedence over the selected preset.
    if (value && brief[field] === 'unknown' && !conflicts.some(conflict => conflict.startsWith(`${field}:`))) {
      Object.assign(next, { [field]: value });
      inherited.add(field);
    }
  }
  return { brief: next, inherited };
}
