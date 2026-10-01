import { test, expect, type Page } from './fixtures';

test.use({ viewport: { width: 375, height: 844 }, isMobile: true, hasTouch: true });
test.beforeEach(async ({ context }) => {
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  await context.addInitScript(() => localStorage.setItem('gameai:analytics-excluded', '1'));
});

async function openDeck(page: Page) {
  await page.goto('/articles/#start');
  await page.getByRole('button', { name: '円環で見る', exact: true }).click();
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
}
async function cardPoint(page: Page, target = 'img') {
  const card = page.locator(`.creation-deck li[data-distance="0"] ${target}`);
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  if (!box) throw new Error('Active card missing');
  return { x: box.x + box.width / 2, y: box.y + Math.min(40, box.height / 2) };
}

for (const width of [375, 390]) {
  test(`native Chromium touch swipes survive capture transfer and interruptions at ${width}`, async ({ page, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'CDP touch injection is Chromium-only; never claim this as WebKit or physical Safari coverage.');
    await page.setViewportSize({ width, height: 844 });
    await openDeck(page);
    const count = page.locator('.creation-deck-count');
    const cdp = await page.context().newCDPSession(page);
    const traces: { type: string; trusted: boolean; target: string }[] = [];
    await page.exposeFunction('recordDeckInput', (event: typeof traces[number]) => traces.push(event));
    await page.evaluate(() => {
      const recorder = window as unknown as { recordDeckInput: (event: { type: string; trusted: boolean; target: string }) => void };
      for (const type of ['pointerdown', 'pointerup', 'pointercancel', 'lostpointercapture']) {
        document.querySelector('.creation-deck ol')!.addEventListener(type, event => {
          recorder.recordDeckInput({ type, trusted: event.isTrusted, target: (event.target as Element).tagName });
        }, true);
      }
    });
    const swipe = async (dx: number, target = 'img', interrupt?: 'cancel' | 'multitouch') => {
      const { x, y } = await cardPoint(page, target);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
      for (let i = 1; i <= 10; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 10, y, id: 1 }] });
        await page.waitForTimeout(16);
      }
      if (interrupt === 'multitouch') await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x + dx, y, id: 1 }, { x, y: y + 50, id: 2 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: interrupt === 'cancel' ? 'touchCancel' : 'touchEnd', touchPoints: [] });
    };
    await swipe(-100);
    await expect(count).toContainText('3件中2件目');
    await swipe(100, 'strong');
    await expect(count).toContainText('3件中1件目');
    await swipe(-100, 'img', 'cancel');
    await expect(count).toContainText('3件中1件目');
    await swipe(-100, 'img', 'multitouch');
    await expect(count).toContainText('3件中1件目');
    await swipe(-20); // recognized drag, below release threshold
    await expect(count).toContainText('3件中1件目');
    await swipe(-100);
    await expect(count).toContainText('3件中2件目');
    await swipe(-100);
    await expect(count).toContainText('3件中3件目');
    await swipe(-100);
    await expect(count).toContainText('3件中1件目');
    await expect(page).toHaveURL(/\/articles\/#start$/);
    expect(traces.length).toBeGreaterThan(10);
    expect(traces.every(event => event.trusted)).toBe(true);
    expect(traces.some(event => event.type === 'lostpointercapture' && event.target === 'IMG')).toBe(true);
    await testInfo.attach('browser-generated-touch-events', { body: JSON.stringify(traces, null, 2), contentType: 'application/json' });
    await page.locator('.creation-deck-controls').scrollIntoViewIfNeeded();
    await page.screenshot({ path: testInfo.outputPath(`deck-${width}.png`) });
    const { x, y } = await cardPoint(page);
    const scrollBefore = await page.evaluate(() => scrollY);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 12 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollBefore + 30);
    await expect(count).toContainText('3件中1件目');
    await page.locator('.creation-deck li[data-distance="0"] a').tap();
    await expect(page).toHaveURL(/\/articles\/ai-browser-game-how-to\/$/);
  });
}

