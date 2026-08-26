import { z } from 'zod';
export const ternary = z.enum(['yes','no','conditional','unknown','not_applicable']);
export const webUrl = z.url().refine(value => ['https:','http:'].includes(new URL(value).protocol), 'URL must use http or https');
export const serviceCapabilityIds = ['coding','prototype','2d-art','3d-modeling','texture-material','animation','voice','music','sfx','npc-dialogue','localization','testing-qa','trailer-video','marketing-assets'] as const;
export const serviceCapabilitySchema = z.object({
  id:z.enum(serviceCapabilityIds),
  status:z.enum(['verified','conditional','unknown']),
  sourceUrl:webUrl,
  note:z.string().min(1),
});
export const serviceSchema = z.object({
  id:z.string(), slug:z.string().regex(/^[a-z0-9-]+$/), name:z.string(), category:z.string(), summary:z.string(), conclusion:z.string(),
  officialUrl:webUrl, affiliateUrl:webUrl.nullable(), affiliateAvailable:z.enum(['yes','no','unknown']),
  pricing:z.string(), freePlan:ternary, commercialUse:ternary, api:ternary,
  platforms:z.array(z.string()).min(1), engines:z.array(z.string()), primaryUses:z.array(z.string()).min(1),
  capabilities:z.array(serviceCapabilitySchema).min(1),
  recommendedFor:z.array(z.string()).min(1), notRecommendedFor:z.array(z.string()).min(1), strengths:z.array(z.string()).min(1), weaknesses:z.array(z.string()).min(1), alternatives:z.array(z.string()),
  verificationStatus:z.enum(['verified','partially_verified','unknown','stale']), lastVerified:z.iso.date(),
  sources:z.array(z.object({label:z.string(),url:webUrl,type:z.enum(['official','terms','pricing','docs'])})).min(1)
});
export type Service=z.infer<typeof serviceSchema>;
