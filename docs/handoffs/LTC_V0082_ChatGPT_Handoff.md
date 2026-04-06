# LTC Fish Browser V0.082 — Staff usability pass before effects

## What changed
- Added a dedicated **Recent Changes** entry point in the main staff header.
- Improved **restock / add-to-stock** workflow with:
  - fish image preview in the modal
  - recent sale prices
  - one-click **Use price** buttons
  - **Apply last known fish data** shortcut for price / tank / stock # / size / qty / arrival / vendor
- Improved **Edit Price** so staff can quickly reuse a recent selling price.
- Added **sale-history apply buttons** in the sale-history popup when staff mode is active.
- Added a small **fish thumbnail** to inventory cards and recent-change rows so staff can scan visually instead of reading every card title first.
- Added a dismissible **restore guidance** popup after a full **Remove (Loss)** action with quick links to Recent Changes and Out of stock.
- Kept the modal scroll / close behavior untouched in this pass.
- Kept **Missing species data** and **Missing store data** separate so catalog-quality review and store setup are not mixed together.
- Added inline price treatment near the fish name in detailed view so sale-price context is easier to understand.

## Why this pass matters
This pass focuses on making the staff side easier for a non-technical store employee:
- faster re-entry when a fish comes back in stock
- less typing for repeat pricing
- quicker recovery after sold/loss mistakes
- more visual scanning in Inventory and Recent Changes

## What to test first
1. Enter staff mode and confirm **Recent Changes** appears in the main header.
2. In Inventory, open a fish that is out of stock and click **+ Add to Stock**.
3. Confirm the modal shows:
   - fish image
   - recent sale prices
   - per-price **Use price** buttons
   - **Apply last known fish data**
4. Mark a fish as **Remove (Loss)** and confirm the restore guidance popup appears and is easy to dismiss.
5. Open **Sale History** and confirm staff can reuse a previous price.
6. Confirm inventory cards / recent changes rows are more visual thanks to fish thumbnails.
7. Check that **Missing species data** and **Missing store data** behave as separate filters.

## Notes
- This pass intentionally stops before the fluid/microinteraction effects pass.
- The next phase should be the subtle animation layer: compatibility gauges, button/pill microinteractions, and a restrained ambient motion pass.
