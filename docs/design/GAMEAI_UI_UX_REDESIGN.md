# GameAI Hub UI/UX redesign contract

Status: **Phase 1 design contract — implementation not started**  
Issue: [#137](https://github.com/komekome898-web/GameAI-Hub/issues/137)  
Baseline: `origin/main` at `91e99e4ef1fc0dbbfab326a180a5265834a93502`  
Production observed: `https://game-ai-hub.vercel.app`  
Phase 1 observation date: 2026-09-26

## 1. Executive summary

GameAI Hub must make its execution loop legible before it displays the breadth of its catalogue:

> idea → conditions → Project → current task → AI/tool → artifact → verification → completion → next task/recovery

The redesign is not a reskin. The current product has useful execution, evidence, reading, and disclosure behavior, but its presentation is assembled from route-specific scales, dense repeated surfaces, and many late mobile overrides. Two P1 findings establish the immediate need:

1. **Home first-view failure.** The owner's Production iPhone evidence confirms that the heading/full hero composition dominates the first viewport and pushes the concrete action context down. Fresh viewport emulation reproduced an H1 height of 273.8px at 390px, 263.2px at 375px, and 224.5px at 320px. This is a composition failure—not merely one oversized declaration—because the eyebrow, 4–5-line heading, lead, trust list, form, and demonstration board compete before the user reaches the next decision.
2. **Compare document overflow.** Fresh emulation reproduced document widths of 427px at 390px and 375px, and 418px at 320px: overflow of 37px, 52px, and 98px respectively. The picker search label/input renders at 393px. Document-level horizontal overflow is blocking under the repository UI acceptance policy.

Phase 2 must first introduce shared, mobile-first foundations without changing product semantics. It then migrates shared chrome and routes in reversible slices. Every route must answer: what is this, what should I do now, what do I get, and how does it advance the same game? Project remains the core execution product; Tools, Compare, Guides, and Articles remain supporting evidence surfaces.

## 2. Evidence, provenance, and limitations

### 2.1 Evidence classes

| Class | Evidence used | What it can establish |
|---|---|---|
| Confirmed physical-device | Owner's Production iPhone Home screenshot/finding recorded in Issue #137 | Actual iPhone first-view density: the H1/full hero consumes most of the viewport and execution context is pushed below the fold. |
| Fresh Production emulation | Headless Chromium, CSS viewports 390×844, 375×844, and 320×844 on 2026-09-26 | Responsive geometry, wrapping, document overflow, and route availability. It is **not** physical-device evidence. |
| Fresh HTTP observation | Production requests to the ten routes below on 2026-09-26 | Each route responded HTTP 200; not proof of visual or interaction quality. |
| Repository audit | `app/globals.css`, route modules, shared components, analytics/project/recommendation code and tests at the baseline | Structural causes, existing behavior to preserve, and implementable migration boundaries. |
| Durable prior finding | Issue #137 comments and the owner-authorized resume prompt | Findings that were already reproduced and durably recorded; revalidated only where necessary. |

### 2.2 Fresh geometry

| Route / metric | 390px | 375px | 320px |
|---|---:|---:|---:|
| Home H1 height | 273.8px | 263.2px | 224.5px |
| Home lead bottom | 527.1px | 516.6px | 457.9px |
| Home idea form top | 643.1px | 632.5px | 573.8px |
| Compare document width | 427px | 427px | 418px |
| Compare overflow | **37px** | **52px** | **98px** |
| Compare picker search input width | 393px | 393px | 393px |

The Home measurements explain, but do not replace, the owner's physical-device evidence. At all three emulated widths the form begins well after the heading and lead; at 390/375 the form begins below three quarters of an 844px viewport before its contents are considered.

### 2.3 Routes reviewed

Production returned HTTP 200 for Home (`/`), Project (`/project/`), Articles (`/articles/`), browser-game article, ElevenLabs guide, Meshy guide, Tools (`/tools/`), Guides (`/guides/`), Compare (`/compare/`), and Privacy (`/privacy/`). The audit combines rendered findings above with route/component source inspection; it does not claim every state was interacted with.

### 2.4 Explicitly untested

- Physical Android, additional iPhone models, touch latency, safe-area behavior, OS text sizing, soft keyboard, long-press, and file/download flows.
- Screen-reader passes with VoiceOver, TalkBack, NVDA, or JAWS.
- Current Production at 200% browser zoom / 320px equivalent reflow.
- All generated Project variants, provider failures, rate limits, invalid/empty recovery, saved progress, share/back-forward flows, and every long user idea.
- Compare with every 1–4-tool selection, URL/deep-link combination, no-result search, and unusually long service metadata.
- Tools filters/search combinations and every Guide/Tool detail.
- Keyboard traversal and focus order across every route; automated source review is not a keyboard test.
- Color contrast after implementation; the proposed tokens require computed-color verification in rendered states.
- Vercel Preview and Production for Phase 2, because Phase 1 changes documentation only.

These remain acceptance work, not implicit passes.

## 3. Current-state audit

Severity follows repository definitions: P0 broken/unsafe; P1 major failure; P2 meaningful weakness; P3 polish.

### 3.1 Route-by-route

| Route | Current strengths to preserve | Findings | Redesign requirement |
|---|---|---|---|
| Home | Explains a concrete output; offers idea entry; shows an example production board; links to Project/content. | **P1:** confirmed first-view failure. Too many pre-decision elements and a very tall headline make the actionable promise late. Below it, three-path cards, process, featured content, and examples repeat competing onward routes. | First viewport must contain a compact promise, what the user receives, and a visible primary idea action. One secondary “see an example” link. Defer browse paths and editorial inventory. |
| Project | Core intent-to-plan flow, conditions, roadmap/current task, prompts, artifacts, done criteria, recovery, contextual tools. | **P2:** many custom panels and dense state-dependent controls make hierarchy fragile; form/result/error/empty states do not share one explicit visual grammar. Long generated/user content is a reflow risk. | Use a stable stage shell: context → current task → instruction/artifact → done criteria → next/recovery. Preserve all intent and URL/local state. Progressive disclosure for roadmap/evidence. |
| Articles Hub | Topic clusters and Project handoff support the growth funnel. | **P2:** dense three-column cards, tags, metadata and repeated card CTAs make scanning inventory-heavy. Hero/jump chips consume early space. | Lead with three user intents, then compact cluster lists. One clear Project handoff after meaningful context, not on every card. |
| Browser-game article | Concrete playable example, prompts, checkpoints, recovery and Project continuation. | **P2:** long heading, contract, reading guide, code, inline handoffs and final CTA compete; small-screen code and repeated framed sections can feel like nested cards. | Article header → concise answer → task outline/TOC → procedure → verification/recovery → same-game continuation. Code owns horizontal scrolling; document never does. |
| ElevenLabs article | Explicit promotion disclosure, bounded first audio task, observable checks, sources, Project handoff. | **P2:** affiliate and Project actions can repeat around long procedure; decision grids and section chrome add density. | Disclosure before first affiliate link; commercial action only at a relevant production decision. Keep editorial conclusion and Project alternative adjacent. |
| Meshy article | One-asset scope, export decisions, engine checks, licensing cautions and same-game continuation. | **P2:** tables/grids and inline handoffs create multiple competing focal surfaces; long title is demanding on mobile. | Same article system; comparison data uses accessible responsive table/card treatment without hiding headers or facts. |
| Tools | Artifact-first framing and verified/unknown distinctions are trustworthy. Filters and loading state exist. | **P2:** hero metadata plus filter controls and tool cards create a directory-first experience; repeated bordered surfaces dilute the next action. | Start with “what artifact are you making?” segmented/filter choice, show active criteria and results count, then concise result rows/cards with evidence state and one action. |
| Guides | Guides connect structured evidence to tasks. | **P2:** visually similar inventory cards do not strongly distinguish guide purpose, required input, and outcome. | Organize by production stage; each item states task, prerequisite, output, and estimated complexity only when evidence supports it (no invented time). |
| Compare | Evidence-first framing and maximum-four selection are appropriate; canonical robots behavior intentionally differs. | **P1:** 37/52/98px document overflow at 390/375/320 from picker search. **P2:** selection and decision summary/table can overload narrow screens. | Fix intrinsic sizing at the component boundary. On mobile: selection tray → recommendation caveats → attribute groups rendered as stacked per-criterion comparisons; desktop may use a table. Preserve URL selection. |
| Privacy | Required trust/legal content. | **P2:** generic long-form styling can obscure scan anchors and contact/analytics/affiliate distinctions. | Compact legal header, generated section navigation where useful, readable measure, deep-linkable headings, no promotional CTA. |
| Header/mobile menu | Semantic nav, current-page state, explicit menu button/expanded state and Project CTA exist. | **P2:** desktop breadth and mobile grouped links expose product taxonomy before user intent; sticky header consumes scarce vertical space. | One brand link, 3 primary destinations, Project action. Mobile menu is a modal-like disclosure with clear groups, focus behavior, Escape/outside close, and no background ambiguity. |
| Footer | Provides secondary/legal destinations. | **P2:** broad link inventory can become an undifferentiated final directory. | Group into “Make,” “Learn/choose,” and “Trust”; retain disclosure/privacy/methodology; no duplicate primary CTA. |

### 3.2 Shared elements

- **Cards:** too many layouts use border + radius + panel fill + eyebrow + heading + body + bottom CTA. Reserve cards for independently actionable/selectable objects. Use plain lists/sections for narrative grouping.
- **CTA hierarchy:** route-specific buttons/links and repeated end cards weaken primary-action priority. Each viewport region has at most one primary action; one route-level primary outcome; secondary actions are links or neutral buttons.
- **Forms:** labels, help, validation, loading, success, and retry need persistent reserved locations. Never use placeholder-only labels. User ideas and generated content must wrap without leaking into analytics.
- **Tables:** semantic tables remain tables on desktop. At narrow widths either use an owned horizontal scroller with visible affordance or an equivalent labelled per-criterion stack; never allow document scrolling sideways.
- **Code:** code/prompt blocks use monospace, copy status, wrapping by content type, and a local scroller for truly unbreakable code. Long tokens/URLs must stay inside the block.
- **Breadcrumbs:** retain semantic route context but collapse redundant terminal labels at 320px only if the current H1 still names the page; retain accessible names.
- **Disclosure:** promotion disclosure appears before the first commercial link, is plain language, and is visually distinct without alarm styling.
- **Empty/loading/error:** current isolated loading panels are not a complete state system. Every async surface must preserve layout, name the affected task, and give retry/recovery when failure is actionable.

## 4. Systemic root causes

1. **Route-specific rather than semantic type scale.** Headings are separately tuned for Home, article, Project and directories. Viewport-width formulas amplify long Japanese headings without bounding the whole hero's height.
2. **Desktop-first compression.** The stylesheet repeatedly collapses multi-column grids at `900`, `800`, `680`, `640`, `520`, `480`, `400`, `380`, `340`, and even `200px`. Mobile behavior is a sequence of repairs rather than the default composition.
3. **Fragmented styling vocabulary.** The single 539-line global stylesheet contains roughly 334 distinct class selector names, 210 unique hex values and many repeated breakpoint blocks. The exact count is diagnostic, not a quality target: semantics are obscured by local literals and variants.
4. **Global selector coupling.** Route and descendant selectors (`.article-content>section`, route-specific heading overrides, generic panel/button rules) make local migrations capable of changing unrelated screens.
5. **Density mistaken for proof.** Trust claims, metadata chips, cards, borders and CTAs often appear simultaneously. Evidence is valuable, but constant framing makes the current action harder to find.
6. **Surface proliferation.** Cards, boards, panels, callouts, pills, disclosures, handoffs and result boxes use overlapping visual treatments without a finite responsibility model.
7. **Intrinsic-size ownership is unclear.** Compare's 393px picker search child exceeds its narrow parent and propagates width to the document. Similar risks exist for code, URLs, tables, generated text and grid children.
8. **Product and editorial flows meet through repeated promotion.** Article → Project is correct, but repeated framed handoffs can feel commercial and break reading rhythm. One contextual continuation is stronger than numerous generic CTAs.
9. **State styling is local.** Loading, empty, validation, warning, success, stale/unknown evidence and disabled states lack shared tokens and predictable language.

## 5. Design principles and reference abstractions

1. **Action before inventory.** Start with the user's task and expected output, then expose supporting choices.
2. **One game context.** Never replace genre, mechanic, audience, platform, or production constraints. Every continuation describes what carries forward.
3. **Progressive disclosure, not omission.** Keep evidence, sources, caveats and advanced choices reachable; do not make them compete with the current action.
4. **Mobile is the base composition.** Add columns only when content gains meaning from adjacency.
5. **Fewer, named primitives.** A component exists because it has a responsibility/state contract, not because it has a visual variant.
6. **Evidence before commercial action.** Unknown stays unknown; sponsorship and promotion remain explicit; payout never changes rank or conclusions.
7. **Observable completion.** Every execution surface names what to do, what artifact results, how to verify it, and how to recover.

Reference patterns are abstracted, not copied:

- W3C WCAG 2.2 [Reflow (1.4.10)](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Focus Appearance (2.4.13)](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html), and [Target Size (2.5.8)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) define outcome constraints for narrow layouts, focus, and controls.
- WAI's [table guidance](https://www.w3.org/WAI/tutorials/tables/) informs retained header relationships; responsive presentation must not discard semantics.
- GOV.UK's [task-list pattern](https://design-system.service.gov.uk/patterns/task-list-pages/) demonstrates task status and next-action hierarchy. GameAI Hub adopts the concept of explicit state, not its brand or visual identity.
- MDN's [responsive design guidance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) supports content-driven layout and flexible media rather than device-specific replicas.
- Japan Consumer Affairs Agency guidance remains the authority for unambiguous advertising representation; design must keep disclosures proximal and understandable rather than visually minimizing them.

## 6. Design tokens

Token values are the Phase 2 starting contract. Changes require rendered comparison and an updated acceptance record, not route-local overrides.

### 6.1 Typography

Use the existing Japanese-capable sans stack initially to avoid a font-loading migration. `1rem = 16px`. `clamp()` formulas are bounded; no heading grows solely with viewport width.

| Token | Formula / range | Line height | Weight | Intended use |
|---|---|---:|---:|---|
| `--type-display` | `clamp(2.25rem, 1.95rem + 1.35vw, 3.25rem)` (36–52px) | 1.12 | 800 | Short desktop marketing statement only; Home mobile uses H1 token. |
| `--type-h1` | `clamp(1.875rem, 1.72rem + .65vw, 2.5rem)` (30–40px) | 1.22 | 800 | Route title; Japanese target 2–4 lines at 320px. |
| `--type-h2` | `clamp(1.5rem, 1.39rem + .42vw, 1.875rem)` (24–30px) | 1.32 | 750 | Major section. |
| `--type-h3` | `clamp(1.1875rem, 1.13rem + .2vw, 1.375rem)` (19–22px) | 1.4 | 750 | Subsection/card name. |
| `--type-body-lg` | `clamp(1.0625rem, 1.03rem + .12vw, 1.125rem)` (17–18px) | 1.75 | 400 | Leads/answers, not all body copy. |
| `--type-body` | `1rem` (16px) | 1.75 | 400 | Default Japanese body/forms. |
| `--type-small` | `.875rem` (14px) | 1.6 | 400/600 | Help, source metadata, secondary status. |
| `--type-meta` | `.75rem` (12px) | 1.5 | 700 | Eyebrows/status only; never essential instructions alone. |
| `--type-label` | `.9375rem` (15px) | 1.4 | 700 | Form labels/buttons; buttons never below 14px. |
| `--type-code` | `.875rem` (14px), 13px at 320 only if necessary | 1.65 | 400 | Code/prompt output. |

Rules: body line length 36–44 Japanese characters where feasible; Latin prose max `68ch`; article reading column max `44rem`; no all-caps letter spacing for Japanese. Balance headings only when it does not force pathological short lines. Long user text uses `overflow-wrap:anywhere`; prose uses normal Japanese line breaking.

### 6.2 Spacing and shape

| Token | Value | Use |
|---|---:|---|
| `--space-1` … `--space-8` | 4, 8, 12, 16, 24, 32, 48, 64px | Only default spacing scale. |
| `--section-block` | `clamp(40px, 7vw, 80px)` | Major route sections. |
| `--section-compact` | `clamp(28px, 5vw, 48px)` | Related subsections. |
| `--control-min` | 44px | Default interactive height. |
| `--radius-sm/md/lg` | 6 / 10 / 16px | Controls / cards / exceptional grouped surfaces. |
| `--border` | 1px | Default separator; do not nest borders decoratively. |

At 320px, keep 16px minimum between unrelated controls and 24px between conceptual groups. Space communicates grouping; borders do not replace it.

### 6.3 Layout

| Token | Value / formula |
|---|---|
| `--shell-max` | 1200px |
| `--content-max` | 960px |
| `--reading-max` | 704px (`44rem`) |
| `--form-max` | 720px |
| `--gutter` | `clamp(16px, 4vw, 32px)`; exactly 12px only at ≤339px if 16px prevents valid content |
| `--grid-gap` | `clamp(16px, 2.5vw, 28px)` |
| `--header-height` | 64px desktop, 56px mobile |

All grid/flex children that can contain user/generated text get `min-width: 0`. Media uses `max-width:100%`. Only a named `ScrollRegion` may overflow horizontally.

### 6.4 Color

Adopt semantic tokens; route code may not introduce raw colors after its migration. Initial values retain the existing restrained green identity and must be contrast-tested:

| Role | Default | Notes |
|---|---|---|
| `--color-canvas` | `#f7faf9` | Page background |
| `--color-surface` | `#ffffff` | Primary surface |
| `--color-surface-subtle` | `#eef6f3` | Grouping, not every section |
| `--color-text` | `#142e2a` | Primary text |
| `--color-text-muted` | `#4f6863` | Must retain ≥4.5:1 for normal text |
| `--color-border` | `#b8cbc6` | Structural divider |
| `--color-action` | `#176b5b` | Link/primary control; do not rely on color alone |
| `--color-action-hover` | `#105346` | Hover/pressed differentiation |
| `--color-info` | `#245f91` | Neutral information |
| `--color-success` | `#28744f` | Completed/verified, with text/icon |
| `--color-warning` | `#8a5a12` | Unknown/caution, with label |
| `--color-danger` | `#a33b35` | Error/destructive, with label |
| `--color-promo` | `#8a4d20` | Disclosure accent, never rank signal |

Minimum contrast: 4.5:1 normal text, 3:1 large text and meaningful component boundaries, measured in every state. Links in prose are underlined by default.

### 6.5 Focus, motion, and states

- `--focus-ring: 3px solid #0b6fd3`; `--focus-offset: 3px`; never remove outlines without an equal-or-stronger `:focus-visible` replacement.
- Focus must remain visible against canvas, surface, action, error and promotion backgrounds; add a 1px white inner separation where needed.
- Motion durations: 120ms state feedback, 200ms disclosure; no layout-essential animation. Under `prefers-reduced-motion: reduce`, remove nonessential transition/scroll animation.
- State vocabulary: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `empty`, `error`, `success`, `selected`, `completed`, `unknown`, `stale`, `promoted`.
- Disabled controls explain why nearby; loading controls retain their accessible name plus busy state; unknown is not warning/error; affiliate/promoted is not success/recommended.

## 7. Component contract

Components own behavior and semantics as well as appearance. Avoid variants beyond those named here.

| Component | Responsibility | Required states / rules |
|---|---|---|
| `SiteHeader` | Brand, three primary nav links, Project action, mobile trigger. | Current route, menu open/closed. 56px mobile; no two-row first view. Header CTA label is outcome-based. |
| `MobileMenu` | Reveal primary and secondary groups without losing context. | Closed/open; focus enters first meaningful item, remains within while modal-like, Escape/close returns to trigger; background does not scroll. |
| `RouteHero` | Name route, one-sentence outcome, primary/secondary actions. | `execution`, `directory`, `editorial`, `legal`; no decorative variant. Mobile content budget: eyebrow optional, H1, ≤3-line lead, action. |
| `IntentNav` | Let users choose among 2–4 meaningful next intentions. | Link or single-select; selected/current announced; never generic category-chip decoration. |
| `Button` | Execute/navigation action. | `primary`, `secondary`, `quiet`, `danger`; busy/disabled/focus. One primary per action group. Minimum 44×44px. |
| `Card` | One independently selectable/actionable object. | `action`, `resource`, `status`; cards are not used merely to frame paragraphs. Whole-card links need a unique accessible name and visible focus. |
| `TaskPanel` | Current task with input, artifact, verification and recovery. | Not started/current/blocked/completed; current is never encoded by color alone. |
| `ArticleHeader` | Title, purpose, verification/source metadata, disclosure when applicable. | Compact on mobile; no CTA before title/answer. |
| `Summary` | Concise answer and expected outcome. | 2–5 bullets or short paragraph; not another hero. |
| `TableOfContents` | Section navigation/current reading support. | Collapsed by default only when still discoverable; keyboard links; sticky desktop only without covering headings. |
| `RelatedContent` | At most 3 genuinely adjacent next resources. | Plain list/cards; reason for relevance; never payout-driven. |
| `AffiliateCta` | Commercial action at a verified production need. | Disclosure, provider/action, evidence caveat, official/affiliate destination contract, neutral alternative. No urgency/scarcity. |
| `ProjectCta` | Continue the same game in Project. | Names preserved context and resulting next action; one primary contextual handoff plus optional final repeat. |
| `Field` | Label, control, help, validation and error association. | Default/focus/filled/error/disabled/loading; error text via `aria-describedby`; do not clear input on failure. |
| `FormStatus` | Async submit/result feedback. | Busy/success/error/retry; `aria-live` chosen to avoid interrupting ordinary typing. |
| `ResponsiveTable` | Preserve row/column relationships and contain overflow. | Desktop semantic table; narrow criterion stack or owned scroll region with label/affordance. Document width invariant. |
| `CodeBlock` | Code/prompt with language/title and copy action. | Wrap prose prompts; scroll code locally; copied/error feedback; tab order reaches copy then region if scrollable. |
| `Breadcrumbs` | Place in hierarchy. | Wrap safely; current item text may visually collapse at 320 only when H1 substitutes, but semantics remain. |
| `Disclosure` | Identify advertising/affiliate relationship before first affected action. | Plain language, persistent, not dismissible, not visually minimized. |
| `StatusNotice` | Explain info/success/warning/error. | Icon + heading/text, not color alone; optional contextual action. |
| `Footer` | Secondary navigation and trust/legal links. | Three groups; no unrelated promotional module. |

## 8. Responsive policy

Use content-driven changes with only three layout tiers:

- **Base: 0–599px.** Single column, 16px gutter (12px ≤339 only when proven necessary), mobile navigation, full-width primary form actions, H1 token never display token.
- **Medium: 600–959px.** Optional two columns for equal peer items; reading remains one column; navigation may remain mobile until it fits without truncation.
- **Wide: ≥960px.** Desktop header; 2–3 columns only for peer resources; main/aside layouts require a clear supporting relationship. Shell caps at 1200px.

Do not add route-specific breakpoints without recording why the content—not a device—requires one.

### 8.1 Width contracts

| Concern | 390 / 375 | 320 | Desktop (≥960) |
|---|---|---|---|
| Typography | H1 30–34px by token; no display size; 2–4 lines target. | H1 30px floor; shorten optional eyebrow before shrinking body. No 1–3-character columns. | H1 up to 40px; Home short display may reach 52px only if first-view contract passes. |
| Navigation | 56px header; brand + menu + optional compact Project affordance only if all targets fit. | Brand mark/text may shorten intentionally; 44px menu target; no clipping. | Full primary nav and Project action on one row. |
| Cards | One column; remove decorative minimum heights. | One column, 12–16px internal padding. | 2–3 columns only for comparable peers, equal height not mandatory. |
| CTA | Primary full width when paired controls would be <44px or labels wrap; secondary below. | Full width; at least 8px gap; labels may wrap to 2 lines without clipping. | Inline when hierarchy stays clear. |
| Forms | Labels above fields; inputs `width:100%; min-width:0`; native text size ≥16px to avoid iOS zoom. | Same, with long ideas and errors wrapping; keyboard must not hide submit/status in physical testing. | Form max 720px; related short fields may use two columns. |
| Tables | Criterion stack by default or a labelled local scroll region. | Criterion stack preferred; never document overflow. | Semantic table with sticky header only if keyboard/focus remains visible. |
| Code | Prompt prose wraps; code owns `overflow:auto`. | 13–14px monospace; copy button remains visible; long token contained. | Local scroller and max-height only with explicit expand control. |
| Spacing | Section 40–48px; header-to-hero 24px. | Section 36–40px; no hidden content to manufacture space. | Section 64–80px. |

At all widths: `document.documentElement.scrollWidth <= clientWidth`; this is necessary but visual review is still required. At 320px/200% equivalent, content and functionality must reflow without two-dimensional document scrolling except owned data/code regions.

## 9. Route architecture

### 9.1 Home

**First viewport:** compact brand/header; promise (“describe your game; receive the next concrete task and done criteria”); one short explanation of output; labelled idea input and primary “最初の作業を作る”; quiet “完成イメージを見る”. At 390×844 the primary control and a short output cue must be visible without scrolling. At 320px the input plus submit may end near the fold, but what/action/output must all be understandable within it.

**Order:** (1) execution hero/form, (2) example output showing current task/artifact/done criteria, (3) three intents—start, solve current production need, learn—(4) how continuation works, (5) 3 selected practical resources, (6) example ideas, (7) trust/source note.  
**Primary:** create a Project from the entered idea. **Secondary:** inspect example output.  
**Mobile:** demonstration becomes a concise vertical preview; no trust-chip row before the form; editorial cards are compact lists. Preserve submitted idea exactly.

### 9.2 Project

**First viewport:** route title and current stage; when empty, the idea/conditions form and expected output; when generated, the preserved game summary and current task.  
**Order:** empty: idea → conditions → generate/help. Generated: preserved context → current task → exact AI/tool instruction → artifact/input → done criteria → complete/blocked actions → next task → collapsed roadmap/evidence.  
**Primary:** generate when empty; complete/current action when active. **Secondary:** edit conditions or recovery.  
**States:** empty, interpreting, needs clarification, generating, generated/current, validation error, provider/rate-limit error, blocked/recovery, completed, saved/restored. Each preserves raw user input locally but never sends it to analytics.  
**Mobile:** single column; stage indicator compact and text-labelled; sticky action only if it never covers content/focus/keyboard. Long prompts/artifacts contained. Preserve query source, return URL, share/back-forward, local progress and deterministic fallback.

### 9.3 Articles Hub

**First viewport:** title, one-sentence purpose, three intent links (“first game,” “specific production task,” “compare choices”); Project link is secondary.  
**Order:** intent navigation → beginner path → production-stage clusters → comparison/evidence cluster → latest/field notes only when curated → Project handoff.  
**Primary:** open the most relevant guide after intent choice. **Secondary:** create a personalized plan.  
**Mobile:** jump controls become a vertical list or compact disclosure; resource rows show title, task/outcome and one metadata line. Preserve Issue #135 clusters and internal links.

### 9.4 Article template (browser game, ElevenLabs, Meshy)

**First viewport:** breadcrumbs, task-specific H1, 1–2 sentence outcome, verification/source metadata, promotion disclosure when applicable. The concise answer may begin near the fold; no affiliate button precedes disclosure/context.  
**Order:** header → answer/summary → task contract (input/output/done) → TOC → prerequisites → procedure → observable checks → failure/recovery → relevant commercial decision with sources (if any) → continue same game in Project → sources → related content.  
**Primary:** complete the article's task; the interactive/link CTA appears at the relevant step. **Secondary:** continue same context in Project.  
**Mobile:** one reading column; TOC disclosure; tables transform safely; code/prompt blocks self-contain overflow; no nested-card tunnel. Affiliate CTA remains clearly labelled and neutral.

### 9.5 Tools

**First viewport:** outcome framing plus “what are you making now?” filter/control; active selection and result count visible.  
**Order:** artifact/stage intent → optional constraints → active criteria → results → evidence methodology/unknown explanation → Project return when context exists.  
**Primary:** inspect a matching tool/evidence. **Secondary:** compare selected candidates or return to current Project task.  
**Mobile:** filters in an accessible disclosure/drawer with applied-count text; results are concise rows; no horizontal taxonomy scroller required to operate.

### 9.6 Guides

**First viewport:** choose production stage/task, not a wall of guide cards.  
**Order:** stage navigation → recommended starting path → guides grouped by task → evidence/methodology → Project handoff.  
**Primary:** open a guide whose output is explicit. **Secondary:** generate a personalized task.  
**Mobile:** single-column task list; prerequisite/output displayed without hover; long titles wrap naturally.

### 9.7 Compare

**First viewport:** title/decision framing; selected-candidate tray (including empty guidance); open picker action.  
**Order:** selection (max 4) → decision caveats/unknowns → criterion groups (fit, rights/price verification, integration/environment, evidence freshness) → sources → next action.  
**Primary:** add/replace a candidate when empty, otherwise inspect the decision-relevant official evidence. **Secondary:** return to Project or Tools with context.  
**Mobile:** picker search width is `100%`, `min-width:0`, and owned by its container. Candidate chips wrap/remove safely. Comparison becomes per-criterion groups with every candidate labelled; no sideways document scroll. Preserve query/deep-link state, max-four rule, unknown values, source dates, neutral ordering and `noindex,follow` unless SEO explicitly migrates it.

### 9.8 Privacy

**First viewport:** title, effective/updated date, plain-language summary, jump navigation.  
**Order:** data collected → purposes/analytics → storage/sharing → affiliate disclosure relationship → user choices/rights → contact/change history.  
**Primary:** navigate/read; there is no commercial primary CTA.  
**Mobile:** readable measure and deep-linked headings; long identifiers/URLs wrap; legal meaning must not be shortened merely for layout.

### 9.9 Shared header/footer

Desktop primary nav: Project, Articles, Tools; Compare/Guides under a clearly named secondary choice if necessary. Mobile groups: “作る” (Project), “学ぶ” (Articles/Guides), “選ぶ” (Tools/Compare), “信頼情報” (methodology/privacy/disclosure). Footer mirrors these concepts without duplicating every page. Navigation labels must describe user intent, not internal taxonomy.

## 10. Accessibility contract

Phase 2 targets WCAG 2.2 AA and the following testable requirements:

1. One descriptive H1 per page; headings do not skip solely for visual size. Landmarks have unique names when repeated.
2. Full keyboard operation with logical order. Focus is never clipped by sticky chrome, scrollers, dialogs or overflow containers. Skip link reaches `main`.
3. Menu/disclosures expose name, role, expanded/current state; Escape and focus return are implemented where expected. No focus trap in non-modal disclosures.
4. Minimum 44×44px product target by default; WCAG 24×24px minimum is the absolute exception only for inline text/allowed cases. Adjacent targets have safe separation.
5. All form fields have persistent labels, relevant `autocomplete`/input modes, associated help/error, preserved values, summary focus on failed submission, and non-color error cues.
6. Status messages use appropriate `aria-live` without announcing every keystroke. Loading containers expose busy state; skeletons are hidden from assistive technology.
7. Text resizes to 200%; reflows at 320 CSS px without loss or document-level two-dimensional scrolling. Owned table/code regions are labelled and keyboard-scrollable.
8. Tables retain captions/headers and programmatic associations. A visual mobile transformation must expose equivalent labels and reading order.
9. Images/diagrams have useful alternatives; decorative assets are ignored. Icons never supply the only label.
10. Contrast meets the thresholds in §6.4 for default, hover, focus, selected, disabled, error, warning and promotion states. Disabled text still remains understandable.
11. Reduced motion removes nonessential transitions; no content requires motion to understand. Do not introduce autoplay.
12. Japanese is the document language; English code/product names remain understandable. Link purpose is clear without surrounding card copy.
13. Copy controls announce success/failure, do not move focus, and retain selectable source text.
14. Sticky content never obscures focused elements or anchors; section headings use a consistent scroll margin.

## 11. Preservation contracts

### 11.1 Product and Project

- Preserve the execution sequence, deterministic/explainable recommendations, user intent and every entered condition.
- Preserve Project query/source context, safe return URLs, sharing, back/forward behavior, local progress, completion/recovery, artifact/prompt copy, and deterministic provider fallback.
- A visual simplification may collapse secondary information but may not remove capabilities or substitute a different game/mechanic/platform.
- Tools/Articles/Compare handoffs name what context carries into or back to Project.

### 11.2 SEO and ownership

- Preserve canonicals, metadata, Open Graph, robots, sitemap, Google Search Console verification, Article/Breadcrumb structured data, source transparency, and last-verified behavior.
- Preserve Issue #135 topic clusters, slugs, heading meaning and useful internal links. DOM reordering may not produce hidden/duplicated SEO copy.
- Compare retains its current robots intent unless a separately approved SEO migration changes it.
- Layout changes must not introduce cumulative shift through unreserved loading states.

### 11.3 Analytics and privacy

- Preserve GA4 ID `G-B9Q283QVER`, production `gtag` behavior, `article_view`, `outbound_click`, `affiliate_impression`, `affiliate_click`, and existing Project/funnel events.
- Preserve parameters including `article_slug`, `placement`, `service_id`, and Project handoff attribution where currently emitted. Component replacement requires event parity tests before old markup is removed.
- Never send raw game ideas, prompts, generated code/HTML, runtime errors, secrets, or other sensitive user content. UI labels are not permission to expand payloads.
- Do not double-fire impressions/clicks because desktop/mobile renderings coexist; only active/actually viewed commercial placement counts.

### 11.4 Affiliate and editorial trust

- Destination remains `affiliateUrl ?? officialUrl`; affiliate links keep `rel="sponsored nofollow noopener"`.
- Preserve registry/sync/validation, safe `sub_id`, clear disclosure, and source/verification state.
- Payout never affects recommendation, ordering, scoring, editorial conclusions, visual prominence or Phase 2 priority.
- No fake scarcity, countdown, forced continuity, deceptive price/savings, invented rating/review/ranking/right/capability, or concealed sponsorship.
- An affiliate CTA always provides enough context to understand the production need and a route to official evidence/neutral alternative.

## 12. Acceptance matrix

All P0/P1 and high-impact P2 findings must be fixed before a slice is accepted. “No overflow” alone is never visual acceptance.

| Surface | 320px | 375px | 390px | Desktop (1440×900 reference) | Interaction / regression |
|---|---|---|---|---|---|
| Global/header | No clipping; 44px menu; brand remains identifiable; no document overflow at 200% equivalent. | One-row 56px header; visible focus/menu. | Same; primary content starts without excess gap. | Nav fits, current state and Project action clear. | Keyboard open/close/Escape/focus return; skip link; reduced motion. |
| Home | What/action/output understandable in first view; form operable; H1 2–4 natural lines. | Primary action visible near first viewport; no trust/card clutter before it. | **Primary action visible within 844px first view** and example cue discoverable. | Hero/action/example relationship visible without giant empty type. | Submitted idea preserved exactly; analytics excludes raw idea; owner physical-iPhone retest required. |
| Project | Single-column stage/current task; long idea/prompt/error contained. | Controls and done criteria legible with soft-keyboard retest pending physical device. | Current action and context prioritized. | Supporting roadmap may sit beside current task only if hierarchy remains clear. | Empty/generated/error/recovery/complete, save/load, share, back/forward, query context, deterministic fallback. |
| Articles Hub | Intent list before dense inventory; cards become compact rows. | Natural title wrap, 44px intent links. | At least one useful route visible near first view. | Clusters scan without repetitive card walls. | Links, focus, canonical/internal-link parity. |
| Article | 44rem max equivalent; TOC/code/table contained; disclosure precedes commercial action. | H1 readable, answer near first view. | No nested-surface overload. | Reading column plus optional TOC; no overlong lines. | Copy, anchors, keyboard scrollers, source links, article/affiliate/Project events exactly once. |
| Tools/Guides | Filter/stage operable; results one column; long labels contained. | Active criteria and count visible. | Primary artifact/stage choice early. | 2–3 peer columns only when useful. | Empty/no-result/loading/error, URL state, Project return, neutral ordering. |
| Compare | `scrollWidth == clientWidth`; picker input ≤ container; criterion labels repeated; max-four usable. | Zero 52px regression; candidate removal/focus safe. | Zero 37px regression; selection tray understandable. | Table/criteria scan well; evidence/caveats not hidden. | Empty/1–4 selected, search/no result, deep link/back-forward, keyboard, unknown/source states, neutral order. |
| Privacy/footer | Legal content not truncated; URLs wrap. | Section navigation usable. | Summary and effective date clear. | Reading measure remains bounded. | Anchor links, analytics opt behavior if present, disclosure/legal links. |

### Required rendered evidence per Phase 2 slice

1. Before/after screenshots for each affected route at 320, 375, 390 and one desktop width; record viewport and zoom.
2. 320px at 200% equivalent where supported, explicitly called emulation.
3. Stress fixtures: long Japanese heading/idea, unbroken token/URL, empty, error, expanded disclosure, table/code, 4 Compare candidates.
4. Independent reviewer findings with P0–P3 severity, fixes, then second-pass screenshots/review.
5. Relevant keyboard, accessibility, E2E, analytics and behavioral regression results.
6. Physical-device status stated separately. Home requires an owner iPhone recheck before declaring the confirmed first-view issue closed.

## 13. Phase 2 implementation plan

Each slice is a separate, reviewable deployment unit. Do not start the next slice while the current slice has unresolved blocking acceptance findings. A rollback returns only that slice's files/flags; it must not require undoing later unrelated work.

### Slice 0 — acceptance fixtures and contracts

**Depends on:** this document.  
**Scope:** add reusable viewport/stress E2E fixtures, route screenshot manifest format, DOM-width diagnostics, event-parity assertions, and a checklist mapping protected behavior. No visual redesign.  
**Exact acceptance:** current routes can be captured at 320/375/390/desktop; Home landmarks and Compare overflow reproduce as known failing baselines rather than false passes; protected GA4/affiliate/Project tests remain green; fixture never logs sensitive content.  
**Rollback:** remove test/evidence harness only. Runtime unchanged.

### Slice 1 — foundations and intrinsic-size safety

**Depends on:** Slice 0.  
**Scope:** semantic tokens, reset/base type, shell/gutter, focus, buttons/fields/status, `ScrollRegion`, responsive table/code primitives. Keep route composition unchanged wherever possible.  
**Exact acceptance:** migrated primitives match token contract; no new raw route colors; focus/contrast/target checks pass; all ten routes have no new overflow at 320/375/390; quality/build/E2E pass; existing analytics/affiliate DOM hooks/events remain intact.  
**Rollback:** revert token/primitives commit as one unit; legacy styles remain available until all consumers pass.

### Slice 2 — shared chrome and Home

**Depends on:** Slice 1.  
**Scope:** Header, MobileMenu, Footer, RouteHero/IntentNav, Home architecture. Do not change Project generation behavior.  
**Exact acceptance:** Home meets what/action/output first-view test; primary action visible at 390×844 and reasonably near fold at 375/320; owner's iPhone finding receives a new physical-device retest (or remains explicitly unaccepted); menu keyboard/focus behavior passes; idea and attribution handoff parity passes; no raw ideas enter analytics.  
**Rollback:** revert shared chrome/Home composition; preserve Slice 1 primitives and old Home event contracts.

### Slice 3 — article system and Articles Hub

**Depends on:** Slices 1–2 (shared chrome).  
**Scope:** ArticleHeader, Summary, TOC, article layout, code/table, disclosure, affiliate/Project CTA, related content, Hub architecture; migrate browser-game, ElevenLabs, and Meshy representatives before other articles.  
**Exact acceptance:** three representatives and Hub pass all four widths; disclosure precedes first affiliate link; article schema/canonical/metadata/Issue #135 links unchanged; `article_view`, affiliate impression/click, `article_slug`, `placement`, `service_id`, outbound and Project handoff parity tests pass once per real interaction; code/table never widen document.  
**Rollback:** article template/components can revert independently; content, slugs, structured data and destinations are untouched.

### Slice 4 — Project and forms

**Depends on:** Slice 1 primitives and stable shared chrome; may proceed after Slice 2, not coupled to Slice 3.  
**Scope:** stage shell, idea/conditions form, current task, instruction/artifact, verification, completion/recovery, responsive generated result. No generator/recommendation rewrite.  
**Exact acceptance:** empty, clarification, loading, generated, error, blocked/recovery and completed states pass 320/375/390/desktop; original intent survives all paths; save/load/share/back-forward/query returns and deterministic fallback pass; long input/output/errors do not overflow; analytics payload audit proves no sensitive content. Independent product/game-development review is required.  
**Rollback:** presentation adapters revert without changing stored data schema, generated result schema, or recommendation functions.

### Slice 5 — Tools and Guides

**Depends on:** Slices 1–2; Project handoff contract from Slice 4 must be stable before changing contextual returns.  
**Scope:** artifact/stage intent controls, filter disclosure, active criteria, concise result/resource items, loading/empty/error states, Project return.  
**Exact acceptance:** URL/filter state and back-forward preserved; empty/no-result/loading/error pass; recommendation ordering and reasons unchanged; verified/unknown/source states remain explicit; affiliate destination/rel/disclosure/event parity passes; all widths and long labels pass.  
**Rollback:** route presentation and new filter wrapper revert; service registry and recommendation data remain untouched.

### Slice 6 — Compare and legal/trust routes

**Depends on:** Slices 1 and 5's shared result/evidence patterns.  
**Scope:** picker intrinsic sizing, selection tray, criterion-group mobile comparison, desktop table, Privacy and related legal reading layout.  
**Exact acceptance:** Compare document overflow is exactly 0 at 320/375/390 with picker open/closed and 0–4 candidates; picker search/input never exceeds container; keyboard/deep-link/back-forward/max-four/no-result/unknown/source states pass; neutral order and robots/canonical unchanged. Privacy content/anchors retain meaning and metadata.  
**Rollback:** revert Compare presentation while retaining selection/query model; if emergency rollback reintroduces overflow, ship a contained width fix rather than accepting the P1.

### Slice 7 — cross-route consistency and final acceptance

**Depends on:** all prior slices.  
**Scope:** delete proven-dead legacy styles, resolve remaining token exceptions, perform complete rendered/functional regression audit. No new design concepts.  
**Exact acceptance:** all matrix rows pass with durable screenshots; independent first and second review have zero P0/P1/high-impact P2; `npm run quality`, `npm run build`, relevant E2E/accessibility checks and `git diff --check` pass; protected SEO/GA4/affiliate/Project contracts are explicitly checked; owner Home iPhone result and other physical-device gaps are reported accurately.  
**Rollback:** dead-style deletion is its own final commit and can revert without reverting accepted route migrations; any route failing Preview remains on its last accepted composition.

## 14. Risks, rollout, and rollback boundaries

| Risk | Prevention / detection | Rollback boundary |
|---|---|---|
| Broad global CSS silently changes unrelated routes | Tokens first, route migration inventory, screenshots of all ten routes per foundation change. | Slice 1 token/primitives commit. |
| Visual simplification removes Project behavior | Behavior map + state fixtures + parity tests before markup removal. | Slice 4 presentation adapter only; data/generator untouched. |
| Analytics doubles or loses attribution | Event-contract tests and active-render-only impression logic. | Per migrated component; retain old analytics module. |
| Affiliate styling biases recommendation | Independent trust review, ordering snapshots, disclosure/destination tests. | Affiliate CTA presentation only; registry/destinations unchanged. |
| SEO loses structured data/internal links | Metadata/schema/canonical/sitemap snapshots and crawl validation. | Route template commit; preserve page content/slug registry. |
| Mobile “fix” hides evidence or uses pathological wrapping | Visual stress fixtures plus semantic inspection; local scrollers only. | Individual responsive component. |
| Breakpoint proliferation returns | Three-tier lint/review rule; exception requires documented content constraint. | Reject/revert route-local media-query commit. |
| Physical iPhone behavior differs from emulation | Keep acceptance status split; require owner retest for Home. | Do not close P1; patch within owning Home/chrome slice. |
| Token contrast fails in a state | Automated checks plus rendered state screenshots and manual verification. | Color-token commit, not route content. |

Release each slice through Preview, run its exact acceptance, and keep the prior accepted UI recoverable until the next slice passes. Do not combine Project, article, directory, and Compare migrations into a single PR. Production deployment, merge, GA4 administration and affiliate destination changes are outside Phase 1.

## 15. Phase 1 completion boundary

This document is the authoritative implementation contract, not evidence that the redesign has shipped. Phase 1 changes no application UI, `globals.css`, runtime behavior, analytics, affiliate destinations, Production, or GA4. The confirmed Home physical-device P1 and reproduced Compare overflow P1 remain open until their respective Phase 2 slices pass rendered acceptance. All untested areas in §2.4 remain explicitly untested.
