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
    return d.motion === 'idle' && d.motionRaf === '0' && d.motionPos === d.motionTarget && Number.isInteger(Number(d.motionPos));
  })).toBe(true);
}
async function open(page: Page) {
  await page.goto('/articles/#start');
  await page.getByRole('button', { name: '円環で見る', exact: true }).click();
  await idle(page);
}
for (const fallback of ['resize', 'reduced-motion'] as const) for (const expanded of [false, true]) {
  test(`overview focus survives ${fallback}, expanded=${expanded}, without stealing surviving focus`, async ({ page }, info) => {
    await open(page);
    const links = stage(page).locator('a');
    await links.nth(1).focus();
    const card = stage(page).locator('li').nth(1);
    const overview = card.locator('.v2-start-card-expand');
    if (expanded) await overview.click();
    await overview.focus(); // actual HTMLElement.focus(), not dispatched focusin
    await expect(overview).toBeFocused();
    await expect(overview).toHaveAttribute('aria-expanded', String(expanded));
    const switchToList = async () => {
      if (fallback === 'resize') await page.setViewportSize({ width: 320, height: 844 });
      else await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'list');
    };
    await page.evaluate(() => {
      const focus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function(options?: FocusOptions) {
        if (this.matches('.creation-deck a')) this.dataset.reviewPreventScroll = String(options?.preventScroll);
        focus.call(this, options);
      };
    });
    await switchToList();
    await expect(overview).toHaveCount(0);
    await expect(links.nth(1)).toBeFocused();
    await expect(links.nth(1)).toHaveAttribute('data-review-prevent-scroll', 'true');
    await expect(links.nth(1)).toHaveAttribute('href', /before-asking-ai-build-game/);
    await info.attach('focus-after-fallback', { body: JSON.stringify(await links.nth(1).evaluate(e => ({ href: e.getAttribute('href'), active: document.activeElement === e, scrollY }))), contentType: 'application/json' });
    const restore = async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
    };
    await restore(); await links.nth(2).focus(); await switchToList();
    await expect(links.nth(2)).toBeFocused();
    await restore();
    await page.evaluate(() => { const input = document.createElement('input'); input.id = 'outside-deck-focus'; document.querySelector('main')!.prepend(input); input.focus(); });
    await switchToList();
    await expect(page.locator('#outside-deck-focus')).toBeFocused();
  });
}
for (const phase of ['pending', 'vertical'] as const) for (const interrupted of [false, true]) {
  test(`outside mouse release ends ${phase}, interrupted=${interrupted}, and leaves the next gesture usable`, async ({ page }, info) => {
    await open(page);
    await page.locator('.creation-deck').evaluate(e => scrollTo({ top: e.getBoundingClientRect().top + scrollY - 75, behavior: 'instant' }));
    if (interrupted) {
      await page.getByRole('button', { name: '次の記事', exact: true }).click();
      await expect(stage(page)).toHaveAttribute('data-motion', 'settling');
    }
    const b = (await stage(page).boundingBox())!;
    const x = b.x + 1, y = b.y + 70;
    await page.mouse.move(x, y); await page.mouse.down();
    await expect(stage(page)).toHaveAttribute('data-motion', 'pending');
    if (phase === 'vertical') {
      await page.mouse.move(x, y + 16, { steps: 3 });
      await expect(stage(page)).toHaveAttribute('data-motion', 'vertical');
    }
    const before = await stage(page).getAttribute('data-motion-pos');
    if (interrupted) expect(Number.isInteger(Number(before))).toBe(false);
    await page.mouse.move(b.x - 5, y + (phase === 'vertical' ? 16 : 0));
    await page.mouse.up(); // native up outside OL, before any capture
    await idle(page);
    const after = await stage(page).getAttribute('data-motion-pos');
    await page.mouse.move(x + 100, y, { steps: 8 });
    await expect(stage(page)).toHaveAttribute('data-motion-pos', after!);
    const count = page.locator('.creation-deck-count');
    const active = Number((await count.textContent())!.split('/')[0]);
    const image = stage(page).locator('li[data-distance="0"] img');
    const imageBox = (await image.boundingBox())!;
    const sx = imageBox.x + imageBox.width / 2, sy = imageBox.y + 40;
    await page.mouse.move(sx, sy); await page.mouse.down();
    await page.mouse.move(sx - 100, sy, { steps: 8 }); await page.waitForTimeout(150); await page.mouse.up(); // distance-only recovery gesture await idle(page);
    await expect(count).toHaveText(`${active % 3 + 1} / 3`);
    await info.attach('outside-release', { body: JSON.stringify({ phase, interrupted, before, after, final: await count.textContent() }), contentType: 'application/json' });
  });
}

for (const terminal of ['blur', 'cancel'] as const) test(`contact ignores an unrelated terminal event and cancels on window ${terminal}`, async ({ page }) => {
  await open(page);
  const b = (await stage(page).boundingBox())!;
  await stage(page).evaluate(e => e.addEventListener('pointerdown', event => {
    document.documentElement.dataset.reviewPointer = String((event as PointerEvent).pointerId);
  }, { once: true }));
  await page.mouse.move(b.x + 1, b.y + 70); await page.mouse.down();
  await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 999999, isPrimary: false })));
  await expect(stage(page)).toHaveAttribute('data-motion', 'pending');
  // Synthetic terminal notifications are not OS focus/cancellation tests.
  await page.evaluate(kind => {
    if (kind === 'blur') window.dispatchEvent(new Event('blur'));
    else window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: Number(document.documentElement.dataset.reviewPointer) }));
  }, terminal);
  await idle(page); await page.mouse.up();
  await page.getByRole('button', { name: '次の記事', exact: true }).click(); await idle(page);
  await expect(page.locator('.creation-deck-count')).toHaveText('2 / 3');
});
