# Issue #74 progress

- Task: repository-centered AI development orchestration v1.
- Working branch: `feat/issue-74-orchestration`.
- Latest pushed checkpoint: PR #76 head `e5d8b3635cce098c06de72b1ee8ca372a8da209f` before the Work-dispatch patch.
- Completed: contracts/schemas; single manifest/status surface; reducer and GitHub adapter; thin workflows; profiles/trust/labels; stage guides/templates; 20-scenario tests; two independent reviews and fixes for arbitrary transitions, SHA/task/provenance binding, shared writer serialization, approval, retry/status and readiness routing.
- Current: Patch Mode adds a fenced, reconciled Preview claim → native Work PR-event dispatch and connector-App candidate ingress; E2E observation on the next fresh claim remains required.
- External bridges: Codex NEEDS EXPERIMENT; Work dispatch/ingress implemented but not VERIFIED without observed task start and browser evidence; exact-SHA Preview readiness observed on PR #76.
- Unresolved: GitHub comment storage has no native compare-and-swap; workflows use a shared global writer concurrency group plus immediate revision re-read, and still fail closed on mismatch. External E2E remains UNTESTED without account setup/authentication.
- Quality: orchestration 20 tests PASS; workflow/contracts validation PASS; `npm run quality` PASS; build pending.
- Blocker: an `issue_comment` workflow is registered from the default branch, so the new automatic candidate ingress cannot execute before this patch itself is merged; no merge is authorized by this task. Native Work account trigger configuration/start/browser execution also requires external observation.
- Resume: re-fetch #74/#76, bind to the fresh claim, verify one Work dispatch starts one task, then record browser/candidate/ingress evidence without merge or Production mutation.
