# LTC Fish Browser V0.099 — Inventory Performance Fix

## What was causing the lag
The staff Inventory panel was building the full inventory UI in one shot:
- summary cards
- quick-filter chips
- the full grid of 448 inventory cards
- many nested action buttons/tiles inside each card
- eager image hydration/fetches for a large sample

That made the panel feel sticky or frozen when opening, even though it technically worked.

## What changed
- Inventory overlay now opens first, then renders on the next animation frame
- Inventory cards now render in smaller batches instead of all at once
- Inventory photo hydration sample reduced so opening the panel does less immediate work
- In-progress inventory render work is now cancelled cleanly if the panel closes or the view changes

## Expected result
- Inventory Manager should feel much faster to open
- The first chunk of cards should appear quickly
- The rest of the list should fill in progressively instead of freezing the panel

## Safety
- Inventory logic and staff actions were not changed
- Smoke test passes clean: 0 errors, 0 warnings
- Species count remains 448
