# GameAI Hub — Repository Agent Protocol

This file contains repository-wide product, safety, and quality invariants.
Task-specific requirements belong in GitHub Issues.
Codex Cloud execution procedures belong in `CODEX_CLOUD_TASK.md`.
Rendered UI acceptance procedures belong in `docs/agent-guides/UI_ACCEPTANCE.md`.

## 1. Instruction hierarchy

Use this priority order:

1. The explicit user request for the current task.
2. The GitHub Issue named by the user.
3. This `AGENTS.md` protocol.
4. Existing repository behavior and tests.

If an Issue conflicts with protected behavior below, preserve the protected behavior and report the conflict.

## 2. Product principle

GameAI Hub is an AI game-development execution and decision-support product, not a generic AI-tool directory.

The core user outcome is:

> “I can describe the game I want to make, understand the next concrete action, use an appropriate AI/tool, verify the result, and continue toward a playable game.”

The primary execution flow is:

```text
idea
→ conditions
→ Project
→ current task
→ AI/tool
→ artifact
→ verification
→ completion
→ next task / recovery
```

Tools, Compare, and Articles support this flow. They are not substitutes for the execution product.
Do not substitute cosmetic redesign, generic landing-page copy, or shallow tool lists for product utility.

## 3. User-intent preservation

Never silently replace the user's requested game, core mechanic, genre, audience, platform, or production constraint with a different one.

Examples of prohibited behavior:
- tap-to-score → movement-to-goal
- visual novel → romance visual novel when romance was not requested
- browser game → engine-based project without user agreement

Simplification is allowed when necessary for a first playable slice, but the simplified task must preserve the user's core intent.

If a requested feature cannot yet be supported:
1. preserve the original request
2. state what cannot be represented
3. propose the smallest compatible simplification
4. do not present the substitute as though the user requested it

Article examples, Project drafts, interpreted conditions, recommended tools, prompts, current task, and next task must preserve the same user/game context unless the user explicitly changes it.

## 4. Protected behavior — do not regress

Preserve unless an Issue explicitly requires a safe migration.

### Analytics
- GA4 measurement ID `G-B9Q283QVER`
- `outbound_click`
- `affiliate_click`
- safe `sub_id` generation
- production `gtag` behavior
- never send raw game ideas, raw HTML/code, runtime errors, secrets, or other sensitive user content to analytics

### Affiliate behavior
- `affiliateUrl ?? officialUrl`
- `rel="sponsored nofollow noopener"` for affiliate links
- clear affiliate disclosure
- affiliate registry / sync / validation behavior
- affiliate payout must never affect recommendations, ordering, scoring, editorial conclusions, or competitive adoption priority

### SEO / ownership
- Google Search Console verification
- canonicals
- metadata
- robots
- sitemap
- source transparency / last-verified behavior

### Factual integrity
Never invent:
- prices
- savings
- rankings
- user counts
- ratings
- reviews
- testimonials
- awards
- commercial-use rights
- unsupported capabilities
- conversion claims

Unknown must remain unknown. Time-sensitive claims require current verification when the task depends on them.

## 5. Risk-based agent orchestration

Use additional agents when independent expertise or review materially improves the task. Do not spawn specialists mechanically.

### Low-risk work
Examples:
- isolated factual data update
- documentation correction
- narrowly scoped test update

One implementation agent plus relevant automated gates may be sufficient.

### Medium-risk work
Examples:
- user-facing component
- article flow
- recommendation rule
- affiliate placement

Use at least one independent reviewer relevant to the main risk.

### High-risk / substantial work
Examples:
- Project Generator behavior
- recommendation architecture
- major UI redesign
- monetization architecture
- multi-route user journey

Use independent expertise across the relevant dimensions, such as product/UX, engineering, game-development realism, trust/factuality, mobile/accessibility, or monetization.

The implementer must not be the sole final evaluator of substantial work.
Do not prime critics with implementation-agent praise or conclusions.

## 6. Acceptance severity and evidence

Classify findings:
- P0: broken, misleading, unsafe, data loss, unusable
- P1: major user/product failure
- P2: meaningful quality or usability weakness
- P3: polish

Before completion:
- fix all P0
- fix all P1
- fix high-impact P2

Do not spend the main review loop polishing P3 while blocking defects remain.

Independent evaluations must cite concrete evidence from routes, components, data behavior, rendered screens, tests, or user journeys.
A score without evidence is invalid and never substitutes for an acceptance criterion.
Avoid unsupported self-evaluation such as “perfect”, “production-ready”, “clean and modern”, or “great UX”.

For substantial work, run at minimum:

```bash
npm run quality
npm run build
```

Also run relevant targeted tests and E2E. If a required gate fails: diagnose → fix → rerun. Do not report completion with a failing required gate.

## 7. Rendered UI acceptance

User-facing UI quality must be judged from the rendered product, not source code, DOM/CSS inspection, automated overflow checks, or implementer self-review alone.

For work that materially affects UI, layout, navigation, responsive behavior, Home, Project, Tools, Compare, Articles, or other user-facing flows, read and follow:

`docs/agent-guides/UI_ACCEPTANCE.md`

`scrollWidth <= clientWidth` is not proof of usability.
Do not claim physical-device acceptance from viewport emulation.

## 8. Project and recommendation rules

Project interpretation, task generation, and tool recommendations must be deterministic and explainable unless an Issue explicitly introduces an AI generation layer.

Prefer:
- central typed configuration
- validated data
- reusable decision functions
- explicit reasons tied to user inputs and verified service fields
- preservation of user intent across stages

Avoid:
- recommendation logic scattered through React components
- subjective “best” claims without rules
- affiliate-driven weighting
- fabricated cost estimates
- silently invented genre, mechanic, or project requirements

A Project result should provide a concrete next action, observable done criteria, and a path to continue or recover.

## 9. Monetization principles

Revenue must follow demonstrated user value.

Preserve:
- no pay-to-rank
- no hidden sponsorship
- no fake scarcity
- no forced continuity
- no deceptive pricing
- meaningful free outcome
- explicit sponsored labeling
- affiliate neutrality

Task-specific payment products, providers, pricing, and commercial models belong in the relevant Issue or growth strategy document.

## 10. Content principles

Content must solve a concrete game-development task, not exist only to acquire traffic or place affiliate links.

Prefer:
- actual procedures
- concrete examples
- observable done criteria
- failure/recovery guidance
- verified sources

Detailed article and publishing rules are scoped under `app/articles/AGENTS.md`.
Growth, SEO, acquisition, retention, or monetization strategy work should also read `docs/GROWTH_STRATEGY.md`.

## 11. Cloud Task execution and repository truth

For Codex Cloud Tasks, follow `CODEX_CLOUD_TASK.md`.

Core invariant:

> Repository state is the source of truth for resumable work.

Do not rely on chat history when Git state, Issues, PRs, scoped instructions, or progress ledgers contain the relevant state.
Preserve unrelated user changes.
Do not merge to `main` unless the current task explicitly authorizes merge after required acceptance passes.

## 12. Final report

Report factual completion evidence only. Include as relevant:
- implemented outcome
- blocking defects and unresolved limitations
- acceptance performed
- tests / quality / build
- rendered evidence
- branch / PR / merge
- Production status

Do not claim visual acceptance without rendered evidence.
Do not pad final reports with generic praise.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->