import { test, expect, type Page } from './fixtures';
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';

const stage = (page: Page) => page.locator('#start .creation-deck ol');
const idle = async (page: Page) => {
  await expect(stage(page)).toHaveAttribute('data-motion', 'idle');
  await expect(stage(page)).toHaveAttribute('data-motion-raf', '0');
};
let bundle: string, css: string;
test.beforeAll(async () => {
  const result = await build({ entryPoints: ['e2e/fixtures/inertia-deck.tsx'], bundle: true, write: false, format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'fixture-anchor', setup(builder) {
    builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: 'anchor', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'import React from "react";export default function Link(props){return React.createElement("a",props)}', loader: 'js', resolveDir: process.cwd() }));
  } }] });
  bundle = result.outputFiles[0].text;
  css = (await Promise.all(['app/globals.css', 'app/visual-layer-v2.css'].map(p => readFile(p, 'utf8')))).join('\n');
});
test.beforeEach(async ({ context }) => {
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
});
async function open(page: Page, count = 3) {
  await page.setViewportSize({ width: 390, height: 844 });
  {
    await page.route('**/__inertia_fixture?*', r => r.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="ja"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body class="visual-layer-v2"><main class="articles-v2-route"><section id="start" class="article-cluster"></section></main><script>${bundle}</script></body></html>` }));
    await page.goto(`/__inertia_fixture?count=${count}`);
  }
  if (await page.getByRole('button', { name: '円環で見る', exact: true }).count()) await page.getByRole('button', { name: '円環で見る', exact: true }).click();
  await idle(page);
  await stage(page).locator('li[data-distance="0"] img').scrollIntoViewIfNeeded();
}
type Input = { pos: number; t: number; type?: string };
// Deterministic event timing tests are synthetic, never a claim about Safari.
async function gesture(page: Page, events: Input[], trailing?: 'focus-click' | 'cancel' | 'background') {
  return stage(page).evaluate(async (root, { events, trailing }) => {
    const element = root as HTMLElement;
    const origin = root.querySelector<HTMLElement>('li[data-distance="0"]') ?? root.querySelector<HTMLElement>('li')!;
    const target = origin.querySelector('img')!, link = origin.querySelector('a')!;
    const step = origin.offsetWidth * .56, started = performance.now(), nodes = [...root.children];
    const frames: { pos: number; phase: string; ids: string[]; hrefs: string[]; distances: number[]; opacity: number[] }[] = [];
    let running = true;
    const capture = element.setPointerCapture; element.setPointerCapture = () => {};
    const fire = (type: string, pos: number, t: number) => {
      const e = new PointerEvent(type, { bubbles: true, pointerId: 91, pointerType: 'touch', isPrimary: true, button: 0, clientX: 220 - pos * step, clientY: 200 });
      Object.defineProperty(e, 'timeStamp', { value: started + t }); target.dispatchEvent(e);
    };
    const record = () => {
      frames.push({ pos: Number(element.dataset.motionPos), phase: element.dataset.motion!, ids: nodes.map(n => (n as HTMLElement).dataset.deckId!), hrefs: nodes.map(n => n.querySelector('a')!.getAttribute('href')!), distances: nodes.map(n => Number((n as HTMLElement).dataset.distance)), opacity: nodes.map(n => Number((n as HTMLElement).style.opacity)) });
      if (running) requestAnimationFrame(record);
    };
    fire('pointerdown', 0, 0);
    const snapshotRelease = () => ({ pos: Number(element.dataset.motionPos), speed: Number(element.dataset.motionSpeed), phase: element.dataset.motion });
    let before = 0, released: ReturnType<typeof snapshotRelease> | undefined;
    for (const e of events) {
      if (e.type === 'pointerup') {
        before = Number(element.dataset.motionPos); record();
        fire(e.type, e.pos, e.t); released = snapshotRelease(); break;
      }
      fire(e.type ?? 'pointermove', e.pos, e.t); await new Promise(r => requestAnimationFrame(r));
    }
    if (!released) {
      before = Number(element.dataset.motionPos); record();
      fire(trailing === 'cancel' ? 'pointercancel' : 'pointerup', events.at(-1)!.pos, events.at(-1)!.t + 1);
      released = snapshotRelease();
    }
    if (trailing === 'cancel') fire('pointerup', events.at(-1)!.pos, events.at(-1)!.t + 2); // duplicate terminal must not revive
    if (trailing === 'focus-click') {
      link.focus({ preventScroll: true });
      link.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true, detail: 1, pointerId: -1, pointerType: 'touch' }));
    }
    if (trailing === 'background') window.dispatchEvent(new Event('blur'));
    element.setPointerCapture = capture;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => { running = false; reject(new Error('motion did not settle')); }, 4000);
      const check = () => { if (element.dataset.motion === 'idle' && element.dataset.motionRaf === '0') { clearTimeout(timeout); running = false; resolve(); } else requestAnimationFrame(check); }; check();
    });
    return { before, released, frames, final: Number(element.dataset.motionPos), sameNodes: nodes.every((n, i) => root.children[i] === n), count: nodes.length, method: 'synthetic pointer timing; actual component and rAF' };
  }, { events, trailing });
}
function journey(record: Awaited<ReturnType<typeof gesture>>) {
  let total = record.released.pos, prev = total; const centers: number[] = []; let center = Math.round(total);
  for (const f of record.frames.filter(f => f.phase !== 'dragging')) {
    let delta = f.pos - prev;
    if (delta > record.count / 2) delta -= record.count;
    if (delta < -record.count / 2) delta += record.count;
    total += delta; prev = f.pos;
    const next = Math.round(total); if (next !== center) { centers.push(next); center = next; }
  }
  return { travel: total - record.released.pos, centers };
}
for (const count of [3, 12, 30]) test(`${count} stable cards: speed-dependent coast, passage order and invisible seam`, async ({ page }, info) => {
  await open(page, count);
  const slow = await gesture(page, [{ pos: .1, t: 20 }, { pos: .2, t: 100 }]);
  await page.reload(); await page.getByRole('button', { name: '円環で見る', exact: true }).count().then(async n => { if (n) await page.getByRole('button', { name: '円環で見る', exact: true }).click(); }); await idle(page);
  const fast = await gesture(page, [{ pos: .1, t: 10 }, { pos: .2, t: 20 }]);
  const s = journey(slow), f = journey(fast);
  expect(f.travel).toBeGreaterThan(s.travel + 1.5);
  expect(f.centers.length).toBeGreaterThanOrEqual(2);
  expect(f.centers.every((c, i) => i === 0 || c === f.centers[i - 1] + 1)).toBe(true);
  expect(fast.sameNodes).toBe(true); expect(new Set(fast.frames[0].ids).size).toBe(count);
  for (const frame of fast.frames) {
    expect(frame.hrefs).toEqual(fast.frames[0].hrefs);
    if (count > 3) for (let i = 0; i < count; i++) {
      expect(frame.ids[i]).toBe(`inertia-fixture-${i}`);
      expect(frame.hrefs[i]).toBe(`#fixture-article-${i}`);
    }
  }
  for (const frame of fast.frames) for (let i = 0; i < count; i++) if (Math.abs(frame.distances[i]) >= 1.25) expect(frame.opacity[i]).toBe(0);
  for (let n = 1; n < fast.frames.length; n++) for (let i = 0; i < count; i++) {
    if (Math.abs(fast.frames[n].distances[i] - fast.frames[n - 1].distances[i]) > count / 2) expect(fast.frames[n].opacity[i]).toBe(0);
  }
  await expect(stage(page).locator('a')).toHaveCount(count);
  await page.locator('.creation-deck').screenshot({ path: info.outputPath(`inertia-${count}-390.png`) });
  await info.attach('inertia-records', { body: JSON.stringify({ slow, fast, slowJourney: s, fastJourney: f }), contentType: 'application/json' });
});

