# Visual Layer v2 — active reflow and evidence contract

This is the single normative resolution of findings **VL-DES-01..07** for V0, retained V1, V2, V3, V4, shared components, and final acceptance. It supplements—not restyles—the Mint Atrium/Crafted Ceramic handoff. Product behavior and repository protections remain unchanged.

## VL-DES-01 — typography roles and measured enlargement

Each changed surface must record role → token → baseline computed size/line-height → changed computed size/line-height. Prefer rem/em text and unitless line-height; px borders/icons are valid, and px text alone is not declared non-conforming.

| Role | active decision | measurement |
|---|---|---|
| Reading body/title | preserve current article/Foundation roles | representative body and H1 before/after |
| Help/error/button/label | existing semantic token where equivalent; otherwise scoped `--v2-*` rem token | each changed surface; no name-only inference |
| New 14px metadata | scoped `.875rem` at a 16px baseline | record achieved size at 100/150/200 |
| Retained V1 START metadata | preserve accepted `.75rem` (12px baseline) | historical scoped exception; no global/root migration |

Root-text scaling is only evidence for roles whose computed size actually grows. Fixed-px or partially clamped text needs the explicitly named `synthetic-computed-text` method or real browser zoom. Snapshot all computed sizes before mutation; never multiply nested descendants from already changed values. Synthetic root/computed tests do not prove browser zoom, OS text sizing, a physical device, or blanket WCAG conformance.

## VL-DES-02 — semantic units wrap before prose is squeezed

DOM reading order and full labels/associations remain. Inline **or** stacked is valid when units do not overlap and use natural width. A nowrap date may remain one unit, but its row may wrap. `min-width:0` and `overflow-wrap:anywhere` alone do not excuse an ordinary label collapsed beside a peer.

Required transitions:

- **Home:** counter → privacy/help; validation and CTA follow in flow.
- **Project:** heading → status/details → actions; copy/saved/save-error notices and summaries get their own usable row when needed.
- **Tools:** count → help → reset/retry. **Guides:** stage → explanation → reset.
- **Compare:** candidate name/status → 44px remove within the same candidate group; criterion/value retains mobile criterion-first reading.
- **Articles:** category/label → date/verified date; source title/URL/disclosure may stack without hiding text.
- **Header/Footer:** retain logo, nav groups, skip link, menu order, and footer groups; wrap/stack groups rather than shrink copy.
- **Deck:** prev/count/next/list toggle/status stay in normal flow and wrap independently of cards.

Tests accept truly long labels wrapping within the available full row. They reject an ordinary label forced into an avoidably narrow column even when document overflow is zero.

## VL-DES-03 — content width, not viewport alone

Column decisions use the content box after frame borders, nested padding, and gaps. One readable column is the safe fallback; `minmax(0,1fr)` is not proof. Preserve desktop composition when it fits rather than flattening all widths.

Normal checkpoints are 320/375/390/1440. A slice tests only its real transition neighbors (candidate pairs 599/600, 680/681, 900/901, 1023/1024). Text enlargement is independent of viewport width. Reduce duplicated ornament/padding before text size; Home cues must not steal input width, Project task/workspace and Tools details fall to one column when their measured content does not fit.

## VL-DES-04 — natural height and unobscured interaction

44px targets and 48px primary controls are minimums, never clipping heights. Buttons, errors, summaries, validation, and notifications grow naturally. Home first-view CTA is judged only at normal initial rendering; enlarged/expanded/error/short-height states may scroll vertically.

Project sticky clarify actions must switch to normal flow or demonstrate an unobscured usable area when long content or focus would be covered. Tests scroll to and focus actual controls, not only inspect outline CSS. If Header height changes, menu position and anchor offsets use the same measured geometry; no transform/filter/perspective belongs on global ancestors. Short-height emulation is not soft-keyboard or physical-device evidence.

## VL-DES-05 — human text versus owned code/table regions

Project names, prose, status/error text, provider/source titles, URLs, and filenames remain readable within their semantic surface. Emergency `overflow-wrap:anywhere` is local to unbroken tokens; never apply page-wide `break-all` or hidden overflow.

Formatting-sensitive code and semantic 2D tables keep an explicit local scroll owner (`data-acceptance-scroll-owner="true"` or the established code/table selectors). The exception never expands to an entire reading/working panel, and `diagnoseWidths` must not be weakened. Compare preserves criterion-first mobile and semantic desktop table behavior. Article TOC/affiliate portal direct-child assumptions, source/rel/Project attribution, and Project state remain intact. Stress content uses disposable DOM/fixtures, not published data.

## VL-DES-06 — dynamic Creation Deck and focus-safe fallback

V4 enhances START only after V2/V3. SSR contains the original ordered links, one anchor per card, with full title/meta/description; never clone links, autoplay, or capture global keyboard input.

Measure natural untransformed content at current width after initial font load or failure and after root/computed text, spacing, content, or container-width changes. Prefer CSS natural height. Any ResizeObserver must avoid write-back loops; no polling/permanent rAF. Height growth is allowed. If content or controls become unreadable/unobscured—or measurement/init fails—use the same static list even above 340px.

Automatic enhancement requires demonstrably non-regressed CLS and accessible SSR links; otherwise expose explicit `円環で見る`. Never hide content until hydration. Static fallback applies for JS-off, reduced motion, forced colors, <=340px, or failure. Manual list choice persists. During forced fallback, move focus to the active article only when focus was inside disappearing controls; never steal focus elsewhere. Preserve link activation, vertical scroll, pinch, one gesture/one article, cancellation, and drag-only click suppression. Reuse outside START is optional/deferred, not scope.

## VL-DES-07 — executable, classified evidence

Methods are distinct: `viewport-reflow`, `synthetic-root-text`, `synthetic-computed-text`, `text-spacing`, `browser-zoom`, `cdp-pinch`, `os-text`, and `physical-device`. CDP pinch/DPR never substitutes for text enlargement. There is no 160px viewport requirement.

Representative affected states cover 100/150/200, narrow 320/375 root/computed cases, independent spacing, long content, one risk-selected long+enlarged case, and relevant short-height/transitions—not a Cartesian product. Spacing overrides independently record applicable line-height 1.5, paragraph spacing 2em, letter spacing .12em, and word spacing .16em with language applicability.

Pass requires: nonzero expected matches; no document/unowned overflow; visible unclipped text; natural allocation; inline-or-stacked nonoverlap; applicable minimum targets; order/associations; reachable and visible focus; and correct local scroll ownership. Missing selectors fail loudly. Screenshots and independent inspection remain required for visual acceptance; test machinery is not a visual verdict.

## Evidence and gate semantics

`TEST-MATRIX.json` separates design coverage from final execution. `PLANNED` proves only an owned contract. `VERIFIED` requires attached evidence at the exact SHA. The design validator checks IDs, findings, phases, selectors, methods, owners, and statuses; the final validator rejects required `PLANNED`/`IMPLEMENTED` cases. Production remains `OWNER-DEFERRED / UNTESTED`, never counted as final local PASS.
