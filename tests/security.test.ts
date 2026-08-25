import { describe,expect,it } from 'vitest';
import { serviceSchema } from '@/lib/schema';
import { getServices } from '@/lib/services';
import { serializeJsonLd } from '@/lib/json-ld';
import { decodeProjectInput } from '@/lib/recommendation/query';
import { defaultProjectInput } from '@/lib/domain';

describe('public input security',()=>{
  it.each(['javascript:alert(1)','data:text/html,pwned'])('rejects unsafe service URL %s',url=>{
    const service={...getServices()[0],officialUrl:url};
    expect(serviceSchema.safeParse(service).success).toBe(false);
  });
  it('escapes script termination in JSON-LD',()=>expect(serializeJsonLd({name:'</script><script>alert(1)</script>'})).not.toContain('</script>'));
  it('falls back on oversized queries and caps asset input',()=>{
    expect(decodeProjectInput(`gameType=${'x'.repeat(3000)}`)).toEqual(defaultProjectInput);
    expect(decodeProjectInput('assetRequirements=concept-art,2d-assets,3d-assets,animation,invalid').assetRequirements).toHaveLength(4);
  });
});
