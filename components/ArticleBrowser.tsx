"use client";

import dynamic from "next/dynamic";
import type { HubGroup } from "./ArticleHub";

// Both entry routes load the same browser chunk. SSR stays enabled so category
// and article links are present without JavaScript; physics stays in CreationDeck.
export const ArticleBrowser = dynamic<{ groups: HubGroup[]; home?: boolean }>(
  () => import("./ArticleHub").then(module => module.ArticleHub),
);
