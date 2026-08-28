'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { OutboundLink } from '@/components/OutboundLink';
import { productionStages, type ProjectInput, defaultProjectInput } from '@/lib/domain';
import { track } from '@/lib/analytics';
import { recommendProject } from '@/lib/recommendation';
import { decodeProjectInput, encodeProjectInput } from '@/lib/recommendation/query';
import { getClosestStackTemplate, getStackTemplate, getStackTemplatePreset } from '@/data/stack-templates';

const stepTitles=['ゲームの基本条件を選ぶ','制作スタイルを選ぶ','必要な素材を選ぶ','予算と利用条件を選ぶ'] as const;
const labels = Object.fromEntries(productionStages.map(s => [s.id, s.label]));
const manualFoundations=['ゲームエンジン／プロジェクト設定','バージョン管理／ビルドパイプライン','アセット／ライセンス台帳','配布・ストア設定'];
const display={gameType:{'2d':'2Dゲーム','3d':'3Dゲーム',browser:'ブラウザゲーム',mobile:'モバイルゲーム',other:'未定'},genre:{rpg:'RPG','monster-collection':'モンスター収集','visual-novel':'ビジュアルノベル',horror:'ホラー',action:'アクション',puzzle:'パズル',other:'未定'},platform:{web:'Web',mobile:'モバイル',desktop:'PC / Steam','multi-platform':'複数プラットフォーム'},engine:{unity:'Unity',unreal:'Unreal Engine',godot:'Godot',other:'その他',undecided:'未定'},budget:{free:'無料だけ',low:'低予算',flexible:'品質優先・柔軟'},need:{none:'不要',optional:'あるとよい',required:'必要'}} as const;
const options = {
  gameType: [['2d','2Dゲーム'],['3d','3Dゲーム'],['browser','ブラウザゲーム'],['mobile','モバイルゲーム'],['other','まだ未定']],
  genre: [['rpg','RPG'],['monster-collection','モンスター収集'],['visual-novel','ビジュアルノベル'],['horror','ホラー'],['action','アクション'],['puzzle','パズル'],['other','その他・未定']],
  platform: [['web','Web'],['mobile','モバイル'],['desktop','PC / Steam'],['multi-platform','複数プラットフォーム']],
  experience: [['beginner','初心者'],['intermediate','経験あり'],['advanced','上級者']],
  codingPreference: [['no-code','コードを書きたくない'],['assisted','AI支援で書く'],['code-first','自分でコードを書く']],
  budget: [['free','無料だけ'],['low','低予算'],['flexible','品質優先・柔軟']],
  commercialIntent: [['personal','個人・非商用'],['commercial','販売・商用'],['undecided','未定']],
  integrationImportance: [['low','重視しない'],['medium','あると便利'],['high','API連携を重視']],
  engine: [['unity','Unity'],['unreal','Unreal Engine'],['godot','Godot'],['undecided','未定']],
} as const;

function Choice({name, value, selected, onChange}:{name:string;value:string;selected:boolean;onChange:()=>void}) {
  return <label className={`builder-choice ${selected?'selected':''}`}><input type="radio" name={name} checked={selected} onChange={onChange}/><span>{value}</span></label>;
}

