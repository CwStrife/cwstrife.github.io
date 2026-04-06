# V0.079 Staff + Modal Audit

## Scope audited
- Desktop fish-detail popup structure
- Floating close button behavior path
- Mobile fish-detail scroll preservation path
- Inventory Manager change-history / rollback panel
- Build cleanliness via smoke test

## Focused findings
### Desktop fish-detail popup
- Removed the V0.078 desktop hero-cap experiment that was creating awkward blank-space artifacts.
- Desktop popup now uses a simpler structure:
  - image + header/stats top row
  - dedicated compatibility section below
  - standard two-column body below that
- Floating close button logic was left intact from the prior working fix path.

### Mobile fish-detail popup
- Mobile modal template was not changed in this pass.
- The V0.076 drag-scroll fix path remains intact.

### Staff history / rollback
- Added a new recent-history panel to Inventory Manager.
- The panel pulls recent per-fish staff history into one place.
- Major rollback actions are surfaced directly in that panel when available:
  - Undo Sold
  - Undo Loss
  - Undo Quarantine
  - Undo Hold
- Inventory summary now surfaces rollback-ready and recent-change counts.

## Automated verification
Command run:
- `node smoke-test.js`

Result:
- **0 errors**
- **1 warning**

Warning:
- EN keys missing from ES: `Sort`, `Compare`, `Quarantine`

## Honesty notes
- The build is syntactically clean.
- Outside-click close and floating X behavior still need final browser confirmation from the user's real environment.
- This pass intentionally favored stability and layout simplicity over more experimental desktop hero styling.
