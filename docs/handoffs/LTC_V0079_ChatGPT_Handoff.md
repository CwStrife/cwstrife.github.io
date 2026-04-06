# LTC Fish Browser V0.079 — Desktop modal rollback + staff history panel

## What changed
- Rolled the desktop fish-detail popup layout back to simpler **separate sections**.
- Kept the working floating **top-right X** behavior and outside-click close path.
- Kept the working **mobile drag-scroll** behavior from V0.076.
- Replaced the experimental desktop hero treatment with:
  - top row = fish image + header/base stats
  - full-width compatibility section directly underneath
  - normal two-column content sections below that
- Added a new **Recent staff changes** panel near the top of Inventory Manager.
- Added direct rollback buttons in that history panel so staff can reverse major actions faster:
  - Undo Sold
  - Undo Loss
  - Undo Quarantine
  - Undo Hold
- Updated inventory summary cards to surface:
  - rollback-ready fish count
  - recent staff change count

## Why this pass was done
The prior desktop popup iterations kept trading one spacing problem for another. This pass intentionally backs away from the more aggressive hero-shape experiments and returns to a simpler layout that should be easier to maintain and less likely to produce odd dead-space artifacts.

## What to check first
1. On desktop, open a fish detail popup.
2. Confirm the **X** is still visible in the top-right.
3. Confirm the popup still scrolls normally on desktop.
4. Confirm clicking outside the popup still closes it.
5. Confirm the compatibility gauges now sit in their own section and the dead-space issue is gone.
6. On phone, confirm fish-detail scrolling still works by dragging on the page content.
7. In staff mode, open Inventory Manager and check the new **Recent staff changes** panel.
8. Use the new history panel rollback buttons after Sold / Loss / Quarantine / Hold changes.

## Verification run
- `node smoke-test.js`
- Result: **0 errors, 1 warning**
- Existing warning remains the same translation gap:
  - EN keys missing from ES: `Sort`, `Compare`, `Quarantine`

## Carry-forward notes
- The next smart pass should focus on broader **staff workflow polish** rather than more popup-layout experimentation.
- The user wants easier undo/recovery, better control ergonomics, and stronger decision-driving facts on the fish profiles.
- Future larger-site note still stands: clicking the LTC logo should eventually go to the main LTC store homepage, not just the fish browser root.
