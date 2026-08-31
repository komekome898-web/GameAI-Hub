import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const css=readFileSync(join(process.cwd(),'app/globals.css'),'utf8');
const marker='/* Unified light surfaces for routes that previously inherited the legacy dark UI. */';
const unifiedTheme=css.slice(css.indexOf(marker));

describe('unified light UI contract',()=>{
  it('keeps legacy dark literals out of the final route overrides',()=>{
    expect(unifiedTheme).not.toContain('#101720');
    expect(unifiedTheme).not.toContain('#0c131a');
    expect(unifiedTheme).not.toContain('#0b1117');
    expect(unifiedTheme).toContain('.idea-review,');
    expect(unifiedTheme).toContain('.stage-decision,');
    expect(unifiedTheme).toContain('.compare-scroll tbody th{background:#f6faf9}');
    expect(unifiedTheme).toContain('.today-grid .is-primary{');
  });

  it('defines dedicated readable layouts for articles, guides, policies, and 404',()=>{
    expect(unifiedTheme).toContain('article.page-shell>section{');
    expect(unifiedTheme).toContain('max-width:760px;');
    expect(unifiedTheme).toContain('div.page-shell .stack-mini-grid h2{');
    expect(unifiedTheme).toContain('.prose h1{');
    expect(unifiedTheme).toContain('.affiliate-disclosure-note{');
    expect(unifiedTheme).toContain('.empty{');
  });

  it('keeps the narrow zoom header and compare summary within one reflow column',()=>{
    const narrow=unifiedTheme.slice(unifiedTheme.lastIndexOf('@media(max-width:340px)'));
    expect(narrow).toContain('.brand-copy{display:none!important}');
    expect(narrow).toContain('.menu-button{flex:0 0 44px');
    expect(narrow).toContain('.compare-picker-panel>summary{display:grid;grid-template-columns:minmax(0,1fr)');
  });
});
