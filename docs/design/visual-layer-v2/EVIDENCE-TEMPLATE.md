# Visual Layer reflow evidence template (v2)

Use schema `gameai-reflow-evidence/v2`; do not rewrite historical `gameai-rendered-evidence/v1` manifests or images.

```json
{
  "schema": "gameai-reflow-evidence/v2",
  "target": { "sha": "40-character exact commit", "environment": "local", "baseUrl": "http://127.0.0.1:3100", "worktreeDiffHash": "optional when explicitly captured" },
  "records": [{
    "id": "unique-record", "caseId": "VL-V2-HOME-META", "variantId": "validation", "route": "/", "state": ["validation"],
    "coverage": ["synthetic-computed-text", "factor-200", "viewport-320"],
    "surface": { "kind": "dom", "selector": ".idea-meta", "matched": 1 },
    "method": "synthetic-computed-text", "evidenceClass": "synthetic", "requestedFactor": 2,
    "achieved": [{ "role": "help", "baselineFontPx": 14, "changedFontPx": 28, "factor": 2, "baselineLineHeightPx": 21, "changedLineHeightPx": 42 }],
    "browser": { "name": "chromium", "version": "…", "viewport": { "width": 320, "height": 844 }, "dpr": 1 },
    "diagnostics": { "documentOverflowPx": 0, "unownedOverflowingElements": 0, "clippedText": 0, "undersizedTargets": 0, "focusApplicable": true, "focusReachable": true, "focusVisible": true, "orderPreserved": true, "associationsPreserved": true },
    "geometry": { "layout": "stacked", "nonoverlapping": true, "contentVisible": true, "ownedScrollers": 0 },
    "screenshot": "relative-file.png",
    "limitations": ["Synthetic computed text; not browser zoom, OS text, or physical device."],
    "reviewerDecision": "PENDING",
    "review": { "kind": "automated", "reviewer": "Playwright contract spec" },
    "capturedAt": "ISO-8601 timestamp"
  }]
}
```

For `text-spacing`, add one record per independent override with `spacing: { "override": "line-height|paragraph|letter|word", "language": "ja|en|…", "applicable": true|false }`. Static records instead use `{ "kind": "static", "artifact": "declared-id" }` and cannot satisfy DOM requirements. Geometry, visibility, owned scrollers, achieved font size and line-height, method class, route/state variant, and reviewer decision are schema-validated. A machine PASS is not a visual acceptance verdict. A missing/zero selector, mismatched route/surface/variant/SHA, unlabeled method, unachieved requested scale, or planned matrix status blocks final reconciliation. `cdp-pinch` and viewport records never satisfy `factor-*` text enlargement.
