# LTC Fish Browser — Quick Read for Buddy (V0.091)

## What this project is
A fish browser for customers plus a staff inventory tool for Low Tide Corals & Aquatics.

## Where it stands
The project is no longer a rough mockup. It works, but it is in the annoying polish phase where lots of little UX and layout issues still need cleanup.

## What is already done
- Fish browser is built and usable
- Staff mode exists
- Sold / hold / quarantine / loss flows exist
- Inventory button was broken and is now fixed again
- Quarantine now shows a yellow badge/overlay like sold
- Inventory cards show fish images again
- Docs/history are more organized now
- First fish-content cleanup pass already happened

## Main problems still hanging around
- Category/folder tabs still do not scroll as conveniently as they should
- Category/folder area can still behave awkwardly and sometimes feel like it wants to double-row
- Fish popup cards still have dead/wasted room
- Live popup video no longer works
- Some fish-card text still needs another real accuracy pass
- Staff side can still feel a little dense or clunky for employees
- Data persistence is still browser-local for now, which is not acceptable for the final website + in-store + POS vision

## Likely reason the popup video is broken
The code still points to popup video elements/files, but the current package does not appear to include the actual video assets. So this may be a missing-file issue, not just a CSS problem.

## Good next targets
1. Clean up the category/folder rail behavior
2. Tighten the fish popup layout and remove dead space
3. Fix or intentionally remove the broken popup video path
4. Improve staff-side convenience
5. Continue fish-content accuracy cleanup

## Staff-side ideas that would help employees
- one-tap status actions that are always obvious
- easier search by fish name or tank number
- a simpler compact inventory/staff list view
- very clear quarantine / hold / sold states
- always-visible undo/restore path
- a receiving/restock mode so adding inventory is faster
- less clutter in the editing panel

## Overall read
This is not “broken.” It is “real project, now stuck in the last 20–30% where little issues take time.” The base is there. The main risk now is death by a thousand small regressions, so focused, surgical fixes are the right move.
