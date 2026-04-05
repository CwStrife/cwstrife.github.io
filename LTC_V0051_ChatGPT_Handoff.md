# LTC Fish Browser V0.051 — ChatGPT Handoff

This build is a polish pass on top of V0.050 after real user feedback.

## What was improved

### 1. Grid / Detail control
- Replaced the weak single button with a true segmented control.
- Added icon + label treatment on desktop/tablet.
- Added stronger active-state color and a subtle repeating shimmer/sheen so the control stands out.
- On phone portrait and landscape, the control collapses to compact icon-only segments so it can stay on the same row as the filters.

### 2. Control-row placement
- Fixed the desktop/tablet search/filter row so the view control no longer drops awkwardly onto its own wasted line.
- The row now has room for search, three filters, and the mode control in one deliberate lane on wider screens.

### 3. Compact/grid cards on desktop and tablet
- Kept the 7-across compact target on wider desktop screens.
- Added back a small amount of practical information to compact cards on larger screens so the cards do not feel empty:
  - Min tank
  - Diet
- Compare remains visible.

### 4. Quick traits strip readability
- Bumped up the label/value sizing a bit so Reef / Care / Temper is easier to read.
- Tightened the strip so it uses space better without feeling crushed.

### 5. Mobile placement fixes
- On phone portrait, search remains full-width on its own row, then filters + the mode switch live together on the next compact row.
- On landscape phones, the segmented control was shrunk and tightened so it should stop bleeding out of the control area.

## What still needs real-device verification
Please verify on the actual phone and desktop:
- phone portrait: filters + grid/detail control all on one row under search
- phone portrait: detailed cards still readable and not bloated
- phone landscape: grid/detail control no longer bleeds
- desktop/tablet: segmented control feels obvious and clickable
- desktop compact mode: the extra facts improve the cards without making them crowded

## Files changed
- `index.html`
- `js/app.js`
- `css/style.css`
