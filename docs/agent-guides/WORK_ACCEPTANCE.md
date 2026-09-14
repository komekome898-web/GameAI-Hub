# Work acceptance and bridge boundary

## Required profiles

`.github/orchestration/profiles.json` revision 1 is authoritative. Preview, ordinary research and evidence require `work-standard` = GPT-5.6 Sol / Medium. Production final acceptance, P0/P1 independent verification, security/privacy/integrity and orchestration E2E require `work-critical` = GPT-6 Astra / Low. A run pins ID and revision. Never silently fall back; unavailable configuration blocks.

Record separately: required profile; registry revision; account configuration status (`REQUIRED`, `UNCONFIGURED`, `CONFIGURED_UNVERIFIED`, `VERIFIED`, `BLOCKED`); last observation; evidence URL. Declared model names do not attest the actual runtime.

## Account setup and experiments

Create two native ChatGPT Work tasks only where the account UI supports GitHub PR triggers. Preview listens for relevant open/ready/commit activity but acts only on a current claim. Production listens for completed merge but waits until the target merge SHA is proven deployed. Use the prompt in `docs/prompts/WORK_ACCEPTANCE_PROMPT.md`; authorize the repository read/write scope needed for evidence, and enroll the observed App actor only after a safe writeback succeeds.

Preview dispatch is the creation of exactly one fenced `gameai-work-dispatch/v1` PR comment for a runnable claim. Configure the native task to react to that PR-comment activity, not to infer readiness from CI or labels. It must re-fetch the Issue Manifest, PR head, and same-claim candidates before opening the contract's exact deployment URL. Duplicate/stale events are no-ops. Scheduled reconciliation recreates a missing dispatch comment after a crash, but never creates a second same-claim dispatch. The connector-authored candidate ingress independently re-fetches the comment and requires observed GitHub App ID `1144995`; it rejects zero/multiple current-claim candidates and then delegates the verdict to the existing reducer. Connector writeback alone records `CONFIGURED_UNVERIFIED`, not `VERIFIED`; only separately observed task start plus browser evidence may justify `VERIFIED`.

| Experiment | Activation state |
|---|---|
| EXP-CODEX-INITIAL / ACK / BOT / RESUME | NEEDS EXPERIMENT |
| EXP-WORK-TRIGGER / WRITEBACK / MODEL / MODEL-ATTEST | ACCOUNT-SIDE SETUP |
| EXP-PREVIEW-READY / EXP-PRODUCTION-READY | NEEDS EXPERIMENT |

For each experiment record event delivery, actual task/ack ID if exposed, exact claim/SHA, observed actor, result URL and time. Posting `@codex`, writing setup docs, or receiving CI is insufficient. Unsupported behavior becomes `UNSUPPORTED`; unavailable credentials/configuration becomes `BLOCKED`.

Critical acceptance is one Work run using five explicit rubric sections: Functional, User Journey, Regression, Instruction Compliance and Evidence Validity. v1 does not fan out five Work tasks.

## Interactive browser capability

Production Acceptance requires direct rendering and interaction on the exact claimed Production deployment. The Work execution environment may use any supported interactive browser mechanism capable of completing the applicable journey: entering input, clicking or tapping controls, interacting with iframes when required, and checking browser back/forward/history restoration when applicable. The mechanism does **not** have to be named `Cloud Browser`; that product name is not part of the acceptance contract.

Search results, HTTP requests/fetches, static HTML, DOM or source inspection, screenshots alone, CI, GitHub or Vercel status, and Preview evidence cannot substitute for direct Production interaction evidence. Deployment/status evidence may establish readiness and exact-SHA fencing, but not user-facing behavior. If the Work execution environment has no qualifying interactive browser mechanism, the applicable journey remains `UNTESTED` and the verdict is `BLOCKED`; never infer or convert it to PASS.

## Result contract

Return exactly one `gameai-acceptance/v1` JSON marker. Required fields include immutable result/claim IDs, run/task version, stage/attempt, repository/Issue/PR/SHA, environment, targets, required profile/revision, actor provenance, verdict and findings. Provenance is overwritten from the GitHub event envelope rather than accepted from payload text. The ingress is disabled by an empty actor allowlist until a real write-capable Work App/bot is observed and enrolled; never guess or forward it as `github-actions[bot]`. Use stable finding IDs and severity. `UNTESTED` cannot become PASS; P0/P1/high-impact P2 block.
