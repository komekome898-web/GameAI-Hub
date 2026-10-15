# Issue #135 — Production, search-intent, and implementation audit

Audit date: 2026-09-25. Production origin: `https://game-ai-hub.vercel.app`.

## Production and `main` evidence

The pre-change capture set is stored in `docs/screenshots/issue-135/before/` for Home, the article hub, browser-game guide, ElevenLabs guide/commercial pages, and Meshy guide/commercial/pricing pages at 1440px, 375px, and 320px. `metrics.json` records titles, H1s, content width, and document width. Automated navigation blocked Google Analytics hosts before the first navigation.

Concrete gaps selected for this PR:

1. The global navigation exposed five peer destinations plus another Project CTA. On mobile, the same five destinations and CTA formed a long undifferentiated menu. The information architecture did not communicate the three user choices: build, choose a tool, or research.
2. Home repeated articles and Project CTAs across multiple large sections. The Project input was prominent, but the path immediately after it was difficult to predict.
3. Long articles had useful headings but no shared summary/audience block or heading-derived navigation. At 320px the browser-game and pricing pages became exceptionally long, while the reader had no route back to a section.
4. The article index was a flat card list. ElevenLabs and Meshy pillar, commercial-use, and pricing pages were not presented as intentional clusters or reading sequences.
5. Article titles used aggressive mobile wrapping rules at 320px. Tables were technically contained but lacked a consistent, explicitly scrollable reading surface.
6. Existing self-canonicals, Article and Breadcrumb JSON-LD, sitemap publication dates, robots policy, source verification, affiliate disclosure/destinations, and Project handoff semantics were sound and should be preserved rather than rewritten.

## Search and competitor review

Queries reviewed: Japanese intents for “AI browser game how-to”, “ElevenLabs game development/commercial use”, and “Meshy AI usage/commercial use/pricing”. Search-result review showed that broad queries frequently surface vendor home/pricing/docs pages and generic AI surfaces before a coherent game-production sequence. Vendor documentation is authoritative for volatile facts but separates product operation, billing, and licensing into different pages.

Observed SERP evidence (retrieved 2026-09-25; result order can vary by locale and personalization):

| Query | Observed result/page | Gap used in this implementation |
| --- | --- | --- |
| `AI ブラウザゲーム 作り方 初心者 HTML AI` | Broad OpenAI, Gemini, and AI-definition surfaces appeared; no result in the sampled leading set connected a one-file game, an observable completion check, and a next production task. | Keep the browser-game page focused on one playable file, recovery, and Project handoff; expose it first in the beginner cluster. |
| `ElevenLabs ゲーム開発 商用利用 日本語 使い方` | [ElevenLabs](https://elevenlabs.io/), [Help: What is ElevenLabs?](https://help.elevenlabs.io/hc/en-us/articles/27583713738257-What-is-ElevenLabs), and [Pricing](https://elevenlabs.io/pricing) surfaced as separate destinations. | Connect usage/integration and commercial-rights intents explicitly while retaining primary-source verification. |
| `Meshy AI 使い方 商用利用 料金 ゲーム開発` | [Meshy](https://www.meshy.ai/), [official Pricing](https://www.meshy.ai/pricing), [official Docs](https://docs.meshy.ai/en), plus third-party feature/guide pages such as `meshyiai.com` appeared. | Provide a visible sequence across operation/export, credit budgeting, and rights rather than blending volatile claims into one page. |

Google primary references: [Search Essentials](https://developers.google.com/search/docs/essentials), [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), and [Breadcrumb structured data](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

Patterns abstracted without copying wording or design:

- answer the intent before asking for a click;
- group task, commercial-use, and price pages into an explicit sequence;
- expose descriptive anchors rather than generic “related” links;
- keep factual claims tied to dated primary sources;
- use one clear next action after the reader has enough context.

Google primary guidance reviewed: Search Essentials, SEO Starter Guide, Article structured data, and Breadcrumb structured data. The implementation therefore keeps descriptive titles/H1s, crawlable native links, one self-canonical per page, content-matching Article/Breadcrumb markup, visible people-first copy, and the existing sitemap/robots approach. It does not add hidden text, unsupported review/rating schema, FAQ schema, or new thin pages.

## Cannibalization decision

The three Meshy pages are retained because they serve distinct intents: operation/export, licensing/commercial use, and pricing/credit budgeting. The two ElevenLabs pages remain separated into operation/integration and commercial-rights intent. The article hub now names those relationships and reading order. Search Console query-level evidence was not available in this environment and remains a post-release validation item. No page is deleted or noindexed without that evidence; no new article is introduced to mask overlap.

## Scope chosen

This PR changes shared navigation, Home decision paths, the article hub, and the shared ArticleFrame reading layer. It deliberately does not rewrite each article or alter factual/affiliate destinations. This creates a measurable journey: entry → choose one of three intents → scan summary/TOC → read → follow cluster/Project handoff.
