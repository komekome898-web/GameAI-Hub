"""The only shared transport allowed to call TypeSafe SystemOne."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
import json
import time
from typing import Any, Callable
from urllib import error, request

from .config import JevConfig
from .schemas import POLICY_VERSION, SCHEMA_VERSION, ChoiceAnswer, validate_answer, validate_choices
from .state import bounded_state

MAX_RESPONSE_BYTES = 256_000


class JevTechnicalFailure(RuntimeError):
    """A non-authoritative shadow failure that must not block orchestration."""

    def __init__(self, message: str, *, response_model: str | None = None):
        super().__init__(message)
        self.response_model = response_model


@dataclass(frozen=True)
class ShadowResult:
    status: str
    route: str
    requested_model: str
    response_model: str
    schema_version: str
    policy_version: str
    timestamp: str
    answer: ChoiceAnswer
    usage: dict[str, Any]
    latency_ms: int
    authoritative: bool = False

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


Transport = Callable[[str, dict[str, str], bytes, float], dict[str, Any]]


def _transport(url: str, headers: dict[str, str], body: bytes, timeout: float) -> dict[str, Any]:
    try:
        with request.urlopen(request.Request(url, data=body, headers=headers, method="POST"), timeout=timeout) as response:
            payload = response.read(MAX_RESPONSE_BYTES + 1)
            if len(payload) > MAX_RESPONSE_BYTES:
                raise JevTechnicalFailure("TypeSafe response exceeded the size limit")
            return json.loads(payload)
    except (error.URLError, error.HTTPError, json.JSONDecodeError, TimeoutError) as exc:
        raise JevTechnicalFailure("TypeSafe request failed; shadow result unavailable") from exc


class JevClient:
    def __init__(self, config: JevConfig, *, transport: Transport = _transport):
        self.config = config
        self.transport = transport

    def choose(self, *, route: str, facts: dict[str, Any], question: str, choices: dict[str, str]) -> ShadowResult:
        try:
            if not isinstance(route, str) or not route or len(route) > 80 or not route.replace("_", "").isalnum():
                raise ValueError("invalid route")
            if not isinstance(question, str) or not question or len(question) > 1_000:
                raise ValueError("invalid bounded question")
            validate_choices(choices)
            state = bounded_state(facts, known_secrets=(self.config.api_key,))
            body = {
                "model": self.config.requested_model,
                "state": state,
                "questions": {route: {"type": "choice", "criteria": choices, "instructions": question}},
            }
            started = time.perf_counter()
            raw = self.transport(
                self.config.endpoint,
                {"Authorization": f"Bearer {self.config.api_key}", "Content-Type": "application/json"},
                json.dumps(body, sort_keys=True, separators=(",", ":")).encode(),
                self.config.timeout_seconds,
            )
            response_model = raw["model"]
            if response_model != self.config.requested_model:
                raise JevTechnicalFailure(
                    "TypeSafe response model did not match requested model",
                    response_model=response_model if isinstance(response_model, str) else None,
                )
            answer = validate_answer(raw["answers"][route], set(choices))
        except JevTechnicalFailure:
            raise
        except (KeyError, TypeError, ValueError) as exc:
            raise JevTechnicalFailure("TypeSafe returned an invalid shadow response") from exc
        usage = _bounded_usage(raw.get("usage"))
        return ShadowResult(
            status="SHADOW", route=route, requested_model=self.config.requested_model,
            response_model=response_model, schema_version=SCHEMA_VERSION, policy_version=POLICY_VERSION,
            timestamp=datetime.now(timezone.utc).isoformat(), answer=answer, usage=usage,
            latency_ms=round((time.perf_counter() - started) * 1000),
        )


def _bounded_usage(raw: Any) -> dict[str, int | float]:
    if not isinstance(raw, dict):
        return {}
    allowed = {"requests", "input_tokens", "output_tokens", "total_tokens"}
    return {
        key: value for key, value in raw.items()
        if key in allowed and type(value) in (int, float) and 0 <= value <= 100_000_000
    }
