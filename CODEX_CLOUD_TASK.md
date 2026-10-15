# GameAI Hub — Codex Cloud Task Bootstrap & Delivery Protocol

This document is the single source of truth for Codex Cloud Task execution in this repository.

It owns:
- environment bootstrap
- Git/GitHub recovery
- branch creation or resume
- remote preservation
- progress ledgers
- checkpoints
- PR creation/update
- merge authorization handling
- Vercel Preview / Production verification
- Production smoke testing

Do not duplicate these procedures in root `AGENTS.md` or task prompts unless the current task needs an explicit exception.

Repository: `komekome898-web/GameAI-Hub`

Canonical origin: `https://github.com/komekome898-web/GameAI-Hub.git`

Production branch: `main`

Production site: `https://game-ai-hub.vercel.app`

## Standard task and Environment model

Current coordination follows [owner-directed operations](docs/agent-guides/OWNER_DIRECTED_OPERATIONS.md).
The owner approves scope; どっさん launches the scoped task in the saved Environment.
A GitHub Codex mention is a separate, explicitly authorized launch route, never
an automatic fallback. Preserve Issue/branch/PR/SHA lineage and record which route
actually ran; do not create a mention merely because a saved task cannot start.

All branch/push/PR procedures below apply only to user-authorized writes. They do
not confer permission. Read-only investigation/review verifies read access,
origin/fetch and base SHA, but needs no write-path proof or push checkpoint.

The execution continuity model is:

> **fresh Codex Cloud task + published reusable GameAI-Hub Environment + resume existing GitHub repository lineage**

A GitHub `@codex` dispatch normally creates a fresh task identity. Continuity
comes from the Issue, existing branch and PR, remote commits/checkpoints,
progress ledger, and repository instructions—not a prior task's ephemeral
workspace or conversational memory. When unfinished valid work exists, the
fresh task resumes its latest verified remote head on the same Issue, branch,
and PR. **NEW_TASK does not mean NEW_BRANCH or NEW_PR.** Reusing a task/thread
is exceptional and is justified only to preserve valid uncommitted or unpushed
workspace state that cannot yet be reconstructed from repository truth.

The published Environment may prepare dependencies, browser tooling, origin,
authentication inputs, and a fetch before a task starts. Those are performance
and preparation benefits only. They never satisfy or weaken the hard gates in
Sections 2–3; every task verifies the resulting state again. The account-side
Environment contract and authoritative Setup/Maintenance examples live in
[`docs/agent-guides/CODEX_CLOUD_ENVIRONMENT.md`](docs/agent-guides/CODEX_CLOUD_ENVIRONMENT.md).

## 1. Read governing instructions first

Read in this order:

1. the explicit task request
2. the referenced GitHub Issue, if any
3. root `AGENTS.md`
4. this `CODEX_CLOUD_TASK.md`
5. scoped `AGENTS.md` files covering paths likely to change
6. relevant conditional guides:
   - growth/content/SEO/acquisition/retention/monetization → `docs/GROWTH_STRATEGY.md`
   - rendered UI/layout/navigation/responsive/user-facing flow → `docs/agent-guides/UI_ACCEPTANCE.md`
7. any existing `docs/codex-progress/<issue-or-task>.md`
8. an existing PR for the same task, when present

Do not rely on conversational memory when repository artifacts exist.

## 2. Mandatory startup bootstrap — HARD GATE

Never assume the local clone, either origin URL, local `main`, authentication
state, prepared dependencies, cache state, or prior task branch is valid—even
when Environment Maintenance has run.

**This section is a blocking precondition, not guidance. Complete it before substantial work of any kind.**

Until Sections 2.1–2.5 and the write-path proof in Section 3 succeed, do not begin:
- implementation or refactoring
- Production/browser audits beyond the minimum needed to bootstrap
- competitor/external research
- screenshot or evidence capture
- long-form documentation/specification drafting
- generated assets or reports
- any work that would be expensive to recreate if the workspace disappears

The task prompt does not need to repeat this requirement. It applies automatically to every Codex Cloud Task that is expected to leave durable repository artifacts.

Before substantial work, restore and verify the working environment.

### 2.1 Inspect existing work before changing branches

Inspect at minimum:

```bash
git status --short --branch
git log --oneline --decorate -12
git diff
git diff --staged
```

Preserve unknown or unrelated user work. Do not discard it merely to force a clean checkout.

