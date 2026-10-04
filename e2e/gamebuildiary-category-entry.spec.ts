import { test, expect, type Page } from './fixtures';
import { mkdir, writeFile } from 'node:fs/promises';
import { getArticleGroups } from '../data/articles';

const evidence = 'docs/screenshots/shared-category-ring';
const idle = async (page: Page) => { await expect(page.locator('.creation-deck')).toHaveCount(1); await expect(page.locator('.creation-deck ol')).toHaveAttribute('data-motion', 'idle'); };
const current = (page: Page) => page.locator('.creation-deck li[data-distance="0"]');
let pageErrors: string[] = [];
test.beforeEach(async ({ context, page }) => {
  pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
});
test.afterEach(() => { expect(pageErrors).toEqual([]); });
for (const width of [320, 375, 390, 1440]) test(`category entry and all public articles at ${width}px`, async ({ page }, info) => {
  await mkdir(evidence, { recursive: true });
  await page.setViewportSize({ width, height: 900 });
  await page.goto('/articles/');
  await expect(page.locator('#categories [data-deck-id]')).toHaveCount(5);
  await expect(page.locator('.creation-deck')).toHaveCount(1);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', width <= 340 ? 'list' : 'deck');
  await expect(page.locator('.hub-preparation')).toHaveCount(0);
  await expect(page.locator('[href="#games"]')).toHaveCount(1);
  await page.screenshot({ path: `${evidence}/categories-${width}.png`, fullPage: true });
  const operations = [];
  for (const group of getArticleGroups().filter(g => g.articles.length)) {
    await page.locator(`[data-category="${group.id}"]`).focus();
    await page.locator(`[data-category="${group.id}"]`).locator("strong").click();
    await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', width <= 340 ? 'list' : 'deck');
    await idle(page);
    expect(await page.locator('.creation-deck li a').evaluateAll(links => links.map(a => a.getAttribute('href')))).toEqual(group.articles.map(a => `/articles/${a.slug}/`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.article-cluster').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${evidence}/${group.id}-${width}.png` });
    operations.push({ category: group.id, ids: group.articles.map(a => a.slug), mode: await page.locator('.creation-deck').getAttribute('data-mode'), url: page.url() });
    await page.getByRole('link', { name: '← カテゴリへ戻る' }).click();
    await expect(page.locator(`[data-category="${group.id}"]`)).toBeFocused();
  }
  await page.getByRole('link', { name: /すべての記事を見る/ }).click();
  await expect(page.locator('#all li a')).toHaveCount(17);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(page.getByText('ゲーム制作外の検証事例', { exact: true })).toBeVisible();
  await writeFile(`${evidence}/operations-${width}.json`, JSON.stringify({ width, method: 'Chromium viewport emulation; not physical device', operations }, null, 2));
  await info.attach('category-operations', { body: JSON.stringify(operations), contentType: 'application/json' });
});

test('voice v4 roundtrip, category focus, history and list selection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/articles/');
  await page.locator('[data-category="voice"]').focus(); await page.locator('[data-category="voice"]').locator("strong").click();
  const historyLength = await page.evaluate(() => history.length);
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'elevenlabs-v4-game-voice');
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await current(page).locator('strong').click();
  await expect(page).toHaveURL(/\/elevenlabs-v4-game-voice\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://game-ai-hub.vercel.app/articles/elevenlabs-v4-game-voice/');
  await expect(page.getByText('この記事にはプロモーションを含みます。', { exact: true })).toBeVisible();
  await page.goBack(); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'elevenlabs-v4-game-voice');
  await page.locator('.article-cluster').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${evidence}/voice-v4-return-390.png` });
  await page.getByRole('link', { name: '← カテゴリへ戻る' }).click();
  await expect(page.locator('[data-category="voice"]')).toBeFocused();
  await page.goBack(); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'elevenlabs-v4-game-voice');
  await page.goForward();
  await expect(page.locator('[data-category="voice"]')).toBeFocused();
  await page.locator('[data-category="voice"]').focus(); await page.locator('[data-category="voice"]').locator("strong").click();
  await page.getByRole('button', { name: '一覧で見る', exact: true }).click();
  await page.reload();
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await page.getByRole('link', { name: '← カテゴリへ戻る' }).click();
  await page.locator('[data-category="start"]').focus(); await page.locator('[data-category="start"]').locator("strong").click();
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
});

test('all-list roundtrip, explicit URL precedence and removed IDs', async ({ page }) => {
  await page.goto('/articles/#all');
  const id = 'ai-auto-trading-reality';
  await page.locator(`[data-deck-id="${id}"] strong`).click();
  await expect(page).toHaveURL(new RegExp(`/articles/${id}/$`));
  await page.goBack();
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(page).toHaveURL(new RegExp(`hubArticle=${id}#all$`));
  await expect(page.locator(`[data-deck-id="${id}"] a`)).toBeFocused();
  await page.goto('/articles/?hubArticle=elevenlabs-v4-game-voice&preserved=yes#voice'); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'elevenlabs-v4-game-voice');
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  expect(new URL(page.url()).searchParams.get('preserved')).toBe('yes');
  await page.goto('/articles/?hubArticle=removed#voice'); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'elevenlabs-game-development-guide');
  await page.goto('/articles/#3d'); await idle(page);
  await page.getByRole('link', { name: '← カテゴリへ戻る' }).click();
  await expect(page.locator('[data-category="3d"]')).toBeFocused();
  await page.goto('/articles/#deleted-category');
  await expect(page.locator('#categories [data-deck-id]')).toHaveCount(5);
});

