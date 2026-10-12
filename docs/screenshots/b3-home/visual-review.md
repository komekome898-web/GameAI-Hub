# B3 Home — independent visual / mobile review

**Visual verdict: PASS for the final fixed source snapshot.** No unresolved P0, P1 or high-impact P2 remains after independent upper- and lower-page correction rechecks. The 320px synthetic 200% play label now stays on one line, with the introduction action on its own row. Final exact-head binding is verified separately before merge; this visual verdict does not authorize bypassing technical, interaction, CI or owner gates.

## Identity and source binding

- Reviewer: delegated independent agent `/root/b3_prod_visual_review`; no runtime implementation edits.
- Date: 2026-10-12. Launch: owner-directed parent delegation in the selected `/workspace` environment; no GitHub mention or legacy orchestration.
- Repository/worktree: `/workspace/GameAI-Hub-b3-prod`, branch `feat/b3-game-first-home`.
- Canonical origin and origin/auth/fetch/remote-push hard gate were verified by the parent and explicitly inherited for this review. Base / earliest remote checkpoint: `96da279c5db51b4c217e509d900b8efa87a05070`.
- Previous runtime checkpoint: `78ca376c5cdd3e0a4aeef2d402d2225569fc8f9d`. The final fixed working-tree source snapshot is bound by the 11 SHA256 values in `independent-visual/checks.json`; the final runtime/remote head must match those values. No runtime code was edited by this reviewer.
- Browser: system `/usr/bin/chromium`, Chromium 151.0.7922.173 on Debian 13, Playwright from this repository.
- Latest reviewed server: `http://127.0.0.1:3182/`, production-mode local Next build. **This is local evidence, not deployed Preview or Production evidence.** Production and external games were not opened; external requests were blocked and the analytics-excluded localStorage flag was set in the diagnostic browser.
- Exact SHA256 hashes of 11 relevant runtime/data files, before/after comparison, and build ID are in [checks.json](independent-visual/checks.json). Review has to be rebound if those files change.
- The approved B3 was freshly rendered read-only at local port 8784. Four mock source/data hashes stayed unchanged. No B2/mock files were edited.

## Findings and correction loop

| ID | Severity | Concrete finding / evidence | Status |
|---|---|---|---|
| B3-VIS-01 | P2, lower impact | Category position `1 / 5` had dark text on dark Home, 2.694:1. [Before](independent-visual-beforefix/contrast-original-categories-375.png) | Fixed/rechecked: 10.426:1. |
| B3-VIS-02 | P2, lower impact | Menu group labels were pale on white, 1.893:1. [Before](independent-visual-beforefix/contrast-original-menu-375.png) | Fixed/rechecked: 6.281:1; green 3px actual Tab-focus indicator. |
| B3-VIS-03 | P2, high impact | At 320px root 200%, the static-list `遊ぶ` label split into one character per line and introduction ended with an isolated `介`. [Before](independent-visual-action-beforefix/root200-play-focus-320.png), [pin](independent-visual-action-beforefix/source-pin.json) | Fixed/rechecked: [after](independent-visual/root200-play-focus-320.png), play label one line at 126.03×69.59px; introduction gets its own row. |
| B3-VIS-04 | P2, high impact | Lower featured making-article titles were nearly invisible, 1.028:1; descriptions and Project-preview prose/definition labels were 2.336:1. Useful making destinations and output/done-condition explanations lost readable decision content. [Featured](independent-visual-lower-beforefix/lower-featured-375.png), [preview](independent-visual-lower-beforefix/contrast-original-preview-375.png) | Fixed/rechecked on 3182. |
| B3-VIS-05 | P2, lower impact | Lower continuation numerals 2.652:1; trust emphasis 1.172:1 / methodology link 2.652:1; footer group headings 1.172:1. [Trust](independent-visual-lower-beforefix/lower-trust-375.png), [footer](independent-visual-lower-beforefix/lower-footer-375.png), [results](independent-visual-lower-beforefix/contrast-results.json) | Fixed/rechecked on 3182. |

No P0 or P1 was found. All five findings were fixed and independently re-rendered. Normal 320/375 layouts, list/no-JS, author/image displays and enlarged actions remained usable. VIS-04 featured title improved to 12.279:1; Project-preview prose to 8.111:1. VIS-05 trust emphasis/footer headings improved to 14.794:1 and the methodology link to 10.153:1. [Featured after](independent-visual/contrast-original-featured-375.png), [preview after](independent-visual/contrast-original-preview-375.png), [trust after](independent-visual/contrast-original-trust-375.png), [footer after](independent-visual/contrast-original-footer-375.png). The expanded review covers lower-page roles as well as the original upper-surface sample.

A minor P3 remains under synthetic 200% enlargement: the decorative header arrow exceeds its small pale square; the containing action, label, focus and layout remain usable. This is in enlarged header/menu captures and does not block acceptance.

## Rendered review and comparison

The desktop and narrow first views show playable games, the selected game's title/artwork, authorship and an explicit `遊ぶ` action. Header destinations and the next-chapter section connect play to learning, tool choice and making a game. This is the owner-adopted game-first Home scope. The existing category browser, idea form and Project example remain below it.

The B3 diary/pixel logo, integrated header panel, architectural light/planes, front face and two staggered card edges remain recognizable against the approved mock. The center image is unobstructed; neighboring cards peek as a carousel cue. Image backgrounds and the frame do not darken or crop the selected source image. Replacing the mock's small position marks with 44px arrows plus a count/list control preserves a discoverable operation. The added mobile menu provides the existing site destinations.

