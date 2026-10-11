const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = __dirname;
const source = fs.readFileSync(path.join(root, '../../../app/articles/ai-browser-game-how-to/page.tsx'), 'utf8');
const html = source.match(/const starterGame = `([\s\S]*?)`;/)[1];
const cases = [
  ['syntax', 'const enemyName = "スライム";', 'const enemyName = ;'],
  ['selector', 'const fight = document.querySelector("#fight");', 'const fight = document.querySelector("#attack");'],
  ['reset', '      fight.disabled = false;\n', ''],
];
fs.mkdirSync(path.join(root, 'fixtures'), {recursive:true});
fs.writeFileSync(path.join(root, 'fixtures/original.html'), html);
const manifest = {source:'app/articles/ai-browser-game-how-to/page.tsx', base:'34911361159699c3967eef63530c7fde290876d8', cases:[]};
for (const [id, before, after] of cases) {
  if (html.split(before).length !== 2) throw new Error(`Expected exactly one replacement: ${id}`);
  const broken = html.replace(before, after);
  // Repairs are independently saved by reversing the exact mutation.
  const fixed = id === 'reset' ? broken.replace('      enemyHp = 18;\n', '      enemyHp = 18;\n' + before) : broken.replace(after, before);
  if (fixed !== html) throw new Error(`Repair differs from original: ${id}`);
  fs.writeFileSync(path.join(root, `fixtures/${id}-broken.html`), broken);
  fs.writeFileSync(path.join(root, `fixtures/${id}-repaired.html`), fixed);
  manifest.cases.push({id,before,after,brokenSha256:crypto.createHash('sha256').update(broken).digest('hex'),repairedSha256:crypto.createHash('sha256').update(fixed).digest('hex')});
}
fs.writeFileSync(path.join(root, 'manifest.json'), JSON.stringify(manifest,null,2)+'\n');
