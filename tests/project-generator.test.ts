import { describe, expect, it } from 'vitest';
import { decodeProjectState, encodeProjectState, generateProjectPlan, interpretProjectIdea, type ProjectBrief } from '@/lib/project';

const brief=(patch:Partial<ProjectBrief>={}):ProjectBrief=>({idea:'小さなゲームを作る',genre:'other',dimension:'unknown',platform:'unknown',engine:'unknown',budget:'unknown',experience:'unknown',team:'unknown',commercialIntent:'unknown',capabilities:['coding'],locale:'unknown',...patch});

describe('deterministic project interpreter',()=>{
  it('extracts only facts explicitly present in realistic Japanese text',()=>{
    const result=interpretProjectIdea('2Dのモンスター収集ゲーム。iPhone向け。一人開発。月1万円以内。');
    expect(result.fields).toEqual(expect.arrayContaining([
      expect.objectContaining({field:'dimension',value:'2d',provenance:'explicit_text'}),
      expect.objectContaining({field:'genre',value:'monster-collection'}),
      expect.objectContaining({field:'platform',value:'mobile'}),
      expect.objectContaining({field:'team',value:'solo'}),
      expect.objectContaining({field:'budget',value:'low'}),
    ]));
    expect(result.unresolved).toContain('engine');
    expect(result.fields.some(field=>field.field==='commercialIntent')).toBe(false);
  });

  it('keeps conflicting statements unresolved instead of silently choosing one',()=>{
    const result=interpretProjectIdea('UnityかGodotで2Dまたは3Dのゲーム');
    expect(result.conflicts.join(' ')).toContain('engine');
    expect(result.conflicts.join(' ')).toContain('dimension');
    expect(result.fields.find(field=>field.field==='engine')).toBeUndefined();
  });

  it('recognizes production capabilities without inferring absent ones',()=>{
    const result=interpretProjectIdea('ビジュアルノベル。日本語と英語。音声あり。翻訳したい。');
    const capabilities=result.fields.find(field=>field.field==='capabilities')?.value;
    expect(capabilities).toEqual(expect.arrayContaining(['voice','localization']));
    expect(capabilities).not.toContain('assets-3d');
    expect(result.fields).toContainEqual(expect.objectContaining({field:'locale',value:'ja-en'}));
  });

  it('does not turn explicit exclusions into requirements',()=>{
    const result=interpretProjectIdea('音声なし、3D不要の2Dブラウザゲーム');
    const capabilities=result.fields.find(field=>field.field==='capabilities')?.value??[];
    expect(capabilities).not.toContain('voice');
    expect(capabilities).not.toContain('assets-3d');
    expect(result.fields).toContainEqual(expect.objectContaining({field:'dimension',value:'2d'}));
    expect(result.conflicts.join(' ')).not.toContain('dimension');
  });

  it.each(['音声と3Dなし','ボイスはいらない。3Dは使わず2D','音声を生成しない2Dゲーム'])('handles coordinated and natural negative requirements: %s',idea=>{
    const capabilities=interpretProjectIdea(idea).fields.find(field=>field.field==='capabilities')?.value??[];
    expect(capabilities).not.toContain('voice'); expect(capabilities).not.toContain('assets-3d');
  });

  it('scopes a negative to the intended requirement',()=>{
    const threeD=interpretProjectIdea('3Dで音声なし');
    expect(threeD.fields).toContainEqual(expect.objectContaining({field:'dimension',value:'3d'}));
    expect(threeD.fields.find(field=>field.field==='capabilities')?.value??[]).not.toContain('voice');
    const voice=interpretProjectIdea('音声あり3Dなし');
    expect(voice.fields.find(field=>field.field==='capabilities')?.value).toContain('voice');
    expect(voice.fields.find(field=>field.field==='dimension')).toBeUndefined();
  });

  it.each(['販売するゲーム','Steamで発売予定'])('recognizes common explicit commercial wording: %s',idea=>expect(interpretProjectIdea(idea).fields).toContainEqual(expect.objectContaining({field:'commercialIntent',value:'commercial'})));

  it('caps hostile or accidental long input and remains deterministic',()=>{
    const text=`Steam向けホラー ${'長'.repeat(2000)}`;
    expect(interpretProjectIdea(text)).toEqual(interpretProjectIdea(text));
    expect(interpretProjectIdea(text).idea).toHaveLength(1200);
  });
});

