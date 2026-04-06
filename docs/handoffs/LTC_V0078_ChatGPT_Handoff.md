# LTC Fish Browser V0.078 — Desktop Hero Shape Cleanup + Research Notes

## What changed
- Focused only on the desktop fish-detail hero area.
- Removed the large empty right-side hero gap by taking the desktop compatibility gauges out of the hero shell.
- Rebuilt the desktop top section so it reads more like:
  - left: fish image card
  - right: unified name/header + key stats cap
- Compatibility gauges now begin at the top of the right-side reading column instead of leaving dead space under the top stats.
- Mobile popup scrolling behavior from V0.076 and the desktop/mobile close-button behavior from V0.077 were intentionally left alone.

## Why this pass exists
The prior desktop popup fix restored the X button, but it still left a large block of visually dead space under the header/stat area. This pass was meant to compact the hero, keep the X working, and move the compatibility content upward.

## Verification run
- smoke test ✅
- Result: 0 errors, 1 existing translation warning

## What to check first
1. On desktop, open multiple fish detail popups.
2. Confirm the X still shows top-right.
3. Confirm the large dead space under the top-right header/stats is gone.
4. Confirm compatibility gauges now start higher up in the right column.
5. Confirm phone popup scrolling still behaves like V0.076/V0.077.
