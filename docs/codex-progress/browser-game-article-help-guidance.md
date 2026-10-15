# Existing browser-game article help guidance

- Launch: `codex_delegation` from source thread `01a10caf-ddc0-72d1-9556-42849e68d031`, selected `/workspace` Environment.
- Authorized scope: correct the nonexistent help-button guidance only in `/articles/ai-browser-game-how-to/`; verify, create a draft PR, merge after acceptance, and confirm Production. Owner approval was relayed for 2026-10-12 11:07 JST. DOKUNIQ, Laya, unrelated pages/settings and new charges are excluded.
- Canonical fetch/push origin verified: `https://github.com/komekome898-web/GameAI-Hub.git`.
- Fetched base and earliest remotely verified checkpoint: `622d8c5712c3e5a78e2ac202942fcb2f3ac1d873`.
- Remote branch: `fix/browser-game-article-help-guidance`. No existing PR for this fix; the other open PR targets a separate article.
- Implementation: optional `helpGuidance` overrides preview/error prose for this article. Normal guidance points to its section 6; errors use the existing error-summary clipboard action and manual AI input. Existing button/copy modes, game execution, recovery, and callbacks are retained.
- Regression: workspace unit tests 10 PASS. Project real runtime-error handoff, existing debug article at 1280/375/320, and original workspace download/reopen: 5 PASS.
- Article acceptance: 4 PASS at 1280, 375, 320 and 320px/root-font 200%. Real thrown errors and promise rejections, real browser clipboard read/write, working-version recovery, corrected-code redisplay, battle victory/reset, and document overflow checks pass.
- Rendered screenshots and result JSON: `test-results/browser-game-article-help/`; CI preserves them in `beginner-acceptance-evidence`. This is Chromium responsive emulation; physical devices and OS clipboard/file flows are UNTESTED.
- Initial test-fixture issue: a 601-character rejection exceeded the existing 600-character preview limit; corrected the fixture to exactly 600 and reran all four cases successfully.
- Initial quality: lint/typecheck, 49 Vitest files / 379 tests, all data/content validators, and Python 76 tests passed; workflow validation was blocked solely by missing Ruby. Official Debian Ruby 3.3.8 packages were extracted under `/tmp/article-help-ruby`; unchanged workflow validator then passed. No repository dependencies/settings were changed.
- Final gates: run complete quality with `/tmp/article-help-ruby/bin` on PATH, production build, and the 9 related E2E cases on the final commit; pin independent source/rendered review to that SHA. Exact final SHA, CI/PR/merge and Production results belong in the PR and final handoff.
- Production browser: each fresh context must first navigate to `https://game-ai-hub.vercel.app/privacy/?gameai_analytics=off`, confirm exclusion, and use that context for the affected article. The regression supports this with `ARTICLE_HELP_BASE_URL`; unavailable access must be reported to the coordinator.
- Resume: inspect remote branch/PR and exact-head checks, resolve any blocking findings, then use the already authorized merge and verify Production alias/commit and browser behavior. Never merge with unmet acceptance.
