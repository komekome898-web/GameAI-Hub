# GameAI Hub — Codex UI/UX execution loop

This protocol specializes the root `AGENTS.md` rules for user-facing UI work. It does not replace the root protocol. Root product, factuality, affiliate, SEO, Git, checkpoint, and acceptance rules remain mandatory.

## 1. Tooling prerequisite

UI UX Pro Max must be available before substantial UI/UX design, redesign, or review work.

```bash
npm run uiux:check || npm run uiux:setup
npm run uiux:check
```

Expected Codex skill location:

```text
.agents/skills/ui-ux-pro-max/
```

The repository setup command pins `ui-ux-pro-max-cli` to version `2.15.0` and installs the bundled Codex assets without passing repository credentials to upstream GitHub downloads.

If the skill cannot be installed because the runtime has no npm access, record the task as blocked for UI design intelligence rather than pretending the skill was used.

## 2. Required order of operations

For substantial UI work, use this order. Do not skip directly to implementation.

1. Read the root `AGENTS.md`, target Issue, and relevant progress ledger.
2. Inspect the existing rendered product and existing behavior before changing it.
3. Verify UI UX Pro Max.
4. Query UI UX Pro Max for the specific surface and user job.
5. Synthesize a GameAI-Hub-specific design thesis. Generic skill recommendations are inputs, not authority.
6. Implement the smallest coherent change.
7. Run targeted engineering checks.
8. Launch the real app and capture rendered screenshots.
9. Give the screenshots to independent critics who did not implement the change.
10. Classify findings P0/P1/P2/P3.
11. Fix every P0, every P1, and high-impact P2.
12. Re-render and capture new screenshots.
13. Use a different critic for verification and regression search.
14. Repeat until all blocking acceptance criteria pass.
15. Run the root quality gates and retain the evidence package.

The loop is not complete when code compiles. The rendered product is the acceptance target.

## 3. UI UX Pro Max usage

Before choosing visual direction, query the local skill with language specific to the actual task. Include:

- GameAI Hub as an AI-assisted game-development decision-support product
- the exact route/surface being changed
- the user job on that surface
- the dominant information density
- mobile-first Japanese typography requirements
- the current Next.js/React stack
- accessibility constraints
- whether the task is discovery, redesign, implementation, or review

Example:

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py \
  "GameAI Hub game-development AI decision support project builder Japanese mobile Next.js high-information workflow" \
  --design-system
```

When a task establishes or materially changes the product-wide visual system, use the skill's persistent design-system capability where appropriate. Do not blindly overwrite an established GameAI Hub design system merely because a generic recommendation scores highly.

### Priority when recommendations conflict

Use this order:

1. explicit user/Issue requirement
2. protected behavior and acceptance rules in root `AGENTS.md`
3. proven GameAI Hub product-specific interaction needs
4. existing coherent design system and reusable components
5. UI UX Pro Max recommendations
6. generic visual trends

UI UX Pro Max is a design-intelligence source, not permission to turn the site into a generic SaaS template.

## 4. Mandatory design thesis before coding

The parent agent must synthesize a short internal thesis containing:

- primary user job
- first-view message and action
- information hierarchy
- visual hierarchy
- interaction model
- responsive strategy
- Japanese typography strategy
- what is intentionally visually distinctive about GameAI Hub
- which UI UX Pro Max recommendations are adopted
- which recommendations are rejected and why
- behaviors that must not regress

A thesis that only says "modern", "clean", "premium", "dark", or "AI-like" is invalid.

## 5. Rendered evidence matrix

Use the root `AGENTS.md` screenshot requirements. For substantial UI work, the evidence set must cover the changed routes and at minimum:

| Evidence | Required check |
| --- | --- |
| 375px mobile | hierarchy, tap targets, wrapping, first view, no squeezed desktop layout |
| 320px at 200% zoom | reflow, readable Japanese text, no clipping or pathological wrapping |
| desktop | density, whitespace balance, hierarchy, meaningful use of width |
| long Japanese copy | resilient labels, headings, cards, chips, buttons, accordions |
| interaction state | open/selected/error/loading/empty states relevant to the change |

Store durable screenshots under `docs/screenshots/` with filenames that identify route, viewport, and review pass.

## 6. Independent critic panel

Implementers must not be the sole reviewers. For major UI work, use separate critic roles. A single critic may cover multiple lenses only when subagent limits require it, but independence from the implementer is mandatory.

### A. Visual art director

Judge only what is visible in rendered screenshots first. Inspect:

- hierarchy
- typography
- spacing rhythm
- alignment
- density
- silhouette and composition of major UI regions
- repeated-card fatigue
- generic AI/SaaS visual clichés
- whether the interface has a GameAI Hub-specific visual language

Do not award points for code quality.

### B. Mobile + Japanese typography critic

Inspect:

- Japanese line breaks
- line length
- 1–3-character-per-line failures
- cramped labels
- accidental heading wraps
- tap target spacing
- sticky/fixed UI collisions
- 320px + 200% zoom behavior
- whether mobile is intentionally composed rather than compressed desktop

### C. Product/UX destroyer

Ask:

- Can a new visitor understand the product and first action in 3–5 seconds?
- Does the surface help a game developer make a decision or complete work?
- Is the hierarchy based on user decisions rather than visual decoration?
- Where would a user hesitate, abandon, or misunderstand?
- Is this more useful than a generic AI directory or chatbot answer?

### D. Accessibility/interaction critic

Inspect keyboard operation, focus visibility, semantics, contrast, reduced motion, reflow, state communication, and interaction affordance.

### E. Functional regression critic

Verify the root `AGENTS.md` protected behavior and changed-flow regression checklist. A visual improvement that silently breaks useful behavior is a P1 or worse.

## 7. Critic output contract

Every finding must contain:

```text
Severity: P0 | P1 | P2 | P3
Surface: route / component / viewport
Evidence: concrete visible or reproducible defect
Why it matters: user or product consequence
Required fix: observable acceptance condition
```

Invalid feedback:

- "looks good"
- "make it more modern"
- "premium feel"
- unsupported numeric scores
- praise without evidence

If a critic cannot cite visible/reproducible evidence, the finding does not count.

## 8. Acceptance rules

A pass requires all of the following:

- no unresolved P0
- no unresolved P1
- no unresolved high-impact P2
- required screenshot matrix exists
- second-pass screenshots exist after fixes
- second-pass reviewer is independent from the implementer and first visual reviewer when possible
- no protected behavior regression
- targeted E2E checks pass where relevant
- `npm run quality` passes
- `npm run build` passes

Do not stop because an arbitrary loop count was reached. Continue review -> fix -> re-review while blocking defects remain. If runtime/tooling prevents completion, checkpoint and report blocked/incomplete.

## 9. Competitive visual comparison

When an Issue explicitly requires the result to beat or match current external products, critics must compare against current rendered competitor references rather than memory.

Comparison criteria must be task-specific, for example:

- first-view clarity
- discovery speed
- information hierarchy
- search/filter ergonomics
- comparison workflow
- mobile usability
- typography
- visual differentiation
- perceived interaction quality

Do not copy competitor branding, proprietary artwork, layouts, or distinctive trade dress. Use competitors as quality references, not templates.

## 10. Evidence package

For substantial UI work, retain alongside the root evidence requirements:

- UI UX Pro Max query or concise summary of adopted/rejected guidance
- first-pass screenshots
- first-pass critic findings
- fixes mapped to P0/P1/high-impact P2
- second-pass screenshots
- second-pass verification
- functional regression result
- quality/build/E2E result

This must be recoverable from repository state without relying on chat history.
