# Issue #157 Stage A correction — independent review

Review scope: VL-A-01..04, the executable evidence path, matrix/document consistency, and preservation of historical V1 captures. The reviewer inspected the real worktree diff and actively mutated evidence/fixtures; this was not a score-only review.

## Findings and resolutions

- **High-impact P2 — cross-record scale substitution:** removing `viewport-375` from the factor-200 record and moving it to an unrelated 100% record initially produced false PASS. Typed same-record `bindings` and a regression now reject it with `missing bound observation scale-200-375`.
- **High-impact P2 — evidence/subset wording:** emitted long-content evidence was outside the accepted subset but described ambiguously. It remains explicitly `PENDING`; the successful subset is only the actual 100/150/200 metadata observations, while the focused V1 regression retains separate long-content/focus assertions.
- **High-impact P2 — historical evidence mutation:** the V1 spec previously rewrote a historical screenshot during execution. Historical output is now opt-in via `UPDATE_V1_EVIDENCE=1`; the tracked blob remained `d749833e9b8e755daaf043c39a66aa934e14c537` through final E2E.
- **High-impact P2 — deferred Production selector:** the OWNER-DEFERRED surface is now explicitly `planned`, not measured.
- **High-impact P2 — stale evidence identity:** the final emitter was rerun. Manifest hash `45f8db3256da8af33b98537afb8ac5540138f5bec8f4c799e588aea316845663` exactly matches the SHA-256 of the declared tested-path diff from checkpoint `0e7f32940c4cae167b75bc424704240b4c4d67f6`.

## Adversarial retest

The reviewer confirmed rejection/detection of wrong route, wrong surface, missing variant, cross-record viewport substitution, requested-but-unachieved scale, pinch substitution, empty roles, blocked computed-text changes, inherited/scoped row styles, nested inline fragments, unchanged ornamental shadow, and missing focus-state evidence. Matching text-scale, wrapped-label, and real focus-indicator controls passed.

Commands observed in the final review cycle:

- `npx vitest run tests/reflow-matrix.test.ts tests/reflow-evidence.test.ts` — 8/8 passed.
- `npx playwright test e2e/reflow-contract.spec.ts e2e/stage-a-evidence.spec.ts e2e/issue-155-v1.spec.ts` — 14/14 passed.
- `git diff --check` — passed.

Final independent result after retest: no remaining P0, P1, or high-impact P2 in the Stage A correction. Stage B was not reviewed or started.
