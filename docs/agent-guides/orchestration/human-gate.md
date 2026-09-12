# Human merge gate
Show the single canonical Issue summary. In Actions, run **Orchestration human merge authorization** and copy the current Issue, run ID, task version, PR, and full head SHA from that summary/manifest. Authorization must come from an enrolled human. A head change invalidates both Preview PASS and approval. Bots cannot authorize; this records permission but never merges.