export function BuilderClient() {
  const [input,setInput] = useState<ProjectInput>(defaultProjectInput);
  const [step,setStep] = useState(0);
  const [result,setResult] = useState(false);
  const [ready,setReady] = useState(false);
  const [templateTitle,setTemplateTitle] = useState('');
  const focusTarget=useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  useEffect(()=>{
    const params=new URLSearchParams(location.search);
    // URL state is external input and must be applied after hydration for static export.
    const template=params.get('template');
    const templateInput=getStackTemplatePreset(template);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInput(decodeProjectInput(params,templateInput));
    setTemplateTitle(templateInput?getStackTemplate(template!)?.title??'':'');
    setResult(params.get('result')==='1');
    setReady(true);
  },[]);
  useEffect(()=>{if(ready)focusTarget.current?.focus()},[step,result,ready]);
  const begin = () => { if (!started.current) { track('builder_start',{page:'/builder'}); started.current=true; } };
  const set = <K extends keyof ProjectInput>(key:K,value:ProjectInput[K]) => { begin(); setInput(old=>({...old,[key]:value})); };
  const next = () => { begin(); track('builder_step',{step:step+1,page:'/builder'}); setStep(s=>Math.min(3,s+1)); };
  const complete = () => {
    begin();
    track('builder_step',{step:4,page:'/builder'});
    track('builder_complete',{page:'/builder',game_type:input.gameType,budget:input.budget});
    const query=encodeProjectInput(input); history.replaceState(null,'',`/builder?result=1&${query}`); setResult(true); window.scrollTo({top:0,behavior:'smooth'});
  };
  if(!ready) return <p className="builder-loading" role="status">構成条件を読み込んでいます…</p>;
  if(result) return <BuilderResult focusRef={focusTarget} input={input} assumptionSource={templateTitle?`既成Stack「${templateTitle}」の引継ぎ値（変更した回答を含む）`:'Builderの回答（未変更項目は初期値）'} onEdit={()=>{setResult(false);setStep(0);history.replaceState(null,'','/builder')}}/>;
  return <div className="builder-shell" onFocus={begin}>
    <header className="builder-head"><p className="eyebrow">AI DEVELOPMENT STACK BUILDER</p><h1 ref={focusTarget} tabIndex={-1}>{stepTitles[step]}</h1><p className="sr-only" role="status" aria-live="polite">ステップ{step+1} / 4、{stepTitles[step]}</p>{templateTitle&&<p className="template-origin" role="status">「{templateTitle}」の条件を引き継ぎました。ここで変更できます。</p>}<p className="lead">4つの短い質問から、制作順と候補を作ります。料金・権利が不明な点は不明と表示します。</p></header>
    <div className="builder-progress"><span id="builder-progress-label">STEP {step+1} / 4</span><progress aria-labelledby="builder-progress-label" value={step+1} max="4">{step+1}/4</progress></div>
    <form className="builder-form" onSubmit={e=>{e.preventDefault();if(step===3) complete(); else next()}}>
      {step===0&&<><Question title="ゲームの形式" required name="gameType" values={options.gameType} current={input.gameType} choose={v=>set('gameType',v as ProjectInput['gameType'])}/><Question title="ジャンル" required name="genre" values={options.genre} current={input.genre} choose={v=>set('genre',v as ProjectInput['genre'])}/><Question title="公開先" required name="platform" values={options.platform} current={input.platform} choose={v=>set('platform',v as ProjectInput['platform'])}/></>}
      {step===1&&<><Question title="ゲームエンジン" name="engine" values={options.engine} current={input.engine} choose={v=>set('engine',v as ProjectInput['engine'])}/><Question title="制作経験" required name="experience" values={options.experience} current={input.experience} choose={v=>set('experience',v as ProjectInput['experience'])}/><Question title="コーディング方針" required name="coding" values={options.codingPreference} current={input.codingPreference} choose={v=>set('codingPreference',v as ProjectInput['codingPreference'])}/></>}
      {step===2&&<><Check title="必要な素材（任意・複数可）" values={[['concept-art','コンセプトアート'],['2d-assets','2D素材'],['3d-assets','3D素材'],['animation','アニメーション']]} current={input.assetRequirements} choose={v=>set('assetRequirements',input.assetRequirements.includes(v as never)?input.assetRequirements.filter(x=>x!==v):[...input.assetRequirements,v as never])}/><Tri title="音声" current={input.voiceRequirement} name="voice" choose={v=>set('voiceRequirement',v)}/><Tri title="音楽・効果音" current={input.musicRequirement} name="music" choose={v=>set('musicRequirement',v)}/></>}
      {step===3&&<><Question title="予算" required name="budget" values={options.budget} current={input.budget} choose={v=>set('budget',v as ProjectInput['budget'])}/><Question title="利用目的" required name="commercial" values={options.commercialIntent} current={input.commercialIntent} choose={v=>set('commercialIntent',v as ProjectInput['commercialIntent'])}/><Question title="API連携の重要度" required name="api" values={options.integrationImportance} current={input.integrationImportance} choose={v=>set('integrationImportance',v as ProjectInput['integrationImportance'])}/></>}
      <div className="builder-nav">{step>0?<button type="button" className="button ghost" onClick={()=>setStep(s=>s-1)}>戻る</button>:<Link className="text-link" href="/stacks">既成Stackを見る</Link>}<button className="button" type="submit">{step===3?'構成を作る':'次へ'}</button></div>
    </form>
  </div>;
}

