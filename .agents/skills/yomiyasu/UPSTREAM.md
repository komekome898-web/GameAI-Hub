# Upstream provenance — v2.0.0

- Official release: https://github.com/nanaism/yomiyasu/releases/tag/v2.0.0
- Annotated tag object: `a191c3d5edf9d5a8b86e0c755fae7cadcd68f58f`.
- Pinned commit: `b8ddf6e5c044d7a3e24ae5db64852465e7bd6cd3` (not moving main).
- Reviewed: 2026-10-16 UTC. Previous pin: `9b9a84757ade524ef9d477f75c6ea13190079f97` / v1.0.8.
- Copyright (c) 2026 nanaism; MIT LICENSE retained verbatim. Unicode notice retained verbatim in UNICODE-LICENSE.txt.

## Adaptation and safety review

Local SKILL.md adapts the upstream skill to explicit requested prose, factual/affiliate/SEO protections, historical-record exclusions, and owner approval for merge. Explicit site-wide requests are supported. No hooks, installer, account configuration, external service, model, dependency, CI/publication gate or automatic rewrite is added. Upstream benchmark/marketing claims are not local evidence. Full upstream references are retained as supporting guidance; local meaning and scope rules take precedence over stylistic ratios or fact completion.

Independent read-only source review inspected the four scripts: standard-library only, no network or model calls. lint/diff read inputs and write stdout; check run launches neighboring same-version lint/diff with argv subprocesses (no shell), writes snapshots/reports/indices/locks under explicit state directory. Plain verify reads and compares final/tool hashes. Optional start/export/end and hooks are not used. Records prove execution and hash correspondence, not readability, meaning preservation, approval or tamper resistance.

TSX is not passed directly to Markdown lint. The repository inventory extracts conservative AST candidates with source positions, including labels/metadata/alt/templates/data and internal strings/quotes. Human review must resolve runtime composition/visibility; English-only UI is reviewed in source. Re-extract final source and compare bytes with checked manuscript. Do not interpret corpus counts as visible-text coverage or quality scores.

The local integration now runs original lint then final check run (lint/diff) and verify. Original/final inventories and compact executed-check evidence are kept under docs/editorial/yomiyasu-v2. Full transient state can be reproduced with the documented commands. Historical pilot/progress records remain unchanged.

## Byte-identical upstream files

| Path | SHA-256 |
|---|---|
| `LICENSE` | `79d802f15bc8caf67f1a83c1bdbe214ccb41a0a0275f9046b329b89c65ee1fca` |
| `UNICODE-LICENSE.txt` | `e7a93b009565cfce55919a381437ac4db883e9da2126fa28b91d12732bc53d96` |
| `scripts/markdown_visibility.py` | `3fb581980c3e4ee8a30dd9bbdc25a120de6f9e77c25bdf39b8d4718b0461bf8b` |
| `scripts/yomiyasu_check.py` | `844ba9abf031e01c130c99cf4faf8fb0090eb99f036ce5da7d8be1557b781f8c` |
| `scripts/yomiyasu_diff.py` | `c09399b0bece3f36a8f41d06a7bb3f2f542efe4913e29f0e6a12a23b239d9a78` |
| `scripts/yomiyasu_lint.py` | `9c657b9d0c5657271bb8cc4658814ba04175531f9907053911438c4dd6390161` |
| `references/audience.md` | `406938162e6238dc08dc46fcd2160ea6a2731fdb60478429903b15577bd4dbf8` |
| `references/doc-types/article.md` | `e5009c496b4b4ac8974c16f2f15b0f8ce93620863dfe721803b01138db845716` |
| `references/doc-types/essay.md` | `0f937b0dc89094813f83cdc51bc89c1eb3c9dc99a6ab08302941825ac1f54646` |
| `references/doc-types/formal.md` | `61afdef04d810aee80d173daf675f8a75c9cde82db09fb0ed8fcedd1b362afad` |
| `references/doc-types/incident.md` | `d25282690b220e5d4fa2595228d282d65f7b03d8d4b325c30bf251b58a474b77` |
| `references/doc-types/mail.md` | `43c84865368c6e1e61c0ac1645583933092ddcaabb49b6ed4b6c4621e9ba2d4f` |
| `references/doc-types/manual.md` | `37971c4b7cf8159656a2435b30444a05692fbdffdd7dc3dd8e8f4ada90e8ef8f` |
| `references/doc-types/minutes.md` | `7869c10e72e0e4ce6ecb94833e84452beba7f8b676230908fe623deddc49b140` |
| `references/doc-types/paper.md` | `ed2957332ef12464d4bc43bc22ca2250229eca57f39b11597d2632fab020f12c` |
| `references/doc-types/pr.md` | `d7bb8a4ac7f5344abf66bb7dfe893480c67ea8d635078c5a8d2582264a21506b` |
| `references/doc-types/promo.md` | `f25c7b387077cc354a97ecd94580ce550a94cec34f28e2c11ed86dfaa71112bb` |
| `references/doc-types/proposal.md` | `2a8d8a557b33f2df51aedeed02ba5bb8ed623fcde55f6a42ff4b477920853731` |
| `references/doc-types/slides.md` | `6443d9b6e6d1782795b37a2e6edae65a439b0f23534aed885373a308262762fc` |
| `references/domains/business.md` | `7d5be30f2bac61b7f47849193f02eaecebd8b27ef5f00e75af12144c9ab061ea` |
| `references/domains/essay.md` | `aeeeb9f9c842d68fa0fcf2e956bd2f87c5f450bc820df931f3f94b903a8a8c7a` |
| `references/domains/tech.md` | `255b1bcbf42a0c7ea7f42c7293cd964e541d70f6f5079ebcbffc332ce6b7b0dd` |
| `references/fact-recovery-details.md` | `d845b843578c9f7cb452b7a776adf8b0c162d6a46078271c9cfc6c2311a3875d` |
| `references/fact-recovery.md` | `431eca7304c970570a1d04e81ad27f836dedf7b43cd876a9bb20e6ba7048bef8` |
| `references/gemini-syntax.md` | `156c2c97481b386c0674161f84ea5931dc79c84751f3b86539116d215f407143` |
| `references/lists/fact-gaps.txt` | `9511f320413e9b9cb970e32b19d238954e20387d8958c3a98a28608a065bfb86` |
| `references/lists/feelings.txt` | `5f71a66f5e2679de04ecd30395ab74ca61962297c22ef3f4efa5c8e625446166` |
| `references/lists/hedges.txt` | `ed666036f63f4705d2c129d3fd30e971018d50732bbef2c18081412a61ccd771` |
| `references/lists/intensifiers.txt` | `3e4829226d871ce10e4ae89c49ae218b6d9ed77cafcd6ddfd0fdb6cecd1fec2e` |
| `references/lists/nominalization.txt` | `2f685bbcd7dfc5ea871ff5655368195d471cea6ac4ff57e75a0648aadd466048` |
| `references/persona.md` | `3c1517aac4227411cabd7c462dc5fe833bb8015bd83c842c5b5fe14d566bbdf2` |
| `references/rephrase-test.md` | `6b6b857c0f09f94e07d5406890e10c270dd64cb3232dc3983b975c204b5ad8bf` |
| `references/review-points.md` | `4d0163afa982b877de01e366361a93cc60761f0a9fe11ff99d9b432e5634c7a2` |
| `references/slop-catalog.md` | `94a30e54fe272180e9483d9602e12039d457d17f0c6d930747c7357974641d57` |

Updates require a new explicit fixed pin, executable review, license check and hashes. Do not run remote installers or silently track main.
