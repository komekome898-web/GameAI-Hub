import { test, expect, type Page } from './fixtures';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await context.addInitScript(() => localStorage.setItem('gameai:analytics-excluded', '1'));
});
const stage = (page: Page) => page.locator('.creation-deck ol');
async function idle(page: Page) {
  await expect.poll(() => stage(page).evaluate(e => {
    const d = (e as HTMLElement).dataset;
    return d.motion === 'idle' && d.motionRaf === '0' && d.motionPos === d.motionTarget;
  })).toBe(true);
}
async function open(page: Page) {
  await page.goto('/articles/#voice');
  await expect(page.locator('.creation-deck')).toHaveCount(1);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-available', 'true');
  await page.getByRole('button', { name: '円環で見る', exact: true }).count().then(async n => { if (n) await page.getByRole('button', { name: '円環で見る', exact: true }).click(); });
  await idle(page);
}
async function point(page: Page) {
  const image = page.locator('.creation-deck li[data-distance="0"] strong');
  await image.scrollIntoViewIfNeeded();
  const b = (await image.boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}
const status = (page: Page) => page.locator('.creation-deck-status');

test('all cards follow fractional position and interrupted snap resumes without a jump', async ({ page }, info) => {
  await open(page);
  const { x, y } = await point(page);
  const snapshots = [];
  const initial = await stage(page).locator('li').evaluateAll(cards => cards.map(c => (c as HTMLElement).style.transform));
  await page.mouse.move(x, y); await page.mouse.down();
  for (const dx of [-20, -60, -120, 20, 60, 120]) {
    await page.mouse.move(x + dx, y, { steps: 5 });
    await expect(stage(page)).toHaveAttribute('data-motion', 'dragging');
    await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
    const state = await stage(page).evaluate(e => ({ pos: Number((e as HTMLElement).dataset.motionPos), transforms: [...e.children].map(c => (c as HTMLElement).style.transform) }));
    expect(state.pos).toBeCloseTo(-dx / (304 * .56), 2);
    expect(state.transforms.every((t, i) => t !== initial[i])).toBe(true);
    await expect(status(page)).toContainText('3件中1件目');
    snapshots.push({ dx, ...state });
  }
  await page.waitForTimeout(150); // inspect placement, not free inertia
  await page.mouse.up(); await idle(page);
  await expect(status(page)).toContainText('3件中3件目');
  await page.getByRole('button', { name: '次の記事', exact: true }).click();
  await expect(stage(page)).toHaveAttribute('data-motion', 'settling');
  // Interrupt the rendered fractional position, not a rounded/committed index.
  const box = (await stage(page).boundingBox())!;
  await page.mouse.move(195, box.y + 70); await page.mouse.down();
  const pos = Number(await stage(page).getAttribute('data-motion-pos'));
  await page.waitForTimeout(60);
  expect(Number(await stage(page).getAttribute('data-motion-pos'))).toBe(pos);
  await page.mouse.move(155, box.y + 70, { steps: 4 });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
  expect(Number(await stage(page).getAttribute('data-motion-pos'))).toBeCloseTo(pos + 40 / (304 * .56), 2);
  await page.mouse.up(); await idle(page);
  await expect(page).toHaveURL(/\/articles\/\?hubArticle=[^#]+#voice$/);
  await info.attach('continuous-card-positions', { body: JSON.stringify(snapshots, null, 2), contentType: 'application/json' });
});

test('trusted short flick, paused release, twenty wraps, repeated controls and keyboard', async ({ page }) => {
  test.setTimeout(100_000);
  await open(page);
  const cdp = await page.context().newCDPSession(page);
  const swipe = async (dx: number, pause = 0) => {
    const { x, y } = await point(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    const steps = pause ? 6 : 1;
    if (!pause) await page.waitForTimeout(20);
    for (let i = 1; i <= steps; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / steps, y }] });
      await page.waitForTimeout(16);
    }
    if (pause) await page.waitForTimeout(pause);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    if (!pause) {
      await expect(stage(page)).toHaveAttribute('data-motion', 'coasting');
      const before = Number(await stage(page).getAttribute('data-motion-pos'));
      await page.waitForTimeout(40);
      const after = Number(await stage(page).getAttribute('data-motion-pos'));
      expect((after - before) * -Math.sign(dx)).toBeGreaterThan(0);
    }
    await idle(page);
  };
  await swipe(-32); await swipe(32);
  // Momentum can pass multiple articles. Normalize only for discrete-control assertions.
  while (!(await page.locator('.creation-deck-count').textContent())!.startsWith('1 /')) {
    await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  }
  await swipe(-24, 150); await expect(status(page)).toContainText('3件中1件目');
  // Each step is a complete release/settle; no accumulating position or rAF leak.
  for (let i = 1; i <= 60; i++) {
    await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
    await expect(page.locator('.creation-deck-count')).toHaveText(`${i % 3 + 1} / 3`);
  }
  await page.getByRole('button', { name: '次の記事', exact: true }).click({ clickCount: 2, delay: 30 });
  await idle(page); await expect(status(page)).toContainText('3件中3件目');
  await page.getByRole('button', { name: '次の記事', exact: true }).press('ArrowRight');
  await idle(page); await expect(status(page)).toContainText('3件中1件目');
  const links = stage(page).locator('a');
  await expect(links).toHaveCount(3);
  await links.nth(2).focus(); await idle(page);
  await expect(status(page)).toContainText('3件中3件目');
  await expect(links.nth(2)).toBeFocused();
  await expect(links.nth(2)).not.toHaveAttribute('aria-hidden', 'true');
});

