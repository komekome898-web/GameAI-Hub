#!/usr/bin/env python3
"""Repository-dispatch ingress wrapper with GitHub client_payload size compatibility."""
from orchestration_mode import legacy_only
import json
import os

import orchestration_github as adapter
from orchestration import Rejected


@legacy_only
def main():
    raw = os.environ.get("ORCH_PAYLOAD", "{}")
    outer = adapter.strict_json(raw)
    if "contract" in outer:
        if set(outer) != {"contract"} or not isinstance(outer["contract"], dict):
            raise Rejected("wrapped dispatch payload must contain exactly one contract object")
        os.environ["ORCH_PAYLOAD"] = json.dumps(outer["contract"], separators=(",", ":"))
    adapter.ingest()


if __name__ == "__main__":
    main()
