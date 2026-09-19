"""Fail-closed privacy boundary for Jev requests."""
from __future__ import annotations

import json
import re
from typing import Any

REDACTED = "[REDACTED]"
SENSITIVE_KEYS = re.compile(
    r"(api.?key|authorization|bearer|token|secret|password|cookie|storage|html|code|screenshot|runtime.?error|game.?idea|conversation|affiliate.?id)",
    re.IGNORECASE,
)
SECRET_PATTERNS = (
    re.compile(r"(?i)bearer\s+[A-Za-z0-9._~+\-/]+=*"),
    re.compile(r"(?i)(?:api[_-]?key|token|secret|password)\s*[:=]\s*[^\s,;]+"),
    re.compile(r"-----BEGIN [A-Z ]+PRIVATE KEY-----"),
)


class UnsafeState(ValueError):
    pass


def redact(value: Any) -> Any:
    """Return a deterministic copy with sensitive fields and token-like strings removed."""
    if isinstance(value, dict):
        return {
            str(key): REDACTED if SENSITIVE_KEYS.search(str(key)) else redact(item)
            for key, item in sorted(value.items(), key=lambda pair: str(pair[0]))
        }
    if isinstance(value, (list, tuple)):
        return [redact(item) for item in value]
    if isinstance(value, str):
        output = value
        for pattern in SECRET_PATTERNS:
            output = pattern.sub(REDACTED, output)
        return output
    if value is None or isinstance(value, (bool, int, float)):
        return value
    raise UnsafeState(f"unsupported state value: {type(value).__name__}")


def assert_clean(value: Any, *, known_secrets: tuple[str, ...] = ()) -> None:
    """Reject state containing known secrets or recognizable credential material."""
    serialized = json.dumps(value, sort_keys=True, separators=(",", ":"))
    for secret in known_secrets:
        if secret and secret in serialized:
            raise UnsafeState("known secret remained after redaction")
    for pattern in SECRET_PATTERNS:
        if pattern.search(serialized):
            raise UnsafeState("credential-like content remained after redaction")

