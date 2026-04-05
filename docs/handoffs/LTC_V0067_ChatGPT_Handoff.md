# LTC Fish Browser V0.067 — Staff Inventory Manager + Persistence Pass

## What changed
- Added a dedicated **Inventory Manager** overlay in staff mode.
- Added local persistence for staff edits using browser storage.
- Added **export / import / reset** for locally saved staff data.
- Added staff edit controls for:
  - price
  - tank code
  - in-store stock size
  - staff note
  - upload store photo
  - mark sold
  - remove (loss)
  - restock
- Added **mobile / tablet-friendly staff quick-edit controls inside the fish detail popup** so staff can change values directly from the detail view.
- Replaced legacy `Unknown` stock-size placeholders with blank stored values that display as `—` until the shop fills them.
- Fixed the restock path so it clears the correct loss flag and now also lets staff set stock size during restock.

## What to test first
1. Enter **Staff Mode**.
2. Open **Inventory** from the top bar.
3. Search for a fish and test:
   - Edit Price
   - Edit Tank
   - Edit Size
   - Edit Staff Note
   - Upload Photo
   - Mark Sold / Add to Stock
4. Refresh the page and confirm the local changes stayed in place.
5. Export the staff data JSON, then re-import it and confirm the values still load correctly.
6. Open a fish detail popup on **mobile / tablet sized view** and confirm the new staff quick-edit buttons are easy to tap.
7. Confirm entries with no local stock size now show **`—`** instead of `Unknown`.

## Current build status
- content cleanup remains clean
- banned marker phrase audit: **0 hits**
- doubled-word scan: **0 hits**
- core factual gaps for scientific / maxSize / minTank / diet: **0 remaining**

## Verification
- smoke test passed
- **0 errors**
- **1 existing translation warning**

## Included in this zip
- master worklog
- V0.067 handoff
- V0.067 staff/build audit
- V0.067 content audit

## Scope note
- staff edits are currently stored **locally in that browser on that device** unless exported/imported.
- this is good for kiosk / tablet / local-store use, but it is not yet a cloud sync system.
