> 引き継ぎ用コピー。判定本文は元レポートのまま、リンクのみ保持済み画像／JSONへ調整。未保持の一時証跡はその旨を表示。元レポートSHA256: `31d9e1e8143890e9c2afc024382e0ce82db2d22364466c9c345569060c0ba5f8`。

# B3 components independent second pass — e555

**Reviewed fixes verified; no remaining P0/P1/high-impact P2 found in this review’s scope.** All six findings from0419 were reproduced on the new runtime and checked after repair. This is bounded independent interaction/state review, not a claim that every route/state or physical device has passed visual acceptance.

## Evidence identity and method

Source `e555d81678440a2faa76538b83e22f875ee96e93`; stable local runtime `http://127.0.0.1:3102`; build `zRTspQ8ojf93LGGMfzTnt`. The worktree BUILD_ID was read and matched the supplied pin. Source reads/diffs were commit-bound. No repository/source/test/Git/build/server writes by this reviewer. Results from0419 and older f05 are not relabeled as e555 results.

Chromium/Playwright used separate browser contexts, local analytics exclusion in the **top frame only**, and localhost-only requests. No Production or external tool/game execution. Viewport emulation is labeled separately from synthetic root/computed text resizing. Clipboard testing used the isolated browser context; no real external provider call was made.

## Six findings rechecked

| Original finding | Actual new-pin verification | Result / evidence |
| --- | --- | --- |
| R1 invalid field specificity | Both Project and Builder: abort the local interpret API; enter the original Steam/3D/Unity/horror/abandoned-station/monster-tracks-sound idea; include all extracted details; replace first detail with one space; submit. Actual textarea is `aria-invalid=true`, focused, **2px danger `rgb(163,59,53)` border**, with3px green focus ring. Same boundary survives synthetic root text200% at375px. Replace the empty detail and submit again: plan renders, abandoned-station detail survives, invalid controls/error summary count0. | Verified. `e555-fixes-manifest.json`, normal and enlarged Project/Builder invalid images. The screenshots center the field for inspection; they do not independently establish native autofocus scroll position at every size. |
| R2 pressed detail decisions | On both routes, include=true uses dark frame/light ink while ignore=false uses neutral paper. Click ignore: the dark role moves to ignore=true; click include: selection returns. State and two appearances differ in actual rendered controls. | Verified. Include/ignore records and `e555-project-ignore-selected.png`, `e555-builder-ignore-selected.png`. |
| R3 native provider/recovery buttons | Controlled local provider response exposes **nine actual field-confirmation buttons plus capability confirmation**. All now have neutral gradient,1pxsage boundary,7px radius, height≥44px. Submitting before confirmation still gives the “残り10件” error. Confirm all10 → real plan renders → “ここで詰まった” opens recovery. Actual consultation copy button has the neutral material; clicking it reports success and copies401characters into the isolated browser clipboard. | Verified. `e555-fixes-manifest.json`, provider/capability/recovery images. The warning panel retains its meaningful yellow surface and dark prompt material. |
| R4 Privacy33px native control | Actual `.trust-sections button` is now neutral material and **45.1875px high**. It was observed without clicking to reenable analytics collection. | Verified. `e555-privacy-44-neutral.png` and corresponding fix record. |
| R5 zero/loading old frame | Real Tools search for an absent token reaches `.no-results`: paper `rgb(250,248,242)`,2pxolive boundary,9pxradius and depth. “条件を解除” restores29tools and clears search. Real Compare SSR/Suspense `.loading-panel`, held in a JavaScript-disabled context, now shares the frame; Tools/Guides DirectoryState still shares it. | Verified. `e555-fixes-manifest.json`, `e555-ssr-state-manifest.json`, zero/loading images. JS-off fallback observation is not an actual runtime-boundary throw/reset. |
| R6 provenance colors flattened | Actual fallback clarification with one manually confirmed budget yields explicit green `rgb(49,90,66)`, confirmed blue `rgb(39,100,198)`, unknown orange `rgb(194,65,12)`. Shared recess/radius remain while text and meaning distinctions survive. | Verified. `e555-provenance.json`, `e555-provenance-375.png`. These are rendered provenance elements, not a synthetic styling fixture. |

## Generic fallback regression checks

`e555-flow-manifest.json` has16actual interaction captures. Home375 deck→list→Create Monsters detail→browser Back preserves `homeView=list`/`homeGame`/`#games` and focuses the real static detail link. Category→voice→article→Back preserves `hubCategory`/`hubArticle` and restores the exact article face. START’s304px active card fits inside313pxdeck; overview expansion retains its description node. Synthetic root text200% at375 changes to list mode and retains the complete description/focus ownership.

Tools goal3D → Meshy compare preserves `ids=meshy&goal=3d&stage=3d`. Compare add/remove,2→4 candidates, fifth disabled choice, `diff=1`, browser Back/Forward, summary focus after removal, and clear-to-zero while retaining context all pass. The generic fallback leaves the selected goal’s dark role and disabled behavior intact.

