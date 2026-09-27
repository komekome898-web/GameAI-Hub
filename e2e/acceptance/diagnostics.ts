import type { Page } from "@playwright/test";

export type WidthDiagnostic = {
  viewportWidth: number;
  documentScrollWidth: number;
  documentOverflowPx: number;
  ownedLocalScrollers: Array<{ selector: string; clientWidth: number; scrollWidth: number }>;
  unownedOverflowingElements: Array<{ selector: string; left: number; right: number; width: number }>;
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
    const unowned: Array<{ selector: string; left: number; right: number; width: number }> = [];
    for (const element of document.body.querySelectorAll<HTMLElement>("*")) {
      const rect = element.getBoundingClientRect();
      if (rect.width <= viewportWidth && rect.left >= -0.5 && rect.right <= viewportWidth + 0.5) continue;
      const owner = ownsScroller(element);
      if (owner) {
        if (owner.scrollWidth > owner.clientWidth && !owned.has(owner))
          owned.set(owner, { selector: selectorFor(owner), clientWidth: owner.clientWidth, scrollWidth: owner.scrollWidth });
        continue;
      }
      if (rect.width > 0 && rect.height > 0)
        unowned.push({ selector: selectorFor(element), left: rect.left, right: rect.right, width: rect.width });
    }
    return {
      viewportWidth,
      documentScrollWidth: root.scrollWidth,
      documentOverflowPx: Math.max(0, root.scrollWidth - viewportWidth),
      ownedLocalScrollers: [...owned.values()],
      unownedOverflowingElements: unowned.slice(0, 30),
    };
  });
}
