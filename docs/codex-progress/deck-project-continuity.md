# Deck / Project continuity repair

- Authorized: three fixes, regression coverage, commit/push and a new draft PR.
  No redesign, merge, auto-merge, deploy, Production/Preview browsing or Issue close.
- Branch: `fix/deck-project-continuity`.
- Base and earliest verified remote checkpoint:
  `cd97360383a84b2f220dcc22343035d990f7503b` (branch initially pushed at base).
- Implemented: deck capture/native-drag repair; explicit supported Stack condition
  handoff; validated article source and known workflow anchors in return context.
- Completed locally: quality (330 JS / 76 Python tests plus validators), production
  build, 10 relevant E2E, baseline regression falsification and visual inspection.
- Evidence: `docs/evidence/deck-project-continuity/README.md`.
- Remaining: exact-head independent parent review and CI monitoring; owner merge
  decision is separate. Runtime/file changes invalidate affected prior checks.
- WebKit download BLOCKED (supported mirrors HTTP 403); physical Safari UNTESTED.
  Do not represent this as Safari acceptance. Unsupported legacy fields remain
  visibly disclosed reference settings, without invented schema mappings.
- Delivery head/PR: use the branch and draft PR GitHub refs for final SHA; this
  ledger is included in that commit. No legacy Work dispatch or account changes.
- Review follow-up: corrected three premature screenshots after measuring the
  220ms deck transitions and mobile resize viewport settling. Original images
  retained as `transient-*`; settled card/title/CTA bounds asserted by E2E.
  Three input tests plus ESLint/typecheck pass. Runtime/CSS unchanged from
  `8a3ef48ec9db7859e08bd7086f7f91e2b90c270f`; no persistent local layout bug found.
