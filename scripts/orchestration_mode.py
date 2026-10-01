"""Repository-reviewed switch; payloads, actors and environment cannot enable it."""
import functools
import json
from pathlib import Path

CONFIG = Path(__file__).resolve().parents[1] / ".github/orchestration/operation-mode.json"


def legacy_automation_enabled():
    """Missing, malformed or unknown configuration is always closed."""
    try:
        def unique_pairs(pairs):
            result = {}
            for key, value in pairs:
                if key in result:
                    raise ValueError("duplicate operation-mode key")
                result[key] = value
            return result
        config = json.loads(CONFIG.read_text(), object_pairs_hook=unique_pairs)
        return config == {"schema": "gameai-operation-mode/v1", "mode": "legacy-automatic"}
    except (OSError, ValueError):
        return False


def legacy_only(function):
    """No state/network side effects while owner-directed, including direct calls."""
    @functools.wraps(function)
    def guarded(*args, **kwargs):
        if not legacy_automation_enabled():
            print(f"SUPPRESSED {function.__module__}.{function.__name__}: legacy automation disabled; owner instruction required")
            return False
        return function(*args, **kwargs)
    return guarded
