"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** One root observer; suppressed swipe clicks never reach this bubbling listener. */
export function GamePlayAnalytics() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-game-play]");
      const slug = link?.dataset.gamePlay;
      const placement = link?.dataset.gamePlacement;
      if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !placement || !["card", "top", "bottom"].includes(placement)) return;
      track("outbound_click", { page: `/games/${slug}/`, placement });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
