# LTC Fish Browser V0.077 — Desktop popup cleanup

## Scope
This is a tight follow-up to V0.076 focused only on the desktop fish-detail popup layout and close control.

## What changed
- Reworked the fish-detail close button so it is attached to the fish overlay again instead of being floated off `document.body`.
- Kept the close button fixed/sticky so it stays easy to reach while the popup content scrolls.
- Forced the desktop close button to render in the top-right of the viewport/modal presentation area.
- Removed the right-side dead hero gap by moving **Compatibility gauges** up into the desktop hero section under the base stats.
- Kept the now-working mobile drag-scroll behavior from V0.076 intact.

## What to check first
1. Open a fish detail popup on desktop.
2. Confirm the **X** is visible in the top-right.
3. Scroll down and make sure the **X** stays easy to reach.
4. Confirm the large dead space under the right-side header/stats is gone.
5. Confirm the compatibility gauges now sit higher in the popup.
6. Re-check mobile popup scrolling to make sure it still works.

## Build check
- smoke test passed
- result: 0 errors, 1 existing translation warning