describe('project plan generation',()=>{
  it('creates an actionable, game-specific monster collection vertical slice',()=>{
    const plan=generateProjectPlan(brief({idea:'スマホ向けモンスター収集',genre:'monster-collection',dimension:'2d',platform:'mobile',engine:'unity',team:'solo',budget:'low',experience:'beginner',commercialIntent:'commercial',capabilities:['coding','art-2d','animation']}));
    expect(plan.today[0]).toContain('コアループ');
    expect(plan.verticalSlice.map(item=>item.title).join(' ')).toContain('モンスター3体');
    expect(plan.verticalSlice.every(item=>item.why&&item.outOfScope.length&&item.doneWhen.length)).toBe(true);
    expect(plan.assetChecklist).toContain('キャラクター／モンスター参照シート');
    expect(plan.assetChecklist).not.toContain('3Dモデル');
    expect(plan.repositoryStructure).toContain('Assets/');
    expect(plan.risks.map(risk=>risk.id)).toContain('mobile-performance');
  });

  it('makes visual novel artifacts and localization phase materially different',()=>{
    const novel=generateProjectPlan(brief({idea:'日英の音声付きビジュアルノベル',genre:'visual-novel',dimension:'2d',platform:'desktop',engine:'godot',locale:'ja-en',capabilities:['coding','art-2d','voice','localization']}));
    const action=generateProjectPlan(brief({idea:'3Dアクション',genre:'action',dimension:'3d',platform:'desktop',engine:'unreal',capabilities:['coding','assets-3d','animation']}));
    expect(novel.verticalSlice.map(item=>item.title).join(' ')).toContain('選択肢');
    expect(novel.phases.map(phase=>phase.id)).toContain('localization');
    expect(novel.phases.findIndex(phase=>phase.id==='localization')).toBeLessThan(novel.phases.findIndex(phase=>phase.id==='integration'));
    expect(novel.phases.find(phase=>phase.id==='integration')?.dependencies).toContain('localization');
    expect(novel.assetChecklist).toContain('台詞ID・話者同意・音声ファイル');
    expect(action.assetChecklist).toContain('3Dモデル');
    expect(action.assetChecklist).not.toContain('台詞ID・話者同意・音声ファイル');
    expect(novel.firstTask.content).not.toEqual(action.firstTask.content);
  });

  it('strictly omits voice and 3D work when neither is requested',()=>{
    const plan=generateProjectPlan(brief({genre:'puzzle',dimension:'2d',platform:'web',engine:'other',capabilities:['coding','art-2d']}));
    expect(plan.phases.map(phase=>phase.id)).not.toContain('voice');
    expect(plan.phases.map(phase=>phase.id)).not.toContain('3d');
    expect(plan.assetChecklist.join(' ')).not.toContain('音声');
    expect(plan.assetChecklist.join(' ')).not.toContain('3D');
  });

  it('keeps unknowns explicit and never fabricates prices or dates',()=>{
    const plan=generateProjectPlan(brief({genre:'unknown'}));
    expect(plan.unresolved).toEqual(expect.arrayContaining(['engine は未確認','budget は未確認','commercialIntent は未確認']));
    expect(plan.cost.note).toContain('合計は算出しません');
    expect(JSON.stringify(plan)).not.toMatch(/\d+日|\d+週間|¥[\d,]+/);
    expect(plan.unresolved).toEqual(expect.arrayContaining(['genre は未確認','dimension は未確認']));
    expect(plan.firstTask.content).toContain('エンジン選定spike');
    expect(plan.today.join(' ')).toContain('比較表');
    expect(plan.today.join(' ')).toContain('decision record');
    expect(plan.today.join(' ')).not.toContain('プレースホルダー');
    expect(plan.today.join(' ')).not.toContain('対象環境で起動');
  });

  it('materially differentiates genre and browser production recipes',()=>{
    const plans=['rpg','horror','action','puzzle'].map(genre=>generateProjectPlan(brief({genre:genre as ProjectBrief['genre'],dimension:'2d',platform:'desktop',engine:'godot'})));
    expect(new Set(plans.map(plan=>plan.prompts[0].content)).size).toBe(4);
    expect(plans[0].verticalSlice.map(item=>item.id)).toContain('quest-data');
    expect(plans[1].verticalSlice.map(item=>item.id)).toContain('horror-beat');
    expect(plans[2].verticalSlice.map(item=>item.id)).toContain('combat-frame');
    expect(plans[3].verticalSlice.map(item=>item.id)).toContain('puzzle-rule');
    expect(generateProjectPlan(brief({platform:'web',engine:'other'})).verticalSlice.map(item=>item.id)).toContain('web-budget');
  });

  it('separates BGM and SFX deliverables when both are requested',()=>{
    const audio=generateProjectPlan(brief({capabilities:['coding','music','sfx']})).phases.find(phase=>phase.id==='music-sfx')!;
    expect(audio.deliverables).toHaveLength(2); expect(audio.deliverables[0]).toContain('BGM'); expect(audio.deliverables[1]).toContain('SFX');
  });

  it('exposes auditable stage tools without affiliate metadata',()=>{
    const plan=generateProjectPlan(brief({genre:'visual-novel',dimension:'2d',platform:'desktop',engine:'unity',budget:'low',experience:'intermediate',team:'solo',commercialIntent:'commercial',capabilities:['coding','voice']}));
    const voice=plan.phases.find(phase=>phase.id==='voice')?.tools.find(tool=>tool.role==='primary');
    expect(voice).toEqual(expect.objectContaining({serviceSlug:'elevenlabs',commercialUse:'conditional',lastVerified:expect.any(String)}));
    expect(voice?.inputRefs).toEqual(expect.arrayContaining(['必要工程: 音声','利用目的: commercial']));
    expect(voice?.evidence.length).toBeGreaterThan(0);
    expect(voice?.unknowns.join(' ')).toContain('条件付き');
    expect(voice?.manualChecks.join(' ')).toContain('公式規約');
    expect(voice?.sources.map(source=>source.type)).toEqual(expect.arrayContaining(['official','terms']));
    expect(JSON.stringify(voice)).not.toContain('affiliate');
  });

  it('is deterministic and affiliate metadata cannot change generated project work',()=>{
    const input=brief({genre:'horror',capabilities:['coding','music','sfx']});
    expect(generateProjectPlan(input)).toEqual(generateProjectPlan(input));
    expect(JSON.stringify(generateProjectPlan(input))).not.toContain('affiliateUrl');
  });
});

describe('versioned share state',()=>{
  it('shares Unicode structured state without leaking the raw idea',()=>{
    const input=brief({idea:'日本語のパズル 🧩',genre:'puzzle',platform:'web'});
    const encoded=encodeProjectState(input); const decoded=decodeProjectState(encoded)!;
    expect(encoded).not.toContain(encodeURIComponent(input.idea)); expect(decodeURIComponent(encoded)).not.toContain(input.idea);
    expect(decoded).toEqual({...input,idea:'共有されたプロジェクト（元の自由文はプライバシー保護のため含まれません）'});
  });
  it('never encodes even the maximum supported Japanese idea',()=>{
    const input=brief({idea:'長'.repeat(1200)});
    expect(decodeURIComponent(encodeProjectState(input))).not.toContain(input.idea);
  });
  it.each(['v=2&p=%7B%7D','v=1&p=not-json',`v=1&p=${'x'.repeat(21000)}`])('fails closed for malformed state: %s',state=>{
    expect(decodeProjectState(state)).toBeNull();
  });
});
