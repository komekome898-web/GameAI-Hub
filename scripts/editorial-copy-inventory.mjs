/** Read-only candidate inventory, not a TSX renderer or automatic rewrite tool.
 * Usage: node scripts/editorial-copy-inventory.mjs <output-directory> [git-ref]
 * Includes Japanese JSX text, string literals, template fragments and JSON values.
 * Dynamic interpolation, visibility, third-party quotations and logical strings
 * require human review in source context. No generated application source is edited.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import ts from 'typescript';
const [out, ref] = process.argv.slice(2);
if (!out) throw new Error('Supply output directory');
const files = execFileSync('git', ['ls-files', 'app', 'components', 'data', 'lib', 'public'], {encoding:'utf8'})
  .trim().split('\n').filter(p => /\.(tsx?|jsx?|json|html|md|txt|svg)$/.test(p) && !p.endsWith('AGENTS.md'));
fs.mkdirSync(out, {recursive:true});
const manifest = [];
const corpus = [];
for (const file of files) {
  const content = ref ? execFileSync('git', ['show', `${ref}:${file}`], {encoding:'utf8',maxBuffer:20*1024*1024}) : fs.readFileSync(file,'utf8');
  const entries = [];
  if (/\.(md|txt|html|svg)$/.test(file)) {
    if (/[ぁ-んァ-ヶ一-龠]/u.test(content)) entries.push({kind:'raw-document',line:1,text:content});
  } else {
    const source = ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true,file.endsWith('.json') ? ts.ScriptKind.JSON : file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function visit(node) {
      if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
        const text = node.text.replace(/\s+/gu,' ').trim();
        if (/[ぁ-んァ-ヶ一-龠]/u.test(text)) entries.push({kind:ts.SyntaxKind[node.kind],line:source.getLineAndCharacterOfPosition(node.getStart(source)).line+1,text});
      }
      ts.forEachChild(node,visit);
    }
    visit(source);
  }
  manifest.push({path:file,sha256:crypto.createHash('sha256').update(content).digest('hex'),candidates:entries.length,entries});
  for (const [i,entry] of entries.entries()) corpus.push(`## ${file} [${i+1}]\n\n${entry.text}\n`);
}
fs.writeFileSync(path.join(out,'inventory.json'),JSON.stringify({ref:ref??'working-tree',limitations:'Conservative candidates, including internal strings/quotes. Template expressions are fragments; human source-context review required. No runtime/translation completeness claim.',files:manifest},null,2)+'\n');
fs.writeFileSync(path.join(out,'corpus.md'),corpus.join('\n'));
console.log(JSON.stringify({files:manifest.length,filesWithText:manifest.filter(f=>f.candidates).length,candidates:manifest.reduce((n,f)=>n+f.candidates,0)}));