function Question({title,required,name,values,current,choose}:{title:string;required?:boolean;name:string;values:readonly(readonly[string,string])[];current:string;choose:(v:string)=>void}) { return <fieldset className="builder-question"><legend>{title} <small>{required?'必須':'任意'}</small></legend><div className="builder-choices">{values.map(([v,l])=><Choice key={v} name={name} value={l} selected={current===v} onChange={()=>choose(v)}/>)}</div></fieldset> }
function Check({title,values,current,choose}:{title:string;values:string[][];current:string[];choose:(v:string)=>void}) { return <fieldset className="builder-question"><legend>{title}</legend><div className="builder-choices">{values.map(([v,l])=><label className={`builder-choice ${current.includes(v)?'selected':''}`} key={v}><input type="checkbox" checked={current.includes(v)} onChange={()=>choose(v)}/><span>{l}</span></label>)}</div></fieldset> }
function Tri({title,current,name,choose}:{title:string;current:'none'|'optional'|'required';name:string;choose:(v:'none'|'optional'|'required')=>void}) { return <Question title={`${title}（任意）`} name={name} values={[['none','不要'],['optional','あるとよい'],['required','必要']]} current={current} choose={v=>choose(v as typeof current)}/> }

function BuilderResult({input,onEdit,focusRef,assumptionSource}:{input:ProjectInput;onEdit:()=>void;focusRef:RefObject<HTMLHeadingElement|null>;assumptionSource:string}) {
  const result=recommendProject(input); const active=result.stages.filter(s=>s.requirement!=='excluded');
  const required=result.stages.filter(s=>s.requirement==='required'); const optional=result.stages.filter(s=>s.requirement==='optional'); const excluded=result.stages.filter(s=>s.requirement==='excluded');
  const primaryIds=[...new Set(active.flatMap(stage=>stage.primary?[stage.primary.service.slug]:[]))].slice(0,4);
  const reviewIds=[...new Set(active.flatMap(stage=>stage.reviewCandidates.map(candidate=>candidate.service.slug)))].slice(0,4);
  const compareIds=primaryIds.length?primaryIds:reviewIds;
  const closestStack=getClosestStackTemplate(input);
  const [copyStatus,setCopyStatus]=useState('');
  const share=async()=>{try{if(!navigator.clipboard?.writeText)throw new Error('unsupported');await navigator.clipboard.writeText(location.href);setCopyStatus('URLをコピーしました')}catch{setCopyStatus('コピーできませんでした。ブラウザのURLをコピーしてください。')}};
  const planText=()=>[`# GameAI Hub 制作計画`,``,`ゲームエンジン: ${display.engine[input.engine]}`,`手動基盤: ${manualFoundations.join(' / ')}`,``,...active.flatMap((stage,index)=>[`## ${index+1}. ${labels[stage.stage]}`,`区分: ${stage.requirement==='required'?'必須':'任意'}`,`成果物: ${stage.deliverable}`,`条件一致候補: ${stage.primary?.service.name??'手動工程'}`,`次の行動: ${stage.nextAction}`,``])].join('\n');
  const copyPlan=async()=>{try{await navigator.clipboard.writeText(planText());setCopyStatus('制作計画をコピーしました')}catch{setCopyStatus('制作計画をコピーできませんでした。')}};
  return <div className="result-shell">
    <header className="result-hero"><p className="eyebrow">YOUR DEVELOPMENT PLAN</p><h1 ref={focusRef} tabIndex={-1}>あなた向け<br/><span>AI開発構成</span></h1><p className="lead">最初の行動は、企画の完成条件を1ページにまとめ、最小の操作だけを含むプロトタイプを作ることです。</p><div className="hero-actions"><a className="button" href="#production-map">工程を始める</a><button className="button ghost" onClick={onEdit}>条件を編集</button><button className="text-link share-button" onClick={share}>URLをコピー</button></div><p className="copy-status" aria-live="polite">{copyStatus}</p></header>
    <section className="result-overview" aria-labelledby="answer-summary"><p className="section-label">YOUR ANSWERS & ASSUMPTIONS</p><h2 id="answer-summary">回答と計画の前提</h2><p><strong>値の出所:</strong> {assumptionSource}。推測で料金や利用条件を補っていません。</p><dl className="requirement-summary"><div><dt>ゲーム</dt><dd>{display.gameType[input.gameType]}</dd></div><div><dt>ジャンル</dt><dd>{display.genre[input.genre]}</dd></div><div><dt>公開先</dt><dd>{display.platform[input.platform]}</dd></div><div><dt>エンジン</dt><dd>{display.engine[input.engine]}</dd></div><div><dt>予算</dt><dd>{display.budget[input.budget]}</dd></div><div><dt>必要素材</dt><dd>{input.assetRequirements.join('、')||'指定なし'}</dd></div><div><dt>音声</dt><dd>{display.need[input.voiceRequirement]}</dd></div><div><dt>音楽・効果音</dt><dd>{display.need[input.musicRequirement]}</dd></div><div><dt>必須工程</dt><dd>{required.map(s=>labels[s.stage]).join('、')}</dd></div><div><dt>任意工程</dt><dd>{optional.map(s=>labels[s.stage]).join('、')||'なし'}</dd></div><div><dt>対象外</dt><dd>{excluded.map(s=>labels[s.stage]).join('、')||'なし'}</dd></div></dl><ManualFoundation/><div className="critical-checks"><strong>開始前の重要確認</strong><ul><li>商用目的: {input.commercialIntent==='commercial'?'商用。各候補の規約を契約前に確認':'非商用または未定。公開前に用途を再確認'}</li><li>予算方針: {input.budget==='free'?'無料枠が確認できる候補を優先':'表示価格は公式情報で再確認'}</li><li>不明・条件付き情報は候補カードの公式ソースで確認</li></ul></div></section>
    <nav className="result-jumps" aria-label="結果内ナビゲーション"><a href="#production-map">工程マップ</a><a href="#stage-decisions">工程別判断</a><button type="button" onClick={copyPlan}>制作計画をコピー</button></nav>
    <section id="production-map"><p className="section-label">PRODUCTION ORDER</p><h2>制作工程マップ</h2><ol className="production-map">{active.map((s,i)=><li key={s.stage}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{labels[s.stage]}</strong><small>{s.deliverable}</small></div></li>)}</ol><div className="manual-stage"><strong>この計画の進め方</strong>{result.projectGuidance.map(item=><p key={item}>{item}</p>)}</div></section>
    <section><p className="section-label">COST VISIBILITY</p><h2>確認できるコスト情報</h2><p><strong>推薦候補:</strong> 無料プランあり {result.costSummary.freePlanConfirmed}件 / 不明 {result.costSummary.freePlanUnknown}件。確定金額あり {result.costSummary.pricingAmountKnown}件 / 金額未構造化 {result.costSummary.pricingAmountUnknown}件。</p><p><strong>手動確認候補（推薦ではありません）:</strong> 無料プランあり {result.costSummary.reviewFreePlanConfirmed}件 / 不明 {result.costSummary.reviewFreePlanUnknown}件。確定金額あり {result.costSummary.reviewPricingAmountKnown}件 / 金額未構造化 {result.costSummary.reviewPricingAmountUnknown}件。</p><p>{result.costSummary.note}</p></section>
    <section id="stage-decisions"><p className="section-label">STAGE DECISIONS</p><h2>工程ごとの判断と次の行動</h2><div className="stage-results">{active.map((stage,i)=><details key={stage.stage} className="stage-decision" open={i===0}><summary><span>STEP {i+1} · {stage.requirement==='required'?'必須':'任意'}</span><strong>{labels[stage.stage]}</strong><small>{stage.primary?.service.name??'手動工程'}</small></summary><div className="stage-decision-body"><p>{productionStages.find(x=>x.id===stage.stage)?.objective}</p>{stage.primary?<><div className="recommended-tool"><small>条件一致候補</small><h4><Link href={`/tools/${stage.primary.service.slug}`}>{stage.primary.service.name}</Link></h4><p className="candidate-verification">最終確認日: {stage.primary.service.lastVerified} · {stage.primary.service.sources.slice(0,2).map((source,index)=><span key={source.url}>{index?' / ':''}<a href={source.url} target="_blank" rel="noopener">公式{source.type==='pricing'?'料金':'情報'} ↗</a></span>)}</p><CommercialUseNotice service={stage.primary.service}/><p><strong>選定理由:</strong> {stage.primary.reason}</p></div><ResultFacts tool={stage.primary}/>{stage.alternatives[0]&&<div className="alternative"><strong>代替案: <Link href={`/tools/${stage.alternatives[0].service.slug}`}>{stage.alternatives[0].service.name}</Link></strong><CommercialUseNotice service={stage.alternatives[0].service}/><FitFacts tool={stage.alternatives[0]}/>{stage.alternatives[0].service.commercialUse==='conditional'&&<p><strong>商用利用の確認事項:</strong> {stage.alternatives[0].manualChecks.join(' / ')}</p>}<p>{stage.alternatives[0].reason}</p><Link href={`/compare?ids=${stage.primary.service.slug},${stage.alternatives[0].service.slug}&stage=${stage.stage}`}>2候補を比較する →</Link></div>}<OutboundLink service={stage.primary.service} page="builder-result" placement={`stage-${stage.stage}`}/></>:<div className="manual-stage"><strong>手動工程</strong><p>{stage.manualFallback}</p></div>}{stage.reviewCandidates.map(candidate=><div className="alternative" key={candidate.service.slug}><strong>要手動確認（推薦ではありません）: <Link href={`/tools/${candidate.service.slug}`}>{candidate.service.name}</Link></strong><CandidateVerification service={candidate.service}/><FitFacts tool={candidate}/><p>{candidate.reason}</p><p>{candidate.manualChecks.join(' / ')}</p></div>)}<dl className="decision-facts"><div><dt>成果物</dt><dd>{stage.deliverable}</dd></div><div><dt>完了条件</dt><dd>{stage.acceptanceCriteria.join(' / ')}</dd></div><div><dt>次工程への受け渡し</dt><dd>{stage.handoff}</dd></div><div><dt>人が行う作業</dt><dd>{stage.manualTasks.join(' / ')}</dd></div></dl><div className="stage-next"><strong>次の行動</strong><p>{stage.nextAction}</p></div></div></details>)}</div></section>
    <section className="result-next"><h2>この構成を出発点にする</h2><p>候補は入力条件と掲載済み情報による判断です。契約前に各公式情報を確認し、小さな試作で適合性を検証してください。</p>{closestStack&&<p>近い既成例は「{closestStack.title}」です。<strong>既成例であり、現在の入力条件から生成した推薦ではありません。</strong></p>}<div className="hero-actions">{compareIds.length>0&&<Link className="button" href={`/compare?ids=${compareIds.join(',')}`} onClick={()=>track('compare_start',{services:compareIds,page:'/builder'})}>{primaryIds.length?'推薦候補を確認する':'手動確認候補を比較する'}</Link>}{closestStack?<Link className={compareIds.length?'button ghost':'button'} href={`/stacks/${closestStack.slug}`}>近い既成Stackを見る</Link>:<Link className="button" href="/stacks">既成Stackを見る</Link>}</div></section>
  </div>
}
function FitFacts({tool}:{tool:NonNullable<ReturnType<typeof recommendProject>['stages'][number]['primary']>}) { return <div className="fit-summary"><p><strong>プロジェクト適合度: {tool.hardExclusions.length?'必須条件未確認—推薦対象外':`${tool.fitScore}/100（${tool.fitBand==='strong'?'強い適合':tool.fitBand==='good'?'適合':'要確認'}）`}</strong></p><details><summary>適合度の根拠</summary><p>影響した入力: {tool.inputEffects.join(' / ')||'工程要件のみ'}</p><p>一致: {tool.positiveMatches.join(' / ')}</p>{tool.warnings.length>0&&<p>警告: {tool.warnings.join(' / ')}</p>}{tool.hardExclusions.length>0&&<p>除外理由: {tool.hardExclusions.join(' / ')}</p>}</details></div> }
function ResultFacts({tool}:{tool:ReturnType<typeof recommendProject>['stages'][number]['primary'] extends infer T?NonNullable<T>:never}) { return <><FitFacts tool={tool}/><dl className="decision-facts"><div><dt>根拠</dt><dd>{tool.evidence.length?tool.evidence.join(' / '):'登録済み用途との一致'}</dd></div><div><dt>コスト表示</dt><dd>{tool.costVisibility}</dd></div><div><dt>既知の制約</dt><dd>{tool.limitations.join(' / ')||'掲載済みの制約なし'}</dd></div><div><dt>不明・要確認</dt><dd>{[...tool.unknowns,...tool.manualChecks].join(' / ')||'追加確認なし'}</dd></div></dl></> }

