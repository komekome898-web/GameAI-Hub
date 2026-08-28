import { recommendationRules } from '@/data/recommendation-rules';
import { productionStageIds, ProjectInputSchema, type ProductionStageId, type ProjectInput, type RecommendationRule } from '@/lib/domain';
import type { Service } from '@/lib/schema';
import { getServices } from '@/lib/services';
import type { RecommendationResult, StageRequirement, ToolRecommendation } from './types';

const baselineRequired = new Set<ProductionStageId>(['concept','prototype','code','integration','testing','publishing']);

function requirementFor(stage: ProductionStageId, input: ProjectInput): StageRequirement {
  if (stage === 'voice') return input.voiceRequirement === 'none' ? 'excluded' : input.voiceRequirement === 'required' ? 'required' : 'optional';
  if (stage === 'music-sfx') return input.musicRequirement === 'none' ? 'excluded' : input.musicRequirement === 'required' ? 'required' : 'optional';
  if (stage === '3d') return input.gameType === '3d' || input.assetRequirements.includes('3d-assets') ? 'required' : 'excluded';
  if (stage === 'animation') return input.assetRequirements.includes('animation') ? 'required' : 'optional';
  if (stage === 'visuals') return input.assetRequirements.some(item => item === '2d-assets' || item === 'concept-art') ? 'required' : 'optional';
  if (stage === 'npc-dialogue') return input.genre === 'rpg' && input.integrationImportance === 'high' ? 'optional' : 'excluded';
  return baselineRequired.has(stage) ? 'required' : 'optional';
}

function matches(rule: RecommendationRule, input: ProjectInput): boolean {
  return rule.conditions.every(({ field, operator, value }) => {
    const actual = input[field];
    if (operator === 'includes') return Array.isArray(actual) && actual.includes(value as never);
    return operator === 'equals' ? actual === value : actual !== value;
  });
}

type Eligibility = { eligible: boolean; checks: string[] };
function eligibility(service: Service, input: ProjectInput): Eligibility {
  const checks: string[] = [];
  if (input.budget === 'free' && service.freePlan !== 'yes') checks.push(`無料限定条件を満たすと確認できません（無料プラン: ${service.freePlan === 'no' ? 'なし' : '不明'}）`);
  if (input.integrationImportance === 'high' && service.api !== 'yes') checks.push(`API重視条件を満たすと確認できません（API: ${service.api === 'no' ? 'なし' : '不明'}）`);
  if (input.commercialIntent === 'commercial' && (service.commercialUse === 'no' || service.commercialUse === 'unknown')) {
    checks.push(`商用利用を確定できません（${service.commercialUse === 'no' ? '不可' : '不明'}）。契約プランと最新規約を確認してください`);
  }
  return { eligible: checks.length === 0, checks };
}

const stageCapabilities: Record<ProductionStageId, readonly Service['capabilities'][number]['id'][]> = {
  concept:['general-llm'], prototype:['prototype','no-code'], code:['coding'], visuals:['2d-art','concept-art','character-consistency'],
  animation:['animation','rigging'], '3d':['3d-modeling','texture-material','rigging'], voice:['voice'], 'music-sfx':['music','sfx'],
  'npc-dialogue':['npc-dialogue'], integration:[], testing:['testing-qa'], publishing:['trailer-video','marketing-assets'],
};
export const fitRubric = { verifiedCapability:40, conditionalCapability:20, explicitRule:25, engine:10, freePlan:10, api:10, commercial:10, beginnerNoCode:5, primaryMinimum:50, strongMinimum:75 } as const;

