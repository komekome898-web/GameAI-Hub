"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";

export type CreationDeckItem = {
  href: string;
  title: string;
  description: string;
  updatedAt: string;
  label: string;
  image: { src: string; srcSet: string };
};

export function CreationDeck({ items }: { items: CreationDeckItem[] }) {
  const [mode, setMode] = useState<"list" | "deck">("list");
  const [active, setActive] = useState(0);
  const [available, setAvailable] = useState(false);
  const [deckHeight, setDeckHeight] = useState<number>();
  const stage = useRef<HTMLOListElement>(null);
  const gesture = useRef<{ pointerId: number; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const suppressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const preferredMode = useRef<"list" | "deck">("list");

  useEffect(() => {
    try {
      preferredMode.current = sessionStorage.getItem("gameai-creation-deck-mode") === "deck" ? "deck" : "list";
    } catch {
      preferredMode.current = "list";
    }
  }, []);

  useLayoutEffect(() => {
    const root = stage.current;
    if (!root) return;
    const measure = () => {
      // Deck items are top-positioned but never bottom-constrained, so this is
      // their intrinsic, width-correct height rather than the stage min-height.
      const height = Math.ceil(Math.max(...Array.from(root.children, (child) => (child as HTMLElement).scrollHeight), 0)) + 16;
      if (height > 16) setDeckHeight((current) => current === height ? current : height);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    Array.from(root.children).forEach((child) => observer?.observe(child));
    const fonts = document.fonts;
    const onFontsSettled = () => measure();
    fonts?.addEventListener("loadingdone", onFontsSettled);
    fonts?.addEventListener("loadingerror", onFontsSettled);
    if (fonts) void fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      fonts?.removeEventListener("loadingdone", onFontsSettled);
      fonts?.removeEventListener("loadingerror", onFontsSettled);
      window.removeEventListener("resize", measure);
    };
  }, [items]);

  const cancelGesture = useCallback(() => {
    gesture.current = null;
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const narrow = matchMedia("(max-width: 340px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const update = () => {
      const next = items.length > 1 && !narrow.matches && !reduced.matches && !forced.matches;
      setAvailable(next);
      cancelGesture();
      if (!next) {
        if (stage.current?.parentElement?.querySelector(":focus")?.closest(".creation-deck-controls")) {
          stage.current?.querySelectorAll<HTMLAnchorElement>("a")[active]?.focus({ preventScroll: true });
        }
        setMode("list");
      } else if (preferredMode.current === "deck") {
        setMode("deck");
      }
    };
    update();
    [narrow, reduced, forced].forEach((query) => query.addEventListener("change", update));
    return () => [narrow, reduced, forced].forEach((query) => query.removeEventListener("change", update));
  }, [active, cancelGesture, items.length]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== "visible") cancelGesture();
    };
    window.addEventListener("resize", cancelGesture);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("resize", cancelGesture);
      document.removeEventListener("visibilitychange", onVisibility);
      if (suppressTimer.current) clearTimeout(suppressTimer.current);
    };
  }, [cancelGesture]);

  const move = (delta: number) => setActive((index) => (index + delta + items.length) % items.length);
  const changeMode = (next: "list" | "deck") => {
    setMode(next);
    preferredMode.current = next;
    try {
      sessionStorage.setItem("gameai-creation-deck-mode", next);
    } catch {
      // The in-memory preference remains usable when storage is unavailable.
    }
  };
  const revealForFocus = (index: number) => {
    const root = stage.current;
    if (mode !== "deck" || !root) return;
    root.dataset.focusReveal = "true";
    setActive(index);
    requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.focusReveal));
  };
  const onControlsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (mode !== "deck" || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    move(event.key === "ArrowLeft" ? -1 : 1);
  };
  const onPointerDown = (event: ReactPointerEvent) => {
    if (mode !== "deck" || !event.isPrimary || gesture.current) {
      cancelGesture();
      return;
    }
    gesture.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    const start = gesture.current;
    if (!start || start.pointerId !== event.pointerId || !event.isPrimary) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.dragging && Math.abs(dx) >= 10 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      start.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };
  const onPointerEnd = (event: ReactPointerEvent) => {
    const start = gesture.current;
    cancelGesture();
    if (!start?.dragging || start.pointerId !== event.pointerId) return;
    const cardWidth = stage.current?.children[active]?.getBoundingClientRect().width ?? 320;
    const threshold = Math.min(64, cardWidth * 0.18);
    const dx = event.clientX - start.x;
    suppressClick.current = true;
    if (suppressTimer.current) clearTimeout(suppressTimer.current);
    suppressTimer.current = setTimeout(() => { suppressClick.current = false; }, 0);
    if (Math.abs(dx) >= threshold) move(dx < 0 ? 1 : -1);
  };
  const onClickCapture = (event: MouseEvent) => {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  };

  return <div className="creation-deck" data-mode={mode}>
    {available && <div className="creation-deck-controls" onKeyDown={onControlsKeyDown}>
      {mode === "deck" && <button type="button" onClick={() => move(-1)} aria-label="前の記事">←</button>}
      <button type="button" aria-pressed={mode === "deck"} onClick={() => changeMode(mode === "list" ? "deck" : "list")}>
        {mode === "list" ? "円環で見る" : "一覧で見る"}
      </button>
      {mode === "deck" && <button type="button" onClick={() => move(1)} aria-label="次の記事">→</button>}
      {mode === "deck" && <span className="creation-deck-count" aria-live="polite">{items.length}件中{active + 1}件目、{items[active]?.title}</span>}
    </div>}
    <ol ref={stage} className="article-cluster-list" style={mode === "deck" && deckHeight ? { minHeight: deckHeight } : undefined} onClickCapture={onClickCapture} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={cancelGesture} onLostPointerCapture={cancelGesture}>
      {items.map((item, index) => {
        const distance = ((index - active + items.length + Math.floor(items.length / 2)) % items.length) - Math.floor(items.length / 2);
        return <li key={item.href} className="v2-start-card-item" data-distance={mode === "deck" ? Math.max(-2, Math.min(2, distance)) : undefined}>
          <Link className="v2-start-card" href={item.href} onFocus={() => revealForFocus(index)}>
            <span className="v2-start-card-face">
              <span className="v2-start-card-image" aria-hidden="true">
                {/* Approved source bytes are intentionally served without re-encoding. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image.src} srcSet={item.image.srcSet} sizes="(max-width: 680px) calc(100vw - 62px), 352px" width="960" height="640" alt="" />
              </span>
              <span className="v2-start-card-meta"><span className="v2-start-card-label">{item.label}</span><small>更新 {item.updatedAt}</small></span>
              <strong>{item.title}</strong><span className="v2-start-card-description">{item.description}</span>
              <span className="v2-start-card-read" aria-hidden="true">記事を読む <b>→</b></span>
            </span>
          </Link>
        </li>;
      })}
    </ol>
  </div>;
}
