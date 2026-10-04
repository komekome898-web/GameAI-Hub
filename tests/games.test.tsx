/* eslint-disable @next/next/no-img-element -- next/image test double */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { games, getPublishedGames, gameMetadata, gamePath } from '@/data/games';
import { getHubGroups } from '@/lib/article-hub-groups';
import { validateGames } from '@/lib/game-validation';
import { CreationDeck } from '@/components/CreationDeck';
import { GamePlayAnalytics } from "@/components/GamePlayAnalytics";
import { GamePlayLink } from '@/components/GamePlayLink';
import { ArticleReturnLink } from '@/components/ArticleReturnLink';
import GamePage, { generateStaticParams } from '@/app/games/[slug]/page';
import sitemap from '@/app/sitemap';
vi.mock('next/link', () => ({ default: ({href, children, ...props}: React.ComponentProps<'a'>) => <a href={href} {...props}>{children}</a> }));
vi.mock('next/image', () => ({ default: ({src, alt, width, height}: {src: string; alt: string; width: number; height: number}) => <img src={src} alt={alt} width={width} height={height} /> }));
afterEach(() => { cleanup(); sessionStorage.clear(); });
const game = games[0];
describe('published games engine', () => {
  it('projects zero, one and future multiple works separately from articles, excludes drafts and orders IDs', () => {
    expect(validateGames(games)).toEqual([]);
    expect(getHubGroups([]).find(g => g.id === 'games')?.items).toEqual([]);
    const records = [game, {...game, slug: 'future-two', order: 2}, {...game, slug: 'future-three', order: 3}, {...game, slug: 'private-draft', publicationStatus: 'draft' as const}];
    expect(getPublishedGames(records.reverse()).map(g => g.slug)).toEqual(['aramon','future-two','future-three']);
    const groups = getHubGroups(records);
    expect(groups.find(g => g.id === 'games')?.items.map(i => i.href)).toEqual(['/games/aramon/','/games/future-two/','/games/future-three/']);
    expect(groups.filter(g => g.kind !== 'game').flatMap(g => g.items)).toHaveLength(17);
    expect(groups.find(g => g.id === 'practice')?.items.some(i => i.id === 'aramon-production-story')).toBe(true);
  });
  it('rejects unapproved publication and unsafe URLs without guessing conditions', () => {
    expect(validateGames([{...game, publicationReview: {...game.publicationReview, approved: false}}])).toContain('publication review incomplete: aramon');
    expect(validateGames([{...game, playUrl: 'javascript:alert(1)'}])).toContain('invalid https URL: aramon');
    expect(validateGames([game, game])).toContain('invalid or duplicate slug: aramon');
    expect(validateGames([{...game, productionArticle: {href: 'javascript:alert(1)', title: 'unsafe'}}])).toContain('invalid production article: aramon');
  });
  it('accepts a verified external production story as an optional link', () => {
    expect(validateGames([{...game, productionArticle: {href:'https://example.com/story', title:'制作体験'}}])).toEqual([]);
  });
  it('uses published-only static routes, canonical, screenshot OG, VideoGame and sitemap', async () => {
    expect(generateStaticParams()).toEqual([{slug:'aramon'}]);
    expect(gameMetadata(game).alternates?.canonical).toBe(gamePath(game));
    expect(gameMetadata(game).openGraph).toMatchObject({ images: [{url: expect.stringContaining(game.image.src)}] });
    const html = renderToStaticMarkup(await GamePage({params:Promise.resolve({slug:'aramon'})}));
    expect(html).toContain('"@type":"VideoGame"'); expect(html).not.toContain('"@type":"Article"');
    expect(html).toContain('料金条件と、プレイに登録が必須かどうかは未確認');
    expect(html).toContain('iPhone SE');
    expect(sitemap().filter(entry => entry.url.includes('/games/')).map(entry => entry.url)).toEqual(['https://game-ai-hub.vercel.app/games/aramon/']);
  });
  it.each([0,1,2,3])('keeps %i game cards unique with separate introduction and play links', count => {
    const items = Array.from({length:count}, (_, i) => ({...getHubGroups().find(g => g.id === 'games')!.items[0], id:`test-${i}`}));
    const view = render(<CreationDeck kind="game" items={items} />);
    expect(view.container.querySelectorAll('li')).toHaveLength(count);
    expect(view.container.querySelectorAll('.v2-start-card-face')).toHaveLength(count);
    expect(view.container.querySelectorAll('.game-card-actions a')).toHaveLength(count);
    expect(view.container.querySelector('.creation-deck')?.getAttribute('data-mode')).toBe('list');
    if (count) { expect(view.container.textContent).toContain('紹介を見る'); expect(view.container.textContent).not.toContain('更新 undefined'); }
    else expect(view.container.textContent).toContain('表示できる作品はありません');
  });
  it('records a bounded outbound event without raw content', async () => {
    const listener = vi.fn(); window.addEventListener('gameai:event', listener);
    render(<><GamePlayAnalytics /><GamePlayLink href={game.playUrl} slug={game.slug} placement="card" /></>);
    fireEvent.click(screen.getByRole('link', {name:/遊ぶ/}));
    await waitFor(() => expect(listener).toHaveBeenCalledOnce());
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({name:'outbound_click',properties:{page:'/games/aramon/',placement:'card'}});
    window.removeEventListener('gameai:event',listener);
  });
  it('ignores a suppressed click and stops observing when unmounted', () => {
    const listener = vi.fn(); window.addEventListener('gameai:event', listener);
    const observer = render(<GamePlayAnalytics />);
    render(<GamePlayLink href={game.playUrl} slug={game.slug} placement="card" />);
    const link = screen.getByRole('link',{name:/遊ぶ/});
    link.addEventListener('click', event => event.preventDefault(), {once:true});
    fireEvent.click(link); expect(listener).not.toHaveBeenCalled();
    fireEvent.click(link); expect(listener).toHaveBeenCalledOnce();
    observer.unmount(); fireEvent.click(link); expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener('gameai:event',listener);
  });
  it('ignores unsafe return context and keeps a useful game-list fallback', () => {
    sessionStorage.setItem('gameai-article-return', JSON.stringify({id:'aramon',href:'https://evil.example/'}));
    render(<ArticleReturnLink slug="aramon" purpose="games" label="作品一覧へ戻る" />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/articles/?hubArticle=aramon#games');
  });
});
