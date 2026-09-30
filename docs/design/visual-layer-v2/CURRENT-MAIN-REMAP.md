# Visual Layer v2 — Current Main Remap for V1

> **Historical V1 scope:** future work must begin at the [active Visual Layer authority](./README.md). Do not update the measured SHAs below or infer that V1 used the later Issue #157 contract/matrix.

Remap date: 2026-09-30  
Issue: #155  
Package baseline inspected by the handoff: `711dcb5df28db7df0b916589c264a97249a661e6`  
Current authoritative main: `db2dabe5697dc4cc8eadfb80ce206ca5ecfa1d57`  
Deployment branch before V1 implementation: `codex/issue-155-visual-layer-v2-v1`  
Repository handoff deployment commit: `9a2478eb208371a5a52d6eec0a6e515182730e28`

## 1. Current-main verification

Current `main` was re-fetched and remains:

`db2dabe5697dc4cc8eadfb80ce206ca5ecfa1d57`

Comparison from package baseline `711dcb5...` to current main is six commits ahead and zero behind. The effective product/content delta is merged PR #154.

PR #154 changed:

- `app/articles/elevenlabs-v4-game-voice/page.tsx` — new published ElevenLabs v4 article
- `app/articles/elevenlabs-game-development-guide/page.tsx` — v4/v4 Turbo update callout
- `data/articles.ts` — new v4 article registry entry and related-link/source updates
- `data/services.json` — ElevenLabs evidence refresh
- `e2e/elevenlabs-v4-article.spec.ts`
- `tests/elevenlabs-article.test.tsx`
- related evidence/progress files

No Home, Project, Tools, Compare, Header, Footer, article-hub page, or core shared article template code changed between the package baseline and current main.

Therefore the handoff's component-level assumptions remain structurally valid, with the PR #154 article/content additions below treated as authoritative.

## 2. Article hub on current main

`app/articles/page.tsx` currently owns four groups.

### START — V1 target
Current order remains exactly:

1. `ai-browser-game-how-to`
2. `before-asking-ai-build-game`
3. `github-beginner-game-development`

This matches the three thumbnail mappings supplied by the handoff.

V1 may change only their presentation, not their slug order, href, article title, category label, updated date, description, or SSR link semantics.

### VOICE — not a V1 information-architecture target

The current hub VOICE group contains:

1. `elevenlabs-game-development-guide`
2. `elevenlabs-commercial-use-game`

The newly published `elevenlabs-v4-game-voice` route is **not currently listed in this group**.

This is current-main behavior, not a Visual Layer defect. V1 must not silently add, remove, or reorder hub articles while performing a visual migration.

The new v4 article remains discoverable through the current article registry/sitemap and related-link path from the existing ElevenLabs guide. A future content-architecture change, if wanted, must be handled separately from V1 styling.

### 3D / PRACTICE

Their current groups/order/data remain unchanged and V1 keeps their existing static row presentation. V1 must not apply Creation Deck behavior to them.

## 3. PR #154 preservation contract

The following are now explicit V1 regression requirements.

### New route
`/articles/elevenlabs-v4-game-voice/`

Preserve:
- title and lead
- source verification notes
- v3/v4/v4 Turbo factual caveats
- affiliate disclosure/link contract
- Project CTA source
- canonical/Article/Breadcrumb JSON-LD
- ArticleReadingGuide behavior
- related links and source section
- no document-level horizontal overflow

### Existing ElevenLabs guide
Preserve its v4 callout and related link to the new v4 article.

### Data / SEO
Do not edit `data/articles.ts` or `data/services.json` for visual reasons in V1.
Do not alter `publishedArticles`, sitemap behavior, canonical metadata, structured data, affiliate state, or article factual content.

## 4. Existing V1 integration points on current main

### `app/globals.css`

Current Issue #137 semantic tokens and route contracts are already established near the end of the file:
- `--color-canvas`, `--color-surface`, `--color-text`, `--color-border`
- `--type-*`, `--space-*`, `--gutter`, `--header-height`
- geometry/focus invariants
- article-hub selectors
- Header/Footer responsive behavior

Do not rewrite or replace those tokens globally.

V1 should introduce separate `--v2-*` tokens and scoped Visual Layer selectors so later slices can opt in without destabilizing Issue #137.

### New V1 stylesheet

Preferred implementation file:

`app/visual-layer-v2.css`

Import it after `globals.css` from `app/layout.tsx`.

Rules:
- only new `--v2-*` token names
- article-hub decorative/background/card rules scoped through an explicit V2 route modifier
- Header/Footer rules limited to color/background/border/backdrop treatment
- no geometry changes to Header, menu, main, footer groups, skip link, sticky/fixed behavior
- no global transform/filter/perspective on `body`, `main`, Header ancestors, article shells, or shared application containers

### Header

Current behavior in `components/Header.tsx` must remain byte-for-behavior equivalent:
- sticky header
- three primary links
- Project CTA
- mobile dialog
- body scroll lock while dialog open
- `inert` on main/footer
- Escape return-focus behavior
- Tab focus trap
- current labels and links

V1 may only harmonize visual background/border/material treatment. Do not edit Header component logic unless an implementation bug proves necessary.

### Footer

`app/layout.tsx` owns the current three footer groups and principle text.

V1 may add a flat canvas/background and thin separator only. Preserve all links/order/copy.

## 5. Article hub V1 mapping

Current DOM:

`section#start.article-cluster > ol.article-cluster-list > li > a`

