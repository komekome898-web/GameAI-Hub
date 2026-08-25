'use client';
import { useEffect,useMemo,useRef,useState } from 'react';
import { usePathname,useRouter,useSearchParams } from 'next/navigation';
import type { Service } from '@/lib/schema';
import { track } from '@/lib/analytics';import { label } from './ToolsExplorer';import { OutboundLink } from './OutboundLink';
const rows:[string,(s:Service)=>string][]=[['料金',s=>s.pricing],['無料枠',s=>label(s.freePlan)],['商用利用',s=>label(s.commercialUse)],['API',s=>label(s.api)],['ゲームエンジン',s=>s.engines.join('、')||'不明'],['プラットフォーム',s=>s.platforms.join('、')||'不明'],['主用途',s=>s.primaryUses.join('、')||'不明'],['長所',s=>s.strengths.join('。')||'不明'],['制約・弱点',s=>s.weaknesses.join('。')||'不明'],['最終確認日',s=>s.lastVerified]];
const normalize=(raw:string[],services:Service[])=>[...new Set(raw)].filter(id=>services.some(s=>s.slug===id)).slice(0,4);
const viewedCompareKeys = new Set<string>();
function VerificationLinks({service}:{service:Service}) {
  const checks:string[]=[];
  if(service.freePlan==='unknown'||service.freePlan==='conditional')checks.push('無料枠の対象機能・利用上限');
  if(service.commercialUse==='unknown'||service.commercialUse==='conditional')checks.push('生成時プランの商用利用条件・権利範囲');
  if(service.api==='unknown'||service.api==='conditional')checks.push('API提供有無・対象プラン・利用上限');
  const sources=service.sources.filter(source=>source.type==='pricing'||source.type==='terms');
  if(!checks.length&&!sources.length)return null;
  return <div className="compare-verification"><strong>契約前の公式確認</strong>{checks.length>0&&<ul>{checks.map(check=><li key={check}>{check}</li>)}</ul>}<p>{sources.map((source,index)=><span key={source.url}>{index>0?' / ':''}<a href={source.url} target="_blank" rel="noopener">{source.type==='pricing'?'公式料金':'公式規約'} ↗</a></span>)}</p></div>;
}
export function CompareClient(props:{services:Service[];initial?:string[]}){const params=useSearchParams();return <CompareClientState {...props} key={params.toString()} params={params}/>}
function CompareClientState({services,initial,params}:{services:Service[];initial?:string[];params:Readonly<URLSearchParams>}){
  const router=useRouter();const pathname=usePathname();const raw=params.get('ids');
  const defaults=initial??['github-copilot','cursor'];
  const [ids,setIds]=useState(()=>normalize(raw===null?defaults:raw.split(',').filter(Boolean),services));
  const [differencesOnly,setDifferencesOnly]=useState(false);
  const differenceCount=useMemo(()=>rows.filter(([,get])=>new Set(ids.map(id=>services.find(s=>s.slug===id)).filter((s):s is Service=>Boolean(s)).map(get)).size>1).length,[ids,services]);
  const selected=useMemo(()=>ids.map(id=>services.find(s=>s.slug===id)).filter((s):s is Service=>Boolean(s)),[ids,services]);
  const orderedRows=useMemo(()=>[...rows].sort((a,b)=>Number(new Set(selected.map(b[1])).size>1)-Number(new Set(selected.map(a[1])).size>1)),[selected]);
  const stage=params.get('stage');
  useEffect(()=>{const next=new URLSearchParams(params.toString());if(ids.length)next.set('ids',ids.join(','));else next.delete('ids');const href=next.size?`${pathname}?${next}`:pathname;const current=`${pathname}${params.size?`?${params}`:''}`;if(href!==current)router.replace(href,{scroll:false})},[ids,pathname,router,params]);
  const lastViewed=useRef('');
  useEffect(()=>{const key=selected.map(s=>s.slug).join(',');if(key&&key!==lastViewed.current&&!viewedCompareKeys.has(key)){lastViewed.current=key;viewedCompareKeys.add(key);track('compare_view',{services:selected.map(s=>s.slug),page:'/compare'})}},[selected]);
  function toggle(id:string){setIds(old=>old.includes(id)?old.filter(x=>x!==id):old.length<4?[...old,id]:old)}
  return <>
    {stage&&<div className="compare-context" role="status"><strong>Builderの工程から比較しています。</strong><a href={`/builder?stage=${encodeURIComponent(stage)}`}>条件を編集する →</a></div>}
    <div className="compare-selection-head"><p role="status" aria-live="polite"><strong>{selected.length} / 4</strong> 件を選択中。{selected.length>=4?'上限に達しました。解除すると別のツールを選べます。':`あと${4-selected.length}件選べます。`}</p>{selected.length>0&&<button type="button" onClick={()=>setIds([])}>すべて解除</button>}</div>
    <fieldset className="picker"><legend>比較するツール</legend>{services.map(s=>{const blocked=!ids.includes(s.slug)&&ids.length>=4;return <label key={s.id} title={blocked?'最大4件まで比較できます':undefined}><input type="checkbox" checked={ids.includes(s.slug)} disabled={blocked} onChange={()=>toggle(s.slug)}/>{s.name}{blocked&&<span className="sr-only">（上限のため選択できません）</span>}</label>})}</fieldset>
    {selected.length<2&&<p className="notice">あと{2-selected.length}件選ぶと違いを比較できます。選択が0件でも、上の候補から再開できます。</p>}
    {selected.length>=2&&<div className="compare-view-options"><label><input type="checkbox" checked={differencesOnly} onChange={event=>setDifferencesOnly(event.target.checked)}/> 差分のみ表示</label><span role="status" aria-live="polite">{differencesOnly?'差分のみ表示中。':'全項目を表示中。'}{differenceCount}項目に差分</span></div>}
    <div className="compare-scroll"><table><caption>差分のある項目を先に、共通項目を後に表示します。</caption><thead><tr><th scope="col">比較項目</th>{selected.map(s=><th scope="col" key={s.id}>{s.name}<button className="compare-remove" type="button" onClick={()=>toggle(s.slug)} aria-label={`${s.name}を比較から解除`}>解除</button></th>)}</tr></thead><tbody>{orderedRows.map(([name,get])=>{const values=selected.map(get);const differs=new Set(values).size>1;if(differencesOnly&&!differs)return null;return <tr key={name} className={differs?'different':''}><th scope="row">{name}{differs&&<span className="diff">差分</span>}</th>{selected.map((s,i)=><td key={s.id}>{values[i]}</td>)}</tr>})}<tr><th scope="row">公式確認</th>{selected.map(s=><td key={s.id}><VerificationLinks service={s}/></td>)}</tr><tr><th scope="row">次の行動</th>{selected.map(s=><td key={s.id}><OutboundLink service={s} page="/compare" placement="table"/></td>)}</tr></tbody></table></div>
    <section className="compare-mobile" aria-labelledby="mobile-compare-heading"><h2 id="mobile-compare-heading" className="sr-only">選択したツールの比較結果</h2>{selected.length===2?<div className="paired-fields">{orderedRows.map(([name,get])=>{const differs=new Set(selected.map(get)).size>1;if(differencesOnly&&!differs)return null;return <section key={name} className={differs?'different':''}><h3>{name}{differs&&<span className="diff">差分</span>}</h3><div>{selected.map(service=><dl key={service.id}><dt>{service.name}</dt><dd>{get(service)}</dd></dl>)}</div></section>})}{selected.map(service=><article key={service.id}><h3>{service.name}の公式確認と次の行動</h3><VerificationLinks service={service}/><OutboundLink service={service} page="/compare" placement="mobile-paired"/></article>)}</div>:selected.map(s=><article key={s.id}><header><h2>{s.name}</h2><button type="button" onClick={()=>toggle(s.slug)}>比較から解除</button></header><dl>{orderedRows.map(([name,get])=>{const differs=new Set(selected.map(get)).size>1;if(differencesOnly&&!differs)return null;return <div key={name} className={differs?'different':''}><dt>{name}{differs&&<span className="diff">差分</span>}</dt><dd>{get(s)}</dd></div>})}</dl><VerificationLinks service={s}/><OutboundLink service={s} page="/compare" placement="mobile-card"/></article>)}</section>
  </>
}
