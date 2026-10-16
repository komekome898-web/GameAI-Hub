#!/usr/bin/env bash
# Local advisory checks only; no source writes, publishing, CI or score gate.
set -euo pipefail
base=${1:?Usage: editorial-copy-check.sh BASE OUTPUT_DIRECTORY}
out=${2:?Usage: editorial-copy-check.sh BASE OUTPUT_DIRECTORY}
root=$(git rev-parse --show-toplevel)
cd "$root"
mkdir -p "$out"
out=$(cd "$out" && pwd)
node scripts/editorial-copy-inventory.mjs "$out/before" "$base"
node scripts/editorial-copy-inventory.mjs "$out/final"
python - "$out" <<'PY'
import json,sys
from pathlib import Path
out=Path(sys.argv[1]);b=json.loads((out/'before/inventory.json').read_text());a=json.loads((out/'final/inventory.json').read_text())
shards=out/'shards';shards.mkdir(exist_ok=True);index=[]
for bf,af in zip(b['files'],a['files']):
    if bf['path']!=af['path'] or len(bf['entries'])!=len(af['entries']):
        raise SystemExit('Candidate structure changed; inspect and align source/final manually: '+bf['path'])
    for i in range(0,len(bf['entries']),40):
        sid=f'{len(index):03}'
        for label,f in [('before',bf),('after',af)]:
            (shards/f'{sid}-{label}.md').write_text('\n'.join(f'## {f["path"]} [{j+1}]\n\n{entry["text"]}\n' for j,entry in enumerate(f['entries'][i:i+40],i)))
        index.append({'id':sid,'path':bf['path'],'startEntry':i+1,'endEntry':min(i+40,len(bf['entries']))})
(shards/'index.json').write_text(json.dumps(index,indent=2)+'\n')
(shards/'ids.txt').write_text('\n'.join(x['id'] for x in index)+'\n')
PY
skill=.agents/skills/yomiyasu/scripts
python "$skill/yomiyasu_lint.py" "$out/before/corpus.md" --json > "$out/original-lint.json"
while read -r id; do
  python "$skill/yomiyasu_check.py" run --source "$out/shards/$id-before.md" --final "$out/shards/$id-after.md" --state-dir "$out/state" --json > "$out/shards/$id-run.json"
  python "$skill/yomiyasu_check.py" verify --final "$out/shards/$id-after.md" --state-dir "$out/state" --json > "$out/shards/$id-verify.json"
done < "$out/shards/ids.txt"
printf 'Executed local advisory checks. Review meaning risks and compare final source before delivery: %s\n' "$out"
