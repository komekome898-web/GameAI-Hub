import { test, expect, type Page } from './fixtures';

const stage = (page: Page) => page.locator('#voice .creation-deck ol');
async function idle(page: Page) {
  await expect(stage(page)).toHaveAttribute('data-motion', 'idle');
  await expect(stage(page)).toHaveAttribute('data-motion-raf', '0');
}
async function open(page: Page) {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto('/articles/#voice');
  await expect(page.locator('.creation-deck')).toHaveCount(1);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-available', 'true');
  await page.getByRole('button', { name: '円環で見る', exact: true }).count().then(async n => { if (n) await page.getByRole('button', { name: '円環で見る', exact: true }).click(); });
  await idle(page);
  await stage(page).locator('li[data-distance="0"] strong').scrollIntoViewIfNeeded();
}
test.beforeEach(async ({ context }) => {
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
});

type Input = { type: 'pointermove' | 'pointerup' | 'pointercancel'; x: number; y: number; t: number };
const cases: { name: string; events: Input[]; index: number; captures: number }[] = [
  { name: '12ms final movement arrives only on up', events: [{ type: 'pointerup', x: -32, y: 0, t: 12 }], index: 0, captures: 0 },
  { name: 'one sparse move after90ms', events: [{ type: 'pointermove', x: -32, y: 0, t: 90 }, { type: 'pointerup', x: -32, y: 0, t: 95 }], index: 1, captures: 1 },
  { name: 'diagonal wobble remains pending until horizontal up', events: [{ type: 'pointermove', x: -9, y: 10, t: 20 }, { type: 'pointerup', x: -32, y: 12, t: 40 }], index: 2, captures: 0 },
  { name: 'committed vertical never revives on horizontal up', events: [{ type: 'pointermove', x: -3, y: 14, t: 20 }, { type: 'pointerup', x: -32, y: 14, t: 40 }], index: 0, captures: 0 },
  { name: 'long hold followed by release is not a flick', events: [{ type: 'pointerup', x: -32, y: 0, t: 500 }], index: 0, captures: 0 },
  { name: 'paused movement plus tiny release jitter stays put', events: [{ type: 'pointermove', x: -32, y: 0, t: 40 }, { type: 'pointerup', x: -32.3, y: 0, t: 200 }], index: 0, captures: 1 },
  { name: 'tiny fast movement stays put', events: [{ type: 'pointerup', x: -9, y: 0, t: 8 }], index: 0, captures: 0 },
  { name: 'cancel never becomes a flick on later up', events: [{ type: 'pointermove', x: -32, y: 0, t: 20 }, { type: 'pointercancel', x: -32, y: 0, t: 25 }, { type: 'pointerup', x: -50, y: 0, t: 30 }], index: 0, captures: 1 },
];
for (const c of cases) test(`synthetic sparse sequence: ${c.name}`, async ({ page }, info) => {
  await open(page);
  const record = await stage(page).evaluate((root, events) => {
    const element = root as HTMLElement, target = root.querySelector('li[data-distance="0"] strong')!;
    const box = target.getBoundingClientRect(), x = box.x + box.width / 2, y = box.y + box.height / 2;
    const started = performance.now(), phases: string[] = [];
    let captures = 0;
    const capture = element.setPointerCapture;
    // Synthetic events have no browser-owned pointer. Record capture requests
    // only; native browser capture/scroll coverage is a separate test below.
    element.setPointerCapture = () => { captures++; };
    try {
      for (const item of [{ type: 'pointerdown', x: 0, y: 0, t: 0 }, ...events]) {
        const event = new PointerEvent(item.type, { bubbles: true, pointerId: 91, pointerType: 'touch', isPrimary: true, button: 0, clientX: x + item.x, clientY: y + item.y });
        Object.defineProperty(event, 'timeStamp', { value: started + item.t });
        target.dispatchEvent(event); phases.push(element.dataset.motion ?? 'missing');
      }
    } finally { element.setPointerCapture = capture; }
    return { captures, phases, events, classification: 'synthetic timing/state coverage; not Safari input' };
  }, c.events);
  expect(record.captures).toBe(c.captures);
  if (c.name.startsWith('diagonal')) expect(record.phases[1]).toBe('pending');
  await idle(page);
  await expect(page.locator('.creation-deck-count')).toHaveText(`${c.index + 1} / 3`);
  await expect(page).toHaveURL(/\/articles\/\?hubArticle=[^#]+#voice$/);
  // A cancelled/stale interaction must not poison the next ordinary action.
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  await expect(page.locator('.creation-deck-count')).toHaveText(`${(c.index + 1) % 3 + 1} / 3`);
  await info.attach('input-sequence', { body: JSON.stringify(record, null, 2), contentType: 'application/json' });
});

test('native mouse survives height-only resize, but cancels changed width, step and availability', async ({ page }, info) => {
  await open(page);
  const begin = async () => {
    const image = stage(page).locator('li[data-distance="0"] strong'); await image.scrollIntoViewIfNeeded();
    const b = (await image.boundingBox())!, x = b.x + b.width / 2, y = b.y + b.height / 2;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 32, y, { steps: 2 });
    await expect(stage(page)).toHaveAttribute('data-motion', 'dragging');
    await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
    return { x, y };
  };
  const records = [];
  const point = await begin();
  const before = Number(await stage(page).getAttribute('data-motion-pos'));
  await page.setViewportSize({ width: 375, height: 700 });
  await expect(stage(page)).toHaveAttribute('data-motion', 'dragging');
  expect(Number(await stage(page).getAttribute('data-motion-pos'))).toBeCloseTo(before, 8);
  await page.mouse.move(point.x - 100, point.y, { steps: 3 });
  await page.screenshot({ path: info.outputPath('height-only-drag-375.png') });
  records.push({ kind: 'height-only', phase: await stage(page).getAttribute('data-motion') });
  await page.waitForTimeout(150); await page.mouse.up(); await idle(page); await expect(page.locator('.creation-deck-count')).toHaveText('2 / 3');
  await begin(); await page.setViewportSize({ width: 390, height: 700 }); await idle(page);
  await page.mouse.up(); await expect(page.locator('.creation-deck-count')).toHaveText('2 / 3');
  records.push({ kind: 'width-change', result: 'cancelled to committed article' });
  await begin();
  await stage(page).locator('li').first().evaluate(e => (e as HTMLElement).style.width = '280px');
  await idle(page); await page.mouse.up(); await expect(page.locator('.creation-deck-count')).toHaveText('2 / 3');
  await stage(page).locator('li').first().evaluate(e => (e as HTMLElement).style.removeProperty('width'));
  records.push({ kind: 'card-step-change', result: 'cancelled to committed article' });
  await begin(); await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list'); await page.mouse.up();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck'); await idle(page);
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  await expect(page.locator('.creation-deck-count')).toHaveText('3 / 3');
  await page.screenshot({ path: info.outputPath('recovered-deck-390.png') });
  records.push({ kind: 'availability-change-and-recovery', result: 'list fallback; next action works' });
  await info.attach('geometry-interruptions', { body: JSON.stringify(records, null, 2), contentType: 'application/json' });
});

