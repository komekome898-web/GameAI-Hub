"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Only a validated article-hub route can replace the ordinary breadcrumb. */
export function ArticleReturnLink({ slug, purpose }: { slug: string; purpose: string }) {
  const [href, setHref] = useState('/articles');
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem('gameai-article-return') ?? 'null');
      if (saved?.id !== slug || typeof saved.href !== 'string' || !saved.href.startsWith('/articles/')) return;
      const url = new URL(saved.href, location.origin);
      if (url.origin !== location.origin || url.pathname !== '/articles/' || url.searchParams.get('hubArticle') !== slug) return;
      if (url.hash !== '#all' && url.hash !== `#${purpose}`) return;
      const safe = new URL('/articles/', location.origin);
      safe.hash = url.hash;
      safe.searchParams.set('hubArticle', slug);
      if (url.searchParams.get('hubEntry') === 'home') safe.searchParams.set('hubEntry', 'home');
      if (url.hash !== '#all') safe.searchParams.set('hubCategory', purpose);
      if (active) setHref(safe.pathname + safe.search + safe.hash);
    } catch { /* invalid/unavailable session keeps the ordinary breadcrumb */ }
    });
    return () => { active = false; };
  }, [slug, purpose]);
  return <Link href={href}>記事</Link>;
}
