# Independent Stage B rendered review

The independent reviewer inspected the committed screenshot set and current diff, without editing implementation files.

## First pass

- P1: horizontal Deck drag did not suppress its following anchor click.
- P1: the manual list/Deck choice did not persist across remount/reload.
- High-impact P2: durable captures did not show Deck mode, and fixed stage heights did not follow natural card content.
- High-impact P2: integrated evidence remains incomplete for 320/375 rendered captures, 150/200 text roles, and several dynamic application states.
- P3: one post-interaction list screenshot contained an ambiguous focus/capture artifact.
- No P0 was observed. Normal Home/Project/Compare/Articles captures retained clear hierarchy, usable CTAs, full START content, and recognizable Mint Atrium/Crafted Ceramic treatment.

## Fix and retest

The Deck now suppresses only the click following a recognized drag, stores the manual mode in session storage, measures natural card height after resize/font settlement, and captures active Deck mode before returning to the list. Focused Vitest and Playwright checks passed after these changes.

The evidence-completeness P2 remains open and is reflected honestly in the matrix: Stage B cases are `IMPLEMENTED`, not `VERIFIED`; final execution must continue to reject them until all required same-observation state/scale records and rendered reviews exist. Physical-device, protected Preview, and Production remain untested.

## Correction review and second pass

An independent source-and-render review of the follow-up found one additional P1: `getBoundingClientRect()` included each inactive card's scale transform, so a taller inactive card could be under-measured. The implementation now reads each top-positioned card's untransformed `scrollHeight`; the stability regression also enforces an absolute stage bound and verifies that the settled stage contains the maximum intrinsic card height. The focused application retest passed.

The review also raised pointer-capture coverage as P2. Source reinspection confirmed that capture is acquired on the owning `<ol>` as soon as horizontal drag is recognized and that pointer ID, cancel, lost-capture, resize, visibility, and second-pointer paths clear gesture ownership. Exhaustive rendered pointer/pinch/click-suppression fixtures are still missing, so this remains an evidence-completeness P2 rather than an accepted behavior claim.

Second-pass rendered inspection found no P0 and no remaining observed P1 in the current Deck or breadcrumb captures. It does not close the explicit final-matrix boundary documented in the Stage B README.

## Evidence-first continuation review

The independent adversarial pass found three high-impact P2 gaps in the first
V2 emitter draft: asserted focus/order/association geometry, state names backed
only by metadata roles, and no delayed-font completion in the TOC interruption
negative test. The follow-up binds each state to its risk-bearing roles, writes
measured semantic-row geometry and DOM relationships, derives applicability
from the case requirement, and makes PASS depend on those diagnostics. The TOC
test now delays `document.fonts.ready` past real wheel input and proves that its
completion cannot restart reconciliation. The targeted second pass completed
2/2 after these changes. No P0/P1 was found; Project/V3/V4/final evidence remains
outside this checkpoint rather than being inferred from Home.

## Project evidence adversarial review

An independent source/screenshot review found three blocking gaps in the first Project package: programmatic focus could overwrite a failed keyboard result; token records omitted real note/file/runtime-error surfaces; and semantic-row/text-scale coverage could be asserted as tags without executing those methods. The correction now retains the bounded Shift+Tab/Tab result without a programmatic acceptance fallback, exercises nonempty project/task/workspace-note/file/runtime-error roles, calls the semantic-row probe with squeeze widths, and performs actual 150% computed-text workspace measurement. The named Project subset was then re-executed at clean source checkpoint `af9b59950ccc089e7ef58e44c27bc7876ac5fca6` and passed with 16 records. No P0 visual defect was reported; sampled primary/secondary hierarchy was preserved.

## Consolidated runtime review

The independent reviewer inspected current normal/stress Home, Project, Deck, reading, Compare, and Tools captures and the runtime diff. No P0/P1 visual defect was found. One high-impact P2 was identified: the first fit-safe implementation accepted an absent Deck control node as fitting and did not guarantee a post-mount control measurement. The correction now mounts a candidate control group, validates its real client/scroll width in a layout effect before exposing availability, and falls back to the unchanged list on failure. A disposable overflowing-control regression accompanies the fix. Pointer/drag cancellation still clears both the queued animation frame and transient transform.

The independent review did not execute physical devices, Preview, Production, genuine browser/OS zoom, or every temporal pointer/pinch path. Those limitations remain explicit rather than being promoted to PASS.

## Final integrated review — 2026-09-30

The independent reviewer inspected the current V1/V2/V3/V4 normal and stress captures. No P0 or P1 was found. One high-impact P2 was found in `final/v4-dynamic-200.png`: enlarged neighbor-card text visually interfered with the active circular card. The Deck fit gate now rejects title text above 32px or description text above 24px and retains the same ordered list. The refreshed 200% capture shows the list fallback with readable natural-height cards; second pass found no remaining P0, P1, or high-impact P2.

The reviewer also confirmed task-first route continuity and source-level preservation of Compare canonical/noindex behavior, ElevenLabs v4 metadata, and sponsored affiliate rel/events. Local Chromium evidence does not establish Production, protected Preview, physical-device, genuine browser-zoom, or OS-scaling acceptance.
