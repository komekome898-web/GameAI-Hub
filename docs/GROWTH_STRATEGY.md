# GameAI Hub Growth Strategy

Last updated: 2026-09-02

This document is the canonical growth direction for GameAI Hub. It complements the root `AGENTS.md`. Product safety, factuality, affiliate neutrality, rendered QA, analytics, SEO ownership and protected behavior in `AGENTS.md` remain authoritative.

## 1. Mission

GameAI Hub is not a generic AI-tool directory and must not become a thin SEO-content farm.

The product should grow into a Japanese **AI game-development media + execution product** that connects:

> Search / discovery → useful content → Project Generator → guided game-building → production-tool usage → continued progress → sustainable revenue

The core user outcome remains practical execution:

> A person with little or no game-development experience can describe the game they want to make, understand the next concrete action, use the right AI/tool, verify the result, and continue toward a playable/releasable game.

Content exists to help users make better game-development decisions and to bring qualified users into that workflow.

## 2. Growth flywheel

1. **Acquire** — rank for high-intent Japanese queries around AI game development, tools, comparisons and genres.
2. **Help** — answer the actual task with useful steps, examples, risks, sources and decision criteria.
3. **Activate** — move the reader naturally into Project Generator / beginner build navigation when personalized execution is more useful than more reading.
4. **Progress** — help users complete first and subsequent game-building tasks.
5. **Monetize naturally** — surface relevant affiliate tools only at the production stage where they are useful; later add paid plans/kits when product value supports them.
6. **Learn** — use Search Console, GA4 and product funnel data to improve the highest-value clusters and journeys.

Traffic alone is not the primary success metric. The important outcome is qualified organic users who begin and continue game creation.

## 3. Product/content architecture

### Layer A — SEO media
Purpose: acquire and educate users.

Core content clusters:

1. **AI game-development beginners**
   - AIでゲームを作る方法
   - プログラミング未経験でもAIでゲームは作れるか
   - ChatGPT / Codex / Claude Code / Geminiでゲームを作る方法
   - ブラウザゲーム、スマホゲームをAIで作る方法
   - AIゲーム開発の費用、失敗、始め方

2. **Tool-specific practical guides**
   - Codex, Claude Code, ChatGPT, Gemini
   - Meshy, ElevenLabs and other verified production tools
   - Focus on real game-production workflows, not generic service summaries.

3. **Game genre × AI**
   - browser / 2D / 3D / RPG / monster collection / visual novel / voice-heavy games
   - each page should explain a realistic first playable slice and tool workflow.

4. **Comparison / decision content**
   - Codex vs Claude Code
   - Meshy vs alternatives
   - game-oriented coding, 3D, image, voice and audio comparisons
   - decision criteria must be project/stage specific, not unsupported rankings.

5. **Field notes / failures / operating lessons**
   - first-hand lessons from AI-assisted development, QA failures, cloud-task recovery, UI review failures, prompt mistakes and workflow design.
   - these should provide experience that generic AI aggregators cannot easily reproduce.

### Layer B — Tools / Compare / Stacks / Guides
Purpose: support decisions with structured, sourced, project-aware information.

These pages are secondary evidence surfaces, not the beginner product's main flow.

### Layer C — Project Generator / Beginner Build Navigator
Purpose: convert information into execution.

This is the core product, not the articles. Organic content should point here when personalization or execution is the next useful step.

### Layer D — Future paid value
Do not rush paid implementation before free product value is proven.

Potential later layers:
- deeper Game Plan / Pro Builder
- production kits by game type
- explicit sponsored placements separated from ranking
- ads on informational surfaces only when traffic justifies them

## 4. SEO principles

### People-first, not volume-first
Do not create large batches of low-value AI-generated articles for the sake of page count.

Every new content page must define before implementation:
- target query / topic
- search intent
- real user problem
- unique GameAI Hub value
- what evidence/sources are needed
- internal links
- Project Generator CTA relevance
- monetization relevance, if any
- what would make the page materially better than a generic AI answer

If the unique value is only “more words” or “a list of tools”, do not publish it.

### Factual integrity
Follow root `AGENTS.md`.

Never invent or silently assume:
- pricing
- commercial-use rights
- current features
- availability
- rankings
- user counts
- ratings/reviews
- conversion claims

Unknown stays unknown. Time-sensitive claims require current verification.

### Content quality
Prefer:
- actual procedures
- concrete examples
- screenshots/evidence when useful
- decision trees
- realistic production constraints
- failure modes
- what happens after the prompt is sent
- what “done” looks like

Avoid:
- generic intros padded for word count
- unsupported “best” claims
- repetitive tool descriptions
- SEO-first keyword stuffing
- content whose only purpose is affiliate placement

## 5. Initial content program

Do not begin with 100 articles. Establish quality and funnel behavior with a focused first set.

### First 10 pillar topics

