# Visual Layer v2 — active authority

This directory separates the immutable source handoff from the repository's active, executable contract for Issue #157.

## Read order and authority

1. **This README** establishes authority and phase truth.
2. **[REFLOW-CONTRACT.md](./REFLOW-CONTRACT.md)** is normative when the original visual handoff is silent or conflicts on reflow, enlargement, long content, height, focus, or evidence classification.
3. **[IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)** assigns every V0–V4/shared/final surface, file owner, transition, gate, and rollback.
4. **[TEST-MATRIX.json](./TEST-MATRIX.json)** is the machine-readable case/status source of truth. `PLANNED` is design coverage, never execution evidence.
5. **[EVIDENCE-TEMPLATE.md](./EVIDENCE-TEMPLATE.md)** records compatible v2 reflow evidence without rewriting historical v1 evidence.
6. **[STAGE-B-CONTINUATION.md](./STAGE-B-CONTINUATION.md)** is the completed continuation prompt after commander acceptance.
7. `handoff/docs/01`–`09`, `handoff/design/**`, and `handoff/qa/**` remain the immutable visual/provenance source. `reference/**` is inspection-only and never runtime input.

Current repository behavior, content, analytics, affiliate, SEO, privacy, and game-intent contracts remain authoritative. The handoff does not authorize deleting or inventing behavior.

## Phase truth

| Phase | State | Truth |
|---|---|---|
| V0 | contract integrated; inventory reconciliation open | Active rules and owned static cases are integrated, but `repository-inventory` is not rendered DOM evidence and unresolved/future selectors are not claimed measured. |
| V1 | retained | Merged static START cards are historical. Accepted metadata remains `.75rem` (12px at 16px root), not silently normalized to the handoff's suggested 14px. Stage A only reruns the directly affected metadata/long-content regressions with shared probes. |
| V2 | `PLANNED` | Home and Project runtime are unchanged in Stage A. |
| V3 | `PLANNED` | Directories, Compare, reading/trust, remaining routes, and shared chrome are unchanged in Stage A. |
| V4 | `PLANNED` | Creation Deck is not implemented. Current SSR static links remain. |
| Final local/Preview | `PLANNED` | Requires actual implementation, execution, evidence reconciliation, and independent rendered review. |
| Production | `OWNER-DEFERRED / UNTESTED` | Not PASS. No Production visit or substitute browser context is authorized by Stage A. |

`CURRENT-MAIN-REMAP.md` is a V1 historical record with its measured SHAs. It must not be rewritten as if it covered Issue #157. `REPOSITORY-DEPLOYMENT.md` records the original asset deployment. These active documents supersede their old “next gate” wording only for future work.

## Stage boundary

Stage A changes documentation and reusable test infrastructure only. It does not change `app/**`, `components/**`, `data/**`, `public/**`, dependencies, analytics, or Production. Stage B may begin on this same branch/PR only after commander acceptance; it implements V2, then V3, then V4, then integrated acceptance with reversible commits.

The executable Stage A emitter is `e2e/stage-a-evidence.spec.ts`. Its reviewable output is under `docs/evidence/issue-157-stage-a/`: actual 100/150/200 metadata observations pass the explicitly named executed-subset gate with current screenshots. The emitted long-content observation remains `PENDING` and is deliberately outside that successful subset because its bounded focus result is not consistently substantiated; the retained V1 regression still checks its content, geometry, and first-card focus separately. Historical Issue #155 captures are not rewritten unless `UPDATE_V1_EVIDENCE=1` is explicitly set. This subset result does not make the long-content matrix case or any future V2/V3/V4/final case verified.
