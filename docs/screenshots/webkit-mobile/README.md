# Mobile navigation regression evidence

Task: WebKit mobile regression coverage, 2026-10-15.
Base/runtime source: `c7013491dc46f2a316bb4a79094a21f3802041f0` (PR185).
Launch: saved execution environment via delegated request; source conversation
`01a13a49-3ec6-705f-ba25-a358fd8ac007`. No GitHub mention was sent.

## CI follow-up (source head b947b637d58c657d1237ffc726ae37b16b209751)

The dedicated `mobile-webkit` job completed **success** on the official GitHub
runner, including installation, `npm run test:e2e:webkit` and artifact upload:
https://github.com/komekome898-web/GameAI-Hub/actions/runs/38693373884/job/116284203369
The quality run `38693373899` also succeeded at that head. This resolves the
engine-execution gap for that source head; it does not resolve local downloads.

Artifact `11953720267`, `webkit-mobile-evidence`, was uploaded (29,993,498 bytes).
Normal `gh run download` failed with HTTP 403 Forbidden from the signed GitHub
artifact distribution host `productionresultssa6.blob.core.windows.net`.
No restriction bypass or alternate distribution route was attempted. Its images
were **not retrieved or visually approved**. Existing Chromium full E2E remained
in progress at this checkpoint. No raw WebKit job text was retrieved while the
overall run was still active; the job/step conclusions above are API evidence.

Independent source reviewer `/root/mobile_review` checked that exact head and
found no confirmed source P0/P1 and no UI/article/registry edits. Independent
WebKit image review is **BLOCKED**, not PASS. It identified the missing article
detail screenshot; this follow-up adds it to subsequent executions. Remaining
limits: RAF is a motion-state proxy, return position is semantic rather than an
identical pixel offset, each game uses one alternating return method per run,
desktop/200% and physical devices remain untested. The final follow-up head must
receive its own CI result; the result above must not be relabelled as that head.

The follow-up also compares overflow against the root client width (rather than
`innerWidth`, which can expand with overflowing mobile content) and adds two
synthetic 200% root-text header cases, bringing the suite to **12 cases**. The
header cases cover Home and an existing article, visible 44px actions, an unbroken
mobile CTA, document overflow, opening the menu and returning focus. Root-text
stress is explicitly distinguished from CSS zoom and physical accessibility zoom.

The separately reported shared-header issue was investigated on main in local
Chromium. At 320x667 with root font-size 200%, the header was about 155px high
and both actions were visible. With CSS `zoom:2`, it was about 325px high and
used three rows. Independent reviewer `/root/mobile_review` inspected both Home
and article screenshots in both methods: no confirmed overlap, hidden CTA or
operation failure; the CSS-zoom vertical footprint is a P2 candidate, awaiting
the original report's exact reproduction evidence. No speculative UI fix was made.

## Local status and actual methods (before CI)

- **WebKit: BLOCKED before browser launch, not PASS.** Playwright 1.62.1 needs
  `webkit-2336`. `npx playwright install webkit` failed with HTTP 403
  `Domain forbidden` from both `cdn.playwright.dev` and
  `playwright.download.prss.microsoft.com`, including the permitted escalation
  retry. This was a download/network rejection, not an automatic approval-review
  denial. The writable cache workaround (`PLAYWRIGHT_BROWSERS_PATH=/tmp/gameai-playwright`)
  resolved the initial read-only home-cache error but could not resolve the 403.
- The real `npm run test:e2e:webkit` invocation ran the production build/server
  and enumerated 10 cases; all 10 failed during launch because the executable
  was absent. **No WebKit journey or screenshot was produced.** See raw output.
- **Chromium supplemental crosscheck: 10 passed, 43.5s**, using installed
  `/usr/bin/chromium`, mobile/touch emulation at 320x667 and 375x667. Temporary
  configuration retained in `raw/chromium-crosscheck.config.txt`. These results
  validate the test interactions only; they do not establish WebKit acceptance.
- Every PNG here is named `chromium-*` and comes from that supplemental run.
  Two Home runs use `prefers-reduced-motion: no-preference` and `reduce`.
- `npm run quality`: PASS with
  `PATH=/workspace/environment-tools/bin:$PATH` (50 Vitest files, 386 tests;
  76 Python tests; workflow validation passed). First invocation lacked Ruby;
  the supplied environment-tools Ruby wrapper resolved it. `npm run build`: PASS.
- No production/preview browser access, merge, publish, new authentication,
  paid service, or external game launch was performed. The first local navigation
  is `/privacy/?gameai_analytics=off`; exclusion is asserted, and all non-local
  requests are aborted.

## Coverage implemented

At each width:

1. Assert the Home deck contains exactly the ten published game identities;
   activate each introduction with touch, alternate breadcrumb/browser Back,
   and verify title, selected game, focused return link, visible position above
   the sticky header, hit target and document overflow. Repeat all ten with
   reduced motion, asserting the RAF indicator is zero.
2. Visit the final game from list mode three times; alternate the return paths
   and check that list mode, specific focused item and visible position survive.
3. Open a later article from the real all-articles list three times; alternate
   breadcrumb/browser Back and verify the focused article and usable reading CTA.
   Tap the visible reading CTA, since the full-card anchor's geometric center
   intentionally includes the overlaid description.
4. Open/close the menu three times by Escape/close button, test both focus-trap
   edges, background inertness and focus return; then navigate to articles and
   activate its list to detect a leftover interaction-blocking layer.

Position assertions mean the correct return target is visibly reachable and
unobstructed, not preservation of an identical pixel scroll offset. Existing
full-suite Chromium coverage remains separate (`npm run test:e2e`). It was not
rerun in this task. No common UI component, article body or registry changed.

## Remaining acceptance / resume

1. In an environment able to download official Playwright browsers:
   `npx playwright install --with-deps webkit`, then `npm run test:e2e:webkit`.
   A dedicated `mobile-webkit` CI job installs WebKit and retains raw failure
   traces/screenshots independently of the existing Chromium job. CI results
   must be checked against the final PR head; workflow registration is not PASS.
2. Inspect actual WebKit screenshots; investigate failures before changing UI.
   No product defect has been established in WebKit, so no speculative UI fix
   was made. Independent visual acceptance is pending.
3. Desktop and synthetic 200% text stress evidence were not generated here;
   existing evidence does not establish acceptance of a new WebKit run.
4. **Physical iPhone Safari: UNTESTED** (actual touch/swipe, dynamic browser bars,
   OS Back/Forward cache, accessibility text sizing/zoom, keyboard/VoiceOver).
   WebKit mobile emulation must not be described as real iPhone verification.

Raw files retain the actual commands' output; initial selector-assumption
failures were corrected in the test code before the final Chromium run.
