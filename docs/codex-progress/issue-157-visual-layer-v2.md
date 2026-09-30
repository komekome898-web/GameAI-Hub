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
