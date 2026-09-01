# Issue #23 progress

- Task: Issue #23 — beginner game-building guide
- Working branch: `feat/beginner-game-building-guide`
- Latest checkpoint commit: initial checkpoint (see Git history)
- Completed phases: GitHub authentication, origin/main recovery, working branch creation
- In-progress phase: repository and current-product discovery
- Remaining phases: design thesis; implementation; adversarial and visual review; regression audit; quality/build/E2E; PR/checks/merge/production smoke
- Unresolved P0/P1/P2: discovery pending
- Quality-gate status: not run
- Known blockers / assumptions: none
- Areas currently being edited: discovery only
- Exact next action on resume: read Issue #23, recent UI/UX PRs, existing evidence, Next.js docs, then run the current app and complete independent discovery.

## Product thesis (2026-09-01)
- Primary job: turn one plain-language idea into one executable action that ends in an observable game artifact, then advance one action at a time.
- Value: the product supplies where to work, what to copy, what should happen, how to decide Done, and a safe troubleshooting question; it is not a tool ranking directory.
- Journey: idea → plain-language experience confirmation → one current action → inline instruction/prompt → observable artifact and criteria → Done → next action.
- Decision/data: retain typed project plan, stable checklist IDs, deterministic affiliate-neutral recommendations, verified service provenance, and conservative unknowns.
- Trust: free text remains out of analytics/share URLs; affiliate payout never selects a tool; unsupported price/rights/time remain unknown.
- Not building: a new payment system, affiliate ranking, guaranteed completion times, or a standalone prompt library.

## Checkpoint update
- Completed: independent product/UX/workflow/architecture/trust discovery; beginner-first Home copy; plain experience labels; beginner current-action surface; inline prompt success; local troubleshooting prompt; artifact-led progress; beginner workflow moves running setup/core loop ahead of planning governance.
- In progress: tests and first rendered QA.
- Remaining: fix test expectation if required; current/final screenshots; adversarial review/fixes; full quality/build/E2E; regression/protected audit; PR/checks/merge/production smoke.
- Current findings: P0 none identified; P1 rendered review pending; engine-undecided beginner flow remains a review focus.
- Targeted gate: typecheck passed; 55/56 targeted tests passed before copy compatibility fix.
- Next action: rerun targeted tests, launch app and capture first rendered pass at required viewports.

## Adversarial pass 1 and fixes
- Review coverage: beginner/product skeptic/information architecture/browser-back; mobile/visual/accessibility/game-production; Next.js/recommendation/trust/affiliate/monetization.
- P1 fixes: beginner web starts with a genre-specific running slice; unknown engine no longer blocks vanilla-browser slice; alternatives/evidence and duplicate Today/Roadmap/future Quests are removed from beginner execution surface; criteria and Done now follow the active task; full artifact inventory is suppressed in beginner mode; Home preview now shows a running battle; troubleshooting text uses bounded confirmed details as quoted data rather than raw idea.
- Quality: `npm run quality` passed (165 tests). `npm run build` passed (56 pages). E2E first rerun exposed obsolete expectations; selectors were migrated to the current task and beginner evidence behavior; final rerun pending.
- Rendered pass 2 files are under `docs/screenshots/issue-23/`; a shorter final pass is still required after the latest CSS changes.
- Remaining: final rendered capture/review, final E2E + repeat, regression/protected audit record, PR/checks/merge/deploy.

## Current blocking status
- Full E2E rerun: 10 passed, 5 failed. One changed-flow expectation was corrected afterward; remaining failures include Compare mobile visibility, trailing-slash URL expectation, and affiliate CTA lookup in the current E2E environment. Required repeat-each=3 was not run because the base E2E gate is not green.
- Acceptance remains incomplete: final post-fix screenshots and independent second-pass screenshot verification are still required.
- Merge is blocked. Preserve this remote branch and PR; next action is diagnose the five E2E failures from traces, rerun all gates, capture final screenshots, and perform a different-agent second review.

