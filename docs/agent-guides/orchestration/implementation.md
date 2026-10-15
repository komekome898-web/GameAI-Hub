# Implementation

> Legacy protocol retained for history and regression tests. Current operation is
> **owner-directed**; the automatic dispatch/retry/result-ingress instructions below
> are inactive. For new work follow [どっさん司令塔運用](../OWNER_DIRECTED_OPERATIONS.md).
> Do not configure new Work tasks, emit legacy result markers or treat どっさん's
> report as Work/model attestation. Required evidence and independent review remain.
Pin task version, generation and `base_head_sha`; use the explicitly bound branch/PR. Preserve human changes. In Patch Mode fix only stable blocking finding IDs, preserve verified behavior, do not redesign, force-push, merge, or open a duplicate PR.
