import { describe, expect, it } from 'vitest';
import { defaultProjectInput, type ProjectInput } from '@/lib/domain';
import { getServices } from '@/lib/services';
import { decodeProjectInput, encodeProjectInput, recommendProject } from '@/lib/recommendation';

const make = (patch: Partial<ProjectInput> = {}): ProjectInput => ({ ...defaultProjectInput, ...patch });
const stage = (input: ProjectInput, id: string) => recommendProject(input).stages.find(item => item.stage === id)!;

describe('recommendProject', () => {
  it('builds a free 2D plan without claiming unknown free access', () => {
    const input = make({ budget:'free', assetRequirements:['2d-assets'] });
    expect(stage(input, 'visuals').primary).toBeNull();
    expect(stage(input, 'visuals').reviewCandidates[0]?.service.slug).toBe('scenario');
    expect(stage(input, 'visuals').reviewCandidates[0]?.manualChecks.join(' ')).toContain('無料限定条件');
  });

  it('deduplicates a blocked tool within one stage and combines its matching reasons', () => {
    const visual = stage(make({ budget:'free', assetRequirements:['2d-assets','concept-art'] }), 'visuals');
    const scenario=visual.reviewCandidates.find(candidate=>candidate.service.slug==='scenario')!;
    expect(visual.reviewCandidates.filter(candidate=>candidate.service.slug==='scenario')).toHaveLength(1);
    expect(visual.reviewCandidates.length).toBeGreaterThan(1);
    expect(scenario.reason).toContain('2Dアセット');
    expect(scenario.reason).toContain('コンセプト画像');
    expect(new Set(scenario.manualChecks).size).toBe(scenario.manualChecks.length);
  });

  it('builds a quality-oriented 3D plan and requires the 3D stage', () => {
    const input = make({ gameType:'3d', budget:'flexible', codingPreference:'code-first', assetRequirements:['3d-assets'] });
    expect(stage(input, '3d').requirement).toBe('required');
    expect(stage(input, '3d').primary?.service.slug).toBe('meshy');
  });

  it('strictly excludes voice when voice is not requested', () => {
    const result = stage(make({ voiceRequirement:'none' }), 'voice');
    expect(result.requirement).toBe('excluded');
    expect(result.primary).toBeNull();
  });

  it('strictly excludes 3D for a 2D project without 3D assets', () => {
    expect(stage(make({ gameType:'2d', assetRequirements:['2d-assets'] }), '3d').requirement).toBe('excluded');
  });

  it('exposes unknown facts instead of converting them into positive evidence', () => {
    const result = stage(make({ codingPreference:'no-code', budget:'free' }), 'prototype');
    expect(result.primary).toBeNull();
    expect(result.reviewCandidates[0]?.service.slug).toBe('rosebud-ai');
    expect(result.reviewCandidates[0]?.unknowns.join(' ')).toContain('無料プラン');
    expect(result.reviewCandidates[0]?.evidence.join(' ')).not.toContain('無料プラン: あり');
  });

  it('accepts empty optional fields and supplies manual fallbacks', () => {
    const result = recommendProject(make({ assetRequirements:[] }));
    expect(result.stages).toHaveLength(12);
    expect(result.stages.find(item => item.stage === 'concept')?.manualFallback).toBeTruthy();
  });

  it('keeps conditional commercial use eligible but clearly requires plan and generation-time verification', () => {
    const result = stage(make({ codingPreference:'assisted', commercialIntent:'commercial' }), 'code');
    expect(result.primary?.service.slug).toBe('github-copilot');
    expect(result.primary?.unknowns.join(' ')).toContain('条件付き');
    expect(result.primary?.unknowns.join(' ')).toContain('無条件の商用利用可ではありません');
    expect(result.primary?.manualChecks.join(' ')).toContain('対象プラン');
    expect(result.primary?.manualChecks.join(' ')).toContain('生成時点');
    expect(result.primary?.evidence.join(' ')).not.toContain('商用利用: 掲載情報では可');
  });

  it('requires manual verification for unknown commercial-use data', () => {
    const result = stage(make({ codingPreference:'no-code', commercialIntent:'commercial' }), 'prototype');
    expect(result.primary).toBeNull();
    expect(result.reviewCandidates[0]?.manualChecks.join(' ')).toContain('商用利用を確定できません');
    expect(result.reviewCandidates[0]?.evidence.join(' ')).not.toContain('商用利用: 掲載情報では可');
  });

  it('makes commercial-use no ineligible even when other required conditions match', () => {
    const catalog = getServices().map(service => service.slug === 'github-copilot' ? { ...service, commercialUse:'no' as const } : service);
    const result = recommendProject(make({ codingPreference:'assisted', commercialIntent:'commercial' }), catalog).stages.find(item=>item.stage==='code')!;
    expect(result.primary?.service.slug).not.toBe('github-copilot');
    expect(result.reviewCandidates.find(candidate=>candidate.service.slug==='github-copilot')?.manualChecks.join(' ')).toContain('不可');
  });

  it('only makes verified API services primary when API is important', () => {
    expect(stage(make({ integrationImportance:'high', codingPreference:'code-first' }), 'code').primary).toBeNull();
    expect(stage(make({ integrationImportance:'high', voiceRequirement:'required' }), 'voice').primary?.service.slug).toBe('elevenlabs');
  });

  it('matches a 3D game to the 3D asset rule without requiring an explicit asset checkbox', () => {
    expect(stage(make({ gameType:'3d', assetRequirements:[] }), '3d').primary?.service.slug).toBe('meshy');
  });

  it('uses platform as evidence or a manual check without claiming output support', () => {
    const web = stage(make({ platform:'web', voiceRequirement:'required' }), 'voice').primary!;
    expect(web.evidence.join(' ')).toContain('ゲームの出力先対応を意味しません');
    const mobile = stage(make({ platform:'mobile', voiceRequirement:'required' }), 'voice').primary!;
    expect(mobile.manualChecks.join(' ')).toContain('出力先対応は判断できません');
  });

  it('uses a verified engine match as evidence and treats missing engine data as a manual check', () => {
    const unityCode = stage(make({ engine:'unity', codingPreference:'assisted' }), 'code').primary!;
    expect(unityCode.evidence).toContain('登録済みゲームエンジン: Unity');
    const godotMusic = stage(make({ engine:'godot', musicRequirement:'required' }), 'music-sfx').primary!;
    expect(godotMusic.manualChecks.join(' ')).toContain('非対応とは断定せず');
    expect(godotMusic.evidence.join(' ')).not.toContain('Godot');
  });

  it('adds genre-specific artifacts and iterative production gates', () => {
    const novel = recommendProject(make({ genre:'visual-novel' }));
    expect(novel.stages.find(item=>item.stage==='concept')?.manualTasks.join(' ')).toContain('脚本をロック');
    expect(novel.stages.find(item=>item.stage==='testing')?.acceptanceCriteria.join(' ')).toContain('全分岐');
    const monster = recommendProject(make({ genre:'monster-collection', platform:'mobile', assetRequirements:['2d-assets'] }));
    expect(monster.stages.find(item=>item.stage==='integration')?.manualTasks.join(' ')).toContain('セーブ移行');
    expect(monster.stages.find(item=>item.stage==='prototype')?.manualTasks.join(' ')).toContain('vertical slice');
    expect(monster.stages.find(item=>item.stage==='publishing')?.manualTasks.join(' ')).toContain('release gate');
  });

  it('changes manual guidance for experience and exposes concrete stage handoffs', () => {
    const beginner = recommendProject(make({ experience:'beginner' }));
    const advanced = recommendProject(make({ experience:'advanced' }));
    expect(beginner.projectGuidance).not.toEqual(advanced.projectGuidance);
    expect(beginner.stages.find(item=>item.stage==='testing')?.acceptanceCriteria.length).toBeGreaterThan(1);
    expect(beginner.stages.find(item=>item.stage==='integration')?.handoff).toContain('ビルド');
  });

  it('does not invent price totals and reports known free-plan counts', () => {
    const result = recommendProject(make({ voiceRequirement:'required' }));
    expect(result.costSummary.pricingAmountKnown).toBe(0);
    expect(result.costSummary.pricingAmountUnknown).toBeGreaterThan(0);
    expect(result.costSummary.note).toContain('合計額は算出しません');
    expect(result.costSummary.reviewPricingAmountUnknown).toBeGreaterThanOrEqual(0);
  });

  it('does not require an affiliate URL and never uses it in selection', () => {
    const catalog = getServices().map(service => ({ ...service, affiliateUrl:null, affiliateAvailable:'no' as const }));
    const result = recommendProject(make({ voiceRequirement:'required' }), catalog);
    expect(result.stages.find(item => item.stage === 'voice')?.primary?.service.slug).toBe('elevenlabs');
  });

  it('is deterministic', () => {
    const input = make({ genre:'rpg', integrationImportance:'high', voiceRequirement:'optional' });
    expect(recommendProject(input)).toEqual(recommendProject(input));
  });

  it('exposes auditable five-point fit bands and affected inputs', () => {
    const code=stage(make({codingPreference:'assisted',engine:'unity',budget:'free'}),'code').primary!;
    expect(code.fitScore % 5).toBe(0);
    expect(['strong','good','review']).toContain(code.fitBand);
    expect(code.inputEffects).toContain('codingPreference: assisted');
    expect(code.positiveMatches.length).toBeGreaterThan(0);
  });

  it('keeps selected slugs neutral when affiliate data changes', () => {
    const input = make({ voiceRequirement:'required', assetRequirements:['3d-assets'] });
    const altered = getServices().map(service => ({ ...service, affiliateUrl: service.affiliateUrl ? null : 'https://example.com/ref', affiliateAvailable:'yes' as const }));
    const slugs = (catalog = getServices()) => recommendProject(input, catalog).stages.map(item => item.primary?.service.slug ?? null);
    expect(slugs(altered)).toEqual(slugs());
  });

  it('never repeats the primary tool as its own alternative', () => {
    for (const item of recommendProject(make({gameType:'3d',assetRequirements:['3d-assets']})).stages) {
      expect(item.alternatives.map(candidate=>candidate.service.slug)).not.toContain(item.primary?.service.slug);
    }
  });

  it('models RPG, puzzle, and multi-platform production risks', () => {
    const rpg=recommendProject(make({genre:'rpg'}));
    expect(rpg.stages.find(item=>item.stage==='concept')?.manualTasks.join(' ')).toContain('クエストID');
    expect(rpg.stages.find(item=>item.stage==='testing')?.acceptanceCriteria.join(' ')).toContain('バランス');
    const puzzle=recommendProject(make({genre:'puzzle'}));
    expect(puzzle.stages.find(item=>item.stage==='testing')?.acceptanceCriteria.join(' ')).toContain('解');
    expect(puzzle.stages.find(item=>item.stage==='testing')?.acceptanceCriteria.join(' ')).toContain('色・音');
    const multi=recommendProject(make({platform:'multi-platform'}));
    expect(multi.stages.find(item=>item.stage==='testing')?.manualTasks.join(' ')).toContain('セーブ互換');
    expect(multi.stages.find(item=>item.stage==='publishing')?.manualTasks.join(' ')).toContain('各ストア');
  });
});

describe('share query representation', () => {
  it('round trips a complete input', () => {
    const input = make({ gameType:'browser', genre:'puzzle', platform:'web', engine:'other', assetRequirements:['concept-art','animation'], musicRequirement:'optional' });
    expect(decodeProjectInput(encodeProjectInput(input))).toEqual(input);
  });

  it('repairs malformed and partial input without throwing', () => {
    expect(decodeProjectInput('?gameType=invalid&genre=rpg&assetRequirements=nope').gameType).toBe(defaultProjectInput.gameType);
    expect(decodeProjectInput('?gameType=invalid&genre=rpg&assetRequirements=nope').genre).toBe('rpg');
    expect(decodeProjectInput('?gameType=invalid&genre=rpg&assetRequirements=nope').assetRequirements).toEqual(defaultProjectInput.assetRequirements);
  });
});
