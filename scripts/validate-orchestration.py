#!/usr/bin/env python3
import json, pathlib, subprocess
root=pathlib.Path(__file__).parents[1]
required=["orchestration-init.yml","orchestration-event.yml","orchestration-labels.yml","orchestration-reconcile.yml","orchestration-human-gate.yml","pr-orchestration.yml"]
for name in required:
 path=root/".github/workflows"/name
 subprocess.run(["ruby","-e","require 'yaml'; x=YAML.load_file(ARGV[0]); abort('invalid workflow') unless x && x['jobs'] && x['permissions']",str(path)],check=True)
for path in (root/".github/orchestration/schemas").glob("*.json"): json.loads(path.read_text())
json.loads((root/".github/orchestration/profiles.json").read_text())
json.loads((root/".github/orchestration/trusted-actors.json").read_text())
print("orchestration contracts and workflows valid")
