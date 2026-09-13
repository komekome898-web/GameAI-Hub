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
    path = root / ".github/workflows" / name
    subprocess.run([
        "ruby", "-e",
        "require 'yaml'; x=YAML.load_file(ARGV[0]); abort('invalid workflow') unless x && x['jobs'] && x['permissions']",
        str(path),
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
