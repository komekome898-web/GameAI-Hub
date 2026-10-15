# Owner-directed operations — どっさん司令塔

## Authority and delivery

The owner decides goals, priorities, adopted proposals and merge. どっさん handles
requirements consultation, design/materials, instructions, progress and result
verification. Codex Cloud implements/tests the instructed scope. Independent
review is separate from implementer self-evaluation (the assigned independent reviewer supplies that review). Implementation is one coherent unit;
research/design can be parallel. Unknowns and unexpected conditions go back to
the coordinator with facts, impact and options before scope expands.

A workflow, guide or template listing branch/push/PR is not permission. Follow
only the user's authorized GitHub actions. Read-only investigations/reviews need
no push checkpoint. Authorized artifact tasks follow `CODEX_CLOUD_TASK.md`;
prefer an initial branch pointing at the existing base and one tested delivery
checkpoint. Merge needs separate owner approval; never enable auto-merge.

## Explicit task path

1. Record the approved objective/scope/exclusions, Issue (or task ID), branch/PR,
   base and target SHA, allowed writes and acceptance criteria. Search existing
   work before creating duplicates. Preserve valid lineage and human edits.
2. どっさん starts the instructed task in the existing saved GameAI-Hub Environment.
   Record actual task identity if exposed. Do not recreate the Environment.
   A separately authorized GitHub Codex mention is a different launch path;
   a mention does not prove execution, nor does a saved task prove mention delivery.
   Do not automatically switch paths or post mentions on failure.
3. Codex implements/tests, preserves coherent checkpoints, and returns a draft PR
   within the authorized scope. Follow quality/build and relevant E2E/artifact
   requirements. An implementer's report is not independent acceptance.
4. Independent review pins the exact SHA and concrete evidence. Resolve all P0,
   P1 and high-impact P2. A changed head invalidates previous approval and affected
   acceptance; re-review and obtain fresh exact-SHA owner approval. Never infer
   approval from green CI, an old manifest or an earlier merged PR.
5. Stop for the owner's merge decision. Preview, Production, saved screenshots,
   responsive emulation and physical-device testing are different evidence.
   Mark unavailable required evidence UNTESTED/BLOCKED; do not relabel it PASS.
   Production access/deployment happens only within separately authorized scope.

No Work profile or `gameai-acceptance/v1` payload is required for new manual work.
Report reviewer identity, actual method/environment, source/target SHA, findings,
tests and evidence honestly. Do not fabricate Work execution, model attestation,
connector identity or a legacy manifest claim for どっさん's results.

## Repository switch and retained protections

`.github/orchestration/operation-mode.json` explicitly selects `owner-directed`.
Missing/malformed/unknown configuration also disables the legacy loop. Event
payloads, actors, workflow inputs and environment variables cannot enable it.
The retained `legacy-automatic` branch is for regression preservation only;
reactivation requires a separately reviewed code/config change, including the
validator expectation. It is not a per-task opt-in or owner-resume option.

The shared guard suppresses initialization, generic event ingress, transition
relay, Work connector ingress (including App ID 1144995 and replay), human
acceptance ingress, Preview/Vercel/Production readiness, browser-capability retry,
owner resume, PR101 → Issue74 recovery, Work watchdog and automatic hotfix Issue
creation. Dispatch and both child-Issue creation sinks are independently guarded.
Scheduled reconciliation may still project existing labels; it cannot dispatch.
PR/check_run observation and binding keep generation/SHA checks, stale-approval
invalidation and human authorization protection. Reducer history, duplicate
suppression, schemas, workflows and legacy profile registry remain intact.

This is not cancellation or migration of old runs. Existing Issues/PRs, manifests,
generations and historical evidence are not administratively cleaned up. Any such
cleanup requires separate owner instructions. A FAIL or browser infrastructure
failure is reported with evidence/options; it does not request new work automatically.

The switch applies when this change reaches main and new workflow executions use
it. Before merge, main still has the old automation. Already-running workflows,
old checked-out refs and account-side Work tasks are not stopped by a repository
PR. Owner verification of outstanding runs and account-side triggers is a cutover
prerequisite; no account/Environment/credential/repository settings are changed
here. Empty generic actor allowlists never sufficed to disable the dedicated
connector ingress. Branch protection and required checks remain an owner-managed
boundary; this migration does not assert they were configured or verified.

If an old manifest-bound PR is blocked by the retained machine authorization gate,
report that state for a separately approved reconciliation; do not forge Work
results, bind a new manual task to an old claim or bypass required status checks.

## Affiliate updates

Only explicit authorized inputs run `register-affiliate.yml`. Existing registry,
sync and quality validation remain. Changes go to a dedicated `affiliate/update-`
branch and draft PR; no main push, deploy command or merge is performed. If the
repository disallows Actions-created PRs, preserve the branch and report the
failure for an authorized operator to create the PR without changing settings.
