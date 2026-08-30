'use client';
import Link from 'next/link';
import { useEffect,useRef,useState } from 'react';
import { usePathname } from 'next/navigation';

const links=[['/project','プロジェクト'],['/tools','目的からAIを探す'],['/compare','比較'],['/guides','ガイド']] as const;
export function Header(){
  const [open,setOpen]=useState(false);const pathname=usePathname();const menuButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!open)return;const onKeyDown=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);menuButton.current?.focus()}};window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown)},[open]);
  const active=(href:string)=>pathname===href||pathname.startsWith(`${href}/`);
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" href="/" aria-label="GameAI Hub ホーム"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M6 7h20v18H6z"/><path d="M10 12h12M10 16h8M10 20h10"/></svg></span><span className="brand-copy"><strong>GameAI Hub</strong><small>ゲーム制作の判断地図</small></span></Link>
      <nav className="main-nav" aria-label="メインナビゲーション">{links.map(([href,label])=><Link key={href} href={href} aria-current={active(href)?'page':undefined}>{label}</Link>)}</nav>
      <Link className="header-cta" href="/project">制作計画を作る <span aria-hidden="true">→</span></Link>
      <button ref={menuButton} className="menu-button" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open?'メニューを閉じる':'メニューを開く'} onClick={()=>setOpen(value=>!value)}><svg aria-hidden="true" viewBox="0 0 24 24">{open?<path d="M6 6l12 12M18 6L6 18"/>:<path d="M4 7h16M4 12h16M4 17h16"/>}</svg></button>
    </div>
    <div className={`mobile-menu ${open?'is-open':''}`} id="mobile-menu" hidden={!open}><nav aria-label="モバイルナビゲーション">{links.map(([href,label])=><Link key={href} href={href} aria-current={active(href)?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}<Link className="button" href="/project" onClick={()=>setOpen(false)}>制作計画を作る</Link></nav></div>
  </header>;
}
