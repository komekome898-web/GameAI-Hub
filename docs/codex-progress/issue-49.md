# Issue 49 — Production final-acceptance follow-up

- Task: Fix the production acceptance findings reported after PR #50 (P1 return guidance and high-impact P2 repository setup guidance).
- Working branch: `fix/issue-49-final-acceptance`
- Latest pushed checkpoint: pending bootstrap checkpoint
- Completed phases: restored `origin`; rebuilt local `main` from `origin/main`; read Issue #49 final FAIL, PR #50, repository protocols, prior ledger, article scope rules, GitHub article, Project/Copilot preflight, and existing E2E.
- In progress: independent product/UX, engineering/state, and trust/content discovery; official GitHub documentation verification.
- Remaining: implementation; targeted/full tests; rendered desktop/375/360/320/200% QA; independent adversarial reviews; evidence; PR/CI/Preview; authorized merge; production deploy and smoke.
- Findings: P1 — a `/project#quest-*` URL cannot restore in-memory/local Project context and is mislabeled as restoring the original Project. High-impact P2 — repository creation choices lack beginner decisions.
- Quality gates: not run on this follow-up branch yet.
- GitHub/PR: follow-up PR not created yet.
- Deployment: not started.
- Blockers/assumptions: physical iPhone/Android devices are unavailable unless discovered later; viewport emulation will be labeled accurately.
- Current edit areas: `docs/codex-progress/issue-49.md` only.
- Exact next action: finish independent discovery and official-doc verification, then implement the article/E2E changes without introducing Project-state serialization.
