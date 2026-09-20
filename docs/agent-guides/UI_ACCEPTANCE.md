# GameAI Hub — Rendered UI Acceptance

Use this guide only when a task materially affects rendered UI, layout, navigation, responsive behavior, or a user-facing journey.

## 1. Rendered product is the acceptance target

Do not approve UI quality based only on:
- source diff
- DOM inspection
- CSS inspection
- automated tests
- accessibility tree
- `scrollWidth <= clientWidth`
- implementer self-review

Launch and inspect the real rendered app.

The implementer must not be the sole final evaluator of substantial UI work.

## 2. Required viewports and stress cases

For relevant UI work, inspect at minimum:
- one desktop width
- 375px
- 320px
- 320px at 200% equivalent when the environment supports it

Also test when relevant:
- long Japanese copy
- long unbroken ASCII/token
- long URLs
- empty data
- error state
- expanded details/accordion

Do not claim physical-device acceptance from viewport emulation or CDP page scale.
If the environment cannot emulate a requested viewport, separate responsive evidence from physical-device acceptance rather than marking everything untested.

### 2.1 Fixed-width Work browser fallback

If the normal Work interactive browser cannot set an exact viewport, do not
approximate 375px or 320px by narrowing its fixed-width window. Use the
repository skill at `.agents/skills/playwright-interactive/` in a new Codex
session and run Playwright against the Preview URL. This preserves the existing
Work browser pass for desktop acceptance; it only supplies the missing,
deterministic mobile pass.

