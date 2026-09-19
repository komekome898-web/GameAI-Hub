"""Deterministic, bounded shadow-state construction."""
from __future__ import annotations

import json
from typing import Any

from .redact import assert_clean, redact
from .schemas import MAX_STATE_BYTES


def bounded_state(facts: dict[str, Any], *, known_secrets: tuple[str, ...] = ()) -> dict[str, Any]:
    if not isinstance(facts, dict):
        raise ValueError("state facts must be an object")
    clean = redact(facts)
    assert_clean(clean, known_secrets=known_secrets)
    encoded = json.dumps(clean, sort_keys=True, separators=(",", ":")).encode()
    if len(encoded) > MAX_STATE_BYTES:
        raise ValueError("Jev state exceeds bounded size")
    return clean

