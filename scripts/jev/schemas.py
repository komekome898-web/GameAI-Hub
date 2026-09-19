"""Bounded request and response validation for SystemOne choices."""
from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Any

SCHEMA_VERSION = "gameai-jev-shadow/v1"
POLICY_VERSION = "gameai-jev-policy/v1"
MAX_CHOICES = 32
MAX_STATE_BYTES = 24_000


@dataclass(frozen=True)
class ChoiceAnswer:
    choice: str
    probabilities: dict[str, float]
    confidence: float


def validate_choices(choices: dict[str, str]) -> None:
    if not choices or len(choices) > MAX_CHOICES:
        raise ValueError("choice set must contain 1-32 entries")
    if any(not isinstance(k, str) or not k or len(k) > 80 for k in choices):
        raise ValueError("invalid choice id")
    if any(not isinstance(v, str) or not v or len(v) > 500 for v in choices.values()):
        raise ValueError("invalid choice criterion")


def validate_answer(raw: Any, expected: set[str]) -> ChoiceAnswer:
    if not isinstance(raw, dict) or set(raw) < {"choice", "probabilities", "confidence"}:
        raise ValueError("malformed Jev answer")
    probabilities = raw["probabilities"]
    if raw["choice"] not in expected or not isinstance(probabilities, dict) or set(probabilities) != expected:
        raise ValueError("Jev answer choices do not match request")
    numbers = [*probabilities.values(), raw["confidence"]]
    if any(type(n) not in (int, float) or not math.isfinite(n) or not 0 <= n <= 1 for n in numbers):
        raise ValueError("invalid Jev probabilities or confidence")
    if abs(sum(probabilities.values()) - 1.0) >= 0.02:
        raise ValueError("Jev probabilities do not sum to one")
    if probabilities[raw["choice"]] < max(probabilities.values()) - 1e-6:
        raise ValueError("Jev choice is not the highest-probability option")
    return ChoiceAnswer(raw["choice"], {k: float(v) for k, v in probabilities.items()}, float(raw["confidence"]))

