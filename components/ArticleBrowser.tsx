"use client";

import dynamic from "next/dynamic";
import type { HubGroup } from "./ArticleHub";
import type { ShowcaseGame } from "./GameShowcase";

// Both entry routes load the same browser chunk. SSR stays enabled so category
// and article links are present without JavaScript; physics stays in CreationDeck.
export const ArticleBrowser = dynamic<{ groups: HubGroup[]; home?: boolean }>(
  () => import("./ArticleHub").then(module => module.ArticleHub),
);

// Keep the shared physics in deferred browser chunks rather than the Home entry.
// SSR remains enabled for complete game links and source images.
export const GameShowcaseBrowser = dynamic<{ games: ShowcaseGame[] }>(
  () => import("./GameShowcase").then(module => module.GameShowcase),
);
