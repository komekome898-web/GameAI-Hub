import Link from 'next/link';

export function Header(){
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" href="/" aria-label="GameAI Hub ホーム">
        <span className="brand-mark">G</span>
        <span className="brand-copy"><strong>GameAI Hub</strong><small>AI GAME DEV GUIDE</small></span>
      </Link>
      <nav className="main-nav" aria-label="メインナビゲーション">
        <Link href="/tools">ツールを探す</Link>
        <Link href="/compare">比較する</Link>
        <Link href="/methodology">調査方法</Link>
      </nav>
      <Link className="header-cta" href="/compare">比較を始める</Link>
    </div>
  </header>
}
