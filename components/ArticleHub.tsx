"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { CreationDeck, type CreationDeckItem } from './CreationDeck';

export type HubGroup = { id: string; title: string; description: string; items: CreationDeckItem[] };
type Memory = { view: string; articles: Record<string, string>; category: string; categoryScroll: number };
type Selection = { view: string; article?: string; revision: number };
const storageKey = 'gameai-article-hub';
const emptyMemory = (): Memory => ({ view: 'categories', articles: {}, category: '', categoryScroll: 0 });

export function ArticleHub({ groups }: { groups: HubGroup[] }) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const memory = useRef<Memory>(emptyMemory());
  const region = useRef<HTMLDivElement>(null);
  const all = groups.flatMap(group => group.items);
  const persist = useCallback(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(memory.current)); } catch { /* in-memory fallback */ }
  }, []);

  useEffect(() => {
    const allItems = groups.flatMap(group => group.items);
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
      if (saved && typeof saved.view === 'string' && saved.articles && typeof saved.articles === 'object') {
        memory.current = { view: saved.view, articles: saved.articles, category: typeof saved.category === 'string' ? saved.category : '', categoryScroll: Number.isFinite(saved.categoryScroll) ? saved.categoryScroll : 0 };
      }
    } catch { /* corrupt/unavailable storage starts at categories */ }
    const restore = () => {
      const url = new URL(location.href);
      const explicit = Boolean(url.hash);
      const requested = explicit ? url.hash.slice(1) : memory.current.view;
      const group = groups.find(group => group.id === requested && group.items.length);
      const view = group?.id ?? (requested === 'all' ? 'all' : 'categories');
      const items = view === 'all' ? allItems : group?.items ?? [];
      const requestedArticle = url.searchParams.get('hubArticle') ?? (explicit ? undefined : memory.current.articles[view]);
      const article = items.find(item => item.id === requestedArticle)?.id ?? items[0]?.id;
      // Give even the initial entry an explicit identity: Back must not consult
      // the newer session view when returning to the original category screen.
      url.hash = view;
      if (article) url.searchParams.set('hubArticle', article); else url.searchParams.delete('hubArticle');
      history.replaceState(history.state, '', url);
      if (group && memory.current.category !== group.id) {
        memory.current.category = group.id;
        memory.current.categoryScroll = -1; // no category-screen position for this URL yet
      }
      memory.current.view = view;
      if (article) memory.current.articles[view] = article;
      setSelection(old => ({ view, article, revision: (old?.revision ?? 0) + 1 }));
    };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', restore); };
  }, [groups]);

  useEffect(() => {
    if (!selection) return;
    // Next route restoration may focus its heading during commit. Restore our
    // specific anchor after that commit, cancelling when navigation changes.
    let secondFrame = 0;
    let interrupted = false;
    const stopFocus = () => { interrupted = true; };
    window.addEventListener('pointerdown', stopFocus, true);
    window.addEventListener('keydown', stopFocus, true);
    const firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => {
    window.removeEventListener('pointerdown', stopFocus, true);
    window.removeEventListener('keydown', stopFocus, true);
    if (interrupted) return;
    const root = region.current;
    if (selection.view === 'categories') {
      const link = Array.from(root?.querySelectorAll<HTMLAnchorElement>('a[data-category]') ?? []).find(link => link.dataset.category === memory.current.category);
      if (link) {
        link.focus({ preventScroll: true });
        if (memory.current.categoryScroll >= 0) window.scrollTo({ top: memory.current.categoryScroll, behavior: 'instant' });
        else link.scrollIntoView({ block: 'center', behavior: 'instant' });
      }
    } else if (selection.article) {
      const link = Array.from(root?.querySelectorAll<HTMLAnchorElement>('[data-deck-id] a') ?? []).find(link => link.closest<HTMLElement>('[data-deck-id]')?.dataset.deckId === selection.article);
      link?.focus({ preventScroll: true });
      // SSR contains every category for no-JS access. Its original hash scroll
      // is no longer meaningful after selecting just one category.
      link?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    }); });
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); window.removeEventListener('pointerdown', stopFocus, true); window.removeEventListener('keydown', stopFocus, true); };
  }, [selection]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, view: string) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (selection?.view === 'categories') {
      memory.current.category = view;
      memory.current.categoryScroll = scrollY;
    }
    const items = view === 'all' ? all : groups.find(group => group.id === view)?.items ?? [];
    const article = items.find(item => item.id === memory.current.articles[view])?.id ?? items[0]?.id;
    memory.current.view = view;
    const url = new URL(location.href);
    url.hash = view;
    if (article) url.searchParams.set('hubArticle', article); else url.searchParams.delete('hubArticle');
    history.pushState(null, '', url);
    persist();
    setSelection(old => ({ view, article, revision: (old?.revision ?? 0) + 1 }));
  };
  const rememberArticle = useCallback((id: string) => {
    const view = memory.current.view;
    if (view === 'categories') return;
    memory.current.articles[view] = id;
    const url = new URL(location.href);
    if (url.pathname.replace(/\/$/, '') !== '/articles') return;
    url.hash = view;
    url.searchParams.set('hubArticle', id);
    history.replaceState(history.state, '', url);
    persist();
  }, [persist]);
  const view = selection?.view;
  const visibleGroups = !selection ? groups.filter(g => g.items.length) : groups.filter(g => g.id === view);
  return <div ref={region} className="article-hub-browser" id={!selection ? "all" : undefined}>
    {(!selection || view === 'categories') && <section id="categories" aria-label="制作目的から記事を選ぶ">
      <div className="hub-category-grid">{groups.map(group => <div key={group.id} className="hub-category-card">
        {group.items.length ? <a href={`#${group.id}`} data-category={group.id} onClick={event => navigate(event, group.id)}><h2>{group.title}</h2><p>{group.description}</p><strong>{group.items.length}本の記事 →</strong></a> : <div aria-disabled="true"><h2>{group.title}</h2><p>{group.description}</p><strong>準備中 · {group.items.length}件</strong></div>}
      </div>)}</div>
    </section>}
    <nav className="hub-view-navigation" aria-label="記事の表示">
      {selection && view !== 'categories' && <a href="#categories" onClick={event => navigate(event, 'categories')}>← カテゴリへ戻る</a>}
      {view !== 'all' && <a href="#all" data-category="all" onClick={event => navigate(event, 'all')}>すべての記事を見る（{all.length}本） →</a>}
    </nav>
    {visibleGroups.map(group => <section key={`${group.id}:${selection?.revision ?? 'ssr'}`} id={group.id} className="article-cluster" aria-labelledby={`${group.id}-title`}>
      <div className="section-head"><div><h2 id={`${group.id}-title`}>{group.title}</h2><span>{group.items.length}本の記事</span></div><p>{group.description}</p></div>
      <CreationDeck items={group.items} initialId={selection?.article} defaultMode={selection ? "deck" : "list"} onCommitted={selection ? rememberArticle : undefined} onOpen={rememberArticle} />
    </section>)}
    {view === 'all' && <section id="all" className="article-cluster" aria-labelledby="all-title"><h2 id="all-title">すべての記事（{all.length}本）</h2>
      <CreationDeck key={`all:${selection?.revision ?? 'ssr'}`} items={all} initialId={selection?.article} forceList onOpen={rememberArticle} />
    </section>}
  </div>;
}
