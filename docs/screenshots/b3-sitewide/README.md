# B3 sitewide review evidence

Early owner-review screenshots are in `review/`: article hub, long Meshy pricing article, and Project form at1440×900 and375×667. `review/manifest.json` records the actual local source, route, viewport and scroll state. These settled captures were manually returned to page top after existing state restoration; they are not physical-device or final-suite evidence.

`independent/interaction/` and `independent/visual/` retain the reviewers' reports, measured data and selected actual screenshots. Their c6 source attribution is preserved. `independent/interaction-2071/` and `independent/visual-2071/` contain the completed scoped follow-up for the375 paper-padding correction. Both follow-ups passed their inspected scope. A subset PASS does not establish exhaustive site, performance, Production or WCAG acceptance.

The generated top-level representative files/manifest come from `e2e/b3-sitewide.spec.ts`; use their recorded SHA rather than assuming all generations target the latest branch. Baseline typography and two baseline desktop images were captured from main `f9333c076c70afbb71399215336a671bb06d5289` before implementation. Historical Issue137/155/157 screenshots are not new sitewide deliverables and will not be overwritten in this PR.

Library saving failed at the upload helper's initial app-discovery network request; no uploads or Library IDs were created. The files remain available locally and in the Draft PR evidence paths. No access restrictions were bypassed.

Physical iPhone/Safari, browser/OS text zoom, soft keyboard, protected Preview and Production are untested. Synthetic root/computed/text-spacing evidence remains explicitly separate.
