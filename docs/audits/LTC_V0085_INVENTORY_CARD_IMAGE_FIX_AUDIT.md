# V0.085 Inventory Card Image Fix Audit

## Scope
- Inventory Manager card visuals only
- No staff workflow logic changes in this pass
- No popup layout changes in this pass

## Checks run
- `node smoke-test.js`
- Result: 0 errors, 1 existing translation warning

## Technical notes
- Inventory cards already had `data-photo` targets, but the inventory grid render path was not explicitly rehydrating those targets afterward.
- Added `hydrateInventoryPhotos(items)` so:
  - `applyImagesToDOM()` reruns after the inventory grid/history overlay render
  - visible inventory items trigger image fetches and reapply once loaded
- Increased inventory-card image visibility with stronger card background opacity and a taller image hero block.

## Expected user-facing result
- Staff inventory cards should no longer read as mostly gray blocks.
- Fish photos should be visible behind/within each card so staff can identify fish faster visually.
