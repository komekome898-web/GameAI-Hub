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