type Fit = { score:number; band:'strong'|'good'|'review'; inputEffects:string[]; positiveMatches:string[]; hardExclusions:string[]; warnings:string[] };
function fitFor(service: Service, stage: ProductionStageId, input: ProjectInput, rule?: RecommendationRule): Fit {
  let score=0; const inputEffects:string[]=[]; const positiveMatches:string[]=[]; const warnings:string[]=[];
  const relevant=service.capabilities.filter(capability=>stageCapabilities[stage].includes(capability.id));
  if(relevant.some(item=>item.status==='verified')) { score+=fitRubric.verifiedCapability; positiveMatches.push(`${stage}工程の能力が公式情報で確認済み`); }
  else if(relevant.some(item=>item.status==='conditional')) { score+=fitRubric.conditionalCapability; warnings.push(`${stage}工程の能力は条件付き`); }
  else if(relevant.length) warnings.push(`${stage}工程の能力は未確認`);
  if(rule) { score+=fitRubric.explicitRule; inputEffects.push(...rule.conditions.map(condition=>`${condition.field}: ${condition.value}`)); positiveMatches.push('入力条件に一致する明示ルール'); }
  if(input.engine!=='undecided'&&input.engine!=='other') { const wanted=input.engine==='unity'?'Unity':input.engine==='unreal'?'Unreal Engine':'Godot'; inputEffects.push(`engine: ${input.engine}`); if(service.engines.some(item=>item.toLowerCase()===wanted.toLowerCase())) {score+=10;positiveMatches.push(`${wanted}関連情報あり`);} else warnings.push(`${wanted}連携は未確認`); }
  if(input.budget==='free') { inputEffects.push('budget: free'); if(service.freePlan==='yes'){score+=10;positiveMatches.push('無料プランあり');} }
  if(input.integrationImportance==='high') { inputEffects.push('integrationImportance: high'); if(service.api==='yes'){score+=10;positiveMatches.push('APIあり');} }
  if(input.commercialIntent==='commercial') { inputEffects.push('commercialIntent: commercial'); if(service.commercialUse==='yes'){score+=10;positiveMatches.push('掲載情報では商用利用可');} else if(service.commercialUse==='conditional') warnings.push('商用利用は条件付き'); }
  if(input.experience==='beginner'&&service.category==='no-code-low-code'){score+=5;inputEffects.push('experience: beginner');positiveMatches.push('初心者条件とノーコード用途が一致');}
  const hardExclusions=eligibility(service,input).checks;
  score=Math.min(100,Math.max(0,Math.round(score/5)*5));
  return {score,band:score>=75?'strong':score>=50?'good':'review',inputEffects:[...new Set(inputEffects)],positiveMatches,warnings,hardExclusions};
}

function platformEvidence(service: Service, input: ProjectInput): { evidence?: string; check?: string } {
  const wanted: Record<ProjectInput['platform'], string[]> = { web:['Web'], mobile:['iOS','Android'], desktop:['Windows','macOS','Linux'], 'multi-platform':['Web','Windows','macOS','Linux','iOS','Android'] };
  const found = service.platforms.filter(platform => wanted[input.platform].includes(platform));
  if (found.length) return { evidence:`サービス利用環境: ${found.join('、')}（ゲームの出力先対応を意味しません）` };
  return { check:`公開先は${input.platform}ですが、登録済み利用環境（${service.platforms.join('、')}）からゲームの出力先対応は判断できません` };
}

function engineEvidence(service: Service, input: ProjectInput): { evidence?: string; check?: string } {
  if (input.engine === 'undecided') return { check:'ゲームエンジンが未定です。代表成果物を取り込めるか、エンジン決定後に確認してください' };
  if (input.engine === 'other') return { check:'掲載外のゲームエンジンを使う条件です。対応プラグイン、出力形式、手動取込手順を確認してください' };
  const wanted = input.engine === 'unity' ? 'Unity' : input.engine === 'unreal' ? 'Unreal Engine' : 'Godot';
  if (service.engines.some(engine=>engine.toLowerCase()===wanted.toLowerCase())) return { evidence:`登録済みゲームエンジン: ${wanted}` };
  return { check:`${wanted}との連携は登録情報から確認できません（ゲームエンジン欄: ${service.engines.length ? service.engines.join('、') : '情報なし'}）。非対応とは断定せず、出力形式と公式連携情報を確認してください` };
}

