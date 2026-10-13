import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page } from './fixtures';
import { diagnoseWidths } from './acceptance/diagnostics';
import { cleanSourceIdentity } from './acceptance/source-identity';
import { applyTextMethod } from './acceptance/reflow';

const output = 'docs/screenshots/b3-components';
const samples = [
  ['home-categories', '/', '.category-cluster .v2-start-card'],
  ['hub-categories', '/articles/', '.category-cluster .v2-start-card'],
  ['hub-start', '/articles/#start', '.creation-deck .v2-start-card'],
  ['hub-all', '/articles/#all', '.creation-deck .v2-start-card'],
  ['hub-games', '/articles/#games', '.game-card-actions'],
  ['reading-workspace', '/articles/ai-browser-game-how-to/', '.beginner-workspace'],
  ['tools', '/tools/?goal=3d', '.goal-picker'],
  ['tool-detail', '/tools/meshy/', '.verdict'],
  ['compare', '/compare/?ids=meshy,tripo-ai&goal=3d&stage=3d', '.compare-context'],
  ['guides', '/guides/', '.guide-stage-options'],
  ['guide-detail', '/guides/ai-2d-rpg-workflow/', '.stage-decision'],
  ['stack', '/stacks/2d-rpg/', '.stack-tools'],
  ['project', '/project/', '.idea-examples'],
  ['404', '/missing-b3-components/', '.empty'],
] as const;

async function settled(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

test.beforeEach(async ({ context }) => {
  await mkdir(output, { recursive: true });
  await context.addInitScript(() => {
    if (window === window.top) localStorage.setItem('gameai:analytics-excluded', '1');
  });
});

test('inner component evidence reaches live families at desktop and narrow widths', async ({ page }) => {
  test.setTimeout(300_000);
  const source = cleanSourceIdentity();
  const records = [];
  for (const width of [1440, 375, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 667 });
    for (const [family, route, selector] of samples) {
      await page.goto(route);
      await settled(page);
      // Scroll to the actual inner component; the old shell-only test missed it.
      const surface = page.locator(selector).first();
      await expect(surface, family).toBeAttached();
      await surface.scrollIntoViewIfNeeded();
      await settled(page);
      const widths = await diagnoseWidths(page);
      expect(widths.documentOverflowPx, `${family}/${width}`).toBe(0);
      expect(widths.unownedOverflowingElements, `${family}/${width}`).toEqual([]);
      const controls = await page.locator('main .copy-text-control button,main .idea-examples button,main .goal-picker button,main .compare-selection-tray button').evaluateAll(elements => elements.map(element => {
        const style = getComputedStyle(element);
        return { text: element.textContent, height: element.getBoundingClientRect().height, edge: style.borderTopStyle, shadow: style.boxShadow };
      }));
      for (const control of controls) {
        expect(control.height, `${family}: ${control.text}`).toBeGreaterThanOrEqual(44);
        expect(control.edge, `${family}: ${control.text}`).toBe('solid');
        expect(control.shadow, `${family}: ${control.text}`).not.toBe('none');
      }
      const file = `${family}-${width}.png`;
      await page.screenshot({ path: `${output}/${file}` });
      records.push({ family, route, width, selector, matched: await page.locator(selector).count(), screenshot: file, widths, controls });
    }
  }
  await writeFile(`${output}/family-manifest.json`, `${JSON.stringify({ source, method: 'live components and viewport screenshots; independent review is separate', records }, null, 2)}\n`);
});

test('nested hub and selected-list cards use the adopted artwork frame, with usable game actions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  const reference = await page.locator('.b3-art-card').first().evaluate(element => getComputedStyle(element).backgroundImage);
  expect(reference).toContain('linear-gradient');
  for (const route of ['/articles/', '/articles/#start', '/articles/#all', '/articles/#games']) {
    await page.goto(route);
    const card = page.locator('.creation-deck .v2-start-card').first();
    await expect(card).toBeAttached();
    expect(await card.evaluate(element => getComputedStyle(element).backgroundImage)).toBe(reference);
    const inset = await card.evaluate(element => {
      const style = getComputedStyle(element, '::before');
      return { content: style.content, inset: parseFloat(style.left), edge: style.borderTopStyle };
    });
    expect(inset.content).not.toBe('none');
    expect(inset.inset).toBeGreaterThan(0);
    expect(inset.edge).toBe('solid');
  }
  const play = page.locator('.game-card-actions [data-game-play]').first();
  await expect(play).toBeVisible();
  await play.scrollIntoViewIfNeeded();
  expect(await play.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest('[data-game-play]') === element;
  })).toBe(true);
});

test('actual 200% computed text keeps short Japanese goal choices on one line', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 667 });
  await page.goto('/tools/');
  const applied = await applyTextMethod(page, [{ role: 'goal-button', selector: '.goal-picker button' }], 'synthetic-computed-text', 2);
  expect(applied.sufficient).toBe(true);
  const short = page.locator('.goal-picker button').filter({ hasText: /^コード$/ });
  await expect(short).toHaveCount(1);
  const lines = await short.evaluate(element => {
    const range = document.createRange(); range.selectNodeContents(element);
    return Array.from(range.getClientRects()).filter(rect => rect.width > 0).length;
  });
  expect(lines).toBe(1);
  expect((await diagnoseWidths(page)).documentOverflowPx).toBe(0);
  await short.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${output}/tools-computed200-320.png` });
  await applied.cleanup();
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  const arrow = page.locator('.header-cta>span:last-child');
  const fit = await arrow.evaluate(element => ({ height: element.clientHeight, text: element.scrollHeight }));
  expect(fit.text).toBeLessThanOrEqual(fit.height);
});

test('Project invalid state has a visible semantic edge and drawer focus remains trapped', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 320, height: 667 });
  await page.route('**/api/project/interpret', route => route.abort('blockedbyclient'));
  await page.goto('/project/');
  await page.getByLabel('どんなゲームを作りたいですか？').fill('Steam向け3Dホラー。Unity。中級。一人開発。低予算。商用。廃駅を舞台に、音を立てると盲目の怪物が追跡する。');
  await page.getByRole('button', { name: '制作ロードマップを作る', exact: true }).click();
  await page.getByRole('button', { name: 'すべて計画に含める', exact: true }).click();
  const invalid = page.getByLabel('抽出した固有情報').first();
  await invalid.fill(' ');
  await page.getByRole('button', { name: 'Project Planを作る', exact: true }).click();
  await expect(invalid).toBeFocused();
  await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  expect(await page.locator('.project-error-summary').evaluate(element => parseFloat(getComputedStyle(element).borderTopWidth))).toBeGreaterThanOrEqual(2);
  await page.screenshot({ path: `${output}/project-invalid-320.png` });
  await page.getByRole('button', { name: 'メニューを開く' }).click();
  const drawer = page.locator('.mobile-menu');
  expect(await drawer.evaluate(element => getComputedStyle(element).backgroundImage)).toContain('linear-gradient');
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.activeElement?.closest('.mobile-menu') !== null)).toBe(true);
  await page.screenshot({ path: `${output}/menu-320.png` });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'メニューを開く' })).toBeFocused();
});
