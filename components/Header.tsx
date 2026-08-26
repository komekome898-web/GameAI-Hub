import Link from 'next/link';

export function Header(){
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" href="/" aria-label="GameAI Hub ホーム">
        <span className="brand-mark">G</span>
        <span className="brand-copy"><strong>GameAI Hub</strong><small>AI GAME DEV GUIDE</small></span>
      </Link>
      <nav className="main-nav" aria-label="メインナビゲーション">
        <Link href="/project">作る</Link>
        <Link href="/guides">ガイド</Link>
        <Link href="/tools">ツール</Link>
        <Link href="/compare">比較</Link>
      </nav>
      <Link className="header-cta" href="/project">Project Planを作る</Link>
    </div>
  </header>
}
