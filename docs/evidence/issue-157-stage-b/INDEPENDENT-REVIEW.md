# Independent Stage B rendered review

The independent reviewer inspected the committed screenshot set and current diff, without editing implementation files.

## First pass

- P1: horizontal Deck drag did not suppress its following anchor click.
- P1: the manual list/Deck choice did not persist across remount/reload.
- High-impact P2: durable captures did not show Deck mode, and fixed stage heights did not follow natural card content.
- High-impact P2: integrated evidence remains incomplete for 320/375 rendered captures, 150/200 text roles, and several dynamic application states.
- P3: one post-interaction list screenshot contained an ambiguous focus/capture artifact.
- No P0 was observed. Normal Home/Project/Compare/Articles captures retained clear hierarchy, usable CTAs, full START content, and recognizable Mint Atrium/Crafted Ceramic treatment.

## Fix and retest

The Deck now suppresses only the click following a recognized drag, stores the manual mode in session storage, measures natural card height after resize/font settlement, and captures active Deck mode before returning to the list. Focused Vitest and Playwright checks passed after these changes.

The evidence-completeness P2 remains open and is reflected honestly in the matrix: Stage B cases are `IMPLEMENTED`, not `VERIFIED`; final execution must continue to reject them until all required same-observation state/scale records and rendered reviews exist. Physical-device, protected Preview, and Production remain untested.
