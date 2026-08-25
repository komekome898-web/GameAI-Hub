'use client';
import { useEffect,useMemo,useState } from 'react';
import Link from 'next/link';
import { usePathname,useRouter,useSearchParams } from 'next/navigation';
import type { Service } from '@/lib/schema';
import { track } from '@/lib/analytics';

export function ToolsExplorer({services,initialCategory='すべて'}:{services:Service[];initialCategory?:string}){
  const router=useRouter();const pathname=usePathname();const params=useSearchParams();
  const categories=useMemo(()=>['すべて',...new Set(services.map(s=>s.category))],[services]);
  const validCategory=(value:string|null)=>value&&categories.includes(value)?value:'すべて';
  const [query,setQuery]=useState(()=>params.get('q')??'');
  const [category,setCategory]=useState(()=>validCategory(params.get('category')??initialCategory));
  useEffect(()=>{
    // URL navigation is an external state change; keep the editable controls in sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(params.get('q')??'');const nextCategory=params.get('category');setCategory(nextCategory&&categories.includes(nextCategory)?nextCategory:'すべて');
  },[params,categories]);
  useEffect(()=>{const next=new URLSearchParams(params.toString());if(query)next.set('q',query);else next.delete('q');if(category==='すべて')next.delete('category');else next.set('category',category);const href=next.size?`${pathname}?${next}`:pathname;const current=`${pathname}${params.size?`?${params}`:''}`;if(href!==current)router.replace(href,{scroll:false})},[category,query,pathname,router,params]);
  const shown=useMemo(()=>services.filter(s=>(category==='すべて'||s.category===category)&&(`${s.name} ${s.summary} ${s.primaryUses.join(' ')}`.toLowerCase().includes(query.toLowerCase()))),[services,query,category]);
  return <>
    <div className="filter-panel">
      <div className="filter-copy"><span>TOOL DIRECTORY</span><strong>構成候補を個別に調べる</strong></div>
      <label>キーワード<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="音声、3D、コード…"/></label>
      <label>カテゴリ<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
    </div>
    <div className="results-head"><p aria-live="polite"><strong>{shown.length}</strong> 件のツール{category!=='すべて'&&<>（{category}）</>}</p><span>構成全体を決める場合は<Link href="/builder">Builderへ</Link></span></div>
    <div className="cards">{shown.map(s=><article className="card" key={s.id}>
      <div className="card-top"><span className="tag">{s.category}</span><span className={`status ${s.verificationStatus}`}>{s.verificationStatus==='verified'?'検証済み':'確認中'}</span></div>
      <h2><Link href={`/tools/${s.slug}`}>{s.name}</Link></h2>
      <p className="card-summary">{s.summary}</p>
      <dl className="mini"><div><dt>無料枠</dt><dd>{label(s.freePlan)}</dd></div><div><dt>商用利用</dt><dd>{label(s.commercialUse)}</dd></div><div><dt>API</dt><dd>{label(s.api)}</dd></div></dl>
      <div className="card-actions"><Link className="text-link" href={`/tools/${s.slug}`}>詳細を見る →</Link><Link className="compare-link" href={`/compare?ids=${s.slug}`} onClick={()=>track('compare_start',{services:[s.slug],page:'/tools'})}>比較に追加</Link></div>
    </article>)}</div>
    {!shown.length&&<div className="no-results"><strong>該当するツールがありません</strong><p>キーワードまたはカテゴリを変更してください。</p><button className="button ghost" type="button" onClick={()=>{setQuery('');setCategory('すべて')}}>条件をすべて解除</button></div>}
  </>
}

export const label=(v:string)=>({yes:'あり',no:'なし',conditional:'条件付き',unknown:'不明',not_applicable:'対象外'}[v]??v);
