# 荒野モン動の制作体験談 — 原本画像込み完成候補

- Launch: saved execution environment via delegation from thread `01a0f210-6698-766f-b8b3-d686388b203d`; no GitHub mention dispatch.
- Origin: `https://github.com/komekome898-web/GameAI-Hub.git` (verified and fetched).
- Base / earliest remotely verified bootstrap: `a2c5a5695559520b82bb8c7db438d736538024c0`.
- Branch: `feat/aramon-production-story-20261004`.
- Draft PR: https://github.com/komekome898-web/GameAI-Hub/pull/168 (do not merge).
- Route: `/articles/aramon-production-story/`.
- Manuscript: Library `libfile_639882f2e7448191a128f870899f3794`, version 3, all 4 pages / 75 lines read and independently compared. Page headers removed and extraction line wraps joined; approved meaning, experience, Claude Pro and model names preserved. No v2 usage or private rights remarks.
- Author: おりょう / X @oryoooo_game, including Person schema. Existing articles retain their prior Organization author schema.
- Registry: published practice 「制作の体験談と学び」, purpose order 6, automatic Home/articles grouping and sitemap inclusion. games remains empty/preparation-only. Canonical/OG/author metadata and related/Project continuation links use existing systems. Draft noindex override is inactive for the now-published record.
- Publishing status here describes the PR candidate; main/Production has not been changed. PR remains draft, no merge or Production operations.

## Exact approved image originals

Initial Library prepare/helper transfers (including the single retry) failed. No further Library image transfer retries were made. Parent transferred only the exact three original files to `assets/aramon-approved-photos-20261004`, asset commit `3f86120942a37336bc70cb8aa26aab3b683a7ee2`; cherry-picked locally as `e3ee923bd88bec1e4e0d3bbd3957c30c5070d63e`.

| Original Library ID | Repository path | SHA256 |
| --- | --- | --- |
| `libfile_bc6b756de5a48191b198751a2f155ee7` | `public/images/articles/aramon-production-story/team-flame-barrage.png` | `627ea7d068c4974a63047b24f0846fd9c4eb78a47d8d5425572f39884f2eb399` |
| `libfile_ff120f455cbc81919c0b929d4febc86d` | `public/images/articles/aramon-production-story/training-demon-flame.png` | `d70674c12b22cbe75a5112311c299686eb48c34e4c54251dc83c8646483bb63c` |
| `libfile_1fe48c7ea2348191b5c6e38c462d717f` | `public/images/articles/aramon-production-story/mastermon-training.jpg` | `aead7325253f3afa488073ffa398e9e72a86890fdbe21d5ca90c385da06a127a` |

PASS: files exist/readable in this environment; parent SHA256 values match; Pillow dimensions all 667×375; actual pixels opened with view_image by implementer and independent reviewer. TEAM 火炎連砲, real 3D training 魔神炎 (target/damage visible), mastermon 猛勉強 selection-only correspond to body, alt and captions. These are editorial play captures on 2026-10-04, not historical development photos. No replacements, transformations or cropping of originals.

## Verification and limitations

- PASS: initial targeted 4 files / 15 tests; completed asset-hash article tests 5/5. Existing engine/reading-system/category tests also pass.
- PASS: changed-scope ESLint, typecheck, validate:content (17 records), check:sitemap (65 URLs), diff --check.
- Local `npm run quality`: application gates PASS, 45 test files / 354 tests PASS, data/affiliate/sitemap/content checks PASS, orchestration Python 76 tests PASS; final validate:workflows BLOCKED by missing Ruby executable (`FileNotFoundError: 'ruby'`). No repository validator weakening. Complete quality is also required and checked through final-head GitHub CI, whose outcome belongs in the final handoff/PR.
- PASS: `npm run build`.
- PASS: new real Chromium E2E 4/4: 375×812, desktop1280×900, 320×640, 320×640 with synthetic root-font 200%. Three images load, aspect ratio holds, Japanese text/context/captions present, canonical/noindex state correct, game/author URLs correct, Project CTA navigates, articles all-list and breadcrumb roundtrip work, games stays inactive, pageerror list empty.
- PASS: relevant category-entry + dots-followup E2E 14/14, including public list counts, no-JavaScript links, category/back/history and enlarged copy. Unrelated regenerated existing screenshots were restored/excluded; only this article's evidence is submitted.
- PASS: agent-browser verified real built server using installed Chromium; interactive snapshot and screenshot saved. No dev server used. Playwright managed-browser download was unavailable (domain forbidden), so installed Chromium was used rather than bypassing network restrictions.
- Evidence: `docs/screenshots/aramon-production-story/`: full-page 4-condition images, metrics JSON, agent-browser screenshot and independent first-view/CTA shots.
- Independent reviewer: `/root/aramon_draft_review`. v3 source comparison, all image pixels, full screenshots and real Chromium 320/root200 first-view/CTA inspection found no article P0/P1/P2. Requested exclusion of unrelated generated screenshots was performed. Recheck final committed SHA before handoff.
- UNTESTED: physical iPhone/Android, touch/OS text enlargement. Synthetic root-font 200% is not physical-device or OS-zoom acceptance.
- CI at commit: final push will trigger quality/build, E2E and Preview. Final-head outcomes are recorded in PR/final evidence rather than pushing another status-only commit.

## Handoff

Remain draft and await owner review/merge decision. No main writes, auto-merge, Production access or other article edits. Initial failure Library record: `libfile_2cd1214ae30481918d274e00d90d63ef`; image-wait evidence: `libfile_3bcfa44a19a081919601d9f206a4e27a`. Final evidence is saved separately after CI resolution.
