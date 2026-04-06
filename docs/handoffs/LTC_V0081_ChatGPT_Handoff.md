# LTC Fish Browser V0.081 — Workflow Polish Before Effects

## What changed
- Reverted the desktop fish-detail compatibility section to the simpler pre-V0.080 layout.
- Added a crossed-out original price plus sale-price row in the fish-detail header when a fish is on sale.
- Added a visible **Recent Changes** button to the main staff header next to Inventory / Analytics.
- Added a dismissible restore-guidance popup after **Remove (Loss)** so staff can jump straight to Recent Changes or Out of stock.
- Made inventory cards more visual with a fish thumbnail plus a slightly more visible photo background.
- Tightened inventory cards a bit so the staff view fits more cleanly on screen.
- Split inventory filtering so **Missing species data** and **Missing store data** are separate and no longer conflated.
- Added sale-history access in the Recent Changes overlay.

## What to check first
1. Fish detail popup on desktop:
   - compatibility gauges back in their own section below the hero/stat row
   - sale fish show a crossed-out original price near the fish name
2. Staff header:
   - new **Recent Changes** button is visible in staff mode
3. Inventory:
   - inventory cards show fish thumbnails / stronger fish-image presence
   - **Remove (Loss)** shows a quick restore/help prompt
   - restore path is easy from Recent Changes / Out of stock
4. Filters:
   - Missing species data is separate from Missing store data

## Verification run
- smoke test ✅
- 0 errors
- 1 existing translation warning

## Notes
- I intentionally did **not** start the animation pass yet.
- The next pass should be the subtle effects / microinteractions pass once this functional/UI build checks out.
