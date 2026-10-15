import { test, expect, type Page, type Locator } from './fixtures';
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const evidence = 'docs/screenshots/shared-category-ring/summary-fix';
let bundle: string, css: string;
test.beforeAll(async () => {
  const result = await build({ entryPoints: ['e2e/fixtures/summary-deck.tsx'], bundle: true, write: false, format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'fixture-anchor', setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'anchor', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'import React from "react";export default function Link(props){return React.createElement("a",props)}', loader: 'js', resolveDir: process.cwd() }));
  } }] });
  bundle = result.outputFiles[0].text;
  css = (await Promise.all(['app/globals.css', 'app/visual-layer-v2.css'].map(p => readFile(p, 'utf8')))).join('\n');
  await mkdir(evidence, { recursive: true });
});
test.beforeEach(async ({ context }) => {
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
});
const idle = async (page: Page) => {
  await expect(page.locator('.creation-deck')).toHaveCount(1);
  await expect(page.locator('.creation-deck ol')).toHaveAttribute('data-motion', 'idle');
};
const geometry = (summary: Locator) => summary.evaluate(e => ({ visible: e.clientHeight, full: e.scrollHeight, width: e.clientWidth }));
const fitsStage = (page: Page) => expect.poll(() => page.locator('.creation-deck ol').evaluate(e => Math.abs(e.clientHeight - (Math.ceil(Math.max(...[...e.children].map(c => (c as HTMLElement).scrollHeight))) + 16)) <= 1)).toBe(true);

