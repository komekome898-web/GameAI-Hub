"use client";
import type { Service } from "@/lib/schema";
import { buildSubId, track } from "@/lib/analytics";
import { getOutboundUrl } from "@/lib/services";

function routeCategory(page: string) {
  if (page.startsWith("/articles/")) return "article";
  if (page.startsWith("/tools/")) return "tool";
  if (page.startsWith("/compare")) return "compare";
  if (page.startsWith("/stacks/")) return "stack";
  if (page.includes("project")) return "project";
  return "other";
}
function productionStage(service: string) {
  if (service === "elevenlabs") return "audio";
  if (service === "meshy") return "assets";
  return "other";
}
export function OutboundLink({
  service,
  page,
  placement = "primary",
}: {
  service: Service;
  page: string;
  placement?: string;
}) {
  const affiliate = Boolean(service.affiliateUrl);
  const disclosureId = `affiliate-${service.slug}-${buildSubId(service.slug, page, placement)}`;
  return (
    <div className="cta-wrap">
      <a
        className="button"
        href={getOutboundUrl(service)}
        target="_blank"
        rel={affiliate ? "sponsored nofollow noopener" : "noopener"}
        aria-describedby={affiliate ? disclosureId : undefined}
        onClick={() => {
          const category = routeCategory(page);
          const props = {
            service: service.slug,
            service_id: service.slug,
            page,
            placement,
            sub_id: buildSubId(service.slug, page, placement),
            production_stage: productionStage(service.slug),
            source_context: category,
            route_category: category,
            affiliate,
          };
          track("outbound_click", props);
          if (affiliate) track("affiliate_click", props);
        }}
      >
        {service.freePlan === "yes"
          ? "無料枠を公式サイトで確認"
          : "公式サイトを見る"}
        {affiliate && <span className="affiliate-label">広告リンク</span>}{" "}
        <span aria-hidden>↗</span>
      </a>
      {affiliate && (
        <small id={disclosureId}>
          アフィリエイトリンクです。購入等により当サイトが報酬を受け取る場合があります。
        </small>
      )}
    </div>
  );
}
