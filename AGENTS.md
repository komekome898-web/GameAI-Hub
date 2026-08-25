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

## 10. Git behavior

- Start from the base branch named by the task; otherwise `main`.
- Work on a dedicated branch.
- Do not merge to `main` unless explicitly instructed.
- Do not stop implementation merely because Create PR UI is unavailable.
- Commit completed work to the task branch.
- Preserve unrelated user changes.

## 11. Final report format

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
