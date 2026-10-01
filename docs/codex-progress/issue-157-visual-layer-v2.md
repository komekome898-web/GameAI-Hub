# Issue 157 — Visual Layer v2 all-phase contract progress

## Identity and current status

- Issue: #157; branch: `codex/issue-157-visual-layer-v2-complete`; draft PR #158.
- Base: `f26f8d22c3be876878a4c6e0c691dec5d446deff`.
- Submitted runtime checkpoint: `ee1bec3a90b55fa42271d3ceab5a8479c06009ba`.
- Current corrected final integrated acceptance checkpoint: `ed42a337a03ba410523323e4b290e42dc38fec44`.
- **Runtime implementation remaining: NONE.**
- **Local final acceptance: PASS** at the checkpoint above. The combined 115-record manifest is `docs/screenshots/issue-157-stage-b/final/manifest.json`; V1, V2 Home, V2 Project, corrected V3/V4 actions, measured cross-route captures, and final reconciliation all bind to that exact clean source SHA.
- Independent review found one high-impact P2 at 200% Deck text; content-fit fallback was added and the refreshed 200% capture confirms the same ordered list is retained without overlapping circular neighbors. No P0/P1/high-impact P2 remains in the reviewed local captures.
- At the preceding remote head, quality/build run `36795444535`, Vercel, and E2E run `36795444492` passed (134 passed / 1 skipped). Current-head remote checks are reported separately and are not inferred from those runs.
- Production, protected Preview interaction, physical devices, genuine browser zoom, and OS scaling remain `UNTESTED / OWNER-DEFERRED`. No Production navigation or merge occurred.

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

## Runtime completion and consolidated-acceptance continuation

- Resumed remote head `46592e625c00ff0d86c7822b7e5bd1cdee31aec7` after verifying canonical fetch/push origin, authenticated API access, `origin/main`, the existing draft PR, and a real branch push.
- Runtime mapping: V2 Home/Project presentation lives in `app/visual-layer-v2.css` and the existing Home/Project components; V3 directory/Compare/reading/trust/shared presentation lives in that scoped stylesheet and existing route components; V4 START enhancement lives in `components/CreationDeck.tsx`. Inspection found no missing V2/V3 screen implementation. The remaining runtime omission was V4 fail-safe/drag behavior, not the outstanding evidence matrix.
- CreationDeck now requires successful intrinsic measurement and usable card/control fit before exposing Deck mode, catches measurement/initialization failure into the same SSR list, and updates drag feedback at most once per animation frame while cancellation removes transient transforms. The existing <=340px, media, focus-transfer, natural-height, storage, and pointer-ID behavior remains in place.
- The known CI repairs are bounded to generated screenshot exclusion in clean source identity and accepting the helper's class-qualified overflowing paragraph selector while retaining the owned-scroller negative.
- Operational order now follows the owner correction: completed runtime first, then one consolidated acceptance. Unexecuted matrix observations remain unexecuted and are not implementation omissions or PASS.
- **Status A — runtime implementation remaining: NONE.** V2/V3 surfaces were already present; V4 now has the missing initialization/measurement/control-fit fallback and animation-frame-bounded drag feedback.
- **Status B — final acceptance remaining:** normal responsive, retained V1, Home/Project typed subsets, Deck stability/fallback, reading/trust, quality, and build executed successfully. Independent review found one control-fit P2, which was fixed and covered by a regression. The complete E2E first attempt was 130/132; both failures passed 3/3 after timing fixes, while a later full attempt stopped on the analytics fixture-load race. Typed V3, exhaustive V4 pointer/pinch/budget, and final reconciliation observations remain unexecuted, so final execution is non-PASS. Production/Preview/physical-device/browser-or-OS-zoom acceptance remains untested.

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

## Home evidence binding and CI timing correction

- Retained all ten Home observations and corrected their evidence binding: the
  declared matrix root is now probed directly, child diagnostics remain
  separately measured, and the initial H1 participates in the root clipping
  check rather than only its typography measurement.
- Semantic-row evidence now records allocated and natural label widths plus the
  actual `ordinaryLabelSqueezed` result. A contained/nonoverlapping but squeezed
  label contradicts a PASS record; the focused negative regression proves this
  failure class is rejected while the existing wrap/stack positives remain.
- The emitter now writes `PENDING`, then persists either the successful result
  or a `FAIL` result with validator reasons. It can no longer leave a stale PASS
  artifact when `validateExecutionSubset` throws.
