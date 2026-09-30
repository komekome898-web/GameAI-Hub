# Visual Layer v2 — all-phase implementation plan

The active rules are in `REFLOW-CONTRACT.md`; exact owned cases are in `TEST-MATRIX.json`. This plan integrates the original handoff sections (visual system/tokens, screen specification, component migration, Deck, assets, phases/rollback, acceptance/QA) into executable slices.

## Ownership and transition plan

| Phase / family | runtime ownership (inspect before edit) | transition and state coverage | rollback |
|---|---|---|---|
| V0 inventory | `app/**`, `components/**`, current CSS/routes; no runtime edit | inventory actual selectors, computed typography and applied breakpoints; all VL-DES IDs have cases | remove Stage A docs/tests only |
| retained V1 START | `app/articles/page.tsx`, `app/visual-layer-v2.css`, visual mapping | preserve three static links/order, 320 flat fallback, 12px accepted metadata; shared probe at 100/150/200 and long content | do not edit runtime; historical CSS remains |
| V2 Home | `app/page.tsx`, Home/form components, scoped Visual Layer CSS | empty/max/validation/examples; counter→privacy/help stack; CTA natural height; normal first view versus enlarged/short-height scrolling | remove scoped V2 class/rules; preserve idea→Project and analytics privacy |
| V2 Project | `app/project/page.tsx`, `components/ProjectGeneratorClient.tsx`, scoped CSS | input/clarify/loading/error/result/task/workspace/no-workspace/done/next/recovery; heading→status→actions; task/workspace one-column fallback; sticky focus-safe normal flow; long notes/file/error; copy/save/expanded states | revert Project-only class/rules; no business/provider/storage migration |
| V3 Tools/Guides | route/client components and scoped CSS | count/stage→help→reset, filters/search/empty/error, expanded constraints, long provider/value, readable single-column details, context/history | revert directory-only rules; preserve ordering/evidence/affiliate neutrality |
| V3 Compare | Compare client and scoped CSS | 0/1/2/4, picker/no-result/limit/remove/clear/differences; candidate name→44px remove; criterion-first mobile and semantic/table-scroll desktop; URL/history/focus/Project return | revert Compare-only rules; preserve query/state semantics |
| V3 Articles/Trust/remaining | article hub/templates/reading guide, trust routes, Tool/Guide/Stack details, loading/error/404, scoped CSS | category→date, source/disclosure/TOC/portal wrap, human text vs owned code/table; ElevenLabs v4 and guide preservation; no article insertion/deletion | revert scoped presentation; preserve data/SEO/source/rel/attribution |
| V3 shared chrome | `components/Header.tsx`, `app/layout.tsx`, scoped CSS | logo/nav/menu/footer groups stack naturally; menu trap/Escape/inert/skip link/44px; measured header/menu/anchor geometry | revert chrome-only visual rules; do not alter interaction contracts |
| V4 START Deck | new focused client only if needed, article hub, scoped CSS | SSR list; 0/1/2/3/>3; controls flow; dynamic remeasurement; explicit/verified enhancement; focus-safe static fallback; touch/keyboard/cancellation/CLS/budget | remove enhancer and Deck CSS to reveal identical SSR list |
| Final | matrix/evidence/E2E | all required IDs VERIFIED at exact head; selected cross-route journeys; quality/build/full relevant E2E; independent screenshots; second pass after P0/P1/high P2 fixes | revert latest slice commit, not data/content |

## Typography decision procedure

Before each surface edit, add its representative body/title/help/error/label/date/button roles to evidence. Record baseline font size/line-height, scoped token, and results at 100/150/200. New intentional 14px metadata maps to a scoped `.875rem`; retained V1 `.75rem` stays unchanged. Fixed-px/clamped roles that root scaling does not enlarge must use computed-text or genuine browser zoom evidence rather than be marked PASS.

## Slice gates

Each runtime slice is a meaningful reversible commit: targeted automated checks → normal/stress local rendering → independent review → resolve P0/P1/high-impact P2 → push. V2 precedes V3; Creation Deck is last. Do not continue through a genuine blocker. Final runs the single matrix reconciliation, quality/build/full designated E2E and independent rendered second pass. Production and real-device evidence are separate.

## Stage A/B boundary

Stage A owns only active documents, matrix/schema/probes, negative controls, narrow V1 shared-probe regression, and review. It stops before application changes. After commander acceptance, Stage B resumes **this branch and draft PR**, first reconciling `origin/main`, then implements V2 → V3 → V4 → integrated local/Preview-available acceptance without asking for per-slice owner approval. Merge, Production, Issue closure, and Production browser navigation remain unauthorized.
