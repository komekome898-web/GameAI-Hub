/* eslint-disable @next/next/no-img-element -- next/image test double */
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { gameIntroductions } from '@/data/game-introductions';
vi.mock('next/link', () => ({default: ({children, href}: React.ComponentProps<'a'>) => <a href={href}>{children}</a>}));
vi.mock('next/image', () => ({default: ({src, alt, width, height}: {src:string;alt:string;width:number;height:number}) => <img src={src} alt={alt} width={width} height={height} />}));
import GamePage from '@/app/games/[slug]/page';
it('renders all seven through the actual published selector and shared game template', async () => {
  for (const game of gameIntroductions) {
    const html = renderToStaticMarkup(await GamePage({params:Promise.resolve({slug:game.slug})}));
    expect(html).toContain(game.title);
    expect(html).toContain(game.image.src);
    expect(html).toContain('料金・登録条件');
    expect(html).toContain('ゲーム内容・操作・制作情報は作者提供');
    expect(html).not.toContain('画像取得待ち');
    if (game.slug==='aura-connect-battle') expect(html).not.toContain('人が確かめ、工夫したこと');
  }
});
