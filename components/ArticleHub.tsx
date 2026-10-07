"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { CreationDeck, type CreationDeckItem } from './CreationDeck';

export type HubGroup = { id: string; title: string; description: string; kind?: "game"; items: CreationDeckItem[] };
type Memory = { view: string; articles: Record<string, string>; category: string; categoryScroll: number };
type Selection = { view: string; article?: string; category?: string; entryHome?: boolean; revision: number };
const emptyMemory = (): Memory => ({ view: 'categories', articles: {}, category: '', categoryScroll: 0 });

export function ArticleHub({ groups, home = false }: { groups: HubGroup[]; home?: boolean }) {
  const storageKey = useCallback(() => home ? "gameai-home-categories" : new URL(location.href).searchParams.get("hubEntry") === "home" ? "gameai-home-article-hub" : "gameai-article-hub", [home]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const memory = useRef<Memory>(emptyMemory());
  const region = useRef<HTMLDivElement>(null);
  const all = groups.filter(group => group.kind !== "game").flatMap(group => group.items);
  const persist = useCallback(() => {
    try { sessionStorage.setItem(storageKey(), JSON.stringify(memory.current)); } catch { /* in-memory fallback */ }
  }, [storageKey]);

  useEffect(() => {
    const allItems = groups.filter(group => group.kind !== "game").flatMap(group => group.items);
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey()) ?? 'null');
      if (saved && typeof saved.view === 'string' && saved.articles && typeof saved.articles === 'object') {
        memory.current = { view: saved.view, articles: saved.articles, category: typeof saved.category === 'string' ? saved.category : '', categoryScroll: Number.isFinite(saved.categoryScroll) ? saved.categoryScroll : 0 };
      }
    } catch { /* corrupt/unavailable storage starts at categories */ }
    const restore = () => {
      const url = new URL(location.href);
      if (home && url.hash && url.hash !== '#categories' && !groups.some(group => `#${group.id}` === url.hash)) return;
      const explicit = Boolean(url.hash);
      const requested = explicit ? url.hash.slice(1) : memory.current.view;
      const group = groups.find(group => group.id === requested && group.items.length);
      const view = home ? 'categories' : group?.id ?? (requested === 'all' ? 'all' : 'categories');
      const category = groups.find(g => g.items.length && g.id === url.searchParams.get('hubCategory'))?.id ?? (home ? group?.id : undefined);
      if (category) memory.current.category = category;
      const items = view === 'all' ? allItems : group?.items ?? [];
      const requestedArticle = url.searchParams.get('hubArticle') ?? (explicit ? undefined : memory.current.articles[view]);
      const article = items.find(item => item.id === requestedArticle)?.id ?? items[0]?.id;
      // Give even the initial entry an explicit identity: Back must not consult
      // the newer session view when returning to the original category screen.
      if (!home || url.hash === '#categories' || category) url.hash = view;
      if (article) url.searchParams.set('hubArticle', article); else url.searchParams.delete('hubArticle');
      history.replaceState(history.state, '', url);
      if (group && memory.current.category !== group.id) {
        memory.current.category = group.id;
        memory.current.categoryScroll = -1; // no category-screen position for this URL yet
      }
      memory.current.view = view;
      if (article) memory.current.articles[view] = article;
      setSelection(old => ({ view, article, category: memory.current.category, entryHome: url.searchParams.get('hubEntry') === 'home', revision: (old?.revision ?? 0) + 1 }));
    };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => { window.removeEventListener('popstate', restore); window.removeEventListener('hashchange', restore); };
  }, [groups, home, storageKey]);

  useEffect(() => {
    if (!selection || (home && location.hash && location.hash !== '#categories')) return;
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
      const link = Array.from(root?.querySelectorAll<HTMLAnchorElement>('[data-deck-id] a[data-category]') ?? []).find(link => link.dataset.category === memory.current.category);
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
      // Centering a tall card can leave its category heading under the sticky
      // header. Reveal that heading only when it is still in the viewport;
      // a later item in the flat list should keep its own restored position.
      const heading = link?.closest('.article-cluster')?.querySelector('h2');
      const header = document.querySelector('.site-header');
      if (heading && header) {
        const title = heading.getBoundingClientRect();
        const headerBottom = header.getBoundingClientRect().bottom;
        if (headerBottom > 0 && title.bottom > 0 && title.top < headerBottom + 16)
          window.scrollBy({ top: title.top - headerBottom - 16, behavior: 'instant' });
      }
    }
    }); });
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); window.removeEventListener('pointerdown', stopFocus, true); window.removeEventListener('keydown', stopFocus, true); };
  }, [selection, home]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, view: string) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    // List activation does not commit ring selection. Update the originating
    // entry before navigating so Back's explicit URL agrees with its memory.
    if (memory.current.view === 'categories' && groups.some(group => group.id === view && group.items.length)) rememberCategory(view);
    if (home) {
      if (groups.some(group => group.id === view && group.items.length)) memory.current.category = view;
      memory.current.categoryScroll = scrollY;
      persist();
      return;
    }
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
    if (groups.some(group => group.id === view && group.items.length)) url.searchParams.set('hubCategory', view);
    else if (view === 'categories' && memory.current.category) url.searchParams.set('hubCategory', memory.current.category);
    if (article) url.searchParams.set('hubArticle', article); else url.searchParams.delete('hubArticle');
    history.pushState(null, '', url);
    persist();
    setSelection(old => ({ view, article, category: memory.current.category, entryHome: url.searchParams.get('hubEntry') === 'home', revision: (old?.revision ?? 0) + 1 }));
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
  const rememberCategory = useCallback((id: string) => {
    const url = new URL(location.href);
    if (memory.current.view !== "categories" || (home ? url.pathname !== "/" : url.pathname.replace(/\/$/, "") !== "/articles")) return;
    memory.current.category = id;
    url.searchParams.set('hubCategory', id);
    history.replaceState(history.state, '', url);
    persist();
  }, [persist, home]);
  const openArticle = (id: string) => {
    rememberArticle(id);
    try { sessionStorage.setItem('gameai-article-return', JSON.stringify({ id, href: location.pathname + location.search + location.hash })); } catch { /* ordinary article link stays usable */ }
  };
  const view = selection?.view;
  const visibleGroups = home ? [] : !selection ? groups.filter(g => g.items.length) : groups.filter(g => g.id === view);
  return <div ref={region} className="article-hub-browser" id={!selection ? "all" : undefined}>
    {(!selection || view === 'categories') && <section id="categories" aria-label="制作目的から記事や作品を選ぶ">
      <div className="article-cluster category-cluster">
        <CreationDeck key={`categories:${selection?.revision ?? 'ssr'}`} kind="category" items={groups.filter(group => group.items.length).map(group => ({
          id: group.id, title: group.title, description: group.description, count: group.items.length, countUnit: group.kind === "game" ? "作品" : "記事", label: '制作カテゴリ',
          href: home ? `/articles/?hubEntry=home&hubCategory=${group.id}#${group.id}` : `#${group.id}`,
        }))} initialId={selection?.category || undefined} defaultMode="deck" preferenceKey={home ? 'gameai-home-category-mode' : 'gameai-category-mode'} onCommitted={rememberCategory} onActivate={(event, id) => navigate(event, id)} />
        {groups.filter(group => !group.items.length).map(group => <div key={group.id} className="v2-start-card hub-preparation" aria-disabled="true"><span className="v2-start-card-label">制作カテゴリ</span><strong>{group.title}</strong><p>{group.description}</p><span>準備中 · {group.kind === "game" ? "0作品" : "0本の記事"}</span></div>)}
      </div>
    </section>}
    <nav className="hub-view-navigation" aria-label="記事の表示">
      {selection && view !== 'categories' && <a href={selection.entryHome ? `/?hubCategory=${selection.category ?? ""}#categories` : "#categories"} onClick={event => { if (new URL(location.href).searchParams.get('hubEntry') !== 'home') navigate(event, 'categories'); }}>← カテゴリへ戻る</a>}
      {view !== 'all' && <a href={home ? "/articles/#all" : "#all"} data-category="all" onClick={event => navigate(event, 'all')}>すべての記事を見る（{all.length}本） →</a>}
    </nav>
    {visibleGroups.map(group => <section key={`${group.id}:${selection?.revision ?? 'ssr'}`} id={group.id} className="article-cluster" aria-labelledby={`${group.id}-title`}>
      <div className="section-head"><div><h2 id={`${group.id}-title`}>{group.title}</h2><span>{group.items.length}{group.kind === "game" ? "作品" : "本の記事"}</span></div><p>{group.description}</p></div>
      <CreationDeck kind={group.kind === "game" ? "game" : "article"} preferenceKey={group.kind === "game" ? "gameai-game-deck-mode" : "gameai-creation-deck-mode"} items={group.items} initialId={selection?.article} defaultMode={selection ? "deck" : "list"} onCommitted={selection ? rememberArticle : undefined} onOpen={openArticle} />
    </section>)}
    {view === 'all' && <section id="all" className="article-cluster" aria-labelledby="all-title"><h2 id="all-title">すべての記事（{all.length}本）</h2>
      <CreationDeck key={`all:${selection?.revision ?? 'ssr'}`} items={all} initialId={selection?.article} forceList onOpen={openArticle} />
    </section>}
  </div>;
}
