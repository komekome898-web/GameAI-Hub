import Link from 'next/link';

export function Header(){
  return <header className="site-header">
    <div className="header-inner">
      <Link className="brand" href="/" aria-label="GameAI Hub ホーム">
        <span className="brand-mark">G</span>
        <span className="brand-copy"><strong>GameAI Hub</strong><small>AI GAME DEV GUIDE</small></span>
      </Link>
      <nav className="main-nav" aria-label="メインナビゲーション">
        <Link href="/builder">構成を作る</Link>
        <Link href="/stacks">Stack</Link>
        <Link href="/compare">比較する</Link>
      </nav>
      <Link className="header-cta" href="/builder">AI開発構成を作る</Link>
    </div>
  </header>
}
