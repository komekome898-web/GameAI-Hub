import Link from 'next/link';
export function Header(){return <header className="header"><Link className="brand" href="/">GameAI Hub</Link><nav aria-label="メインナビゲーション"><Link href="/tools">ツール</Link><Link href="/compare">比較</Link><Link href="/methodology">調査方法</Link></nav></header>}
