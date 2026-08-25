# GameAI Hub — Codex Agent Operating Protocol

This file is the persistent execution protocol for Codex work in this repository.
Task-specific product requirements live in GitHub Issues. Do not duplicate large issue specifications in prompts.

## 1. Instruction hierarchy

When working in this repository, use this priority order:

1. The explicit user request for the current task.
2. The GitHub Issue named by the user.
3. This `AGENTS.md` protocol.
4. Existing repository behavior and tests.

If an Issue conflicts with protected behavior listed below, preserve the protected behavior and report the conflict.

## 2. Product principle

GameAI Hub must be a decision-support product for people making games with AI, not a generic AI-tool directory.

The core user outcome is:

> “I know which tools fit my game, why they fit, in what production order to use them, what alternatives exist, and what I still need to verify.”

Do not substitute cosmetic redesign, generic landing-page copy, or shallow tool lists for product utility.

## 3. Protected behavior — do not regress

Preserve unless an Issue explicitly requires a safe migration:

### Analytics
- GA4 measurement ID `G-B9Q283QVER`
- `outbound_click`
- `affiliate_click`
- `sub_id` generation
- production `gtag` behavior

### Affiliate behavior
- `affiliateUrl ?? officialUrl`
- `rel="sponsored nofollow noopener"` for affiliate links
- affiliate disclosure
- ElevenLabs affiliate configuration
- Meshy affiliate configuration
- affiliate registry / sync / set-affiliate automation
- affiliate payout must never affect recommendations, ordering, scoring, or editorial conclusions

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

Unknown must remain unknown.

## 4. Native subagents are the default for substantial work

For any task that changes product architecture, recommendation logic, monetization, Builder, Stacks, Compare, or more than a few UI components, use native subagents.

The parent agent is the orchestrator. It should primarily:
- inspect the task
- decompose work
- spawn specialists
- reconcile conflicts
- sequence implementation
- run quality gates
- produce the final commit/report

Do not let one agent design, implement, review itself, and declare success without independent review.

## 5. Mandatory multi-agent lifecycle

### Phase A — independent discovery
Before coding, spawn independent specialists where relevant. At minimum for product work:

1. Product / JTBD analyst
2. UX / interaction reviewer
3. Game-development workflow expert
4. Data / recommendation architect
5. Senior Next.js engineer
6. Trust / factuality reviewer

For monetization work also spawn:
7. Monetization product strategist
8. Conversion / pricing UX reviewer

Agents should inspect the repo independently. Do not prime critics with implementation-agent praise or conclusions.

### Phase B — written internal thesis
The parent must synthesize:
- primary user job
- product value
- key user journey
- data sources
- deterministic decision logic
- trust constraints
- revenue logic if applicable
- what will NOT be built

If the product value can only be described as “a directory of AI tools”, redesign the approach before coding.

### Phase C — implementation
Split implementation ownership by concern when possible:
- data/schema/config
- recommendation logic
- Builder/result UX
- Stack/content architecture
- tool/compare integration
- monetization/paywall/purchase surfaces
- responsive/accessibility

Avoid parallel edits to the same files when conflicts are likely.

### Phase D — adversarial review
After implementation, use different agents from the implementers.

Required critic lenses:
- Product skeptic: “Is this more useful than search?”
- UX destroyer: “Where will users hesitate or quit?”
- Game-dev realism critic: “Would this workflow work in real production?”
- Factuality auditor: “What is asserted without evidence?”
- Conversion ethics reviewer: “Is monetization natural and non-manipulative?”
- Mobile/accessibility critic
- Engineering reviewer

Classify findings:
- P0: broken, misleading, data loss, unusable
- P1: major product weakness
- P2: meaningful UX/quality weakness
- P3: polish

Fix all P0, all P1, and high-impact P2 before completion.
Do not spend the loop on P3 polish while P1 product defects remain.

### Phase E — scenario simulation
For Builder/Stack/monetization work, test realistic journeys with separate agents when possible:
- beginner + free budget + 2D RPG
- monster-collection mobile game
- visual novel / voice-heavy
- 3D indie / Steam
- browser game / coding-heavy
- no voice
- no 3D
- unknown pricing / unknown commercial use
- missing affiliate URL
- 375px mobile

The journey should cover relevant stages such as:
Home → Builder → Result → Stack → Tool → Compare → CTA / purchase.