test('paused placements, fast long release, sparse input and genuine final reversal', async ({ page }, info) => {
  const results = [];
  for (const c of [
    { name: '.9slow-stop', events: [{ pos: .9, t: 900 }, { pos: .9, t: 1050 }], expected: 1 },
    { name: '2.2slow-stop', events: [{ pos: 2.2, t: 900 }, { pos: 2.2, t: 1050 }], expected: 2 },
    { name: '2.2fast', events: [{ pos: 2, t: 200 }, { pos: 2.2, t: 220 }], expected: 2 },
    { name: 'sparse90', events: [{ pos: .3, t: 90 }], expected: 1 },
    { name: 'stale-up-cannot-rewind', events: [{ pos: .9, t: 900 }, { pos: 0, t: 800, type: 'pointerup' }], expected: 1 },
    { name: 'real-final-reverse', events: [{ pos: 1, t: 900 }, { pos: .1, t: 1100, type: 'pointerup' }], expected: 0 },
    { name: 'fresh-final-reverse', events: [{ pos: 1, t: 50 }, { pos: .8, t: 60, type: 'pointerup' }], expected: 1 },
    { name: 'fresh-final-reverse-mirrored', events: [{ pos: -1, t: 50 }, { pos: -.8, t: 60, type: 'pointerup' }], expected: 2 },
  ]) {
    await open(page); const r = await gesture(page, c.events); expect(r.final).toBe(c.expected);
    if (c.name === '2.2fast') expect(journey(r).travel).toBeGreaterThan(2);
    if (c.name === 'fresh-final-reverse') expect(r.released.speed).toBe(-10);
    if (c.name === 'fresh-final-reverse-mirrored') expect(r.released.speed).toBe(10);
    results.push({ name: c.name, ...r, journey: journey(r) }); await page.context().clearCookies(); await page.evaluate(() => sessionStorage.clear());
  }
  await info.attach('placements-and-terminals', { body: JSON.stringify(results), contentType: 'application/json' });
});