Each anchor currently contains:
- `.article-row-order`
- `.article-row-copy > small + strong + span`
- trailing arrow `b`

The whole article entry is already one link. Preserve that single-anchor model.

### V1 static-card treatment

Only `#start` becomes Crafted Ceramic static cards in V1.

No carousel, no active index, no client state, no drag, no perspective, no autoplay, no duplicate DOM, and no Creation Deck component.

Recommended data-safe image mapping:
- `ai-browser-game-how-to` → `/visual-v2/thumbnails/game-creation-480.webp` / `-960.webp`
- `before-asking-ai-build-game` → `/visual-v2/thumbnails/planning-480.webp` / `-960.webp`
- `github-beginner-game-development` → `/visual-v2/thumbnails/development-480.webp` / `-960.webp`

If extracted to code, use a slug→visual-path-only mapping such as `lib/article-visuals.ts`. Never duplicate title/date/category/rank/price/content into that mapping.

Images are decorative article covers:
- empty alt
- width/height or reserved aspect ratio 3:2
- 480/960 srcset or equivalent
- no claim that the image is an actual generated result
- no service/brand implication

### Current 320px rule conflict

Current globals contain:

`@media(max-width:340px){ .article-row-copy>span{display:none} }`

The handoff explicitly requires V1 cards not to remove existing detailed copy merely to fit the mock. For the **START V2 cards only**, the V1 scoped stylesheet should restore the description to visible at <=340px while using the flat/no-shadow fallback.

Do not change that legacy rule globally for non-V1 lists.

### 320px fallback

At <=340px:
- no Mint Atrium image
- no 3D/depth treatment
- no metallic gradient frame
- flat list/card with one readable border
- all START links remain reachable
- full title, meta and description remain readable
- no horizontal overflow

375/390 may use the shallow Crafted Ceramic static material but still no deck rotation in V1.

## 6. Mint Atrium background mapping

The handoff background assets are present under `public/visual-v2/backgrounds/`.

V1 must not turn on a global application background.

For V1, enable Mint Atrium only on the Articles hub via an explicit route class/modifier, e.g. the existing `.article-hub` plus a V2 modifier.

Because root `main` remains max-width constrained, the decorative pseudo/layer may extend to viewport width from the route host, but it must:
- stay behind content
- be pointer-events:none
- not alter the route DOM reading order
- not use transform/filter/perspective on an ancestor
- fade into the existing canvas
- load no background asset <=340px

This keeps Home/Project/Tools/Compare/article-reading routes untouched until their authorized later slices.

## 7. Current article-hub CSS that V1 must supersede only in scope

Current Issue #137 rules intentionally render article clusters as flat evidence rows:
- top/bottom borders
- grid `order / copy / arrow`
- mobile grid at <=680
- description hidden globally <=340

V1 must not delete those base rules. Add scoped START-card overrides after them. Removing the base rules would change VOICE/3D/PRACTICE and make V1 non-reversible.

Rollback remains: remove the V2 route modifier/import/image nodes or mapping and the existing Issue #137 row system immediately resumes.

## 8. V1 regression test map

V1 implementation must at least cover:

### Article hub
Viewports:
- 320
- 375
- 390
- 1440

Checks:
- H1/intents/groups remain
- exactly four `.article-cluster-list` groups remain
- START contains the same three links in the same order
- three START visual assets resolve successfully
- VOICE/3D/PRACTICE data/order unchanged
- no document-level horizontal overflow
- long titles are not line-clamped
- 320 uses flat fallback and does not fetch/show Mint Atrium background
- no Creation Deck controls/client behavior yet

### Shared Header/Footer
At desktop/mobile:
- same labels and hrefs
- menu opens/closes
- Escape returns focus
- 44px mobile controls remain
- skip link/focus remain visible
- Footer still contains all three groups

### PR #154 smoke
At minimum smoke:
- `/articles/elevenlabs-v4-game-voice/`
- `/articles/elevenlabs-game-development-guide/`

Verify:
- H1
- reading guide/TOC where applicable
- disclosure/affiliate rel
- Project CTA source
- canonical/structured data
- overflow 0

Existing useful suites:
- `e2e/slice-three-articles.spec.ts`
- `e2e/content-seo.spec.ts`
- `e2e/elevenlabs-v4-article.spec.ts`
- `tests/seo.test.ts`
- `tests/elevenlabs-article.test.tsx`

A dedicated V1 rendered test may be added rather than weakening existing suites.

## 9. V1 file-change fence

Expected V1 implementation files should stay close to:

- `app/layout.tsx` — import V2 stylesheet only
- `app/visual-layer-v2.css` — new scoped visual layer
- `app/articles/page.tsx` — explicit route modifier + decorative START covers only
- optionally `lib/article-visuals.ts` — slug→asset paths only
- V1 tests/evidence/progress file

Already deployed `public/visual-v2/**` assets should be reused.

Do not change in V1:
- `data/articles.ts`
- `data/services.json`
- Project business logic
- Tools/Compare behavior
- ArticleFrame/ReadingGuide/Affiliate portal DOM
- GA4/privacy/analytics logic
- package dependencies
- Creation Deck JS

## 10. Remap conclusion

The package remains compatible with current main.

PR #154 introduces no structural blocker to V1. The only required remap is to explicitly protect the new ElevenLabs v4 content/route and avoid assuming that it belongs to the hub VOICE group today.

V1 may proceed from this remap without reverting or rewriting any PR #154 content.
