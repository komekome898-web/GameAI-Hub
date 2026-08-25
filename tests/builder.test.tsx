import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BuilderClient } from '@/components/BuilderClient';
import { stackTemplates, getStackTemplatePreset } from '@/data/stack-templates';
import { decodeProjectInput } from '@/lib/recommendation/query';
import { recommendProject } from '@/lib/recommendation';

afterEach(()=>{ cleanup(); history.replaceState(null,'','/builder'); });

describe('builder',()=>{
  it('keeps answers when moving safely backward',()=>{
    render(<BuilderClient/>);
    fireEvent.click(screen.getByLabelText('3Dゲーム'));
    fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    fireEvent.click(screen.getByRole('button',{name:'戻る'}));
    expect((screen.getByLabelText('3Dゲーム') as HTMLInputElement).checked).toBe(true);
  });

  it('announces and focuses each step-specific heading',()=>{
    render(<BuilderClient/>);
    expect(screen.getByRole('heading',{name:'ゲームの基本条件を選ぶ'})).toBe(document.activeElement);
    fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    expect(screen.getByRole('heading',{name:'制作スタイルを選ぶ'})).toBe(document.activeElement);
    expect(screen.getByRole('status').textContent).toContain('ステップ2 / 4');
    expect(screen.getByRole('group',{name:/ゲームエンジン/})).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Godot'));
    for(let i=0;i<2;i++) fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    fireEvent.click(screen.getByRole('button',{name:'構成を作る'}));
    expect(location.search).toContain('engine=godot');
    expect(screen.getByText('Godot')).toBeTruthy();
  });

  it('completes four progressive steps into an actionable production map',()=>{
    render(<BuilderClient/>);
    for(let i=0;i<3;i++) fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    fireEvent.click(screen.getByRole('button',{name:'構成を作る'}));
    expect(screen.getByRole('heading',{name:/あなた向け/})).toBeTruthy();
    expect(screen.getByRole('heading',{name:'制作工程マップ'})).toBeTruthy();
    expect(screen.getAllByText('次の行動').length).toBeGreaterThan(0);
    expect(location.search).toContain('result=1');
  });

  it('emits builder completion only on completion',()=>{
    const listener=vi.fn(); window.addEventListener('gameai:event',listener);
    render(<BuilderClient/>);
    for(let i=0;i<3;i++) fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    const names=()=>listener.mock.calls.map(call=>(call[0] as CustomEvent).detail.name);
    expect(names()).not.toContain('builder_complete');
    fireEvent.click(screen.getByRole('button',{name:'構成を作る'}));
    expect(names()).toContain('builder_complete');
    window.removeEventListener('gameai:event',listener);
  });

  it('hydrates every stack template and lets explicit query values win',()=>{
    expect(stackTemplates).toHaveLength(8);
    for(const template of stackTemplates) {
      const preset=getStackTemplatePreset(template.slug)!;
      expect(preset).toBeTruthy();
      expect(decodeProjectInput(encodeURIComponent(''),preset)).toEqual(preset);
      expect(recommendProject(preset).stages).toHaveLength(12);
    }
    const inherited=getStackTemplatePreset('3d-indie');
    expect(decodeProjectInput('budget=free&voiceRequirement=none',inherited).gameType).toBe('3d');
    expect(decodeProjectInput('budget=free&voiceRequirement=none',inherited).budget).toBe('free');
  });

  it('hands a recommended stage pair to the compare ids contract',()=>{
    render(<BuilderClient/>);
    for(let i=0;i<3;i++) fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    fireEvent.click(screen.getByRole('button',{name:'構成を作る'}));
    const pair=screen.getAllByRole('link',{name:/2候補を比較/})[0];
    expect(pair.getAttribute('href')).toMatch(/^\/compare\?ids=[a-z0-9-]+,[a-z0-9-]+&stage=[a-z0-9-]+$/);
    expect(pair.getAttribute('href')).not.toContain('services=');
  });

  it('labels conditional commercial-use primaries and links directly to their official terms',()=>{
    render(<BuilderClient/>);
    for(let i=0;i<3;i++) fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    fireEvent.click(screen.getByLabelText('販売・商用'));
    fireEvent.click(screen.getByRole('button',{name:'構成を作る'}));
    expect(screen.getAllByText('商用利用: 条件付き').length).toBeGreaterThan(0);
    const termsLinks=screen.getAllByRole('link',{name:/公式規約で対象プランと生成時点の条件を確認/});
    expect(termsLinks.length).toBeGreaterThan(0);
    expect(termsLinks.every(link=>link.getAttribute('href')?.startsWith('https://'))).toBe(true);
    expect(screen.getAllByText(/無条件の商用利用可ではありません/).length).toBeGreaterThan(0);
  });

  it('shows conditional-use warnings, terms, and manual checks on an alternative',()=>{
    render(<BuilderClient/>);
    for(let i=0;i<3;i++) fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    fireEvent.click(screen.getByLabelText('販売・商用'));
    fireEvent.click(screen.getByRole('button',{name:'構成を作る'}));
    const alternativeLink=screen.getAllByRole('link',{name:/Cursor/})[0];
    const alternative=alternativeLink.closest('.alternative');
    expect(alternative).toBeTruthy();
    expect(alternative?.textContent).toContain('商用利用: 条件付き');
    expect(alternative?.textContent).toContain('無条件の商用利用可ではありません');
    expect(alternative?.textContent).toContain('商用利用の確認事項:');
    expect(alternative?.textContent).toContain('対象プラン');
    expect(alternative?.textContent).toContain('生成時点');
    const terms=alternative?.querySelector<HTMLAnchorElement>('a[href*="cursor.com/terms"]');
    expect(terms?.textContent).toContain('公式規約');
  });

  it('shows assumptions, requirement groups and candidate verification before action',()=>{
    render(<BuilderClient/>);
    for(let i=0;i<3;i++) fireEvent.click(screen.getByRole('button',{name:'次へ'}));
    fireEvent.click(screen.getByRole('button',{name:'構成を作る'}));
    expect(screen.getByRole('heading',{name:'回答と計画の前提'})).toBeTruthy();
    expect(screen.getByText('必須工程')).toBeTruthy();
    expect(screen.getAllByText(/最終確認日:/).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link',{name:/公式/}).length).toBeGreaterThan(0);
  });
});