test('neighbor tap centers, overview expands the same node, list and large text remain readable', async ({ page }, info) => {
  await open(page); await point(page);
  const neighbor = stage(page).locator('li[data-distance="1"] strong');
  const box = (await neighbor.boundingBox())!;
  const stageBox = (await stage(page).boundingBox())!;
  await page.touchscreen.tap(stageBox.x + stageBox.width - 4, box.y + 30);
  await idle(page); await expect(status(page)).toContainText('3件中2件目');
  await expect(page).toHaveURL(/\/articles\/\?hubArticle=[^#]+#voice$/);
  const active = stage(page).locator('li[data-distance="0"]');
  const overview = active.locator('.v2-start-card-description');
  const id = await overview.getAttribute('id');
  const text = await overview.textContent();
  await active.getByRole('button', { name: '概要をすべて表示' }).click();
  await expect(active.getByRole('button', { name: '概要を閉じる' })).toHaveAttribute('aria-expanded', 'true');
  await expect(overview).toHaveAttribute('id', id!);
  await expect(overview).toHaveText(text!);
  expect(await stage(page).evaluate(e => e.getBoundingClientRect().height >= Math.max(...[...e.children].map(c => (c as HTMLElement).scrollHeight)))).toBe(true);
  await page.getByRole('button', { name: '一覧で見る', exact: true }).click();
  await expect(page.locator(`[id="${id}"]`)).toHaveText(text!);
  await page.setViewportSize({ width: 320, height: 844 });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(stage(page).locator('a')).toHaveCount(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await stage(page).locator('li').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('list-320-root200.png'), fullPage: true });
});

test('long drag chooses two cards; capture loss and resize return to the committed card', async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 844 }); await open(page);
  const p = await point(page);
  await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.mouse.move(p.x - 304 * .56 * 2.2, p.y, { steps: 20 });
  await page.waitForTimeout(150); // slow/paused2.2-card placement, not a fast fling
  await page.mouse.up(); await idle(page);
  await expect(status(page)).toContainText('3件中3件目');
  const q = await point(page);
  await page.mouse.move(q.x, q.y); await page.mouse.down();
  await page.mouse.move(q.x - 120, q.y, { steps: 8 });
  // Explicitly releasing the actual captured pointer simulates unexpected loss.
  await stage(page).evaluate(e => { for (let id = 1; id <= 5; id++) if (e.hasPointerCapture(id)) e.releasePointerCapture(id); });
  await page.mouse.move(q.x - 121, q.y); await page.mouse.up(); await idle(page);
  await expect(status(page)).toContainText('3件中3件目');
  await page.getByRole('button', { name: '次の記事', exact: true }).click();
  await expect(stage(page)).toHaveAttribute('data-motion', 'settling');
  await page.setViewportSize({ width: 390, height: 844 }); await idle(page);
  await expect(status(page)).toContainText('3件中3件目');
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  await expect(status(page)).toContainText('3件中1件目');
  await page.getByRole('button', { name: '次の記事', exact: true }).click();
  // Synthetic visibility notification, separate from trusted pointer coverage.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await idle(page); await expect(status(page)).toContainText('3件中1件目');
  await page.evaluate(() => { Reflect.deleteProperty(document, 'visibilityState'); document.dispatchEvent(new Event('visibilitychange')); });
});

test('failed images keep article links, summaries and natural card height', async ({ page }, info) => {
  await page.route(/\.(webp|png|avif)(\?|$)/, route => route.abort());
  await page.goto('/articles/#start');
  await expect(page.locator('.creation-deck')).toHaveCount(1);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
  await point(page);
  const card = stage(page).locator('li[data-distance="0"]');
  await expect(card.locator('a')).toHaveAccessibleName(/AIでブラウザゲーム/);
  await expect(card.locator('.v2-start-card-description')).toBeVisible();
  await expect(card.locator('.v2-start-card-read')).toBeVisible();
  await page.screenshot({ path: info.outputPath('failed-image-390.png') });
});