The checked-in skill is copied from OpenAI's official curated
[`playwright-interactive`](https://github.com/openai/skills/tree/main/skills/.curated/playwright-interactive)
skill at upstream commit `49f948faa9258a0c61caceaf225e179651397431`. Do not
replace its workflow with task-specific browser helpers. When updating it, copy
the complete upstream skill directory, including `SKILL.md`, `agents/`, assets,
license, and notice files, then update the pinned commit in this guide and the
skill validation test in the same change.

The skill has runtime prerequisites that must be verified, not inferred:

1. `js_repl` is enabled (`[features] js_repl = true` or launch with
   `--enable js_repl`). Enabling it requires a **new Codex session** before the
   refreshed tool list is available.
2. Until OpenAI removes the upstream limitation, start that session with
   sandboxing disabled (`--sandbox danger-full-access`).
3. From the GameAI Hub repository root, verify both the package and browser:
   `node -e "import('playwright').then(() => console.log('playwright import ok'))"`
   and `npx playwright install --list`. If Chromium is absent, run
   `npx playwright install chromium` and verify again. An installed executable
   is not enough: launch and close Chromium once to detect missing host shared
   libraries. Where system-package installation is permitted,
   `npx playwright install --with-deps chromium` installs both pieces.
4. Confirm `js_repl` appears in the new session's tools before claiming the
   skill is usable. A checked-in skill or an installed browser alone is not a
   successful runtime integration.

If any prerequisite is unavailable, record the exact missing capability and
mark mobile Preview Acceptance `BLOCKED BEFORE PLAYWRIGHT CAPTURE`. Do not
substitute source inspection, E2E results, or the fixed-width Work browser for
the missing evidence.

### 2.2 Deterministic mobile Preview evidence

Before interaction, write the upstream skill's shared QA inventory for the
target change. Then create separate Playwright browser contexts with explicit
viewports `{ width: 375, height: 812 }` and `{ width: 320, height: 700 }`.
Use `isMobile: true` and `hasTouch: true`; record the chosen heights with the
evidence. At **each** width:

1. Open the Vercel Preview target directly and confirm `window.innerWidth`,
   `document.documentElement.clientWidth`, and the requested width all agree.
2. Capture viewport screenshots as the primary fit evidence for the initial
   article view and every critical post-interaction state. Full-page images are
   optional secondary context, not a replacement for viewport captures.
3. Record `scrollWidth`, `clientWidth`, and
   `scrollWidth > clientWidth`. Any document-level horizontal overflow fails
   acceptance. Also inspect screenshots and critical-region bounds because a
   numeric no-overflow result cannot overrule visible clipping.
4. Inspect and operate every primary CTA using Playwright pointer/touch input.
   Verify it is visible, readable, not clipped or overlapped, and that its
   destination preserves the expected article/source and game context.
5. Inspect code blocks for readable text, intact copy controls, and intentional
   internal horizontal scrolling for long code. A code block may scroll
   internally; it must not widen the document or make its controls unusable.
6. Execute the target article's critical interaction flow with normal user
   input. For `/articles/chatgpt-cat-tap-game/`, verify the playable example
   shows score `0`, then `1`, then `2`, resets to `0`, and the Project CTA keeps
   the cat / tap-click / +1 score intent plus source attribution.
7. Review the screenshots visually, separately from the functional assertions,
   and record findings as P0/P1/P2/P3. Fix all P0, P1, and high-impact P2 before
   a passing verdict.

Store durable artifacts under `docs/screenshots/` when the task requires an
auditable evidence package. Record the Preview URL, commit SHA, browser/version,
viewport, screenshot paths, numeric results, interaction result, reviewer, and
timestamp. Evidence from localhost may support implementation but does not
prove the deployed Preview.

## 3. Immediate blocking failures

Treat these as P0/P1 when materially user-facing:
- ordinary Japanese collapses to 1–3 characters per line
- document-level horizontal overflow
- critical content becomes unreadably narrow
- a major CTA is clipped, hidden, or inaccessible
- controls/panels/accordions collide, overlap, clip, or create confusing hierarchy
- mobile is only a squeezed desktop composition
- large dead space coexists with cramped adjacent content
- headings wrap in visibly broken or accidental ways
- error text expands the document width
- layout technically avoids overflow only through pathological wrapping
- large avoidable whitespace pushes important actions far below the fold
- critical workflow becomes impractical on mobile

`scrollWidth <= clientWidth` is necessary, not sufficient.

## 4. First-view acceptance

For Home or major acquisition surfaces, inspect the rendered first view as a new visitor.
Within roughly 3–5 seconds, the screen should communicate:

1. what GameAI Hub is
2. what the user should enter/do
3. what output they will receive
4. why this is more useful than a generic AI-tool directory or random chatbot/tool suggestions

If that answer depends on scrolling through explanatory sections, treat it as a design problem and re-test after correction.

## 5. Visual quality and originality

Review actual rendered screens for:
- Japanese typography and line length
- whitespace balance
- information density
- hierarchy
- scanability
- visual rhythm
- interaction affordances
- stage/progress/artifact relationships
- whether Project/Today/Roadmap/Quest surfaces feel like one production workflow where relevant

Do not approve visual work merely because it is consistent, dark, responsive, or technically functional.
Repeated cards, borders, pills, monospace labels, neon, gradients, or cyberpunk decoration must not substitute for product-specific visual structure.

## 6. Product-flow continuity

For Project-related work, inspect continuity across:

```text
idea
→ conditions
→ current task
→ AI/tool instruction
→ artifact
→ done criteria
→ next task
→ recovery
```

Verify the user's original game intent is preserved.
Do not accept silent transformations such as changing the core mechanic, adding an unrequested genre/subgenre, or replacing platform constraints without explicit user agreement.

When relevant, test both successful and failure/recovery paths.

## 7. Mandatory screenshot review loop

For substantial UI work:

1. implement
2. render the real app
3. capture screenshots/evidence
4. have an independent visual/mobile/product reviewer inspect them
5. classify findings P0/P1/P2/P3
6. fix all P0, all P1, and high-impact P2
7. render again
8. capture new screenshots
9. use a second-pass reviewer to verify fixes and look for regressions

Repeat until blocking criteria pass or tooling/runtime creates a genuine blocker.

Store durable evidence under `docs/screenshots/` when required by the task so another reviewer can inspect the result after the session ends.
A text note saying “screenshot QA passed” without reviewable evidence is not sufficient for substantial UI work.

## 8. Functional regression audit

Visual redesign must not silently remove useful behavior.
Check relevant existing behavior, including where applicable:
- URL/deep-link state
- browser back/forward
- share/export
- local progress persistence
- query/context propagation
- deterministic fallback
- Project-specific information surviving into outputs
- copy/paste workflows
- save/load
- analytics
- affiliate behavior
- accessibility
- keyboard interaction
- mobile navigation

If useful behavior is removed without explicit owner-approved migration, treat it as P1.

## 9. Evidence package before handoff

For substantial product/UI changes, retain enough evidence to audit the work without reopening the original task conversation:
- screenshots with viewport/zoom noted
- reviewer findings and severity
- fixes for P0/P1/high-impact P2
- second-pass verification
- functional-regression checklist
- relevant E2E results
- quality/build results
- unresolved lower-severity issues

If the evidence disappears when the task ends, acceptance is incomplete.

## 10. Physical-device claims

Separate:
- responsive acceptance
- physical-device acceptance

If actual iPhone/Android behavior, touch, soft keyboard, long-press paste, file picker, Downloads/Files, OS tab switching, or genuine accessibility text zoom were not tested, say `UNTESTED` for those physical-device aspects.

Do not convert a physical-device limitation into a responsive FAIL when responsive evidence is otherwise available.
Do not claim physical-device PASS from emulation.

Playwright mobile contexts prove responsive-browser behavior only. Keep actual
iPhone/Android testing and OS-specific Safari/Chrome behavior as separate
acceptance lines, marked `UNTESTED` unless tested on those physical devices.
Touch emulation, a mobile user agent, device scale factor, and viewport sizing
must never be described as real-device coverage.
