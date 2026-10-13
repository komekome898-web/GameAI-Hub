"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diagnoseWidths = diagnoseWidths;
async function diagnoseWidths(page) {
    return page.evaluate(() => {
        const root = document.documentElement;
        const viewportWidth = root.clientWidth;
        const selectorFor = (element) => {
            if (element.id)
                return `#${CSS.escape(element.id)}`;
            const classes = [...element.classList].slice(0, 2).map((name) => `.${CSS.escape(name)}`).join("");
            return `${element.tagName.toLowerCase()}${classes}`;
        };
        const ownsScroller = (element) => {
            const owner = element.closest('[data-acceptance-scroll-owner="true"], pre, .table-scroll, .article-decision-table, .code-block');
            if (!owner)
                return null;
            const style = getComputedStyle(owner);
            return /(auto|scroll)/.test(`${style.overflowX} ${style.overflow}`) ? owner : null;
        };
        const owned = new Map();
        const clipped = [];
        const unowned = [];
        for (const element of document.body.querySelectorAll("*")) {
            const rect = element.getBoundingClientRect();
            if (rect.width <= viewportWidth && rect.left >= -0.5 && rect.right <= viewportWidth + 0.5)
                continue;
            const owner = ownsScroller(element);
            if (owner) {
                if (owner.scrollWidth > owner.clientWidth && !owned.has(owner))
                    owned.set(owner, { selector: selectorFor(owner), clientWidth: owner.clientWidth, scrollWidth: owner.scrollWidth });
                continue;
            }
            if (rect.width > 0 && rect.height > 0) {
                const creationCard = element.closest(".creation-deck[data-mode='deck'] li[data-distance]");
                const showcaseCard = element.closest(".b3-showcase[data-mode='deck'] .b3-stage-window li[data-distance]");
                const card = creationCard ?? showcaseCard;
                // Match the boundary to its card family; a nested unrelated boundary
                // must never lend ownership to an otherwise overflowing card.
                const deck = creationCard
                    ? creationCard.closest(".creation-deck")
                    : showcaseCard?.closest(".b3-stage-window");
                const deckRect = deck?.getBoundingClientRect();
                const clips = deck && /^(clip|hidden)$/.test(getComputedStyle(deck).overflowX);
                // Only the inactive arc has intentional travel outside the viewport.
                // The clip boundary must itself fit; active cards and unrelated content
                // always remain part of the strict document-width diagnostic.
                if (card && Number.isFinite(Number(card.dataset.distance)) && Number(card.dataset.distance) !== 0 &&
                    clips && deckRect && deckRect.left >= -.5 && deckRect.right <= viewportWidth + .5) {
                    clipped.push({ selector: selectorFor(element), owner: selectorFor(deck) });
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
