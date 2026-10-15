"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const primaryLinks = [
  ["/#games", "ゲームで遊ぶ"],
  ["/articles", "作り方を知る"],
  ["/tools", "AIを選ぶ"],
] as const;

const menuGroups = [
  { label: "制作を始める", links: [["/project", "Projectを始める"]] },
  { label: "作り方を知る", links: [["/articles", "記事"], ["/guides", "制作ガイド"]] },
  { label: "AIを選ぶ", links: [["/tools", "AI・ツール"], ["/compare", "候補を比較"]] },
  { label: "信頼情報", links: [["/methodology", "調査・評価方法"], ["/privacy", "プライバシー"]] },
] as const;

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const home = pathname === "/";
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const headerRoot = useRef<HTMLElement>(null);
  const active = (href: string) => {
    if (href === "/#games" || href === "#games") return home || pathname.startsWith("/games/");
    if (href === "/articles") return pathname.startsWith("/articles") || pathname.startsWith("/guides");
    if (href === "/tools") return pathname.startsWith("/tools") || pathname.startsWith("/compare") || pathname.startsWith("/stacks");
    if (href === "/project") return pathname.startsWith("/project") || pathname.startsWith("/builder");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const header = headerRoot.current;
    if (!header) return;
    const documentRoot = document.documentElement;
    const previousHeight = documentRoot.style.getPropertyValue('--header-height');
    const previousPriority = documentRoot.style.getPropertyPriority('--header-height');
    const restoreHeight = () => {
      if (previousHeight) documentRoot.style.setProperty('--header-height', previousHeight, previousPriority);
      else documentRoot.style.removeProperty('--header-height');
    };
    const measure = () => {
      // A detached header has no geometry. Keep the shared CSS fallback usable.
      if (!header.isConnected) { restoreHeight(); return; }
      const measuredHeight = header.getBoundingClientRect().height;
      if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) return;
      const height = `${measuredHeight}px`;
      header.style.setProperty('--header-height', height);
      documentRoot.style.setProperty('--header-height', height);
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(header);
    measure();
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect(); window.removeEventListener('resize', measure); header.style.removeProperty('--header-height');
      restoreHeight();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const background = [document.querySelector("main"), document.querySelector(".site-footer")].filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );
    document.body.style.overflow = "hidden";
    background.forEach((element) => element.setAttribute("inert", ""));
    const focusable = () =>
      Array.from(menuPanel.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      background.forEach((element) => element.removeAttribute("inert"));
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const closeAndReturnFocus = () => {
    setOpen(false);
    menuButton.current?.focus();
  };

  return (
    <header ref={headerRoot} className="site-header b3-site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="GameBuildiary ホーム">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none"><rect className="b3-mark-case" x="1" y="1" width="38" height="38" rx="10" /><path className="b3-mark-back" d="M9 13 24 10l4 20-15 3z" /><rect className="b3-mark-page" x="15" y="8" width="16" height="23" rx="3" /><path className="b3-mark-line" d="M19 14h8M19 19h8M19 24h4" /><path className="b3-mark-pixel" d="M27 25h4v4h-4zM31 29h3v3h-3z" /></svg>
          </span>
          <span className="brand-copy">
            <strong>GameBuildiary</strong>
            <small>ビルダイアリー</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="メインナビゲーション">
          {primaryLinks.map(([href, label]) => (
            <Link key={href} href={home && href === "/#games" ? "#games" : href} aria-current={active(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="header-cta" href="/project" aria-current={active("/project") ? "page" : undefined}>
          <span className="b3-cta-desktop">制作を始める</span><span className="b3-cta-mobile">作る</span> <span aria-hidden="true">↗</span>
        </Link>
        <button
          ref={menuButton}
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-haspopup="dialog"
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="mobile-menu-layer">
          <button className="mobile-menu-backdrop" type="button" aria-label="メニューを閉じる" onClick={closeAndReturnFocus} />
          <div ref={menuPanel} className="mobile-menu b3-paper is-open" id="mobile-menu" role="dialog" aria-modal="true" aria-label="サイトメニュー">
            <div className="mobile-menu-head">
              <strong>次にしたいことを選ぶ</strong>
              <button type="button" className="mobile-menu-close" aria-label="メニューを閉じる" onClick={closeAndReturnFocus}>×</button>
            </div>
            <nav aria-label="モバイルナビゲーション">
              <Link href={home ? "#games" : "/#games"} aria-current={active("/#games") ? "page" : undefined} onClick={() => setOpen(false)}>ゲームで遊ぶ<span aria-hidden="true">→</span></Link>
              {menuGroups.map((group) => (
                <div className="mobile-menu-group" key={group.label}>
                  <span className="mobile-menu-label">{group.label}</span>
                  {group.links.map(([href, label]) => (
                    <Link key={href} href={href} aria-current={active(href) ? "page" : undefined} onClick={() => setOpen(false)}>
                      {label}<span aria-hidden="true">→</span>
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
