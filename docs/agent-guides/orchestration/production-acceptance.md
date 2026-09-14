# Production acceptance
Use work-critical. Wait until Production proves the exact merge SHA. Do not reuse Preview evidence. A FAIL links evidence to a child hotfix run; P0 immediately blocks visibly.

## Interactive-browser capability handshake

Before evaluating the product, establish that this **run** can render the exact Production URL and perform input, click, and navigation. It must also be able to operate an iframe and browser back/forward when those actions apply to the claimed journey. This is capability-based: no branded tool, including a product named “Cloud Browser,” is itself required or sufficient.

If the run lacks a qualifying interactive browser, do not emit `PASS`, `FAIL`, or a product finding. Emit exactly one trusted `gameai-browser-capability/v1` signal for the current claim. Copy the current claim/run/task/revision/generation/attempt/repository/Issue/PR/merge SHA/deployment ID fences and report each capability as a boolean. Use reason `NO_QUALIFYING_INTERACTIVE_BROWSER`. A stale or duplicate signal is a no-op.

The repository increments only the infrastructure-retry counter, creates a fresh generation and attempt against the same immutable PR, merge SHA, and deployment, and dispatches it once. After three fresh technical retries, it records a visible technical block and stops automatic dispatch. Human merge authorization and audit history remain; claim-scoped profile overrides do not cross into the new generation.

When the handshake succeeds, Production `PASS` still requires reviewable evidence that render/input/click/navigation occurred and that iframe/back-forward were performed or explicitly not applicable. Search results, HTTP fetches, DOM/source inspection, CI, Vercel status, and Preview evidence cannot replace this interaction.

<!-- gameai-browser-capability:v1 -->
```json
{"schema":"gameai-browser-capability/v1","signal_id":"unique-signal-id","claim_id":"current-claim","run_id":"current-run","canonical_task_version":1,"expected_manifest_revision":0,"generation":1,"stage":"production_acceptance","attempt_id":"current-attempt","repository":"komekome898-web/GameAI-Hub","issue":74,"pr":76,"merge_sha":"40-hex-merge-sha","deployment_id":"exact-deployment-id","reason":"NO_QUALIFYING_INTERACTIVE_BROWSER","capabilities":{"render":false,"input":false,"click":false,"navigation":false,"iframe":false,"back_forward":false}}
```