### 2.2 Restore GitHub authentication without exposing secrets

The Environment may supply token-backed authentication inputs, but persisted
`gh` login state is not guaranteed. Authentication recovery and verification
are therefore **mandatory and explicit**, regardless of initial state.

Run the following before any authenticated Git operation. Do not use `set -x` around this block.

```bash
# Never print either variable.
if [ -n "${GITHUB_PAT:-}" ]; then
  export GH_TOKEN="$GITHUB_PAT"
fi

if [ -z "${GH_TOKEN:-}" ]; then
  echo "BLOCKED: neither GH_TOKEN nor GITHUB_PAT is available for GitHub write access" >&2
  exit 1
fi

# Configure Git's credential path from the token-backed gh environment.
gh auth setup-git
```

Then verify authentication **without displaying token values**:

```bash
gh auth status
gh api repos/komekome898-web/GameAI-Hub --jq '.full_name'
```

Rules:
- Prefer an already supplied `GH_TOKEN`; otherwise map the supplied `GITHUB_PAT` into `GH_TOKEN` exactly as above.
- Do not echo, inspect, serialize, log, screenshot, commit, or report either credential value.
- Do not ask the user to paste a token into chat.
- Do not conclude “no GitHub credentials” merely because `gh auth status` initially reports no stored host. First perform the environment-variable recovery above.
- Read access is not proof of write access. Section 3's real push proof remains mandatory.
- If neither environment credential exists, or `gh auth setup-git` / authenticated API access fails after this recovery, stop before substantial work and report the exact bootstrap blocker.

### 2.3 Restore `origin`

Do not assume a remote already exists.

```bash
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin https://github.com/komekome898-web/GameAI-Hub.git
else
  git remote add origin https://github.com/komekome898-web/GameAI-Hub.git
fi

git fetch origin --prune
```

Verify:

```bash
test "$(git remote get-url origin)" = "https://github.com/komekome898-web/GameAI-Hub.git"
test "$(git remote get-url --push origin)" = "https://github.com/komekome898-web/GameAI-Hub.git"
git show-ref --verify refs/remotes/origin/main
```

If `origin/main` does not exist, stop substantial work and report the exact failure needed to diagnose it.

### 2.4 Reconstruct local `main`

Do not assume local `main` exists or is current.

After preserving relevant local work, reconstruct from remote state when needed:

```bash
git checkout -B main origin/main
```

### 2.5 Resume before duplicating

Before creating a branch, search for:
- an existing task branch
- an open PR for the same Issue/task
- a progress ledger under `docs/codex-progress/`
- pushed checkpoint commits

If valid unfinished work exists, resume it instead of creating a duplicate branch or PR.

If this is genuinely new work, create a dedicated branch from current `origin/main`.
Never perform substantial feature work directly on `main`.

## 3. Prove the write path before expensive work — HARD GATE

For every task that requires a branch, commit, pushed artifact, or PR, prove that work can be preserved remotely **before** investing in the task itself. This includes documentation-only audits and design specifications, not just application code.

A successful `gh auth status` alone is insufficient. A token existing in the environment is insufficient. The proof must exercise the actual repository write path.

Required sequence:
1. restore/verify canonical `origin`
2. `git fetch origin --prune`
3. verify `origin/main` and record its SHA
4. create or resume the dedicated task branch
5. create the smallest harmless coherent checkpoint needed to establish the branch remotely
6. push it
7. verify the remote branch/ref and pushed SHA from GitHub
8. only then start substantial audit/research/implementation

For read-only investigation/review, no explicit prohibition is needed: do not
create a branch, commit or push checkpoint. Record the read-only exception and
base SHA, and do not claim a durable repository handoff.
For an authorized write task, pushing the unmodified base SHA to a dedicated new
branch is sufficient initial proof; an empty commit is unnecessary.

For a new long-running or interruption-prone task, prove that work can be preserved remotely before investing heavily in implementation.

Create a harmless coherent first checkpoint, push the task branch, and verify the pushed commit/branch exists remotely.

### 3.1 Checkpoint quality gate and notification discipline

Remote durability does **not** mean pushing every intermediate edit. Every push can trigger repository Actions and user notifications.

For the initial bootstrap checkpoint:
- keep it harmless and coherent (normally only the progress ledger or another non-runtime skeleton)
- do not include knowingly broken application/test code
- perform `git diff --check` and any trivial validation relevant to the checkpoint before pushing

