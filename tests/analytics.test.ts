import { describe, expect, it, vi } from "vitest";
import {
  buildSubId,
  sanitizeEventProperties,
  taskStage,
  track,
  type EventName,
} from "@/lib/analytics";
import {
  googleAnalyticsInit,
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
      "affiliate_click",
    ]);
  });
  it("preserves bounded legacy page identifiers without accepting free text", () => {
    expect(sanitizeEventProperties("outbound_click", { page: "builder-result" })).toEqual({ page: "builder-result" });
    expect(sanitizeEventProperties("outbound_click", { page: "raw page with secret" })).toEqual({});
  });
  it("keeps only bounded task metadata and rejects sensitive or unbounded values", () => {
    expect(
      sanitizeEventProperties("task_completed", {
        task: "core-loop",
        task_index: 0,
        task_stage: "prototype",
        source_context: "project",
        route_category: "project",
        page: "秘密のゲーム案",
        artifact: "<html>secret token</html>",
      }),
    ).toEqual({
      task: "core-loop",
      task_index: 0,
      task_stage: "prototype",
      source_context: "project",
      route_category: "project",
    });
    expect(
      sanitizeEventProperties("task_completed", {
        task: "raw free text with spaces",
        task_index: -1,
        task_stage: "秘密",
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
  it("keeps the production GA4 measurement and config behavior", () => {
    expect(measurementId).toBe("G-B9Q283QVER");
    expect(googleAnalyticsInit).toContain("gtag('config', 'G-B9Q283QVER')");
  });
  it("dispatches a test hook and queues production events when gtag is unavailable", () => {
    vi.stubEnv("NODE_ENV", "production");
    const listener = vi.fn();
    window.addEventListener("gameai:event", listener);
    const target = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: unknown;
    };
    delete target.gtag;
    target.dataLayer = [];
    track("project_generated", {
      game_type: "2d",
      budget: "free",
      route_category: "project",
    });
    expect(listener).toHaveBeenCalledOnce();
    expect(target.dataLayer).toContainEqual([
      "event",
      "project_generated",
      { game_type: "2d", budget: "free", route_category: "project" },
    ]);
    window.removeEventListener("gameai:event", listener);
    vi.unstubAllEnvs();
  });
  it("uses gtag without also queueing a duplicate event", () => {
    vi.stubEnv("NODE_ENV", "production");
    const gtag = vi.fn();
    const target = window as typeof window & {
      gtag?: typeof gtag;
      dataLayer?: unknown[];
    };
    target.gtag = gtag;
    target.dataLayer = [];
    track("affiliate_click", {
      service_id: "meshy",
      placement: "primary",
      production_stage: "assets",
      affiliate: true,
    });
    expect(gtag).toHaveBeenCalledOnce();
    expect(target.dataLayer).toEqual([]);
    vi.unstubAllEnvs();
  });
  it("maps task ids to bounded production stages", () => {
    expect(taskStage("core-loop")).toBe("prototype");
    expect(taskStage("create-voice")).toBe("audio");
    expect(taskStage("unrecognized")).toBe("other");
  });
  it("builds stable subtracking identifiers", () =>
    expect(buildSubId("cursor", "/compare", "top cta")).toBe(
      "cursor__-compare__top-cta",
    ));
});
