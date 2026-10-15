#!/usr/bin/env python3
import json, pathlib, subprocess

root = pathlib.Path(__file__).parents[1]
required = [
    "orchestration-init.yml",
    "orchestration-event.yml",
    "orchestration-bind-pr.yml",
    "orchestration-labels.yml",
    "orchestration-reconcile.yml",
    "orchestration-human-gate.yml",
    "pr-orchestration.yml",
]
writer_workflows = [
    "orchestration-init.yml",
    "orchestration-event.yml",
    "orchestration-bind-pr.yml",
    "orchestration-reconcile.yml",
    "orchestration-human-gate.yml",
    "pr-orchestration.yml",
]

for name in required:
    if not (root / ".github/workflows" / name).is_file():
        raise SystemExit(f"missing required workflow: {name}")

# Validate every retained workflow, including alternate ingress and affiliate delivery.
for name in [path.name for path in (root / ".github/workflows").glob("*.yml")]:
    path = root / ".github/workflows" / name
    subprocess.run([
        "ruby", "-e",
        "require 'yaml'; x=YAML.load_file(ARGV[0]); abort('invalid workflow') unless x && x['jobs'] && (ARGV[1] != 'required' || x['permissions'])",
        str(path), "required" if name in required else "additional",
    ], check=True)

for name in writer_workflows:
    text = (root / ".github/workflows" / name).read_text()
    if "group: gameai-orchestration-manifest-writer" not in text:
        raise SystemExit(f"{name}: orchestration writer must use shared manifest concurrency group")
    if "queue: max" not in text:
        raise SystemExit(f"{name}: orchestration writer must use queue: max")
    if "cancel-in-progress: true" in text:
        raise SystemExit(f"{name}: orchestration writer must not cancel an in-flight writer")

for path in (root / ".github/orchestration/schemas").glob("*.json"):
    json.loads(path.read_text())
json.loads((root / ".github/orchestration/profiles.json").read_text())
json.loads((root / ".github/orchestration/trusted-actors.json").read_text())
print("orchestration contracts, writer concurrency, and workflows valid")

mode = json.loads((root / ".github/orchestration/operation-mode.json").read_text())
if mode != {"schema": "gameai-operation-mode/v1", "mode": "owner-directed"}:
    raise SystemExit("owner-directed operation mode must remain explicit; reactivation requires a reviewed migration")
affiliate = (root / ".github/workflows/register-affiliate.yml").read_text()
for required_text in ['npm run affiliate:set', 'npm run quality', 'HEAD:refs/heads/$branch', 'gh pr create --base main --head "$branch" --draft', 'data/affiliate-programs.json data/services.json']:
    if required_text not in affiliate:
        raise SystemExit(f"affiliate PR delivery missing: {required_text}")
if 'HEAD:main' in affiliate or 'gh pr merge' in affiliate or '--auto' in affiliate:
    raise SystemExit("affiliate workflow must never push main or merge")
print("owner-directed mode and affiliate PR delivery valid")