- The fragment-interruption regression now samples the pre-wheel position,
  waits for genuine wheel movement and two animation frames before taking its
  settled baseline, and still requires no later fragment call or automatic
  return after deferred fonts resolve. The initial-fragment and later explicit
  hash-navigation assertions are retained.
- Newly completed record IDs: the same ten V2 Home IDs were re-executed with
  corrected binding and squeeze diagnostics. No Project/V3/V1/V4 IDs were
  newly completed in this checkpoint. Exact remaining work is
  `VL-V2-PROJECT-STATES`, `VL-V2-PROJECT-WORKSPACE`,
  `VL-V2-PROJECT-TOKENS`, every V3 case, `VL-V1-LONG-CONTENT`, the outstanding
  V4 browser-input/dynamic/budget observations, and both final cases. The stop
  reason is the bounded execution window; final acceptance is not claimed.

## Project evidence and review corrections

- Source checkpoint `af9b59950ccc089e7ef58e44c27bc7876ac5fca6` replaces partial content digests with an exact clean-Git identity. The current V1 emitter now writes to `docs/screenshots/issue-157-stage-b/v1-current/`; historical Stage A bytes remain unchanged.
- `VL-V2-PROJECT-STATES` now has eight records: `project-state-input`, `project-state-clarification`, `project-state-loading`, `project-state-error`, `project-state-result`, `project-state-done`, `project-state-next`, and `project-state-recovery`.
- `VL-V2-PROJECT-WORKSPACE` now has five records: `project-workspace`, `project-no-workspace`, `project-workspace-copy-failure`, `project-workspace-save-failure`, and `project-workspace-expanded`.
- `VL-V2-PROJECT-TOKENS` now has the bound `project-tokens-100`, `project-tokens-150`, and `project-tokens-200` records at 320/320/375px. All 16 records passed the named Project subset gate with measured roles, target sizes, keyboard focus, overflow ownership, and current screenshots.
- Focus applicability is derived from rendered interactive DOM. Closed-details, disabled, inert, and hidden descendants are excluded; native labelled-input targets use their actual label hit area. The unchanged-shadow and covered-target negative controls remain in the contract suite.
- The Stage B base-button rule no longer overrides `.button.ghost` or `.button.light`; Project primary/secondary hierarchy is retained. Narrow or short clarification actions fall back to natural flow rather than obscuring focused fields.
- Still outstanding: V3 application observations, current V1 long-content reconciliation, remaining V4 browser-input/dynamic/budget observations, and both final cases. Production, protected Preview interaction, genuine browser zoom, OS scaling, and physical devices remain `UNTESTED / OWNER-DEFERRED`.

## Corrected final emitter and execution order

- The required final command now runs current V1, Home, Project, Stage B, V3, V4, and final reconciliation in explicit dependency order. Final reconciliation has no success-via-skip path: a missing or stale source manifest fails.
- V3 now performs the declared spacing overrides, explicit Compare 0/1/2/4/limit/remove/clear actions and assertions, expanded/reset directory actions, and an expanded mobile Header observation. The nonexistent Tools error state and unavailable static-detail loading/error state are recorded as not applicable with source reasons rather than fabricated from empty search results or a normal detail route.
- V4 cancellation occurs during the owned pointer gesture, CDP multi-touch is classified separately from synthetic pointer dispatch, and normal click/keyboard recovery is asserted. Count evidence is bound to the executed disposable component fixtures rather than the published three-link page.
- The Deck rail exception is limited to descendants of inactive side cards; active-card containment is measured before the rail root is exempted. Unrelated document overflow and active-card clipping still fail.
- The budget record measures CLS plus emitted Deck JS/CSS gzip sizes. At the tested checkpoint: CLS `0`, Deck JS `2585` bytes gzip, Deck CSS `3021` bytes gzip, against the existing `8192`-byte targets; route image assets transferred `39158` encoded bytes.
- Final cross-route records are newly executed at 320/375/390/1440 across Home, Project, Tools, Compare, and Articles. The independent-review record references the retained review artifact instead of stamping a new reviewer decision onto a footer screenshot.
- Consolidated acceptance exposed one current runtime defect: the mobile menu close control clipped at 200% synthetic computed text. Its fixed width was replaced with a 44px minimum plus natural inline padding, and the 200% Header observation passed on rerun.
