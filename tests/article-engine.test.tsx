import { render, screen, fireEvent } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ArticleFrame } from '@/components/ArticleFrame';
import { ArticleProjectCta } from '@/components/ArticleProjectCta';
import { articleMetadata, articlePath, articles, validateArticles } from '@/data/articles';
import { absoluteSiteUrl } from '@/lib/site';

vi.mock('next/link',()=>({default:({href,children,...props}:React.AnchorHTMLAttributes<HTMLAnchorElement>&{href:string})=><a href={href} {...props}>{children}</a>}));

describe('article content engine',()=>{
 it('keeps article identity, metadata and dates unique and canonical',()=>{
  expect(validateArticles(articles)).toEqual([]);
  expect(validateArticles([{...articles[0],slug:'Bad Slug'}])).toContain('invalid slug: Bad Slug');
  expect(validateArticles([{...articles[0],category:'tool',sources:[],lastVerifiedAt:undefined}])).toContain('unverified factual article: ai-fantasy');
  expect(validateArticles([{...articles[0],related:[{...articles[0].related[0],href:'/articles/draft-page/'}]},{...articles[1],slug:'draft-page',publicationStatus:'draft'}])).toContain('related article is not published: ai-fantasy');
  expect(new Set(articles.map(x=>x.slug)).size).toBe(articles.length);
  expect(new Set(articles.map(x=>x.title)).size).toBe(articles.length);
  expect(new Set(articles.map(x=>x.description)).size).toBe(articles.length);
  for(const article of articles){
   expect(article.updatedAt>=article.publishedAt).toBe(true);
   expect(articleMetadata(article).alternates?.canonical).toBe(articlePath(article));
   expect(article.related.some(link=>link.href===articlePath(article))).toBe(false);
   expect(new Set(article.related.map(link=>link.href)).size).toBe(article.related.length);
  }
 });
 it('renders Article and Breadcrumb structured data with production canonical URLs',()=>{
  const article=articles[0]; const html=renderToStaticMarkup(<ArticleFrame article={article}><p>本文</p></ArticleFrame>);
  expect(html).toContain('https://schema.org');
  expect(html).toContain('BreadcrumbList');
  expect(html).toContain('"@type":"Article"');
  expect(html).toContain(absoluteSiteUrl(articlePath(article)));
  expect(html).toContain(`dateTime="${article.updatedAt}"`);
 });
 it('measures one contextual Project handoff without raw text',()=>{
  const listener=vi.fn(); window.addEventListener('gameai:event',listener);
  render(<ArticleProjectCta slug="ai-fantasy" label="制作手順を作る" description="次の作業" placement="article_end"/>);
  fireEvent.click(screen.getByRole('link',{name:'制作手順を作る'}));
  expect(listener).toHaveBeenCalledOnce();
  expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({name:'article_to_project',properties:{page:'/articles/ai-fantasy',placement:'article_end'}});
 });
});
