# Issue 157 — Visual Layer v2 all-phase contract progress

## Identity and remote lineage

- Issue: #157
- Stage: A correction — complete and pushed to draft PR #158; awaiting commander re-verification
- Branch: `codex/issue-157-visual-layer-v2-complete`
- Base: `f26f8d22c3be876878a4c6e0c691dec5d446deff`
- First verified remote checkpoint: `187c0ee45cf943029f0bca86e27aab1678231f92`
- Prior Stage A head: `0e7f32940c4cae167b75bc424704240b4c4d67f6`
- Runtime boundary: documentation and test infrastructure only; V2–V4 runtime implementation has not started.

Canonical fetch/push origin, authenticated repository access, `origin/main`, resumed branch/PR lineage, and the remote write path were verified before substantial work.

## Stage A correction delivered

- VL-A-01: matrix v2 binds explicit variants to declared route matchers and DOM/static surfaces; typed same-record observation bindings prevent case-ID, route, surface, variant, factor, or viewport substitution.
- VL-A-02: PASS requires nonempty finite achieved role measurements within tolerance; computed/root failures and pinch substitution remain non-PASS. Font size and line-height are recorded before/after.
- VL-A-03: semantic-row natural width is measured in the scoped parent, lines are grouped geometrically across inline fragments, and both peers are bounded with inline-or-stacked separation.
- VL-A-04: bounded keyboard focus distinguishes reachability from a focus-specific visual change; unchanged ornamental shadows return unverified.
- `e2e/stage-a-evidence.spec.ts` emits actual current screenshots and machine-readable evidence under `docs/evidence/issue-157-stage-a/`. The metadata 100/150/200 subset passes; long-content is honestly retained as PENDING and outside the accepted subset.
- Historical V1 captures are not rewritten by default. V0/static reconciliation and owner-deferred Production do not claim measured DOM selectors. V2/V3/V4/final remain PLANNED.

## Validation

- Targeted Vitest: 8/8 passed.
- Targeted Playwright contract/emitter/V1: 14/14 passed; historical screenshot blob preserved.
- `npm run quality`: passed, 41 Vitest files / 306 tests plus repository validators.
- `npm run build`: passed, 71 static pages.
- Final evidence worktree hash recomputation: exact match.
- Independent adversarial review: no remaining P0/P1/high-impact P2 after fixes and retest; record at `docs/evidence/issue-157-stage-a/INDEPENDENT-REVIEW.md`.

## Preserved boundary and next action

No application runtime, product data, public/reference/handoff assets, dependencies, analytics, Production state, or historical V1 screenshots changed. Production remains `UNTESTED / OWNER-DEFERRED`; no Production navigation occurred.

GitHub checks, E2E, observe, and Vercel exact-head status passed for the corrected pushed head. Next action: await commander Stage A re-verification. Do not begin Stage B before that decision.

## Stage B implementation checkpoint

- Stage A was accepted by the commander at `adb677eefebb595e136f557e25a66ae2f2853ba1`; bootstrap reverified canonical fetch/push origin, `origin/main=f26f8d22c3be876878a4c6e0c691dec5d446deff`, authentication, and the same remote branch/PR.
- V2: Home and Project now opt into the shared Mint Atrium canvas and scoped Crafted Ceramic working planes with natural-height controls and narrow single-column fallbacks.
- V3: shared canvas/chrome, directory, Compare, article/trust/detail surfaces receive scoped opaque/reflow treatment; content, routes, data, affiliate/SEO behavior and ElevenLabs v4 placement remain unchanged.
- V4: START uses a client island over the same SSR ordered list. Enhancement is explicit (avoiding hydration CLS), with previous/next/list controls and flat fallbacks for <=340px, reduced motion and forced colors.
- Local Stage B evidence is under `docs/evidence/issue-157-stage-b/`; the focused Playwright gate passed 3/3 and captured current 390/1440 routes.
- Honest remaining acceptance boundary: matrix implementation cases are `IMPLEMENTED`, not `VERIFIED`, because all declared dynamic variants and same-observation 150/200 role records were not emitted. Production and physical-device acceptance remain `UNTESTED / OWNER-DEFERRED`.

## Stage B correction checkpoint

