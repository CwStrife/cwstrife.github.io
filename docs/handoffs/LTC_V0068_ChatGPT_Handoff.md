# LTC Fish Browser V0.068 — Staff Workflow Upgrade Pass

## Why this pass happened
The next priority was shifted away from quarantine/QR ideas and into the store-side tools that should make the biggest practical difference right now:
- quantity on hand
- hold / reserve workflow
- arrival/vendor tracking
- better inventory visibility

## What changed
### 1) Staff inventory controls expanded
Added staff-editable fields for:
- `quantity`
- `reserved`
- `reservedFor`
- `arrivalDate`
- `vendor`
- `updatedAt`
- `lastAction`

These are included in the local staff export/import payload just like the earlier staff edits.

### 2) Inventory Manager upgraded
Inventory cards now show:
- price
- tank
- stock size
- quantity
- hold status
- arrival date
- vendor/source
- photo source
- updated timestamp / last action

New staff actions in Inventory Manager:
- Edit Qty
- Hold / Reserve
- Stock Details

### 3) Fish popup staff quick edits upgraded
The popup quick-edit block now also includes:
- Qty
- Hold
- Stock Details

This should make mobile/tablet edits much more practical without forcing staff back into the large inventory panel every time.

### 4) Better sold/loss behavior for multi-count livestock
`Mark Sold` and `Remove (Loss)` now behave more realistically:
- if quantity > 1, the count decrements and the item stays in stock
- if quantity falls to 0, the item flips out of stock

### 5) Restock workflow improved
Restock now captures:
- price
- tank
- stock size
- quantity
- arrival date
- vendor/source

### 6) Inventory visibility improvements
Added summary cards at the top of Inventory Manager for the current filtered view:
- SKUs
- Live Count
- Held
- No Price
- No Store Photo

Added new filter:
- Held / reserved

## What was intentionally NOT expanded in this pass
- no bigger quarantine dashboard build
- no QR workflow build
- no backend/user account system

That was intentional. This pass aimed at the most practical store-side gains first.

## Verification
- smoke test passed
- result: **0 errors, 1 existing translation warning**
- content audit still clean for banned placeholder phrases
- doubled-word scan still clean

## What to test first
1. Enter Staff Mode.
2. Open **Inventory Manager**.
3. Pick a fish and test:
   - Edit Qty
   - Hold / Reserve
   - Stock Details
4. Mark one item sold when qty > 1 and confirm it decrements instead of fully disappearing.
5. Mark one item loss when qty > 1 and confirm it decrements.
6. Restock an out-of-stock item and set quantity, arrival date, and vendor.
7. Open the fish popup on mobile/tablet-sized view and verify the new quick-edit buttons work there too.
8. Refresh the page and confirm edits persist locally.

## Suggested next priorities after testing
- optional dedicated “recent updates” / change history view
- optional reservation expiration / pickup date
- optional multi-tank support if the same species can sit in more than one location
- optional missing-data dashboard for price/photo/tank/qty gaps
