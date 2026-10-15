"use client";

import { useEffect, useRef, useState } from "react";
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
  const toc = useRef<HTMLDetailsElement | null>(null);
  useEffect(() => {
    const content = document.querySelector(".article-content");
    const header = content?.querySelector(":scope > .page-head");
    if (!content || !header) return;
    const headings = Array.from(
      content.querySelectorAll(":scope > section > h2"),
    );
    content
      .querySelectorAll<HTMLElement>(".article-decision-table")
      .forEach((region) => {
        region.tabIndex = 0;
        region.setAttribute("role", "region");
        region.setAttribute("aria-label", "比較表（横にスクロールできます）");
      });
    content
      .querySelectorAll<HTMLElement>("pre.article-code")
      .forEach((region) => {
        region.tabIndex = 0;
        region.setAttribute("role", "region");
        region.setAttribute("aria-label", "コードまたはプロンプト");
      });
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
  useEffect(() => {
    if (!entries.length || !window.location.hash) return;
    let active = true;
    let generation = 0;
    let userInterrupted = false;
    let frame = 0;
    let timers: number[] = [];
    let stabilityInterval = 0;
    let stabilityTimeout = 0;
    const clearScheduled = () => {
      cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      timers = [];
      window.clearInterval(stabilityInterval);
      window.clearTimeout(stabilityTimeout);
    };
    const revealFragment = (hash: string, scheduledGeneration: number) => {
      if (
        !active ||
        userInterrupted ||
        generation !== scheduledGeneration ||
        window.location.hash !== hash
      )
        return;
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        // Initial/deep-link reconciliation must be immediate. Repeated smooth
        // scrolls can continually restart while layout is settling.
        ?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    };
    const stopForUser = () => {
      userInterrupted = true;
      clearScheduled();
    };
    const schedule = () => {
      clearScheduled();
      userInterrupted = false;
      const hash = window.location.hash;
      const scheduledGeneration = ++generation;
      const reveal = () => revealFragment(hash, scheduledGeneration);
      frame = requestAnimationFrame(reveal);
      timers = [150, 600, 1200, 2000].map((delay) =>
        window.setTimeout(reveal, delay),
      );
      stabilityInterval = window.setInterval(reveal, 250);
      stabilityTimeout = window.setTimeout(
        () => window.clearInterval(stabilityInterval),
        8000,
      );
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>(".article-content img"),
      );
      const mediaReady = images.map((image) =>
        image.complete
          ? Promise.resolve()
          : (image.decode?.().catch(() => undefined) ?? Promise.resolve()),
      );
      void Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        ...mediaReady,
      ]).then(reveal);
    };
    ["pointerdown", "wheel", "touchstart", "keydown"].forEach((type) =>
      window.addEventListener(type, stopForUser, { passive: true }),
    );
    window.addEventListener("hashchange", schedule);
    schedule();
    return () => {
      active = false;
      generation += 1;
      clearScheduled();
      ["pointerdown", "wheel", "touchstart", "keydown"].forEach((type) =>
        window.removeEventListener(type, stopForUser),
      );
      window.removeEventListener("hashchange", schedule);
    };
  }, [entries]);
  useEffect(() => {
    if (!toc.current) return;
    if (typeof window.matchMedia !== "function") return;
    const narrow = window.matchMedia("(max-width: 680px)");
    const sync = () => {
      if (toc.current) toc.current.open = !narrow.matches;
    };
    sync();
    narrow.addEventListener("change", sync);
    return () => narrow.removeEventListener("change", sync);
  }, [mount, entries]);
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
        <span>この記事の答え</span>
        <p>{article.description}</p>
        <small>対象: {audience}</small>
      </div>
      {entries.length > 2 && (
        <nav className="article-toc" aria-label="この記事の目次">
          <details ref={toc} open>
            <summary>手順を見る（{entries.length}項目）</summary>
            <ol>
              {entries.map((entry) => (
                <li key={entry.id}>
                  <a href={`#${entry.id}`}>{entry.label}</a>
                </li>
              ))}
            </ol>
          </details>
        </nav>
      )}
    </aside>,
    mount,
  );
}
