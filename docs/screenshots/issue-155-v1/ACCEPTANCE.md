# Issue #155 — Visual Layer v2 V1 acceptance

## Provenance

- Base/current main fetched at task start: `db2dabe5697dc4cc8eadfb80ce206ca5ecfa1d57`
- Resumed branch head: `4aaa50091599438e6ea7c3992124466864c4218b`
- First checkpoint verified remotely: `ca32c37cd69fef9dc0e7ee484be2ef24fab566d5`
- Original normal-width application evidence: local Chromium rendered from the Step ③ worktree after the V1 implementation. Those captures remain preserved under `after-pass2/`.
- Focused follow-up evidence was rendered from checkpoint `7ae4d784318246fa4cce5e2f05f66ec4c89ea8b8` plus the scoped CSS/test worktree diff (`d8f7182b159276278e54f9d1752e41cadc784ab1705e9798c33fc1dec8cec765`, computed from `app/visual-layer-v2.css` and `e2e/issue-155-v1.spec.ts`). The final pushed head is recorded on PR #156 rather than embedded circularly in its own commit.
- The metadata correction resumed reviewed head `97c6affa851e451fa506d0f02b1ff05c48090acc` and proved the remote write path with checkpoint `6915ce35b927b1df9a2ae2adf0eeaf6e22fb0d1b`. Its corrected captures were rendered from that checkpoint plus CSS/test worktree diff `ecfaa978ab55d79a17e125ac775c3cbd45afd814e866432f2235445a9a9eee18`. The final remote head is recorded on PR #156 after delivery.
- Focused browser/method: Playwright 1.62.1 with Google Chrome for Testing 151.0.7922.34, local production build, CSS viewport emulation. Synthetic text enlargement set the computed root font size from 16px to 32px; it was not browser page zoom or OS accessibility text sizing.
- Browser evidence is viewport emulation, not physical-device evidence. Physical iPhone/Android testing is **UNTESTED**.
- The protected Preview was not retried. Live Preview browser acceptance remains **UNTESTED**. Production was not visited or changed.

## Screenshots

The `before/` captures were made before application changes. `after-pass1/` retains the first review input. The first 320px capture exposed a 4px overflow and is not acceptance evidence. `after-pass2/` contains the corrected second-pass evidence:

- `articles-320x844.png`
- `articles-375x844.png`
- `articles-390x844.png`
- `articles-1440x900.png`

Each filename records the Chromium CSS viewport. Screenshots are full-page captures, so their pixel height exceeds the viewport height. At every final viewport, `documentElement.scrollWidth === clientWidth`, and the element-level diagnostic found no unowned overflow.

The focused follow-up is additive and does not overwrite that evidence. `focused-acceptance/` contains rerendered normal 320/375/390/1440 captures after the wrapping repair, synthetic 200% root-text captures at 320 and 375, and a 320px disposable long-content capture. The screenshots were visually inspected after the automated geometry checks.

## Runtime and responsive checks

- A fresh browser context was used for every viewport. At 320px, no Mint Atrium request was made. At 375px and 390px the 768px background was requested; at 1440px the 1672px background was requested. All requested backgrounds and all six responsive START cover candidates returned without image decode failure.
- The hub retained four ordered `.article-cluster-list` elements. START retained exactly three links in the required order, with full registry title, description, date, label, and href. It has no button, carousel, active index, duplicate link, or client state.
- The 320px fallback removes the background, metallic gradient, and shadow while retaining all three descriptions. The 3:2 image well remains reserved when cover requests are deliberately aborted, and the readable article links remain present.
- JavaScript-disabled Chromium retained all START links and descriptions. Forced-colors plus reduced-motion retained the static list and focusable links.
- The original `Emulation.setPageScaleFactor(2)` result is retained and is now classified only as **pinch/visual-viewport scale emulation**. It measured `visualViewport.scale >= 1.9`; it did not test layout reflow, browser page zoom, OS text sizing, or a 160px layout viewport.
- The new layout-affecting test doubled the computed root font size from 16px to 32px at 320×844 and 375×844. START title sizes increased from 19px to 38px, description sizes from 14px to 28px, and label/date sizes from 12px to 24px. At both widths the numerical diagnostics were `documentOverflowPx: 0`, `documentScrollWidth` equal to the 320/375px layout viewport, zero unowned overflowing elements, and all three cards remained present. This synthetic method supplements rather than impersonates browser zoom, OS accessibility settings, or physical-device testing.
- The corrected metadata row can wrap its label and date onto separate flex lines when their natural widths do not fit. At synthetic 200% root text, all three production labels at both 320px and 375px remained single-line at their natural width, while label/date geometry was contained, fully visible, and nonoverlapping in either inline or stacked placement. The test no longer assumes horizontal ordering.
- Disposable browser-test DOM replaced only the first START card's title, description, and label with long Japanese plus a URL/unbroken ASCII token. The production article records were not changed. At 320px, every tested text box reported `scrollWidth <= clientWidth + 1` and `scrollHeight <= clientHeight + 1`; every descendant remained within the card; the label and date were nonoverlapping whether inline or stacked; document and unowned overflow were zero; the entire strings remained in the DOM and visible; focus was visible on the card; and the list item retained exactly one link. The initial run reproduced clipped/overflowing text and failed. The scoped `min-width: 0`/`overflow-wrap: anywhere` repair for label and description passed the second run.
- The mobile Header test is intentionally named for its narrower proven behavior: initial close-button focus, Escape close with focus returned to the trigger, and surrounding Shift+Tab order. It does not claim that Tab/Shift+Tab wrapping inside the open dialog was exercised. Header logic was unchanged.
- Representative Home-to-article-to-Project navigation and existing Compare/article layout checks remained covered by the existing focused suites; V1 did not change their DOM or layout CSS.

