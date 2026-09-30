# Issue #155 — Visual Layer v2 V1 acceptance

## Provenance

- Base/current main fetched at task start: `db2dabe5697dc4cc8eadfb80ce206ca5ecfa1d57`
- Resumed branch head: `4aaa50091599438e6ea7c3992124466864c4218b`
- First checkpoint verified remotely: `ca32c37cd69fef9dc0e7ee484be2ef24fab566d5`
- Application evidence: local Chromium rendered from the Step ③ worktree after the V1 implementation; final commit SHA is recorded in the progress ledger and PR.
- Browser evidence is viewport emulation, not physical-device evidence. Physical iPhone/Android testing is **UNTESTED**.
- Production was not visited or changed.

## Screenshots

The `before/` captures were made before application changes. `after-pass1/` retains the first review input. The first 320px capture exposed a 4px overflow and is not acceptance evidence. `after-pass2/` contains the corrected second-pass evidence:

- `articles-320x844.png`
- `articles-375x844.png`
- `articles-390x844.png`
- `articles-1440x900.png`

Each filename records the Chromium CSS viewport. Screenshots are full-page captures, so their pixel height exceeds the viewport height. At every final viewport, `documentElement.scrollWidth === clientWidth`, and the element-level diagnostic found no unowned overflow.

## Runtime and responsive checks

- A fresh browser context was used for every viewport. At 320px, no Mint Atrium request was made. At 375px and 390px the 768px background was requested; at 1440px the 1672px background was requested. All requested backgrounds and all six responsive START cover candidates returned without image decode failure.
- The hub retained four ordered `.article-cluster-list` elements. START retained exactly three links in the required order, with full registry title, description, date, label, and href. It has no button, carousel, active index, duplicate link, or client state.
- The 320px fallback removes the background, metallic gradient, and shadow while retaining all three descriptions. The 3:2 image well remains reserved when cover requests are deliberately aborted, and the readable article links remain present.
- JavaScript-disabled Chromium retained all START links and descriptions. Forced-colors plus reduced-motion retained the static list and focusable links.
- The 200%-equivalent check used Chromium CDP `Emulation.setPageScaleFactor` at a 320×844 CSS viewport. It retained all START links with zero document overflow. This is browser emulation, not OS text zoom or physical-device zoom.
- The mobile Header menu retained open/close behavior, initial close-button focus, Escape close with focus returned to the trigger, and keyboard navigation back to the brand. Existing article/navigation E2E also covered the skip link, article handoffs, affiliate relationships, canonical/JSON-LD, and narrow article reading surfaces.
- Representative Home-to-article-to-Project navigation and existing Compare/article layout checks remained covered by the existing focused suites; V1 did not change their DOM or layout CSS.

## Asset and size checks

- All 11 runtime candidates matched `ASSET_MANIFEST.json` byte sizes and SHA-256 values in both the handoff and public copies; corresponding copies were byte-identical. Both SVG files parsed successfully, and all nine WebP files decoded successfully in Chromium. Intentionally omitted master PNGs were not treated as runtime failures.
- Added stylesheet source size: 6,132 bytes; gzip size: 1,707 bytes. This is below the 8 KiB gzip V1 budget.
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

## Rollback

Remove the `visual-layer-v2.css` import and stylesheet, remove the Articles route wrapper/START cover markup, and remove `lib/article-visuals.ts`. Existing article data, routes, Header logic, Footer groups, and all business state remain migration-free and do not require rollback.
