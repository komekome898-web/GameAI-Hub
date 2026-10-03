> Historical contract: the owner-approved [inertia design2.0](../../design/creation-deck-inertia.md) supersedes the no-free-inertia/one-card release rules below.

# Continuous START article deck — adopted design 1.2

Implementation on `fix/deck-project-continuity`, continuing draft PR #162 from
`ca272aa12cb9022c2730cd01e6c229ff9e41ce5a`. Main remains
`cd97360383a84b2f220dcc22343035d990f7503b`. Parent/coordinator independent review
is pending; this is implementer evidence, not physical-device acceptance.

## Authority and scope

The owner adopted Library `libfile_76f8a2e6f8108191a0f4da92d6885f1d`, version 3,
`GAMEAIHUB_モバイル循環記事デッキ設計_2026-10-02.docx`, design 1.2. All 12 pages
were read as the complete Library text in the preceding turn. DOCX local transfer
failed twice; the owner explicitly allowed implementation from the retrieved
text. No claim that the original DOCX was downloaded is made.

Aramon was inspected at `komekome898-web/aramon`
`3f3b10822088fc5d4e7a74cf75e9f6586c72960a`: `ui.js:127–356` (circular shared
position) and `style.css:53,3821` (input/scroll behavior). The shared fractional
ring-position principle informed this implementation. Its per-frame `.22`
interpolation, global scroll lock, and cancel-as-release behavior were not adopted.

Only START deck behavior, its card presentation, slug identity adapter and
relevant regressions change. Existing Stack→Project and article→Project→Tools/
Compare repairs remain in the branch and pass their original journey regressions.
No category migration, naming change, article rewrite, asset replacement,
Project schema change, dependency or workflow change.

## Implementation

- `lib/creation-deck-motion.ts`: shortest signed circular distance, pose, recent
  velocity, nearest-card release with short-flick assistance, and time-based snap.
- `components/useCreationDeckMotion.ts`: one rAF clock; mutable position/contact
  data outside React state; all cards render from one fractional position. Only
  settled identity updates React/live status. Width is cached by ResizeObserver.
- `components/CreationDeck.tsx` and scoped CSS: natural-height cards; one stable
  slug-keyed link per article; summary is a sibling, with three-line deck clamp
  and accessible expansion on the same node; full summary in list mode. Subgrid
  preserves a focusable single anchor while placing the separate summary/button
  visually between title and CTA. No cloned cards or per-frame React rendering.
- The route adapter passes the article slug as identity. Reorder, changed href,
  deletion and 0/1/2-item fallback are tested without introducing category data.

Release uses an 80ms sample window, a 100ms stale-motion cutoff, and assistance
above .45 cards/s only when rounding has not already moved to another card.
A 2.2-card drag settles two cards away. Snap uses `1-exp(-dt/70)` and stops
exactly at target within .004 cards. Cancellation returns to the last committed
article, never applies flick velocity. Subsequent contact can interrupt snap
without rounding the displayed position. Button repeats accumulate target steps.

## Local verification

Local production build; Chromium 151.0.7922.173 with Playwright mobile contexts,
trusted CDP touch input and native mouse/keyboard. Browser requests are restricted
to loopback in the new/continuity tests; analytics exclusion is enabled. Older
focused regressions use the repository analytics-blocking fixture. No Production
or Preview pages were opened.

- `npm run quality`: 336 Vitest + 76 Python tests, lint, typecheck, data/content/
  affiliate/sitemap/workflow validators pass.
- `npm run build`: pass.
- Focused browser suite: 17 passing tests in `browser-checks.json`, plus two
  existing JS-disabled/forced-color and long-Japanese/ASCII tests. Full historical
  acceptance was not rerun.
- Motion cases: every card follows ±20/60/120px movement; ±32px short flick;
  24px motion then 150ms hold does not flick; 2.2-card drag; 60 settled advances
  (20 complete loops); repeat buttons; snap interruption; neighbor tap centers;
  regular active tap opens; cancellation, second contact, resize and capture loss;
  keyboard focus; list/session/reduced-motion/forced-color fallbacks; expansion;
  image failure; 320px synthetic 200% root text; existing Project journeys.
- Visibility interruption is a synthetic visibility notification. Capture-loss
  testing explicitly releases a real captured pointer. These are distinct from
  physical OS tab switching. Unit tests establish 60/120Hz mathematical agreement,
  item identity preservation and cancellation of the sole rAF on unmount.
- Evidence readiness requires `data-motion=idle`, pending rAF=0, position=target,
  fonts ready, stable geometry across frames and expected viewport scale. CSS
  `getAnimations()` alone is insufficient for this rAF implementation.

`card-1/2/3-375.png`, `deck-375/390.png`, `expanded-390.png`, `list-320.png`,
`list-desktop.png` and `geometry.json` show settled presentation. Image subjects,
formal titles, summary/CTA, and compact 44px controls were inspected. Additional
failure/enlargement and Project captures are retained alongside them. Existing
historical screenshots/matrix statuses were not overwritten. Old test selectors,
status location, gesture-state assertions and 3:2 image expectation were migrated
to the adopted structure/2:1 ratio; behavior assertions were retained.

## Remaining acceptance

Physical iPhone SE3/iOS Safari and Brave gesture feel, OS text zoom, real pinch,
VoiceOver and real 120Hz display behavior are **UNTESTED**. Chromium emulation
and formula tests are not substitutes. The prior WebKit installation attempt
was blocked by HTTP 403 from supported mirrors; it was not retried or bypassed.
Independent exact-head review and owner merge approval remain separate. No merge,
auto-merge, deployment command, legacy Work dispatch or account change occurred.

## Subsequent owner-approved adjustment

The conditions above describe the original design1.2 implementation. After an
owner-reported Safari acceptance failure, the owner authorized the narrow
[sparse-input adjustment](../creation-deck-sparse-input/README.md). It replaces
16ms minimum sample eligibility and the asymmetric initial direction rule,
and limits unnecessary resize/active-publication cancellation. This is a new
approved condition, not retrospective conformance or physical Safari PASS.