test('rapid controls and back during motion do not publish a transient article', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/articles/');
  await page.locator('[data-category="voice"]').focus(); await page.locator('[data-category="voice"]').locator("strong").click(); await idle(page);
  await page.getByRole('button', { name: '次の記事', exact: true }).click({ clickCount: 4, delay: 20 }); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'elevenlabs-v4-game-voice');
  await page.getByRole('button', { name: '次の記事', exact: true }).click();
  await page.goBack();
  await expect(page.locator('#categories [data-deck-id]')).toHaveCount(5);
  await page.goForward(); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'elevenlabs-v4-game-voice');
});

test('fallback focus, missing images, Japanese enlargement and mode recovery', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/visual-v2/thumbnails/**', r => r.abort());
  await page.goto('/articles/#voice'); await idle(page);
  await expect(page.locator('.creation-deck img')).toHaveCount(0);
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  await page.getByRole('button', { name: '次の記事', exact: true }).focus();
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(page.locator('[data-deck-id="elevenlabs-v4-game-voice"] a')).toBeFocused();
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `${evidence}/voice-320-root200.png`, fullPage: true });
  await page.evaluate(() => document.documentElement.style.removeProperty('font-size'));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await page.emulateMedia({ reducedMotion: 'no-preference', forcedColors: 'active' });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
});

test('no JavaScript exposes all seventeen normal article links once', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 844 } });
  const page = await context.newPage();
  await page.goto('/articles/');
  await expect(page.locator('.article-cluster:not(.category-cluster) .creation-deck li[data-kind="article"] a')).toHaveCount(17);
  await page.locator('#voice li a').nth(1).locator('strong').click();
  await expect(page).toHaveURL(/elevenlabs-v4-game-voice\/$/);
  await context.close();
});


test('START preserves native dragging from the supplied image with five unique cards', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/articles/#start'); await idle(page);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
  const image = current(page).locator('img');
  await image.scrollIntoViewIfNeeded();
  const box = (await image.boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x - 170, y, { steps: 12 });
  await page.waitForTimeout(150); await page.mouse.up(); await idle(page);
  await expect(current(page)).toHaveAttribute('data-deck-id', 'before-asking-ai-build-game');
  await expect(page.locator('.creation-deck li a')).toHaveCount(5);
});
