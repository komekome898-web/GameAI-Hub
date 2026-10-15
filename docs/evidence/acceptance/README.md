# Rendered acceptance evidence

`rendered-evidence-manifest.schema.json` is the durable `gameai-rendered-evidence/v1` contract. A run records the exact target SHA/environment, route, viewport, browser zoom/emulation, physical-device status, screenshot path, width diagnostics, and provenance. A viewport-emulated capture must set `emulation.viewport: true` and `physicalDevice: false`; it is never physical-device evidence.

The Playwright helpers under `e2e/acceptance/` create run-local screenshots and manifests in `test-results/`. Evidence promoted into this directory must include its manifest and referenced images. Free-form user ideas, source code, runtime errors, URLs containing secrets, tokens, or collector payloads do not belong in a manifest. Only the bounded fields in the schema are allowed.

Width diagnostics report three separate facts:

1. document-level overflow in pixels;
2. explicitly owned local scrollers for tables/code (`data-acceptance-scroll-owner="true"` or supported table/code containers);
3. visible overflowing elements without such an owner.

These diagnostics locate defects; they do not replace rendered visual review, keyboard checks, or product-flow acceptance.
