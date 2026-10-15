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
  dedicated CI job; Chromium crosscheck 10/10; quality/build pass; durable
  raw logs and explicitly Chromium-only screenshots prepared.
- Current: WebKit execution BLOCKED. Official download hosts return 403
  `Domain forbidden` even after permitted escalation; ten E2E cases all fail
  before browser launch because `webkit-2336` is absent. Not a UI failure and
  not an approval-review denial. No common UI fixes or confirmed WebKit defects.
- Remaining: run WebKit on a capable runner, inspect rendered evidence,
  independent acceptance and physical iPhone checks. Full pre-existing
  Chromium E2E not run. Desktop/200% WebKit evidence not generated.
- Evidence and actual commands/results: `docs/screenshots/webkit-mobile/README.md`.
- Next: inspect draft PR's `mobile-webkit` job at its exact head; if it cannot
  run, install WebKit on an allowed runner and run `npm run test:e2e:webkit`.
  Preserve branch lineage; do not merge without owner approval.
