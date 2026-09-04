# Issue 49 — Production final-acceptance follow-up

- Task: Fix the production acceptance findings reported after PR #50 (P1 return guidance and high-impact P2 repository setup guidance).
- Working branch: `fix/issue-49-final-acceptance`
- Latest implementation commit: `42c7d5d` (merged by PR #51 as `1df84e41d674bfe954d4502b783cee4f17a03cb8`).
- Completed phases: environment/bootstrap and write-path proof; independent product/UX/game-dev, engineering/state, and trust/content discovery; official GitHub Docs verification; implementation; adversarial product/UX/game-dev/trust/engineering review; fixes and second pass; rendered QA; quality/build/full E2E.
- Product decision: the active original Project tab is the authoritative continuation path. The guide neither receives nor claims a restorable Project URL; no new state serialization was introduced.
- Findings resolved: P1 false `元のProjectを開く` CTA removed; high-impact P2 repository decisions now cover Owner, name, optional Description, Public/Private, README, `.gitignore`, License, Pages visibility/plan caveat, and a concrete beginner preset.
- Additional findings resolved: runtime line is labeled preview-relative in UI/copy/help; combined copy says editing rather than working; browser-article CTA says it opens input and requires pasting; `.gitignore` is not described as secret protection.
- Review severity after fixes: P0=0, P1=0, high-impact P2=0. Physical-device testing remains unavailable; 200% evidence is CDP page-scale/viewport emulation, not a real-device or OS/browser text-zoom claim.
- Rendered evidence: `docs/screenshots/issue-49/github-guide-{desktop,mobile-375,mobile-360,mobile-320}.png`; 320px CDP 200% overview and focused start/settings/end captures in the same directory. Normal narrow views have no document overflow or pathological 1–3-character body wrapping.
- Quality gates: `npm run quality` PASS (25 files / 221 tests; registry, affiliate, sitemap, structured content included); `npm run build` PASS; `npm run test:e2e` PASS (32/32, including QA_RUNTIME_0904, combined copy, A/B/C, 375, 320, and 200% checks).
- Regression audit: Project idea/task/progress verified after guide-tab close at 1/6; Copilot external analytics unchanged; affiliate behavior unchanged; canonical/metadata/structured data/sitemap pass; no Project recovery CTA remains.
- GitHub/PR: PR #51 merged into `main`; GitHub checks and full E2E passed; Vercel Preview passed.
- Deployment: Vercel Production deployment `AgonG2vfNfCYgq8RFocUYWqHYMzL` passed. Production browser smoke passed for Project creation, one completed task, Copilot preflight, guide in a new tab, both return instructions, repository settings, guide close, and exact idea/current-task/1-of-6 progress retention. Production article content and sitemap HTTP smoke passed.
- Known limitations: physical iPhone/Android and authenticated GitHub/Copilot flows are not tested; viewport/CDP emulation is not real-device evidence.
- Current edit areas: GitHub/browser articles, Project preflight/runtime/copy wording, article sources, E2E, rendered evidence, this ledger.
- Exact next action: no implementation work remains; physical-device and authenticated third-party flows may be tested separately when those environments are available.
