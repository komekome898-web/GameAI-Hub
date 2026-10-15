import { mkdir } from 'node:fs/promises';
import { test, expect, type Page, type Locator } from './fixtures';
import { getPublishedGames } from '../data/games';

// WebKit with touch/mobile emulation, not physical iPhone acceptance.
const evidence = 'docs/screenshots/webkit-mobile';
const idle = async (page: Page) => {
  await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode', 'deck');
  await expect(page.locator('.b3-game-stage')).toHaveAttribute('data-motion', 'idle');
};
const noOverflow = async (page: Page) => {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
};
const exposed = async (target: Locator) => {
  await expect(target).toBeVisible();
  await expect.poll(() => target.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const header = document.querySelector('.site-header')!.getBoundingClientRect().bottom;
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const hit = document.elementFromPoint(x, y);
    return rect.top >= header && rect.bottom <= innerHeight && !!hit && element.contains(hit);
  })).toBe(true);
};
const snapshot = async (page: Page, name: string) => {
  const engine = page.context().browser()!.browserType().name();
  await page.screenshot({ path: `${evidence}/${engine}-${page.viewportSize()!.width}-${name}.png` });
};

test.beforeEach(async ({ context, page }) => {
  await mkdir(evidence, { recursive: true });
  // No production traffic, external game launches, or analytics requests.
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await page.goto('/privacy/?gameai_analytics=off');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('gameai:analytics-excluded'))).toBe('1');
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`all ten Home introductions restore focus and visible position (${reducedMotion})`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.emulateMedia({ reducedMotion });
    await page.goto('/');
    await idle(page);
    const slugs = await page.locator('.b3-game-stage > li').evaluateAll(items => items.map(item => (item as HTMLElement).dataset.deckId!));
    expect([...slugs].sort()).toEqual(getPublishedGames().map(game => game.slug).sort());
    expect(slugs).toHaveLength(10);
    const games = slugs.map(slug => getPublishedGames().find(game => game.slug === slug)!);
    await snapshot(page, `home-${reducedMotion}`);
    for (const [index, game] of games.entries()) {
      await expect(page.locator('.b3-game-selection h2')).toHaveText(game.title);
      const detail = page.locator('.b3-game-selection .b3-game-detail');
      await detail.scrollIntoViewIfNeeded();
      await exposed(detail);
      await noOverflow(page);
      await detail.tap();
      await expect(page).toHaveURL(new RegExp(`/games/${game.slug}/$`));
      await expect(page.locator('main h1')).toContainText(game.title);
      await noOverflow(page);
      await snapshot(page, `${game.slug}-${reducedMotion}`);
      if (index % 2 === 0) {
        const back = page.getByRole('link', { name: '作品一覧へ戻る', exact: true }).first();
        await expect(back).toHaveAttribute('href', `/?homeGame=${game.slug}#games`);
        await back.tap();
      } else await page.goBack();
      await idle(page);
      const restored = page.locator('.b3-game-selection h2 a');
      await expect(restored).toBeFocused();
      await expect(restored).toHaveText(game.title);
      await exposed(restored);
      await noOverflow(page);
      if (reducedMotion === 'reduce') await expect(page.locator('.b3-game-stage')).toHaveAttribute('data-motion-raf', '0');
      if (index < games.length - 1) {
        await page.getByRole('button', { name: '次の掲載作品', exact: true }).tap();
        await idle(page);
      }
    }
    await snapshot(page, `home-restored-${reducedMotion}`);
  });
}

test('list mode restores the same later game through repeated detail visits', async ({ page }) => {
  await page.goto('/');
  await idle(page);
  await page.getByRole('button', { name: '作品一覧', exact: true }).tap();
  const game = getPublishedGames().at(-1)!;
  const detail = page.locator(`[data-deck-id="${game.slug}"] .b3-static-copy .b3-game-detail`);
  for (let repeat = 0; repeat < 3; repeat++) {
    await detail.tap();
    await expect(page).toHaveURL(new RegExp(`/games/${game.slug}/$`));
    if (repeat === 1) await page.getByRole('link', { name: '作品一覧へ戻る', exact: true }).first().tap();
    else await page.goBack();
    await expect(page.locator('.b3-showcase')).toHaveAttribute('data-mode', 'list');
    await expect(detail).toBeFocused();
    await exposed(detail);
    await noOverflow(page);
  }
  await snapshot(page, 'list-restored');
});

test('article list restores a later item after breadcrumb and browser Back', async ({ page }) => {
  await page.goto('/articles/');
  await page.getByRole('link', { name: /すべての記事を見る/ }).tap();
  const item = page.locator('#all [data-deck-id]').nth(4);
  const link = item.locator('a').first();
  const read = link.locator('.v2-start-card-read');
  const href = await link.getAttribute('href');
  expect(href).toMatch(/^\/articles\//);
  for (let repeat = 0; repeat < 3; repeat++) {
    await read.tap();
    await expect(page).toHaveURL(new RegExp(`${href!.replace(/\/$/, '')}/$`));
    await expect(page.locator('main h1').first()).toBeVisible();
    await noOverflow(page);
    if (repeat === 1) await page.locator('.breadcrumbs').getByRole('link', { name: '記事', exact: true }).tap();
    else await page.goBack();
    await expect(link).toBeFocused();
    await exposed(read);
    await noOverflow(page);
  }
  await snapshot(page, 'article-restored');
});

test('menu traps focus, closes repeatedly and releases the page after navigation', async ({ page }) => {
  await page.goto('/');
  await idle(page);
  const open = page.getByRole('button', { name: 'メニューを開く', exact: true });
  const dialog = page.getByRole('dialog', { name: 'サイトメニュー' });
  for (let repeat = 0; repeat < 3; repeat++) {
    await open.tap();
    await expect(dialog.getByRole('button', { name: 'メニューを閉じる' })).toBeFocused();
    await expect(page.locator('main')).toHaveAttribute('inert', '');
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: 'プライバシー' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'メニューを閉じる' })).toBeFocused();
    await noOverflow(page);
    if (repeat === 0) await snapshot(page, 'menu');
    if (repeat === 1) await dialog.getByRole('button', { name: 'メニューを閉じる' }).tap();
    else await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(open).toBeFocused();
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  }
  await open.tap();
  await dialog.getByRole('link', { name: '記事', exact: true }).tap();
  await expect(page).toHaveURL(url => url.pathname === '/articles/');
  await expect(dialog).toHaveCount(0);
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
  await page.getByRole('link', { name: /すべての記事を見る/ }).tap();
  await expect(page).toHaveURL(/#all$/);
  await noOverflow(page);
});
