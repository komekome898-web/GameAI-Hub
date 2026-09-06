"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

export function ArticleAnalytics({ slug }: { slug: string }) {
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track("article_view", { article_slug: slug, route_category: "article" });
  }, [slug]);
  return null;
}
