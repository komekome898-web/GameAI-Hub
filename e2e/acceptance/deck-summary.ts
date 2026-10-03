import { expect, type Page } from '@playwright/test';
import { applyTextMethod, type TextMethod, type TextRole } from './reflow';

/** rAF motion is invisible to getAnimations(); also wait for intrinsic height. */
export async function waitForSettledDeck(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator('#start .creation-deck').evaluate(async root => {
    const stage = root.querySelector<HTMLElement>('ol');
    if (!stage) return false;
    const stable = () => root.getAttribute('data-mode') !== 'deck' ||
      (stage.dataset.motion === 'idle' && stage.dataset.motionRaf === '0' &&
       stage.dataset.motionPos === stage.dataset.motionTarget && Number.isInteger(Number(stage.dataset.motionPos)) &&
       stage.clientHeight >= Math.max(...[...stage.children].map(c => (c as HTMLElement).scrollHeight), 0));
    if (!stable()) return false;
    const before = stage.getBoundingClientRect();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const after = stage.getBoundingClientRect();
    return stable() && ['x', 'y', 'width', 'height'].every(k => Math.abs(before[k as 'x'] - after[k as 'x']) < .5);
  })).toBe(true);
}

/** A node earns the collapsed-summary exception only by demonstrating recovery. */
export async function verifyDeckSummaryRecovery(page: Page, text?: { roles: TextRole[]; method: TextMethod; factor: number }): Promise<Set<string>> {
  const deck = page.locator('#start .creation-deck');
  for (const card of await deck.locator('ol > li').all()) await expect(card.locator('p.v2-start-card-description')).toHaveCount(1);
  if (await deck.getAttribute('data-mode') !== 'deck') return new Set();
  const apply = () => text ? applyTextMethod(page, text.roles, text.method, text.factor) : Promise.resolve({ restore: async () => {} });
  let scale = await apply();
  await waitForSettledDeck(page);
  if (await deck.getAttribute('data-mode') !== 'deck') { await scale.restore(); return new Set(); }
  const originalId = await deck.locator('li[data-distance="0"]').getAttribute('data-deck-id');
  const candidates = await deck.locator('li').evaluateAll(cards => cards.flatMap((card, index) => {
    const summary = card.querySelector<HTMLElement>('p.v2-start-card-description[data-expanded="false"]');
    return summary ? [{ index, id: summary.id, selector: `#${CSS.escape(summary.id)}`, text: summary.textContent ?? '' }] : [];
  }));
  // Keep the original DOM objects: an identical ID/text on a replacement is not recovery.
  const originalSummaries = await deck.locator('li p.v2-start-card-description').elementHandles();
  try {
  const assertFull = async (index: number, text: string, id: string) => {
    const summary = deck.locator('li').nth(index).locator('p.v2-start-card-description');
    expect(await summary.evaluate((current, original) => current === original, originalSummaries[index]), 'summary must retain its original DOM node').toBe(true);
    await expect(summary).toHaveAttribute('id', id);
    await expect(summary).toHaveText(text);
    await expect(summary).toBeVisible();
    expect(await summary.evaluate(e => e.scrollWidth <= e.clientWidth + 1 && e.scrollHeight <= e.clientHeight + 1)).toBe(true);
  };
  for (const c of candidates) {
    expect(c.id).not.toBe('');
    expect(await page.evaluate(id => [...document.querySelectorAll('[id]')].filter(e => e.id === id).length, c.id)).toBe(1);
    const summary = deck.locator('li').nth(c.index).locator('p.v2-start-card-description');
    expect(await summary.evaluate(e => {
      const style = getComputedStyle(e), line = Number.parseFloat(style.lineHeight);
      return style.webkitLineClamp === '3' && Number.isFinite(line) &&
        e.clientHeight >= Math.min(e.scrollHeight, line * 3) - 1;
    })).toBe(true);
    const button = deck.locator('li').nth(c.index).locator('button.v2-start-card-expand');
    await expect(button).toHaveCount(1);
    await expect(button).toHaveAttribute('aria-controls', c.id);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeEnabled();
    await button.focus(); await expect(button).toBeFocused();
    await waitForSettledDeck(page);
    await expect(button).toBeVisible();
    await button.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await waitForSettledDeck(page);
    await assertFull(c.index, c.text, c.id);
  }
  if (!candidates.length) { await scale.restore(); return new Set(); }
  await scale.restore();
  await deck.getByRole('button', { name: '一覧で見る', exact: true }).click();
  await expect(deck).toHaveAttribute('data-mode', 'list');
  scale = await apply();
  await waitForSettledDeck(page);
  for (const c of candidates) await assertFull(c.index, c.text, c.id);
  await scale.restore();
  await deck.getByRole('button', { name: '円環で見る', exact: true }).click();
  await expect(deck).toHaveAttribute('data-mode', 'deck');
  for (const c of candidates) {
    const button = deck.locator('li').nth(c.index).locator('button.v2-start-card-expand');
    await button.focus(); await button.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(deck.locator('li').nth(c.index).locator('p.v2-start-card-description')).toHaveAttribute('data-expanded', 'false');
  }
  const original = deck.locator('ol > li');
  const index = await original.evaluateAll((cards, id) => cards.findIndex(c => (c as HTMLElement).dataset.deckId === id), originalId);
  expect(index).toBeGreaterThanOrEqual(0);
  await original.nth(index).locator('a').focus();
  await waitForSettledDeck(page);
  return new Set(candidates.map(c => c.selector));
  } finally {
    await Promise.all(originalSummaries.map(node => node.dispose()));
  }
}