## Resume checkpoint — execution clarity fixes
- Added a direct official-site launch CTA through the protected `OutboundLink` path, concrete sign-in/folder/file/open steps, project-specific confirmed details in the first playable prompt, compact artifact progress, next-task focus, and accessible stuck disclosure state.
- Independent pre-fix critics identified P1 launch ambiguity, hidden artifact progress, wrong Done focus, and stale/failed screenshot evidence; these are implemented but require fresh rendering and independent verification.
- Targeted tests reached 55/56 under concurrent Playwright/build load; the remaining test timed out rather than asserting a failure. Re-run without concurrent workers.
- Next action: finish clean E2E diagnosis, fix classifications, rerun unit/quality/build/E2E, then capture production-server screenshots.

## E2E failure classification and fixes
- Project result heading: stale expectation already replaced with stable `.project-result`; journey and persistence pass.
- Compare 2/4 and 4/4 (plus post-removal 3/4): stale locators targeted a hidden legacy counter; tests now assert the visible responsive picker summary while retaining comparison, keyboard, URL and diff checks.
- Tools detail URL: navigation passed; canonical static route includes a trailing slash, so tests now accept the canonical optional slash without weakening back/forward assertions.
- ElevenLabs CTA: protected affiliate behavior rendered correctly; the stale accessible name was replaced by the actual visible `/公式サイト/` label while retaining exact affiliate URL, target, rel and disclosure assertions.
- Clean run after initial fixes: 14/15 passed; the sole remaining failure was the same stale hidden 3/4 counter after keyboard removal and is now corrected. Full rerun pending.

## Final acceptance fix pass
- First browser slice now produces one self-contained `index.html`, includes concrete Copilot chat → desktop folder → text editor → save → double-click steps, and treats confirmed details as delimited non-instruction data.
- Monster, visual novel and simple browser Done criteria now exactly match their generated playable slice.
- Beginner web no longer falls into an engine-comparison task after first success; it advances to the plain-language UI prototype artifact.
- Done focus scrolls to the new current action heading. Mobile evidence capture disables sticky positioning only during full-page screenshot stitching to avoid Playwright duplicating the real sticky header; normal viewport behavior remains tested.
- Fresh production-server evidence is in `docs/screenshots/issue-23/final/`, including three beginner genres, stuck, after-Done, 375px, 320px/200% zoom, desktop, Home, Tools and Compare.
- Gates before the latest acceptance fix: E2E 15/15 and repeat-each=3 45/45; quality 165/165 and build passed. All must be rerun after this final behavior change.

## Final acceptance — complete
- E2E failure classifications: all five were stale rendered-contract locators/URL assumptions; substantive Compare, history, affiliate URL/rel/disclosure and Project assertions remain. Final added coverage verifies Done advances to the executable second task with its official tool CTA.
- Final gates: `npm run quality` PASS (20 files, 165 tests); `npm run build` PASS (56 pages); `npm run test:e2e` PASS (15/15); `npm run test:e2e -- --repeat-each=3` PASS (45/45).
- Final rendered evidence: `docs/screenshots/issue-23/final/` at Home 375 first/full, Home 320/200%, desktop, Project 375, Project 320/200%, expanded current work, stuck, after-Done, monster, visual novel, simple browser, Tools and Compare.
- Independent final reviewers verified: matching prompt/artifact/Done criteria for all three beginner genres; explicit Copilot chat → one-file save → browser-run instructions; compact artifact progress; bounded troubleshooting; next-task focus and executable first three tasks; readable 320/200%; no dev overlay.
- Functional regression audit: Project URL/deep link, Compare and Tools back/forward, share/export/private draft/progress persistence, project-specific details, provider fallback, mobile nav, keyboard focus and long Japanese remain covered.
- Protected audit: GA4 `G-B9Q283QVER`, production gtag, outbound/affiliate events, safe sub_id, no free-text analytics, affiliate fallback/rel/disclosure, ElevenLabs/Meshy registry automation, recommendation neutrality, Search Console, metadata/canonical/robots/sitemap unchanged and passing tests/validation.
- Remaining P0: none. Remaining P1: none. Remaining high-impact P2: none. Known lower P2/P3: Tools/Compare remain intentionally dense expert/secondary surfaces.
- Exact next action: push final commit, wait for PR #38 quality/Vercel checks, merge if green, verify main SHA/production deployment, run production smoke.
