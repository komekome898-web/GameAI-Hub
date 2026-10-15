# Playable game entries — local rendered evidence

Source task: approved owner delegation 01a0f210-6698-766f-b8b3-d686388b203d, 2026-10-04. Implemented on `feat/play-games-aramon-template`, base `4ddaf1090a4d9233a4c8a1672c6d9d815604cc42`. Evidence is tied to the containing delivery commit (and any documentation-only follow-up), not a Production deployment.

- `card-{320,375,1440}.png`: Home game category → one work; original title image, one-sentence introduction, genre/environment, introduction/play actions.
- `detail-{320,375,1440}.png` and `detail-first-*`: common game detail, top/bottom play links, factual limits and production article link.
- `detail-root200-320.png`: synthetic root-font 200% at 320px. This is text scaling, not physical-device or browser-zoom evidence.
- `fixture-{0,2,3}-375.png`: disposable browser fixtures, never public registry records. 0/2 use a list; 3 shown after selecting list.
- `fixture-3-ring-375.png`: same future three-work fixture in circular mode, second work selected. Recheck covers control-focus fallback at 320px and reduced motion, preserving that work's introduction link.
- `shared-chunk-budget.json`: actual Home/article resource measurement, identical deck JS file and 7804 gzip bytes under the 8192-byte budget.
- `operations-*.json`: title-image natural/rendered dimensions, JS errors and Home→category→detail→Back/Forward→reload→list→Home return operations.

Method: local production build, Playwright, installed `/usr/bin/chromium`, viewport emulation; external requests/GA collection blocked. No physical iPhone/Android, Preview or Production testing. The author's iPhone environment is separately attributed in the public copy; it is not a claim of this task's device testing.

Local gates and regression records: `docs/evidence/play-games/`. Initial E2E: 57/59 passed; two superseded assertions (no-JS total anchors and category label) were corrected, and the failed cases plus changed focus/game journeys rechecked: 9/9 passed. Full unit gate: 364 passed before review fixes; changed core/data unit tests, lint/typecheck and game validation were rerun after fixes. Workflow validation used the environment's bundled Ruby after PATH recovery. Final standalone build and production-build game/analytics/shared-chunk suite passed (7/7); changed game/analytics unit suite passed (27/27), including suppressed-click/observer-cleanup tests. Final CI is the source of truth for all gates at the pushed head.

Independent review: separate read-only agent `game_review` inspected source, actual PNGs and operation records. One high-impact P2 (multiple-link card focus fallback) was fixed, with explicit 320px/reduced-motion assertions; the optional external-production-article inconsistency was fixed. Final review and exact reviewed commit are recorded in the task ledger/PR. Parent coordinator/owner acceptance remains separate from implementation and this local agent review.
