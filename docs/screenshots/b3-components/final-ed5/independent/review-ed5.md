# Focused R7 repair review — ed5

**R7’s visible warning overflow is repaired in the reviewed375px/320px states. No remaining blocker was found in this affected branch.** This is a focused Project disclosure review, not a final whole-site visual re-review or a full-CI verdict.

Source `ed5fd95902de06fe9cc1e54a50882c69842d7bb5`; local runtime `http://127.0.0.1:3102`; build `0am_yq1bZC1fJIszJq00d`. HEAD and BUILD_ID matched. All screenshots/measurements were newly collected from this compiled runtime. Previous R7 evidence remains before-fix and its saved hashes are unchanged (`source-build-hashes-ed5.json`). Source/app/test/Git/server/build/tracked screenshots were not written. No external destinations were executed.

## Actual reproduction and comparison

The original existing CI interpretation fixture was read from immutable `git show ed5`. The same “2Dパズル。Godot。ブラウザ。一人開発。初心者。無料。音声なし。3Dなし。” input and Godot engine override were used with local API fulfillment. The rendered Project has no beginner workspace. Experience was not changed to intermediate.

The exact free-plan exclusion was selected inside `.secondary-plan .fit-details .phase-warning li`. All closed native details ancestors were opened **outer-to-inner through real summary clicks**. The first phase was already open; secondary and fit were opened by clicks. All three ancestors are open in the resulting measurement. No DOM `open` assignment, forced click, CSS/style injection, content rewrite, or manual PASS/reviewerDecision adjustment was used.

| Actual viewport | Before-fix R7 expanded warning | ed5 expanded warning |
| --- | --- | --- |
|375×700 |145client /152scroll; final closing punctuation extended7.05px beyond LI |**145client /145scroll**,8px end padding; outside-right/left text glyphs0 |
|320×700 |102client /102scroll; visible overflow0 |**102client /102scroll**,8px end padding; outside-right/left text glyphs0 |

In both new-pin contexts, initial LI overflow0; initial root probe clipped text0; expanded visible LI overflow0; the opened fit’s strict probe clipped text0; document overflow0; unowned overflow0. The warning remains complete, including “不明）”, without being hidden by the visibility guard. Closing text was also measured inside the actual clipping ancestor and inside the captured viewport: final text bottom683.45/683.48px is below the64.64px sticky header and within700pxheight. Unknown page errors0; external requests0.

The actual compiled Globals stylesheet `3i-hm4teac6k-.css` contains the padding rule and has SHA256 `3bfe5847c422183984188c5bba5a527904e6e44689e3a981e1697581940e8663`. Browser stylesheet hashes and exact source-file Git blob/SHA256 identities are retained. Read-only diff from7e8 shows the sole app change is the original Globals warning LI end padding; test changes add native-visibility negative/positive cases and an actual Godot native-disclosure observation. JS/data/URLs/sandbox/material sources are unchanged.

## Keyboard, material and contrast

After the native disclosure click, actual ShiftTab→Tab returned to its summary. It was focused,44pxhigh and fully visible below the header:375 top394.33/bottom438.33;320 top378.42/bottom422.42. Its green outline remains3px with3pxoffset. The exact opened fit’s probe independently reports one focusable control, reachable/visible/verified, undersized targets0 and focus failures0. The initial root probe used zero focus samples; its focus verification is deliberately unverified and is not promoted to root-wide keyboard acceptance.

Actual warning material remains `rgba(255,209,102,.05)` over paper `rgb(250,248,242)`, ink `rgb(35,53,41)`,1pxwarning border `rgb(98,85,44)`. The card keeps2pxolive border,9pxradius and B3 depth. Source material/color declarations did not change. Text wraps to additional lines to reserve the punctuation space; it is not claimed that line wrapping stayed identical.

Calculated from those actual recorded solid parent/overlay colors, warning body-text contrast is **12.07:1**; green focus ring on paper is **7.40:1**. This uses color compositing and relative luminance, not an OS screenshot color sample (`contrast-ed5.json`).

## Screenshot proof and limits

All six new captures were inspected:

- `ed5-godot-warning-375.png` and `ed5-godot-warning-320.png`: complete affected warning section; authoritative text proof.
- `ed5-godot-warning-viewport-375.png` and `ed5-godot-warning-viewport-320.png`: complete affected warning visible in the actual viewport, including final punctuation.
- `ed5-godot-fit-open-375.png` and `ed5-godot-fit-open-320.png`: broader fit-context captures. The375 element capture ends partway through the lower warning at the viewport edge; **it is partial context, not proof of the final closing text**. Use the dedicated section/viewport captures above for the full warning. Capture scrolling is not used as proof of automatic focus scroll.

`observations-ed5.json` retains exact measurements, real-click ancestor actions, keyboard state, paint/clip bounds, source/build identity and actual compiled stylesheet hashes. The helper was transpiled directly from this pin’s test source; no clipping threshold or target floor was relaxed. The new probe source keeps visible clipped-summary/body negative cases, reopening detection and display-none/closed-content distinctions. No repository test/build/full-CI run was performed by this reviewer. Parent reported browser gated CSS8153/8192 and Node8157 on the new build; those are parent gates, not fresh measurements by this focused review. CI is pending separately.

UNTESTED here:1440px, native zoom or enlarged-text variants, physical phones/touch/soft keyboard, other engines, every fit/phase/Project condition, unrelated routes, and full suite/Production. The earlier sitewide review is separate evidence. This focused result closes the prior visible375 R7 finding for the reproduced original branch only.
