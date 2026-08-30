import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ArticleAffiliateCtas, type ArticleServiceLink } from '@/components/ArticleAffiliateCtas';
import { getOutboundUrl, getService } from '@/lib/services';

const navigation=vi.hoisted(()=>({pathname:'/articles/ai-fantasy'}));
vi.mock('next/navigation',()=>({usePathname:()=>navigation.pathname}));

afterEach(()=>{
  cleanup();
  navigation.pathname='/articles/ai-fantasy';
});

function article(){
  return <article className="page-shell">
    <header className="page-head"><h1>記事</h1></header>
    <section><h2>では、AIは使えないのか</h2><p>この領域ではとても強い。</p></section>
  </article>;
}

function articleService(slug:'meshy'|'elevenlabs'):ArticleServiceLink{
  const service=getService(slug)!;
  return {slug:service.slug,name:service.name,url:getOutboundUrl(service),affiliate:Boolean(service.affiliateUrl)};
}

describe('ArticleAffiliateCtas',()=>{
  it('uses registry URLs, discloses affiliation, and sends outbound before affiliate events',async()=>{
    const events:CustomEvent[]=[];
    const listener:EventListener=event=>events.push(event as CustomEvent);
    window.addEventListener('gameai:event',listener);
    const meshy=articleService('meshy');
    render(<>{article()}<ArticleAffiliateCtas meshy={meshy} elevenlabs={articleService('elevenlabs')}/></>);

    const link=await screen.findByRole('link',{name:'Meshy'});
    expect(link.getAttribute('href')).toBe(getService('meshy')!.affiliateUrl);
    expect(link.getAttribute('rel')).toBe('sponsored nofollow noopener');
    expect(document.getElementById(link.getAttribute('aria-describedby')!)?.textContent).toMatch(/報酬を受け取る場合/);
    const ad=link.closest('aside');
    expect(ad?.getAttribute('aria-label')).toBe('広告');
    expect(ad?.textContent).toMatch(/^広告/);
    expect(ad?.textContent).not.toMatch(/私なら|候補に入れる|試す方がいい/);
    fireEvent.click(link);
    expect(events.map(event=>event.detail.name)).toEqual(['outbound_click','affiliate_click']);
    expect(events[0].detail.properties).toMatchObject({
      service:'meshy',
      page:'/articles/ai-fantasy',
      placement:'fantasy_tools_inline',
      sub_id:'meshy__-articles-ai-fantasy__fantasy_tools_inline',
    });
    window.removeEventListener('gameai:event',listener);
  });

  it('keeps the official fallback as outbound-only when no affiliate URL is registered',async()=>{
    const fallback:ArticleServiceLink={slug:'meshy',name:'Meshy',url:'https://www.meshy.ai/',affiliate:false};
    const listener=vi.fn();
    window.addEventListener('gameai:event',listener);
    render(<>{article()}<ArticleAffiliateCtas meshy={fallback} elevenlabs={null}/></>);

    const link=await screen.findByRole('link',{name:'Meshy'});
    expect(link.getAttribute('href')).toBe(fallback.url);
    expect(link.getAttribute('rel')).toBe('noopener');
    expect(link.hasAttribute('aria-describedby')).toBe(false);
    expect(screen.queryByText(/この記事にはプロモーション/)).toBeNull();
    expect(link.closest('aside')?.getAttribute('aria-label')).toBe('関連する公式リンク');
    fireEvent.click(link);
    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail.name).toBe('outbound_click');
    window.removeEventListener('gameai:event',listener);
  });
});
