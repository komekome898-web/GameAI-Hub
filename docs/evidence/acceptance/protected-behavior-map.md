# Slice 0 protected-behavior map

This checklist binds later UI slices to executable contracts. Slice 0 does not change runtime behavior.

| Protected behavior | Executable coverage | Slice acceptance rule |
|---|---|---|
| Project intent, deterministic state, storage, source attribution, current-task → completion → next-task handoff | `tests/intent-preservation.test.ts`, `tests/project-provider.test.ts`, `tests/project-generator-client.test.tsx`, `e2e/measurement-baseline.spec.ts`, `e2e/decision-journeys.spec.ts` | Original idea/mechanic/platform survives; article source and bounded stage metadata survive; raw idea never enters URL/event evidence. |
| GA4 ID and production-only transport; collector isolation in acceptance | `tests/analytics.test.ts`, `e2e/analytics-production-harness.spec.ts`, shared `e2e/fixtures.ts` collector abort, Slice 0 network guard | Keep `G-B9Q283QVER`; local fixture makes zero real collector requests; captured diagnostics contain bounded sanitized properties only. |
| `article_view`, `affiliate_impression`, `affiliate_click`, `outbound_click` | `tests/analytics.test.ts`, `tests/article-engine.test.tsx`, `tests/outbound-link.test.tsx`, `e2e/measurement-baseline.spec.ts` | Event names and once-per-real-view/click ordering remain unchanged. |
| `article_slug`, `placement`, `service_id`, Project handoff attribution | `tests/analytics.test.ts`, `e2e/measurement-baseline.spec.ts` | Required bounded keys remain present; raw query, destination URL, idea, HTML/code, secret, and runtime error remain absent. |
| Affiliate destination fallback, disclosure, and link relation | `tests/outbound-link.test.tsx`, `tests/article-affiliate-ctas.test.tsx`, `tests/affiliate-validation.test.ts`, `e2e/decision-journeys.spec.ts` | Destination stays `affiliateUrl ?? officialUrl`; affiliate links retain `rel="sponsored nofollow noopener"`; disclosure stays visible; payout never affects order. |
| Canonical, metadata, Article/Breadcrumb schema, sitemap, robots | `tests/seo.test.ts`, `tests/article-engine.test.tsx`, `e2e/content-seo.spec.ts`, `npm run check:sitemap` | Public canonical/metadata/schema routes remain stable; parameterized Compare stays out of indexing/sitemap as currently contracted. |
| Home first-view density defect | `e2e/slice-zero-acceptance.spec.ts` expected baseline | Reproduce and label open; never invert the assertion or report fixed before Slice 2 rendered/physical-device acceptance. |
| Compare document overflow at mobile widths | `e2e/slice-zero-acceptance.spec.ts` expected baseline | Reproduce positive document overflow at 320/375/390 and label open; an owned table/code scroller must not hide it. Fix belongs to Slice 6. |