| Surface / method | Independent evidence / result |
|---|---|
| 1440×900, 375×667, 320×667, viewport-reflow | [Desktop](independent-visual/home-1440.png), [375](independent-visual/home-375.png), [320](independent-visual/home-320.png). Main play target bottoms: 828.94, 618.34 and 609.63px respectively, within each initial viewport. No document overflow. |
| All 8 games at 375px | `work-*-375.png`: monster-construction, aramon, create-monsters, aura-connect-battle, tomoshibi, punching, rakugaction, sumaraku. All independently opened and inspected; titles, descriptions, genre, author/source credits remain. Portrait Create Monsters is letterboxed and fully visible. |
| Approved image bytes | [Image provenance](independent-visual/original-image-provenance.json): all 8 repository source images exactly match the approved mock assets by SHA256. Natural dimensions and `object-fit: contain`, filter none, opacity 1 are recorded in the rendered checks. |
| List mode / no-JS | [320 list](independent-visual/list-320.png), [no-JS](independent-visual/no-js-320.png), full captures and DOM metrics: eight complete artwork/detail/play groups remain in natural flow. |
| Synthetic-root 150% / 200%, 320px | [150](independent-visual/root150-320.png), [200](independent-visual/root200-320.png). Header wraps instead of overlapping. The showcase uses a full static list. Prose remains readable; the main actions now wrap as semantic units without one-character label lines. Enlarged states may require vertical scrolling. |
| Independent text-spacing / long title | [Spacing](independent-visual/spacing-320.png), `spacing-long-title-320.png`: 1.5 line height, 2em paragraph spacing, .12em letter spacing, .16em word spacing. The long Japanese title expands naturally, and controls remain reachable; no horizontal document overflow. |
| Reduced motion / keyboard | [Reduced keyboard](independent-visual/reduced-keyboard-320.png), [200% image focus](independent-visual/root200-keyboard-focus-320.png), [200% menu focus](independent-visual/menu200-keyboard-focus-320.png): bounded keyboard transitions and visible gold/green focus; selection remains explicit and stable. |
| Main destinations | Actual clicks reached the beginner making article, `/tools/`, the Home idea-form anchor (textarea focus), `/project/`, game category `/articles/?hubEntry=home&hubCategory=games`, and the Aramon production article. Destination screenshots and URLs are retained. Category title activation worked; its separate description is not presented as a clickable control. |
| Contrast, rendered pixels | [Final results](independent-visual/contrast-results.json): 269 visible text-node observations across 14 rendered views (initial three widths, next chapter, idea form/default+expanded, categories, menu, Project preview, continuation, featured articles, input examples, trust and footer), zero failures. Small text minimum 4.758:1; large text minimum 5.885:1. The cream idea form retains its dark foreground. Background is captured with disposable text-transparent browser styles after geometry stabilizes; closed details, sr-only text, covered/inert content and neighboring unselected cards are excluded. No full-site accessibility certification is claimed. |

The final executed 3182 source snapshot has zero browser page errors in the 32 named main rendered/navigation checks. Seven additional fresh-category/enlarged-anchor/focus observations are in [final-additional-checks.json](independent-visual/final-additional-checks.json). The report does not substitute CSS/overflow metrics for visual inspection: the referenced screenshots were inspected individually.

## Measured enlargement and final regressions

The normal list and 150/200% cases record nine exact computed roles before/after root mutation (including their line heights), rather than inferring enlargement from the root value. Representative font sizes are:

| Role / scoped selector | 100% | 150% | 200% |
|---|---:|---:|---:|
| Brand strong | 16px | 24px | 32px |
| Home introduction H1 | 30px | 45px | 60px |
| Static-list game title | 25px | 37.5px | 50px |
| Static-list game description | 14px | 21px | 28px |
| Image author/source credit | 9px | 13.5px | 18px |
| Frame metadata | 8px | 12px | 16px |
| Static-list note | 11px | 16.5px | 22px |
| Play action | 14px | 21px | 28px |
| Introduction note | 11px | 16.5px | 22px |

Fresh `/?hubCategory=voice#categories` with empty browser storage was independently rendered at 375 and 320px. The focused voice category was visible (bottom 472.95 / 486.38px in 667px viewports); it no longer sits offscreen. The first Tab transition was also rendered. At root 200%, the making anchor title appears below the measured wrapped header, and the idea field and primary making action are reachable by keyboard. See `fresh-category-voice-*.png`, `root200-create-*.png` and the additional checks.

Diagnostic capture/analysis sources are retained as text under `independent-visual/diagnostics/` for reproducibility. They only use disposable browser state and evidence paths.

## Limits and remaining gate

- Methods are viewport reflow, synthetic root text enlargement and text spacing. They do not establish browser zoom, OS text enlargement or physical-device behavior.
- Actual iPhone/Android, Safari, touch/soft keyboard, screen reader, safe-area behavior and device GPU/battery: **UNTESTED**.
- Deployed Preview/Production, actual external game play and live affiliate conversion: **UNTESTED by this reviewer**.
- Parent owns quality/build/E2E, remote preservation, PR/CI/deployment and owner-authorized merge gates; their reported successes were not independently rerun by this visual reviewer.
- Required next step: verify all 11 reviewed runtime/data hashes against the final remote head after the evidence-only commit. Any changed runtime file needs affected acceptance to be repeated. A source-hash match after a documentation-only commit permits a fresh exact-head binding without pretending that an older head approval applies automatically.
