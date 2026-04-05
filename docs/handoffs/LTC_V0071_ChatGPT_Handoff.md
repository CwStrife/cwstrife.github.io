# LTC Fish Browser V0.071 — Staff UX cleanup + restore actions pass

## What changed
- Added explicit **restore availability** actions for out-of-stock fish:
  - **Undo Sold**
  - **Undo Loss**
  - **Restore Stock**
- Kept generic Undo/history, but made sold/loss reversal more visible on:
  - browse cards in staff mode
  - fish popup staff quick-edit section
  - Inventory Manager
- Inventory / Foods / Analytics overlays can now also close by **clicking off-screen**.
- Inventory Manager now has a real **category filter** in addition to status filtering.
- Inventory search now matches more operational staff terms:
  - category labels
  - scientific names
  - stock #
  - vendor
  - reserved-for name
  - aliases
- Reworked Inventory Manager field layout:
  - field tiles are now **clickable to edit**
  - each tile now has its own action button directly under the value
  - status actions stay grouped below for sold/loss/restore/restock
- **Food Settings** were demoted from the main top-right staff header and moved to a secondary location inside Inventory Manager.
- Tightened modal-close CSS so the fish detail **X** should stay in the **top-right** instead of drifting left.

## What to test first
1. Mark a fish sold, then use **Undo Sold / Restore Stock** to bring it back quickly.
2. Mark a fish as loss/out, then test **Undo Loss / Restore Stock**.
3. Open Inventory Manager and confirm you can dismiss it by clicking outside the panel.
4. Use the new **category filter** and test queries like tang, blenny, wrasse, shrimp, crab.
5. Click the field tiles themselves in Inventory Manager and confirm they edit directly.
6. Confirm the fish detail popup **X** is now properly placed top-right.
7. Confirm the top-right staff header no longer gives Food settings prime space.

## Verification run
- `js/app.js` syntax ✅
- `js/features.js` syntax ✅
- `data/catalog-base.js` syntax ✅
- `data/fish.js` syntax ✅
- smoke test ✅
- result: **0 errors, 1 existing translation warning**

## Notes
- This pass focused on the staff workflow/reporting issues surfaced from V0.070 testing.
- Manual livestock entry and Shopify sync are still **future-phase notes**, not implemented in this build.
- Real browser/device testing is still the final judge for overlay dismissal, restore buttons, and modal close placement.
