# GameAI-Hub Codex Cloud Environment contract

This is the repository-side contract for the ChatGPT-managed reusable
**GameAI-Hub** Codex Cloud Environment for
`komekome898-web/GameAI-Hub`. Account-side Environment settings must match this
document. Do not place credential values in this file, repository output, task
prompts, or chat.

## Configuration contract

- Container cache is enabled to accelerate fresh tasks when the platform can
  reuse a prepared image.
- The canonical Git fetch and push URL is
  `https://github.com/komekome898-web/GameAI-Hub.git`.
- `GITHUB_PAT` is the authorized account-side secret used when `GH_TOKEN` is
  not already supplied. `GH_TOKEN` is the process variable consumed by `gh`.
  Store values only in the Environment's secret configuration.
- Setup prepares expensive, reusable dependencies and browser tooling.
- Maintenance restores canonical remote/auth/fetch state on each Environment
  refresh. It is preparation, not task acceptance or repository proof.

## Authoritative account-side scripts

Setup runs from the repository root:

```bash
npm ci
npx playwright install chromium
```

Refresh/publish the Environment after lockfile, Node, npm, Playwright, or
browser dependency changes so cached dependencies do not become the expected
source of truth.

Maintenance uses the following shape. It must not print either secret:

```bash
git remote set-url origin https://github.com/komekome898-web/GameAI-Hub.git
git remote set-url --push origin https://github.com/komekome898-web/GameAI-Hub.git

if [ -n "${GITHUB_PAT:-}" ]; then
  export GH_TOKEN="$GITHUB_PAT"
fi
gh auth setup-git
git fetch origin --prune
```

Maintenance may fail closed when the required credential is unavailable. A
task must still execute every hard-gate verification in `CODEX_CLOUD_TASK.md`,
including canonical fetch and push URLs, authenticated API access,
`origin/main` SHA, and an actual remote checkpoint/write-path proof.

## Validation after Environment changes

Start a fresh GitHub-comment-triggered task and, before agent-side repair,
record only non-secret facts: branch/worktree status; fetch and push origin;
whether `gh auth status` succeeds; presence of `origin/main`, `node_modules`,
Playwright CLI/package and Chromium; Node/npm versions; and any safe dependency
fingerprint marker. Then run the normal repository hard gate.

Classify the reusable Environment as observed only when the fresh task starts
with the expected prepared state. Classify a cache hit only when the platform
provides direct, unambiguous cache-hit evidence. Dependency presence, browser
presence, or startup speed alone does not prove a cache hit; otherwise report
cache-hit status as `UNKNOWN`.
