# UI/UX Pro Max refresh ledger

Branch: `codex/ai-directory-ui-refresh`

## Scope

- Home: make the core job legible as `idea → deliverable → evidence → comparison → handoff`.
- Project: keep the first actionable artifact and completion gate ahead of secondary detail.
- Tools: persistent intent/search filters, precise evidence labels, useful empty state.
- Compare: decision summary before the long picker, durable URL state, mobile-readable differences.
- Trust: no unsupported winner claims, canonical outbound links/events, clear official-source status.

## Benchmark set (August 2026)

- Futurepedia: strong curation and editorial authority.
- Toolify: high-volume discovery and category breadth.
- There's An AI For That: broad task-driven search and strong traffic scale.

The target is not a larger directory. The target is a faster, more transparent game-production decision from a concrete project brief.

## UI UX Pro Max design system

- Direction: light Japanese production workbench / editorial blueprint.
- Type: Noto Serif JP for decision headings; Noto Sans JP for controls and body.
- Color: teal for structure/evidence, orange only for the primary action, warm white surfaces.
- Interaction: 44px minimum controls, visible focus, reduced-motion support, 16px mobile body copy.
- Information order: outcome → completion gate → evidence/unknowns → comparison → next handoff.
- Avoid: gradients, decorative shadows, tiny labels, popularity-only ranking, hidden core search.

## Acceptance gates

- [x] No open P0 findings in independent product, UX, accessibility, trust, or engineering review.
- [ ] Desktop and mobile screenshots committed under `docs/screenshots/` (desktop evidence complete; cloud viewport resizing was unavailable for a new mobile capture).
- [x] Blind side-by-side critic prefers the refreshed decision flow over competitor references.
- [ ] `npm run quality` passes.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` passes.
- [ ] External GitHub update shown to the user and confirmed before push/PR.

## Iteration log

### Pass 1 — discovery and system definition

- Audited existing home, tools, compare, project, data, analytics, affiliate, and SEO behavior.
- Captured competitor and before-state desktop references.
- Reframed the product around production artifacts instead of directory size.
- Began home/header/footer and shared light-workbench implementation.

### Pass 2 — production flow, trust, and accessibility

- Rebuilt Home around one-sentence input, a concrete deliverable preview, completion gate, evidence, comparison, and handoff.
- Added persistent Tools search and deliverable-first filters with URL/back-forward state.
- Put Compare's decision summary and three leading differences before the long table; direct `/compare` now starts unselected.
- Kept Compare search and keyboard focus through URL updates and linked claims to detail/official evidence.
- Added private Project drafts with 30-day TTL, 10-draft cap, opaque IDs, storage-failure export, and complete local deletion.
- Added an explicit engine adoption/hold gate and prevented review-only candidates from becoming adopted tools.
- Unified official-source status language, corrected commercial filtering, separated advertisements from editorial recommendations, and updated privacy/SEO disclosures.

### Pass 3 — rendered QA and adversarial loop

- Fixed the real-browser Project loading dead-end and the orphaned Project heading.
- Removed remaining dark-surface contrast regressions across Tool detail and Stack routes.
- Localized raw service category slugs and increased verification, error, assumption, and disabled-field contrast.
- Enforced sequential Build Quest completion: every criterion must be acknowledged and an artifact path/note recorded before the next Quest unlocks.
- Compressed Stack detail hierarchy after the route critic found content below the fold and a Japanese orphan wrap.
- Same-viewport blind result: refreshed Home **9.15/10**, Futurepedia **7.42**, Toolify **7.55**; refreshed Home preferred with 94% confidence.
- Rendered evidence: `gameai-hub-home-pass3-viewport-2026-08-30.jpg` (1348×926) plus route screenshots captured during the QA session.

### Verification

- `npm run lint`: pass.
- `npm run typecheck`: pass.
- Vitest: 156/156 pass; after the final Quest-gate change, focused Project tests 52/52 pass.
- `npm run build`: pass; 56 pages generated.
- `npm run quality`: blocked before assertions because this sandbox denies `tsx` IPC socket creation (`listen EPERM`). Equivalent lint/type/test/build gates were run separately.
- `npm run test:e2e`: browser executable was absent; installation was denied by the environment's network policy. This is an environment blocker, not an application assertion failure.