## Asset and size checks

- All 11 runtime candidates matched `ASSET_MANIFEST.json` byte sizes and SHA-256 values in both the handoff and public copies; corresponding copies were byte-identical. Both SVG files parsed successfully, and all nine WebP files decoded successfully in Chromium. Intentionally omitted master PNGs were not treated as runtime failures.
- Added stylesheet source size: 6,237 bytes; gzip size: 1,718 bytes. This is below the 8 KiB gzip V1 budget.
- Added runtime JavaScript: 0 bytes. The visual mapping and page remain server-rendered; no client island or carousel dependency was added.
- The 11 already-deployed runtime assets total 165,680 bytes. A 320px hub transfers no background. Wider views select one 12,746–37,810 byte background, and the three visible 480px covers total 26,412 bytes.
- Supplied WebP files are served directly rather than re-encoded. No dependency or package manifest changed.
- Token contrast values independently validated by the handoff remain: ink/ceramic 13.73:1, muted/ceramic 5.91:1, white/primary 6.72:1, and control border/ceramic 3.55:1.

## Independent rendered review

An independent visual/mobile reviewer inspected the approved material reference and actual before/after PNGs without editing the implementation.

- Pass 1 identified a P1 320px evidence/overflow defect: the nominal 320px full-page PNG was 324px wide. The implementation was corrected and all four viewports were rerendered.
- Pass 2 verified the corrected 320px file is exactly 320px wide and, together with the logged 320/320 width diagnostic, closed the P1.
- No P0, P1, or high-impact P2 remained. Titles wrap naturally, descriptions and controls remain visible, the flat fallback is active at 320px, and wider cards remain opaque with restrained edges and shadows.
- Residual non-blocking P2: desktop ceramic depth and metallic/inset separation are quieter than the approved composition. The reviewer found the result still satisfies the restrained opaque-material direction and does not introduce glass, neon, huge radii, or exaggerated shadows.
- Independent rendered visual gate: **PASS**. Physical-device acceptance: **UNTESTED**.

The focused enlargement and long-content screenshots receive a separate second-pass review in this follow-up. Header and Footer logic and colors remain unchanged by V1; no color migration is claimed for those global components.

The independent focused second pass inspected the 320/375 synthetic-enlargement screenshots, the 320 long-content screenshot, the test assertions, and the scoped repair. Its targeted three-case run passed, with no P0, P1, or high-impact P2 remaining. It confirmed visible wrapping, separated metadata, the focus outline, and single-link access. Its documentation concern (durable numerical values, method, paths, worktree state, and limitations) is addressed above; focus-ring visibility is now also asserted from computed outline styles as well as retained in the screenshot.

The subsequent metadata-only review found a P2 in the 320px synthetic-enlargement capture: flex shrinking forced ordinary labels into narrow multi-line columns beside the nowrap date. The row now wraps rather than squeezing labels. Corrected 320/375 enlargement and 320 long-content captures were inspected after the six-case V1 run; normal 320/375/390/1440 captures were rerendered by the same run and remained pixel-unchanged. The long custom label uses the available row width and wraps without collision or clipping.

An independent metadata-only reviewer inspected the current diff and all corrected enlargement, long-content, and normal-width captures. The reviewer reported no P0, P1, P2, or P3 findings: ordinary labels retain natural single-line width, dates stack cleanly when needed, the custom label uses the row width, and normal layouts show no regression. Independent focused visual gate for this correction: **PASS**.

## Rollback

Remove the `visual-layer-v2.css` import and stylesheet, remove the Articles route wrapper/START cover markup, and remove `lib/article-visuals.ts`. Existing article data, routes, Header logic, Footer groups, and all business state remain migration-free and do not require rollback.
