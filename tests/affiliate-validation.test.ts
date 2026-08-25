import { describe,expect,it } from 'vitest';
import { assertAffiliateSlug,assertApprovalDate } from '@/scripts/affiliate-validation';
describe('affiliate automation input validation',()=>{it('rejects shell-like slug input',()=>{expect(()=>assertAffiliateSlug('meshy-direct')).not.toThrow();expect(()=>assertAffiliateSlug('meshy;echo-pwned')).toThrow();expect(()=>assertAffiliateSlug('$(touch-pwned)')).toThrow()});it('accepts real non-future dates only',()=>{const now=new Date('2026-08-25T12:00:00Z');expect(()=>assertApprovalDate('2026-08-25',now)).not.toThrow();expect(()=>assertApprovalDate('2026-02-30',now)).toThrow(/real calendar/);expect(()=>assertApprovalDate('2026-08-26',now)).toThrow(/future/)})});

import { assertAffiliateStatus,assertHttpsAffiliateUrl } from '@/scripts/affiliate-validation';
describe('affiliate registry validation',()=>{
  it('accepts only runtime-supported statuses',()=>{expect(()=>assertAffiliateStatus('active')).not.toThrow();expect(()=>assertAffiliateStatus('paused')).toThrow(/unsupported/)});
  it('fails closed for non-HTTPS and malformed affiliate URLs',()=>{expect(()=>assertHttpsAffiliateUrl('https://example.com/ref')).not.toThrow();expect(()=>assertHttpsAffiliateUrl('http://example.com/ref')).toThrow(/HTTPS/);expect(()=>assertHttpsAffiliateUrl('not-a-url')).toThrow(/valid absolute/)});
});
