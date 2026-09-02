import { describe, expect, it } from 'vitest';
import { generateProjectPlan } from '@/lib/project/generator';
import { beginnerWorkflowSteps } from '@/lib/project/beginner-workflow';
import type { ProjectBrief } from '@/lib/project/types';

const plan = (patch: Partial<ProjectBrief> = {}) => generateProjectPlan({
  idea: 'ゲーム制作は初めてです。ブラウザで小さなゲームを作りたいです。',
  genre: 'other', dimension: '2d', platform: 'web', engine: 'unknown', budget: 'unknown',
  experience: 'beginner', team: 'solo', commercialIntent: 'personal', capabilities: ['coding'],
  locale: 'ja', details: [], ...patch,
});

describe('beginner prototype workflow', () => {
  it('offers an end-to-end executable browser path without an engine or Git prerequisite', () => {
    const steps = beginnerWorkflowSteps(plan());
    expect(steps.slice(0, 3).map(step => step.id)).toEqual(['core-loop', 'ui-prototype', 'save']);
    expect(steps.map(step => step.id)).toEqual(['core-loop', 'ui-prototype', 'save', 'refine', 'qa', 'release']);
    const instructions = steps.flatMap(step => step.usageInstructions).join('\n');
    expect(instructions).not.toMatch(/Gitを初期化|エンジン|terminal|spike|README|deploy|build/);
    expect(instructions).toContain('ゲームのコード');
    expect(instructions).toContain('保存したゲームを開く');
    expect(steps.at(-1)?.usageInstructions.join(' ')).toContain('ダウンロードだけでは公開URLは作られない');
  });

  it('preserves the selected code tool and gives action, battle and novel different success criteria', () => {
    const source = plan();
    const action = beginnerWorkflowSteps(source)[0];
    const battle = beginnerWorkflowSteps(plan({ genre: 'monster-collection' }))[0];
    const novel = beginnerWorkflowSteps(plan({ genre: 'visual-novel' }))[0];
    expect(action.tools).toEqual(source.phases.find(phase => phase.id === 'code')?.tools);
    expect(action.prompt).toContain('上下左右ボタンのタップ');
    expect(action.doneWhen.join(' ')).toContain('ゴール');
    expect(battle.prompt).toContain('味方モンスター1体と敵1体');
    expect(battle.prompt).toContain('収集・育成・図鑑は次の試作');
    expect(battle.doneWhen.join(' ')).toContain('勝ちか負け');
    expect(novel.prompt).toContain('話者名、日本語の短い台詞3つ');
    expect(novel.prompt).toContain('未指定の選択肢や分岐は追加しない');
    expect(novel.doneWhen.join(' ')).not.toMatch(/勝敗|ゴール|攻撃/);
  });

  it('preserves confirmed context in every AI request and separates manual actions', () => {
    const steps = beginnerWorkflowSteps(plan({ details: [{ id: 'detail-setting-1', kind: 'setting', text: '空に浮かぶ島', provenance: 'confirmed' }] }));
    for (const step of steps.filter(step => step.prompt)) expect(step.prompt).toContain('空に浮かぶ島');
    for (const id of ['save', 'qa', 'release']) {
      const step = steps.find(item => item.id === id)!;
      expect(step.prompt).toBe('');
      expect(step.tools).toEqual([]);
      expect(step.usageInstructions.length).toBeGreaterThan(2);
    }
  });

  it('backs up HTML before replacement and does not promise storage inside an opaque iframe', () => {
    const steps = beginnerWorkflowSteps(plan());
    for (const id of ['ui-prototype', 'refine']) {
      const instructions = steps.find(item => item.id === id)!.usageInstructions;
      expect(instructions[0]).toContain('index.htmlを保存');
      expect(instructions[2]).toContain('置き換え');
    }
    const save = steps.find(step => step.id === 'save')!;
    expect(save.why).toContain('途中のプレイ状況を保存する機能とは別');
    expect(steps.map(step => step.prompt).join(' ')).not.toContain('localStorage');
  });

  it('adds only requested assets, retaining the original recommended tool and a concrete import step', () => {
    const source = plan({ genre: 'visual-novel', capabilities: ['coding', 'art-2d', 'voice'] });
    const steps = beginnerWorkflowSteps(source);
    const image = steps.find(step => step.id === 'create-image')!;
    const voice = steps.find(step => step.id === 'create-voice')!;
    expect(image.tools).toEqual(source.phases.find(phase => phase.id === 'visuals')?.tools);
    expect(voice.tools).toEqual(source.phases.find(phase => phase.id === 'voice')?.tools);
    expect(voice.prompt).toBe('');
    expect(voice.outcome).toContain('voice.wav');
    expect(voice.usageInstructions.join(' ')).toContain('その台詞だけ入力');
    expect(voice.usageInstructions.join(' ')).not.toMatch(/PNG|画像は/);
    expect(image.usageInstructions.join(' ')).not.toMatch(/voice\.(mp3|wav)|音声は/);
    expect(image.outcome).toContain('background.png');
    expect(steps.find(step => step.id === 'integrate-image')?.prompt).toContain('FileReader');
    expect(steps.find(step => step.id === 'integrate-voice')?.prompt).toContain('ボタンを押した時だけ再生');
    expect(steps.find(step => step.id === 'integrate-voice')?.usageInstructions.join(' ')).toContain('voice.wav');
    expect(beginnerWorkflowSteps(plan()).some(step => step.id.includes('image') || step.id.includes('voice'))).toBe(false);
  });

  it.each(['visual-novel', 'action'] as const)('keeps %s users without images moving when no image generator is selected', genre => {
    const source = plan({ genre, capabilities: ['coding', 'art-2d'] });
    source.phases = source.phases.map(phase => phase.id === 'visuals' ? { ...phase, tools: [] } : phase);
    const steps = beginnerWorkflowSteps(source);
    const fallback = steps.find(step => step.id === 'placeholder-image')!;
    expect(fallback.tools).toEqual(source.phases.find(phase => phase.id === 'code')?.tools);
    expect(fallback.why).toContain('完成イラストは後で差し替え');
    expect(fallback.prompt).toContain('画像ファイルや外部サービスを要求しない');
    expect(fallback.usageInstructions.join(' ')).toContain('新しい画像ファイルは不要');
    expect(steps.some(step => step.id === 'create-image' || step.id === 'integrate-image')).toBe(false);
    if (genre === 'action') expect(fallback.doneWhen.join(' ')).not.toContain('台詞');
  });
});
