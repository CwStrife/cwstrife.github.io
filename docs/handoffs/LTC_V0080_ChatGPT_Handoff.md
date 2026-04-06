# LTC Fish Browser V0.080 — Functional polish pass before animation work

## Scope of this pass
This build focused on the workflow/UI issues the user flagged before any animation work:
- desktop fish-detail dead space under the top stat row
- loss/restore needing a clearer path
- a clearly visible recent staff changes flow
- inventory cards needing stronger visual fish anchors
- inventory card density/usability cleanup
- correcting the meaning of "missing core data"
- adding previous sale-price history per fish

## What changed
### 1) Desktop fish-detail popup
- Kept the desktop popup in the simpler separate-section layout.
- Moved **Compatibility gauges** up so they sit directly under the desktop top stat row instead of leaving a large dead space.
- Left the already-working top-right X, outside-click close, and mobile popup scroll behavior alone.

### 2) Loss/restore and recent changes
- Added a dedicated **Recent Changes** button in Inventory Manager.
- Added a separate **Recent Staff Changes** overlay so rollback is easy even when a fish disappears from the current inventory filter.
- Added a **Recent changes** status filter inside Inventory Manager.
- `Remove (Loss)` now toasts a clearer hint that restore is available via **Recent Changes** or **Out of stock**.

### 3) Inventory cards and usability
- Added a fish-image-backed visual layer to inventory cards so staff can recognize fish more quickly.
- Tightened card density and field sizing to fit more useful information without making the screen feel as bulky.
- Added **Sale History** as a per-fish action.
- Added a **Last sold** field tile with a quick "View sales" action.

### 4) Missing data logic
- Reframed **Missing Species Core Data** to mean missing species-information fields, not store-side setup.
- Species core data now checks for important catalog info like scientific name, overview, min tank, max size, diet, and the main gauge values.
- Added a separate **Missing Store Setup** summary for store-managed gaps like price, tank, qty, stock #, and photo.

### 5) Sale history tracking
- Staff sell actions now record sale-history entries with:
  - time
  - price
  - quantity
  - tank code
  - stock size
  - stock #
- Sale History can be viewed per fish from Inventory Manager.

## Verification
- Smoke test passed.
- Result: **0 errors, 1 existing translation warning**.

## What to test first
1. Open a desktop fish popup and confirm the dead space is gone because compatibility starts right below the stat row.
2. In Inventory Manager, click **Recent Changes** and confirm it opens a clear rollback view.
3. Mark a fish as **Remove (Loss)** and confirm you can still restore it through Recent Changes / Out of stock flow.
4. Check that inventory cards now show a fish-image visual background.
5. Click **Sale History** on a fish after selling one and confirm the prior sale price/date list appears.
6. Confirm the **Missing Species Core Data** count no longer acts like “everything is missing.”

## Notes for the next phase
- The user wants animation work **after** these staff/workflow issues are in a better place.
- Keep staff workflows easy for non-technical store staff.
- Keep a later task to re-review fish detail information for further accuracy/expansion and to add more entries later.
