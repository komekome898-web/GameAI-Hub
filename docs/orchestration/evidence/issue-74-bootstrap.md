# Issue #74 repository bootstrap evidence

## Repository-side

- Shared pure reducer and GitHub adapter: implemented; local contract suite covers the 20 required scenarios.
- Thin initialization, PR observation, explicit result ingress, label bootstrap and reconciliation workflows: implemented but not executed on GitHub because this environment has no authenticated write token.
- Existing quality and beginner acceptance workflows: unchanged.

## External bridge experiment ledger

| Experiment | Status | Observation / next proof |
|---|---|---|
| EXP-CODEX-INITIAL | NEEDS EXPERIMENT | No bot-authored Issue dispatch was attempted. Observe a real task before activation. |
| EXP-CODEX-ACK | NEEDS EXPERIMENT | No stable task ID/ack observed. |
| EXP-CODEX-BOT | NEEDS EXPERIMENT | No bot `@codex` response observed. |
| EXP-CODEX-RESUME | NEEDS EXPERIMENT | Same-branch/same-PR external resume unobserved. |
| EXP-WORK-TRIGGER | ACCOUNT-SIDE SETUP | Native Work tasks not configured in this session. |
| EXP-WORK-WRITEBACK | ACCOUNT-SIDE SETUP | Trusted actor registry intentionally empty. |
| EXP-WORK-MODEL | CONFIGURED_UNVERIFIED | Required profiles are defined; account execution is unobserved. |
| EXP-WORK-MODEL-ATTEST | NEEDS EXPERIMENT | No external model attestation exists. |
| EXP-PREVIEW-READY | NEEDS EXPERIMENT | No SHA-bound Preview deployment was observed. |
| EXP-PRODUCTION-READY | NEEDS EXPERIMENT | No merge/deployment test authorized. |

## Non-destructive orchestration E2E

Dedicated Issue, remote initialization, dispatch/ack, harmless PR, CI handoff, hosted readiness, Work trigger/writeback, Patch Mode, exact-SHA approval, merge, Production readiness and Production acceptance are **UNTESTED**. Local reducer tests PASS for duplicate claims, stale/fake results, same-PR Preview patch topology, approval invalidation, retry cap and child Production-hotfix topology. No Production behavior or data was changed. Human action: authenticate GitHub, run the label/init workflows on a dedicated test Issue, configure the two Work tasks, enroll only the observed Work actor, then execute the experiment ledger without authorizing merge unless explicitly safe.

Resume command: `Issue #74 を再開`.

### Safe execution sequence

1. Create a dedicated documentation-only Issue; 2. run label bootstrap; 3. initialize the pinned task/run; 4. send the same transition twice and verify one revision; 5. run EXP-CODEX-INITIAL; 6. require observed ACK before recording implementation-running; 7. bind one harmless PR/branch/head; 8. observe quality CI without calling it acceptance; 9. attest Preview URL/head readiness; 10. observe Work trigger; 11. submit one trusted controlled blocking finding; 12. verify Patch Mode retains PR/branch; 13. replay stale PASS and verify no mutation; 14. submit current PASS; 15. authorize exact head through the human contract; 16. add a harmless commit and verify invalidation, then re-accept/re-authorize; 17. merge only with a separate explicit owner decision; 18. attest Production contains merge SHA; 19. observe critical Work trigger/profile evidence; 20. submit PASS to done or retain a precise safe block. Store URLs/IDs, not bulky artifacts, in this ledger. Until these steps are run, their status remains UNTESTED.