function tool(service: Service, reason: string, input: ProjectInput, constraintChecks: string[] = [], fit=fitFor(service,'concept',input)): ToolRecommendation {
  const evidence = [`登録済み用途: ${service.primaryUses.join('、')}`];
  const unknowns: string[] = [];
  const manualChecks = [...constraintChecks];
  const platform = platformEvidence(service, input);
  if (platform.evidence) evidence.push(platform.evidence);
  if (platform.check) manualChecks.push(platform.check);
  const engine = engineEvidence(service,input);
  if (engine.evidence) evidence.push(engine.evidence);
  if (engine.check) manualChecks.push(engine.check);
  if (service.freePlan === 'yes') evidence.push('無料プラン: あり（上限・対象機能は要確認）');
  else if (input.budget === 'free') unknowns.push(`無料プラン: ${service.freePlan === 'no' ? 'なし' : '確認できていません'}`);
  if (input.commercialIntent === 'commercial' && service.commercialUse === 'yes') evidence.push('商用利用: 掲載情報では可');
  if (input.commercialIntent === 'commercial' && service.commercialUse === 'conditional') {
    unknowns.push('商用利用: 条件付き（無条件の商用利用可ではありません）');
    manualChecks.push('商用利用は条件付きです。公式規約で対象プラン、生成時点の契約・利用条件、用途ごとの許諾範囲を採用前に確認してください');
  }
  if (input.integrationImportance === 'high' && service.api === 'yes') evidence.push('API: あり');
  if (service.verificationStatus !== 'verified') unknowns.push(`情報の検証状態: ${service.verificationStatus}`);
  manualChecks.push(`採用前に公式情報を再確認（掲載確認日: ${service.lastVerified}）`);
  return { service, reason, evidence, limitations:[...service.weaknesses], unknowns, manualChecks, costVisibility:service.pricing, fitScore:fit.hardExclusions.length?0:fit.score, fitBand:fit.hardExclusions.length?'review':fit.band, inputEffects:fit.inputEffects, positiveMatches:fit.positiveMatches, hardExclusions:fit.hardExclusions, warnings:fit.warnings };
}

const fallback: Record<ProductionStageId,string> = {
  concept:'企画要件と完成条件を人が文書化してください。', prototype:'ゲームエンジンで最小の遊べる試作を人が作ってください。', code:'条件を満たす実装支援を確定できません。手動で実装方法を選んでください。', visuals:'必要素材を洗い出し、人制作または別候補を調査してください。', animation:'リグ・動き・遷移を人が設計して検品してください。', '3d':'条件を満たす3D制作候補を確定できません。モデリング方法を別途選定してください。', voice:'条件を満たす音声候補を確定できません。収録・生成方法と権利を確認してください。', 'music-sfx':'条件を満たす音楽候補を確定できません。制作方法と利用権を確認してください。', 'npc-dialogue':'会話設計と実行時の安全性を人が設計してください。', integration:'各成果物をゲーム本体へ手動で統合してください。', testing:'実機、品質、費用、権利を人が検証してください。', publishing:'配布先要件と全素材のライセンスを公開前に確認してください。'
};

