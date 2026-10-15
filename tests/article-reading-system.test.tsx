// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ArticleFrame } from '@/components/ArticleFrame';
import { getArticle } from '@/data/articles';

vi.mock('next/navigation',()=>({usePathname:()=>'/articles/meshy-game-development-guide'}));
vi.mock('next/link',()=>({default:({href,children,...props}:{href:string;children:React.ReactNode})=><a href={href} {...props}>{children}</a>}));

describe('shared article reading system',()=>{
  it('builds a summary and real heading links for long articles',async()=>{
    const article=getArticle('meshy-game-development-guide')!;
    const {container}=render(<ArticleFrame article={article} showProjectCta={false}><div className="article-content"><header className="page-head"><h1>{article.title}</h1></header><section><h2>最初の1点を決める</h2></section><section><h2>生成する</h2></section><section><h2>ゲームで検品する</h2></section></div></ArticleFrame>);
    await waitFor(()=>expect(screen.getByText(article.description)).not.toBeNull());
    await waitFor(()=>expect(screen.getByRole('navigation',{name:'この記事の目次'})).not.toBeNull());
    const links=screen.getAllByRole('link',{name:/最初の1点を決める|生成する|ゲームで検品する/});
    expect(links).toHaveLength(3);
    for(const link of links)expect(container.querySelector(link.getAttribute('href')!)).not.toBeNull();
  });

  it('retains Article and Breadcrumb structured data',()=>{
    const article=getArticle('elevenlabs-commercial-use-game')!;
    const {container}=render(<ArticleFrame article={article} showProjectCta={false}><div className="article-content"><header className="page-head"><h1>{article.title}</h1></header></div></ArticleFrame>);
    const schemas=Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(node=>JSON.parse(node.textContent||'{}'));
    expect(schemas.map(schema=>schema['@type'])).toEqual(['Article','BreadcrumbList']);
    expect(schemas[0].mainEntityOfPage).toMatch(new RegExp(`/articles/${article.slug}/$`));
  });
});

describe('article topic clusters',()=>{
  it('connects tool pillars to commercial and pricing decision pages',()=>{
    const eleven=getArticle('elevenlabs-game-development-guide')!;
    expect(eleven.related.map(link=>link.href)).toContain('/articles/elevenlabs-commercial-use-game/');
    expect(getArticle('elevenlabs-commercial-use-game')!.related.map(link=>link.href)).toContain('/articles/elevenlabs-game-development-guide/');
    const meshy=getArticle('meshy-game-development-guide')!;
    expect(meshy.related.map(link=>link.href)).toEqual(expect.arrayContaining(['/articles/meshy-pricing-credits-game/','/articles/meshy-commercial-use-game/']));
    for(const slug of ['meshy-pricing-credits-game','meshy-commercial-use-game'])expect(getArticle(slug)!.related.map(link=>link.href)).toContain('/articles/meshy-game-development-guide/');
  });
});
