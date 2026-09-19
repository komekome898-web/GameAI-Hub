"""Non-authoritative semantic shadow routes."""
from __future__ import annotations

import re
from typing import Any

from .client import JevClient, JevTechnicalFailure, ShadowResult


SEMANTIC_FACTS = {
    "reviewer_routing": {"changed_paths", "change_categories", "risk_flags", "required_reviewers", "issue_labels"},
    "patch_scope": {"task_id", "changed_paths", "change_categories", "declared_scope", "scope_exclusions"},
    "research_source_triage": {"claim_category", "claim_temporality", "candidate_source_types", "requires_primary_source"},
    "citation_candidate": {"claim_category", "source_type", "source_domain", "publication_date", "is_primary"},
}
METADATA_STRING = re.compile(r"^[A-Za-z0-9_./:#@+-]{1,160}$")


def _metadata_value(value: Any) -> bool:
    if isinstance(value, (bool, int)) or value is None:
        return True
    if isinstance(value, str):
        return bool(METADATA_STRING.fullmatch(value))
    if isinstance(value, list):
        return len(value) <= 64 and all(_metadata_value(item) for item in value)
    return False


def _facts(route: str, facts: dict[str, Any]) -> dict[str, Any]:
    """Fail closed: semantic routes accept metadata, never arbitrary content fields."""
    unknown = set(facts) - SEMANTIC_FACTS[route]
    if unknown or not all(_metadata_value(value) for value in facts.values()):
        raise JevTechnicalFailure(f"unsupported or non-metadata {route} facts; shadow request refused")
    return facts


def reviewer_routing(client: JevClient, facts: dict[str, Any]) -> ShadowResult:
    return client.choose(route="reviewer_routing", facts=_facts("reviewer_routing", facts), question="Which single review dimension is most relevant? This is advisory and cannot remove mandatory reviewers.", choices={
        "ENGINEERING": "Correctness, tests, architecture, or security is the clearest concern.",
        "PRODUCT_UX": "User intent, journey, accessibility, or usability is the clearest concern.",
        "TRUST_FACTUALITY": "Privacy, factual claims, affiliate neutrality, or source quality is the clearest concern.",
        "NONE_CLEARLY_APPLIES": "Repository facts do not clearly select one dimension.",
    })


def patch_scope(client: JevClient, facts: dict[str, Any]) -> ShadowResult:
    return client.choose(route="patch_scope", facts=_facts("patch_scope", facts), question="Does the metadata-only patch summary stay within the stated task scope? Advisory only.", choices={
        "IN_SCOPE": "All summarized changes are necessary for the stated task.",
        "POSSIBLE_SCOPE_DRIFT": "At least one summarized change may exceed the stated task.",
        "UNKNOWN": "The bounded facts are insufficient to judge.",
    })


def research_source_triage(client: JevClient, facts: dict[str, Any]) -> ShadowResult:
    return client.choose(route="research_source_triage", facts=_facts("research_source_triage", facts), question="Which source category should be checked first for this narrow claim? Advisory only.", choices={
        "PRIMARY_OFFICIAL": "An official specification, documentation page, repository, or first-party statement.",
        "PRIMARY_DATA": "A primary dataset, measurement, or research paper.",
        "SECONDARY_CONTEXT": "A reputable secondary source is needed for context.",
        "NONE_CLEARLY_APPLIES": "No source category clearly applies to the bounded claim summary.",
    })


def citation_candidate(client: JevClient, facts: dict[str, Any]) -> ShadowResult:
    return client.choose(route="citation_candidate", facts=_facts("citation_candidate", facts), question="Does this candidate's metadata make it suitable for checking the claim category? Advisory only; humans verify the source.", choices={
        "DIRECT_CANDIDATE": "The bounded source metadata appears directly relevant.",
        "NOT_DIRECT": "The bounded metadata does not appear to support the claim directly.",
        "UNKNOWN": "The bounded metadata is insufficient.",
    })
