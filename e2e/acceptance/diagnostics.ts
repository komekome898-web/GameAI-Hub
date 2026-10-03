import type { Page } from "@playwright/test";

export type WidthDiagnostic = {
  viewportWidth: number;
  documentScrollWidth: number;
  documentOverflowPx: number;
  ownedClippedDeckElements: Array<{ selector: string; owner: string }>;
  ownedLocalScrollers: Array<{ selector: string; clientWidth: number; scrollWidth: number }>;
  unownedOverflowingElements: Array<{ selector: string; left: number; right: number; width: number; exceptionOwner?: "creation-deck-inactive-card" }>;
};

export async function diagnoseWidths(page: Page): Promise<WidthDiagnostic> {
  return page.evaluate(() => {
    const root = document.documentElement;
    const viewportWidth = root.clientWidth;
    const selectorFor = (element: Element) => {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const classes = [...element.classList].slice(0, 2).map((name) => `.${CSS.escape(name)}`).join("");
      return `${element.tagName.toLowerCase()}${classes}`;
    };
    const ownsScroller = (element: Element) => {
      const owner = element.closest<HTMLElement>(
        '[data-acceptance-scroll-owner="true"], pre, .table-scroll, .article-decision-table, .code-block',
      );
      if (!owner) return null;
      const style = getComputedStyle(owner);
      return /(auto|scroll)/.test(`${style.overflowX} ${style.overflow}`) ? owner : null;
    };
    const owned = new Map<Element, { selector: string; clientWidth: number; scrollWidth: number }>();
    const clipped: Array<{ selector: string; owner: string }> = [];
    const unowned: Array<{ selector: string; left: number; right: number; width: number; exceptionOwner?: "creation-deck-inactive-card" }> = [];
    for (const element of document.body.querySelectorAll<HTMLElement>("*")) {
      const rect = element.getBoundingClientRect();
      if (rect.width <= viewportWidth && rect.left >= -0.5 && rect.right <= viewportWidth + 0.5) continue;
      const owner = ownsScroller(element);
      if (owner) {
        if (owner.scrollWidth > owner.clientWidth && !owned.has(owner))
          owned.set(owner, { selector: selectorFor(owner), clientWidth: owner.clientWidth, scrollWidth: owner.scrollWidth });
        continue;
      }
      if (rect.width > 0 && rect.height > 0) {
        const card = element.closest<HTMLElement>(".creation-deck[data-mode='deck'] li[data-distance]");
        const deck = card?.closest<HTMLElement>(".creation-deck");
        const deckRect = deck?.getBoundingClientRect();
        const clips = deck && /^(clip|hidden)$/.test(getComputedStyle(deck).overflowX);
        // Only the inactive arc has intentional travel outside the viewport.
        // The clip boundary must itself fit; active cards and unrelated content
        // always remain part of the strict document-width diagnostic.
        if (card && Number.isFinite(Number(card.dataset.distance)) && Number(card.dataset.distance) !== 0 &&
          clips && deckRect && deckRect.left >= -.5 && deckRect.right <= viewportWidth + .5) {
          clipped.push({ selector: selectorFor(element), owner: selectorFor(deck!) });
          continue;
        }
        const exceptionOwner = undefined;
        unowned.push({ selector: selectorFor(element), left: rect.left, right: rect.right, width: rect.width, exceptionOwner });
      }
    }
    return {
      viewportWidth,
      documentScrollWidth: root.scrollWidth,
      documentOverflowPx: Math.max(0, root.scrollWidth - viewportWidth),
      ownedClippedDeckElements: clipped,
      ownedLocalScrollers: [...owned.values()],
      unownedOverflowingElements: unowned.slice(0, 30),
    };
  });
}
