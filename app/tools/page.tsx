import type { Metadata } from 'next';
import { ToolsExplorer } from '@/components/ToolsExplorer';
import { getServices } from '@/lib/services';
import { Suspense } from 'react';

export const metadata:Metadata={title:'作りたいものからAIツールを探す',description:'コード、声、2D、3Dなど作りたい成果物からAIゲーム開発ツールを絞り、公式根拠と未確認条件を調べられます。',alternates:{canonical:'/tools/'},openGraph:{url:'/tools/'}};

export default function ToolsPage(){
  const services=getServices();
  return <section className="directory-page">
    <div className="page-hero compact">
      <p className="eyebrow">PRODUCTION TOOL INDEX</p>
      <h1>何を作りたいですか？</h1>
      <p className="lead">ツール名ではなく、次に作る成果物から候補を探します。未確認の価格や商用条件は不明のまま表示します。</p>
      <div className="directory-meta"><span>{services.length} tools</span><span>公式ソースを掲載</span><span>未確認を明示</span></div>
    </div>
    <Suspense fallback={<div className="loading-panel">ツールを読み込んでいます…</div>}><ToolsExplorer services={services}/></Suspense>
  </section>
}
