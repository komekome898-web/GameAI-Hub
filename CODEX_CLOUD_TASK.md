# GameAI Hub — Codex Cloud Task Bootstrap & Delivery Protocol

This document is the persistent execution contract for every new Codex Cloud Task in this repository.

The owner should not need to repeat Git/GitHub recovery, checkpoint, PR, merge, or deployment instructions in every task prompt. Codex must read and follow this file before substantial implementation work.

Repository: `komekome898-web/GameAI-Hub`

Canonical origin: `https://github.com/komekome898-web/GameAI-Hub.git`

Production branch: `main`

Production site: `https://game-ai-hub.vercel.app`

This document complements root `AGENTS.md`, scoped `AGENTS.md` files, task-specific GitHub Issues, and `docs/GROWTH_STRATEGY.md`.

## 1. Mandatory startup bootstrap for every new Cloud Task

Never assume the local clone, `origin`, local `main`, authentication state, or prior task branch is valid.

Before substantial implementation, Codex must restore and verify the working environment.

### 1.1 Read the governing instructions first

Read, in this order:

1. the explicit task request
2. the referenced GitHub Issue, if any
3. root `AGENTS.md`
4. this `CODEX_CLOUD_TASK.md`
5. any scoped `AGENTS.md` files covering files likely to change
6. `docs/GROWTH_STRATEGY.md` when the task affects growth, SEO, content, acquisition, retention, monetization, or product strategy
7. any existing `docs/codex-progress/<issue-or-task>.md`

Do not rely on conversational memory when repository artifacts exist.

### 1.2 Restore GitHub authentication without exposing secrets

If `GH_TOKEN` / `GITHUB_PAT` or another authorized GitHub credential is available in the environment, use it without printing its value.

Typical setup when applicable:

```bash
export GH_TOKEN="${GH_TOKEN:-$GITHUB_PAT}"
gh auth setup-git
```

Never echo, log, print, commit, screenshot, or include secret/token values in reports.

If authentication is unavailable, first attempt the environment's supported GitHub connection. If write access still cannot be established, do not begin a large implementation that cannot be preserved remotely.

### 1.3 Restore `origin` every time

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

If `origin/main` does not exist, stop substantial work and report the exact error/output needed to diagnose it.

### 1.4 Reconstruct local `main`

Do not assume a local `main` branch exists or is current.

Safely reconstruct it from the remote state. A typical approach is:

```bash
git checkout -B main origin/main
```

Before doing so, inspect existing local/uncommitted work and preserve anything that belongs to the requested task. Never discard unknown user work merely to force a clean checkout.

### 1.5 Decide whether this is a new task or a continuation

Before creating a branch, search for:

- an existing task branch
- an open PR for the same Issue/task
- a progress ledger under `docs/codex-progress/`
- pushed checkpoint commits

If valid unfinished work already exists, resume it instead of creating a duplicate branch or PR.

If this is genuinely new work, create a dedicated branch from current `origin/main`.

Use a descriptive branch name, for example:

```text
feat/issue-40-content-seo-engine
fix/<concise-problem>
```

Never perform a substantial feature directly on `main`.

## 2. Mandatory write-path proof before large implementation

The most important reliability rule is: **prove that work can be preserved remotely before investing heavily in it.**

For a new long-running task, create a harmless initial checkpoint, such as the progress ledger or another coherent task artifact, commit it, and push the task branch.

Verify the remote branch exists and the pushed commit is visible remotely.

If push fails:

1. inspect authentication
2. inspect `origin`
3. fetch/prune again
4. confirm the branch/ref
5. retry safe recovery
6. if still blocked, stop before accumulating large unpushed work

Do not finish hours of implementation before discovering that GitHub write access is broken.

## 3. Progress ledger is mandatory for substantial Cloud Tasks

For multi-phase work, create/update:

```text
docs/codex-progress/<issue-or-task>.md
```

It must stay concise and include:

- task / Issue
- working branch
- latest pushed checkpoint commit
- completed phases
- current phase
- remaining phases
- P0/P1/high-impact P2 findings
- quality/build/E2E status
- GitHub/PR status
- deployment status when relevant
- blockers
- exact next action after resume

The ledger exists so another Cloud Task can resume from repository state even if the current task is terminated.

## 4. Checkpoint and push policy

Do not accumulate a long task in one final commit.

At each materially stable phase:

```bash
git add <relevant files>
git commit -m "checkpoint: <task> — <completed phase>"
git push origin <working-branch>
```

