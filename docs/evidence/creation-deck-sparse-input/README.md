> Historical contract: the owner-approved [inertia design2.0](../../design/creation-deck-inertia.md) supersedes the no-free-inertia/one-card release rules below.

# Owner-approved sparse-input adjustment — 2026-10-03

Scope: three changes on PR #162 after owner-reported failure on iPhone SE3,
iOS18.3.2 Safari Preview: short flicks returned, initial movement caught, and
vertical scrolling took over. No recording was available. This is an observed
owner acceptance failure; the exact Safari event path remains unconfirmed.
The earlier CI success did not establish physical-device acceptance.

The owner authorized implementation after the read-only diagnosis at
`2ba302caa6d7e8ca8d050998c35429ee479f99f5`. This is an explicit adjustment to
design1.2, not a claim that new behavior satisfied its former sampling rule.
The original Library handoff and immutable repository handoff remain historical.

## Changed interaction conditions

- Keep the80ms recent sample window and100ms stale-motion cutoff. Retain one
  preceding sample when sparse delivery leaves only one recent point; reject
  intervals above100ms or nonpositive time. Replace the old >=16ms eligibility
  test with a16ms denominator floor. Require at least .06 cards of net recent
  travel (about10.2px at304px card width) before applying the existing .45cards/s
  assistance. A long hold, stopped movement plus tiny release jitter, or tiny
  fast movement does not earn flick assistance. Two real coordinate/time points
  remain necessary, but down/up can supply them; two move events are not required.
  No positions/times are invented.
- Keep8px intent distance; use symmetric1.15 dominance for both axes instead of
  horizontal1.3 versus vertical1.0. Small diagonal uncertainty remains pending.
  Move and up use the same decision function. Up resolves pending only, without
  requesting capture. Once vertical or cancelled, the interaction cannot revive.
- Re-measure on window resize and first-card ResizeObserver notifications.
  Cancel only when viewport width, stage width or card step actually changes;
  height-only changes preserve the contact while those values and availability
  stay unchanged. Reduced-motion/forced-colors/fit fallback still disables the
  hook and cancels. Active identity publication alone no longer cancels a new
  contact; existing fallback focus behavior remains.

Shared all-card fractional position, single rAF, time-based snap, page `pan-y
pinch-zoom`, cancellation-to-committed-card policy and one-link article semantics
remain. No global scroll lock, cancel-as-flick, category/content changes or new
feature is included. Aramon's global/stage touch-action:none is not imported.

## Verification and evidence boundaries

Before runtime edits, the changed unit expectations failed in two cases (short
interval and sparse window), with three tests passing. Final checks are run at
the clean local source checkpoint and supplied as raw logs in the Library ZIP.
Do not infer final results from this design description.

The new focused browser cases separately identify synthetic state/timing input
and native Chromium CDP touch/mouse. Synthetic capture requests are recorded,
not presented as browser-owned capture. Coverage includes up-only movement,
90ms sparse delivery, diagonal uncertainty, committed vertical, long hold,
pause+jitter, tiny motion, cancel then up, height-only resize, viewport/step
changes, availability fallback/recovery and a new contact at active publication.
Existing overview-focus, external terminal-event, motion and Project regressions
remain required. Input records and375px/390px captures accompany final logs;
full-suite evidence also covers320px/enlarged text and desktop.

A passing automated sequence establishes those bounded inputs only. iPhone
Safari gesture feel, actual event cadence/cancellation, toolbar-resize behavior
and frame-time performance remain UNTESTED after this change. Parent independent
review and later physical acceptance are separate. No Preview/Production
navigation, manual deploy, merge or legacy dispatch is authorized here.
