import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { OutboundLink } from '@/components/OutboundLink';
import { getServices } from '@/lib/services';

let observerCallback:IntersectionObserverCallback;
const observe=vi.fn();
const disconnect=vi.fn();
beforeEach(()=>{
  observe.mockClear();disconnect.mockClear();
  class MockIntersectionObserver{
    root=null;rootMargin='0px';thresholds=[0.5];
    constructor(callback:IntersectionObserverCallback){observerCallback=callback}
    observe=observe;disconnect=disconnect;unobserve=vi.fn();takeRecords=()=>[];
  }
  vi.stubGlobal('IntersectionObserver',MockIntersectionObserver);
});
afterEach(()=>{cleanup();vi.unstubAllGlobals()});
describe('OutboundLink',()=>{
  it('discloses affiliate status and preserves events',async()=>{
    const service=getServices().find(x=>x.slug==='elevenlabs')!;
    const events:CustomEvent[]=[];
    const listener:EventListener=(event)=>{events.push(event as CustomEvent)};
    window.addEventListener('gameai:event',listener);
    const {rerender}=render(<OutboundLink service={service} page="builder-result" placement="voice"/>);
    const link=screen.getByRole('link',{name:/広告リンク/});
    expect(link.getAttribute('href')).toBe(service.affiliateUrl);
    expect(link.getAttribute('rel')).toBe('sponsored nofollow noopener');
    const description=document.getElementById(link.getAttribute('aria-describedby')!);
    expect(description?.textContent).toMatch(/報酬を受け取る場合/);
    await waitFor(()=>expect(observerCallback).toBeTypeOf('function'));
    expect(events).toHaveLength(0);
    observerCallback([{target:link,isIntersecting:true,intersectionRatio:0.49} as unknown as IntersectionObserverEntry],{} as IntersectionObserver);
    expect(events).toHaveLength(0);
    observerCallback([{target:link,isIntersecting:true,intersectionRatio:0.5} as unknown as IntersectionObserverEntry],{} as IntersectionObserver);
    observerCallback([{target:link,isIntersecting:true,intersectionRatio:1} as unknown as IntersectionObserverEntry],{} as IntersectionObserver);
    expect(events.map(x=>x.detail.name)).toEqual(['affiliate_impression']);
    rerender(<OutboundLink service={service} page="builder-result" placement="voice"/>);
    expect(observe).toHaveBeenCalledOnce();
    fireEvent.click(link);
    expect(events.map(x=>x.detail.name)).toEqual(['affiliate_impression','outbound_click','affiliate_click']);
    expect(events[1].detail.properties.sub_id).toBe('elevenlabs__builder-result__voice');
    expect(events[0].detail.properties).toEqual(expect.objectContaining({service_id:'elevenlabs',page:'builder-result',placement:'voice',production_stage:'audio',source_context:'builder',route_category:'builder',affiliate:true}));
    for(const key of ['service_id','page','placement','production_stage','source_context','route_category','affiliate'])
      expect(events[0].detail.properties[key]).toBe(events[2].detail.properties[key]);
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
    expect(observe).not.toHaveBeenCalled();
    window.removeEventListener('gameai:event',listener);
  });
  it('tracks a new CTA identity when the same component instance changes',async()=>{
    const elevenlabs=getServices().find(x=>x.slug==='elevenlabs')!;
    const meshy=getServices().find(x=>x.slug==='meshy')!;
    const events:CustomEvent[]=[];
    const listener:EventListener=event=>events.push(event as CustomEvent);
    window.addEventListener('gameai:event',listener);
    const {rerender}=render(<OutboundLink service={elevenlabs} page="project-result" placement="phase-audio"/>);
    const first=screen.getByRole('link');
    await waitFor(()=>expect(observerCallback).toBeTypeOf('function'));
    observerCallback([{target:first,isIntersecting:true,intersectionRatio:1} as unknown as IntersectionObserverEntry],{} as IntersectionObserver);
    rerender(<OutboundLink service={meshy} page="project-result" placement="phase-assets"/>);
    const second=screen.getByRole('link');
    observerCallback([{target:second,isIntersecting:true,intersectionRatio:1} as unknown as IntersectionObserverEntry],{} as IntersectionObserver);
    expect(events.map(event=>event.detail.properties.service_id)).toEqual(['elevenlabs','meshy']);
    window.removeEventListener('gameai:event',listener);
  });
});
