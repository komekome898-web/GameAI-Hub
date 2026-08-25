const affiliateSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const affiliateStatuses = ['active','pending','rejected','inactive','unknown'] as const;
export type AffiliateStatus = typeof affiliateStatuses[number];

export function assertAffiliateSlug(value: string): void {
  if (!affiliateSlugPattern.test(value)) throw new Error('AFFILIATE_SERVICE must be a lowercase slug containing only letters, numbers, and single hyphens');
}

export function assertApprovalDate(value: string, today = new Date()): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('AFFILIATE_APPROVED_AT must be YYYY-MM-DD');
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) throw new Error('AFFILIATE_APPROVED_AT must be a real calendar date');
  if (value > today.toISOString().slice(0, 10)) throw new Error('AFFILIATE_APPROVED_AT cannot be in the future');
}

export function assertAffiliateStatus(value: string): asserts value is AffiliateStatus {
  if (!(affiliateStatuses as readonly string[]).includes(value)) throw new Error(`unsupported affiliate status: ${value}`);
}

export function assertHttpsAffiliateUrl(value: string): void {
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error('affiliate URL must be a valid absolute URL'); }
  if (parsed.protocol !== 'https:') throw new Error('affiliate URL must use HTTPS');
}
