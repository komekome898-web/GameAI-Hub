# Independent375px delta supplement

Reviewer: /root/sitewide_visual_review. Runtime source2071bc57a6ff8cacbdaa80dbe3a5a81f88b0e613. Stable local production server127.0.0.1:3100; Playwright with system Chromium. Source/Git/build/server untouched. This supplements the c6dfceb46c4e6d7a4b0d067c3963386f2a58b972 review; it does not relabel earlier screenshots as2071 evidence.

Runtime diff c6→2071 contains only the mobile non-Home main padding16px→12px. The<=360px rule already uses12px and desktop geometry is unchanged. This review targets the affected375px surfaces; it does not repeat the full unchanged route matrix.

## Decision

PASS for the inspected delta. No new P0/P1/high-impact P2. The active category/START card clipping regression is resolved in actual rendered evidence.

## Actual observations

- Category and START decks: stage305px, active card304px. Stage left35/right340; active card left35.5/right339.5. Both borders and the focus outline are visible. This remains true with the START summary expanded. Parent root width313px; no document overflow (375px).
- Summary expansion uses the real control, changes data-expanded false→true and increases natural height. Expanded card bottom823.47px remains within stage bottom839.72 and844px viewport in the captured state. Full description and read action remain visible.
- Real list toggle: list width313px, all cards in normal flow. Opening the first tutorial through its explicit read area and returning through its breadcrumb restores START list mode and focus to the same title. Category return restores the category deck. Read-area activation was used because the card's description is a separate sibling surface; a default center click on the overall anchor rectangle lands on that description and is not the explicit read affordance.
- Long Meshy article and Project at375 remain readable in normal rendering. Root-text and computed-text200 cases have document375px and naturally growing content. START safely becomes a full list under both enlargement methods; title18→36px and description16→32px, achieved2x. Meshy H130→60px and lead17.28→34.56px, achieved2x.
- Project root-text200 label17.28→34.56px and textarea16→32px, but submit remains16px: no blanket root200 claim. Separate snapshot-based computed-text doubles submit16→32px. A bounded textarea→Tab transition places the focused natural130.78px submit at431.22..562px, below the Header and within844px. Screenshot shows a distinct green focus indicator and readable action text.

The START enlargement screenshots were taken after scrolling the whole long list into view; their recorded original focused anchor is outside that viewport. Those records are reflow/list evidence, not focus-visibility PASS. Normal article-return focus and the separately bounded Project focus provide the actual focus observations above.

## Evidence

- delta.json: source pin, measured rectangles, modes, return title/focus, achieved font scales and geometry.
- categories-375.png, start-375.png, start-expanded-375.png, start-list-375.png, start-return-375.png, category-return-375.png.
- start-root-375.png/start-computed-375.png; mesh-normal/root/computed-375.png; project-normal/root/computed-375.png.
- delta-sheet.png is a review contact sheet; raw captures remain the evidence.

Prior c6 lower-severity caveats and untested browser zoom, forced colors, screen reader, physical devices, OS text scaling, soft keyboard, Production, performance and exhaustive functional state coverage remain unchanged. Full test/budget outcomes are the parent's separate gates and were not assumed in this decision.
