# Recovery
Re-read repository truth. Preserve branch/PR and human edits. Classify human, technical or external blocking. Every blocked mutation must provide `why`, `what`, `need`, `next`, and `resume`; the reducer fills safe explicit defaults rather than emitting a bare blocked state. Use **Orchestration human control** for cancel/supersede/migration and re-run the event or named workflow for technical recovery. Infrastructure/quota outages increment only their own counters and never consume repair revisions.

Codex repeat mentions create fresh tasks rather than resuming a prior thread.
Recovery uses the published reusable GameAI-Hub Environment when available, but
reconstructs work from repository truth—not the prior ephemeral workspace. A
new fenced Patch Mode task continues the same Issue/PR/branch and verified head
unless fencing requires reconciliation: **NEW_TASK does not mean NEW_BRANCH or
NEW_PR.** Record each task/thread identity separately and never depend on
`CODEX_THREAD_ID` reuse. Work authority, Codex ACK/result correlation, and
deployment bridges remain disabled or unverified until their real-platform
experiments pass.
