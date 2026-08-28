import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareClient } from '@/components/CompareClient';
import { getServices } from '@/lib/services';

export const metadata:Metadata={title:'AIゲーム開発ツール比較',description:'最大4つのAIゲーム開発ツールを料金、無料枠、商用利用、API、対応環境で比較。',alternates:{canonical:'/compare/'},openGraph:{url:'/compare/'},robots:{index:false,follow:true}};

export default function ComparePage(){return <section className="compare-page">
  <div className="page-hero compact">
    <p className="eyebrow">PRODUCTION DECISION</p>
    <h1>この工程なら、<br/>どちらを使う？</h1>
    <p className="lead">まず制作工程に対する判断材料を確認し、その後で料金・権利・APIなどの詳細差分を検証します。</p>
    <div className="directory-meta"><span>最大4ツール</span><span>差分を強調</span><span>公式確認日を表示</span></div>
  </div>
  <Suspense fallback={<div className="loading-panel">比較表を読み込んでいます…</div>}><CompareClient services={getServices()}/></Suspense>
</section>}