After substantial work begins, push only at **recoverable coherent milestones**, not after each small edit or failed experiment.

Before every non-bootstrap checkpoint push:
1. inspect the exact diff and changed paths
2. run `git diff --check`
3. run the fastest relevant local gate for the changed scope (targeted unit/test, lint/typecheck subset, or equivalent)
4. if application/runtime/test code changed, do not push while that relevant gate is known failing
5. only after the fast gate passes, commit and push the coherent checkpoint
6. reserve full `npm run quality`, full E2E, and build for the task's required acceptance points/final handoff unless the task explicitly requires them earlier

Rules:
- never use remote CI as the normal edit-debug loop
- never knowingly push a red checkpoint merely to preserve it
- if a failing experiment is valuable, keep it local until repaired or record the finding in the already-pushed progress ledger
- do not create a series of tiny checkpoint pushes that each trigger the same workflows
- a checkpoint should be large enough to be useful for recovery and small enough to resume safely
- if a remote checkpoint unexpectedly fails CI, diagnose/fix it before the next feature checkpoint rather than stacking additional known-red pushes

The goal is both durability **and** low-noise repository operation.

If push fails:
1. **stop substantial task work immediately; do not create a large local-only artifact**
2. inspect authentication
3. inspect `origin`
4. fetch/prune again
5. confirm the branch/ref
6. retry safe recovery
7. if still blocked, report the bootstrap blocker and end the task before accumulating unpushed work

Do not finish a large implementation, audit, design specification, evidence set, or research report before discovering that remote preservation is broken.

### 3.2 Bootstrap evidence required in final handoff

For tasks with repository writes, the final report must identify:
- canonical origin verified
- fetched `origin/main` SHA used as the base
- remote task branch
- earliest remotely verified checkpoint SHA
- final pushed SHA
- PR URL when a PR is required

If these cannot be supplied from remote repository truth, do not describe the repository handoff as complete.

## 4. Progress ledger

For substantial multi-phase work, create/update:

```text
docs/codex-progress/<issue-or-task>.md
```

Keep it concise and machine-resumable. Include only:
- task / Issue
- working branch
- latest pushed checkpoint commit
- completed phases
- current phase
- remaining phases
- unresolved P0/P1/high-impact P2
- quality/build/E2E status
- GitHub/PR/deployment status when relevant
- blockers
- exact next action on resume

Do not turn the ledger into:
- a task diary
- chain-of-thought
- duplicated Issue content
- duplicated PR body

Do not place secrets, tokens, credentials, or private user data in the ledger.

## 5. Checkpoint and push policy

For substantial or interruption-prone tasks, checkpoint at meaningful recoverable boundaries.

Do not create checkpoint commits merely to satisfy a count.
A checkpoint is warranted when:
- substantial work would be expensive to recreate
- a risky refactor is about to begin
- a major phase is complete
- review produced a coherent fix set
- runtime/tool budget is becoming constrained

A checkpoint should represent a coherent recoverable state, preferably compilable or near-compilable.
Use precise messages such as:

```text
checkpoint: <issue or feature> — <completed phase>
```

Push stable checkpoints to the remote branch. If runtime/quota is shrinking, preserving work via commit + push + ledger takes priority over starting another large phase.

## 6. Implementation and acceptance routing

All implementation follows root `AGENTS.md`, the task Issue, and applicable scoped rules.

When a task has a `gameai-run-manifest/v` contract, Codex must also follow `docs/agent-guides/ORCHESTRATION.md`: pin its task version, generation, explicit branch/PR and `base_head_sha`. A head-lineage mismatch aborts the claim and preserves human changes; Preview repair continues the same open PR, while Production repair requires a linked child hotfix run and new PR. Repeat GitHub mentions are new tasks, not same-thread resume. Each repair task must record its newly observed task/thread identity independently, and a comment requesting Codex is transport rather than proof that a task started or acknowledged the claim.

For user-facing UI/layout/navigation/responsive flows, follow `docs/agent-guides/UI_ACCEPTANCE.md`.
Passing tests alone is not sufficient for rendered UI acceptance.

For growth/content/SEO/acquisition/retention/monetization work, follow `docs/GROWTH_STRATEGY.md` where relevant.

For article changes under `app/articles/`, follow `app/articles/AGENTS.md` including atomic page/registry publishing rules.

