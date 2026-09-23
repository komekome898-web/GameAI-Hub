"use client";

import { useEffect, useState } from "react";
import { analyticsExclusionKey, analyticsExclusionParameter } from "@/components/GoogleAnalytics";

export function AnalyticsExclusionControl() {
  const [excluded, setExcluded] = useState(false);
  useEffect(() => {
    try {
      // Hydrate browser-local state after the server render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExcluded(window.__gameAIAnalyticsExcluded === true || localStorage.getItem(analyticsExclusionKey) === "1"); }
    catch { /* The entry parameter still excludes the current document. */ }
  }, []);
  const update = (exclude: boolean) => {
    const url = new URL(location.href);
    url.searchParams.set(analyticsExclusionParameter, exclude ? "off" : "on");
    location.assign(url.toString());
  };
  return <section aria-labelledby="analytics-exclusion-heading">
    <h3 id="analytics-exclusion-heading">運営・QA用の計測除外</h3>
    <p>このブラウザだけでGA4計測を停止できます。アカウント全体や別端末には反映されません。</p>
    <p aria-live="polite">現在: {excluded ? "計測から除外中" : "通常の計測設定"}</p>
    <button type="button" onClick={() => update(!excluded)}>{excluded ? "このブラウザの計測を再開" : "このブラウザを計測から除外"}</button>
  </section>;
}
