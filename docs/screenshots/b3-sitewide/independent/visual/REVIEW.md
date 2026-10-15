# Final independent visual review

Reviewer: /root/sitewide_visual_review. Runtime source: c6dfceb46c4e6d7a4b0d067c3963386f2a58b972. Local production build/server http://127.0.0.1:3100; system Chromium /usr/bin/chromium through Playwright, isolated browser contexts. No source/Git writes, build/restart, Production visit or physical-device testing.

## Decision

PASS for this independently inspected visual/reflow/accessibility subset at c6dfceb46c4e6d7a4b0d067c3963386f2a58b972. No unresolved P0/P1/high-impact P2 found. This is not a whole-site functional, performance, physical-device or blanket WCAG verdict. Full-suite/asset-budget outcomes belong to the parent evidence and were not assumed here.

The prior reports at00c09d0 and0c6608b are intermediate. This report supersedes their open breadcrumb/control/invalid findings for the measured c6 runtime.

## Resolved findings, independently measured

- Breadcrumbs on Meshy article, Meshy detail and monster-collection-mobile Stack: rgb(82,96,75) on rgb(250,248,242),6.31:1. Stack final span uses natural white-space:normal and wraps at320; normal and root-text200 document width equals1440/375/320. No document overflow was seen in the33 initial captures.
- Normal field boundary: rgb(124,137,109) on rgb(255,253,248),3.65:1. Disposable DOM aria-invalid=true now changes the border to rgb(163,59,53),6.39:1. Confirmed at1440/375/320. capture.json records computed colors rather than expected palette values.
- Real product invalid state: entered a Steam3D horror idea, exercised deterministic fallback with the external interpretation request blocked, included extracted details, blanked one included detail and submitted. Project at1440/375/320 and Builder in a fresh320 context produce aria-invalid=true, a red boundary, the one-character-minimum error and focus on the affected textarea. Original input remains. Focused textarea bounds clear the Header and remain inside the viewport. These are actual client validation states, not fabricated published data. actual-error.json binds the state and route.

## Rendered coverage and evidence

C6 initial captures: Home, Articles hub, long Meshy pricing article, monster-collection-mobile Stack, Project, Builder, Meshy detail, Tools, Compare with two candidates, Privacy and404 at1440/375/320. capture.json includes computed styles, current-route semantics, dimensions and scroll position. All initial records have scrollY0 after explicit reset. Actual screenshots and selected contact sheets were inspected. The shared diary/pixel Header, graphite/olive exterior and opaque warm reading/work materials remain coherent. Long Meshy title, body/source/disclosure material, full Home game art and mobile comparison controls are visible without clipping in the inspected states. Game detail and AI-usage article were inspected in the earlier00c pass, not newly counted as c6 captures.

Root-text stress at1440/375/320: Home, Meshy article, Project, Compare, Tools, Privacy and Stack. stress.json records achieved sizes; root32px is not a blanket200% result. Desktop article/Project H1 achieves1.746x, desktop Home H1 only1.049x because of viewport clamping; sampled leads2x and narrow H1s2x. Fixed legacy helper/error/detail-field/control sizes require computed-text testing. No physical/browser-zoom equivalence is claimed. Header measured104px at1440,133.984px at375 and126.781px at320. Desktop navigation fits; mobile controls wrap into normal flow.

Computed-text stress uses each selected node's pre-mutation computed-size snapshot, then doubles its own size to avoid cumulative nested multiplication. Project idea label17.28→34.56px, help12.16→24.32, error16→32, submit16→32, textarea16→32. .idea-meta container remains12.8; no blanket enlargement claim. Bounded textarea→Tab→submit settles with a visible3px green indicator; submit top427.59/bottom558.38 versus Header bottom126.78, natural height130.78px. last.json and project-computed200-submit-focus-320.png.

Actual detail-empty state also received separate root/computed stress. The detail field stays16px under root-text200 and reaches32px under computed-text200. A bounded Tab→Shift+Tab transition places its enlarged130.78px textarea at151.13..281.91px below126.78px Header, with red invalid boundary and green focus. Document remains320px on Project and Builder. actual-error.json and *-actual-invalid-computed200-320.png. The preceding label may sit partly under the expanded sticky Header at this synthetic focused position; the target and programmatic label association remain available. This is a lower-severity visual context limitation, not an obscured control.

Meshy text-spacing stress at320 root200 applies line-height1.5, paragraph spacing2em, letter spacing.12em and word spacing.16em. Inspected body/title/surface samples remain readable; no required content clipping observed. Japanese word-spacing applicability is limited. mesh-spacing-root200-320.png.

Keyboard/menu: Tab reveals the skip link; Enter focuses main-content. Menu focus cycles within the dialog, Escape returns to its button. Computed200 menu last link is visible at742.39..814.78 within844px. access.json/last.json and corresponding focus screenshots.

TOC/code at320: Meshy has ten links; first hash destination heading top159.55 clears64px Header. Tutorial code receives keyboard focus,3px green outline and a visible194.19px region; .article-code is the existing explicit local-scroll selector with overflow:auto/tabIndex0. Document remains320px. toc-code.json, mesh-toc-320.png, mesh-hash-320.png and tutorial-code-focus-320.png. No data-acceptance-scroll-owner attribute was present on this legacy pre; the established selector is the contract's permitted ownership path.

JS-off at320:31SSR card/article anchors, six list-mode decks, document320px. Reduced-motion category view:five category anchors, list mode, document320px. These are different route states and their counts are not interchangeable. access.json and articles-nojs-320.png/articles-reduced-320.png.

## Lower-severity limitations and untested work

Root200 decorative CTA arrow outgrows its fixed tile; activation/text remain usable. Desktop404 title leaves a final-character orphan. No blocking visual failure was found from these. Browser zoom, forced colors, screen-reader behavior, physical iPhone/Android, OS text sizing, soft keyboard, Production, exhaustive every-route/state behavior, and performance are untested here. Full Project/workspace/save/recovery, filter/history/analytics/data/rights/SEO regression acceptance remains with the separate functional review and parent gates.

Representative existing C6 screenshots ready for handoff: home-375.png, articles-320.png, mesh-320.png, stack-320.png, compare-375.png, project-375.png. These are actual local screenshots, not mockups. Raw viewport reflow artifacts remain distinct from full-page captures and physical-device evidence.
