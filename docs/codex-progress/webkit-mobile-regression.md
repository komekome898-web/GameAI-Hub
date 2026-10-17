# WebKit mobile regression

- Scope: 320/375 Home/game/Back, ten games, article list/article/Back, menu,
  restored selection/focus/visible target, overflow, reduced motion, repeated
  operations. Article bodies/registries excluded. No merge/publication.
- Branch: `test/webkit-mobile-regression`.
- Canonical origin verified: `https://github.com/komekome898-web/GameAI-Hub.git`.
- Base and earliest remotely verified checkpoint:
  `c7013491dc46f2a316bb4a79094a21f3802041f0`.
- Launch: saved environment delegation; source conversation
  `01a13a49-3ec6-705f-ba25-a358fd8ac007`; no separate task ID exposed.
- Completed: isolated WebKit projects and command; ten regression cases;
  dedicated CI job; initial Chromium crosscheck 10/10; quality/build pass; durable
  raw logs and explicitly Chromium-only screenshots prepared.
- Current: local WebKit execution BLOCKED. Official download hosts return 403
  `Domain forbidden` even after permitted escalation; ten E2E cases all fail
  before browser launch because `webkit-2336` is absent. Not a UI failure and
  not an approval-review denial. No common UI fixes or confirmed WebKit defects.
- CI follow-up: at head `b947b637d58c657d1237ffc726ae37b16b209751`,
  quality run `38693373899` and `mobile-webkit` job `116284203369` in run
  `38693373884` succeeded. Artifact `11953720267` exists, but its normal download
  failed with 403 Forbidden from the GitHub artifact distribution host. No bypass.
  Independent source review by `/root/mobile_review` found no confirmed P0/P1;
  independent WebKit image review remains BLOCKED. Reviewer identified missing
  article-detail screenshot; follow-up adds it and requires a fresh head CI run.
- Follow-up: root-client-width overflow assertion, article-detail screenshot,
  two synthetic 200% root-text header cases (12 cases total). Header P2 report
  investigated in Chromium on main: root-text 200% did not reproduce overlap,
  hidden CTA or broken operation. CSS zoom2 gives a tall three-row header;
  reviewer classified vertical footprint as P2 candidate pending original exact
  evidence. No common UI change. PR113-specific code areas remain untouched.
- Post-CI independent finding: coordinator's normal GitHub connector retrieved
  b947b63 artifact and visually confirmed nearly-white title/genre/access note
  on ivory in `webkit-375-punching-reduce.png`. Functional PASS did not establish
  visual acceptance. Current common UI fix is one `.game-detail .page-head`
  foreground rule using existing `--b3-ink`; no article or registry edits.
  Added computed paper-text contrast regression and four engine-labelled JSONs
  across all ten games, both widths and motion settings. Fresh final-head CI
  and coordinator WebKit image review are required. Local artifact fetching
  remains blocked and has not been retried.
- Remaining: run WebKit on a capable runner, inspect rendered evidence,
  independent acceptance and physical iPhone checks. Full pre-existing
  Chromium E2E in CI is still running at the recorded checkpoint. Desktop and
  physical-device evidence remain untested; new synthetic root200 cases need
  final-head CI results.
- Evidence and actual commands/results: `docs/screenshots/webkit-mobile/README.md`.
- Next: inspect draft PR's `mobile-webkit` job at its exact head; if it cannot
  run, install WebKit on an allowed runner and run `npm run test:e2e:webkit`.
  Preserve branch lineage; do not merge without owner approval.
