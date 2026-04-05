# LTC Fish Browser V0.052 — ChatGPT Direct Fix Pass

This build continues from V0.051 and focuses on the next round of usability fixes after live review.

## Main fixes in V0.052

### 1. Grid / Detail mode control
- Replaced the awkward two-button segmented control with a single toggle button.
- The button now swaps between Grid and Detail states instead of forcing the user to target two tiny buttons.
- Kept the subtle sheen/shimmer so it still reads as interactive.
- Tightened the mobile and landscape-phone versions so it fits more cleanly beside the filters.

### 2. Search / filter row scale
- Reduced the size of the desktop/tablet search field and filter chips so they do not dominate the entire control panel.
- Kept the mobile versions compact.

### 3. Category rail and bundle rail affordance
- Added stronger horizontal-scroll cues:
  - more visible left/right rail arrows
  - stronger edge fades
  - a small nudge animation on the right arrow when more content is hidden off-screen
- Added the same pattern to bundle packs so partially hidden bundle cards no longer feel cut off without explanation.

### 4. Horizontal overflow cleanup
- Added stronger overflow clipping on the main shell / panel areas to stop the whole page from being dragged sideways on phone.
- Kept the actual horizontal scrolling only on the category rail and bundle rail.

### 5. Compact grid card polish
- Compact cards now use space better instead of feeling underfilled.
- Sale pricing is separated more cleanly:
  - old price is smaller and secondary
  - sale price remains the primary visible number
- Added two compact quick-trait chips on desktop/tablet compact cards:
  - reef
  - care
- Kept compare visible.

## Files directly changed
- `index.html`
- `js/app.js`
- `css/style.css`

## What to test next
1. Desktop compact/grid mode:
   - toggle placement and look
   - seven-across density on wide screens
   - sale price layout consistency
2. Phone portrait:
   - category rail arrows / fade / hidden-tab hinting
   - bundle rail arrows / hinting
   - no full-page sideways drag
   - single Grid/Detail toggle usability
3. Phone landscape:
   - Grid/Detail toggle fit
4. Fish detail modal:
   - full portrait scroll still works top to bottom

## Honest note
This pass focused on layout and interaction polish. It was smoke-tested successfully, but still needs real-device confirmation on the user's phone/browser.