function ManualFoundation(){return <div className="manual-stage"><strong>AI候補とは別に必須の手動基盤</strong><ul>{manualFoundations.map(item=><li key={item}>{item}</li>)}</ul><p>特定ベンダーは推薦しません。制作開始時に担当・保存場所・確認手順を決めてください。</p></div>}

function CommercialUseNotice({service}:{service:ReturnType<typeof recommendProject>["stages"][number]["reviewCandidates"][number]["service"]}) {
  if(service.commercialUse!=='conditional') return null;
  const terms=service.sources.find(source=>source.type==='terms');
  return <p className="critical-checks"><strong>商用利用: 条件付き</strong> — 無条件の商用利用可ではありません。{terms?<a href={terms.url} target="_blank" rel="noopener">公式規約で対象プランと生成時点の条件を確認 ↗</a>:'公式規約で対象プランと生成時点の条件を確認してください。'}</p>;
}

function CandidateVerification({service}:{service:ReturnType<typeof recommendProject>["stages"][number]["reviewCandidates"][number]["service"]}) { return <p className="candidate-verification">最終確認日: {service.lastVerified} · {service.sources.map((source,index)=><span key={source.url}>{index?' / ':''}<a href={source.url} target="_blank" rel="noopener">公式{source.type==='pricing'?'料金':source.type==='terms'?'規約':'情報'} ↗</a></span>)}</p> }