Update the progress ledger and push it as part of the checkpoint.

Checkpoint before:

- large refactors
- risky migrations
- extended subagent/review rounds
- browser/E2E setup that may consume significant runtime
- signs of approaching usage/runtime limits

If runtime or quota is running out, preserving work via commit + push + ledger takes priority over beginning another feature.

## 5. Implementation and acceptance

All implementation must also follow root `AGENTS.md` and the task Issue.

Passing tests alone is not sufficient for user-facing product/UI/content changes. Use the repository's required rendered/browser acceptance, adversarial review, regression checks, evidence, and content-quality rules.

Do not weaken tests merely to make the pipeline green. Do not skip failing E2E without determining whether the failure is stale test logic, environment-only failure, or a real product regression.

## 6. Required technical gates before PR is merge-ready

Run the relevant repository gates. For substantial work, at minimum:

```bash
npm run quality
npm run build
```

Run relevant E2E and targeted tests when available/relevant.

If a required gate fails:

1. reproduce it
2. classify cause
3. fix the implementation or legitimately stale test
4. rerun

Do not report merge readiness while a required acceptance gate is failing.

## 7. PR protocol

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
- major implementation changes
- validation performed
- rendered/browser evidence when required
- regression audit
- unresolved lower-severity issues
- progress/evidence paths

Do not create duplicate PRs for the same uninterrupted task when an existing PR can be updated.

## 8. Merge authorization model

A task prompt may explicitly authorize Codex to merge after acceptance.

When the current task explicitly says that final acceptance includes merge, that authorization applies only after all blocking criteria are satisfied.

Do not interpret merge authorization as permission to ignore failing tests, failing visual/browser acceptance, merge conflicts, CI failures, or unresolved P0/P1/high-impact P2 issues.

If the task does **not** explicitly authorize merge, stop at a merge-ready PR.

## 9. Merge completion protocol

When merge is authorized and all blockers are clear:

1. confirm the PR targets `main`
2. confirm required checks/CI are successful
3. confirm Vercel Preview is successful when available/relevant
4. confirm no unresolved P0/P1/high-impact P2 blockers
5. merge using the repository's normal safe merge method
6. record the actual merge commit/SHA
7. fetch/update `main`
8. confirm the merged commit is reachable from `origin/main`
9. confirm Vercel Production deployment succeeds
10. perform a minimum production smoke test for affected user journeys when the environment allows
11. update the progress ledger/final report

Do not delete the remote working branch until the merge is confirmed and work is safely present on `main`.

## 10. Merge/deployment failure recovery

If PR creation, merge, CI, GitHub, or deployment fails after implementation:

- never delete the task branch
- keep all work committed and pushed
- keep/update the existing PR if possible
- update the progress ledger with exact failure state and next action
- retry transient/recoverable GitHub/auth/remote failures in the same task when feasible
- if runtime ends, leave the repository in a state that a fresh Cloud Task can resume without reconstructing work from chat

A task that cannot merge due to a legitimate blocker is not allowed to falsely report success. The correct outcome is a durable pushed checkpoint + PR + precise recovery state.

## 11. Resume protocol for a fresh Cloud Task

A new task resuming existing work should begin by running/inspecting:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git log --oneline --decorate -12
```

Then read the relevant Issue, root `AGENTS.md`, this file, existing PR, and progress ledger.

Classify repository truth into:

- completed
- in progress
- remaining
- blocked

Continue the existing branch/PR. Do not restart from scratch unless repository evidence proves the existing work is invalid.

## 12. Final report format

Keep the final report factual and compact. Include:

- branch
- PR URL
- latest task commit
- quality/build/E2E results
- acceptance/browser evidence where relevant
- unresolved P0/P1/high-impact P2
- merge result
- merge commit/SHA
- Vercel Production status
- production smoke-test result
- any remaining lower-severity issues

Do not use unsupported self-evaluation such as “perfect”, “production-ready”, or “best”.

## 13. Core reliability invariant

For every substantial Codex Cloud Task, the intended lifecycle is:

```text
bootstrap environment
→ restore/verify origin/main
→ resume existing work or create task branch
→ prove remote push works
→ implement in checkpoints
→ push continuously
→ run acceptance + gates
→ PR
→ fix/retest until blockers are zero
→ merge when explicitly authorized
→ verify main + Vercel Production
→ production smoke test
```

The repository, not chat history, must always contain enough state to resume the work.