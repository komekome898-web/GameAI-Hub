import type { Metadata } from 'next';
import { ToolsExplorer } from '@/components/ToolsExplorer';
import { getServices } from '@/lib/services';

export const metadata:Metadata={title:'AIゲーム開発ツール一覧',description:'AIゲーム開発ツールを用途・料金・商用利用条件から探せます。',alternates:{canonical:'/tools'},openGraph:{url:'/tools'}};

export default function ToolsPage(){
  const services=getServices();
  return <section className="directory-page">
    <div className="page-hero compact">
      <p className="eyebrow">VERIFIED TOOL DIRECTORY</p>
      <h1>AIゲーム開発ツールを探す</h1>
      <p className="lead">用途、無料枠、商用利用条件を確認しながら、制作フローに合う候補を絞り込めます。</p>
      <div className="directory-meta"><span>{services.length} tools</span><span>公式情報ベース</span><span>最終確認日を掲載</span></div>
    </div>
    <ToolsExplorer services={services}/>
  </section>
}
