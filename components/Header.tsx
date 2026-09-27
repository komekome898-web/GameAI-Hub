"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const primaryLinks = [
  ["/project", "ゲームを作る"],
  ["/articles", "作り方を学ぶ"],
  ["/tools", "AI・ツールを選ぶ"],
] as const;

const menuGroups = [
  { label: "作る", links: [["/project", "Projectを始める"]] },
  { label: "学ぶ", links: [["/articles", "記事"], ["/guides", "制作ガイド"]] },
  { label: "選ぶ", links: [["/tools", "AI・ツール"], ["/compare", "候補を比較"]] },
  { label: "信頼情報", links: [["/methodology", "調査・評価方法"], ["/privacy", "プライバシー"]] },
] as const;

const focusableSelector =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

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
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="GameAI Hub ホーム">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path d="M6 7h20v18H6z" />
              <path d="M10 12h12M10 16h8M10 20h10" />
            </svg>
          </span>
          <span className="brand-copy">
            <strong>GameAI Hub</strong>
            <small>AI Iterproof</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="メインナビゲーション">
          {primaryLinks.map(([href, label]) => (
            <Link key={href} href={href} aria-current={active(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="header-cta" href="/project">
          最初の作業を作る <span aria-hidden="true">→</span>
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
          <div ref={menuPanel} className="mobile-menu is-open" id="mobile-menu" role="dialog" aria-modal="true" aria-label="サイトメニュー">
            <div className="mobile-menu-head">
              <strong>次にしたいことを選ぶ</strong>
              <button type="button" className="mobile-menu-close" aria-label="メニューを閉じる" onClick={closeAndReturnFocus}>×</button>
            </div>
            <nav aria-label="モバイルナビゲーション">
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
