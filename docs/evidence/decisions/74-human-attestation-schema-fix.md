# Issue #74 — human-attestation schema fix

Live E2E on 2026-09-13 exposed two fail-closed runtime issues in the human-attested Work Acceptance fallback:

1. `scripts/orchestration.py` validates `gameai-acceptance/v1` against `.github/orchestration/schemas/acceptance.schema.json`, but that schema had not yet been registered on `main` alongside the runtime scripts.
2. The fallback temporarily added owner-attestation audit fields inside `actor_provenance`, while the strict schema allows only `verified_by`, `sender`, `actor_type`, and `app_id`.

The schema is now present on `main`. This change keeps the strict Acceptance result provenance shape unchanged and records owner-attestation-specific identifiers only in the reducer event trigger audit record.

No Acceptance actor trust is expanded. No candidate verdict is changed. No merge or Production authorization is implied.
