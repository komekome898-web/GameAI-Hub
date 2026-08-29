#!/usr/bin/env bash
set -euo pipefail

VERSION="2.15.0"
SKILL_ROOT=".agents/skills/ui-ux-pro-max"

echo "Installing UI UX Pro Max ${VERSION} for Codex..."
# --offline installs the assets bundled in the pinned npm package and avoids
# attaching repository credentials to upstream GitHub download requests.
npx --yes "ui-ux-pro-max-cli@${VERSION}" init --ai codex --offline --force

required=(
  "${SKILL_ROOT}/SKILL.md"
  "${SKILL_ROOT}/scripts/search.py"
  "${SKILL_ROOT}/data"
)

for path in "${required[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "UI UX Pro Max installation incomplete: missing $path" >&2
    exit 1
  fi
done

python3 "${SKILL_ROOT}/scripts/search.py" --help >/dev/null

echo "UI UX Pro Max is ready at ${SKILL_ROOT}."
