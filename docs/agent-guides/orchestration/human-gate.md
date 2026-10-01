# Human merge gate

> Legacy protocol retained for history and regression tests. Current operation is
> **owner-directed**; the automatic dispatch/retry/result-ingress instructions below
> are inactive. For new work follow [どっさん司令塔運用](../OWNER_DIRECTED_OPERATIONS.md).
> Do not configure new Work tasks, emit legacy result markers or treat どっさん's
> report as Work/model attestation. Required evidence and independent review remain.
Show the single canonical Issue summary. In Actions, run **Orchestration human merge authorization** and copy the current Issue, run ID, task version, PR, and full head SHA from that summary/manifest. Authorization must come from an enrolled human. A head change invalidates both Preview PASS and approval. Bots cannot authorize; this records permission but never merges.
