import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CompareClient } from '@/components/CompareClient';
import { getServices } from '@/lib/services';

export const metadata:Metadata={title:'AIゲーム開発ツール比較',description:'最大4つのAIゲーム開発ツールを料金、無料枠、商用利用、API、対応環境で比較。',alternates:{canonical:'/compare'},openGraph:{url:'/compare'},robots:{index:false,follow:true}};

export default function ComparePage(){return <section className="compare-page">
  <div className="page-hero compact">
    <p className="eyebrow">SIDE-BY-SIDE DECISION</p>
    <h1>ツールの違いを、<br/>同じ基準で比較。</h1>
    <p className="lead">最大4件を横並びにして、料金・無料枠・商用利用・API・対応環境の差を確認できます。</p>
    <div className="directory-meta"><span>最大4ツール</span><span>差分を強調</span><span>公式確認日を表示</span></div>
  </div>
  <Suspense fallback={<div className="loading-panel">比較表を読み込んでいます…</div>}><CompareClient services={getServices()}/></Suspense>
</section>}
