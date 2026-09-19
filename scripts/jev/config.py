"""Environment configuration for the shared TypeSafe/Jev client."""
from __future__ import annotations

from dataclasses import dataclass
import os


@dataclass(frozen=True)
class JevConfig:
    api_key: str
    requested_model: str = "jev-latest"
    endpoint: str = "https://api.typesafe.ai/v1/systemone"
    timeout_seconds: float = 25.0

    @classmethod
    def from_env(cls) -> "JevConfig":
        key = os.environ.get("TYPESAFE_API_KEY", "")
        if not key:
            raise ValueError("TYPESAFE_API_KEY is not configured")
        return cls(api_key=key, requested_model=os.environ.get("TYPESAFE_MODEL", "jev-latest"))

