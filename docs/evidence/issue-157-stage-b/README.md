# Issue #157 Stage B local evidence

Captured from the current local production build with Chromium through `e2e/issue-157-stage-b.spec.ts`.

- Representative full-page captures: Home, Project input, Tools, Compare, and Articles at 390 and 1440 CSS px.
- Automated responsive checks additionally ran at 320 and 375 CSS px.
- START retains three SSR links and defaults to the static list. The explicit `円環で見る` control enables the same DOM list; 320px, reduced-motion, and forced-colors remain flat.
- ElevenLabs v4, privacy, methodology, and affiliate-disclosure routes were included in the route smoke.
- These are local Chromium/emulation observations, not physical-device, genuine browser-zoom, protected Preview, or Production acceptance.
- The matrix records Stage B cases as `IMPLEMENTED`, not `VERIFIED`: the current capture set does not substantiate every declared dynamic Project/directory/Compare variant or every 150/200 role measurement. Final-execution validation must continue to reject those cases until same-observation records exist.
