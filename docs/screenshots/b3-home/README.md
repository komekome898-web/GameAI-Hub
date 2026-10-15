# B3 Home acceptance

The owner adopted B3 and authorized repository implementation, a draft PR and merge only after required acceptance. Base main: `96da279c5db51b4c217e509d900b8efa87a05070`. Source mock/B2 and other worktrees remain unchanged.

Home puts approved full artwork, credits and Play/introduction first. The existing category/article deck, search, Project form, real game records, original image bytes, play analytics, analytics exclusion, metadata/verification/canonicals/sitemap and article routes are retained. Existing motion owns gestures/rapid inputs; the new `instant` option and `reveal` API preserve existing defaults. No new dependency/WebGL/constant animation.

Primary screens: `home-1440.png`, `home-375.png`, `home-320.png`, with corresponding `-full.png`. `work-*-375.png` covers all8 works. `runtime-source.json` binds final source hashes and build. Independent reports: `visual-review.md` and `interaction-review.md`; their linked observations/screens distinguish before-fix findings and final rechecks.

Final full-page foreground/contrast corrections are independently verified (269 visible-node observations across14views,0fails; sampling is not blanket certification). Terminal whitespace is normalized in committed logs; original raw logs remain local.

Final local quality:49 files/384 tests plus all repository validators passed. Build passed. All9 final B3 E2E cases passed. Earlier 117/affected60 suites and corrected test waits are explained in the progress ledger; the final anchor waits for observable settled geometry rather than assuming450ms covers a long smooth scroll. Existing categories/article/motion/inertia/SEO/return were exercised. Final parent/CI/Preview checks remain merge gates.

Methods: system Chromium/Playwright viewport1440×900,375×667,320×667; synthetic root text150/200%, independent text spacing; CDP touch emulation; keyboard; reduced motion; no-JS; offline source/asset integrity. Real iPhone/Safari/OS zoom/touch/GPU/power are UNTESTED. This is not a blanket accessibility or performance certification.

No production merge/deploy/browser proof is claimed here. Existing Vercel API scope returned403 for deployment listing/404 for known deployment, and the environment has no existing CLI/OIDC credentials. No authentication or protection change was attempted. Preview/Production status must be obtained from actual final-head deployment evidence.
