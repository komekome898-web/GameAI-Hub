// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import ArticlesPage from '@/app/articles/page';
import { articles, getArticleGroups, validateArticles, type ArticleRecord } from '@/data/articles';

vi.mock('next/link', () => ({ default: ({href, children, ...props}: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a> }));

describe('published purpose registry', () => {
  it('projects every published article once, in approved category order', () => {
    const groups = getArticleGroups();
    expect(groups.map(g => [g.id, g.articles.length])).toEqual([['start',5],['3d',3],['voice',3],['practice',5],['games',0]]);
    expect(groups[0].articles.map(a => a.slug)).toEqual(['ai-browser-game-how-to','before-asking-ai-build-game','small-first-success','github-beginner-game-development','ai-tool-comparison-later']);
    expect(groups[2].articles.map(a => a.slug)).toEqual(['elevenlabs-game-development-guide','elevenlabs-v4-game-voice','elevenlabs-commercial-use-game']);
    expect(new Set(groups.flatMap(g => g.articles.map(a => a.slug))).size).toBe(16);
    const html = renderToStaticMarkup(<ArticlesPage />);
    for (const article of articles) expect(html.split(`href="/articles/${article.slug}/"`), article.slug).toHaveLength(2);
    expect(html).toContain('ゲーム制作外の検証事例');
    expect(html).not.toContain('href="#games"');
  });
  it('automatically reflects additions, unpublishing and reordering', () => {
    const base = articles.find(a => a.purpose === 'start')!;
    const added: ArticleRecord = { ...base, slug: 'new-test-article', purposeOrder: 9 };
    let records: ArticleRecord[] = [...articles, added];
    expect(getArticleGroups(records)[0].articles.at(-1)?.slug).toBe(added.slug);
    records = records.map(a => a.slug === added.slug ? { ...a, purposeOrder: 1 } : a.purpose === 'start' && a.purposeOrder === 1 ? { ...a, purposeOrder: 8 } : a);
    expect(getArticleGroups(records)[0].articles[0].slug).toBe(added.slug);
    records = records.map(a => a.slug === added.slug ? { ...a, publicationStatus: 'draft' } : a);
    expect(getArticleGroups(records)[0].articles).toHaveLength(5);
  });
  it('rejects missing/unknown membership, duplicate order and duplicate registration', () => {
    const base: ArticleRecord = { ...articles[0] };
    expect(validateArticles([], [{ id: "start" }, { id: "start" }])).toContain("duplicate purpose category");
    expect(validateArticles([{ ...base, purpose: undefined } as unknown as ArticleRecord])).toContain(`unknown or missing purpose: ${base.slug}`);
    expect(validateArticles([{ ...base, purpose: 'unknown' } as unknown as ArticleRecord])).toContain(`unknown or missing purpose: ${base.slug}`);
    expect(validateArticles([base, { ...base, slug: 'duplicate-order' }])).toContain(`duplicate purpose order: ${base.purpose}:${base.purposeOrder}`);
    expect(validateArticles([base, base])).toContain(`duplicate slug: ${base.slug}`);
  });
});
