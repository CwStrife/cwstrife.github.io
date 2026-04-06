# LTC Fish Browser V0.074 — Patch 2 Only

## Scope of this pass
This version is **Patch 2 only** from the outstanding-fixes list:
- fish popup **X** placement
- fish popup top-section layout / grouped header feel
- fish image reload reliability after refresh

Patch 3 items were intentionally left alone for the next build.

## What changed
- Moved the popup close button to the **overlay layer** and force-positioned it as a fixed **top-right** control.
- Added stronger close-button CSS so `right` wins consistently and the button is less likely to drift back to the left in real browser layout.
- Unified the **mobile detail hero** so the image, fish name, mini pills, header bar, and primary stats feel like one grouped section instead of separate floating boxes.
- Changed startup order so staff edits load **before** the first main render/image pass.
- Reduced image-fetch concurrency again and added lighter retry handling for broken image loads.
- Kept docs/worklog structure inside the zip per the new indexing rule.

## Verification run
- `js/app.js` syntax ✅
- `js/features.js` syntax ✅
- smoke test ✅
- result: **0 errors, 1 existing translation warning**

## What to check first
1. Open a fish profile and verify the **X is top-right**.
2. Refresh the browser and spot-check whether fish images recover more reliably.
3. Open several fish detail cards on phone/tablet/desktop sized views and check whether the top section feels more unified.
4. Confirm popup scrolling still works while the X stays easy to hit.

## Intentionally not changed yet
- dropdown/select option population
- stock-size dropdown usability
- inventory-manager layout/button placement refinement
- broader patch 3 category-filter / field-edit polish