test('native Chromium short touch retains vertical scrolling coexistence', async ({ page, context }, info) => {
  await open(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true });
  const b = (await stage(page).locator('li[data-distance="0"] strong').boundingBox())!;
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await page.waitForTimeout(20);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 32, y: y + 8 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(stage(page)).toHaveAttribute('data-motion', 'coasting');
  await idle(page); const selected = await page.locator('.creation-deck-count').textContent();
  const before = await page.evaluate(() => scrollY);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 12 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 20);
  await idle(page); await expect(page.locator('.creation-deck-count')).toHaveText(selected!);
  await info.attach('native-touch', { body: JSON.stringify({ input: 'Chromium CDP touch', horizontal: { dx: -32, dy: 8, moveEvents: 1 }, verticalScrollDelta: await page.evaluate(() => scrollY) - before, physicalSafari: 'UNTESTED' }), contentType: 'application/json' });
});

test('active identity publication does not cancel a newly started contact', async ({ page }, info) => {
  await open(page);
  await stage(page).evaluate(root => {
    let sawSettling = false;
    const observer = new MutationObserver(() => {
      const phase = (root as HTMLElement).dataset.motion;
      if (phase === 'settling') sawSettling = true;
      if (!sawSettling || phase !== 'idle') return;
      observer.disconnect();
      const target = root.querySelector('li[data-distance="0"] strong')!;
      const b = target.getBoundingClientRect();
      target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 93, pointerType: 'touch', isPrimary: true, button: 0, clientX: b.x + 20, clientY: b.y + 20 }));
      (root as HTMLElement).dataset.testContactStarted = 'true';
    });
    observer.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  });
  await page.getByRole('button', { name: '次の記事', exact: true }).click();
  await expect(stage(page)).toHaveAttribute('data-test-contact-started', 'true');
  await expect(page.locator('.creation-deck-count')).toHaveText('2 / 3');
  // Let the active-dependent passive effect run after the new synthetic down.
  await page.waitForTimeout(100);
  await expect(stage(page)).toHaveAttribute('data-motion', 'pending');
  await stage(page).evaluate(root => {
    const target = root.querySelector('li[data-distance="0"] strong')!, b = target.getBoundingClientRect();
    target.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 93, pointerType: 'touch', isPrimary: true, button: 0, clientX: b.x + 20, clientY: b.y + 20 }));
  });
  await idle(page);
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  await expect(page.locator('.creation-deck-count')).toHaveText('3 / 3');
  await info.attach('active-publication', { body: JSON.stringify({ input: 'synthetic contact injected at settled identity publication', result: 'pending contact survived active effect; subsequent operation succeeds' }), contentType: 'application/json' });
});
