# Growth analysis tooling

- Task: reusable, evidence-preserving growth analysis for Buildiary.
- Launch: owner-scoped environment task; no legacy orchestration run.
- Branch: `feat/growth-analysis-agent`.
- Verified origin: `https://github.com/komekome898-web/GameAI-Hub.git`.
- Base / earliest verified remote checkpoint: `d1f6cc838b70f221787e051795f3bbc13b288443`.
- Parallel PRs checked: 113 and 186; their changes are outside this task.
- Implemented: repository Skill, primary-reference methods, diagnostic and counterexample cases, offline aggregation/diagnosis/opportunity comparison, synthetic fixtures, regression tests and quality integration.
- Privacy: public code and synthetic examples only. Private observations, strategy and application proposals stay outside this repository and its CI artifacts.
- Validation: Python growth tests, repository quality and production build pass with the environment's existing Ruby runtime enabled for workflow validation. Independent source review found input-state/duplicate-total/provenance gaps; fixed with regressions.
- Review hardening: excludes unsuitable metric quality and mismatched target periods from recommendations; validates quality tokens; requires role-appropriate retained source content and independent review bound to candidate, referenced evidence and indirect measurement sources. Duplicate candidate IDs are rejected. Label-routing tests do not claim semantic source understanding.
- Application changes: separate review-only proposals; no production change, merge or publishing.
- Current phase: coordinator reviews the public tooling and separately evaluates private strategy/application evidence.
- Remaining: coordinator's independent acceptance and explicit adoption of any application proposal. No PR requested.
- Resume: inspect current remote head and private handoff from coordinator; do not reconstruct private observations from synthetic fixtures.

- Profitability extension: keeps reader recommendations separate from economic comparison; typed contract/observation/assumption/unknown quantities, conditional fixed/rate/discount-phase arithmetic, future cash/time and sunk-cost separation, approved/paid distinction, and independently reviewed comparison bound to all case periods/sources. Public fixtures remain fictional.
