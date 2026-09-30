# GameAI-Hub Codex Cloud Environment contract

This is the single repository-side contract and authoritative script reference
for the ChatGPT-managed reusable **GameAI-Hub** Codex Cloud Environment for
`komekome898-web/GameAI-Hub`. Account-side Environment settings must match this
versioned repository copy. Do not duplicate the full scripts in other
repository instructions.

## Configuration and credential contract

- Container cache is enabled to accelerate fresh tasks when the platform can
  reuse a prepared image.
- The canonical Git fetch and push URL is
  `https://github.com/komekome898-web/GameAI-Hub.git`.
- `GITHUB_PAT` is an account-side **Environment variable** for this GameAI-Hub
  Environment. It must never be committed, printed, logged, serialized,
  screenshotted, or placed in chat. Do not move it to the Environment Secrets
  section: Codex requires the Environment variable during the agent phase.
- `GH_TOKEN` is the process variable consumed by `gh`. Setup, Maintenance, and
  the repository hard gate map `GITHUB_PAT` to `GH_TOKEN` in their own shells
  as appropriate; an export performed in one shell is not assumed to persist
  into a later agent shell.
- Setup is the expensive cache-building phase. Maintenance restores the
  canonical remote, authentication, refs, and compatible cached dependencies
  for every cached fresh task. Both fail closed.
- Environment preparation is not task acceptance or repository proof. Every
  task must still execute the hard gates in `CODEX_CLOUD_TASK.md`.

## Authoritative account-side scripts

The scripts below are the single copy-paste repository reference for the
account-side Environment. Run both from the repository root without shell
tracing so credentials cannot be exposed.

### Setup

```bash
set -euo pipefail

canonical_origin='https://github.com/komekome898-web/GameAI-Hub.git'
repository='komekome898-web/GameAI-Hub'
fingerprint_dir="$HOME/.cache/gameai-hub"
fingerprint_file="$fingerprint_dir/npm-deps.sha256"

for command_name in git gh node npm; do
  command -v "$command_name" >/dev/null
done

if [ -n "${GITHUB_PAT:-}" ]; then
  export GH_TOKEN="$GITHUB_PAT"
fi
if [ -z "${GH_TOKEN:-}" ]; then
  echo 'BLOCKED: GitHub credential is unavailable' >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$canonical_origin"
else
  git remote add origin "$canonical_origin"
fi
git remote set-url --push origin "$canonical_origin"
test "$(git remote get-url origin)" = "$canonical_origin"
test "$(git remote get-url --push origin)" = "$canonical_origin"

gh auth setup-git
test "$(gh api "repos/$repository" --jq '.permissions.push')" = 'true'
git fetch origin --prune
git show-ref --verify refs/remotes/origin/main >/dev/null
git ls-remote --exit-code origin refs/heads/main >/dev/null

test -f package.json
test -f package-lock.json
npm ci
npx playwright install --with-deps chromium

mkdir -p "$fingerprint_dir"
dependency_fingerprint="$(
  {
    node --version
    npm --version
    sha256sum package.json
    sha256sum package-lock.json
  } | sha256sum | awk '{print $1}'
)"
printf '%s\n' "$dependency_fingerprint" > "$fingerprint_file"
```

### Maintenance

Maintenance never checks out or resets a task branch. It always repairs and
verifies remote/auth/ref state, but refreshes cached dependencies and Chromium
only when `node_modules` is absent or the dependency/runtime fingerprint
changed.

```bash
set -euo pipefail

canonical_origin='https://github.com/komekome898-web/GameAI-Hub.git'
repository='komekome898-web/GameAI-Hub'
fingerprint_dir="$HOME/.cache/gameai-hub"
fingerprint_file="$fingerprint_dir/npm-deps.sha256"

for command_name in git gh node npm; do
  command -v "$command_name" >/dev/null
done


if [ -n "${GITHUB_PAT:-}" ]; then
  export GH_TOKEN="$GITHUB_PAT"
fi
if [ -z "${GH_TOKEN:-}" ]; then
  echo 'BLOCKED: GitHub credential is unavailable' >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$canonical_origin"
else
  git remote add origin "$canonical_origin"
fi
git remote set-url --push origin "$canonical_origin"
test "$(git remote get-url origin)" = "$canonical_origin"
test "$(git remote get-url --push origin)" = "$canonical_origin"

gh auth setup-git
test "$(gh api "repos/$repository" --jq '.permissions.push')" = 'true'
git fetch origin --prune
git show-ref --verify refs/remotes/origin/main >/dev/null
git ls-remote --exit-code origin refs/heads/main >/dev/null

test -f package.json
test -f package-lock.json
dependency_fingerprint="$(
  {
    node --version
    npm --version
    sha256sum package.json
    sha256sum package-lock.json
  } | sha256sum | awk '{print $1}'
)"
cached_fingerprint=''
if [ -f "$fingerprint_file" ]; then
  cached_fingerprint="$(cat "$fingerprint_file")"
fi

if [ ! -d node_modules ] || [ "$dependency_fingerprint" != "$cached_fingerprint" ]; then
  npm ci
  npx playwright install --with-deps chromium
  mkdir -p "$fingerprint_dir"
  printf '%s\n' "$dependency_fingerprint" > "$fingerprint_file"
fi
```

Refresh/publish the Environment after changes to this contract or its Node,
npm, package manifests, Playwright, or browser requirements. The non-secret
fingerprint at `$HOME/.cache/gameai-hub/npm-deps.sha256` combines the Node and
npm versions with hashes of `package.json` and `package-lock.json`; it is not
evidence that the platform restored a container-cache hit.

## Validation after Environment changes

Start a fresh GitHub-comment-triggered task and, before agent-side repair,
record only non-secret facts: branch/worktree status; fetch and push origin;
presence of `origin/main` and `node_modules`; Node/npm versions; Playwright
CLI/package availability; and Chromium presence determined by testing the
filesystem path returned by Playwright's `chromium.executablePath()`. A
pre-mapping `gh auth status` failure alone does not show Environment failure:
the agent shell must first map `GITHUB_PAT` to `GH_TOKEN` as required by the
hard gate. Then run the complete normal repository hard gate.

Classify the reusable Environment from the full prepared-state evidence.
Classify a cache hit only when the platform provides direct, unambiguous
cache-hit evidence. Dependency presence, browser presence, or startup speed
alone does not prove a cache hit; otherwise report cache-hit status as
`UNKNOWN`.
