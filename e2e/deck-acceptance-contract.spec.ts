import { test, expect } from './fixtures';
import { verifyDeckSummaryRecovery } from './acceptance/deck-summary';
import { diagnoseWidths } from './acceptance/diagnostics';
import { probeSurface } from './acceptance/reflow';

test.beforeEach(async ({ page, context }) => {
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto('/articles/#start');
  await expect(page.locator('.creation-deck')).toHaveCount(1);
  await expect(page.locator('.creation-deck')).toHaveAttribute('data-mode', 'deck');
});

test('summary exception is earned through real expansion and list recovery, not shared with other clipping', async ({ page }) => {
  const verified = await verifyDeckSummaryRecovery(page);
  expect(verified.size).toBe(5);
  await page.locator('.creation-deck').evaluate(root => {
    const p = document.createElement('p'); p.id = 'unrelated-clipped-copy'; p.textContent = 'Do not hide this text. '.repeat(30);
    p.style.cssText = 'height:10px;overflow:hidden'; root.append(p);
  });
  const surface = await probeSurface(page, '#start .creation-deck', 44, 0);
  expect(surface.clippedText.some(c => c.selector === '#unrelated-clipped-copy')).toBe(true);
  expect(verified.has('#unrelated-clipped-copy')).toBe(false);
});

for (const defect of ['missing-summary', 'missing-button', 'wrong-controls', 'disabled-button', 'collapsed-clipping', 'expanded-clipping', 'list-clipping'] as const) {
  test(`recovery verification rejects ${defect}`, async ({ page }) => {
    await page.locator('.creation-deck').evaluate((root, kind) => {
      const summary = root.querySelector<HTMLElement>('p.v2-start-card-description')!;
      const button = root.querySelector<HTMLButtonElement>('button.v2-start-card-expand')!;
      if (kind === 'missing-summary') summary.classList.remove('v2-start-card-description');
      if (kind === 'missing-button') button.remove();
      if (kind === 'wrong-controls') button.setAttribute('aria-controls', 'missing-target');
      if (kind === 'disabled-button') button.disabled = true;
      if (kind === 'collapsed-clipping') summary.style.height = '10px';
      if (kind === 'expanded-clipping' || kind === 'list-clipping') {
        const style = document.createElement('style');
        style.textContent = kind === 'expanded-clipping'
          ? '.creation-deck[data-mode="deck"] p[data-expanded="true"] {height:10px!important;overflow:hidden!important}'
          : '.creation-deck[data-mode="list"] p {height:10px!important;overflow:hidden!important}';
        document.head.append(style);
      }
    }, defect);
    await expect(verifyDeckSummaryRecovery(page)).rejects.toThrow();
  });
}

test('overflow outside an actual inactive card never receives the deck owner', async ({ page }) => {
  await page.evaluate(() => {
    const p = document.createElement('p'); p.id = 'outside-deck-overflow'; p.textContent = 'Unowned overflow';
    p.style.cssText = 'position:absolute;left:-100px;width:500px;top:10px'; document.body.prepend(p);
  });
  const record = (await diagnoseWidths(page)).unownedOverflowingElements.find(e => e.selector === '#outside-deck-overflow');
  expect(record).toBeDefined();
  expect(record!.exceptionOwner).toBeUndefined();
});

for (const phase of ['expanded', 'list'] as const) {
  test(`recovery rejects an identical replacement summary after ${phase}`, async ({ page }) => {
    await page.locator('.creation-deck').evaluate((root, when) => {
      const summary = root.querySelector('p.v2-start-card-description')!;
      const observer = new MutationObserver(() => {
        const ready = when === 'expanded'
          ? root.getAttribute('data-mode') === 'deck' && summary.getAttribute('data-expanded') === 'true'
          : root.getAttribute('data-mode') === 'list';
        if (ready) {
          observer.disconnect();
          summary.replaceWith(summary.cloneNode(true));
        }
      });
      observer.observe(root, { attributes: true, subtree: true });
    }, phase);
    await expect(verifyDeckSummaryRecovery(page)).rejects.toThrow('summary must retain its original DOM node');
  });
}


test('width diagnostic owns only a contained clipped inactive arc', async ({ page }) => {
  await page.setViewportSize({ width:390, height:844 });
  await page.setContent(`<div class="creation-deck" data-mode="deck" style="position:relative;overflow:clip;width:350px;height:100px">
    <ol><li id="inactive" data-distance="1" style="position:absolute;left:-160px;width:300px;height:50px">neighbor</li>
    <li id="active" data-distance="0" style="position:absolute;left:0;width:300px;height:50px">active</li></ol></div>`);
  const owned = await diagnoseWidths(page);
  expect(owned.documentOverflowPx).toBe(0);
  expect(owned.unownedOverflowingElements).toEqual([]);
  expect(owned.ownedClippedDeckElements.some(e => e.selector === '#inactive')).toBe(true);
  await page.locator('#active').evaluate(element => element.style.left='-100px');
  expect((await diagnoseWidths(page)).unownedOverflowingElements.some(e => e.selector === '#active')).toBe(true);
  await page.locator('.creation-deck').evaluate(element => element.style.overflow='visible');
  expect((await diagnoseWidths(page)).unownedOverflowingElements.some(e => e.selector === '#inactive')).toBe(true);
});
