import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '@/data/guides';
export const metadata:Metadata={title:'AIゲーム開発ガイド',description:'AIを使ったゲーム制作を、成果物・完了条件・検証手順に分けて進める実践ガイド。',alternates:{canonical:'/guides/'},openGraph:{url:'/guides/'}};
export default function GuidesPage(){return <div className="page-shell"><header className="page-head"><p className="eyebrow">GAME DEVELOPMENT GUIDES</p><h1>読むためではなく、<br/>作業を進めるガイド</h1><p className="lead">各ガイドはツール一覧ではなく、最初の成果物、完了条件、失敗しやすい点を整理します。条件に合う計画はProject Generatorで作成できます。</p><Link className="button" href="/project">自分のProject Planを作る</Link></header><section><div className="stack-mini-grid">{guides.map(guide=><Link key={guide.slug} href={`/guides/${guide.slug}`}><span>最終確認: {guide.lastVerified}</span><h2>{guide.title}</h2><p>{guide.description}</p><b>制作手順を見る →</b></Link>)}</div></section></div>}