test('release-owned focus/click does not rewind; next tap and keyboard work', async ({ page }, info) => {
  await open(page);
  const r = await gesture(page, [{ pos: .9, t: 900 }, { pos: .9, t: 1050 }], 'focus-click');
  expect(r.final).toBe(1);
  await page.getByRole('button', { name: '次の記事', exact: true }).press('ArrowLeft'); await idle(page);
  await expect(page.locator('.creation-deck-count')).toHaveText('1 / 3');
  const href = await stage(page).locator('li[data-distance="0"] a').getAttribute('href');
  await stage(page).locator('li[data-distance="0"] img').click(); await expect(page).toHaveURL(new RegExp(href!));
  await info.attach('release-ownership', { body: JSON.stringify(r), contentType: 'application/json' });
});

test('true cancel cannot create coast or a second release', async ({ page }, info) => {
  await open(page); const r = await gesture(page, [{ pos: .1, t: 10 }, { pos: 1, t: 20 }], 'cancel');
  expect(r.final).toBe(0); expect(r.frames.some(f => f.phase === 'coasting')).toBe(false);
  await info.attach('cancel-record', { body: JSON.stringify(r), contentType: 'application/json' });
});

test('three cards travel multiple turns both ways; background stops inertia', async ({ page }, info) => {
  test.setTimeout(45_000); await open(page); const records = [];
  for (const dir of [1, -1]) {
    let total = 0;
    for (let i = 0; i < 3; i++) {
      const r = await gesture(page, [{ pos: dir * .1, t: 10 }, { pos: dir * .2, t: 20 }]);
      const j = journey(r); expect(Math.sign(j.travel)).toBe(dir); total += j.travel;
      expect(j.centers.every((c, n) => n === 0 || c === j.centers[n - 1] + dir)).toBe(true); records.push({ dir, ...r, journey: j });
    }
    expect(Math.abs(total)).toBeGreaterThan(6);
  }
  const interrupted = await gesture(page, [{ pos: .1, t: 10 }, { pos: .2, t: 20 }], 'background');
  expect(interrupted.final).toBe(0); expect(interrupted.frames.filter(f => f.phase === 'coasting')).toHaveLength(0);
  await info.attach('multiple-turns', { body: JSON.stringify({ records, interrupted }), contentType: 'application/json' });
});

test('grab fractional coast without jump, hold and reverse with new velocity', async ({ page }, info) => {
  await open(page);
  const result = await stage(page).evaluate(async root => {
    const el = root as HTMLElement, img = root.querySelector('img')!, step = (root.children[0] as HTMLElement).offsetWidth * .56;
    const capture = el.setPointerCapture; el.setPointerCapture = () => {};
    const t = performance.now();
    const fire = (type: string, dx: number, time: number) => {
      const e = new PointerEvent(type, { bubbles: true, pointerId: 94, pointerType: 'touch', isPrimary: true, button: 0, clientX: 220 - dx * step, clientY: 200 });
      Object.defineProperty(e, 'timeStamp', { value: t + time }); img.dispatchEvent(e);
    };
    fire('pointerdown', 0, 0); fire('pointermove', .2, 20); fire('pointerup', .2, 21);
    await new Promise(r => setTimeout(r, 100)); const before = Number(el.dataset.motionPos);
    fire('pointerdown', 0, 150); const grabbed = Number(el.dataset.motionPos), stoppedSpeed = Number(el.dataset.motionSpeed);
    await new Promise(r => setTimeout(r, 100)); const held = Number(el.dataset.motionPos);
    fire('pointermove', -.1, 270); fire('pointermove', -.3, 290); fire('pointerup', -.3, 291);
    const reverseSpeed = Number(el.dataset.motionSpeed), released = Number(el.dataset.motionPos);
    await new Promise(r => setTimeout(r, 150)); const later = Number(el.dataset.motionPos);
    el.setPointerCapture = capture;
    return { before, grabbed, held, stoppedSpeed, reverseSpeed, released, later, input: 'synthetic timing with real rAF coast and recontact' };
  });
  expect(result.before % 1).not.toBe(0); expect(result.grabbed).toBe(result.before); expect(result.held).toBe(result.before);
  expect(result.stoppedSpeed).toBe(0); expect(result.reverseSpeed).toBeLessThan(-1); expect(result.later).toBeLessThan(result.released);
  await idle(page); await info.attach('recontact-reversal', { body: JSON.stringify(result), contentType: 'application/json' });
});