export function getStagePlan(stage: ProductionStageId, input: ProjectInput) {
  const target = input.platform === 'desktop' ? 'PC / Steam候補' : input.platform === 'mobile' ? 'モバイル' : input.platform === 'web' ? 'Web' : '複数プラットフォーム';
  const genre = input.genre === 'other' ? '選択したゲーム' : input.genre;
  const plans: Record<ProductionStageId,{deliverable:string;acceptanceCriteria:string[];handoff:string;manualTasks:string[];nextAction:string}> = {
    concept:{deliverable:`${genre}の1ページ企画書`,acceptanceCriteria:['コアループを1文で説明できる','完成範囲と対象外を列挙している'],handoff:'プロトタイプで検証する操作と勝敗条件',manualTasks:['対象プレイヤーと完成条件を決める'],nextAction:'コアループ、勝敗条件、作らない機能を1ページに記録します。'},
    prototype:{deliverable:`${input.gameType}形式の最小の遊べるビルド`,acceptanceCriteria:['主要操作を開始から終了まで試せる','面白さの仮説を1つ検証できる'],handoff:'確定した操作仕様と未解決課題',manualTasks:['ゲームエンジンを選び実機で操作する'],nextAction:'主要操作を1つだけ実装し、5分間のプレイで成立性を確認します。'},
    code:{deliverable:'レビュー済みゲームロジック',acceptanceCriteria:['生成コードを人が説明できる','主要ロジックにテストまたは再現手順がある'],handoff:'動作するビルドと既知の不具合一覧',manualTasks:['依存関係・ライセンス・生成差分をレビューする'],nextAction:'1機能分のコードだけを生成・レビューし、ビルドとテストを通します。'},
    visuals:{deliverable:`${input.gameType === '3d' ? 'UI・コンセプト' : '画面・キャラクター・背景'}素材一覧`,acceptanceCriteria:['サイズ・形式・命名が統一されている','入力素材と出力の利用条件を記録している'],handoff:'エンジンへ投入できる書き出し素材',manualTasks:['スタイル一貫性と権利を検品する'],nextAction:'必要素材を画面単位で棚卸しし、代表1点を生成してエンジン表示を確認します。'},
    animation:{deliverable:'ゲーム内で再生できる動き',acceptanceCriteria:['遷移時に破綻しない','対象端末の性能内で再生できる'],handoff:'リグ・クリップ・遷移条件',manualTasks:['タイミングと当たり判定を調整する'],nextAction:'最頻出の1動作を実装し、遷移と当たり判定を実機確認します。'},
    '3d':{deliverable:'エンジン取込済み3Dアセット',acceptanceCriteria:['スケール・形式・ポリゴン量を確認した','トポロジー・UV・リグを用途別に検品した'],handoff:'取込設定付きモデルと修正一覧',manualTasks:['最適化、リグ、衝突判定を人が調整する'],nextAction:'代表モデル1体を生成し、対象エンジンで材質・スケール・性能を検品します。'},
    voice:{deliverable:'権利記録付き音声ファイル',acceptanceCriteria:['話者の同意と利用条件を記録した','音量・発音・ファイル形式を確認した'],handoff:'台詞IDと音声ファイルの対応表',manualTasks:['同意、演技、発音を人が確認する'],nextAction:'代表台詞3行を試作し、同意・商用条件・ゲーム内音量を確認します。'},
    'music-sfx':{deliverable:'ループ確認済みBGMまたは音素材',acceptanceCriteria:['用途と生成時プランを記録した','ループ・音量・場面適合を確認した'],handoff:'場面別の音源と利用条件メモ',manualTasks:['効果音が必要なら別制作手段を選ぶ'],nextAction:'主要場面1つのBGMを試作し、ループと利用条件を確認します。'},
    'npc-dialogue':{deliverable:'安全条件付き会話プロトタイプ',acceptanceCriteria:['禁止応答とフォールバックを定義した','遅延と利用量を実測した'],handoff:'会話仕様、プロンプト、失敗時挙動',manualTasks:['安全性、費用、物語整合性を継続監視する'],nextAction:'代表NPCの会話10往復で、逸脱・遅延・費用を記録します。'},
    integration:{deliverable:`${target}で動く統合ビルド`,acceptanceCriteria:['素材・コード・音の参照切れがない','主要フローを対象環境で完走できる'],handoff:'固定バージョンのビルドと依存一覧',manualTasks:['各AI出力をエンジンへ組み込み競合を解消する'],nextAction:`コード、素材、音を1工程ずつ統合し、${target}で毎回起動確認します。`},
    testing:{deliverable:'不具合・権利・費用の検証記録',acceptanceCriteria:['主要フローの合否を記録した','生成物の権利と継続費を再確認した'],handoff:'修正優先度付きチェックリスト',manualTasks:['実機、回帰、アクセシビリティを人が検証する'],nextAction:`${target}で主要フロー、性能、権利、継続費のチェックリストを実行します。`},
    publishing:{deliverable:'公開判定済みリリース候補',acceptanceCriteria:['配布先要件を満たす','全素材の出典・生成日・プランを記録した'],handoff:'ストア素材、ライセンス台帳、リリースビルド',manualTasks:['審査、年齢区分、プライバシー表示を確認する'],nextAction:`${target}の最新公開要件と全生成物のライセンスを照合してから申請します。`}
  };
  const plan=plans[stage];
  const genreAdditions:Partial<Record<ProjectInput['genre'],Partial<Record<ProductionStageId,{criteria:string[];tasks:string[];handoff?:string}>>>> = {
    'visual-novel':{
      concept:{criteria:['分岐表と到達条件が脚本に対応している'],tasks:['脚本をロックし、分岐IDと翻訳対象文字列を固定する'],handoff:'脚本ロック版、分岐表、ローカライズ文字列ID'},
      testing:{criteria:['全分岐、セーブ復帰、言語切替を通過できる'],tasks:['分岐網羅とローカライズ崩れを手動確認する']},
    },
    'monster-collection':{
      visuals:{criteria:['同一個体の形状・配色・識別特徴が素材間で一貫する'],tasks:['クリーチャーごとの参照シートと差分許容範囲を管理する']},
      integration:{criteria:['収集データ、図鑑、編成、セーブ復帰が同じIDを参照する'],tasks:['クリーチャーマスターデータとセーブ移行を検証する'],handoff:'固定IDのマスターデータ、セーブ互換表、統合ビルド'},
    },
    horror:{
      'music-sfx':{criteria:['無音・環境音・驚かせる音の意図がプレイ中に再現される'],tasks:['ヘッドホンとスピーカーで音響導線をプレイテストする']},
      testing:{criteria:['照明と音が視認性を損なわず意図した緊張を作る'],tasks:['照明条件を変えた恐怖演出プレイテストを行う']},
    },
    action:{
      animation:{criteria:['アニメーション、ヒットボックス、入力受付時間が同期する'],tasks:['ヒットストップと入力遅延をフレーム単位で検証する']},
      testing:{criteria:['対象端末で戦闘中の性能予算を超えない'],tasks:['負荷の高い戦闘でフレーム時間とメモリを測る']},
    },
    rpg:{
      concept:{criteria:['クエスト状態、報酬、失敗条件をデータとして定義している'],tasks:['クエストID、進行フラグ、バランス前提を台帳化する'],handoff:'クエスト／成長データ、セーブ項目、初期バランス表'},
      integration:{criteria:['クエスト進行、所持品、成長値がセーブ復帰後も一致する'],tasks:['データ移行とセーブ互換性を検証する']},
      testing:{criteria:['主要クエストの進行不能と極端なバランス崩壊がない'],tasks:['進行経路、セーブ復帰、経済・戦闘バランスをプレイテストする']},
    },
    puzzle:{
      concept:{criteria:['ルール、状態遷移、成功・失敗条件を例示できる'],tasks:['解法の前提とアクセシビリティ要件を定義する'],handoff:'ルール表、状態遷移、代表問題と既知解'},
      testing:{criteria:['代表問題に解があり不正な詰み状態を検出できる','色・音だけに依存せず状態を判別できる'],tasks:['解可能性、状態復帰、入力代替、難易度曲線を検証する']},
    },
    other:{concept:{criteria:['ジャンル未定によるスコープリスクと検証期限を記録している'],tasks:['一般要件を仮置きし、試作後にジャンルと対象外を確定する']}},
  };
  const additions=genreAdditions[input.genre]?.[stage];
  const platformTasks:Partial<Record<ProductionStageId,string[]>> = input.platform==='web'
    ? {integration:['初回ロード容量、入力方式、ブラウザ差を確認する'],testing:['低速回線でロードとキーボード・タッチ入力を検証する']}
    : input.platform==='mobile'
      ? {testing:['複数の実機、画面比率、タッチ操作で検証する'],publishing:['ストア審査、権限、プライバシー申告を実機ビルドと照合する']}
      : input.platform==='desktop'
        ? {testing:['Steam公開候補ではコントローラー操作と配布ビルドを検証する'],publishing:['ストア用ビルド、コントローラー表記、配布物を照合する']}
        : {prototype:['対象プラットフォームごとの入力方式と最低性能を先に定義する'],integration:['各対象向けビルド設定、入力、セーブ形式の差を管理する'],testing:['全対象で入力、セーブ互換、性能を実機検証する'],publishing:['各ストアのビルド、申告、審査要件を個別に照合する']};
  const lifecycleTasks:Partial<Record<ProductionStageId,string[]>>={prototype:['縦切り（vertical slice）でコアループを通し、続行判断を記録する'],testing:['プレイテスト結果を優先度付き修正へ戻し、回帰確認する','性能・容量を最適化し、計測結果を残す'],publishing:['release gateとして品質、権利、費用、配布要件の承認者と合否を記録する']};
  return {...plan,acceptanceCriteria:[...plan.acceptanceCriteria,...(additions?.criteria??[])],manualTasks:[...plan.manualTasks,...(additions?.tasks??[]),...(platformTasks[stage]??[]),...(lifecycleTasks[stage]??[])],handoff:additions?.handoff??plan.handoff};
}

