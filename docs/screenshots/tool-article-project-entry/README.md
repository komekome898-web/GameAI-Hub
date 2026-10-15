# Local rendered evidence

Captured 2026-10-07 from a local production build on `fix/tool-article-project-entry`, based on main `d7bf92f1f4c9b268a14afc59aad692db890b4ce1`.

- `meshy-*` / `elevenlabs-*`: existing published article entry links at 1280, 375 and 320 CSS px.
- `project-cta-*`: common manual-entry CTA at the same widths.
- `verification.json`: routes, link targets, local navigation/Back, empty fresh Project input, document widths and page errors.
- `breadcrumb-return-*`: article breadcrumb return at 1165, 375 and 320 CSS px; adjacent JSON records selection URL and heading/header/document geometry.

Chromium 151.0.7922.173, viewport emulation only. These are not Production, hosted Preview or physical Safari acceptance. External network traffic was blocked; affiliate links were not followed. An independent reviewer inspected all 12 screenshots and found no P0/P1/high-impact P2 in these changed surfaces.

The 375px partially hidden category heading was reproduced locally and corrected. The separately reported Production 8px document overflow at 1165px was not reproduced and remains unresolved pending exact reproduction conditions.
