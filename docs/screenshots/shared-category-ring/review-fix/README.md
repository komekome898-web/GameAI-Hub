# PR165 independent-review follow-up

Input head: 94f1c9ec5d8592343affb96c344815ad0ab64904. Same owner delegation/thread and same draft PR/branch; bootstrap verified canonical origin, fetched main93124ab, and remote task head94f1c9e with a no-op push before work.

Finding: list activation changes category memory but previously left the originating history URL hubCategory=start. Browser Back gives that explicit URL priority over saved voice. Both Home and articles entry affected.

Fix: before valid category navigation from categories, call the existing rememberCategory(view). This replaces the originating entry without adding history; existing navigation still adds exactly one entry. No motion, visual, registry, article, analytics or Project code changed. Idle test helper first waits for one hydrated deck, then keeps its existing idle assertion. No skip, assertion removal or retry change.

## Local evidence
- baseline.log: corrected four regressions on old deployed-local build/head94f1c9e fail specifically at Back URL: start instead of voice, on Home/articles and explicit list/narrow fallback.
- before.log: first test-definition run included an invalid assumption that list focus commits a ring ID at320; corrected setup first selects start in390 ring then resizes to320. Retained as test-development history, not product evidence.
- unit.log: 13 targeted unit tests PASS.
- quality.log: 347 tests/44 files and all validators PASS.
- e2e.log: production-mode build/start from playwright.config completed successfully; all14 shared category E2E cases PASS, no retries. Includes four new Back regressions, prior ring/body/entry returns, isolated list preference/focus, motion navigation, enlargement, no-JS/safe context, Project fragment/input.
- home/articles-320/390 JSON and PNG: new flow records/screens. Back URL, list mode and focused voice are asserted before reload; reload reasserts focus/list.390 then switches to ring and asserts voice centered. JSON focus records the final active control (null category when the ring toggle is focused), not the earlier asserted Back focus. Native Chromium browser/mouse input and viewport emulation; not physical Safari.

Original evidence files and original manifest are retained unchanged. Original CI at94f1c9e had216 first-pass plus1 retry-pass and final reconciliation1; that flake history remains in the Library delivery. Independent coordinator re-review of this change pending. Physical Safari UNTESTED. No merge/manual deploy/Production/Preview direct access.