/** Pure deterministic recommendation. Affiliate fields never participate in matching or ordering. */
export function recommendProject(rawInput: ProjectInput, catalog: readonly Service[] = getServices()): RecommendationResult {
  const input = ProjectInputSchema.parse(rawInput);
  const stages = productionStageIds.map(stage => {
    const requirement = requirementFor(stage, input);
    const plan = getStagePlan(stage,input);
    if (requirement === 'excluded') return { stage, requirement, primary:null, alternatives:[], reviewCandidates:[], manualFallback:null, ...plan, nextAction:'この工程は入力条件により省略します。' };
    const matchingRules = recommendationRules.filter(rule => rule.stage === stage && matches(rule,input));
    const ruleBySlug=new Map(matchingRules.map(rule=>[rule.serviceSlug,rule]));
    const selected = catalog.filter(service=>service.capabilities.some(capability=>stageCapabilities[stage].includes(capability.id))).map(service=>({service,rule:ruleBySlug.get(service.slug),fit:fitFor(service,stage,input,ruleBySlug.get(service.slug))})).filter(item=>item.fit.score>=20).sort((a,b)=>b.fit.score-a.fit.score||(b.rule?.priority??0)-(a.rule?.priority??0)||a.service.slug.localeCompare(b.service.slug));
    const eligible = selected.filter(item=>item.fit.hardExclusions.length===0);
    const blocked = selected.filter(item=>item.fit.hardExclusions.length>0);
    const first = eligible[0];
    const primary = first && first.rule && first.fit.score>=fitRubric.primaryMinimum ? tool(first.service,first.rule.reasonTemplate,input,[],first.fit) : null;
    const alternativeSlugs = new Set([...(first?.service.alternatives ?? []),...eligible.slice(1).map(item=>item.service.slug)]);
    if(first) alternativeSlugs.delete(first.service.slug);
    const alternatives = primary ? eligible.filter(item=>item.service.slug!==first?.service.slug&&item.fit.score>=40).slice(0,2).map(item=>tool(item.service,`${first?.service.name ?? '主要候補'}と同じ工程を対象にした代替候補です。`,input,[],item.fit)) : [];
    const blockedBySlug = new Map<string,{service:Service;reasons:string[];checks:string[]}>();
    for (const {rule,service,fit} of blocked) {
      const existing=blockedBySlug.get(service.slug)??{service,reasons:[],checks:[]};
      existing.reasons.push(...matchingRules.filter(candidate=>candidate.serviceSlug===service.slug).map(candidate=>candidate.reasonTemplate),...(rule?[]:[`${stage}工程の能力候補です`]));
      existing.checks.push(...fit.hardExclusions);
      blockedBySlug.set(service.slug,existing);
    }
    const eligibleReviews = primary ? [] : eligible.filter(item=>item.fit.score>=40).slice(0,2).map(item=>tool(item.service,`${stage}工程の能力は確認済みですが、入力条件に一致する明示ルールがないため手動比較候補です。`,input,[],item.fit));
    const blockedReviews = [...blockedBySlug.values()].slice(0,Math.max(0,2-eligibleReviews.length)).map(({service,reasons,checks})=>tool(service,`${[...new Set(reasons)].join('。')} ただし必須条件が未確認のため推薦ではなく、手動確認候補です。`,input,[...new Set(checks)],fitFor(service,stage,input,ruleBySlug.get(service.slug))));
    const reviewCandidates = [...eligibleReviews,...blockedReviews];
    return { stage, requirement, primary, alternatives, reviewCandidates, manualFallback:primary ? null : fallback[stage], ...plan };
  });
  const used = stages.flatMap(stage=>stage.primary ? [stage.primary.service] : []);
  const review = [...new Map(stages.flatMap(stage=>stage.reviewCandidates).map(candidate=>[candidate.service.slug,candidate.service])).values()];
  return { input, stages, productionOrder:stages.filter(stage=>stage.requirement!=='excluded').map(stage=>stage.stage), costSummary:{ freePlanConfirmed:used.filter(s=>s.freePlan==='yes').length, freePlanUnknown:used.filter(s=>s.freePlan==='unknown').length, pricingAmountKnown:0, pricingAmountUnknown:used.length, reviewFreePlanConfirmed:review.filter(s=>s.freePlan==='yes').length, reviewFreePlanUnknown:review.filter(s=>s.freePlan==='unknown').length, reviewPricingAmountKnown:0, reviewPricingAmountUnknown:review.length, note:'掲載データには確定金額がないため合計額は算出しません。手動確認候補は推薦候補と分けて集計しています。無料プランも上限・商用条件を公式ページで確認してください。' }, projectGuidance:[input.experience==='beginner'?'初心者向け: 一度に全工程を進めず、各工程の代表成果物を1つ作ってから次へ進んでください。':input.experience==='advanced'?'上級者向け: 評価基準を自動テストやアセット検証へ落とし込み、生成差分を追跡してください。':'経験者向け: 工程ごとに小さな検証ビルドを固定し、次工程への受け渡し条件を記録してください。',input.platform==='multi-platform'?'複数プラットフォームは最も制約の強い対象端末を先に決め、各実機で検証してください。':`公開先「${input.platform}」への対応は、サービスの利用環境だけでは断定できません。出力形式とゲームエンジン側の公開要件を確認してください。`,input.budget==='free'?'無料プランありと確認できた候補だけを推薦します。上限と対象機能は別途確認してください。':input.budget==='low'?'低予算条件のため、小さな試作で利用量を測ってから有料契約を判断してください。':'品質優先条件でも価格額は推測しません。候補を実素材で比較し、公式見積もりを確認してください。',input.commercialIntent==='commercial'?'商用利用「不可」「不明」の候補は推薦から外します。「条件付き」の候補は無条件の許可と扱わず、対象プラン・生成時点の条件・用途を公式規約で確認してください。':input.commercialIntent==='undecided'?'公開形態が未定のため、販売へ切り替える前に商用条件を再判定してください。':'非商用条件です。後から販売する場合は全候補の規約を再確認してください。',input.integrationImportance==='high'?'APIありと確認できた候補だけを推薦します。':'APIは必須条件にしていません。将来必要になる場合はBuilder条件を変更してください。'] };
}
