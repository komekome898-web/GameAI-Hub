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

## 2. Mandatory startup bootstrap

Never assume the local clone, `origin`, local `main`, authentication state, or prior task branch is valid.

Before substantial implementation, restore and verify the working environment.

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

If `GH_TOKEN`, `GITHUB_PAT`, or another authorized GitHub credential is available, use it without printing its value.

Typical setup when applicable:

```bash
export GH_TOKEN="${GH_TOKEN:-$GITHUB_PAT}"
gh auth setup-git
```

Never echo, log, print, commit, screenshot, or include secret/token values in reports.

If authentication is unavailable, try the environment's supported GitHub connection. If write access still cannot be established, do not begin substantial work that cannot be preserved remotely.

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

## 3. Prove the write path before expensive work

For a new long-running or interruption-prone task, prove that work can be preserved remotely before investing heavily in implementation.

Create a harmless coherent first checkpoint, push the task branch, and verify the pushed commit/branch exists remotely.

If push fails:
1. inspect authentication
2. inspect `origin`
3. fetch/prune again
4. confirm the branch/ref
5. retry safe recovery
6. if still blocked, stop before accumulating large unpushed work

Do not finish a large implementation before discovering that remote preservation is broken.

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

When a task has a `gameai-run-manifest/v` contract, Codex must also follow `docs/agent-guides/ORCHESTRATION.md`: pin its task version, generation, explicit branch/PR and `base_head_sha`. A head-lineage mismatch aborts the claim and preserves human changes; Preview repair continues the same open PR, while Production repair requires a linked child hotfix run and new PR. A comment that requests Codex is not proof that a task started or resumed.

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

If the task does not explicitly authorize merge, stop at a merge-ready PR.

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

A fresh resume should inspect:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git log --oneline --decorate -12
```

Then read the relevant Issue, root `AGENTS.md`, this file, scoped instructions, existing PR, and progress ledger.

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
bootstrap environment
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
