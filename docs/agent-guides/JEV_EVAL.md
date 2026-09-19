# Jev Phase 0/1 evaluation

Evaluate shadow traces separately from authoritative orchestration. Retain requested/observed model, schema and policy versions, timestamp, probabilities, confidence, bounded usage, and latency when available. Never retain request headers or secrets.

For each semantic route, compare the shadow choice with an independent human assessment. Record disagreement; do not create task-specific automated thresholds and do not change reviewer dispatch.

For browser preflight, confirm that every decision references the exact fresh observation and an observed action ID, mutations are not blindly retried, `TYPE_TEXT` carries no generated value, and `DONE` is accepted only after an independent verifier. Browser shadow results are not Production evidence.

Technical failures measure availability only. They are not product failures and must not block, mutate, or advance the Run Manifest. Phase 0/1 does not reduce Work calls, reviewers, or Acceptance attempts and does not affect merge eligibility.
