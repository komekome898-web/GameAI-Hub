import { describe, expect, it } from 'vitest';
import { inheritStackConditions, projectStackHandoff } from '@/lib/project/stack-handoff';
import type { ProjectBrief } from '@/lib/project/types';

const unknown: ProjectBrief = { idea: '自分のゲーム', genre: 'unknown', dimension: 'unknown', platform: 'unknown', engine: 'unknown', budget: 'unknown', experience: 'unknown', team: 'unknown', commercialIntent: 'unknown', locale: 'unknown', capabilities: [], details: [] };

describe('Stack to Project conditions', () => {
  it('inherits equivalent fields but never invents team, locale, or AI capabilities', () => {
    const handoff = projectStackHandoff('2d-rpg');
    const { brief } = inheritStackConditions(unknown, handoff, []);
    expect(brief).toMatchObject({ genre: 'rpg', dimension: '2d', platform: 'desktop', engine: 'godot', budget: 'low', experience: 'beginner', commercialIntent: 'commercial', team: 'unknown', locale: 'unknown', capabilities: [] });
    expect(handoff?.reference).toEqual(expect.arrayContaining(['必要素材：2D素材', '音声：任意', 'BGM：必須', 'コード制作方針：AI支援', '連携の重要度：中']));
  });
  it('preserves explicit values and unresolved input conflicts over presets', () => {
    const brief = { ...unknown, engine: 'unity' as const, platform: 'web' as const, details: [{ id: 'detail-own', kind: 'constraint' as const, text: '元の制約', provenance: 'explicit_text' as const }] };
    const result = inheritStackConditions(brief, projectStackHandoff('2d-rpg'), ['budget:free,low']);
    expect(result.brief).toMatchObject({ engine: 'unity', platform: 'web', budget: 'unknown', details: brief.details });
    expect(result.inherited.has('engine')).toBe(false);
    expect(result.inherited.has('budget')).toBe(false);
    expect(brief.genre).toBe('unknown');
  });
  it.each(['browser-game', 'monster-collection-mobile'])('does not invent a dimension for %s', slug => {
    const handoff = projectStackHandoff(slug);
    expect(inheritStackConditions(unknown, handoff, []).brief.dimension).toBe('unknown');
    expect(handoff?.reference[0]).toContain('2D/3Dは未指定');
  });
  it.each([null, 'missing', '__proto__'])('ignores an unrecognized template: %s', slug => {
    expect(projectStackHandoff(slug)).toBeNull();
    expect(inheritStackConditions(unknown, projectStackHandoff(slug), []).brief).toEqual(unknown);
  });
});
