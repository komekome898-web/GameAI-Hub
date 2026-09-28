import type { ReactNode } from "react";
import type { ArticleRecord } from "@/data/articles";

export function ArticleHeader({
  article,
  eyebrow,
  title,
  lead,
  promoted = false,
  children,
}: {
  article: ArticleRecord;
  eyebrow: string;
  title: string;
  lead: ReactNode;
  promoted?: boolean;
  children?: ReactNode;
}) {
  return (
    <header className="page-head article-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lead">{lead}</p>
      <p className="article-header-meta">
        <span>更新 {article.updatedAt}</span>
        {article.lastVerifiedAt && (
          <span>公式情報の最終確認 {article.lastVerifiedAt}</span>
        )}
      </p>
      {promoted && (
        <p className="affiliate-disclosure-note">
          <strong>この記事にはプロモーションを含みます。</strong>
        </p>
      )}
      {children}
    </header>
  );
}
