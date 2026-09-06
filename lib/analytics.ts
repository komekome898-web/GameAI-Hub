export type EventName =
  | "tool_view"
  | "stack_view"
  | "stack_to_builder"
  | "compare_start"
  | "compare_view"
  | "outbound_click"
  | "affiliate_click"
  | "calculator_start"
  | "calculator_complete"
  | "diagnosis_start"
  | "diagnosis_complete"
  | "builder_start"
  | "builder_step"
  | "builder_complete"
  | "project_start"
  | "project_clarify"
  | "project_generated"
  | "project_section_view"
  | "project_prompt_copy"
  | "project_export"
  | "project_share"
  | "article_view"
  | "article_to_project"
  | "first_task_viewed"
  | "task_completed"
  | "next_task_reached";

type AnalyticsValue = string | string[] | number | boolean;
type EventProperty =
  | "service"
  | "service_id"
  | "page"
  | "placement"
  | "cta_placement"
  | "services"
  | "stack"
  | "step"
  | "game_type"
  | "budget"
  | "sub_id"
  | "category"
  | "rule_version"
  | "section"
  | "artifact"
  | "format"
  | "missing_count"
  | "source"
  | "source_context"
  | "article_slug"
  | "task"
  | "task_index"
  | "task_stage"
  | "production_stage"
  | "route_category"
  | "affiliate";
export type EventProperties = Partial<Record<EventProperty, AnalyticsValue>>;
type Gtag = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>,
) => void;

const allowlist: Record<EventName, readonly EventProperty[]> = {
  tool_view: ["service", "page"],
  stack_view: ["stack", "page"],
  stack_to_builder: ["stack", "page"],
  compare_start: ["services", "page"],
  compare_view: ["services", "page"],
  outbound_click: [
    "service",
    "service_id",
    "page",
    "placement",
    "sub_id",
    "production_stage",
    "source_context",
    "route_category",
    "affiliate",
  ],
  affiliate_click: [
    "service",
    "service_id",
    "page",
    "placement",
    "sub_id",
    "production_stage",
    "source_context",
    "route_category",
    "affiliate",
  ],
  calculator_start: ["category"],
  calculator_complete: ["category"],
  diagnosis_start: ["rule_version"],
  diagnosis_complete: ["rule_version"],
  builder_start: ["page"],
  builder_step: ["step", "page"],
  builder_complete: ["page", "game_type", "budget"],
  project_start: [
    "page",
    "source",
    "source_context",
    "article_slug",
    "route_category",
  ],
  project_clarify: ["missing_count"],
  project_generated: [
    "game_type",
    "budget",
    "source_context",
    "article_slug",
    "route_category",
  ],
  project_section_view: ["section"],
  project_prompt_copy: ["artifact"],
  project_export: ["format"],
  project_share: ["format"],
  article_view: ["article_slug", "route_category"],
  article_to_project: [
    "page",
    "placement",
    "article_slug",
    "cta_placement",
    "source_context",
    "route_category",
  ],
  first_task_viewed: [
    "task",
    "task_index",
    "task_stage",
    "source_context",
    "route_category",
  ],
  task_completed: [
    "task",
    "task_index",
    "task_stage",
    "source_context",
    "route_category",
  ],
  next_task_reached: [
    "task",
    "task_index",
    "task_stage",
    "source_context",
    "route_category",
  ],
};

const token = /^[a-z0-9][a-z0-9_-]{0,79}$/;
const route = /^\/(?:[a-z0-9][a-z0-9_/-]{0,118})?\/?$/;
const stages = new Set([
  "setup",
  "prototype",
  "assets",
  "audio",
  "publish",
  "verify",
  "other",
]);
const routeCategories = new Set([
  "home",
  "article",
  "project",
  "tool",
  "compare",
  "stack",
  "builder",
  "other",
]);

function safeProperty(
  key: EventProperty,
  value: unknown,
): value is AnalyticsValue {
  if (key === "task_index" || key === "step" || key === "missing_count")
    return (
      Number.isInteger(value) &&
      (value as number) >= 0 &&
      (value as number) <= 100
    );
  if (key === "affiliate") return typeof value === "boolean";
  if (key === "services")
    return (
      Array.isArray(value) &&
      value.length <= 10 &&
      value.every((item) => typeof item === "string" && token.test(item))
    );
  if (key === "page")
    return typeof value === "string" && (route.test(value) || token.test(value));
  if (key === "task_stage" || key === "production_stage")
    return typeof value === "string" && stages.has(value);
  if (key === "route_category")
    return typeof value === "string" && routeCategories.has(value);
  return typeof value === "string" && token.test(value);
}

export function sanitizeEventProperties(
  name: EventName,
  properties: EventProperties,
): Record<string, AnalyticsValue> {
  const clean: Record<string, AnalyticsValue> = {};
  for (const key of allowlist[name]) {
    const value = properties[key];
    if (safeProperty(key, value)) clean[key] = value;
  }
  return clean;
}

export function track(name: EventName, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;
  const safe = sanitizeEventProperties(name, properties);
  window.dispatchEvent(
    new CustomEvent("gameai:event", { detail: { name, properties: safe } }),
  );
  if (process.env.NODE_ENV === "production") {
    const target = window as typeof window & {
      gtag?: Gtag;
      dataLayer?: unknown[];
    };
    if (target.gtag) target.gtag("event", name, safe);
    else {
      target.dataLayer = target.dataLayer || [];
      target.dataLayer.push(["event", name, safe]);
    }
  } else console.debug("[GameAI analytics]", name, safe);
}

export function buildSubId(service: string, page: string, placement: string) {
  return [service, page, placement]
    .map((value) => value.replace(/[^a-z0-9_-]/gi, "-"))
    .join("__")
    .slice(0, 100);
}

export function taskStage(taskId: string): string {
  if (["environment", "concept", "repository"].includes(taskId)) return "setup";
  if (["core-loop", "gameplay", "vertical-slice"].includes(taskId))
    return "prototype";
  if (taskId.includes("voice") || taskId.includes("audio")) return "audio";
  if (
    taskId.includes("image") ||
    taskId.includes("asset") ||
    taskId.includes("model")
  )
    return "assets";
  if (taskId.includes("publish") || taskId.includes("release"))
    return "publish";
  if (taskId.includes("test") || taskId.includes("verify")) return "verify";
  return "other";
}
