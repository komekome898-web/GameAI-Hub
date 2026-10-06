# Upstream provenance

- Source: https://github.com/nanaism/yomiyasu
- Pinned commit: `9b9a84757ade524ef9d477f75c6ea13190079f97`
- Upstream plugin metadata version: `1.0.8` (`.claude-plugin/plugin.json` at this commit). The full commit, not a moving branch or version label, is the pin.
- Verified annotated tag: `v1.0.8`, tag object `83c8ee1f83e9047861fea4c3c75b35f72d2cabb4`, peeled to the pinned commit.
- Previous pin: `8d5abeebe2dd20c2db005deaddcc50be43c59c0a` (plugin metadata 1.0.4), adopted in [PR #163](https://github.com/komekome898-web/GameAI-Hub/pull/163).
- Reviewed on: 2026-10-06 (UTC).
- Latest release verified: [v1.0.8](https://github.com/nanaism/yomiyasu/releases/tag/v1.0.8), published 2026-10-06 15:55:49 UTC. Observed upstream `main`: `8f77b7aa8f19c3f718b511e71a3eee5d06eb3013`; its three later commits change only `README.md` and a logo. This integration pins the release, not `main`.
- Copyright (c) 2026 nanaism. MIT license retained verbatim in [LICENSE](LICENSE).
- Local `SKILL.md` is an adapted, condensed derivative of the root upstream `SKILL.md` and `references/domains/tech.md`, not an unchanged upstream installation.

## Reviewed source identity

These SHA-256 values identify upstream inputs inspected for this integration; they are not hashes of the adapted local skill.

| Upstream path | SHA-256 |
|---|---|
| `SKILL.md` | `15defbbff83deaa7eb946d993230c0230e576d32ed0b715b0bb9c3bce5b7e4a5` |
| `references/domains/tech.md` | `bfad82a08de02325b1e7339f23aef4ac29892b39babdb74a7ad7c3f1c6a36131` |
| `.claude-plugin/plugin.json` | `eb7ec2602051b359aa2c56b22de14f183ec9bf0544646c54dd6d8afd80322f27` |
| `LICENSE` | `79d802f15bc8caf67f1a83c1bdbe214ccb41a0a0275f9046b329b89c65ee1fca` |

Pinned [skill](https://github.com/nanaism/yomiyasu/blob/9b9a84757ade524ef9d477f75c6ea13190079f97/SKILL.md),
[technical guidance](https://github.com/nanaism/yomiyasu/blob/9b9a84757ade524ef9d477f75c6ea13190079f97/references/domains/tech.md),
[plugin metadata](https://github.com/nanaism/yomiyasu/blob/9b9a84757ade524ef9d477f75c6ea13190079f97/.claude-plugin/plugin.json),
and [license](https://github.com/nanaism/yomiyasu/blob/9b9a84757ade524ef9d477f75c6ea13190079f97/LICENSE).

## Local adaptation

Retain meaning preservation and practical Japanese revision principles. Limit activation to explicitly requested prose and preserve GameAI Hub factual, affiliate, SEO and owner-approval rules. Treat style ratios as optional, preserve important lists/tables, exclude acceptance/audit records, and document manual TSX excerpt review. Remove mandatory lint-on-save/full mode, global installation, plugin activation and any suggestion to disable other skills. Do not import upstream research/benchmark claims as verified evidence about this repository.

Only static instructions and the license are installed. No upstream executable, installer, corpus, image, dependency, workflow, subscription or account integration is added. No upstream Python script was executed. Neither lint nor diff is installed or used by this integration, package scripts or CI. Their results are not acceptance or publication gates. The source hashes above cover the current static inputs, not a complete executable safety review. Selected v1.0.7-to-v1.0.8 source changes were read to identify the optimization and Markdown limits; no execution was necessary. The MIT license is byte-identical to the previous pin and local copy. Unicode modules/data are not incorporated, so the new upstream Unicode notice is not vendored.

## Retained v1.0.4 safeguards and intentional differences

- Adopt conditional sentence splitting: retain purpose, means, reasons, conditions, order, contrast and their scope; keep the original when these relationships would move.
- Adopt information non-addition for lists and objective tool descriptions: do not invent evaluation, obligation, conditions or capability claims.
- Adopt stance-aware endings and preservation of procedural/already consistent endings. Locally, preserve the original stance and strength; do not infer an advice stance merely from missing subjects or normalize every ending. Uncertainty requires keeping the original and asking the author.
- Adopt bold-delimiter repairs only for prose rendered as Markdown, with rendering confirmation. Do not mechanically apply them to TSX/JSX/strong or code, or alter historical evidence.
- Retain explicit requested scope, optional use, facts/uncertainty/lists, audit/comparison exclusions and separate publication/merge authorization. No disabling other skills, mandatory Python lint/diff execution, score gates or enforced numerical style ratios.
- Preserve the historical [two-article comparison](../../../docs/editorial/yomiyasu-pilot.md) verbatim. The separate [update review](../../../docs/codex-progress/yomiyasu-v1.0.4.md) records recheck concerns without revising its evidence or live articles.

## Selected v1.0.8 changes

- Explicitly preserve each claim's actor, action, object, time, modifier/reference target, exceptions, limits and quantities. Check document purpose and heading/lead/list/conclusion correspondence before choosing endings; do not invent missing relationships or select an uncertain reading.
- Distinguish observation time from event time, completed changes from current behavior/policy and future plans. Preserve the original plain/polite style unless requested otherwise.
- Permit a settled technical term for an awkward literal translation only when the supplied context establishes the technical subject and meaning. Preserve actual names, UI/component labels, identifiers, everyday meanings, values and decision conditions; do not infer types or mechanisms.
- Preserve original/requested spacing, readable punctuation and intentional paragraphs. Do not remove/add English/number spacing uniformly, force one sentence per line or add blank lines uniformly. Existing Markdown bold repairs remain conditional on the actual display.
- Separate reader-facing prose from editorial reasons/questions. Keep the source's unknown/investigation status and conditional claims in the body; do not insert editor uncertainty or replace a direct claim with hearsay. Honor body-only output while recording source/scope/preservation internally; publication and merge gates remain intact.
- Refresh the TSX caveat to describe current Markdown-oriented protection rather than retain the old linter's extraction details. No TSX extraction tool is added.

## Performance applicability

The [v1.0.8 release notes](https://github.com/nanaism/yomiyasu/releases/tag/v1.0.8) report internal Python API timings against v1.0.7 (`8dc47e2594dc63f3dc37cd2c36eaf549e54b4678`), not against this integration's v1.0.4 static rules:

| Upstream workload | v1.0.7 total | v1.0.8 total | Reported reduction |
|---|---|---|---|
| diff: seven documents compared with themselves | 8473.40 ms | 73.08 ms | 99.1% |
| diff: 48 original/revised pairs | 184.30 ms | 78.44 ms | 57.4% |
| lint: 160 existing documents | 20.41 ms | 15.42 ms | 24.4% |

Upstream used the same Mac, Python 3.14.5, one warm-up and the median of seven alternating runs, totaling all inputs. The seven self-comparisons cover README plus six guides and differ from the 48 actual revision pairs. The maximum is among five measured diff conditions; CLI startup and LLM generation are excluded. Source inspection found identical/contained-text shortcuts, sentence-match pruning/reuse and reuse of parsed endings in diff; lint also avoids repeated scanning of long inline-code endings. These are upstream measurements and inspected implementation details, not local speed measurements or a guarantee for all inputs.

Since GameAI Hub uses only static advisory instructions, there is no installed lint/diff computation to accelerate. Adding those tools solely for this speed claim is unnecessary. No upstream benchmark or script was run and no local speedup is claimed. See the [v1.0.8 review record](../../../docs/codex-progress/yomiyasu-v1.0.8.md) for scope and validation.

## Updates

Updates are manual, separately reviewed repository changes. Fetch a specific commit, inspect all proposed text and any executable source before running it, retain the MIT notice, and update this pin and source hashes together. Recheck local exceptions and the bounded article comparison; record new findings separately without rewriting historical evidence. Do not track upstream HEAD automatically or run remote installers. No new credential setup or paid service is authorized by this skill.
