import { test, expect } from './fixtures';
import { verifyDeckSummaryRecovery } from './acceptance/deck-summary';
import { diagnoseWidths } from './acceptance/diagnostics';
import { probeSurface } from './acceptance/reflow';

test.beforeEach(async ({ page, context }) => {
  await context.route('**/*', r => new URL(r.request().url()).hostname === '127.0.0.1' ? r.continue() : r.abort());
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto('/articles/#start');
  await page.getByRole('button', { name: '円環で見る', exact: true }).click();
});

test('summary exception is earned through real expansion and list recovery, not shared with other clipping', async ({ page }) => {
  const verified = await verifyDeckSummaryRecovery(page);
  expect(verified.size).toBe(3);
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
