import type { Metadata } from 'next';
import Link from 'next/link';
import { guides } from '@/data/guides';
import { GuidesExplorer } from '@/components/GuidesExplorer';
import { Suspense } from 'react';
import { DirectoryState } from '@/components/DirectoryState';
export const metadata:Metadata={title:'AIゲーム開発ガイド',description:'AIを使ったゲーム制作を、成果物・完了条件・検証手順に分けて進める実践ガイド。',alternates:{canonical:'/guides/'},openGraph:{url:'/guides/'}};
export default function GuidesPage(){return <div className="page-shell guides-page"><header className="page-head"><p className="eyebrow">GAME DEVELOPMENT GUIDES</p><h1>今の作業から、<br/>次の成果物へ</h1><p className="lead">制作段階を選び、必要な入力、手順、得られる成果を確認できます。読み物のArticles、製品を選ぶToolsとは役割を分けています。</p></header><Suspense fallback={<DirectoryState kind="loading" title="ガイドを読み込んでいます" message="制作段階ごとの手順を準備中です。"/>}><GuidesExplorer guides={guides}/></Suspense><aside className="directory-method guide-method"><div><p className="section-label">METHOD &amp; CONTINUATION</p><h2>公式情報を確かめ、自分のゲームへ戻る</h2></div><p>各ガイドは参照した公式ソースと最終確認日を示します。<Link href="/methodology">調査方法</Link>を確認できます。</p><Link className="button secondary" href="/project">自分のProjectで次の作業を決める</Link></aside></div>}
