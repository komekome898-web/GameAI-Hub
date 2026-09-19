from __future__ import annotations

import json
import io
import os
import tempfile
import unittest
from unittest import mock

from scripts.gameai_jev import run_command
from scripts.jev.browser.policy import BrowserShadowPolicy, ObservedAction, browser_preflight
from scripts.jev.client import JevClient, JevTechnicalFailure
from scripts.jev.config import JevConfig
from scripts.jev.policy import citation_candidate, patch_scope, research_source_triage, reviewer_routing
from scripts.jev.redact import REDACTED, UnsafeState, assert_clean, redact
from scripts.jev.schemas import validate_answer


def response(route, choices, *, selected=None, model="jev-test"):
    selected = selected or next(iter(choices))
    rest = (1 - 0.7) / max(1, len(choices) - 1)
    probabilities = {choice: (0.7 if choice == selected else rest) for choice in choices}
    if len(choices) == 1:
        probabilities[selected] = 1.0
    return {"model": model, "answers": {route: {
        "choice": selected, "probabilities": probabilities, "confidence": 0.8,
    }}, "usage": {"requests": 1}}


class FakeTransport:
    def __init__(self, selected=None, model="jev-test"):
        self.selected = selected
        self.model = model
        self.bodies = []

    def __call__(self, url, headers, body, timeout):
        parsed = json.loads(body)
        self.bodies.append(parsed)
        route, question = next(iter(parsed["questions"].items()))
        return response(route, question["criteria"], selected=self.selected, model=self.model)


