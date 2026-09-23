import { describe, expect, it, vi } from "vitest";
import {
  buildSubId,
  sanitizeEventProperties,
  taskStage,
  track,
  type EventName,
} from "@/lib/analytics";
import {
  analyticsBootstrap,
  analyticsLoadTimeoutMs,
  analyticsPendingCommandCapacity,
  canonicalAnalyticsHost,
  isAnalyticsEligible,
  measurementId,
} from "@/components/GoogleAnalytics";

const funnelEvents: EventName[] = [
  "article_view",
  "article_to_project",
  "project_start",
  "project_generated",
  "first_task_viewed",
  "task_completed",
  "next_task_reached",
  "affiliate_impression",
  "affiliate_click",
];

describe("analytics measurement baseline", () => {
  it("defines the complete article to affiliate funnel event names", () => {
    expect(funnelEvents).toEqual([
      "article_view",
      "article_to_project",
      "project_start",
      "project_generated",
      "first_task_viewed",
      "task_completed",
      "next_task_reached",
      "affiliate_impression",
      "affiliate_click",
    ]);
  });
  it("preserves bounded legacy page identifiers without accepting free text", () => {
    expect(
      sanitizeEventProperties("outbound_click", { page: "builder-result" }),
    ).toEqual({ page: "builder-result" });
    expect(
      sanitizeEventProperties("outbound_click", {
        page: "raw page with secret",
      }),
    ).toEqual({});
  });
  it("keeps only bounded task metadata and rejects sensitive or unbounded values", () => {
    expect(
      sanitizeEventProperties("task_completed", {
        task: "core-loop",
        task_index: 0,
        task_stage: "prototype",
        article_slug: "ai-browser-game-how-to",
        source_context: "project",
        route_category: "project",
        page: "秘密のゲーム案",
        artifact: "<html>secret token</html>",
      }),
    ).toEqual({
      task: "core-loop",
      task_index: 0,
      task_stage: "prototype",
      article_slug: "ai-browser-game-how-to",
      source_context: "project",
      route_category: "project",
    });
    expect(
      sanitizeEventProperties("task_completed", {
        task: "raw free text with spaces",
        task_index: -1,
        task_stage: "秘密",
        article_slug: "raw article slug with spaces",
      }),
    ).toEqual({});
  });
  it("allows only safe article slug and CTA placement metadata", () => {
    expect(
      sanitizeEventProperties("article_to_project", {
        page: "/articles/ai-fantasy",
        placement: "article_end",
        article_slug: "ai-fantasy",
        cta_placement: "article_end",
        source_context: "article",
        route_category: "article",
        service: "private draft",
      }),
    ).toEqual({
      page: "/articles/ai-fantasy",
      placement: "article_end",
      article_slug: "ai-fantasy",
      cta_placement: "article_end",
      source_context: "article",
      route_category: "article",
    });
  });
  it("keeps affiliate context but rejects URLs and raw queries", () => {
    expect(
      sanitizeEventProperties("affiliate_click", {
        service: "elevenlabs",
        service_id: "elevenlabs",
        page: "/project",
        placement: "quest_create-voice",
        sub_id: "elevenlabs__project__voice",
        production_stage: "audio",
        source_context: "project",
        route_category: "project",
        affiliate: true,
        source: "https://affiliate.example/?idea=secret game",
      }),
    ).toEqual({
      service: "elevenlabs",
      service_id: "elevenlabs",
      page: "/project",
      placement: "quest_create-voice",
      sub_id: "elevenlabs__project__voice",
      production_stage: "audio",
      source_context: "project",
      route_category: "project",
      affiliate: true,
    });
  });
  it("sanitizes affiliate impressions to bounded attribution only", () => {
    expect(
      sanitizeEventProperties("affiliate_impression", {
        service: "must-not-be-sent",
        service_id: "elevenlabs",
        page: "/articles/ai-fantasy?idea=secret",
        placement: "fantasy_voice_inline",
        production_stage: "audio",
        source_context: "article",
        route_category: "article",
        affiliate: true,
        article_slug: "ai-fantasy",
        task_stage: "raw prompt with spaces",
        task_index: 101,
        source: "https://example.com/?token=secret",
      }),
    ).toEqual({
      service_id: "elevenlabs",
      placement: "fantasy_voice_inline",
      production_stage: "audio",
      source_context: "article",
      route_category: "article",
      affiliate: true,
      article_slug: "ai-fantasy",
    });
  });
  it("allows only the exact public Production host without exclusion", () => {
    expect(measurementId).toBe("G-B9Q283QVER");
    expect(isAnalyticsEligible(true, canonicalAnalyticsHost, false)).toBe(true);
    for (const host of ["localhost", "127.0.0.1", "::1", "preview.vercel.app", `evil-${canonicalAnalyticsHost}`])
      expect(isAnalyticsEligible(true, host, false)).toBe(false);
    expect(isAnalyticsEligible(false, canonicalAnalyticsHost, false)).toBe(false);
    expect(isAnalyticsEligible(true, canonicalAnalyticsHost, true)).toBe(false);
  });
  it("bootstraps one supported arguments queue and scrubs exclusion parameters before config", () => {
    const script = analyticsBootstrap(true);
    expect(script).toContain("queue.push(arguments)");
    expect(script).not.toContain("push(['event'");
    expect(script.indexOf("history.replaceState")).toBeLessThan(script.indexOf("window.gtag('config'"));
    expect(script).toContain("document.querySelector('script[data-gameai-ga]')");
  });
  it("executes the permitted bootstrap once with a consumable early-event queue", () => {
    const store = new Map<string, string>();
    const appended: Array<{ src?: string; onload?: () => void }> = [];
    const target: Record<string, unknown> = {};
    const location = { href: `https://${canonicalAnalyticsHost}/articles/test`, hostname: canonicalAnalyticsHost };
    const storage = { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) };
    const documentMock = { querySelector: () => null, createElement: () => ({ dataset: {}, remove: vi.fn() }), head: { appendChild: (node: { src?: string; onload?: () => void }) => appended.push(node) } };
    const run = new Function("window", "location", "localStorage", "history", "document", "URL", analyticsBootstrap(true));
    run(target, location, storage, { state: null, replaceState: vi.fn() }, documentMock, URL);
    const gtag = target.gtag as (...args: unknown[]) => void;
    gtag("event", "article_view", { article_slug: "test" });
    run(target, location, storage, { state: null, replaceState: vi.fn() }, documentMock, URL);
    const queue = target.dataLayer as IArguments[];
    expect(queue.map((entry) => Array.from(entry).slice(0, 2))).toEqual([["js", expect.any(Date)], ["config", measurementId], ["event", "article_view"]]);
    expect(appended).toHaveLength(1);
    expect(appended[0].src).toContain(encodeURIComponent(measurementId));
    appended[0].onload?.();
    expect(target.dataLayer).toBe(queue);
    for (let index = 0; index < analyticsPendingCommandCapacity; index += 1)
      gtag("event", `loaded-${index}`);
    expect(queue).toHaveLength(analyticsPendingCommandCapacity + 3);
    expect(Array.from(queue[2]).slice(0, 2)).toEqual(["event", "article_view"]);
  });
  it("fails closed for exclusion even when storage throws", () => {
    const target: Record<string, unknown> = {};
    const location = { href: `https://${canonicalAnalyticsHost}/?gameai_analytics=off`, hostname: canonicalAnalyticsHost };
    const storage = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } };
    const replaceState = vi.fn();
    const run = new Function("window", "location", "localStorage", "history", "document", "URL", analyticsBootstrap(true));
    run(target, location, storage, { state: null, replaceState }, { querySelector: vi.fn(), createElement: vi.fn(), head: { appendChild: vi.fn() } }, URL);
    expect(target.__gameAIAnalyticsEligible).toBe(false);
    expect(target.__gameAIAnalyticsExcluded).toBe(true);
    expect(target.gtag).toBeUndefined();
    expect(replaceState).toHaveBeenCalled();
  });
  it("keeps diagnostics but no dormant queue when eligibility is unknown", () => {
    const listener = vi.fn();
    window.addEventListener("gameai:event", listener);
    delete window.__gameAIAnalyticsEligible;
    delete window.gtag;
    delete window.dataLayer;
    track("project_generated", { game_type: "2d", budget: "free" });
    expect(listener).toHaveBeenCalledOnce();
    expect(window.dataLayer).toBeUndefined();
    window.removeEventListener("gameai:event", listener);
  });
  it("uses the authorized gtag path exactly once", () => {
    const gtag = vi.fn();
    window.__gameAIAnalyticsEligible = true;
    window.gtag = gtag;
    track("affiliate_click", { service_id: "meshy", placement: "primary", affiliate: true });
    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith("event", "affiliate_click", { service_id: "meshy", placement: "primary", affiliate: true });
    delete window.__gameAIAnalyticsEligible;
    delete window.gtag;
  });
  it("isolates a throwing authorized transport without retrying or leaking unsafe diagnostics", () => {
    const transport = vi.fn(() => { throw new Error("secret runtime details"); });
    const debug = vi.spyOn(console, "debug").mockImplementation(() => undefined);
    window.__gameAIAnalyticsEligible = true;
    window.gtag = transport;

    expect(() => {
      track("project_generated", {
        game_type: "2d",
        budget: "free",
        source: "raw secret game idea",
      });
      track("task_completed", { task: "core-loop", task_index: 0 });
      track("affiliate_click", { service_id: "meshy", affiliate: true });
    }).not.toThrow();
    expect(transport).toHaveBeenCalledTimes(3);
    expect(transport).toHaveBeenNthCalledWith(1, "event", "project_generated", {
      game_type: "2d",
      budget: "free",
    });
    expect(debug).toHaveBeenNthCalledWith(
      1,
      "[GameAI analytics transport unavailable]",
      "project_generated",
      { game_type: "2d", budget: "free" },
    );
    expect(JSON.stringify(debug.mock.calls)).not.toContain("secret");

    debug.mockRestore();
    delete window.__gameAIAnalyticsEligible;
    delete window.gtag;
  });
  it("bounds the pending queue and disposes it after a loader failure without replay", () => {
    vi.useFakeTimers();
    const appended: Array<Record<string, unknown>> = [];
    const target: Record<string, unknown> = {};
    const run = new Function("window", "location", "localStorage", "history", "document", "URL", analyticsBootstrap(true));
    const script = { dataset: {}, remove: vi.fn() };
    run(
      target,
      { href: `https://${canonicalAnalyticsHost}/`, hostname: canonicalAnalyticsHost },
      { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() },
      { state: null, replaceState: vi.fn() },
      { querySelector: () => null, createElement: () => script, head: { appendChild: (node: Record<string, unknown>) => appended.push(node) } },
      URL,
    );
    const gtag = target.gtag as (...args: unknown[]) => void;
    for (let index = 0; index < analyticsPendingCommandCapacity + 10; index += 1)
      gtag("event", `event-${index}`);
    const queue = target.dataLayer as IArguments[];
    expect(queue).toHaveLength(analyticsPendingCommandCapacity);
    expect(Array.from(queue[0]).slice(0, 1)).toEqual(["js"]);
    expect(Array.from(queue[1]).slice(0, 2)).toEqual(["config", measurementId]);
    expect(Array.from(queue[2]).slice(0, 2)).toEqual(["event", "event-12"]);

    (appended[0].onerror as () => void)();
    expect(target.dataLayer).toBeUndefined();
    expect(target.gtag).toBeUndefined();
    expect(target.__gameAIAnalyticsEligible).toBe(false);
    vi.advanceTimersByTime(analyticsLoadTimeoutMs);
    expect(script.remove).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
  it("maps task ids to bounded production stages", () => {
    expect(taskStage("core-loop")).toBe("prototype");
    expect(taskStage("create-voice")).toBe("audio");
    expect(taskStage("unrecognized")).toBe("other");
  });
  it("builds stable subtracking identifiers within the validator boundary", () => {
    expect(buildSubId("cursor", "/compare", "top cta")).toBe("cursor__-compare__top-cta");
    const long = buildSubId("meshy", "/articles/" + "a".repeat(70), "placement-" + "b".repeat(70));
    expect(long).toHaveLength(80);
    expect(sanitizeEventProperties("affiliate_click", { sub_id: long })).toEqual({ sub_id: long });
  });
});
