"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { GameRecord } from "@/data/games";
import { GamePlayLink } from "./GamePlayLink";
import { useCreationDeckMotion } from "./useCreationDeckMotion";

export type ShowcaseGame = Pick<GameRecord, "slug" | "title" | "description" | "genre" | "image" | "author" | "playUrl" | "playAccessNote" | "developmentNote" | "productionArticle">;

function GameActions({ game, onOpen }: { game: ShowcaseGame; onOpen: () => void }) {
  return <div className="b3-game-actions">
    <GamePlayLink href={game.playUrl} slug={game.slug} placement="card" />
    <Link className="b3-game-detail" href={`/games/${game.slug}/`} onClick={onOpen}>作品の紹介 <span aria-hidden="true">↗</span></Link>
  </div>;
}

/** Uses the existing gesture/inertia controller; editorial facts stay in games.ts. */
export function GameShowcase({ games }: { games: ShowcaseGame[] }) {
  const [available, setAvailable] = useState(false);
  const [list, setList] = useState(false);
  const [instant, setInstant] = useState(false);
  const stage = useRef<HTMLOListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const selectedLink = useRef<HTMLAnchorElement>(null);
  const pendingRestore = useRef<string | null>(null);
  const ids = useMemo(() => games.map(game => game.slug), [games]);
  const carousel = available && !list;
  const { activeId, move, reveal, cancel } = useCreationDeckMotion(stage, ids, carousel, ids[0], instant);
  const active = Math.max(0, ids.indexOf(activeId));
  const game = games[active];
  const previousGame = useRef(activeId);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    let stopped = false;
    const update = () => {
      if (stopped) return;
      const title = root.current?.querySelector<HTMLElement>(".b3-static-copy h3");
      const text = root.current?.querySelector<HTMLElement>(".b3-game-description");
      // Large text/narrow content uses the same complete links in natural flow.
      const fit = Boolean(root.current && root.current.clientWidth >= 240 && title && text &&
        parseFloat(getComputedStyle(title).fontSize) <= 32 && parseFloat(getComputedStyle(text).fontSize) <= 24);
      setAvailable(games.length >= 3 && fit && !forced.matches);
      setInstant(reduced.matches);
    };
    queueMicrotask(update);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (root.current) observer?.observe(root.current);
    [reduced, forced].forEach(query => query.addEventListener("change", update));
    window.addEventListener("resize", update);
    document.fonts?.addEventListener("loadingdone", update);
    document.fonts?.addEventListener("loadingerror", update);
    if (document.fonts) void document.fonts.ready.then(update);
    return () => {
      stopped = true;
      observer?.disconnect();
      [reduced, forced].forEach(query => query.removeEventListener("change", update));
      window.removeEventListener("resize", update);
      document.fonts?.removeEventListener("loadingdone", update);
      document.fonts?.removeEventListener("loadingerror", update);
    };
  }, [games.length]);

  useEffect(() => {
    if (!available) return;
    const restore = () => {
      const url = new URL(location.href);
      const requestedList = url.searchParams.get("homeView") === "list";
      setList(requestedList);
      const requested = url.searchParams.get("homeGame");
      if (!carousel || requestedList) return;
      if (!requested || !ids.includes(requested)) return;
      pendingRestore.current = requested;
      reveal(requested);
    };
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [available, carousel, ids, reveal]);

  useEffect(() => {
    if (!carousel || !activeId) return;
    if (pendingRestore.current && pendingRestore.current !== activeId) return;
    pendingRestore.current = null;
    const url = new URL(location.href);
    if (url.searchParams.get("homeView") === "list") return;
    if (previousGame.current === activeId && !url.searchParams.has("homeGame")) return;
    previousGame.current = activeId;
    url.searchParams.set("homeGame", activeId);
    history.replaceState(history.state, "", url);
  }, [activeId, carousel]);

  useEffect(() => {
    if (!available) return;
    let frame = 0;
    try {
      const returning = sessionStorage.getItem("gameai-home-game-return");
      const url = new URL(location.href);
      if (!returning || url.searchParams.get("homeGame") !== returning) return;
      if (url.searchParams.get("homeView") === "list" ? !list : (!carousel || returning !== activeId)) return;
      sessionStorage.removeItem("gameai-home-game-return");
      frame = requestAnimationFrame(() => {
        const target = list ? Array.from(root.current?.querySelectorAll<HTMLAnchorElement>('.b3-static-copy .b3-game-detail') ?? []).find(link => link.closest<HTMLElement>('[data-deck-id]')?.dataset.deckId === returning) : selectedLink.current;
        target?.focus({ preventScroll: true });
        if (list) target?.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
    } catch { /* ordinary links and browser Back remain usable */ }
    return () => cancelAnimationFrame(frame);
  }, [activeId, available, carousel, list]);

  const remember = (id: string) => {
    const url = new URL(location.href);
    url.searchParams.set("homeGame", id);
    url.hash = 'games';
    history.replaceState(history.state, "", url);
    try {
      sessionStorage.setItem("gameai-article-return", JSON.stringify({ id, href: `/?homeGame=${encodeURIComponent(id)}${list ? '&homeView=list' : ''}#games` }));
      sessionStorage.setItem("gameai-home-game-return", id);
    } catch { /* direct detail links remain usable */ }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!carousel) return;
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if ((delta || event.key === "Home" || event.key === "End") && event.target instanceof Element && event.target.closest('.b3-art-link')) {
      stage.current?.focus({ preventScroll: true });
    }
    if (delta) { event.preventDefault(); move(delta); }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault(); reveal(ids[event.key === "Home" ? 0 : ids.length - 1]);
    }
  };

  if (!game) return <p>現在、表示できる作品はありません。</p>;
  return <div ref={root} className="b3-showcase" data-mode={carousel ? "deck" : "list"} onKeyDown={onKeyDown}>
    <div className="b3-gallery-bar">
      <span>プレイ無料、インストールなし</span>
      <div className="b3-showcase-controls">
        <button type="button" aria-label="前の掲載作品" disabled={!carousel} onClick={() => move(-1)}>←</button>
        <span aria-hidden="true">{active + 1} / {games.length}</span>
        <button type="button" aria-label="次の掲載作品" disabled={!carousel} onClick={() => move(1)}>→</button>
        {available && <button type="button" className="b3-list-toggle" aria-pressed={list} onClick={() => {
          cancel();
          const next = !list;
          const url = new URL(location.href);
          if (next) url.searchParams.set('homeView', 'list'); else url.searchParams.delete('homeView');
          history.replaceState(history.state, '', url);
          setList(next);
        }}>{list ? "カードで見る" : "作品一覧"}</button>}
      </div>
    </div>
    <div className="b3-stage-window">
      <ol ref={stage} className="b3-game-stage" tabIndex={carousel ? 0 : undefined} aria-label="掲載ゲームのカード" aria-describedby={carousel ? "b3-deck-help" : undefined}>
        {games.map((item, index) => <li key={item.slug} data-deck-id={item.slug} data-selected={item.slug === activeId}>
          <div className="b3-art-card">
            <span className="b3-frame-face" aria-hidden="true" />
            <div className="b3-art-top"><span>PLAYABLE / {String(index + 1).padStart(2, "0")}</span><span>{item.genre}</span></div>
            <Link href={`/games/${item.slug}/`} className="b3-art-link" aria-label={`${item.title}の紹介`} tabIndex={carousel && item.slug !== activeId ? -1 : undefined} onClick={() => remember(item.slug)}>
              {/* Serve approved originals without crop, filters or re-encoding. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image.src} alt={item.image.alt} width={item.image.width} height={item.image.height} loading={index < 3 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} draggable={false} />
            </Link>
            <div className="b3-art-credit"><span>{item.image.credit}</span><span>FULL FRAME</span></div>
          </div>
          <div className="b3-static-copy" hidden={carousel}>
            <h3><Link href={`/games/${item.slug}/`} onClick={() => remember(item.slug)}>{item.title}</Link></h3>
            <GameActions game={item} onOpen={() => remember(item.slug)} />
            <p className="b3-game-description">{item.description}</p>
            <p className="b3-game-note">作者：{item.author.name} · {item.playAccessNote}</p>
            {item.developmentNote && <p className="b3-game-note">スマホのみで制作（作者提供情報）</p>}
          </div>
        </li>)}
      </ol>
    </div>
    {carousel && <div className="b3-game-selection">
      <div className="b3-selection-copy">
        <p className="b3-game-meta">{game.genre}{game.developmentNote && <span>スマホのみで制作</span>}</p>
        <h2><Link ref={selectedLink} href={`/games/${game.slug}/`} onClick={() => remember(game.slug)}>{game.title}</Link></h2>
        <p className="b3-game-description">{game.description}</p>
        <p className="b3-game-note">{game.playAccessNote} · 作者：{game.author.name}</p>
        {game.productionArticle && <Link className="b3-production-link" href={game.productionArticle.href}>{game.productionArticle.title} →</Link>}
      </div>
      <GameActions game={game} onOpen={() => remember(game.slug)} />
    </div>}
    {carousel && <p id="b3-deck-help" className="b3-deck-help">左右にスワイプして選ぶ / 矢印キーでも操作できます</p>}
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{games.length}作品中{active + 1}作品目、{game.title}</p>
  </div>;
}