class JevTests(unittest.TestCase):
    def client(self, selected=None, model="jev-test"):
        transport = FakeTransport(selected, model)
        return JevClient(JevConfig("super-secret-key", "jev-test"), transport=transport), transport

    def test_redacts_sensitive_fields_and_inline_credentials(self):
        clean = redact({"api_key": "secret", "summary": "Authorization: Bearer abc.def", "ok": True})
        self.assertEqual(clean["api_key"], REDACTED)
        self.assertNotIn("abc.def", json.dumps(clean))
        assert_clean(clean, known_secrets=("secret", "abc.def"))

    def test_assert_clean_rejects_known_secret(self):
        with self.assertRaises(UnsafeState):
            assert_clean({"safe": "secret-value"}, known_secrets=("secret-value",))

    def test_probability_schema_rejects_malformed_values(self):
        with self.assertRaises(ValueError):
            validate_answer({"choice": "A", "probabilities": {"A": 1.2}, "confidence": 0.5}, {"A"})
        with self.assertRaises(ValueError):
            validate_answer({"choice": "A", "probabilities": {"A": .2, "B": .8}, "confidence": .5}, {"A", "B"})

    def test_model_mismatch_is_invalid_shadow_result(self):
        client, _ = self.client(model="unexpected")
        with self.assertRaises(JevTechnicalFailure) as raised:
            patch_scope(client, {"changed_paths": ["safe.txt"]})
        self.assertEqual(raised.exception.response_model, "unexpected")

    def test_missing_key_is_offline_failure_without_value(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            with self.assertRaisesRegex(ValueError, "not configured"):
                JevConfig.from_env()

    def test_live_configuration_requires_pinned_model(self):
        with mock.patch.dict(os.environ, {"TYPESAFE_API_KEY": "secret"}, clear=True):
            with self.assertRaisesRegex(ValueError, "pinned model"):
                JevConfig.from_env()
        with mock.patch.dict(os.environ, {"TYPESAFE_API_KEY": "secret", "TYPESAFE_MODEL": "jev-latest"}, clear=True):
            with self.assertRaisesRegex(ValueError, "not allowed"):
                JevConfig.from_env()
        with mock.patch.dict(os.environ, {"TYPESAFE_API_KEY": "secret", "TYPESAFE_MODEL": "jev-1.13.0"}, clear=True):
            self.assertEqual(JevConfig.from_env().requested_model, "jev-1.13.0")

    def test_semantic_routes_remain_shadow_and_non_authoritative(self):
        fixtures = ((reviewer_routing, {"change_categories": ["tests"]}), (patch_scope, {"changed_paths": ["safe.txt"]}), (research_source_triage, {"claim_category": "technical"}), (citation_candidate, {"claim_category": "technical", "source_type": "official_docs"}))
        for route, facts in fixtures:
            client, _ = self.client()
            result = route(client, facts)
            self.assertEqual(result.status, "SHADOW")
            self.assertFalse(result.authoritative)
            self.assertEqual(result.requested_model, result.response_model)

    def test_request_is_redacted_before_transport(self):
        client, transport = self.client()
        client.choose(route="test", facts={"raw_code": "private", "summary": "Authorization: Bearer private"},
            question="Synthetic test?", choices={"YES": "Yes"})
        encoded = json.dumps(transport.bodies)
        self.assertNotIn("private", encoded)
        self.assertIn(REDACTED, encoded)

    def test_browser_uses_only_observed_target_and_is_non_authoritative(self):
        client, _ = self.client(selected="click-project")
        policy = BrowserShadowPolicy(client)
        action = ObservedAction("click-project", "CLICK", "node-7", "Open Project", "SAFE_NAVIGATION", True)
        decision = policy.choose(journey_id="home_to_project", observation_id="obs-1", page_facts={"route_id": "home"}, actions=[action])
        self.assertEqual(decision.action, action)
        self.assertFalse(decision.authoritative)
        self.assertTrue(decision.requires_fresh_observation)

    def test_browser_rejects_duplicate_observed_ids(self):
        client, _ = self.client()
        actions = [ObservedAction("same", "WAIT", None, "One", public_label=True), ObservedAction("same", "DONE", None, "Two", public_label=True)]
        with self.assertRaisesRegex(JevTechnicalFailure, "unique"):
            BrowserShadowPolicy(client).choose(journey_id="recovery_flow", observation_id="obs", page_facts={}, actions=actions)

    def test_no_arbitrary_executable_model_output(self):
        client, transport = self.client()
        def invented(url, headers, body, timeout):
            parsed = json.loads(body); route, question = next(iter(parsed["questions"].items()))
            return response(route, question["criteria"], selected="javascript:alert(1)")
        client.transport = invented
        policy = BrowserShadowPolicy(client)
        with self.assertRaises(JevTechnicalFailure):
            policy.choose(journey_id="recovery_flow", observation_id="obs", page_facts={}, actions=[ObservedAction("wait", "WAIT", None, "Wait", public_label=True)])

    def test_no_blind_mutation_retry(self):
        client, _ = self.client(selected="click")
        policy = BrowserShadowPolicy(client)
        actions = [ObservedAction("click", "CLICK", "node", "Click", "LOCAL_REVERSIBLE", True)]
        policy.choose(journey_id="recovery_flow", observation_id="same", page_facts={}, actions=actions)
        with self.assertRaisesRegex(JevTechnicalFailure, "blind mutation retry"):
            policy.choose(journey_id="recovery_flow", observation_id="same", page_facts={}, actions=actions)

    def test_done_requires_independent_verifier(self):
        client, _ = self.client(selected="done")
        decision = BrowserShadowPolicy(client).choose(
            journey_id="recovery_flow", observation_id="obs", page_facts={},
            actions=[ObservedAction("done", "DONE", None, "Goal appears complete", public_label=True)])
        self.assertTrue(decision.requires_independent_verifier)
        self.assertFalse(BrowserShadowPolicy.verified_done(decision, lambda: False))
        self.assertTrue(BrowserShadowPolicy.verified_done(decision, lambda: True))

    def test_semantic_routes_reject_raw_or_unknown_content_fields(self):
        client, _ = self.client()
        with self.assertRaises(JevTechnicalFailure):
            patch_scope(client, {"content": "a raw private game idea"})

    def test_browser_rejects_unsafe_actions_and_unregistered_journeys(self):
        with self.assertRaisesRegex(ValueError, "unsafe"):
            ObservedAction("buy", "CLICK", "node", "Buy", "PURCHASE", True)
        client, _ = self.client()
        with self.assertRaisesRegex(JevTechnicalFailure, "registered"):
            BrowserShadowPolicy(client).choose(
                journey_id="purchase", observation_id="obs", page_facts={},
                actions=[ObservedAction("wait", "WAIT", None, "Wait", public_label=True)],
            )

    def test_browser_preflight_is_bounded_dry_run(self):
        result = browser_preflight({
            "journey_id": "recovery_flow", "observation_id": "obs-1",
            "page_facts": {"route_id": "project"},
            "observed_actions": [{"action_id": "wait", "operation": "WAIT", "label": "Wait", "public_label": True}],
        })
        self.assertEqual(result["eligible_action_ids"], ["wait"])
        self.assertTrue(result["dry_run"])
        self.assertFalse(result["authoritative"])

    def test_browser_preflight_rejects_raw_content(self):
        with self.assertRaisesRegex(JevTechnicalFailure, "metadata-only"):
            browser_preflight({
                "journey_id": "recovery_flow", "observation_id": "obs-1",
                "page_facts": {"content": "private"},
                "observed_actions": [{"action_id": "wait", "operation": "WAIT", "label": "Wait", "public_label": True}],
            })

    def test_browser_preflight_cli_returns_non_authoritative_output(self):
        payload = {"journey_id": "recovery_flow", "observation_id": "obs-1", "page_facts": {},
            "observed_actions": [{"action_id": "done", "operation": "DONE", "label": "Done", "public_label": True}]}
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8") as handle:
            json.dump(payload, handle); handle.flush()
            with mock.patch("sys.stdout", new_callable=io.StringIO) as output:
                self.assertEqual(run_command("browser-preflight", handle.name), 0)
        self.assertFalse(json.loads(output.getvalue())["authoritative"])

    def test_cli_rejects_unbounded_input(self):
        with tempfile.NamedTemporaryFile(mode="wb") as handle:
            handle.write(b"{" + b"x" * 24_001); handle.flush()
            with mock.patch("sys.stdout", new_callable=io.StringIO) as output:
                self.assertEqual(run_command("browser-preflight", handle.name), 1)
        self.assertFalse(json.loads(output.getvalue())["authoritative"])


if __name__ == "__main__":
    unittest.main()