### Phase F — technical red team
Review:
- type safety
- client/server boundaries
- malformed query/state
- deterministic logic
- schema validation
- hydration risks
- accessibility
- mobile overflow
- metadata / canonical / sitemap
- analytics duplicate firing
- affiliate fallback / rel behavior
- static build / Vercel compatibility

### Phase G — quality gate
Always run the relevant commands, and for substantial work run at minimum:

```bash
npm run quality
npm run build
```

Also run available targeted tests, lint, and typecheck when helpful.
If a command fails: diagnose → fix → rerun. Do not report completion with a failing required gate.

## 6. Anti-gaming rules for quality loops

Do not satisfy quality thresholds through self-congratulation.

Independent evaluators must support ratings with concrete evidence from routes, components, data behavior, or user journeys.
Avoid unsupported phrases such as:
- “looks professional”
- “production-ready”
- “clean and modern”
- “great UX”

A score without evidence is invalid.

For large product changes, final evaluators should score:
- product usefulness
- differentiation
- decision/recommendation usefulness
- explainability
- game-development realism
- UX clarity
- mobile usability
- trust/factuality
- monetization naturalness (when applicable)
- technical quality

If a material category is below 8/10, fix the concrete defects and re-evaluate, up to 3 review/fix loops.
Trust/factuality and recommendation explainability should target 9/10 or better.

## 7. Builder and recommendation rules

Builder recommendations must be deterministic and explainable unless an Issue explicitly introduces an AI generation layer.

Prefer:
- central typed configuration
- validated data
- reusable recommendation functions
- explicit reasons tied to user inputs and verified service fields

Avoid:
- recommendation logic scattered through React components
- subjective “best” claims without rules
- affiliate-driven weighting
- fabricated cost estimates

A Builder result should provide useful next actions, not just filtered tool cards.

## 8. Monetization principles

Revenue features must add real user value before asking for payment.

Preferred revenue directions beyond affiliate links:
- paid detailed game-development plan / export
- Pro Builder capabilities
- paid production templates / starter kits
- sponsorship clearly separated from recommendations
- qualified B2B leads with explicit user consent
- later: structured data/API or embeddable widgets

Do not implement dark patterns, fake scarcity, forced continuity, hidden sponsorship, pay-to-rank, or deceptive pricing.

For paid user-facing content, maintain a meaningful free outcome. A purchase should unlock additional depth, convenience, customization, export, or reusable production assets — not merely hide the basic answer.

Before implementing payments, confirm the Issue defines the payment provider, product model, and legal/operational constraints. If not, build payment-ready product architecture and mock/test flows without inventing production credentials.

## 9. Content quality rules

Revenue content must not be generic AI prose.

Paid or premium content should be structured around concrete work outputs such as:
- production phases
- task checklist
- tool per stage
- rationale
- alternatives
- risk/unknown list
- budget visibility when verified
- commercial-use verification checklist
- implementation order
- milestone plan
- reusable prompts/templates only when genuinely useful and specific

Every premium artifact must answer: “What can the user do now that they could not do from the free summary?”

## 10. Long-run task checkpoint and recovery policy

Large Codex Cloud tasks may be interrupted by execution limits, environment termination, tool failures, subagent failures, or other transient conditions. Substantial work must therefore be resumable from repository state rather than depending on chat history.

### 10.1 When checkpoints are required
For any task expected to span multiple implementation phases, multiple subagent rounds, or more than a few significant files, create checkpoint commits throughout the task.

At minimum, create a checkpoint after each materially stable phase such as:
- repository audit / architecture preparation when it produces durable code or config changes
- data model / schema / recommendation foundation
- Builder core implementation
- Stack/content route implementation
- Compare/tool integration
- monetization layer implementation
- first adversarial-review fixes
- technical-red-team fixes
- final QA / quality-gate completion

Do not wait until the very end of a long task to create the first commit.

### 10.2 Checkpoint quality rules
A checkpoint should represent a coherent, recoverable state.

Prefer checkpoints that:
- preserve a compilable or near-compilable tree
- do not knowingly contain data corruption or destructive migrations
- do not mix unrelated changes
- have a precise commit message describing the completed phase
- preserve unrelated user work

