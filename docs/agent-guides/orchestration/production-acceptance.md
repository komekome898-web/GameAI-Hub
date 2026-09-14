# Production acceptance

Use work-critical. Wait until Production proves the exact merge SHA, and keep the claim, head, deployment, exactly-one-candidate, trusted-ingress, multi-critic, blocking-severity, and terminal-success fences unchanged.

Acceptance requires direct rendering and interaction on the exact claimed Production deployment in a supported interactive browser execution environment. Any browser mechanism available to Work is acceptable if it can perform the applicable user journey, including input, click/tap, iframe interaction where required, and back/forward/history restoration checks where applicable. It does **not** have to be named `Cloud Browser`.

Search results, HTTP fetches, static HTML/DOM/source inspection, screenshots alone, CI, GitHub or Vercel status, and Preview evidence do not prove Production interaction. If no qualifying interactive browser mechanism is available, keep the journey `UNTESTED` and return `BLOCKED`; never convert it to PASS. A FAIL links evidence to a child hotfix run; P0 immediately blocks visibly.
