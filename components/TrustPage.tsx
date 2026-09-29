import type { ReactNode } from 'react';

type TrustSection = { id: string; label: string; content: ReactNode };

export function TrustPage({ eyebrow, title, summary, updated, sections }: {
  eyebrow: string;
  title: string;
  summary: ReactNode;
  updated?: string;
  sections: TrustSection[];
}) {
  return <article className="trust-page">
    <header className="trust-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="trust-summary">{summary}</div>
      {updated && <p className="trust-updated">最終更新: <time>{updated}</time></p>}
    </header>
    <nav className="trust-nav" aria-label={`${title}の目次`}>
      <strong>このページで確認する</strong>
      <ol>{sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>)}</ol>
    </nav>
    <div className="trust-sections">
      {sections.map(section => <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
        <h2 id={`${section.id}-title`}>{section.label}</h2>
        {section.content}
      </section>)}
    </div>
  </article>;
}

export function TrustStatus({ tone, title, children }: { tone: 'verified'|'partial'|'stale'|'unknown'|'neutral'; title: string; children: ReactNode }) {
  return <div className={`trust-status trust-status-${tone}`}><strong>{title}</strong><div>{children}</div></div>;
}