Avoid checkpointing a knowingly broken state unless interruption risk is high and the commit message clearly marks it as incomplete.

Recommended commit-message pattern:

```text
checkpoint: <issue or feature> — <completed phase>
```

Examples:

```text
checkpoint: issue-11 — recommendation foundation
checkpoint: issue-11 — builder core flow
checkpoint: issue-11 — adversarial review fixes
checkpoint: issue-12 — premium plan architecture
```

### 10.3 Persistent progress ledger
For long-running tasks, maintain a lightweight repository progress ledger at:

```text
docs/codex-progress/<issue-or-task>.md
```

Create it when the task becomes multi-phase. Keep it concise and machine-resumable.

It must contain:
- task / Issue reference
- working branch
- latest checkpoint commit
- completed phases
- in-progress phase
- remaining phases
- unresolved P0/P1/P2 findings
- quality-gate status
- known blockers / assumptions
- files or areas currently being edited
- exact recommended next action on resume

Update the ledger at each major checkpoint.
Do not place secrets, tokens, credentials, private user data, or chain-of-thought in this file.

### 10.4 Resume protocol after interruption
When resuming an interrupted task, do not restart from the original prompt blindly.

First inspect repository state:

```bash
git status --short --branch
git log --oneline -12
git diff
git diff --staged
```

Then read:
- the target GitHub Issue
- this `AGENTS.md`
- the relevant `docs/codex-progress/<issue-or-task>.md` ledger if present

Reconstruct progress from Git and repository artifacts, not from conversational memory.

Before making changes, internally classify work as:
- completed
- in progress
- remaining
- blocked

Then continue only the unfinished work.
Do not redo completed phases unless evidence shows they are invalid or regressed.
Do not discard existing uncommitted work merely because the previous task ended unexpectedly.

### 10.5 Recovery hierarchy
On resume, use this order of truth:

1. Current repository state and committed code
2. Latest checkpoint commit on the task branch
3. Progress ledger
4. Target GitHub Issue
5. `AGENTS.md`
6. Previous task narrative/report

If the narrative conflicts with Git state, trust Git state.

### 10.6 Subagent interruption handling
If one or more subagents fail or time out:
- preserve successful subagent outputs that are already reflected in code or durable notes
- do not restart every agent automatically
- respawn only the missing specialist role or unfinished review
- record any skipped review lens in the progress ledger
- do not declare completion until mandatory independent review coverage is restored

### 10.7 Pre-timeout behavior
When the agent detects that the task is becoming long, tool/runtime budget is shrinking, or another interruption risk is increasing, prioritize recoverability over starting another large phase.

Before likely interruption:
1. finish the smallest coherent unit currently in progress
2. run targeted checks appropriate to that unit when feasible
3. update the progress ledger
4. create a checkpoint commit
5. record the exact next action

Do not spend the remaining execution window on cosmetic polish if a durable checkpoint has not been created recently.

### 10.8 Finalization and ledger cleanup
After the task fully passes its required review loops and quality gates:
- create the final task commit
- update the progress ledger to mark the task complete
- record final quality/build results and final commit SHA

The progress ledger may remain in the repository as an audit/resume record unless the Issue explicitly requires cleanup.

### 10.9 Resume prompt contract
A future Codex task should be resumable with a short instruction such as:

```text
Resume the interrupted GameAI-Hub work for Issue #11.
Follow AGENTS.md, inspect Git state and the progress ledger, do not redo completed work, and continue from the latest valid checkpoint until all acceptance criteria and quality gates pass.
```

The repository must contain enough state for that short prompt to work reliably.

## 11. Git behavior

- Start from the base branch named by the task; otherwise `main`.
- Work on a dedicated branch.
- Do not merge to `main` unless explicitly instructed.
- Do not stop implementation merely because Create PR UI is unavailable.
- Commit completed work to the task branch.
- Preserve unrelated user changes.
- For long-running tasks, follow the checkpoint and recovery policy above instead of relying on a single final commit.

## 12. Final report format

For substantial work, report only actionable completion evidence:

- Issue implemented
- subagents used
- review loops completed
- P0/P1/P2 findings fixed
- major product changes
- routes/data/schema changed
- analytics verification
- affiliate verification
- SEO verification
- tests / quality / build
- 375px mobile result
- known limitations
- branch
- commit

Do not pad the final report with generic praise.
