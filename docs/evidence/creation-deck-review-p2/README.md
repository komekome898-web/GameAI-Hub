# Independent-review P2 repairs

Parent/coordinator reviewed the 14 saved PNGs from
`017085b12c3d2180689276975cd408c182e102a5`, verified their Git blob identity, and
found no new display blocker at 375/390, 320 list, synthetic 200% or expanded
summary. This follow-up changes only the two reported interaction defects.
Physical Safari/Brave feel remains UNTESTED; that visual review is not phone
input acceptance.

## Reproduction and bounded repair

1. On `/articles/#start`, enable deck, focus the second article's overview
   button with actual `HTMLElement.focus()`, then resize to 320px. On 017085b,
   the button disappears without moving focus to its remaining article link.
   The new code checks the actual focused element just before forced list mode:
   only an overview button inside this deck transfers focus to the same card's
   link with `preventScroll: true`. Existing links and outside inputs retain
   focus. Resize/reduced-motion × collapsed/expanded states are covered.
2. Start snap using Next, press the mouse near the stage's left edge, move less
   than the horizontal threshold outside the stage and release. On 017085b the
   stage remains pending at a fractional position instead of settling. Vertical
   intent has the same missing outside-terminal path. Window pointerup/cancel
   listeners now exist only while a contact is owned; matching pointer ID is
   required. Contact/listeners are cleared before capture release, preventing
   double completion. Window blur cancels immediately to the committed card.
   Horizontal capture remains delayed, and touch-action/pan/zoom are unchanged.

`before-017085b.json` records both newly added regressions failing on the
unchanged local production build of 017085b before the repairs. The final
`browser-checks.json` records 27 passing focused cases on the repaired production
build, including ten new review regressions and the previous motion/Project
journeys. New cases cover pending/vertical × idle/snap interruption, outside
native mouse release, no movement from subsequent button-up mouse motion,
working next gesture, unrelated pointer ID, cancellation and blur.

Focus checks use actual focus(), assert preventScroll was passed, and preserve
surviving-link/outside-input focus. Window cancel/blur notifications and the
unrelated pointer event are synthetic; outside mouse release and later gestures
are browser-generated. They do not establish actual OS focus-loss behavior.
No article-deletion focus logic, crop settings or category work was added.

## Verification and remaining checks

- `quality.log`: quality PASS, 336 Vitest and 76 Python tests plus validators.
- `build.log`: local production build PASS.
- `browser-checks.json`: 27 focused Chromium tests PASS, with state attachments.
- Existing PNGs under `../creation-deck-motion/` are retained unchanged; no CSS,
  card layout, article data, Project handoff, workflow or dependency changes.
- Historical generated screenshots are restored rather than replacing their
  earlier evidence. No full historical acceptance rerun locally.

The previous head's remote quality passed, but its E2E job failed at
`Run npm run test:e2e` (run 37086754370, job 111098553774). The log download was
blocked with HTTP 403 Forbidden; available check annotations only say exit code
1, so the specific failing test is UNKNOWN. This is separate from the two
reproduced P2 defects and is not represented as resolved by these repairs.
New-head CI status is reported in the task handoff. Independent exact-head
re-review and owner merge approval remain pending. No merge, auto-merge,
deployment command, Production/Preview navigation or legacy dispatch occurred.
