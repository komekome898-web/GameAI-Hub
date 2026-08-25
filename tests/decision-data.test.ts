import {describe,expect,it} from 'vitest';
import {ProjectInputSchema,productionStageIds,StackTemplateSchema} from '@/lib/domain';
import {recommendationRules} from '@/data/recommendation-rules';
import {stackTemplates,stackTemplatePresets,validateStackTemplateConsistency} from '@/data/stack-templates';
import {getServices} from '@/lib/services';

describe('decision data',()=>{
  it('accepts empty optional choices and defaults legacy engine input',()=>{
    const parsed=ProjectInputSchema.parse({gameType:'2d',genre:'rpg',platform:'desktop',budget:'free',experience:'beginner',codingPreference:'assisted',assetRequirements:[],voiceRequirement:'none',musicRequirement:'none',commercialIntent:'undecided',integrationImportance:'low'});
    expect(parsed.engine).toBe('undecided');
  });
  it('defines all stages and eight workflows',()=>{
    expect(new Set(productionStageIds).size).toBe(12);
    expect(stackTemplates).toHaveLength(8);
    stackTemplates.forEach(template=>expect(StackTemplateSchema.safeParse(template).success).toBe(true));
  });
  it('keeps references valid',()=>{
    const slugs=new Set(getServices().map(service=>service.slug));
    for(const stack of stackTemplates) for(const tool of stack.tools){
      expect(slugs.has(tool.serviceSlug)).toBe(true);
      expect(stack.workflow).toContain(tool.stage);
      tool.alternativeSlugs.forEach(slug=>expect(slugs.has(slug)).toBe(true));
    }
    recommendationRules.forEach(rule=>expect(slugs.has(rule.serviceSlug)).toBe(true));
  });
  it('enforces dimensional consistency including the 2D horror preset',()=>{
    expect(validateStackTemplateConsistency()).toBe(true);
    expect(stackTemplatePresets['horror-game'].gameType).toBe('2d');
    expect(stackTemplatePresets['horror-game'].assetRequirements).not.toContain('3d-assets');
    expect(stackTemplates.find(stack=>stack.slug==='horror-game')?.workflow).not.toContain('3d');
  });
  it('does not rank using affiliate state',()=>expect(JSON.stringify(recommendationRules)).not.toMatch(/affiliate|rating|popularity|savings/i));
});
