# LTC Fish Browser V0.085 — Inventory Card Fish Image Fix

## What changed
- Fixed Inventory Manager so each fish card now hydrates its own photo layers after the inventory grid renders.
- Added a targeted inventory-photo hydration step that reapplies images and fetches visible card images when Inventory Manager or Recent Changes opens.
- Strengthened the visual treatment on inventory cards so the fish image is more obvious:
  - stronger full-card background image presence
  - taller top media/hero area
  - stronger overlay tuning so controls stay readable
  - slightly stronger name/meta contrast over the fish photo

## Why this pass happened
The prior build already had inventory-card photo markup and styles, but the images were not being hydrated reliably after the Inventory Manager grid was rendered. That made the cards still look flat/gray in real use.

## What to check first
1. Open Staff Mode → Inventory.
2. Confirm the scrollable fish cards now show their respective fish photos clearly.
3. Confirm the controls remain readable over the image background.
4. Open Recent Changes and confirm fish thumbnails still appear there too.
5. Spot-check a few fish that are out of stock and a few that are in stock.

## Verification run
- smoke test passed
- 0 errors
- 1 existing translation warning
