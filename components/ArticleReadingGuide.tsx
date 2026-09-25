"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ArticleRecord } from "@/data/articles";

type Entry = { id: string; label: string };

function headingId(text: string, index: number) {
  const compact = text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return `section-${compact || index + 1}`;
}

export function ArticleReadingGuide({ article }: { article: ArticleRecord }) {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  useEffect(() => {
    const content = document.querySelector(".article-content");
    const header = content?.querySelector(":scope > .page-head");
    if (!content || !header) return;
    const headings = Array.from(
      content.querySelectorAll(":scope > section > h2"),
    );
    const used = new Set<string>();
    const next = headings.map((heading, index) => {
      const label = heading.textContent?.trim() || `セクション ${index + 1}`;
      let id = heading.id || headingId(label, index);
      let suffix = 2;
      while (used.has(id)) id = `${headingId(label, index)}-${suffix++}`;
      used.add(id);
      heading.id = id;
      return { id, label };
    });
    const node = document.createElement("div");
    node.dataset.articleReadingGuide = "true";
    header.insertAdjacentElement("afterend", node);
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setEntries(next);
        setMount(node);
      }
    });
    return () => {
      active = false;
      node.remove();
    };
  }, []);
  if (!mount) return null;
  const audience =
    article.category === "beginner"
      ? "AIゲーム制作を初めて試す人"
      : article.category === "tool"
        ? "このツールをゲーム制作へ採用するか判断したい人"
        : "次の制作判断を具体化したい人";
  return createPortal(
    <aside className="article-reading-guide" aria-label="この記事の読み方">
      <div className="article-answer">
        <span>先に要点</span>
        <p>{article.description}</p>
        <small>対象: {audience}</small>
      </div>
      {entries.length > 2 && (
        <nav className="article-toc" aria-label="この記事の目次">
          <strong>目次</strong>
          <ol>
            {entries.map((entry) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`} aria-label={`目次: ${entry.label}`}>
                  {entry.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </aside>,
    mount,
  );
}
