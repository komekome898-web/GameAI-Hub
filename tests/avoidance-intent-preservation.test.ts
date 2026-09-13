import { describe, expect, it } from 'vitest';
import { beginnerWorkflowSteps } from '@/lib/project/beginner-workflow';
import { generateProjectPlan, interpretProjectIdea, type ProjectBrief } from '@/lib/project';

const buildBrief = (idea: string): ProjectBrief => {
  const interpreted = interpretProjectIdea(idea);
  const scalar = Object.fromEntries(interpreted.fields.filter(field => field.field !== 'capabilities').map(field => [field.field, field.value]));
  const capabilities = interpreted.fields.find(field => field.field === 'capabilities')?.value as ProjectBrief['capabilities'] | undefined;
  return {
    idea,
    genre: 'other',
    dimension: '2d',
    platform: 'web',
    engine: 'undecided',
    budget: 'low',
    experience: 'beginner',
    team: 'solo',
    commercialIntent: 'undecided',
    locale: 'ja',
    capabilities: capabilities ?? ['coding'],
    ...scalar,
    details: interpreted.detailCandidates.map(detail => ({ ...detail, provenance: 'confirmed' as const })),
  };
};

describe('P1-INTENT-001 avoidance intent preservation', () => {
  it('keeps the explicit spaceship-and-asteroid avoidance loop through Project prompts', () => {
    const idea = '宇宙船を操作して隕石を避けるゲーム';
    const interpreted = interpretProjectIdea(idea);
    expect(interpreted.detailCandidates).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'player-role', text: '宇宙船' }),
      expect.objectContaining({ kind: 'entity', text: '隕石' }),
      expect.objectContaining({ kind: 'core-mechanic', text: '隕石を避ける' }),
      expect.objectContaining({ kind: 'core-loop', text: '宇宙船を操作 → 隕石を避ける' }),
    ]));

    const plan = generateProjectPlan(buildBrief(idea));
    const steps = beginnerWorkflowSteps(plan);
    const generated = [
      plan.verticalSlice[0].title,
      plan.masterBrief.content,
      plan.firstTask.content,
      ...plan.prompts.map(prompt => prompt.content),
      ...steps.flatMap(step => [step.title, step.prompt, ...step.doneWhen]),
    ].join('\n');

    expect(generated).toMatch(/宇宙船/s);
    expect(generated).toMatch(/隕石.*(?:避ける|回避)/s);
    expect(generated).not.toContain('承認済みのゲーム固有要素なし');
    expect(generated).not.toMatch(/射撃|撃つ|スコア|得点|ゴールへ到達/);
  });
});
