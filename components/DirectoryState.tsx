import Link from 'next/link';

export function DirectoryState({
  kind,
  title,
  message,
  retry,
}: {
  kind: 'loading' | 'error' | 'empty';
  title: string;
  message: string;
  retry?: () => void;
}) {
  return <section className={`directory-state ${kind}`} role={kind === 'error' ? 'alert' : 'status'} aria-live="polite">
    <p className="section-label">{kind === 'loading' ? 'LOADING' : kind === 'error' ? 'RECOVERY' : 'NO RESULTS'}</p>
    <h2>{title}</h2>
    <p>{message}</p>
    {retry && <button type="button" className="button" onClick={retry}>もう一度読み込む</button>}
    {kind === 'error' && <Link href="/project">自分のProjectに戻る</Link>}
  </section>;
}
