# Jev shadow integration

Jev is an advisory classifier for bounded repository facts. It is not an orchestration actor, Acceptance evaluator, reviewer-removal mechanism, merge gate, or source of Production browser evidence.

## Authority boundary

- `scripts/orchestration.py::reduce` remains the sole Run Manifest mutation authority.
- Existing claim, SHA, generation, revision, Work-profile, Acceptance, human-merge, and Production-browser requirements remain unchanged.
- `DONE` means only that the browser shadow suggests stopping; an independent verifier must still establish the journey outcome. It is never Acceptance `PASS`.
- Any unavailable key, network error, timeout, rate limit, malformed response, response-model mismatch, redaction failure, or browser failure is a non-blocking shadow technical failure.

Phase 1 statuses are `SHADOW` for Reviewer Routing, Patch Scope, Research Source Triage, Citation Candidate Check, and Browser Preflight. Results always carry `authoritative: false`.

## Privacy and transport

Every request follows: deterministic bounded state → `redact()` → `assert_clean()` → schema validation → `JevClient`. Only `scripts/jev/client.py` calls `https://api.typesafe.ai/v1/systemone`.

Never include raw game ideas, generated code/HTML, raw errors, credentials, cookies, browser storage, screenshots, conversations, analytics payloads, connected-app content, or private affiliate identifiers. The response model must exactly equal the explicitly configured, pinned `TYPESAFE_MODEL`; `jev-latest` is rejected and there is no silent fallback.

## Browser preflight

The scaffold accepts only an indexed, freshly observed action registry bound to a registered safe journey. Each action requires an allowed safety classification and an explicit attestation that its short label is public, non-user data. Page facts are allowlisted metadata; raw page content is rejected. Model output resolves to a registry ID, never selectors, XPath, JavaScript, shell, coordinates, or URLs. A mutation forces fresh observation before another choice. `TYPE_TEXT` selects a field only; an eventual helper must return the exact value under a separate typed contract. Page text is untrusted data.

The journey registry covers Home → Project Generator, basic Project navigation, Project → first task, task → next task, article → Project CTA, back/forward, mobile navigation, and recovery. Destructive, paid, account-changing, and external-submit operations are excluded.

## Commands

Offline tests require no key:

```bash
python -m unittest scripts.tests.test_jev
```

The live smoke uses only synthetic state and never prints the key:

```bash
python -m scripts.gameai_jev smoke
```

Semantic routes accept a bounded JSON object from standard input or `--input FILE`:

```bash
python -m scripts.gameai_jev reviewer-routing --input facts.json
python -m scripts.gameai_jev patch-scope --input facts.json
python -m scripts.gameai_jev source-triage --input facts.json
python -m scripts.gameai_jev browser-preflight --input plan.json
```

Input is capped at 24,000 bytes. The first three commands use only the shared Jev wrapper. `browser-preflight` validates the Phase 1 scaffold locally and performs no browser or Production action. All output is non-authoritative.

Environment: required `TYPESAFE_API_KEY` and pinned `TYPESAFE_MODEL`, and (for future separated text/browser adapters) `TEXT_MODEL_API_KEY`, `TEXT_MODEL_BASE_URL`, `TEXT_MODEL`, `TEXT_MODEL_REASONING`, `BROWSER_USE_API_KEY`.
