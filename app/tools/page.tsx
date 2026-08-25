import type { Metadata } from 'next';import { ToolsExplorer } from '@/components/ToolsExplorer';import { getServices } from '@/lib/services';
export const metadata:Metadata={title:'AIゲーム開発ツール一覧',description:'AIゲーム開発ツールを用途・料金・商用利用条件から探せます。',alternates:{canonical:'/tools'},openGraph:{url:'/tools'}};
export default function ToolsPage(){return <section><p className="eyebrow">VERIFIED TOOL DIRECTORY</p><h1>AIゲーム開発ツールを探す</h1><p className="lead">掲載数ではなく、ゲーム制作工程をカバーする8サービスから開始しています。</p><ToolsExplorer services={getServices()}/></section>}
