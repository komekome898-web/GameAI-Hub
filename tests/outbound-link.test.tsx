import { cleanup,fireEvent,render,screen } from '@testing-library/react';
import { afterEach,describe,expect,it,vi } from 'vitest';
import { OutboundLink } from '@/components/OutboundLink';
import { getServices } from '@/lib/services';

afterEach(()=>cleanup());
describe('OutboundLink',()=>{
  it('discloses affiliate status and preserves events',()=>{
    const service=getServices().find(x=>x.slug==='elevenlabs')!;
    const events:CustomEvent[]=[];
    const listener:EventListener=(event)=>{events.push(event as CustomEvent)};
    window.addEventListener('gameai:event',listener);
    render(<OutboundLink service={service} page="builder-result" placement="voice"/>);
    const link=screen.getByRole('link',{name:/広告リンク/});
    expect(link.getAttribute('href')).toBe(service.affiliateUrl);
    expect(link.getAttribute('rel')).toBe('sponsored nofollow noopener');
    const description=document.getElementById(link.getAttribute('aria-describedby')!);
    expect(description?.textContent).toMatch(/報酬を受け取る場合/);
    fireEvent.click(link);
    expect(events.map(x=>x.detail.name)).toEqual(['outbound_click','affiliate_click']);
    expect(events[0].detail.properties.sub_id).toBe('elevenlabs__builder-result__voice');
    window.removeEventListener('gameai:event',listener);
  });
  it('uses official fallback without affiliate event',()=>{
    const service=getServices().find(x=>!x.affiliateUrl)!;
    const listener=vi.fn();window.addEventListener('gameai:event',listener);
    render(<OutboundLink service={service} page="/compare"/>);
    const link=screen.getByRole('link');
    expect(link.getAttribute('href')).toBe(service.officialUrl);
    expect(link.getAttribute('rel')).toBe('noopener');
    expect(link.hasAttribute('aria-describedby')).toBe(false);
    fireEvent.click(link);
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener('gameai:event',listener);
  });
});
