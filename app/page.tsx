import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectIdeaForm } from '@/components/ProjectGeneratorClient';

export const metadata:Metadata={title:'ゲームのアイデアから実行計画を作る',description:'作りたいゲームを説明すると、最初のプレイ可能範囲、制作ロードマップ、Codex向け指示、必要素材と確認事項を組み立てます。',alternates:{canonical:'/'},openGraph:{url:'/'}};

export default function Home(){
  return <>
    <section className="project-home-hero">
      <div className="project-home-copy"><p className="eyebrow">AI GAME PROJECT GENERATOR</p><h1>どんなゲームを<br/>作りたいですか？</h1><p className="lead">アイデアを、最初に作る範囲・制作順・Codexへ渡す指示・必要素材・リスクまで含む実行計画に変えます。</p></div>
      <ProjectIdeaForm location="home"/>
    </section>
    <section className="project-value"><div className="section-head"><div><p className="eyebrow">YOUR PROJECT PLAN</p><h2>ツール一覧ではなく、制作を始めるための成果物</h2></div></div><div className="project-value-grid"><article><span>01</span><h3>最初のプレイ可能範囲</h3><p>最初に作る場面、含めない機能、完了条件を明確にします。</p></article><article><span>02</span><h3>制作ロードマップ</h3><p>依存関係、手動作業、引き渡し条件を工程順に整理します。</p></article><article><span>03</span><h3>実作業へ渡せる指示</h3><p>Codex向け実装brief、最初のタスク、素材チェックリストをコピーできます。</p></article></div></section>
    <section className="decision-paths"><div><p className="eyebrow">SUPPORTING RESEARCH</p><h2>候補を検証したいとき</h2><p>既成Stack、ツール詳細、比較表は生成した計画を検証するために利用できます。</p></div><div className="hero-actions"><Link className="button ghost" href="/stacks">既成Stackを見る</Link><Link className="text-link" href="/tools">ツール情報を見る →</Link></div></section>
  </>;
}
