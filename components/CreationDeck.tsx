"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FocusEvent as ReactFocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";

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
  const [fitUsable, setFitUsable] = useState(false);
  const [deckHeight, setDeckHeight] = useState<number>();
  const stage = useRef<HTMLOListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const dragFrame = useRef<number | undefined>(undefined);
  const gesture = useRef<{ pointerId: number; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const suppressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const preferredMode = useRef<"list" | "deck">("list");
  // CSS can remove the controls before a media-query callback runs. Remember
  // control ownership while focus is still present so fallback can move it to
  // the active article rather than leaving focus on <body>.
  const controlFocusOwned = useRef(false);

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
    const failSafe = () => {
      setFitUsable(false);
      setMode("list");
      setDeckHeight(undefined);
    };
    const measure = () => {
      try {
      // Deck items are top-positioned but never bottom-constrained, so this is
      // their intrinsic, width-correct height rather than the stage min-height.
      const cards = Array.from(root.children) as HTMLElement[];
      const height = Math.ceil(Math.max(...cards.map((child) => child.scrollHeight), 0)) + 16;
      const width = root.getBoundingClientRect().width;
      const cardsFit = cards.length > 2 && width >= 280 && cards.every((card) => {
        const cardWidth = card.getBoundingClientRect().width;
        return Number.isFinite(cardWidth) && cardWidth >= 240;
      });
      const control = controls.current;
      const controlsFit = !control || control.scrollWidth <= control.clientWidth + 1;
      if (!Number.isFinite(height) || height <= 16 || !cardsFit || !controlsFit) {
        failSafe();
        return;
      }
      setFitUsable(true);
      setDeckHeight((current) => current === height ? current : height);
      } catch {
        failSafe();
      }
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
    if (dragFrame.current) cancelAnimationFrame(dragFrame.current);
    dragFrame.current = undefined;
    stage.current?.style.removeProperty("--deck-drag-x");
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const narrow = matchMedia("(max-width: 340px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const update = () => {
      // A two-card set remains an ordinary flat rail; the circular treatment
      // only adds useful spatial context when a third card exists.
      const next = items.length > 2 && fitUsable && !narrow.matches && !reduced.matches && !forced.matches;
      setAvailable(next);
      cancelGesture();
      if (!next) {
        if (controlFocusOwned.current) {
          controlFocusOwned.current = false;
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
  }, [active, cancelGesture, fitUsable, items.length]);

  useEffect(() => {
    const rememberFocusOwner = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".creation-deck-controls")) controlFocusOwned.current = true;
      else if (target !== document.body) controlFocusOwned.current = false;
    };
    document.addEventListener("focusin", rememberFocusOwner, true);
    return () => document.removeEventListener("focusin", rememberFocusOwner, true);
  }, []);

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
  const recoverHiddenControlFocus = (event: ReactFocusEvent<HTMLDivElement>) => {
    const controls = event.currentTarget;
    queueMicrotask(() => {
      if (!controlFocusOwned.current || document.activeElement !== document.body) return;
      if (getComputedStyle(controls).display !== "none") return;
      controlFocusOwned.current = false;
      stage.current?.querySelectorAll<HTMLAnchorElement>("a")[active]?.focus({ preventScroll: true });
    });
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
    if (start.dragging && !dragFrame.current) {
      dragFrame.current = requestAnimationFrame(() => {
        dragFrame.current = undefined;
        const current = gesture.current;
        if (current) stage.current?.style.setProperty("--deck-drag-x", `${event.clientX - current.x}px`);
      });
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

  return <div ref={root} className="creation-deck" data-mode={mode} data-available={available ? "true" : "false"}>
    {available && <div ref={controls} className="creation-deck-controls" onBlurCapture={recoverHiddenControlFocus} onFocusCapture={() => { controlFocusOwned.current = true; }} onKeyDown={onControlsKeyDown}>
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
