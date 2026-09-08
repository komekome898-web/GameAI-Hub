import { describe, expect, it, vi } from 'vitest';
import { beginnerWorkflowSteps } from '@/lib/project/beginner-workflow';
import { generateProjectPlan, interpretProjectIdea, ProjectBriefSchema, type ProjectBrief } from '@/lib/project';
import { deterministicInterpretation, interpretWithFallback, type ProjectInterpreterProvider } from '@/lib/project/providers';

const base = (idea: string, patch: Partial<ProjectBrief> = {}): ProjectBrief => {
  const interpreted = interpretProjectIdea(idea);
  const scalar = Object.fromEntries(interpreted.fields.filter(field => field.field !== 'capabilities').map(field => [field.field, field.value]));
  const capabilities = interpreted.fields.find(field => field.field === 'capabilities')?.value as ProjectBrief['capabilities'] | undefined;
  return {
    idea, genre: 'other', dimension: '2d', platform: 'web', engine: 'undecided', budget: 'low',
    experience: 'beginner', team: 'solo', commercialIntent: 'undecided', locale: 'ja', capabilities: capabilities ?? ['coding'],
    ...scalar, details: interpreted.detailCandidates.map(detail => ({ ...detail, provenance: 'confirmed' as const })), ...patch,
  };
};

const surfaces = (brief: ProjectBrief) => {
  const plan = generateProjectPlan(brief);
  const steps = beginnerWorkflowSteps(plan);
  return {
    plan,
    steps,
    text: [plan.verticalSlice[0].title, plan.masterBrief.content, plan.firstTask.content,
      ...plan.prompts.map(prompt => prompt.content),
      ...steps.flatMap(step => [step.title, step.outcome, step.why, step.prompt, ...step.doneWhen, ...step.usageInstructions])].join('\n'),
  };
};

describe('Issue 55 intent preservation contracts', () => {
  it('keeps cat tap-to-score across summary, first/next tasks, prompts, criteria, and recovery copy', () => {
    const result = surfaces(base('猫をタップすると得点が増えるゲーム'));
    expect(result.plan.brief.details).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'entity', text: '猫' }),
      expect.objectContaining({ kind: 'core-mechanic', text: expect.stringMatching(/タップ.*得点/) }),
      expect.objectContaining({ kind: 'core-loop', text: expect.stringMatching(/猫.*タップ.*得点/) }),
    ]));
    for (const value of [result.plan.verticalSlice[0].title, result.steps[0].title, result.steps[0].prompt, result.steps[0].doneWhen.join(' '), result.steps[1].prompt, result.steps.find(step => step.id === 'qa')!.usageInstructions.join(' ')]) {
      expect(value).toMatch(/猫.*(?:タップ|クリック).*得点/s);
      expect(value).not.toMatch(/移動してゴール|プレイヤーとゴール|ゴールへ触れ|上下左右|素材を集め/);
    }
  });

  it('keeps bilingual novel dialogue without inventing romance', () => {
    const result = surfaces(base('日本語と英語を切り替えられる短いノベルゲーム'));
    expect(result.plan.brief.genre).toBe('visual-novel');
    expect(result.text).toMatch(/ノベル/);
    expect(result.steps[0].prompt).toMatch(/日本語.*英語.*台詞.*切り替/s);
    expect(result.steps[0].doneWhen.join(' ')).toMatch(/日本語.*英語.*切り替/);
    expect(result.text).not.toMatch(/恋愛|romance/i);
  });

  it('keeps one-on-one battle and excludes unrelated platformer or gathering mechanics', () => {
    const result = surfaces(base('モンスター同士が1対1で戦うゲーム'));
    expect(result.steps[0].prompt).toMatch(/モンスター.*1対1.*攻撃.*HP.*勝利/s);
    expect(result.text).not.toMatch(/移動してゴール|プレイヤーとゴール|上下左右|採集|素材を集め/);
  });

  it('retains the existing movement-to-goal fixture when that mechanic is explicit', () => {
    const result = surfaces(base('迷路を移動してゴールするゲーム'));
    expect(result.steps[0].title).toContain('動かしてゴール');
    expect(result.steps[0].prompt).toMatch(/移動.*ゴール.*クリア/s);
    expect(result.steps[0].doneWhen.join(' ')).toContain('ゴール');
  });

  it('does not turn an unknown mechanic into movement-to-goal', () => {
    const result = surfaces(base('短いゲームを作りたい'));
    expect(result.text).not.toMatch(/移動してゴール|プレイヤーとゴール|上下左右/);
    expect(result.steps[0].prompt).toContain('未確認の操作、目的、ジャンルは追加しない');
  });

  it('keeps the confirmed contract through private local persistence and reopening', () => {
    const original = base('猫をタップすると得点が増えるゲーム');
    const reopened = ProjectBriefSchema.parse(JSON.parse(JSON.stringify(original)));
    expect(surfaces(reopened).steps.map(step => [step.id, step.title, step.prompt, step.doneWhen]))
      .toEqual(surfaces(original).steps.map(step => [step.id, step.title, step.prompt, step.doneWhen]));
  });
});

describe('provider and fallback preserve the same explicit mechanic', () => {
  const idea = '猫をタップすると得点が増えるゲーム';
  const provider = (work: ProjectInterpreterProvider['interpret'], ready = true): ProjectInterpreterProvider => ({ providerName: 'Test AI', isReady: () => ready, interpret: work });
  const remote = { fields: [], details: [], unresolved: [], conflicts: [] };

  it('merges deterministic explicit facts into a successful provider result', async () => {
    const result = await interpretWithFallback(idea, { provider: provider(async () => remote) });
    expect(result.status.mode).toBe('provider');
    expect(result.interpretation.detailCandidates).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'core-loop', text: expect.stringMatching(/猫.*タップ.*得点/) })]));
  });

  it.each([
    ['unavailable', provider(vi.fn(), false), 'not_configured'],
    ['error', provider(async () => { throw new Error('upstream'); }), 'provider_error'],
    ['timeout', provider(async () => new Promise(() => {})), 'timeout'],
  ] as const)('keeps tap-to-score on %s fallback', async (_name, candidate, reason) => {
    const result = await interpretWithFallback(idea, { provider: candidate, timeoutMs: 5 });
    expect(result.status.fallbackReason).toBe(reason);
    expect(result.interpretation.detailCandidates).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'core-loop', text: expect.stringMatching(/猫.*タップ.*得点/) })]));
  });

  it('keeps tap-to-score when the route selects a rate-limit fallback', () => {
    const result = deterministicInterpretation(idea, 'rate_limited');
    expect(result.status.fallbackReason).toBe('rate_limited');
    expect(result.interpretation.detailCandidates).toEqual(expect.arrayContaining([expect.objectContaining({ kind: 'core-loop', text: expect.stringMatching(/猫.*タップ.*得点/) })]));
  });
});
