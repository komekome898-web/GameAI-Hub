import { ProjectInputSchema, StackTemplateSchema, type ProductionStageId, type ProjectInput } from '@/lib/domain';

const commonEnd: ProductionStageId[] = ['integration','testing','publishing'];
const codeTool = (serviceSlug:'github-copilot'|'cursor' = 'github-copilot') => ({ stage:'code' as const, serviceSlug, reason:serviceSlug==='cursor'?'コード生成・コードベース検索・リファクタリング用途が工程に合います。':'コード補完・チャット・コードレビュー用途が実装工程に合います。', limitation:serviceSlug==='cursor'?'利用上限や機能範囲はプランにより異なります。':'出力コードは利用者によるレビューとテストが必要です。', alternativeSlugs:[serviceSlug==='cursor'?'github-copilot':'cursor'], optional:false });
const visualTool = () => ({ stage:'visuals' as const, serviceSlug:'scenario', reason:'2Dアセットとコンセプト画像が登録済みの主要用途です。', limitation:'権利条件と費用はプラン・入力素材ごとの確認が必要です。', alternativeSlugs:[], optional:false });
const voiceTool = (optional=true) => ({ stage:'voice' as const, serviceSlug:'elevenlabs', reason:'キャラクター音声とナレーションが登録済みの主要用途です。', limitation:'クローン音声は権利と本人同意の慎重な確認が必要です。', alternativeSlugs:[], optional });
const musicTool = (optional=true) => ({ stage:'music-sfx' as const, serviceSlug:'suno', reason:'BGMと楽曲プロトタイプが登録済みの主要用途です。', limitation:'商用利用条件はプランと生成時点に依存します。効果音対応は確認できていません。', alternativeSlugs:[], optional });
const modelTool = () => ({ stage:'3d' as const, serviceSlug:'meshy', reason:'3Dモデル・テクスチャ・プロトタイプが登録済みの主要用途です。', limitation:'トポロジーやリグ等は用途に応じた検品が必要です。', alternativeSlugs:[], optional:false });
const prototypeTool = () => ({ stage:'prototype' as const, serviceSlug:'rosebud-ai', reason:'ゲームプロトタイプとノーコード制作が登録済みの主要用途です。', limitation:'エクスポート、商用条件、拡張性は採用前の確認が必要です。', alternativeSlugs:[], optional:false });
const cost='掲載サービスは価格額を構造化していません。無料プランの有無と最新料金を各公式ページで確認し、確定額として扱わないでください。';
const caveats=['掲載候補の商用利用は「条件付き」または「不明」です。公開前に生成時点のプラン・規約・入力素材の権利を確認してください。'];

