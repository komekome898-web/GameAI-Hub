"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FocusEvent as ReactFocusEvent, type KeyboardEvent } from "react";

import { useCreationDeckMotion } from "./useCreationDeckMotion";

export type CreationDeckItem = {
  id: string;
  href: string;
  title: string;
  description: string;
  updatedAt: string;
  label: string;
  image: { src: string; srcSet: string };
};

export function CreationDeck({ items }: { items: CreationDeckItem[] }) {
  const [mode, setMode] = useState<"list" | "deck">("list");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const descriptionPrefix = useId();
  const [available, setAvailable] = useState(false);
  const [candidate, setCandidate] = useState(false);
  const [fitUsable, setFitUsable] = useState(false);
  const [deckHeight, setDeckHeight] = useState<number>();
  const stage = useRef<HTMLOListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => items.map(item => item.id), [items]);
  const { activeId, move, cancel: cancelGesture } = useCreationDeckMotion(stage, ids, mode === "deck" && available);
  const active = Math.max(0, ids.indexOf(activeId));
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
        const cardWidth = card.offsetWidth || card.getBoundingClientRect().width;
        const title = card.querySelector<HTMLElement>("strong");
        const description = card.querySelector<HTMLElement>(".v2-start-card-description");
        const titleSizeText = title ? getComputedStyle(title).fontSize : "";
        const descriptionSizeText = description ? getComputedStyle(description).fontSize : "";
        const titleSize = Number.parseFloat(titleSizeText);
        const descriptionSize = Number.parseFloat(descriptionSizeText);
        return Number.isFinite(cardWidth) && cardWidth >= 240 &&
          Boolean(title) && (!titleSizeText || (Number.isFinite(titleSize) && titleSize <= 32)) &&
          Boolean(description) && (!descriptionSizeText || (Number.isFinite(descriptionSize) && descriptionSize <= 24));
      });
      if (!Number.isFinite(height) || height <= 16 || !cardsFit) {
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

  useLayoutEffect(() => {
    if (!candidate) return;
    const control = controls.current;
    if (!control || control.clientWidth <= 0 || control.scrollWidth > control.clientWidth + 1) {
      setCandidate(false);
      setFitUsable(false);
      setAvailable(false);
      setMode("list");
      return;
    }
    setAvailable(true);
  }, [candidate]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const narrow = matchMedia("(max-width: 340px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const forced = matchMedia("(forced-colors: active)");
    const update = () => {
      // A two-card set remains an ordinary flat rail; the circular treatment
      // only adds useful spatial context when a third card exists.
      const next = items.length > 2 && fitUsable && !narrow.matches && !reduced.matches && !forced.matches;
      setCandidate(next);
      if (!next) setAvailable(false);
      cancelGesture();
      if (!next) {
        // Only a currently focused overview button is about to disappear.
        // Surviving links and focus outside this deck keep their ownership.
        const focused = document.activeElement;
        if (focused instanceof HTMLButtonElement && focused.matches('.v2-start-card-expand') && stage.current?.contains(focused)) {
          focused.closest('li')?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
        } else if (controlFocusOwned.current) {
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

  const changeMode = (next: "list" | "deck") => {
    cancelGesture();
    setMode(next);
    preferredMode.current = next;
    try {
      sessionStorage.setItem("gameai-creation-deck-mode", next);
    } catch {
      // The in-memory preference remains usable when storage is unavailable.
    }
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
  return <div ref={root} className="creation-deck" data-mode={mode} data-available={available ? "true" : "false"}>
    {candidate && <div ref={controls} className="creation-deck-controls" onBlurCapture={recoverHiddenControlFocus} onFocusCapture={() => { controlFocusOwned.current = true; }} onKeyDown={onControlsKeyDown}>
      {mode === "deck" && <button type="button" onClick={() => move(-1)} aria-label="前の記事">←</button>}
      {mode === "deck" && <span className="creation-deck-count" aria-hidden="true">{active + 1} / {items.length}</span>}
      {mode === "deck" && <button type="button" onClick={() => move(1)} aria-label="次の記事">→</button>}
      <button type="button" aria-pressed={mode === "deck"} onClick={() => changeMode(mode === "list" ? "deck" : "list")}>
        {mode === "list" ? "円環で見る" : "一覧で見る"}
      </button>
      {mode === "deck" && <span className="creation-deck-status sr-only" aria-live="polite">{items.length}件中{active + 1}件目、{items[active]?.title}</span>}
    </div>}
    {items.length === 0 && <p>現在、表示できる記事はありません。</p>}
    <ol ref={stage} className="article-cluster-list" style={mode === "deck" && deckHeight ? { minHeight: deckHeight } : undefined} onDragStart={(event) => { if (mode === "deck") event.preventDefault(); }}>
      {items.map((item, index) => {
        const descriptionId = `${descriptionPrefix}-${index}`;
        const isExpanded = mode === "list" || expanded.has(item.id);
        return <li key={item.id} data-deck-id={item.id} className="v2-start-card-item">
          <div className="v2-start-card">
            <Link className="v2-start-card-face" href={item.href} aria-label={item.title}>
              <span className="v2-start-card-image" aria-hidden="true">
                {/* Approved source bytes are served without re-encoding. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image.src} srcSet={item.image.srcSet} sizes="(max-width: 680px) calc(100vw - 96px), 272px" width="960" height="640" alt="" />
              </span>
              <span className="v2-start-card-meta"><span className="v2-start-card-label">{item.label}</span><small>更新 {item.updatedAt}</small></span>
              <strong>{item.title}</strong>
              <span className="v2-start-card-read" aria-hidden="true">記事を読む <b>→</b></span>
            </Link>
            <p id={descriptionId} className="v2-start-card-description" data-expanded={isExpanded}>{item.description}</p>
            {mode === "deck" && <button className="v2-start-card-expand" type="button" aria-expanded={isExpanded} aria-controls={descriptionId} onClick={() => setExpanded(old => {
              const next = new Set(old); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next;
            })}>{isExpanded ? "概要を閉じる" : "概要をすべて表示"}</button>}
          </div>
        </li>;
      })}
    </ol>
  </div>;
}
