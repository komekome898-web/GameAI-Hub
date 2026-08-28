import { describe,expect,it } from 'vitest';
import { POST } from '@/app/api/project/interpret/route';

describe('project interpretation route',()=>{
  it('rejects non-JSON, malformed, empty, and oversized requests',async()=>{
    expect((await POST(new Request('http://local/api',{method:'POST',body:'x'}))).status).toBe(415);
    expect((await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:'{'}))).status).toBe(400);
    expect((await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:''})}))).status).toBe(400);
    expect((await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:'長'.repeat(1201)})}))).status).toBe(400);
  });
  it('works without credentials and prevents caching',async()=>{
    const response=await POST(new Request('http://local/api',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:'2DのRPG'})}));
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
    const body=await response.json(); expect(body.status).toEqual(expect.objectContaining({mode:'deterministic',fallbackReason:'not_configured'}));
    expect(JSON.stringify(body)).not.toContain('CLOUDFLARE_AI_API_TOKEN');
  });
});
