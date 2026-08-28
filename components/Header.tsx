'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const links=[['/project','プロジェクト'],['/tools','目的からAIを探す'],['/compare','比較'],['/guides','ガイド']] as const;
export function Header(){
  const [open,setOpen]=useState(false);const pathname=usePathname();
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" href="/" aria-label="GameAI Hub ホーム"><span className="brand-mark">G</span><span className="brand-copy"><strong>GameAI Hub</strong><small>BUILD COPILOT</small></span></Link>
      <nav className="main-nav" aria-label="メインナビゲーション">{links.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}>{label}</Link>)}</nav>
      <Link className="header-cta" href="/project">ゲームの計画を作る</Link>
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open?'メニューを閉じる':'メニューを開く'} onClick={()=>setOpen(value=>!value)}><span aria-hidden="true">{open?'×':'☰'}</span></button>
    </div>
    <div className={`mobile-menu ${open?'is-open':''}`} id="mobile-menu" hidden={!open}><nav aria-label="モバイルナビゲーション">{links.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}<Link className="button" href="/project" onClick={()=>setOpen(false)}>ゲームの計画を作る</Link></nav></div>
  </header>;
}
