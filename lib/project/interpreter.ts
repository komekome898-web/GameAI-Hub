import type { DetailCandidate, InferredField, Interpretation, ProjectBrief, ProjectDetail } from './types';

type ScalarField = Exclude<keyof ProjectBrief, 'idea' | 'capabilities' | 'details'>;
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
    {value:'mobile',terms:['iphone','ipad','android','スマホ','スマートフォン','モバイル','ios']},
    {value:'web',terms:['ブラウザ','webゲーム','web game']},
    {value:'desktop',terms:['steam','pc向け','パソコン向け','デスクトップ']},
    {value:'multi-platform',terms:['マルチプラットフォーム','複数プラットフォーム']},
  ],
  engine:[{value:'unity',terms:['unity']},{value:'unreal',terms:['unreal','ue5','ue 5']},{value:'godot',terms:['godot']},{value:'undecided',terms:['エンジン未定','engine undecided']}],
  budget:[{value:'free',terms:['無料で','予算なし','予算0円','費用0円']},{value:'low',terms:['低予算','月1万円','月１万円','月額予算1万円','予算月額1万円','毎月1万円','1万円以内','１万円以内']},{value:'flexible',terms:['予算は柔軟','予算上限なし']}],
  experience:[{value:'beginner',terms:['初心者','未経験']},{value:'intermediate',terms:['中級']},{value:'advanced',terms:['上級','熟練']}],
  team:[{value:'solo',terms:['一人開発','1人開発','１人開発','個人開発','solo']},{value:'small-team',terms:['少人数','小規模チーム']},{value:'team',terms:['チーム開発']}],
  commercialIntent:[{value:'commercial',terms:['商用','販売したい','発売したい','販売','発売']},{value:'personal',terms:['非商用','個人利用']},{value:'undecided',terms:['商用未定','販売未定','発売未定']}],
  locale:[{value:'ja-en',terms:['日本語と英語','日英','日本語・英語']},{value:'multi',terms:['多言語','multilingual']},{value:'ja',terms:['日本語のみ','日本語対応','日本語版','日本語で遊べる']}],
};
const capabilityRules: { value:ProjectBrief['capabilities'][number]; terms:string[] }[] = [
  {value:'coding',terms:['コード','コーディング','プログラミング','coding','codex']},{value:'art-2d',terms:['2dアート','2d画像','キャラクター画像','背景画像','画像','絵','イラスト','ドット絵']},
  {value:'assets-3d',terms:['3dモデル','3dアセット','モデリング']},{value:'animation',terms:['アニメーション','モーション']},
  {value:'voice',terms:['音声','ボイス','voice']},{value:'music',terms:['bgm','音楽']},{value:'sfx',terms:['効果音','sfx']},
  {value:'npc-dialogue',terms:['npc','会話ai','ai会話']},{value:'localization',terms:['ローカライズ','翻訳','日本語と英語','多言語']},
  {value:'trailer',terms:['トレーラー','宣伝動画','trailer']},
];
const normalize=(text:string)=>text.normalize('NFKC').toLocaleLowerCase('ja-JP');
const escapeRegExp=(value:string)=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const explicitlyNegated=(text:string,term:string)=>{
  const target=escapeRegExp(normalize(term));
  const negative='(?:なし|不要|いらない|しない|使わず|使わない|生成しない)';
  const direct=new RegExp(`${target}(?:は|を|も)?${negative}`);
  const coordinated=new RegExp(`${target}(?:(?:と|・|、|も)[^。．、,]{1,14})+(?:は|を|も)?${negative}`);
  return direct.test(text)||coordinated.test(text);
};

