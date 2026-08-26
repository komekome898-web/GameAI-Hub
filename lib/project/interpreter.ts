import type { InferredField, Interpretation, ProjectBrief } from './types';

type ScalarField = Exclude<keyof ProjectBrief, 'idea' | 'capabilities'>;
type Match = { value:string; terms:string[] };
const rules: Record<ScalarField, Match[]> = {
  genre:[
    {value:'monster-collection',terms:['モンスター収集','モンスターを集め','monster collection']},
    {value:'visual-novel',terms:['ビジュアルノベル','ノベルゲーム','visual novel']},
    {value:'horror',terms:['ホラー','horror']},{value:'puzzle',terms:['パズル','puzzle']},
    {value:'action',terms:['アクション','action']},{value:'rpg',terms:['rpg','ロールプレイング']},
  ],
  dimension:[{value:'3d',terms:['3d','３d','三次元']},{value:'2d',terms:['2d','２d','ドット絵','二次元']}],
  platform:[
    {value:'mobile',terms:['iphone','ipad','android','スマホ','モバイル','ios']},
    {value:'web',terms:['ブラウザ','webゲーム','web game']},
    {value:'desktop',terms:['steam','pc向け','パソコン向け','デスクトップ']},
    {value:'multi-platform',terms:['マルチプラットフォーム','複数プラットフォーム']},
  ],
  engine:[{value:'unity',terms:['unity']},{value:'unreal',terms:['unreal','ue5','ue 5']},{value:'godot',terms:['godot']},{value:'undecided',terms:['エンジン未定','engine undecided']}],
  budget:[{value:'free',terms:['無料で','予算なし','0円','０円']},{value:'low',terms:['低予算','月1万円','月１万円','1万円以内','１万円以内']},{value:'flexible',terms:['予算は柔軟','予算上限なし']}],
  experience:[{value:'beginner',terms:['初心者','未経験']},{value:'intermediate',terms:['中級']},{value:'advanced',terms:['上級','熟練']}],
  team:[{value:'solo',terms:['一人開発','1人開発','１人開発','個人開発','solo']},{value:'small-team',terms:['少人数','小規模チーム']},{value:'team',terms:['チーム開発']}],
  commercialIntent:[{value:'commercial',terms:['商用','販売したい','発売したい','販売','発売']},{value:'personal',terms:['非商用','個人利用']},{value:'undecided',terms:['商用未定','販売未定','発売未定']}],
  locale:[{value:'ja-en',terms:['日本語と英語','日英','日本語・英語']},{value:'multi',terms:['多言語','multilingual']},{value:'ja',terms:['日本語のみ']}],
};
const capabilityRules: { value:ProjectBrief['capabilities'][number]; terms:string[] }[] = [
  {value:'coding',terms:['コード','プログラミング','coding','codex']},{value:'art-2d',terms:['2dアート','絵','イラスト','ドット絵']},
  {value:'assets-3d',terms:['3dモデル','3dアセット','モデリング']},{value:'animation',terms:['アニメーション','モーション']},
  {value:'voice',terms:['音声','ボイス','voice']},{value:'music',terms:['bgm','音楽']},{value:'sfx',terms:['効果音','sfx']},
  {value:'npc-dialogue',terms:['npc','会話ai','ai会話']},{value:'localization',terms:['ローカライズ','翻訳','日本語と英語','多言語']},
  {value:'trailer',terms:['トレーラー','宣伝動画','trailer']},
];
const normalize=(text:string)=>text.normalize('NFKC').toLocaleLowerCase('ja-JP');
const escapeRegExp=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const explicitlyNegated=(text:string,term:string)=>{
  const target=escapeRegExp(normalize(term));
  const negative='(?:なし|不要|いらない|使わず|使わない|生成しない)';
  const direct=new RegExp(`${target}(?:は|を)?${negative}`);
  const coordinated=new RegExp(`${target}(?:と|・|、)[^。．、,]{1,10}(?:は|を)?${negative}`);
  return direct.test(text)||coordinated.test(text);
};

export function interpretProjectIdea(raw:string):Interpretation {
  const idea=raw.trim().slice(0,1200); const text=normalize(idea); const fields:InferredField[]=[]; const conflicts:string[]=[];
  for(const [field, candidates] of Object.entries(rules) as [ScalarField,Match[]][]) {
    const hits=candidates.flatMap(candidate=>candidate.terms.filter(term=>text.includes(normalize(term))&&!explicitlyNegated(text,term)&&!(['販売','発売'].includes(term)&&text.includes(`${normalize(term)}未定`))).map(term=>({...candidate,term})));
    const values=[...new Set(hits.map(hit=>hit.value))];
    if(values.length===1) fields.push({field,value:values[0],provenance:'explicit_text',evidence:hits.find(hit=>hit.value===values[0])?.term});
    else if(values.length>1) conflicts.push(`${field}: ${values.join(', ')}`);
  }
  const capabilities=capabilityRules.filter(rule=>rule.terms.some(term=>text.includes(normalize(term))&&!explicitlyNegated(text,term))).map(rule=>rule.value);
  if(capabilities.length) fields.push({field:'capabilities',value:[...new Set(capabilities)],provenance:'explicit_text',evidence:'自由文に明示された制作要件'});
  const present=new Set(fields.map(field=>field.field));
  return {idea,fields,unresolved:(Object.keys(rules) as ScalarField[]).filter(field=>!present.has(field)),conflicts};
}
