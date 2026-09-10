"use client";
import type { Service } from "@/lib/schema";
import { buildSubId, track } from "@/lib/analytics";
import {
  affiliateEventProperties,
  type AffiliateAttribution,
} from "@/lib/affiliate-analytics";
import { getOutboundUrl } from "@/lib/services";
import { useAffiliateImpression } from "@/components/useAffiliateImpression";
export function OutboundLink({
  service,
  page,
  placement = "primary",
  attribution,
  label,
}: {
  service: Service;
  page: string;
  placement?: string;
  attribution?: AffiliateAttribution;
  label?: string;
}) {
  const affiliate = Boolean(service.affiliateUrl);
  const disclosureId = `affiliate-${service.slug}-${buildSubId(service.slug, page, placement)}`;
  const properties = affiliateEventProperties({
    serviceId: service.slug,
    page,
    placement,
    affiliate,
    attribution,
  });
  const impressionRef = useAffiliateImpression(affiliate, properties);
  return (
    <div className="cta-wrap">
      <a
        ref={impressionRef}
        className="button"
        href={getOutboundUrl(service)}
        target="_blank"
        rel={affiliate ? "sponsored nofollow noopener" : "noopener"}
        aria-describedby={affiliate ? disclosureId : undefined}
        onClick={() => {
          const props = {
            ...properties,
            sub_id: buildSubId(service.slug, page, placement),
          };
          track("outbound_click", props);
          if (affiliate) track("affiliate_click", props);
        }}
      >
        {label ?? (service.freePlan === "yes"
          ? "無料枠を公式サイトで確認"
          : "公式サイトを見る")}
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
