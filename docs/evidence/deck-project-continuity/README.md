# Scoped deck and Project handoff repair

Base: `cd97360383a84b2f220dcc22343035d990f7503b` (fresh origin/main).
Launch: owner-authorized continuation of the saved-environment diagnostic;
source thread `01a0f210-6698-766f-b8b3-d686388b203d`. No Issue/legacy Work dispatch.
Implementation and local inspection: Codex. Independent review: parent/coordinator,
pending. These captures are implementation evidence, not independent acceptance.

## Before / after

- **Deck**: at 375/390 × 844, open `/articles/#start`, choose `円環で見る`,
  swipe horizontally on the active image/title. Baseline stays on article 1;
  buttons work. Trusted touch events lose implicit capture on the child when
  capture transfers to OL. The bubbling loss cleared the gesture. Mouse native
  drag also caused pointercancel. The repair ignores child capture transfer and
  prevents native card drag only in deck mode. A left swipe now advances one
  article; right reverses, last wraps to first. Cancel, multitouch, short drag,
  resize and subsequent gestures are covered. Taps, vertical scrolling,
  buttons, keyboard, session preference, focus fallback, 320px and reduced-motion
  list behavior remain covered. Layout is unchanged.
- **Stack**: `/stacks/2d-rpg/` → `この構成を条件に合わせる` →
  `/builder/?template=2d-rpg` → enter `2D RPGを作りたい` → create roadmap.
  Baseline leaves platform/engine/budget/experience unknown. The repair fills
  desktop/Godot/low/beginner (and commercial), labels inherited conditions, and
  leaves team/locale unknown. Changing engine to Unity and budget to free before
  generating survives into the plan URL. Explicit input and unresolved input
  conflicts take precedence over a template; an older session idea is not
  silently reused for a newly selected template.
- **Article return**: browser-game article → article-end Project CTA → enter
  `初心者向け猫タップ得点ブラウザゲーム` → confirm starter → footer Tools →
  first tool's Compare link. Baseline has no Project return control; the generic
  footer Project link restarts condition confirmation. The repair preserves the
  original draft, structured conditions and bounded article source through two
  Tools/Compare/return cycles, reload, and browser Back. Direct Project baseline
  still works. Draft contents were not deleted by the baseline failure.

`before-*` captures/events are from the untouched base diagnostic. The new touch,
Stack and article-flow regressions were also executed against the unchanged base
and failed: unchanged article count; `platform=unknown` instead of `desktop`;
missing `制作中のゲームに戻る →`. All new regressions pass after repair.

## Template boundary

Only equivalent scalar fields are transferred: genre, dimension when explicitly
2D/3D, platform, engine, budget, experience and commercial intent. Browser/mobile
is not a dimensionality. Coding preference, asset requirements, voice/BGM
necessity and integration importance remain visibly listed as original reference
settings, explicitly not automatically applied. Asset requirements are not
invented AI-capability requests. The notice links back to the selected Stack.
No Project schema expansion or new inferred constraints are introduced.

## Methods and limitations

- Local production build only, Chromium 151.0.7922.173. Playwright mobile/touch
  contexts, native mouse/keyboard/tap and CDP `Input.dispatchTouchEvent`.
  Recorded pointer events are browser-generated and trusted, not manually
  dispatched DOM PointerEvents. This still does **not** prove physical touch.
- `checks.json` records the 10 relevant passing E2E tests (six new, three existing
  deck tests, one existing article attribution/completion test). Quality and
  production build pass. The environment's installed Ruby was added to the
  command PATH/RUBYLIB to run workflow validation; no runtime/workflow changes.
- Visual inspection: deck at 375/390; static fallback at 320; Stack notice and
  fields at 1280/375/320; synthetic 200% root text at 320. The new note and labels
  remain readable and controls reachable in inspected captures. Root-text
  enlargement is not browser/OS zoom. No category/card redesign or CSS change.
- WebKit installation was attempted using `PLAYWRIGHT_BROWSERS_PATH=/tmp/gameai-browsers
  npx playwright install webkit`. All supported mirrors returned HTTP 403
  `Domain forbidden`; no security/account workaround was attempted. Local
  Playwright WebKit: **BLOCKED / UNTESTED**. Actual iPhone Safari and Android:
  **UNTESTED**. Safari is not declared fixed on Chromium evidence.
- New browser regressions allow only loopback requests and set analytics
  exclusion. Existing tests use the repository analytics-blocking fixture.
  Production/Preview navigation, merge, auto-merge, deploy and Issue closure are
  outside this task. Full historical acceptance was not rerun.

## Reproduction

Use the repository's existing Playwright config (set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium` where needed):

```sh
npm run quality
npm run build
npx playwright test e2e/deck-project-continuity.spec.ts
npx playwright test e2e/issue-157-stage-b.spec.ts -g 'Creation Deck'
npx playwright test e2e/measurement-baseline.spec.ts -g 'article → Project'
```

Local execution reused the already-built localhost server via a temporary config;
the retained specs also run with the repository config. Native CDP touch tests
explicitly skip non-Chromium engines instead of pretending to cover WebKit.