test('native long touch placement from image and heading remains after paused release', async ({ page, context }, info) => {
  await open(page); const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true }); const records = [];
  for (const selector of ['img', 'strong']) {
    const target = stage(page).locator(`li[data-distance="0"] ${selector}`); await target.scrollIntoViewIfNeeded();
    const box = (await target.boundingBox())!, x = box.x + box.width / 2, y = box.y + box.height / 2;
    const before = Number(await stage(page).getAttribute('data-motion-pos'));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await page.waitForTimeout(400);
    for (let i = 1; i <= 10; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 304 * .56 * .9 * i / 10, y }] });
      await page.waitForTimeout(40);
    }
    await page.waitForTimeout(150);
    const placed = Number(await stage(page).getAttribute('data-motion-pos'));
    expect(placed).toBeCloseTo(before + .9, 3);
    if (selector === 'img') await page.screenshot({ path: info.outputPath('native-paused-placement-390.png') });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await idle(page);
    const after = Number(await stage(page).getAttribute('data-motion-pos'));
    expect(after).toBe((Math.round(before + .9)) % 3); records.push({ selector, before, placed, after, holdMs: 400, stopMs: 150 });
  }
  await info.attach('native-long-placement', { body: JSON.stringify({ method: 'Chromium CDP touch; not physical Safari', records }), contentType: 'application/json' });
});

test('a delayed animation frame hides cards crossing the circular seam', async ({ page }, info) => {
  await open(page);
  const result = await stage(page).evaluate(async root => {
    const el = root as HTMLElement, img = root.querySelector('img')!, step = (root.children[0] as HTMLElement).offsetWidth * .56;
    const capture = el.setPointerCapture; el.setPointerCapture = () => {};
    const t = performance.now();
    for (const [type, pos, time] of [['pointerdown', 0, 0], ['pointermove', .2, 20], ['pointerup', .2, 21]] as const) {
      const e = new PointerEvent(type, { bubbles: true, pointerId: 95, pointerType: 'touch', isPrimary: true, button: 0, clientX: 220 - pos * step, clientY: 200 });
      Object.defineProperty(e, 'timeStamp', { value: t + time }); img.dispatchEvent(e);
    }
    el.setPointerCapture = capture;
    const snapshot = () => [...root.children].map(n => ({ distance: Number((n as HTMLElement).dataset.distance), opacity: Number((n as HTMLElement).style.opacity) }));
    await new Promise(r => requestAnimationFrame(r)); const before = snapshot();
    // Deliberately skip frames once: actual rAF integration/rendering, not only
    // the pure seam detector. This does not claim a physical frame-rate test.
    const until = performance.now() + 200; while (performance.now() < until) { /* bounded main-thread stall */ }
    await new Promise(r => requestAnimationFrame(r)); const after = snapshot();
    return { before, after, skippedMs: 200, method: 'synthetic release; real delayed Chromium rAF' };
  });
  let crossings = 0;
  result.after.forEach((c, i) => { if (Math.abs(c.distance - result.before[i].distance) > 1.5) { crossings++; expect(c.opacity).toBe(0); } });
  expect(crossings).toBeGreaterThan(0); await idle(page);
  await info.attach('delayed-frame-seam', { body: JSON.stringify(result), contentType: 'application/json' });
});

for (const count of [0, 1, 2]) test(`${count} items remain an ordinary static list even with automatic deck preference`, async ({ page }) => {
  await page.route('**/__inertia_fixture?*', r => r.fulfill({ contentType: 'text/html', body: `<!doctype html><html lang="ja"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body class="visual-layer-v2"><main class="articles-v2-route"><section id="start" class="article-cluster"></section></main><script>${bundle}</script></body></html>` }));
  await page.goto(`/__inertia_fixture?count=${count}&automatic`);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(page.locator('.creation-deck li a')).toHaveCount(count);
  await expect(page.locator('.creation-deck-controls')).toHaveCount(0);
  if (!count) await expect(page.getByText('現在、表示できる記事はありません。')).toBeVisible();
});
