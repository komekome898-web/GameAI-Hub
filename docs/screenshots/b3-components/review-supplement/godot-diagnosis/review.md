# Independent review of Issue157 Godot no-workspace clipping observation

Source equivalence: submitted `7e8d8313fce958e83104a89e864471d72b6fa262` runtime/test sources match reviewed `e555d81678440a2faa76538b83e22f875ee96e93`. Actual local runtime: port3102, build `zRTspQ8ojf93LGGMfzTnt`. Repository/source/test/Git/build/server were read-only. The original CI fixture was loaded from immutable `git show7e8`; the same Godot idea and engine override were used. Local API fulfillment reproduces the existing deterministic test fixture, not a real provider call. Top-frame-only analytics exclusion and localhost-only requests were used.

## Conclusion

The initial375px CI count of **13** represents non-painted elements: all13 have `checkVisibility=false` even though Chromium exposes nonzero geometry and145client/152scroll widths. Some are in beginner Quest sections whose ancestors have `display:none`, and the secondary-plan copies are behind closed native disclosures. The source’s `clippedText` branch does not filter these non-painted branches; its focusable branch separately filters closed-details descendants. A rendering-visibility correction to the probe is therefore justified by actual evidence.

**Visibility filtering alone is not proof that every expanded warning fits.** Opening the ordinary secondary plan and the first applicable fit disclosure by real native summary clicks reveals one375px warning LI with `checkVisibility=true`,145client/152scroll. The final closing “）” has a TextRange right287.046875 versus the LI right280: **7.05px beyond its own box**. The screenshot shows the complete warning, including the closing punctuation, inside the surrounding warning frame. It does not appear cut off or hidden; document/unowned overflow both remain0. Nevertheless this is real visible leaf overflow, not the initial hidden-state artifact, and must not be erased by a visibility guard or manually turned into PASS. Treat strict expanded containment as an unresolved P2 contract finding until repaired or addressed through a separately evidenced, approved diagnostic semantics decision. No P0/P1 or visibly lost warning text was established.

At320px, the same real disclosure opens and the overflowing-LI scan returns0. The displayed warning remains legible. This does not override the375px result.

## Actual evidence

`observations.json` contains two independently reproduced states:

-375px: initial overflowing LI13, initial visible0; open secondary “工程・Prompt・リスクの詳細を見る” and inner “適合度の根拠を見る” through real UI; one of the13 becomes visible with the same7px geometry discrepancy. Current target’s first warning “Godot連携は未確認” itself fits145/145; the later free-plan exclusion warning in that same opened disclosure is the visible145/152 item. The distinction matters: do not report only the first fitting LI as the whole disclosure’s result.
-320px: initial overflowing LI0; the same disclosure opened; visible overflowing LI0. Both document-width diagnostics are0.

`fit-open-375.png` and `fit-open-320.png` are actual element screenshots of the opened native disclosure. Both were inspected with view_image. No `open=true` DOM assignment, style override, hidden-state mutation, reviewerDecision/PASS rewrite, forced click, or test threshold change was used. Native summary clicks opened ancestors from outside inward.

The first attempted global `.phase-warning li` target belonged to a CSS-hidden beginner blocked Quest (`action-step.is-blocked`, computed display:none; its inner section also display:none). Its summary could not be clicked as a visible user action. That was diagnostic target selection, not a product-control failure. The corrected target is `.secondary-plan .fit-details .phase-warning li`, which can be opened in the **original beginner/Godot state**. An intermediate-experience variant was proposed during investigation but was not needed or used. A temporary `.secondary-plan.beginner-plan-details` locator also matched0 because Godot uses the ordinary secondary-plan branch; that hypothesis was corrected before the successful measurement. `failure.txt` is retained from that obsolete diagnostic selector and is not a current product failure.

## Probe repair safeguards

A justified probe change should filter only elements that are not actually painted because of their rendering visibility/hidden ancestor or closed disclosure state. Do not use nonzero getClientRects as proof of visibility. Preserve detection of visible horizontal/vertical clipping, non-owned visible overflow, undersized/reachable/focused controls, and clipped text inside a still-visible summary. A blanket exclusion of every closed details node would wrongly hide its visible summary/children from checking.

Retain meaningful visible-overflow/clipping negative fixtures. Add evidence that a non-painted branch with nonzero geometry is excluded, that its visible summary is still checked, and that opening a disclosure makes its actual text participate. The current opened375 warning should stay detectable by the present strict horizontal criterion until its layout is fixed; the native expanded captures above are a required supplement to the original default-state record.

No source/CSS/probe/test repair was implemented by this reviewer, and no full-suite PASS or new build acceptance is claimed. The parent’s official CI/local reproduction is separate evidence. Physical devices, browser-native zoom, and other engines were not tested here.
