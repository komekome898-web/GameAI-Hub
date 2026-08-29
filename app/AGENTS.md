# App UI/UX instructions

These instructions supplement the repository-root `AGENTS.md`; they do not replace it.

For any change under `app/` that materially affects rendered UI, layout, typography, navigation, responsive behavior, interaction states, or a user-facing flow:

1. Follow the root `AGENTS.md` in full.
2. Follow `docs/codex-ui-ux-loop.md` in full.
3. Before selecting a visual direction, verify UI UX Pro Max with `npm run uiux:check`; if missing, run `npm run uiux:setup` and verify again.
4. Query `.agents/skills/ui-ux-pro-max/scripts/search.py` for the exact GameAI Hub surface and user job before implementation.
5. Treat skill output as design intelligence, not as permission to replace GameAI Hub with a generic AI/SaaS template.
6. Render the real route after implementation and retain the screenshot evidence required by the root protocol.
7. Use independent critics on the rendered screenshots. The implementer cannot be the sole visual approver.
8. Fix all P0, P1, and high-impact P2 findings, then re-render and obtain independent second-pass verification.
9. Preserve functional, analytics, affiliate, SEO, factuality, accessibility, and state behavior protected by the root protocol.

A UI task is incomplete if the skill was claimed but not available, if critics reviewed code instead of the rendered product, or if durable screenshot evidence is missing.
