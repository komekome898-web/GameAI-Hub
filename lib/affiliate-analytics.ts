import type { EventProperties } from "@/lib/analytics";

export type AffiliateAttribution = Pick<
  EventProperties,
  "article_slug" | "task_stage" | "task_index"
>;

function routeCategory(page: string) {
  if (page.startsWith("/articles/")) return "article";
  if (page.startsWith("/tools/")) return "tool";
  if (page.startsWith("/compare")) return "compare";
  if (page.startsWith("/stacks/")) return "stack";
  if (page.includes("project")) return "project";
  if (page.includes("builder")) return "builder";
  return "other";
}

function productionStage(serviceId: string) {
  if (serviceId === "elevenlabs") return "audio";
  if (serviceId === "meshy") return "assets";
  return "other";
}

function articleSlug(page: string) {
  const match = /^\/articles\/([a-z0-9][a-z0-9_-]{0,79})\/?$/.exec(page);
  return match?.[1];
}

export function affiliateEventProperties({
  serviceId,
  page,
  placement,
  affiliate,
  attribution = {},
}: {
  serviceId: string;
  page: string;
  placement: string;
  affiliate: boolean;
  attribution?: AffiliateAttribution;
}): EventProperties {
  const category = routeCategory(page);
  const slug = articleSlug(page);
  return {
    service: serviceId,
    service_id: serviceId,
    page,
    placement,
    production_stage: productionStage(serviceId),
    source_context: category,
    route_category: category,
    affiliate,
    ...(slug ? { article_slug: slug } : {}),
    ...attribution,
  };
}
