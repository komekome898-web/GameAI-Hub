# Content & SEO Engine — Phase 1 architecture and audit

Last audited: 2026-09-02

## Product thesis

- **Job:** a Japanese beginner arriving from search must understand one production decision and be able to start one observable game artifact next.
- **Value:** articles add field evidence, production order, failure modes, sources, and contextual handoffs that a generic tool list does not provide.
- **Journey:** search → article → only the relevant guide/tool/compare evidence → contextual Project Generator handoff → first build task.
- **Data:** a typed article registry is the source for metadata, dates, categories/tags, related links, CTA context, structured data, and sitemap entries.
- **Rules:** related links are editorially selected, not automatic keyword matches; affiliate status/payout is absent from this model; unknown or time-sensitive claims require current primary sources.
- **Not built:** bulk pillar copy, automatic SEO prose, pay-to-rank, generic affiliate blocks, or invented SERP conclusions.

## Current-state audit

| Area | Before Phase 1 | Phase 1 decision |
|---|---|---|
| Articles | Two hard-coded pages; no index or shared record | Keep body copy, migrate identity/editorial chrome to typed registry |
| Metadata | Per-page title/description/canonical | Generate from one record, including article Open Graph dates/tags |
| Structured data | Breadcrumbs only on tool/stack pages | Add valid `Article` and `BreadcrumbList` using absolute canonical URLs |
| Taxonomy | Free-text eyebrow labels | Six controlled categories; focused descriptive tags, no tag index pages until they carry distinct value |
| Internal links | Manual and mostly Project-only | Curated related evidence links with explicit content kind |
| CTA measurement | Article CTA was not measured | `article_to_project` with allowlisted page and placement only; never free text |
| Sitemap | Article slugs manually duplicated | Registry-driven article URLs and `updatedAt`; `/articles/` index included |
| Sources/dates | Not consistently visible | Published/updated/editorial note/source policy visible on each article |
| Index coverage | Compare correctly noindex; articles indexable | Canonical article index/details only; no query/tag thin pages |

## Content architecture and conventions

- `beginner`: broad starting decisions and a first playable slice.
- `tool`: a verified tool inside a concrete production workflow.
- `genre`: genre-specific slice, asset constraints, and done criteria.
- `comparison`: project/stage-specific decision criteria; no universal winner.
- `practical-guide`: reusable procedures and checks.
- `field-note`: first-hand failures/lessons, clearly distinguished from product specifications.
- Tags describe a real cross-cutting production concern. Tags do not create indexable pages in Phase 1.
- One primary category, up to a small set of tags, one contextual Project CTA, and 2–4 curated related evidence pages per article.

## Editorial and update convention

1. Separate first-hand observation, editorial inference, and provider fact.
2. Provider capabilities, availability, prices, terms, and commercial-use conditions require current official primary sources.
3. Show publication and meaningful-update dates. Do not change `updatedAt` for formatting-only edits.
4. Link sources near claims when a future pillar is published; retain a source list for auditability.
5. If research is incomplete, keep the page as a brief and out of the sitemap rather than publish thin copy.
6. Affiliate links may appear only at a real production need, retain disclosure/tracking/rel/fallback, and never affect ordering or related-link selection.

## Index and measurement baseline

Technical repository baseline: canonical trailing-slash URLs; parameterized Compare is `noindex`; sitemap contains only canonical public routes; robots points at the production sitemap and excludes query URLs; Search Console ownership remains in root metadata.

Operational baseline still required from Work/Search Console on launch date: indexed/not-indexed counts, submitted sitemap status, impressions/clicks/CTR/position by existing article, and branded/non-branded query split. Record the exact date range and export rather than estimating absent access.

Post-launch at 7/28 days: inspect `article_to_project` by `page`/`placement`, Project starts after organic article landings, index coverage, queries per cluster, and pages with impressions but weak CTR. Do not use traffic alone as publication success.