const cleanDetail=(value:string)=>value.normalize('NFKC').replace(/[\u0000-\u001f\u007f<>]/g,'').replace(/\s+/g,' ').trim().slice(0,80);
const detailId=(kind:ProjectDetail['kind'],text:string,index:number)=>`detail-${kind}-${index}-${Array.from(normalize(text)).reduce((hash,char)=>(hash*31+char.codePointAt(0)!)>>>0,7).toString(36)}`;
function extractDetailCandidates(source:string,text:string):DetailCandidate[] {
  const found:{kind:ProjectDetail['kind'];text:string;evidence:string}[]=[];
  const add=(kind:ProjectDetail['kind'],value:string,evidence:string)=>{const cleaned=cleanDetail(value.replace(/^(?:ゲームの)?/,'').replace(/(?:ゲーム)?(?:です|である)$/,'')).replace(/^[「『]|[」』]$/g,'');if(cleaned&&cleaned.length<=80&&!/https?:|@/.test(cleaned))found.push({kind,text:cleaned,evidence:cleanDetail(evidence).slice(0,100)});};
  for(const match of source.matchAll(/(?:主人公|プレイヤー)は([^。.!?\n]{1,80})/g)){
    const candidate=normalize(match[1]);
    if(!/(?:捕獲|育成|編成|探索|戦闘|会話|料理|建築|ステルス|推理|経営)(?:する|し|できる)?/.test(candidate))add('player-role',match[1],match[0]);
  }
  for(const match of source.matchAll(/([^。.!?\n、]{1,60})を舞台に/g))add('setting',match[1],match[0]);
  for(const match of source.matchAll(/舞台は([^。.!?\n]{1,60})/g))add('setting',match[1],match[0]);
  const mechanics=['捕獲','育成','編成','探索','戦闘','会話','料理','建築','ステルス','推理','経営'] as const;
  for(const match of source.matchAll(/(?:主人公|プレイヤー)は([^、。.!?\n]{1,30})を探索(?:して|する|し)/g))add('setting',match[1],match[0]);
  for(const mechanic of mechanics)if(text.includes(mechanic)&&!explicitlyNegated(text,mechanic))add('core-mechanic',mechanic,mechanic);
  const mechanicGroup=mechanics.join('|');
  for(const match of source.matchAll(new RegExp(`([^。.!?\\n、]{1,40})を(?:${mechanicGroup})(?:して|する|できる|し)`, 'g'))){
    const value=match[1].split(/(?:は|が)/).at(-1)??match[1];
    if(!match[0].includes('を探索'))add('entity',value,match[0]);
  }
  for(const match of source.matchAll(/([^。.!?\n、]{1,50})を仲間に(?:して|する)/g)){
    const value=match[1].split(/(?:は|が|、)/).at(-1)??match[1];
    add('entity',value,match[0]);
  }
  const tones=['かわいい','不気味','ダーク','コミカル','穏やか','緊張感'] as const;
  for(const tone of tones)if(text.includes(tone)&&!explicitlyNegated(text,tone))add('tone',tone,tone);
  // Preserve an explicit objective that the bounded vocabulary cannot classify.
  // It remains a candidate and is never silently approved.
  const objective=source.split(/[。.!?\n]/).map(value=>value.trim()).find(value=>value.length>=6&&value.length<=80&&/(?:したい|目指す|救う|守る|脱出|届け|解決|生き残る)/.test(value)&&!/(?:予算|円|か月|ヶ月|AI|ＡＩ|コード|画像|音声|技術|Unity|Unreal|Godot)/i.test(value)&&!/https?:|\S+@\S+/.test(value));
  if(objective)add('constraint',objective,objective);
  const unique=new Map<string,{kind:ProjectDetail['kind'];text:string;evidence:string}>();
  for(const item of found)unique.set(`${item.kind}:${normalize(item.text)}`,item);
  return [...unique.values()].slice(0,20).map((item,index)=>({...item,id:detailId(item.kind,item.text,index),provenance:'explicit_text'}));
}

export function interpretProjectIdea(raw:string):Interpretation {
  const idea=raw.trim().slice(0,1200); const text=normalize(idea); const fields:InferredField[]=[]; const conflicts:string[]=[];
  for(const [field, candidates] of Object.entries(rules) as [ScalarField,Match[]][]) {
    const hits=candidates.flatMap(candidate=>candidate.terms.filter(term=>text.includes(normalize(term))&&!explicitlyNegated(text,term)&&!(['販売','発売'].includes(term)&&text.includes(`${normalize(term)}未定`))).map(term=>({...candidate,term})));
    let values=[...new Set(hits.map(hit=>hit.value))];
    if(field==='budget'&&/(?:月額(?:予算)?|予算月額|毎月|月)\s*[1-9][0-9,]*円/.test(text)&&!values.includes('low'))values.push('low');
    if(field==='genre'&&values.includes('monster-collection')&&values.includes('rpg')&&/(?:モンスター収集|monster collection)(?:型|系)?(?:の)?\s*rpg/.test(text))values=values.filter(value=>value!=='rpg');
    if(values.length===1) fields.push({field,value:values[0],provenance:'explicit_text',evidence:hits.find(hit=>hit.value===values[0])?.term});
    else if(values.length>1) conflicts.push(`${field}: ${values.join(', ')}`);
  }
  const capabilityText=text.replace(/(?:プログラミング|コーディング|コード)(?:経験)?(?:は|が)?(?:初心者|未経験|中級|上級|熟練)/g,'');
  const capabilities=capabilityRules.filter(rule=>rule.terms.some(term=>capabilityText.includes(normalize(term))&&!explicitlyNegated(capabilityText,term))).map(rule=>rule.value);
  if(capabilities.length) fields.push({field:'capabilities',value:[...new Set(capabilities)],provenance:'explicit_text',evidence:'自由文に明示された制作要件'});
  const present=new Set(fields.map(field=>field.field));
  return {idea,fields,detailCandidates:extractDetailCandidates(idea,text),unresolved:(Object.keys(rules) as ScalarField[]).filter(field=>!present.has(field)),conflicts};
}