for (const width of [375, 390, 1440]) test(`real Home categories offer expansion only when clipped at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/'); await idle(page);
  const records = [];
  for (const card of await page.locator('.creation-deck li').all()) {
    const summary = card.locator('.v2-start-card-description');
    const sizes = await geometry(summary);
    expect(sizes.visible).toBeGreaterThan(0);
    const clipped = sizes.full > sizes.visible + 1;
    await expect(card.locator('.v2-start-card-expand')).toHaveCount(clipped ? 1 : 0);
    records.push({ id: await card.getAttribute('data-deck-id'), ...sizes, clipped });
  }
  const start = page.locator('[data-deck-id="start"]');
  expect((await geometry(start.locator('.v2-start-card-description'))).full).toBeLessThanOrEqual((await geometry(start.locator('.v2-start-card-description'))).visible + 1);
  await expect(start.locator('.v2-start-card-expand')).toHaveCount(0);
  await fitsStage(page);
  await page.screenshot({ path: `${evidence}/home-${width}.png` });
  await writeFile(`${evidence}/home-${width}.json`, JSON.stringify({ width, method: 'Chromium viewport emulation', records }, null, 2));
});

test('long category visible height grows, close remains, resize/font/content remeasure without lost focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.route('**/__summary_fixture', r => r.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="ja"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body class="visual-layer-v2"><main class="articles-v2-route"><section id="start" class="article-cluster"></section></main><script>${bundle}</script></body></html>` }));
  await page.goto('/__summary_fixture'); await idle(page);
  const card = page.locator('[data-deck-id="summary-0"]'), summary = card.locator('.v2-start-card-description'), button = card.locator('.v2-start-card-expand');
  const collapsed = await geometry(summary); expect(collapsed.full).toBeGreaterThan(collapsed.visible + 1);
  await fitsStage(page); const collapsedStage = await page.locator('.creation-deck ol').evaluate(e => e.clientHeight);
  await page.screenshot({ path: `${evidence}/long-collapsed.png` });
  const node = await summary.elementHandle();
  await button.focus(); await button.press('Enter');
  await expect(button).toBeFocused(); await fitsStage(page);
  const expanded = await geometry(summary); expect(expanded.visible).toBeGreaterThan(collapsed.visible); expect(expanded.full).toBeLessThanOrEqual(expanded.visible + 1);
  const expandedStage = await page.locator('.creation-deck ol').evaluate(e => e.clientHeight); expect(expandedStage).toBeGreaterThan(collapsedStage);
  expect(await summary.evaluate((e, original) => e === original, node)).toBe(true);
  await page.screenshot({ path: `${evidence}/long-expanded.png`, fullPage: true });
  await button.press('Enter');
  await expect.poll(() => summary.evaluate(e => e.scrollHeight > e.clientHeight + 1)).toBe(true);
  await fitsStage(page); expect(await page.locator('.creation-deck ol').evaluate(e => e.clientHeight)).toBeLessThan(expandedStage);
  await expect(button).toBeFocused();
  await page.evaluate(() => document.documentElement.style.fontSize = '125%');
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
  const enlarged = await geometry(summary); expect(enlarged.visible).toBeGreaterThan(collapsed.visible);
  await expect(button).toHaveCount(1); await button.press('Enter'); await fitsStage(page);
  const enlargedFull = await geometry(summary); expect(enlargedFull.visible).toBeGreaterThan(enlarged.visible); expect(enlargedFull.full).toBeLessThanOrEqual(enlargedFull.visible + 1);
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(button).toBeFocused(); await expect(button).toHaveCount(1);
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(button).toHaveCount(0); await expect(card.locator('a')).toBeFocused();
  expect((await geometry(summary)).full).toBeLessThanOrEqual((await geometry(summary)).visible + 1);
  await page.setViewportSize({ width: 390, height: 900 }); await idle(page);
  await expect(button).toHaveCount(1); await button.click();
  await page.getByRole('button', { name: '短い内容に更新', exact: true }).click();
  await expect(button).toHaveCount(0); await expect(page.getByRole('button', { name: '短い内容に更新', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '長い内容に更新', exact: true }).click(); await expect(button).toHaveCount(1);
  await button.click();
  await page.getByRole('button', { name: '短い内容に更新', exact: true }).click();
  await expect(button).toHaveCount(1);
  expect((await geometry(summary)).full).toBeLessThanOrEqual((await geometry(summary)).visible + 1);
  await button.click(); await expect(button).toHaveCount(0); await expect(card.locator('a')).toBeFocused();
  await page.getByRole('button', { name: '長い内容に更新', exact: true }).click(); await expect(button).toHaveCount(1);
  await button.focus();
  // A wrapping change can remove a focused, now-unneeded collapsed control.
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '100%';
    document.querySelector<HTMLElement>('[data-deck-id="summary-0"]')!.style.width = '800px';
    document.querySelector<HTMLElement>('[data-deck-id="summary-0"] .v2-start-card-description')!.style.fontSize = '8px';
  });
  await expect(button).toHaveCount(0); await expect(card.locator('a')).toBeFocused(); await fitsStage(page);
  await writeFile(`${evidence}/long-category.json`, JSON.stringify({ method: 'Chromium; isolated real-component fixture, synthetic font and wrapping stress', collapsed, expanded, collapsedStage, expandedStage, enlarged, enlargedFull, final: await geometry(summary), sameNode: true }, null, 2));
  await node?.dispose();
});

test('existing long article expands to full height and keeps its closing control', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 }); await page.goto('/articles/#voice'); await idle(page);
  const card = page.locator('[data-deck-id="elevenlabs-v4-game-voice"]'); await card.locator('a').focus(); await idle(page);
  const summary = card.locator('.v2-start-card-description'), button = card.locator('.v2-start-card-expand');
  const collapsed = await geometry(summary); expect(collapsed.full).toBeGreaterThan(collapsed.visible + 1);
  await button.click(); await expect(button).toBeFocused(); await fitsStage(page);
  const expanded = await geometry(summary); expect(expanded.visible).toBeGreaterThan(collapsed.visible); expect(expanded.full).toBeLessThanOrEqual(expanded.visible + 1);
  await expect(button).toHaveCount(1);
  await page.screenshot({ path: `${evidence}/article-expanded.png` });
  await button.click(); await expect(button).toBeFocused();
  await expect.poll(() => summary.evaluate(e => e.scrollHeight > e.clientHeight + 1)).toBe(true);
  await page.screenshot({ path: `${evidence}/article-collapsed.png` });
  await writeFile(`${evidence}/article.json`, JSON.stringify({ method: 'Chromium local article', collapsed, expanded }, null, 2));
});
