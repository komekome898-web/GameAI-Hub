import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { gameIntroDrafts } from '@/data/game-intro-drafts';
vi.mock('@/data/games', async importOriginal => {
  const original = await importOriginal<typeof import('@/data/games')>();
  return {...original, getPublishedGame: (slug: string) => gameIntroDrafts.find(g => g.slug === slug)};
});
vi.mock('next/link', () => ({default: ({children, href}: React.ComponentProps<'a'>) => <a href={href}>{children}</a>}));
vi.mock('next/image', () => ({default: () => <p>画像取得待ち（画像・レイアウトの最終確認は未実施）</p>}));
import GamePage from '@/app/games/[slug]/page';
it('renders seven text drafts with the existing game introduction structure for local evidence only', async () => {
  mkdirSync('/tmp/buildiary-render', {recursive:true});
  const css = readFileSync('app/globals.css','utf8') + readFileSync('app/visual-layer-v2.css','utf8');
  for (const game of gameIntroDrafts) {
    const html = renderToStaticMarkup(await GamePage({params:Promise.resolve({slug:game.slug})}));
    expect(html).toContain(game.title);
    expect(html).toContain('作者と制作の工夫');
    expect(html).toContain('料金・登録条件');
    writeFileSync(`/tmp/buildiary-render/${game.slug}.html`, `<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${html}</body></html>`);
  }
});