At320px with synthetic root text200%, menu open initially focuses Close; Tab reaches Games; ShiftTab wraps to Privacy; main stays inert; Escape restores menu-button focus and releases inert; ShiftTab reaches the CTA. Actual menu/CTA keyboard outlines are3px, the last link is visible and the arrow fits. Tools320 computed text resizing verifies16px→32px factor2 with the short “コード” option on one line.

`e555-keyboard-manifest.json` records actual Tab navigation to Home’s list button and the article overview control. Home keeps its dark authored material and amber3pxoutline. Article expand stays a transparent underline control,48pxhigh, **box-shadow none**, with green3px keyboard outline; Enter expands it, leaves the “概要を閉じる” control focused, and preserves the outline. Recorded targets are fully visible below the header. The game-detail local breadcrumb record is an unfocused surface inspection, not keyboard-focus acceptance; its `.game-card-actions` diagnostic query has no matches on that route and is not used to claim geometry.

`e555-moves-manifest.json` separately verifies Home next/previous controls and ArrowRight change/restore the selected game and `homeGame` state while the authored dark navigation and48pxamber play links remain. Article next/previous controls work; a native Playwright mouse-pointer drag advances the active article and settles to idle. Pointer simulation is not physical touch-device acceptance. Local game-detail navigation/return was also exercised in the core Home flow; external Play URLs were not executed.

`e555-anchor-root200.json` verifies a real Privacy `#analytics` click at320px/root text200%, waits for stable native smooth-scroll geometry, and does **not** force scroll. Heading top366.6875/bottom556.765625 lies below154.671875pxheader and inside667pxviewport. Width diagnostics are clean.

## Route/property sweep versus actual visual inspection

`e555-route-manifest.json`: **231 property/reflow records =76 existing routes plus global404 ×375/320/1440**.228HTTP200,3HTTP404. Document overflow0 and unowned overflow0 in every record; unknown page errors0; external requests0. Inner family selectors have nonempty rendered style records on their actual matching routes. Only **eight representative route screenshots** were produced; this is not231route screenshots or231independent eye judgments.

`e555-controls-manifest.json`: at375px, all77routes’ ordinary rendered `main button` controls were inventoried:48visible controls,0below44px,0native outset boundaries; unknown page errors0/external requests0. This scan covers each route’s default visible state; hidden/provider/error branches are covered by the explicit interactions above, not presumed covered by that48count.

Actual screenshot eye review was limited to14 named representative images (see `e555-visual-inspection.json`): Home upper/middle; expanded START card; article keyboard overview control; enlarged menu; Project normal invalid and ignore-selected; provider confirmation; Privacy control; provenance; Builder enlarged invalid; Compare SSR fallback; consultation copy; Tools zero results. These show the inner surfaces and live states relevant to the repair. All current artifacts include45screenshots, but uncited screenshots and property-only routes are not declared individually visually accepted. No new material inconsistency or blocking layout defect was found in the eye-reviewed samples.

## CSS budget and technical evidence

`e555-css-budget.json` measures the actual compiled B3/deck/v2/Home stylesheet using browser `CompressionStream('gzip')`: `06842dxd0fube.css`,35484raw bytes, **8153gzip bytes ≤8192**. Parent’s Node measurement is8157; both use the unchanged8192threshold. No split/offload or relaxed gate is introduced. Other global/font stylesheet sizes are listed separately. The bundle includes the restored game-actions rules.

Read-only diff0419→e555 shows the scoped CSS repairs/cleanup, Home heading balance, and test/ledger changes; no application JS/data/URL/storage/sandbox/analytics changes. No build or repository tests were run by this reviewer. Parent separately reported build PASS, targeted22/22, optional voice1, and copy-inclusive A-flow1 PASS; these are parent-reported gates, not independent runs here. Draft/full CI remains the parent’s next gate.

## Diagnostic failure classification and untested scope

`e555-keyboard-failure.txt` is retained from the first **review-script label mismatch**: it sought “概要を折りたたむ”; the product’s existing exact label is “概要を閉じる”. No product/test/source change was made. Correcting that diagnostic label and rerunning the same real Tab/Enter sequence passed; latest keyboard manifest contains6records and no page errors. This file is not a current product failure.

UNTESTED: physical iPhone/Android/touch/soft keyboard/OS clipboard and file handling; native browser/OS zoom or accessibility text resizing; other browser engines; every route’s full state combinations; exact native invalid autofocus scroll at320/root200; font-failure/forced-colors/reduced-motion combinations; actual runtime-error-boundary throw/reset; real external provider/network execution; external game/tool destinations; download/file-picker outcomes; full embedded article-game runtime/error/copy/recovery/victory/reset. Older f05 game-play checks are not promoted to this pin. Responsive evidence and synthetic resizing above remain positively checked rather than being converted into physical-device claims.

The six original findings are closed on the reviewed e555 runtime. No new blocking finding remains from this reviewer. Keep the final source/build frozen through the parent’s Draft/full-CI gates; evidence must stay tied to this pin or receive a clearly identified supplement.
