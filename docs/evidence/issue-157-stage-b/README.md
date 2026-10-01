# Issue #157 Stage B local evidence

Captured from the current local production build with Chromium through `e2e/issue-157-stage-b.spec.ts`.

Tested lineage checkpoint: `e4c769d1af2e27a3738ca1204dcebf9932330c20` plus the current focus/fixture/fragment-readiness diff. The SHA-256 of the ordered Git blob IDs for `CreationDeck.tsx`, `ArticleReadingGuide.tsx`, `visual-layer-v2.css`, the Stage B E2E, and the Deck component test is `14bec13ad2cd9e0aaf309e023c91e463c356650919969d36ffad0cb6f769da80`.

- Representative full-page captures: Home, Project input, Tools, Compare, and Articles at 390 and 1440 CSS px.
- Automated responsive checks additionally ran at 320 and 375 CSS px.
- START retains three SSR links and defaults to the static list. The explicit `円環で見る` control enables the same DOM list; 320px, reduced-motion, and forced-colors remain flat.
- ElevenLabs v4, privacy, methodology, and affiliate-disclosure routes were included in the route smoke.
- The Deck stability regression samples the stage and following-section geometry eight times at 100ms intervals. The last four samples must stay within 1 CSS px after idle, next/previous, focus reveal, a 600px resize, synthetic 150% root text, independent letter/word spacing, `document.fonts.ready`, and restoration to 390px. The checkpoint passed every bounded sample; unlike the prior implementation, measurement reads each top-positioned card's untransformed `scrollHeight`, verifies the settled stage contains the tallest content, caps runaway stage growth, and ignores redundant height updates.
- Focused application checks cover control-local ArrowLeft navigation, immediate focused-card reveal, blocked `sessionStorage`, stored-mode restoration, narrow fallback, and the normal next control. Current application checks additionally force a focused previous/next/toggle control through <=340px, reduced-motion, and forced-colors fallbacks and verify focus moves to the active visible article, while article and unrelated-input focus remain untouched. Disposable component fixtures cover 0/1/2/3/5 items, unique anchors, and the two-item flat behavior. Pointer ownership/cancellation and active-card threshold are implemented in the component; exhaustive browser multi-pointer/pinch fixtures remain part of the uncompleted matrix boundary below.
- `article-breadcrumb-375.png` is a current application capture. Its short ancestor crumbs remain coherent one-line units while the long current title owns wrapping; the browser assertion checks the `ホーム` text range has one rendered line.
- Current captures are persisted under `docs/screenshots/issue-157-stage-b/`, an existing CI-uploaded artifact root. These are local Chromium/emulation observations, not physical-device, genuine browser-zoom, protected Preview, or Production acceptance.
- The matrix records Stage B cases as `IMPLEMENTED`, not `VERIFIED`: the current capture set does not substantiate every declared dynamic Project/directory/Compare variant or every 150/200 role measurement. Final-execution validation must continue to reject those cases until same-observation records exist.

## Final gate status at this checkpoint

- `npm run quality` passed (42 files / 311 Vitest tests and repository validators), and `npm run build` generated 71 static pages.
- The full local E2E attempt produced 125/128 on its first pass. All three failures (an analytics harness connection reset, the Stage B route-smoke timeout under concurrent load, and a missing injected Slice 1 fixture) passed together on focused rerun; the Stage B route smoke now has a 90-second integrated-suite allowance.
- This package does **not** claim the all-phase final-execution gate. Dynamic same-observation matrix evidence, exhaustive browser multi-pointer/pinch interruption coverage, and the final integrated independent review remain open. Production remains `UNTESTED / OWNER-DEFERRED`.
- The observed TOC retry was treated as an initial-fragment readiness race: fragment reconciliation now also runs after fonts and known article images settle. The exact focused TOC case passed 10/10 bounded local repetitions after the test was corrected to use a true new-document initial-fragment navigation without weakening its sticky-safe y assertion.

## Typed V2 application evidence continuation

`docs/screenshots/issue-157-stage-b/v2/manifest.json` is the first typed Stage B
application manifest. The Playwright emitter records current Home initial,
validation, counter/privacy, expanded-example, maximum-input, 100/150/200 text,
and four independent spacing observations. Each record contains matched roles,
baseline/changed font size and line height, route/state/variant/method/viewport,
actual diagnostics, and a current screenshot. The manifest identifies an exact
clean Git source checkpoint and refuses source-tree changes that are not part
of that checkpoint.

The ten-record V2 Home subset gate passes. Project V2, V3, the remaining V1/V4 cases, and
the final reconciliation are not covered by that subset and remain non-final.

## Current Project evidence

The executable Project package is retained at `docs/screenshots/issue-157-stage-b/v2-project/`. Its manifest contains 16 accepted records for the three declared Project cases and pins clean source checkpoint `af9b59950ccc089e7ef58e44c27bc7876ac5fca6`. The associated images are local Chromium responsive/synthetic-text observations, not Preview, Production, genuine browser zoom, OS scaling, or physical-device evidence.

Current V1 observations are written separately to `docs/screenshots/issue-157-stage-b/v1-current/`. The historical `docs/evidence/issue-157-stage-a/` package is not regenerated by current-tree execution.

## Consolidated completed-runtime checkpoint

Current runtime checkpoint `980914986cee455d4a351c37e1893238f4f5aef4` completed the remaining V4 fail-safe path and the bounded CI repairs. Deck enhancement now requires successful intrinsic card measurement and a second, pre-paint control-fit measurement; failed initialization, unusable cards, or overflowing controls retain the same ordered list even above 340px. Horizontal drag feedback is animation-frame bounded and all cancellation paths remove its transient transform.

The consolidated local run passed `npm run quality` (42 files / 313 Vitest tests) and `npm run build` (71 pages). Its first full E2E attempt reached 130/132 before two timing-sensitive tests failed; both were corrected without weakening their outcomes and passed 3/3 repetitions (6/6 total). A subsequent full-suite attempt stopped at the pre-existing analytics fixture-load race (`__gaFixtureLoads` remained undefined); this run therefore is not reported as a clean full-suite PASS. The issue-specific Home/Project/V1/Deck/reading suite passed 8/8 and refreshed the current evidence tree.

Independent rendered review found no P0/P1 across sampled normal/stress Home, Project, Deck, reading, Compare, and Tools captures. Its high-impact P2 about measuring controls only after they appeared was corrected with the two-stage control-fit gate and a dedicated overflowing-control regression. Production, protected Preview interaction, genuine browser zoom, OS scaling, and physical devices remain `UNTESTED / OWNER-DEFERRED`.

At that completed-runtime checkpoint, implementation and acceptance were deliberately separate: runtime omissions were **NONE**, while typed V3, remaining V1/V4, and final reconciliation were still unexecuted. The later final package below supersedes only that acceptance boundary; missing evidence was never described as missing screen implementation.

## Final integrated package

The final local package is under `docs/screenshots/issue-157-stage-b/final/`. `manifest.json` combines 115 typed observations and records a passing final-execution gate at clean source checkpoint `76ce5e5c02437036c3b9b1bac9c2256ec7faf19a`. It includes current V3 route/state/text observations, V4 dynamic/input/focus/count/budget observations, current V1 long-content focus evidence, and final cross-route reconciliation. The package is local Chromium evidence only; Production, protected Preview interaction, physical devices, genuine browser zoom, and OS scaling remain untested/owner-deferred.
