#!/usr/bin/env bash
set -euo pipefail

SKILL_ROOT=".agents/skills/ui-ux-pro-max"

if [[ ! -f "${SKILL_ROOT}/SKILL.md" || ! -f "${SKILL_ROOT}/scripts/search.py" ]]; then
  echo "UI UX Pro Max is not installed. Run: npm run uiux:setup" >&2
  exit 1
fi

python3 "${SKILL_ROOT}/scripts/search.py" --help >/dev/null

echo "UI UX Pro Max installation verified."
