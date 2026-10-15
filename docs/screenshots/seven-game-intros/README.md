# Seven actual game introduction pages and cards

Environment: local Next16.3.2 production build, Chromium `/usr/bin/chromium`,2026-10-11. Original asset commit0e138df7dd7f625d45e75f90a2f3b5f4becf214e. All7 routes rendered via normal published selectors, without mocks or preview routes. External requests aborted during game-introduction E2E; no external game state changed.

Evidence: each introduction at1280/375/320px, each introduction at320px with200% CSS zoom, seven active new card faces at375px, expanded8-work list at375px. `checks-*.json` record original natural image dimensions/contain and ordinary viewport overflow. DOM measurements alone are not visual acceptance. CSS zoom/viewport tests are not phone-device gameplay checks.

Independent reviewer `/root/draft_review` inspected all7 actual375px article screenshots, Create desktop1280, Aura320, Sumaraku320zoom200, all7 active card screenshots and expanded375 list. No P0/P1/high-impact P2 findings. Reviewed full original image compositions, readable copy, visible intro/play actions, author/testing attribution and payments uncertainty. Independent review does not authorize merge/deploy.

Verification: five new E2E scenarios cover all7 routes/images/canonicals/OG dimensions, eight listing cards, sitemap, and320 CSS zoom. Existing games, category entry and shared ring regression suite initially passed33/36; three outdated fixture expectations were fixed (one-work forced list and unscoped selectors) and affected4 cases reran successfully. Updated cards screenshot assertion reran successfully. No unresolved browser failures.

Only local website and its link/metadata behavior were tested. Smartphone physical-device gameplay/full-game runtime remains untested; source statements are author-provided, with parent initial-UI records separately attributed.
