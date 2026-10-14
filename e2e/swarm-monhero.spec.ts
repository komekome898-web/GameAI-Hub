import { test, expect } from './fixtures';
import { mkdir } from 'node:fs/promises';
import { swarmMonheroIntroductions } from '../data/swarm-monhero-introductions';
import { getPublishedGames } from '../data/games';

const evidence = 'docs/screenshots/swarm-monhero';
test.beforeEach(async ({ context }) => {
  await mkdir(evidence, { recursive: true });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
});

for (const width of [1280, 375, 320]) test(`two game introductions and card navigation at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const game of swarmMonheroIntroductions) {
    expect((await page.goto(`/games/${game.slug}/`))?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText(game.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://game-ai-hub.vercel.app/games/${game.slug}/`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`${game.image.src}$`));
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', String(game.image.width));
    const img = page.locator('.game-hero img');
    await expect(img).toBeVisible();
    expect(await img.evaluate((el: HTMLImageElement) => [el.naturalWidth, el.naturalHeight])).toEqual([game.image.width, game.image.height]);
    await expect(page.getByRole('heading', { name: 'スマホだけで開発', exact: true })).toHaveCount(0);
    await expect(page.locator('main').getByRole('link', { name: /遊ぶ/ })).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${evidence}/${game.slug}-${width}.png`, fullPage: true });
    await page.getByRole('navigation', { name: 'パンくず' }).getByRole('link', { name: '作品一覧へ戻る' }).click();
    await expect(page.locator(`#games [data-deck-id="${game.slug}"] .v2-start-card-face`)).toBeFocused();
  }
  await page.goto('/articles/#games');
  const deck = page.locator('#games');
  await expect(deck.locator('[data-deck-id]')).toHaveCount(getPublishedGames().length);
  if (width > 340) {
  for (let i = 0; i < 8; i++) {
    await deck.getByRole('button', { name: '次の作品', exact: true }).click();
    await expect(deck.locator('ol')).toHaveAttribute('data-motion', 'idle');
  }
  await expect(deck.locator('[data-distance="0"]')).toHaveAttribute('data-deck-id', 'swarm-front');
  await deck.getByRole('button', { name: '次の作品', exact: true }).press('ArrowRight');
  await expect(deck.locator('[data-distance="0"]')).toHaveAttribute('data-deck-id', 'monhero');
  await expect(deck.locator('ol')).toHaveAttribute('data-motion', 'idle');
  await deck.screenshot({ path: `${evidence}/monhero-card-${width}.png` });
  await deck.getByRole('button', { name: '前の作品', exact: true }).click();
  await expect(deck.locator('[data-distance="0"]')).toHaveAttribute('data-deck-id', 'swarm-front');
  await expect(deck.locator('ol')).toHaveAttribute('data-motion', 'idle');
  await deck.screenshot({ path: `${evidence}/swarm-card-${width}.png` });
  await deck.getByRole('button', { name: '一覧で見る', exact: true }).click();
  } else {
    await expect(deck.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  }
  for (const game of swarmMonheroIntroductions) {
    const card = deck.locator(`[data-deck-id="${game.slug}"]`);
    await expect(card.locator('.v2-start-card-face')).toHaveAttribute('href', `/games/${game.slug}/`);
    await expect(card.locator('.game-card-actions a')).toHaveAttribute('href', game.playUrl);
    await expect(card.locator('.game-card-actions p')).toHaveText(game.deviceNote);
  }
  await deck.screenshot({ path: `${evidence}/list-${width}.png` });
  const xml = await (await page.request.get('/sitemap.xml')).text();
  for (const game of swarmMonheroIntroductions) expect(xml).toContain(`/games/${game.slug}/`);
  expect(errors).toEqual([]);
});

test('two introductions at 320px with 200% CSS zoom', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const game of swarmMonheroIntroductions) {
    await page.goto(`/games/${game.slug}/`);
    await page.locator('html').evaluate(el => { el.style.zoom = '2'; });
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${evidence}/${game.slug}-320-zoom200.png`, fullPage: true });
  }
});
