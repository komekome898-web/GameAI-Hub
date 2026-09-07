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

describe('conversation evidence',()=>{
 it('labels every speaker with visible text and an ordered record',()=>{
  render(<ConversationEvidence title="母集団の取り違え" turns={turns}/>);
  const record=screen.getByRole('list');
  expect(record.tagName).toBe('OL');
  const entries=within(record).getAllByRole('listitem');
  expect(entries).toHaveLength(2);
  expect(within(entries[0]).getByText('OWNER')).toBeTruthy();
  expect(within(entries[0]).getByText('オーナー（人間）')).toBeTruthy();
  expect(within(entries[0]).getByText('第1の指摘')).toBeTruthy();
  expect(within(entries[1]).getByText('FABLE 5.1')).toBeTruthy();
  expect(within(entries[1]).getByText('Claude Code')).toBeTruthy();
 });
 it('announces the speaker before the quoted text for screen readers',()=>{
  const html=renderToStaticMarkup(<ConversationEvidence title="母集団の取り違え" turns={turns}/>);
  expect(html.indexOf('発言者は人間のオーナー')).toBeLessThan(html.indexOf('なぜ絶対水準'));
  expect(html.indexOf('発言者はAI')).toBeLessThan(html.indexOf('母集団を取り違えて'));
  expect(html).not.toContain('aria-hidden');
 });
 it('links the figure to its own heading and keeps the requested heading level',()=>{
  const html=renderToStaticMarkup(<ConversationEvidence headingLevel={2} title="母集団の取り違え" turns={turns}/>);
  const id=/aria-labelledby="([^"]+)"/.exec(html)![1];
  expect(html).toContain(`<h2 class="conv-evidence-title" id="${id}">母集団の取り違え</h2>`);
  expect(renderToStaticMarkup(<ConversationEvidence title="母集団の取り違え" turns={turns}/>)).toContain('<h3 class="conv-evidence-title"');
 });
 it('shows source, record date and the quiet editorial annotation only when supplied',()=>{
  const html=renderToStaticMarkup(<ConversationEvidence recordedAt="2026-09-04" source={{label:'docs/POSTMORTEM_2026-09-04_tp_precursor.md'}} title="母集団の取り違え" turns={turns} annotation={{question:'この時点で何が間違っていた？',answer:<p>母集団が変わっていた。</p>}}/>);
  expect(html).toContain('<time dateTime="2026-09-04">2026-09-04</time>');
  expect(html).toContain('docs/POSTMORTEM_2026-09-04_tp_precursor.md');
  expect(html).toContain('RESEARCH NOTE');
  expect(html).toContain('この時点で何が間違っていた？');
  expect(html).not.toContain('role="alert"');
  const bare=renderToStaticMarkup(<ConversationEvidence title="母集団の取り違え" turns={turns}/>);
  expect(bare).not.toContain('conv-note');
  expect(bare).not.toContain('conv-evidence-meta');
 });
 it('renders nothing without turns',()=>{
  expect(renderToStaticMarkup(<ConversationEvidence title="空" turns={[]}/>)).toBe('');
 });
 it('keeps the article ledger readable and overflow-safe at narrow widths',()=>{
  expect(componentCss).toContain('.conv-evidence .conv-turn-body{min-width:0;font-size:1rem;line-height:1.8}');
  expect(componentCss).toContain('.conv-evidence .conv-turn--owner{background:#f4f8f7;border-left-color:#6f8f89}');
  expect(componentCss).toContain('.conv-evidence .conv-turn--fable{background:var(--panel);border-left-color:#c2652f}');
  expect(componentCss).toContain('word-break:break-word');
  expect(componentCss).toContain('@media(max-width:400px)');
  expect(componentCss).not.toMatch(/gradient|box-shadow|transition|animation/);
 });
});
