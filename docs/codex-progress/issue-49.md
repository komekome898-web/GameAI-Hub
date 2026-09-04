# Issue 49 — Beginner flow implementation

- Task: Issue #49 beginner journey improvements; PR #50 follow-up
- Working branch: `feat/issue-49-beginner-flow`
- Latest implementation commit: `823bcd0` (evidence commit pending)
- Completed: PR/current-head audit; five stale Copilot-link E2E failures classified; preflight E2E updated; safe return target and fallback UI; runtime/combined-copy regressions; quality/build; full CI E2E 28/28; Vercel Preview
- CI classification: optional voice, A, B, C, and 375px Godot were stale expectations for links inside `<details>`, not product failures. Tests now open the preflight and verify both choices.
- Return safety: only `/project`, its query, and its fragment are accepted; external/protocol-relative/javascript/data/backslash/malformed values use the explicit new-Project fallback.
- Review loop: first E2E follow-up exposed Next trailing-slash normalization (test corrected); second exposed an invalid CSS `zoom` simulation (replaced with CDP page scale used elsewhere); final run 33866780325 passed 28/28.
- Rendered evidence reviewed: GitHub guide desktop and 375; 320/200% page-scale view; Project Copilot/trouble panel; runtime rejection; combined copy. No visible P0/P1/high-impact P2 remained in these captures.
- Quality gates: `npm run quality` PASS (25 files / 221 tests); `npm run build` PASS; GitHub full E2E PASS (28/28); registry/sitemap/structured data PASS; Vercel Preview PASS.
- Regression audit: sandbox/CSP/500KB unchanged; error and combined-copy raw content not sent to analytics; progress/game idea remain in original Project tab; affiliate/SEO checks passed.
- GitHub/PR: PR #50; final evidence push pending.
- Deployment: merge and production smoke pending.
- Known limitations: iPhone/Android physical devices and authenticated GitHub account flows were not tested; external Copilot generation was not performed.
- Next action: push evidence, confirm final CI/Preview, merge PR #50, verify origin/main and production smoke.
