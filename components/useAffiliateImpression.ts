"use client";

import { useEffect, useRef, type RefObject } from "react";
import { track, type EventProperties } from "@/lib/analytics";

const VIEWABLE_RATIO = 0.5;
export function useAffiliateImpression(
  affiliate: boolean,
  properties: EventProperties,
): RefObject<HTMLAnchorElement | null> {
  const ref = useRef<HTMLAnchorElement>(null);
  const recordedKey = useRef<string | null>(null);
  const key = `${properties.service_id}|${properties.page}|${properties.placement}`;

  useEffect(() => {
    const element = ref.current;
    if (
      !affiliate ||
      !element ||
      recordedKey.current === key ||
      typeof IntersectionObserver === "undefined"
    )
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some(
            (entry) =>
              entry.target === element &&
              entry.isIntersecting &&
              entry.intersectionRatio >= VIEWABLE_RATIO,
          ) &&
          recordedKey.current !== key
        ) {
          recordedKey.current = key;
          track("affiliate_impression", properties);
          observer.disconnect();
        }
      },
      { threshold: VIEWABLE_RATIO },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [affiliate, key, properties]);

  return ref;
}
