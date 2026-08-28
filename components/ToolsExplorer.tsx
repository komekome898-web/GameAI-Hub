'use client';
import { useMemo,useState } from 'react';
import Link from 'next/link';
import type { Service } from '@/lib/schema';
import { track } from '@/lib/analytics';

const goals=[
  ['all','すべて'],['code','コード'],['ui','UI'],['character','キャラクター'],['2d','2D画像'],['3d','3Dモデル'],['animation','アニメーション'],['voice','声'],['music','BGM'],['sfx','SFX'],['npc','NPC会話'],['localization','翻訳'],['test','テスト'],['trailer','Trailer'],['store','Store assets']
] as const;
const goalCategories:Record<string,string[]>={code:['coding-agent','ide-ai','general-llm'],ui:['2d-image','concept-art','no-code-low-code'],character:['character-consistency','concept-art','2d-image','3d-model'], '2d':['2d-image','concept-art','texture-material'], '3d':['3d-model','texture-material','rigging'],animation:['animation','rigging'],voice:['voice'],music:['music'],sfx:['sfx'],npc:['npc-dialogue','general-llm'],localization:['localization'],test:['qa-testing'],trailer:['video-trailer'],store:['marketing-store-assets']};
export function ToolsExplorer({services}:{services:Service[];initialCategory?:string}){
  const [goal,setGoal]=useState('all'),[query,setQuery]=useState(''),[free,setFree]=useState(false),[commercial,setCommercial]=useState(false),[api,setApi]=useState(false),[verified,setVerified]=useState(false),[engine,setEngine]=useState('all'),[category,setCategory]=useState('all');
  const engines=useMemo(()=>[...new Set(services.flatMap(s=>s.engines))].sort(),[services]);
  const categories=useMemo(()=>[...new Set(services.map(s=>s.category))].sort(),[services]);
  const shown=useMemo(()=>services.filter(s=>(goal==='all'||goalCategories[goal]?.includes(s.category))&&(category==='all'||s.category===category)&&(!query||`${s.name} ${s.summary} ${s.primaryUses.join(' ')}`.toLowerCase().includes(query.toLowerCase()))&&(!free||s.freePlan==='yes')&&(!commercial||s.commercialUse==='yes')&&(!api||s.api==='yes')&&(!verified||s.verificationStatus==='verified')&&(engine==='all'||s.engines.includes(engine))).sort((a,b)=>a.name.localeCompare(b.name)),[services,goal,category,query,free,commercial,api,verified,engine]);
  const reset=()=>{setGoal('all');setQuery('');setFree(false);setCommercial(false);setApi(false);setVerified(false);setEngine('all');setCategory('all')};
  return <>
    <fieldset className="goal-picker"><legend>何を作りたいですか？</legend>{goals.map(([id,name])=><button key={id} type="button" aria-pressed={goal===id} onClick={()=>setGoal(id)}>{name}</button>)}</fieldset>
    <details className="secondary-filters"><summary>条件で絞り込む</summary><div><label>キーワード<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="用途・ツール名"/></label><label>カテゴリ<select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">すべて</option>{categories.map(value=><option key={value}>{value}</option>)}</select></label><label>エンジン<select value={engine} onChange={e=>setEngine(e.target.value)}><option value="all">すべて</option>{engines.map(value=><option key={value}>{value}</option>)}</select></label><label><input type="checkbox" checked={free} onChange={e=>setFree(e.target.checked)}/>無料枠あり</label><label><input type="checkbox" checked={commercial} onChange={e=>setCommercial(e.target.checked)}/>商用利用可</label><label><input type="checkbox" checked={api} onChange={e=>setApi(e.target.checked)}/>APIあり</label><label><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/>検証済みのみ</label></div></details>
    <div className="results-head"><p aria-live="polite"><strong>{shown.length}</strong> 件の候補</p><span>制作順から決めるなら <Link href="/project">Project Generatorへ</Link></span></div>
    <div className="tool-rows">{shown.map(s=><article key={s.id}><div className="tool-rank"><span>INDEX</span><small>{goal==='all'?'調査候補':'用途カテゴリ一致'}</small></div><div><h2><Link href={`/tools/${s.slug}`}>{s.name}</Link></h2><p>{s.summary}</p></div><dl><div><dt>無料</dt><dd>{label(s.freePlan)}</dd></div><div><dt>商用</dt><dd>{label(s.commercialUse)}</dd></div><div><dt>API</dt><dd>{label(s.api)}</dd></div><div><dt>確認</dt><dd>{s.verificationStatus==='verified'?'検証済み':'要確認'}</dd></div></dl><div className="tool-row-actions"><Link href={`/tools/${s.slug}`}>根拠と制約</Link><Link href={`/compare?ids=${s.slug}`} onClick={()=>track('compare_start',{services:[s.slug],page:'/tools'})}>比較する</Link></div></article>)}</div>
    {!shown.length&&<div className="no-results"><strong>条件に合う候補がありません</strong><p>不明・条件付きの項目を除外している可能性があります。</p><button className="button ghost" onClick={reset}>条件を解除</button></div>}
  </>;
}
export const label=(v:string)=>({yes:'あり',no:'なし',conditional:'条件付き',unknown:'不明',not_applicable:'対象外'}[v]??v);