- Runtime/test checkpoint `02d1dfbad58d20a5c2425239f6851c03ea6c9271` removes the Deck height feedback cycle: absolute cards are no longer bottom-constrained, the observer reads intrinsic width-correct card bounds, unchanged height does not schedule state, and resize/font listeners clean up.
- Deck controls now own Left/Right keys locally; focused cards reveal without transition; storage failures preserve in-memory operation; pointer ownership, second-pointer/cancel/lost-capture/resize/visibility interruption, active-card thresholds, and task-bounded click suppression are implemented.
- The Stage B E2E uses the shared analytics-blocking fixture and samples stable stage/following-section geometry across idle, controls, focus, width, 150% root text, spacing, font settlement, and restoration. It also covers blocked storage and the corrected 375px article breadcrumb.
- Local technical gates: focused Stage B 4/4; quality 41 files / 306 tests; build 71 pages. Full E2E first pass was 125/128, with all three concurrency/environment-sensitive failures passing together on focused rerun.
- Remaining exact boundary: exhaustive 0/1/2/>3 disposable Deck fixtures, every dynamic state/role-bound 150/200 matrix observation, final-execution validation, and complete integrated independent review are not yet substantiated. Do not mark final acceptance complete or Production tested.

## Stage B application-acceptance continuation

- Resumed exact remote head `e4c769d1af2e27a3738ca1204dcebf9932330c20` after re-verifying canonical fetch/push origin, authenticated API access, `origin/main=f26f8d22c3be876878a4c6e0c691dec5d446deff`, branch lineage, and a dry-run push.
- VL-V4-DECK-FOCUS now has actual-component browser coverage for focused previous/next/toggle controls entering <=340px, reduced motion, and forced colors. Focus transfers to the active visible article despite CSS hiding controls before the media callback; article or unrelated-input focus is not stolen.
- VL-V4-DECK-COUNTS now has disposable component coverage for 0/1/2/3/5 items, one unique anchor per item, and list-only two-item behavior. This does not manufacture or alter published article data.
- The current Stage B spec writes captures to `docs/screenshots/issue-157-stage-b/`, which is included by the existing CI artifact contract. The legacy committed evidence README remains the provenance/limits record.
- The TOC initial-fragment readiness path now reconciles after fonts and known article images settle. The unchanged sticky-safe focused case passed 10/10 bounded local repetitions after its setup was corrected to use a true new-document initial-fragment navigation rather than a same-document hash transition.
- Completed in this continuation: the focus variants `controls-focused`, `article-focused`, and `other-input-focused`, plus count variants `zero`, `one`, `two`, `three`, and `more-than-three`. `manual-list-preference` remains covered by the existing Stage B restoration test.
- Still incomplete: VL-V1-LONG-CONTENT current focus evidence; the V2/V3 dynamic state observations and same-observation role-bound 150/200 records; exhaustive VL-V4-DECK-INPUT multi-pointer/pinch/cancel/click-follow-up browser fixtures; typed Stage B manifests for each phase; VL-FINAL-CROSS-ROUTE; and VL-FINAL-RECONCILE. Matrix cases therefore remain `IMPLEMENTED`/`PLANNED`; final acceptance is not claimed.

## Evidence-first continuation from `56ade211`

- Added the first typed Stage B application emitter at
  `e2e/issue-157-reflow-evidence.spec.ts`. Its V2 Home subset has ten actual
  records covering `VL-V2-HOME-INITIAL` and all four `VL-V2-HOME-META`
  variants, including bound 100/150/200 measurements and four independent
  spacing methods. Output is retained under the CI-uploaded
  `docs/screenshots/issue-157-stage-b/v2/` path.
- Actual measurement exposed that Home hid the privacy explanation at the
  narrow breakpoint. The explanation is now retained and stacks with the
  counter; the semantic-row probe passes at 320px.
- Fragment reconciliation now cancels every timer, animation frame, interval,
  and delayed font/media callback on wheel/touch/key/pointer intent. A later
  explicit hash navigation starts a new bounded, cancellable cycle.
- This checkpoint does **not** complete Project V2, V3, remaining V1/V4, or
  final reconciliation. Those case IDs remain outstanding and Production,
  protected Preview interaction, genuine browser zoom, OS scaling, and
  physical devices remain `UNTESTED / OWNER-DEFERRED`.
