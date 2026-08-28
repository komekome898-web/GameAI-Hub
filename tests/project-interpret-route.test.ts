import { beforeEach,describe,expect,it,vi } from 'vitest';
import { POST } from '@/app/api/project/interpret/route';
import { resetInterpretationQuotaForTests } from '@/lib/project/providers/rate-limit';

describe('project interpretation route',()=>{
  beforeEach(()=>resetInterpretationQuotaForTests());
  it('rejects non-JSON, malformed, empty, and oversized requests',async()=>{
    expect((await POST(new Request('http://local/api',{method:'POST',body:'x'}))).status).toBe(415);
    expect((await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:'{'}))).status).toBe(400);
    expect((await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:''})}))).status).toBe(400);
    expect((await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:'長'.repeat(1201)})}))).status).toBe(400);
    expect((await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:'RPG',padding:'x'.repeat(6000)})}))).status).toBe(413);
  });
  it('works without credentials and prevents caching',async()=>{
    const response=await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:'2DのRPG'})}));
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
    const body=await response.json(); expect(body.status).toEqual(expect.objectContaining({mode:'deterministic',fallbackReason:'not_configured'}));
    expect(JSON.stringify(body)).not.toContain('CLOUDFLARE_AI_API_TOKEN');
  });
  it('stops invoking the provider path after the per-instance quota and returns a private deterministic fallback',async()=>{
    const previous={provider:process.env.PROJECT_INTERPRETER_PROVIDER,account:process.env.CLOUDFLARE_ACCOUNT_ID,token:process.env.CLOUDFLARE_AI_API_TOKEN};
    const fetchSpy=vi.spyOn(globalThis,'fetch');
    try{
      process.env.PROJECT_INTERPRETER_PROVIDER='cloudflare';process.env.CLOUDFLARE_ACCOUNT_ID='test-account';process.env.CLOUDFLARE_AI_API_TOKEN='test-token';
      const request=()=>new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':'203.0.113.9'},body:JSON.stringify({idea:'2DのRPG'})});
      const {consumeInterpretationQuota}=await import('@/lib/project/providers/rate-limit'); for(let index=0;index<10;index++)expect(consumeInterpretationQuota()).toBe(true);
      const response=await POST(request()); const body=await response.json();
      expect(body.status).toEqual(expect.objectContaining({mode:'deterministic',fallbackReason:'rate_limited'}));
      expect(response.headers.get('x-ratelimit-policy')).toBe('10;w=60');
      expect(JSON.stringify(body)).not.toContain('203.0.113.9'); expect(fetchSpy).not.toHaveBeenCalled();
    }finally{
      fetchSpy.mockRestore();
      if(previous.provider===undefined)delete process.env.PROJECT_INTERPRETER_PROVIDER;else process.env.PROJECT_INTERPRETER_PROVIDER=previous.provider;
      if(previous.account===undefined)delete process.env.CLOUDFLARE_ACCOUNT_ID;else process.env.CLOUDFLARE_ACCOUNT_ID=previous.account;
      if(previous.token===undefined)delete process.env.CLOUDFLARE_AI_API_TOKEN;else process.env.CLOUDFLARE_AI_API_TOKEN=previous.token;
    }
  });
});
