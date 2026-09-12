# Work acceptance and bridge boundary

## Required profiles

`.github/orchestration/profiles.json` revision 1 is authoritative. Preview, ordinary research and evidence require `work-standard` = GPT-5.6 Sol / Medium. Production final acceptance, P0/P1 independent verification, security/privacy/integrity and orchestration E2E require `work-critical` = GPT-6 Astra / Low. A run pins ID and revision. Never silently fall back; unavailable configuration blocks.

Record separately: required profile; registry revision; account configuration status (`REQUIRED`, `UNCONFIGURED`, `CONFIGURED_UNVERIFIED`, `VERIFIED`, `BLOCKED`); last observation; evidence URL. Declared model names do not attest the actual runtime.

## Account setup and experiments

Create two native ChatGPT Work tasks only where the account UI supports GitHub PR triggers. Preview listens for relevant open/ready/commit activity but acts only on a current claim. Production listens for completed merge but waits until the target merge SHA is proven deployed. Use the prompt in `docs/prompts/WORK_ACCEPTANCE_PROMPT.md`; authorize the repository read/write scope needed for evidence, and enroll the observed App actor only after a safe writeback succeeds.

| Experiment | Activation state |
|---|---|
| EXP-CODEX-INITIAL / ACK / BOT / RESUME | NEEDS EXPERIMENT |
| EXP-WORK-TRIGGER / WRITEBACK / MODEL / MODEL-ATTEST | ACCOUNT-SIDE SETUP |
| EXP-PREVIEW-READY / EXP-PRODUCTION-READY | NEEDS EXPERIMENT |

For each experiment record event delivery, actual task/ack ID if exposed, exact claim/SHA, observed actor, result URL and time. Posting `@codex`, writing setup docs, or receiving CI is insufficient. Unsupported behavior becomes `UNSUPPORTED`; unavailable credentials/configuration becomes `BLOCKED`.

Critical acceptance is one Work run using five explicit rubric sections: Functional, User Journey, Regression, Instruction Compliance and Evidence Validity. v1 does not fan out five Work tasks.

## Result contract

Return exactly one `gameai-acceptance/v1` JSON marker. Required fields are enforced by the reducer: run/task version, stage/attempt, repository/Issue/PR/SHA, environment, targets, required profile/revision, actor provenance, verdict and findings. Use stable finding IDs and severity. `UNTESTED` cannot become PASS; P0/P1/high-impact P2 block. Preview and Production observations are separate.
