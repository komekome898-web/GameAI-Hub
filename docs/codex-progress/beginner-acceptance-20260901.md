# Beginner acceptance — 2026-09-01

- Request: live production acceptance for zero-experience game creators, A/B/C; merge only after all mandatory gates and rendered rechecks pass.
- Base: origin/main 97a76bbbe84f0a2f9ef2e9510f92c78ed2071748.
- Branch: beginner-acceptance-20260901 (local and GitHub).
- Write check: git push --dry-run failed because CLI credentials are absent; GitHub connector branch creation succeeded. Use connector Git Data API for reviewed commits. No secrets printed.
- Latest checkpoint: this commit (pre-implementation).

## Observed in production (not source inference)
- Home desktop communicates beginner audience, idea input, AI/instruction/success output. Preview says 3 files; result says one index.html.
- A: exact input did not recognize first-time experience; full technical confirmation form shown. User must select multiple additional fields.
- A: single-file action prompt and four concrete completion criteria; copy and trouble-copy succeeded.
- A: AI instruction refers to nonexistent button label `公式サイトを見る`; actual link label is `無料枠を公式サイトで確認`, href Copilot marketing page. Opened new tab remained blank; external destination not yet verified.
- A: first task assumes desktop folder + unspecified text editor + double-click. No OS-specific save instructions.
- A: completed 3 tasks as UI-only simulation (no claim an actual game was generated). Fourth task says no AI needed and asks for an unexplained core loop / one-page plan; continuity blocker P1.
- Trouble panel has current task/tool/outcome/criteria but no field for actual problem.
- B: exact input + beginner selection cannot generate until 2D/3D, platform, budget, team, purpose chosen. After choosing 2D/Web/free/solo/undecided, dedicated 1v1 battle with HP, victory/defeat and retry appears. Prompt says no additional specific details.

## Discovery / execution
- Six independent read-only specialist audits completed; source risks require live corroboration, not treated as observed defects.
- Primary job: follow one action, open its AI, send its instruction, observe success, continue with existing game.
- Keep deterministic selection, existing affiliate/analytics/SEO protections, privacy-safe URLs. No ranking or monetization expansion.
- Still in production observation phase: C, progress/reload/history, accordion, Tools/Compare, affiliate, mobile.
- Planned fix scope: concrete beginner handoff/continuity, understandable initial confirmation, help feedback, reproducible observed navigation issues.
- Quality/build/E2E/Preview/visual recheck: not run for this change yet. Merge prohibited until complete.
- Next: finish production observations, implement assigned fixes, run mandatory gates, publish PR Preview, re-run A/B/C and mobile. If blocked, leave branch/PR unmerged and report exact blocker.

## Implementation checkpoint
- Observed B/C dedicated first tasks; C background/character/dialogue/next present. Accordion collapse reproduced: zero completion checkboxes after close, anchor cannot reopen (P1).
- Tools code + Copilot search retains goal/q URL; comparison drops production context and leads with equivalent pricing boilerplate (high P2).
- Implemented full single-HTML beginner queue, explicit starter proposal, direct Copilot chat, isolated paste/preview/save/restore workspace, editable trouble text, local copy feedback, recoverable current accordion, per-draft progress, matching export/detail plan, safe local Project return context, browser-vs-desktop decision guidance.
- Existing explicit engine and 3D choices retain advanced flow; no silent coercion.
- Interpreter preserves first-time wording and explicit initial 1v1 scope.
- Home preview corrected to one HTML; privacy documents game-code storage.
- Quality PASS: 198 tests, lint, typecheck, affiliate/data/sitemap checks. Scripts use node --import tsx (same validators) to avoid unsupported tsx CLI IPC socket.
- Build PASS: 56 pages.
- Local E2E BLOCKED: bundled Chromium missing; official installer timed out repeatedly. Added PR E2E workflow with artifact upload; execution not yet verified.
- Cloud Browser provides no supported viewport resize. A local mobile harness URL was denied by browser URL security policy; no bypass attempted. 375/320 live manual check remains incomplete. E2E screenshots remain secondary evidence and must be inspected.
- Browser session timed out during history operations; observed Tools state returned, remaining history test not yet accepted.
- Preview / final visual A/B/C / affiliate destinations / all acceptance / production smoke: pending. Merge remains prohibited.