export const stackTemplates = StackTemplateSchema.array().parse([
 {slug:'2d-rpg',title:'2D RPG 制作構成',summary:'小規模な2D RPGを、実装・画像・必要に応じた音声から組み立てる工程案です。',forWhom:['2D RPGを個人または小規模チームで作る人'],workflow:['concept','prototype','code','visuals','music-sfx',...commonEnd],tools:[codeTool(),visualTool(),musicTool()],limitations:['シナリオ設計、アニメーション、ゲームエンジン自体は掲載候補だけでは完結しません。'],costVisibility:cost,commercialCaveats:caveats},
 {slug:'monster-collection-mobile',title:'モンスター収集モバイルゲーム制作構成',summary:'収集ループを先に検証し、コードと2D素材を段階的に統合する工程案です。',forWhom:['モバイル向け収集ゲームのプロトタイプを作る人'],workflow:['concept','prototype','code','visuals','animation','music-sfx',...commonEnd],tools:[codeTool(),visualTool(),musicTool()],limitations:['大量のキャラクター整合性、アニメーション、ストア運用は別途設計と人手の検品が必要です。'],costVisibility:cost,commercialCaveats:caveats},
 {slug:'visual-novel',title:'ビジュアルノベル制作構成',summary:'物語のプロトタイプ後に、実装・立ち絵・任意の音声とBGMを統合する工程案です。',forWhom:['会話と演出を中心にしたゲームを作る人'],workflow:['concept','prototype','code','visuals','voice','music-sfx',...commonEnd],tools:[codeTool(),visualTool(),voiceTool(false),musicTool()],limitations:['脚本、分岐設計、画像のキャラクター一貫性は掲載ツールだけでは保証されません。'],costVisibility:cost,commercialCaveats:caveats},
 {slug:'3d-indie',title:'3D インディーゲーム制作構成',summary:'操作プロトタイプを先に作り、3D素材を検品して統合する工程案です。',forWhom:['Unity・Unreal Engine・Godotで3D作品を作る人'],workflow:['concept','prototype','code','3d','animation','music-sfx',...commonEnd],tools:[codeTool('cursor'),modelTool(),musicTool()],limitations:['リグ、アニメーション、最適化、レベルデザインは別工程として人が判断する必要があります。'],costVisibility:cost,commercialCaveats:caveats},
 {slug:'browser-game',title:'ブラウザゲーム制作構成',summary:'遊べるWebプロトタイプを早く検証し、必要ならコード主体の実装へ進む工程案です。',forWhom:['ブラウザで動く小規模ゲームを検証したい人'],workflow:['concept','prototype','code','visuals',...commonEnd],tools:[prototypeTool(),codeTool('cursor'),{...visualTool(),optional:true}],limitations:['Rosebud AIのエクスポートと拡張性は採用前の確認が必要で、掲載情報だけでは配信要件を判断できません。'],costVisibility:cost,commercialCaveats:caveats},
 {slug:'horror-game',title:'2D ホラーゲーム制作構成',summary:'2Dの恐怖体験を先に試作し、ビジュアルと音を統合する工程案です。3D作品には3D Indie構成を使います。',forWhom:['2Dの雰囲気と演出を重視するホラーゲーム制作者'],workflow:['concept','prototype','code','visuals','music-sfx',...commonEnd],tools:[codeTool(),visualTool(),musicTool(false)],limitations:['効果音の生成可否、演出設計、年齢区分への適合はこの構成からは判断できません。3D制作工程は含みません。'],costVisibility:cost,commercialCaveats:caveats},
 {slug:'lowest-cost',title:'無料・最低コスト優先の制作構成',summary:'無料プランが確認済みの候補を中心に、小さな試作から始める工程案です。',forWhom:['初期費用を抑えて検証したい人'],workflow:['concept','prototype','code','visuals','music-sfx',...commonEnd],tools:[codeTool(),{...musicTool(),optional:true}],limitations:['無料は費用ゼロや商用利用可を意味しません。画像制作を含む全工程はこの構成だけでは完結しません。'],costVisibility:'候補には無料プランが確認されたサービスがありますが、上限・商用条件・最新価格は公式ページで確認してください。',commercialCaveats:caveats},
 {slug:'solo-developer',title:'個人開発者向け制作構成',summary:'スコープを抑え、コード・ビジュアル・任意の音を順番に統合する工程案です。',forWhom:['複数工程を一人で進める開発者'],workflow:['concept','prototype','code','visuals','music-sfx',...commonEnd],tools:[codeTool(),visualTool(),musicTool()],limitations:['企画判断、統合作業、テスト、公開準備は自動化されず、制作者自身の作業が必要です。'],costVisibility:cost,commercialCaveats:caveats},
]);
export function getStackTemplate(slug:string){return stackTemplates.find(stack=>stack.slug===slug);}
const preset = (value:Partial<ProjectInput>) => ProjectInputSchema.parse(value);
export const stackTemplatePresets:Record<string,ProjectInput> = {
  '2d-rpg':preset({gameType:'2d',genre:'rpg',platform:'desktop',engine:'godot',experience:'beginner',codingPreference:'assisted',budget:'low',commercialIntent:'commercial',integrationImportance:'medium',assetRequirements:['2d-assets'],voiceRequirement:'optional',musicRequirement:'required'}),
  'monster-collection-mobile':preset({gameType:'mobile',genre:'monster-collection',platform:'mobile',engine:'unity',experience:'intermediate',codingPreference:'assisted',budget:'low',commercialIntent:'commercial',integrationImportance:'medium',assetRequirements:['concept-art','2d-assets','animation'],voiceRequirement:'optional',musicRequirement:'required'}),
  'visual-novel':preset({gameType:'2d',genre:'visual-novel',platform:'desktop',engine:'other',experience:'beginner',codingPreference:'assisted',budget:'low',commercialIntent:'commercial',integrationImportance:'low',assetRequirements:['concept-art','2d-assets'],voiceRequirement:'required',musicRequirement:'required'}),
  '3d-indie':preset({gameType:'3d',genre:'action',platform:'desktop',engine:'unreal',experience:'intermediate',codingPreference:'code-first',budget:'flexible',commercialIntent:'commercial',integrationImportance:'high',assetRequirements:['concept-art','3d-assets','animation'],voiceRequirement:'optional',musicRequirement:'required'}),
  'browser-game':preset({gameType:'browser',genre:'puzzle',platform:'web',engine:'other',experience:'beginner',codingPreference:'assisted',budget:'free',commercialIntent:'undecided',integrationImportance:'low',assetRequirements:['2d-assets'],voiceRequirement:'none',musicRequirement:'optional'}),
  'horror-game':preset({gameType:'2d',genre:'horror',platform:'desktop',engine:'godot',experience:'intermediate',codingPreference:'assisted',budget:'low',commercialIntent:'commercial',integrationImportance:'medium',assetRequirements:['concept-art','2d-assets'],voiceRequirement:'optional',musicRequirement:'required'}),
  'lowest-cost':preset({gameType:'2d',genre:'other',platform:'web',experience:'beginner',codingPreference:'assisted',budget:'free',commercialIntent:'undecided',integrationImportance:'low',assetRequirements:[],voiceRequirement:'none',musicRequirement:'optional'}),
  'solo-developer':preset({gameType:'2d',genre:'rpg',platform:'desktop',experience:'intermediate',codingPreference:'assisted',budget:'low',commercialIntent:'commercial',integrationImportance:'medium',assetRequirements:['concept-art','2d-assets'],voiceRequirement:'optional',musicRequirement:'optional'}),
};
export function getStackTemplatePreset(slug:string|null){return slug ? stackTemplatePresets[slug] : undefined;}

