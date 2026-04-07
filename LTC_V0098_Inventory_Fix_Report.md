# LTC Fish Browser V0.098 — Inventory Button Fix

## Fixed
- Restored missing Inventory Manager helper functions that the staff inventory opener was still calling.
- Re-added:
  - `hasMissingSpeciesCoreData`
  - `hasMissingStoreData`
  - `inventoryStatusLabel`
  - `inventoryStatusClass`
  - `inventorySummary`
  - `populateInventoryCategoryFilter`
  - `renderInventoryQuickFilters`

## Result
- Staff Inventory button should open again instead of failing before render.
- Inventory overlay can now build its summary cards, status labels, category filter, and quick-filter chips.
- Build smoke test passes clean: 0 errors, 0 warnings.

## Scope
- This pass only fixes the Inventory Manager path.
- No fish content lane changes were made in this build.