Do not weaken tests merely to make the pipeline green. Do not skip failing E2E without determining whether the cause is stale test logic, environment-only failure, or a real product regression.

## 7. Required technical gates

Run relevant repository gates. For substantial work, at minimum:

```bash
npm run quality
npm run build
```

Run relevant E2E and targeted tests when available.

If a required gate fails:
1. reproduce it
2. classify the cause
3. fix the implementation or legitimately stale test
4. rerun

Do not report merge readiness while a required acceptance gate is failing.

## 8. PR protocol

When acceptance criteria are met enough for review:

1. ensure stable work is committed
2. push the branch
3. fetch latest `origin/main`
4. inspect divergence/conflicts
5. safely rebase or merge current `origin/main` when appropriate
6. rerun required gates after conflict resolution/integration
7. create or update one PR for the task

PR body should record:
- user/product outcome
- major changes
- validation performed
- rendered/browser evidence when required
- regression audit
- unresolved lower-severity issues
- progress/evidence paths

Do not create duplicate PRs for the same uninterrupted task when an existing PR can be updated.

## 9. Merge authorization

Merge requires explicit authorization in the current task.

If the task authorizes merge after acceptance, that authorization applies only after all blocking criteria are satisfied.

Do not interpret merge authorization as permission to ignore:
- failing tests
- failing rendered/browser acceptance
- merge conflicts
- CI failures
- unresolved P0/P1/high-impact P2

If the task does not explicitly authorize merge, stop at a PR (draft while independent review is pending).

## 10. Merge and deployment completion

When merge is authorized and blockers are clear:

1. confirm the PR targets `main`
2. confirm required checks/CI are successful
3. confirm Vercel Preview is successful when available/relevant
4. confirm no unresolved P0/P1/high-impact P2 blockers
5. merge using the repository's normal safe merge method
6. record the actual merge commit/SHA
7. fetch/update `main`
8. confirm the merged commit is reachable from `origin/main`
9. confirm Vercel Production deployment succeeds
10. perform a minimum Production smoke test for affected user journeys when the environment allows
11. update the progress ledger/final report

Do not delete the remote task branch until the merge is confirmed and work is safely present on `main`.

## 11. Failure recovery and resume

If PR creation, merge, CI, GitHub, or deployment fails after implementation:
- keep all work committed and pushed
- keep/update the existing PR if possible
- update the progress ledger with exact failure state and next action
- retry transient/recoverable GitHub/auth/remote failures when feasible
- if runtime ends, leave repository state sufficient for a fresh task to resume

A legitimate blocker means the correct outcome is a durable pushed checkpoint + PR + precise recovery state, not a false success report.

A fresh task resuming existing work should inspect:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git log --oneline --decorate -12
```

Then read the relevant Issue, root `AGENTS.md`, this file, scoped instructions,
existing PR, and progress ledger. Use the published GameAI-Hub Environment when
available, but reconstruct continuity from the latest verified remote state.

Classify repository truth into:
- completed
- in progress
- remaining
- blocked

Continue existing valid work. Do not restart from scratch unless repository evidence proves it is invalid.

Use this recovery hierarchy:
1. current repository state and committed code
2. latest pushed checkpoint
3. progress ledger
4. target GitHub Issue
5. root/scoped instructions
6. previous task narrative/report

If narrative conflicts with Git state, trust Git state.

If a subagent fails or times out, preserve successful durable work and respawn only the missing role/review when needed. Do not restart all agents mechanically.

## 12. Final report

Keep the final report factual and compact. Include as relevant:
- branch
- PR URL
- latest task commit
- quality/build/E2E results
- acceptance/browser evidence
- unresolved P0/P1/high-impact P2
- merge result and merge SHA
- Vercel Production status
- Production smoke result
- remaining lower-severity or physical-device limitations

Do not use unsupported self-evaluation such as “perfect”, “production-ready”, or “best”.

## 13. Core reliability invariant

For every substantial Codex Cloud Task, the intended lifecycle is:

```text
start a fresh task in the reusable Environment when available
→ restore/verify origin/main
→ resume existing work or create task branch
→ prove remote push works
→ implement with recoverable checkpoints
→ run acceptance + gates
→ PR
→ fix/retest until blockers are zero
→ merge only when explicitly authorized
→ verify main + Vercel Production
→ Production smoke test
```

The repository, not chat history, must contain enough state to resume the work.