export function validateStackTemplateConsistency() {
  for (const template of stackTemplates) {
    const preset=stackTemplatePresets[template.slug];
    if (!preset) throw new Error(`Stack preset missing: ${template.slug}`);
    if (preset.gameType==='3d' && !template.workflow.includes('3d')) throw new Error(`3D preset requires 3d workflow: ${template.slug}`);
    if (preset.gameType!=='3d' && template.workflow.includes('3d')) throw new Error(`Non-3D preset must not require 3d workflow: ${template.slug}`);
    if (preset.assetRequirements.includes('3d-assets')!==template.workflow.includes('3d')) throw new Error(`3D asset/workflow mismatch: ${template.slug}`);
  }
  return true;
}
validateStackTemplateConsistency();

/** Finds the nearest editorial template. This is navigation only, not a recommendation score. */
export function getClosestStackTemplate(input:ProjectInput) {
  const scalarFields:(keyof ProjectInput)[]=['gameType','genre','platform','engine','budget','experience','codingPreference','commercialIntent','voiceRequirement','musicRequirement','integrationImportance'];
  return stackTemplates
    .map(template=>{const preset=stackTemplatePresets[template.slug];const assetDifference=new Set([...preset.assetRequirements,...input.assetRequirements]).size-new Set(preset.assetRequirements.filter(value=>input.assetRequirements.includes(value))).size;return {template,mismatches:scalarFields.filter(field=>preset[field]!==input[field]).length+assetDifference};})
    .sort((a,b)=>a.mismatches-b.mismatches||a.template.slug.localeCompare(b.template.slug))[0]?.template;
}
