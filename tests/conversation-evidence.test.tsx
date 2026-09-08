import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ConversationEvidence, type ConversationTurn } from '@/components/ConversationEvidence';

const css=readFileSync(join(process.cwd(),'app/globals.css'),'utf8');
const componentCss=css.slice(css.indexOf('/* Conversation Evidence:'));
const turns:ConversationTurn[]=[
 {speaker:'owner',marker:'第1の指摘',body:<p>なぜ絶対水準で評価したのかわかりません。</p>},
 {speaker:'fable',body:<p>母集団を取り違えていました。</p>},
];
const record={title:'母集団の取り違え',recordedAt:'2026-09-04',source:{label:'docs/POSTMORTEM_2026-09-04_tp_precursor.md'}};

describe('conversation evidence',()=>{
 it('labels every speaker with visible text and keeps list semantics when markers are removed',()=>{
  render(<ConversationEvidence {...record} turns={turns}/>);
  const ledger=screen.getByRole('list');
  expect(ledger.tagName).toBe('OL');
  // list-style:none strips implicit list semantics in Safari, so the role is declared explicitly.
  expect(ledger.getAttribute('role')).toBe('list');
  const entries=within(ledger).getAllByRole('listitem');
  expect(entries).toHaveLength(2);
  expect(within(entries[0]).getByText('OWNER')).toBeTruthy();
  expect(within(entries[0]).getByText('オーナー（人間）')).toBeTruthy();
  expect(within(entries[0]).getByText('第1の指摘')).toBeTruthy();
  expect(within(entries[1]).getByText('FABLE 5.1')).toBeTruthy();
  expect(within(entries[1]).getByText('Claude Code')).toBeTruthy();
 });
 it('announces the speaker before the quoted text and keeps latin labels out of Japanese phonetics',()=>{
  const html=renderToStaticMarkup(<ConversationEvidence {...record} turns={turns}/>);
  expect(html.indexOf('発言者は人間のオーナー')).toBeLessThan(html.indexOf('なぜ絶対水準'));
  expect(html.indexOf('発言者はAI')).toBeLessThan(html.indexOf('母集団を取り違えて'));
  expect(html).not.toContain('aria-hidden');
  expect(html).toContain('<span class="conv-speaker-name" lang="en">OWNER</span>');
  expect(html).toContain('<span class="conv-speaker-sub" lang="ja">オーナー（人間）</span>');
  expect(html).toContain('<span class="conv-speaker-sub" lang="en">Claude Code</span>');
 });
 it('keeps one visual identity for the title whatever heading level the article needs',()=>{
  const html=renderToStaticMarkup(<ConversationEvidence {...record} headingLevel={2} turns={turns}/>);
  const id=/aria-labelledby="([^"]+)"/.exec(html)![1];
  expect(html).toContain(`<h2 class="conv-evidence-title" id="${id}">母集団の取り違え</h2>`);
  expect(renderToStaticMarkup(<ConversationEvidence {...record} turns={turns}/>)).toContain('<h3 class="conv-evidence-title"');
  // h1,h2 are serif site-wide, so the card pins its own family and weight.
  expect(componentCss).toMatch(/\.conv-evidence-title\{[^}]*font-family:var\(--font-sans\)/);
  expect(componentCss).toMatch(/\.conv-evidence-title\{[^}]*font-weight:800/);
 });
 it('shows the record date and extent of the exchange without exposing the internal source label',()=>{
  const html=renderToStaticMarkup(<ConversationEvidence {...record} turns={turns}/>);
  expect(html).toContain('<time dateTime="2026-09-04">2026-09-04</time>');
  expect(html).toContain('発言 2 件');
  expect(html).not.toContain('出典');
  expect(html).not.toContain('docs/POSTMORTEM_2026-09-04_tp_precursor.md');
  const linked=renderToStaticMarkup(<ConversationEvidence {...record} source={{label:'INCIDENTS.md',href:'https://example.com/'}} turns={turns}/>);
  expect(linked).not.toContain('INCIDENTS.md');
  expect(linked).not.toContain('https://example.com/');
 });
 it('adds the editorial annotation quietly and only when supplied',()=>{
  const html=renderToStaticMarkup(<ConversationEvidence {...record} turns={turns} annotation={{question:'この時点で何が間違っていた？',answer:<p>母集団が変わっていた。</p>}}/>);
  expect(html).toContain('<p class="conv-note-label" lang="en">RESEARCH NOTE</p>');
  expect(html).toContain('この時点で何が間違っていた？');
  expect(html).not.toContain('role="alert"');
  const japanese=renderToStaticMarkup(<ConversationEvidence {...record} turns={turns} annotation={{label:'編集部注',answer:<p>注記。</p>}}/>);
  expect(japanese).toContain('<p class="conv-note-label">編集部注</p>');
  expect(renderToStaticMarkup(<ConversationEvidence {...record} turns={turns}/>)).not.toContain('conv-note');
 });
 it('separates cards that share a title and renders nothing without turns',()=>{
  const explicit=renderToStaticMarkup(<ConversationEvidence {...record} id="conv-second-round" turns={turns}/>);
  expect(explicit).toContain('aria-labelledby="conv-second-round"');
  expect(renderToStaticMarkup(<ConversationEvidence {...record} title="空" turns={[]}/>)).toBe('');
 });
 it('stays inside the article system: no motion, no decoration, no reserved CTA colour',()=>{
  expect(componentCss).not.toMatch(/gradient|box-shadow|transition|animation|:hover/);
  // #ea580c / #d65a20 are the primary action; #c2410c is --warn. The card must not reuse them.
  expect(componentCss).not.toMatch(/#ea580c|#d65a20|#c2410c/i);
  expect(componentCss).toMatch(/\.conv-turn-body\{[^}]*font-size:1rem/);
  expect(componentCss).toContain('word-break:break-word');
  expect(componentCss).toContain('@media(max-width:400px)');
 });
});
