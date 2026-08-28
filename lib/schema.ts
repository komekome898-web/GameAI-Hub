import { z } from 'zod';
export const ternary = z.enum(['yes','no','conditional','unknown','not_applicable']);
export const webUrl = z.url().refine(value => ['https:','http:'].includes(new URL(value).protocol), 'URL must use http or https');
export const serviceCategoryIds = ['general-llm','coding-agent','ide-ai','2d-image','concept-art','character-consistency','texture-material','3d-model','rigging','animation','voice','music','sfx','npc-dialogue','localization','video-trailer','qa-testing','game-generator','no-code-low-code','marketing-store-assets'] as const;
export const serviceCategorySchema = z.enum(serviceCategoryIds);
export const serviceCapabilityIds = ['general-llm','coding','prototype','2d-art','concept-art','character-consistency','3d-modeling','texture-material','rigging','animation','voice','music','sfx','npc-dialogue','localization','testing-qa','trailer-video','marketing-assets','no-code'] as const;
export const categoryCapability: Record<(typeof serviceCategoryIds)[number], (typeof serviceCapabilityIds)[number]> = {
  'general-llm':'general-llm','coding-agent':'coding','ide-ai':'coding','2d-image':'2d-art','concept-art':'concept-art','character-consistency':'character-consistency','texture-material':'texture-material','3d-model':'3d-modeling','rigging':'rigging','animation':'animation','voice':'voice','music':'music','sfx':'sfx','npc-dialogue':'npc-dialogue','localization':'localization','video-trailer':'trailer-video','qa-testing':'testing-qa','game-generator':'prototype','no-code-low-code':'no-code','marketing-store-assets':'marketing-assets',
};
export const serviceCapabilitySchema = z.object({
  id:z.enum(serviceCapabilityIds),
  status:z.enum(['verified','conditional','unknown']),
  sourceUrl:webUrl,
  note:z.string().min(1),
});
export const serviceSchema = z.object({
  id:z.string(), slug:z.string().regex(/^[a-z0-9-]+$/), name:z.string(), category:serviceCategorySchema, summary:z.string(), conclusion:z.string(),
  officialUrl:webUrl, affiliateUrl:webUrl.nullable(), affiliateAvailable:z.enum(['yes','no','unknown']),
  pricing:z.string(), freePlan:ternary, commercialUse:ternary, api:ternary,
  platforms:z.array(z.string()).min(1), engines:z.array(z.string()), primaryUses:z.array(z.string()).min(1),
  capabilities:z.array(serviceCapabilitySchema).min(1),
  recommendedFor:z.array(z.string()).min(1), notRecommendedFor:z.array(z.string()).min(1), strengths:z.array(z.string()).min(1), weaknesses:z.array(z.string()).min(1), alternatives:z.array(z.string()),
  verificationStatus:z.enum(['verified','partially_verified','unknown','stale']), lastVerified:z.iso.date(),
  sources:z.array(z.object({label:z.string(),url:webUrl,type:z.enum(['official','terms','pricing','docs'])})).min(1)
});
export type Service=z.infer<typeof serviceSchema>;
