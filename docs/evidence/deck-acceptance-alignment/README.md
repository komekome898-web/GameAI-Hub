# Adopted deck design: acceptance alignment

Scope: test-only repair of the two failures reproduced on
`bba9dca8963e729a578837b06d531c80c2687fbc`. Parent independently inspected six
images, measurements and failure logs, and accepted that these two conditions
showed test/specification mismatch, not evidence of a product display defect.
No runtime, CSS, content, category, dependency or workflow changes are included.

## Detection contract before and after

- At 320px and synthetic 200%, adopted 14px metadata becomes 28px. The longest
  label needs 294.9px in a 270px row. The former unconditional one-line assertion
  failed on natural two-line wrapping. Single-line layout remains required when
  measured natural width fits the row. Full text, containment, nonoverlap,
  at least 7px label/date separation (8px design gap with 1px tolerance), and
  the existing ordinaryLabelSqueezed check remain required. Text is never shrunk
  to satisfy the test.
- Generic clipping probes still report all clipping. Only exact summary-node IDs
  earn an observation-level exception, only for vertical (never horizontal)
  clipping, after proving: one actual summary per card; unique nonempty ID;
  three-line clamp with at least three lines' natural height where needed;
  one enabled, visible, focusable same-card button with matching aria-controls
  and aria-expanded; actual keyboard expansion; unchanged, visible, unclipped
  full text after expansion and in list mode. The helper restores initial
  collapsed state and selected article. A missing recovery control fails.
- The existing deck viewport exception is restricted to horizontal clipping;
  vertical viewport clipping is no longer excused. No other text, paragraph,
  ancestor or overflow exception is added. Inactive-card width ownership now
  requires an actual matching card and a finite nonzero distance, eliminating
  accidental ownership when the card is absent.
- Observations await fonts, rAF idle/zero pending frames/integer target,
  intrinsic card-height containment and geometry stable across frames.

`e2e/deck-acceptance-contract.spec.ts` includes positive recovery and negative
fixtures for missing summary/button, wrong aria-controls, disabled button,
collapsed height loss, expanded clipping, list clipping, unrelated clipped copy
and outside-deck overflow. These use disposable DOM changes only. Existing
assertions are retained or narrowed; no skips are added.

## Execution and handoff

The previously failing tests are `issue-155-v1.spec.ts` (320px synthetic 200%)
and `issue-157-final-evidence.spec.ts` (V4 dynamic input). Final execution uses
`npm run quality`, the production build, and the complete `npm run test:e2e`
sequence, including its separate final cross-route reconciliation. The evidence
emitter requires a clean local source checkpoint; it is not bypassed. Execution
logs, manifests and relevant PNGs are retained in the Library evidence ZIP named
in the PR/task handoff, pinned to that checkpoint. Generated historical files
are not silently rewritten as earlier acceptance evidence.

Physical Safari/Brave feel, OS focus and VoiceOver remain UNTESTED. No merge,
auto-merge, deploy command, Production/Preview navigation or legacy dispatch.

## Readiness and node-identity follow-up

The 2e7074e full run had 167 passes, two first-attempt flakes (V4 budget
measurement and deck focus setup), and one game-article failure; its separate
115-record reconciliation passed. Those results are retained in the prior
Library blocker ZIP and are not treated as a successful full run.

The owner subsequently authorized three test-only readiness changes: wait for
parent iframe geometry to stop scrolling before each existing real game-button
click; await client deck availability before V4 budget measurement; await deck
availability and assert mode before deciding whether focus setup needs the real
circular-mode toggle. The game still receives exactly three attack clicks, with
HP18 →12 →6 →victory and reset/recovery assertions. No forced click, added retry,
extra attack, runtime or content change is used.

Recovery also retains original paragraph DOM handles and requires identity after
expansion and list transition. Two negative fixtures clone and replace a summary
with identical ID/text after each transition; both must fail the identity check.
Final logs and exact-head evidence are supplied in the new Library handoff.
