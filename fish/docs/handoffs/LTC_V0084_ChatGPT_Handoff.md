# LTC Fish Browser V0.084 — Staff Visual Pass + Restore Clarity

## What changed
- Kept the detailed fish popup on the simpler, stable layout path and reduced the awkward left-column emptiness by moving **Quick Overview** directly under the fish hero image on desktop.
- Kept **Compatibility Gauges** as their own section below the hero/stats instead of forcing them into the top block.
- Strengthened the detailed-view inline pricing presentation so sale/current pricing is more visible next to the fish name.
- Reworked Inventory Manager cards to be more visual with a clear **fish image hero area** instead of mostly gray boxes.
- Added a more obvious restore path for **Remove (Loss)** with an action toast containing:
  - **Undo Loss**
  - **Recent Changes**
- Enhanced the restore guidance modal with fish media so it is easier for non-technical staff to understand what just happened.
- Kept the separate **Recent Changes** workflow so restore/history is not buried only inside the inventory grid.

## Important note on the effects pass
The V0.083 motion/effects code is still present in the build, but the visibility of those effects did not land strongly enough in real use. This V0.084 pass prioritizes workflow and visual clarity first. Effects should be revisited in a later pass with stronger but still restrained feedback.

## What to check first
1. Open a fish detail popup on desktop.
2. Confirm the left side no longer feels so empty below the fish image.
3. Confirm the sale/current price presentation near the fish name is easier to see.
4. Open Inventory Manager and verify fish cards now feel more visual because of the image hero treatment.
5. Mark a fish as **Remove (Loss)** and confirm the immediate restore path is obvious.
6. Confirm **Recent Changes** is easy to reach and makes sense as a separate recovery path.

## Verification
- smoke test passed
- 0 errors
- 1 existing translation warning
