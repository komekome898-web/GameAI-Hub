# Issue #14 — AI Game Project Generator

- **Task:** GitHub Issue #14, transform the decision directory into an executable game-project generator.
- **Working branch:** `h2ava9-codex/issue-#14agents.md`
- **Base:** PR #13 result at `605fb71`.
- **Latest checkpoint:** `d78103e` (PR #15 review fixes); final E2E cleanup pending commit.
- **Completed phases:** original Issue #14 work plus PR #15 review response: independent specificity/E2E/trust discovery, approved-detail extraction and six-artifact propagation, stable production E2E, adversarial review, and two fix/re-review loops.
- **In progress:** complete; final ledger/PR handoff.
- **Remaining:** commit final E2E cleanup and push this review response to the existing PR #15 branch.
- **Unresolved P0/P1/high-impact P2:** none after independent final product, E2E, and trust re-reviews. Presentation-class coupling in E2E and inherent advisory prompt-injection residual are low-priority observations.
- **Quality gates:** `npm run quality` passes (116 tests); `npm run build` passes with 34 static pages; `npm run test:e2e` passes 7/7; stabilization `npm run test:e2e -- --repeat-each=3` passes 21/21. 375px and 320px/200% zoom screenshots are generated as untracked test artifacts.
- **Assumptions/blockers:** no paid LLM/API is authorized; deterministic local interpretation is the production implementation. GitHub CLI is unauthenticated and the checkout initially had no remote; Issue body was read through the public GitHub API.
- **Areas edited:** project detail schema/interpreter/generator/share, confirmation UI/CSS, unit/component tests, Playwright configuration and journeys.
- **Resume next action:** inspect `git status` and PR #15. If local commits are ahead, push HEAD to `h2ava9-codex/issue-#14agents.md`; do not create a new PR or merge main.

## Internal product thesis

- **Primary job:** turn a stated game idea and confirmed constraints into a bounded first playable and a sequence of executable production work packets.
- **Product value:** a deterministic chain from stated fact to vertical slice, dependencies, acceptance gates, coding-agent handoffs, assets, prompts, risks, and sourced stage tools—not a longer directory result.
- **Journey:** idea → transparent keyword interpretation → confirm/edit missing constraints → start-today result → vertical slice → roadmap/artifacts → supporting tool evidence/compare → Markdown/print/share.
- **Data sources:** user-confirmed brief, centralized project recipes/rules, and the existing source-provenanced service catalogue. Unknown stays unknown.
- **Decision logic:** pure `interpret → clarify → generate` functions; genre/platform/engine/capability modifiers; hard exclusions separate from warnings; affiliate data excluded from all decisions.
- **Trust constraints:** no fake AI, inferred facts are visibly confirmed, no invented dates/prices/rights, analytics receives categorical events only, and official sources remain attached to service claims.
- **Revenue logic:** existing affiliate CTA fallback and disclosure remain supporting actions after the plan; payout never affects the plan or tool order.
- **Not building:** paid/model-backed generation, fake streaming, accounts/payments, fabricated cost totals/timelines, bulk thin SEO pages, or generic prompt dumps.