test('native mouse dragging, controls, resize and reduced-motion fallback', async ({ page }, testInfo) => {
  await openDeck(page);
  const count = page.locator('.creation-deck-count');
  for (const target of ['img', 'strong']) {
    const { x, y } = await cardPoint(page, target);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 100, y, { steps: 12 });
    await page.mouse.up();
    await expect(count).toContainText(target === 'img' ? '3件中2件目' : '3件中3件目');
  }
  await page.getByRole('button', { name: '次の記事', exact: true }).click();
  await expect(count).toContainText('3件中1件目');
  await page.getByRole('button', { name: '次の記事', exact: true }).press('ArrowRight');
  await expect(count).toContainText('3件中2件目');
  const { x, y } = await cardPoint(page);
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x - 70, y, { steps: 8 });
  await page.setViewportSize({ width: 320, height: 844 });
  await page.mouse.up();
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(page.locator('.creation-deck-controls')).toHaveCount(0);
  await page.locator('#start').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('list-320.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
  await expect(count).toContainText('3件中2件目');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
  await expect(page.locator('.creation-deck ol > li > a')).toHaveCount(3);
});

test('actual Stack CTA carries supported conditions into editable Project confirmation', async ({ page }, testInfo) => {
  await page.goto('/stacks/2d-rpg/');
  await page.getByRole('link', { name: 'この構成を条件に合わせる', exact: true }).click();
  await expect(page).toHaveURL(/\/builder\/\?template=2d-rpg$/);
  await page.getByLabel('どんなゲームを作りたいですか？').fill('2D RPGを作りたい');
  await page.getByRole('button', { name: '制作ロードマップを作る', exact: true }).click();
  for (const [field, value] of Object.entries({ genre: 'rpg', dimension: '2d', platform: 'desktop', engine: 'godot', budget: 'low', experience: 'beginner', commercialIntent: 'commercial', team: 'unknown' })) {
    await expect(page.locator(`#project-field-${field}`)).toHaveValue(value);
  }
  await expect(page.locator('.project-stack-handoff')).toContainText('2D RPG 制作構成');
  await expect(page.locator('#project-field-engine').locator('..')).toContainText('Stackから引継ぎ・要確認');
  await page.getByText('自動で反映しない元の設定', { exact: true }).click();
  await expect(page.locator('.project-stack-handoff')).toContainText('BGM：必須');
  await page.locator('.project-stack-handoff').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('stack-confirmation-375.png') });
  await page.locator('#project-field-engine').selectOption('unity');
  await page.locator('#project-field-budget').selectOption('free');
  await page.locator('#project-field-team').selectOption('solo');
  await page.getByRole('button', { name: 'Project Planを作る', exact: true }).click();
  await expect(page.locator('.project-result')).toBeVisible();
  expect(JSON.parse(new URL(page.url()).searchParams.get('p')!)).toMatchObject({ engine: 'unity', budget: 'free', platform: 'desktop', genre: 'rpg' });
});

for (const article of [true, false]) {
  test(`${article ? 'article-origin' : 'direct'} Project survives repeated Tools and Compare returns`, async ({ page }, testInfo) => {
    if (article) {
      await page.goto('/articles/ai-browser-game-how-to/');
      await page.locator('.article-project-cta a').click();
    } else await page.goto('/project/');
    await page.getByLabel('どんなゲームを作りたいですか？').fill('初心者向け猫タップ得点ブラウザゲーム');
    await page.getByRole('button', { name: '制作ロードマップを作る', exact: true }).click();
    await page.locator('.beginner-starter').getByRole('button', { name: 'この内容を確認して、最初のゲームを作る', exact: true }).click();
    await expect(page.locator('.beginner-action')).toBeVisible();
    const original = new URL(page.url()).searchParams;
    expect(original.get('draft')).toMatch(/^[a-f0-9]{32}$/);
    for (let round = 0; round < 2; round++) {
      await page.locator('footer a[href="/tools/"]').click();
      await expect(page).toHaveURL(/\/tools\/$/);
      await expect(page.getByRole('link', { name: '制作中のゲームに戻る →', exact: true })).toBeVisible();
      await page.locator('.tool-compare-secondary').first().click();
      await expect(page).toHaveURL(/\/compare\/\?ids=/);
      await page.getByRole('link', { name: '制作中のゲームに戻る →', exact: true }).click();
      await expect(page.locator('.beginner-action')).toBeVisible();
      const returned = new URL(page.url()).searchParams;
      for (const key of ['draft', 'p', 'source']) expect(returned.get(key)).toBe(original.get(key));
    }
    await page.screenshot({ path: testInfo.outputPath(`${article ? 'article' : 'direct'}-return-375.png`) });
    await page.reload();
    await expect(page.locator('.beginner-action')).toBeVisible();
    await page.locator('footer a[href="/tools/"]').click();
    await expect(page).toHaveURL(/\/tools\/$/);
    await page.goBack();
    await expect(page.locator('.beginner-action')).toBeVisible();
    expect(new URL(page.url()).searchParams.get('draft')).toBe(original.get('draft'));
  });
}
