# Issue #157 Stage B local evidence

Captured from the current local production build with Chromium through `e2e/issue-157-stage-b.spec.ts`.

Tested runtime/test checkpoint: `02d1dfbad58d20a5c2425239f6851c03ea6c9271`.

- Representative full-page captures: Home, Project input, Tools, Compare, and Articles at 390 and 1440 CSS px.
- Automated responsive checks additionally ran at 320 and 375 CSS px.
- START retains three SSR links and defaults to the static list. The explicit `円環で見る` control enables the same DOM list; 320px, reduced-motion, and forced-colors remain flat.
- ElevenLabs v4, privacy, methodology, and affiliate-disclosure routes were included in the route smoke.
- The Deck stability regression samples the stage and following-section geometry eight times at 100ms intervals. The last four samples must stay within 1 CSS px after idle, next/previous, focus reveal, a 600px resize, synthetic 150% root text, independent letter/word spacing, `document.fonts.ready`, and restoration to 390px. The checkpoint passed every bounded sample; unlike the prior implementation, measurement reads intrinsically sized top-positioned cards and ignores redundant height updates.
- Focused application checks cover control-local ArrowLeft navigation, immediate focused-card reveal, blocked `sessionStorage`, stored-mode restoration, narrow fallback, and the normal next control. Pointer ownership/cancellation and active-card threshold are implemented in the component; exhaustive synthetic multi-pointer fixtures remain part of the uncompleted matrix boundary below.
- `article-breadcrumb-375.png` is a current application capture. Its short ancestor crumbs remain coherent one-line units while the long current title owns wrapping; the browser assertion checks the `ホーム` text range has one rendered line.
- These are local Chromium/emulation observations, not physical-device, genuine browser-zoom, protected Preview, or Production acceptance.
- The matrix records Stage B cases as `IMPLEMENTED`, not `VERIFIED`: the current capture set does not substantiate every declared dynamic Project/directory/Compare variant or every 150/200 role measurement. Final-execution validation must continue to reject those cases until same-observation records exist.

## Final gate status at this checkpoint

- `npm run quality` passed (41 files / 306 Vitest tests and repository validators), and `npm run build` generated 71 static pages.
- The full local E2E attempt produced 125/128 on its first pass. All three failures (an analytics harness connection reset, the Stage B route-smoke timeout under concurrent load, and a missing injected Slice 1 fixture) passed together on focused rerun; the Stage B route smoke now has a 90-second integrated-suite allowance.
- This package does **not** claim the all-phase final-execution gate. Dynamic same-observation matrix evidence, exhaustive disposable 0/1/2/>3 Deck fixtures, and the final integrated independent review remain open. Production remains `UNTESTED / OWNER-DEFERRED`.
