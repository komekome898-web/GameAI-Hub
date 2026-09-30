# Issue 157 — Visual Layer v2 all-phase contract progress

## Identity and remote lineage

- Issue: #157
- Stage: A — active design and executable test-contract integration
- Branch: `codex/issue-157-visual-layer-v2-complete`
- Base: `f26f8d22c3be876878a4c6e0c691dec5d446deff`
- First verified remote checkpoint: `187c0ee45cf943029f0bca86e27aab1678231f92`
- Runtime boundary: documentation and test infrastructure only; V2–V4 runtime implementation has not started.

Canonical fetch/push origin, authenticated repository access, `origin/main`, and the remote write path were verified before substantial work.

## Stage A delivered

- Active authority/read order, integrated VL-DES-01..07 reflow contract, all-phase implementation plan, v2 evidence template, and completed Stage B continuation prompt.
- `TEST-MATRIX.json` owns V0, retained V1, V2, V3, V4, Shared, Final, and separately owner-deferred Production cases. V0/V1 machinery is `IMPLEMENTED`; future application cases remain `PLANNED`; Production is `OWNER-DEFERRED`.
- Reusable text measurement, semantic-row, surface/clipping/target/focus/scroll probes; compatible reflow evidence schema; design and final-execution validators that require exact SHA, nonzero surfaces, exact states, declared methods/tags, 100/150/200 factors, required viewports, independent spacing variants, PASS diagnostics/geometry, and independent review provenance.
- Negative controls detect ordinary-label squeezing with zero document overflow, fixed-height clipping, unbroken-token overflow, missing surfaces, fixed-px root-scaling failure, stale SHA, synthetic/physical misclassification, and false final coverage. An owned code scroller and wrap/stack fixtures are positive controls.
- The shared probes are wired into the retained V1 metadata and long-content cases at 150/200 without weakening their existing assertions or changing historical captures.

## Validation

- `git diff --check` — PASS.
- `npx vitest run tests/reflow-matrix.test.ts tests/reflow-evidence.test.ts` — PASS, 6 tests.
- `npx playwright test e2e/reflow-contract.spec.ts e2e/issue-155-v1.spec.ts` — PASS, 11 tests.
- `npm run quality` — PASS, including 304 Vitest tests and repository validators.
- `npm run build` — PASS, 71 static pages generated.
- Independent review: initial false-PASS findings were fixed; final re-review reported PASS with no remaining P0/P1/high-impact P2.

## Preserved boundary and next action

No application runtime, product data, public/reference/handoff assets, dependencies, analytics, Production state, or historical V1 screenshots changed. Production remains `UNTESTED / OWNER-DEFERRED`; no Production navigation occurred.

After commander acceptance, Stage B must resume this same branch and draft PR, reconcile remote lineage, then implement reversible V2 Home/Project → V3 directories/Compare/reading/trust/shared chrome → V4 START-only Deck → integrated final acceptance. Bind each `PLANNED` case to actual selectors and exact-SHA evidence; do not mark it `VERIFIED` from design coverage alone.
