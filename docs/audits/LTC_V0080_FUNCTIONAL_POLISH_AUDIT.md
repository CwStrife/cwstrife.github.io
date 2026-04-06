# LTC Fish Browser V0.080 — Functional polish audit

## Build target
V0.080 from V0.079.

## Main goals audited
- desktop modal dead-space fix
- clearer rollback access for loss/sold/quarantine/hold
- visible recent-change access from Inventory Manager
- inventory-card visual identification improvements
- missing-core-data logic corrected to species-data meaning
- sale history capture/view support

## Code-level checks
- `js/app.js` syntax ✅
- `js/features.js` syntax ✅
- `data/catalog-base.js` syntax ✅
- `data/fish.js` syntax ✅
- smoke test ✅
- result: **0 errors, 1 translation warning**

## Functional notes
### Desktop popup
- Compatibility gauges were moved up under the top stat row while staying their own section.
- Mobile popup behavior was intentionally left alone.

### Staff recent changes / rollback
- Added a separate Recent Changes overlay instead of relying only on the inline grid context.
- Added a Recent Changes status filter.
- Existing per-fish rollback actions remain the operational recovery path.

### Inventory Manager
- Added image-backed inventory cards for faster visual identification.
- Tightened inventory card density.
- Added sale-history access per fish.

### Data semantics
- Missing Species Core Data now refers to species-information quality gaps.
- Missing Store Setup keeps store-managed operational gaps separate.

## Remaining real-world checks still needed by the user
- Confirm the desktop popup visually closes the dead-space issue on the actual deployed site.
- Confirm Recent Changes is easier/faster in real use than the old flow.
- Confirm Remove (Loss) no longer feels like the fish disappears forever.
- Confirm the image-backed cards help recognition without hurting readability.
- Confirm sale-history popup feels useful and understandable to non-technical staff.