1. AIでゲームを作る方法
2. 初心者がAIでゲームを作る完全ガイド
3. Codexでゲームを作る方法
4. Claude Codeでゲームを作る方法
5. ChatGPTでゲームを作る方法
6. AIゲーム開発ツールの選び方
7. AIでブラウザゲームを作る方法
8. AIでノベルゲームを作る方法
9. AIで3Dゲームを作る方法
10. Codex vs Claude Code — ゲーム開発ではどう選ぶか

After these pages have been indexed and measured, expand to roughly 30–40 high-value pages based on Search Console/query data rather than publishing a fixed quota blindly.

## 6. Internal linking and conversion design

Content must not be a dead end.

Use a deliberate path:

> Article → relevant Tool / Compare / Guide evidence → Project Generator or Beginner Build Navigator

However, do not force unnecessary intermediate pages. If the reader's next logical step is to build, link directly to the Project Generator.

### CTA rule
A CTA should describe the next useful outcome, not simply “click here”. Examples:
- 「このゲームの最初の制作手順を作る」
- 「自分のゲーム条件でAI構成を決める」
- 「このジャンルの最初の1作業を生成する」

### Affiliate rule
Affiliate CTAs belong where a real production need appears.

Examples:
- voice stage → verified ElevenLabs path
- 3D generation stage → verified Meshy path

Affiliate payout must never influence recommendation ranking, scoring or editorial conclusion.

## 7. Metrics

### Acquisition
- Search Console impressions
- organic clicks
- CTR
- average position by query/page/cluster
- indexed pages / indexing problems

### Engagement
- article depth/engagement where available
- article → Project CTA clicks
- article → tool/compare clicks

### Activation / product
- project_start
- project_generated
- first task viewed
- first task completed
- second task completed / continued session

### Revenue
- affiliate_click
- affiliate CTR by stage/page/placement
- downstream commission/conversion when provider reporting is available

Do not optimize pageviews at the expense of activation, completion or trust.

## 8. Work allocation: Chat / Work / Codex

### Chat — strategy and orchestration
Chat is responsible for:
- growth strategy
- keyword/content-cluster prioritization
- content briefs
- funnel design
- monetization design
- interpreting Search Console/GA4 findings
- writing precise implementation/research instructions for Work and Codex
- GitHub coordination when useful

Chat should not treat code inspection as final rendered UX acceptance.

### Work — browser research and real-world acceptance
Work is responsible for:
- live Google/SERP research
- competitor/site research
- production-site interaction
- article readability/usefulness review
- mobile review
- CTA / affiliate-flow review
- post-deploy acceptance
- Search Console inspection when available

Work should treat actual search results and rendered production behavior as primary evidence, not PR descriptions.

### Codex — implementation and technical content system
Codex is responsible for:
- SEO/content infrastructure
- article/category/tag systems
- structured data
- metadata/canonicals/sitemap
- internal-link/related-content components
- analytics events
- article implementation from approved briefs
- Tool/Compare/Guide integration
- tests/build/E2E
- branch/checkpoint/push/PR/merge workflow when explicitly approved

Codex must follow `AGENTS.md`, relevant scoped `AGENTS.md`, issue acceptance criteria and checkpoint/push rules. It must not mass-generate unreviewed low-value content.

## 9. Standard operating pipeline

Use this pipeline for substantial growth/content work:

1. **Chat** defines objective, target audience, funnel hypothesis and research questions.
2. **Work** researches actual SERPs/competitors/user experience and returns evidence.
3. **Chat** converts evidence into a prioritized content/product brief with measurable success criteria.
4. **Codex** implements on a protected branch with checkpoints and tests.
5. **Work** reviews the rendered Preview/Production page as a real user and checks search/content intent.
6. **Codex** fixes P0/P1/high-impact P2 findings and reruns gates.
7. **Work** rechecks if the change affects rendered UX/content.
8. Merge only when required acceptance criteria pass.
9. **Search Console + GA4** provide post-launch performance evidence.
10. **Chat** reviews performance and chooses the next cluster/experiment.

## 10. Phase roadmap

### Phase 1 — Content & SEO Engine
Build a scalable, evidence-based content system before publishing many pages.

Deliverables:
- current SEO/content audit
- keyword/topic map
- content architecture
- reusable article metadata/content model
- categories/tags where useful
- Article structured data where valid
- breadcrumbs
- related content
- internal linking
- CTA analytics
- sitemap/index coverage
- editorial/source/updated-date conventions
- first 10 pillar pages
- Work browser acceptance
- Search Console measurement baseline

### Phase 2 — Cluster expansion
Expand the clusters that show impressions, clicks, activation or revenue potential.

### Phase 3 — Conversion optimization
Improve organic landing page → Project Generator → first-task completion.

### Phase 4 — Revenue expansion
Increase natural affiliate coverage and, only when product value supports it, revisit paid plans/kits/sponsors/ads.

## 11. Immediate project priority

The next major project is:

> **GameAI Hub Content & SEO Engine — Phase 1**

Do not start by asking Codex to publish dozens of articles. First establish the content architecture, measurement, research workflow, quality gates and first 10 pillar briefs/pages.

The corresponding GitHub epic should be treated as the task-level execution source, while this document remains the canonical strategy reference.
