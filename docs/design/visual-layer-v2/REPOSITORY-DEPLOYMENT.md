# Visual Layer v2 repository deployment

> **Historical deployment record:** current implementation and acceptance work follows the [active Visual Layer authority](./README.md), reflow contract, implementation plan, and test matrix. The original handoff/assets remain unchanged.

Deployment date: 2026-09-30  
Issue: #155  
Deployment branch: `codex/issue-155-visual-layer-v2-v1`

## Repository baseline

The original handoff package was authored after inspecting main at:

`711dcb5df28db7df0b916589c264a97249a661e6`

The repository deployment branch was created from the newer authoritative main:

`db2dabe5697dc4cc8eadfb80ce206ca5ecfa1d57`

Do not reset or restore the repository to the package-baseline SHA. Current main, including merged PR #154 / the ElevenLabs v4 article, is authoritative.

## What is stored

- Exact text files from the supplied handoff package are preserved under `docs/design/visual-layer-v2/handoff/`.
- Runtime WebP/SVG derivatives needed by the design are also preserved under the handoff assets folder and exposed under `public/visual-v2/`.
- The six supplied layout/material references are stored as documentation-only WebP derivatives under `docs/design/visual-layer-v2/reference/`. They must never be loaded by the application.
- Source-only master PNG files are intentionally not committed in this repository deployment. They are large authoring masters and are not runtime inputs.

The source ZIP and its `SHA256SUMS` were independently checked before repository deployment. The exact package checksum list is retained under the handoff directory even though intentionally omitted source-only PNG/reference originals are not duplicated into Git history.

## Runtime status

This deployment commit does **not** enable Visual Layer v2.

Files under `public/visual-v2/` are inert until a later implementation slice references them. No application component, route, CSS import, business logic, analytics, privacy behavior, affiliate behavior, or Production state is changed by this deployment.

## Next gate

Before V1 implementation:

1. re-fetch and verify current `origin/main`;
2. remap the handoff against changes after package baseline, especially merged PR #154;
3. keep all current article data, order, metadata, links and functionality authoritative;
4. implement V1 only after the remap is reviewed.
