import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it } from 'vitest';
import { swarmMonheroIntroductions } from '@/data/swarm-monhero-introductions';
import { getPublishedGames, gameMetadata } from '@/data/games';
import { getHubGroups } from '@/lib/article-hub-groups';
import { validateGames } from '@/lib/game-validation';
import GamePage, { generateStaticParams } from '@/app/games/[slug]/page';
import sitemap from '@/app/sitemap';

it('integrates the two author submissions through shared routes, cards, OG and sitemap with approved assets', async () => {
  const assets = JSON.parse(readFileSync('docs/drafts/swarm-monhero/image-sources.json', 'utf8'));
  expect(validateGames(swarmMonheroIntroductions)).toEqual([]);
  expect(getPublishedGames()).toHaveLength(10);
  for (const game of swarmMonheroIntroductions) {
    expect(generateStaticParams()).toContainEqual({ slug: game.slug });
    expect(getHubGroups().find(group => group.id === 'games')!.items.some(item => item.href === `/games/${game.slug}/`)).toBe(true);
    expect(sitemap().some(entry => entry.url.endsWith(`/games/${game.slug}/`))).toBe(true);
    expect(gameMetadata(game).openGraph).toMatchObject({ images: [{ width: game.image.width, height: game.image.height }] });
    const asset = assets.find((item: {slug: string}) => item.slug === game.slug);
    expect(createHash('sha256').update(readFileSync(`public${game.image.src}`)).digest('hex')).toBe(asset.sha256);
    const html = renderToStaticMarkup(await GamePage({ params: Promise.resolve({ slug: game.slug }) }));
    expect(html).toContain(game.image.src);
    expect(html).toContain('VideoGame');
    expect(html).not.toContain('スマホだけで開発');
    expect(html).not.toContain('iPhoneだけでゲームを開発');
  }
});

it('preserves distinct payment, registration, author verification and production facts', () => {
  const [swarm, monhero] = swarmMonheroIntroductions;
  expect(swarm.pricingAndRegistration).toContain('2026年10月10日時点');
  expect(swarm.pricingAndRegistration).toContain('ソロはアカウント登録不要');
  expect(swarm.pricingAndRegistration).toContain('協力プレイの登録条件は未確認');
  expect(swarm.image.credit).toContain('追加クレジットは未確認');
  expect(swarm.sourceNote).toContain('紹介用に配置とカメラを調整');
  expect(swarm.verifiedDevices.join(' ')).toContain('WebGLが無効');
  expect(monhero.pricingAndRegistration).toContain('無料・課金なし（ゲーム内通貨のみ）');
  expect(monhero.pricingAndRegistration).toContain('ランキング用にプレイヤーネームだけ');
  expect(monhero.verifiedDevices.join(' ')).toContain('未選択');
  expect(monhero.verifiedDevices.join(' ')).toContain('2026年10月13日');
  expect(monhero.highlights.join(' ')).not.toMatch(/[56]難易度/);
  expect(monhero.aiRoles.map(ai => ai.name)).toEqual(['Claude（Claude Code）', 'ChatGPT']);
});
