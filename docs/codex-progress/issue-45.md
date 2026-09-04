# Issue 45 — Growth Phase 2B

- Task: Publish the first evidence-backed SEO pillar for `AI ブラウザゲーム 作り方` and connect it to the verified Project Generator continuation loop.
- Working branch: `feat/issue-45-browser-game-pillar`
- Latest pushed checkpoint: implementation checkpoint pending commit
- Completed phases: environment/auth/origin/main recovery; governing docs and Issues #44/#45/#47 loaded; independent discovery started.
- Current phase: PR/Preview verification; external GitHub Models handoff blocked by provider retirement brownout.
- Remaining phases: adoption thesis; atomic article + registry implementation; bounded intent preservation; analytics; tests; rendered QA; adversarial review/fixes; PR/Preview; merge/Production smoke.
- Blocking findings: P0: 0. P1: external-AI returned HTML evidence remains unavailable (GitHub Models HTTP 410 retirement brownout); P1 visual zoom issue fixed and recaptured. High-impact P2: 0 known.
- Quality gates: quality PASS (208 tests); build PASS; content E2E PASS (3); exact battle journey E2E PASS (1); structured data/content/sitemap validation PASS.
- GitHub/PR: authenticated write path to be proven; PR pending creation.
- Deployment: Preview pending PR.
- Assumptions/blockers: provider-specific claims will be limited to current primary sources; no affiliate promotion is needed for the first slice.
- Areas being audited: `app/articles`, `data/articles.ts`, `components/ProjectGeneratorClient.tsx`, `lib/project`, analytics, E2E.
- Exact next action: create PR, inspect CI/Preview; do not merge unless external-AI handoff acceptance can be completed or owner accepts the documented provider limitation.

## Internal thesis

The primary job is to turn a Japanese beginner's browser-game idea into one bounded `index.html`, make the exact paste/run/check/save/recover actions obvious, and continue with one change to the same artifact. Decision logic stays deterministic: an explicit, user-confirmed battle mechanic selects the bounded one-on-one battle recipe; unrelated text and unknowns stay unknown. No generalized intent engine, provider roundup, public hosting flow, affiliate placement, or additional pillar is included.

## Competitive adoption matrix (2026-09-04 recheck)

| competitor / source | useful pattern | user benefit | current GameAI Hub state | decision | implementation | metric | risk |
|---|---|---|---|---|---|---|---|
| [ひなテック](https://hinata-ya.tech/games/tutorials/ai-game-dev/) | exact environment and one-HTML artifact | removes setup ambiguity | Project flow existed; pillar did not | Adopt now | article states PC/browser/chat, one `index.html`, in/out scope | CTA → first task view | no time/free guarantee |
| ひなテック | paste/run preview | makes output tangible | sandboxed Project preview exists | Already covered | article points to exact editor/button | first task completion | preview is not safety/completion proof |
| ひなテック | logs/F12 near failure | gives a diagnostic action | contextual help exists; no embedded log bridge | Adopt now (qualified) | desktop Console guidance plus current-task trouble handoff | trouble → later completion | browser/OS differences |
| ひなテック | save, known-good backup, reopen | prevents destructive rewrites | download/reopen/working revision exist | Adopt now | save before modification and explicit restore steps | second-task reach | browser state ≠ game save ≠ hosting |
| ひなテック | multiple runnable samples | reduces blank-page friction | idea examples only | Defer | consider later Project experiment | sample → first run | distracts from user's idea; maintenance |
| [ドットインストール](https://dotinstall.com/lessons/ai_moguragame) | short sequential lessons and declared environment/update | easy resumption and freshness | task sequence/update metadata exist | Adopt now | numbered action gates, adjacent success/recovery, verified date | completion and continuation | do not copy lesson/example expression |
| ApplyNow hands-on writeup (Issue #44) | explicit rules and iterative modification | normalizes revision | scope/criteria/recovery exist | Already covered | one-change next task and regression recheck | second task reached | anecdote is not universal evidence |
| GAS tutorial (Issue #44) | publish/redeploy operations | enables sharing updates | Hub only runs/downloads local HTML | Defer | explicitly separate local result from hosting | future publish completion | provider/security/terms scope |
| Broad competitor promises | effortless arbitrary genres, speed/free assurances | marketing simplicity | contradicted by observed intent loss | Reject | bounded verified contract only | mismatch/confirmation edits | misleading claims |
| Broad tool/provider lists | early choice breadth | discovery | Tools/Compare already available later | Reject for first slice | no Meshy/ElevenLabs or affiliate promotion | irrelevant outbound rate | choice overload/pay bias |

Top five implemented opportunities: bounded intent preservation; exact environment/artifact path; known-good backup/reopen; step-local error handoff; one-change same-artifact continuation. Search volume and conversion uplift remain unknown pending production measurement.
