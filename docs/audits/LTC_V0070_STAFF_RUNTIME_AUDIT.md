# LTC Fish Browser V0.070 — Staff/runtime audit

## Reported issues reviewed
- sold/loss changes not surviving refresh
- fish images feeling missing after refresh
- no undo/recovery path for mistakes
- stock # edit not obvious enough
- compare controls still showing in staff mode
- popup/modal scroll breaking again

## Fixes applied
- added IndexedDB-backed staff persistence with localStorage fallback
- added image URL caching for quicker reload recovery
- added undo/history controls for staff edits
- added direct Stock # edit buttons in cards, popups, and inventory cards
- hid compare behavior in staff mode
- hardened modal scroll/touch overflow rules
- fixed Missing store data filter + summary count path

## Code/path verification
- smoke test: passed
- JS syntax: passed
- placeholder phrase scan: passed
- build status: 0 errors, 1 existing translation warning

## Remaining real-world check to do outside the container
The one thing that still needs user confirmation is the exact browser/device persistence behavior after a real refresh in your normal workflow. The code path is now much safer than the previous localStorage-only setup, but that still needs live confirmation in the target environment.
