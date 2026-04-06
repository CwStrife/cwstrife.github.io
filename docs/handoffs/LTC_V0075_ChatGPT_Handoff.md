# LTC Fish Browser V0.075 — Patch 3 (Inventory UX / Filters / Select Options)

## Scope of this pass
This version is **Patch 3 only** from the split-fix plan.

Patch 1 was undo/rollback persistence.
Patch 2 was fish popup close placement, modal top-section cleanup, and image-load timing.
Patch 3 in this build focuses on:
- inventory UI/filtering polish
- dropdown/select usability
- stock # visibility in quick staff flows
- making category search/filtering easier on PC / tablet / mobile

## What changed
- Inventory toolbar now has clearer labeled controls for **Search / Status / Category**.
- Added a horizontal **category quick-filter rail** with counts so staff can tap categories quickly without relying only on the dropdown.
- Inventory search now matches more category-family language, including terms such as goby, blenny, tang, wrasse, crab, shrimp, conch, eel, trigger, and similar alias terms.
- Added stronger dark styling for inventory dropdowns and their option lists.
- Styled input-modal select fields more clearly.
- Added **visible option chips** under select fields in the input modal so stock-size/tank selection is still obvious even if the native browser dropdown is awkward.
- Refined staff quick-edit layout in the fish detail popup so the editable livestock fields render as **field tiles with per-field buttons**, including **Stock #**.
- Added more visible inventory badges for **Stock # / Tank / Qty** on inventory cards.

## What this build is meant to test
1. Inventory toolbar readability on desktop, tablet, and mobile.
2. Category rail behavior and category filtering.
3. Search behavior for category-family terms like blenny, tang, wrasse, shrimp, crab, etc.
4. Stock-size / tank dropdown usability and visibility.
5. Stock # visibility in quick staff edit paths.
6. General inventory card / field-tile usability.

## Still intentionally not part of Patch 3
- Any new large data sync work (Shopify/manual entry integration is still a future note only).
- Any new homepage/LTC main-site routing implementation (still future-note only).
- Fresh popup/X fixes beyond what Patch 2 already carried.

## Verification run
- smoke test: **0 errors, 1 existing translation warning**
- placeholder phrase scan: clean
- syntax checks: clean
