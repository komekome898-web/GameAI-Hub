# Component UI/UX instructions

These instructions supplement the repository-root `AGENTS.md`; they do not replace it.

For any change under `components/` that materially affects rendered UI, layout, typography, responsive behavior, interaction states, or user-facing components:

1. Follow the root `AGENTS.md` in full.
2. Follow `docs/codex-ui-ux-loop.md` in full.
3. Verify UI UX Pro Max with `npm run uiux:check`; if missing, run `npm run uiux:setup` and verify again.
4. Query `.agents/skills/ui-ux-pro-max/scripts/search.py` for the exact component context and user job before choosing a visual direction.
5. Reuse coherent GameAI Hub patterns before introducing new visual primitives. Reject generic recommendations that weaken product identity or information utility.
6. Review components inside real rendered routes, not only in source code or isolation.
7. Use independent critics on screenshots for visual quality, mobile/Japanese typography, UX, accessibility, and functional regression.
8. Fix all P0, P1, and high-impact P2 findings, re-render, and obtain an independent verification pass.
9. Preserve all protected analytics, affiliate, SEO, factuality, accessibility, state, and navigation behavior from the root protocol.

A component change is not accepted merely because it is responsive in CSS or passes unit tests; rendered evidence and the root quality gates remain mandatory.
