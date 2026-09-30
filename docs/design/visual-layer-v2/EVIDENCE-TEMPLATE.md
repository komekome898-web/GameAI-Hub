# Visual Layer reflow evidence template (v2)

Use schema `gameai-reflow-evidence/v2`; do not rewrite historical `gameai-rendered-evidence/v1` manifests or images.

```json
{
  "schema": "gameai-reflow-evidence/v2",
  "target": { "sha": "40-character exact commit", "environment": "local", "baseUrl": "http://127.0.0.1:3100", "worktreeDiffHash": "optional when explicitly captured" },
  "records": [{
    "id": "unique-record", "caseId": "VL-V2-HOME-META", "route": "/", "state": ["validation"],
    "coverage": ["synthetic-computed-text", "factor-200", "viewport-320"],
    "surface": { "selector": ".idea-meta", "matched": 1 },
    "method": "synthetic-computed-text", "evidenceClass": "synthetic", "requestedFactor": 2,
    "achieved": [{ "role": "help", "baselineFontPx": 14, "changedFontPx": 28, "factor": 2 }],
    "browser": { "name": "chromium", "version": "…", "viewport": { "width": 320, "height": 844 }, "dpr": 1 },
    "diagnostics": { "documentOverflowPx": 0, "unownedOverflowingElements": 0, "clippedText": 0, "undersizedTargets": 0, "focusReachable": true, "focusVisible": true, "orderPreserved": true, "associationsPreserved": true },
    "geometry": { "layout": "stacked", "nonoverlapping": true, "contentVisible": true, "ownedScrollers": 0 },
    "screenshot": "relative-file.png",
    "limitations": ["Synthetic computed text; not browser zoom, OS text, or physical device."],
    "reviewerDecision": "PENDING",
    "review": { "kind": "automated", "reviewer": "Playwright contract spec" }
  }]
}
```

For `text-spacing`, add one record per independent override with `spacing: { "override": "line-height|paragraph|letter|word", "language": "ja|en|…", "applicable": true|false }`. Geometry, visibility, owned scrollers, achieved sizes, method class, and reviewer decision are schema-validated; applicable target details and order/association observations accompany the screenshot review. A machine PASS is not a visual acceptance verdict. A missing/zero selector, mismatched SHA, unlabeled method, or planned matrix status blocks final reconciliation.
