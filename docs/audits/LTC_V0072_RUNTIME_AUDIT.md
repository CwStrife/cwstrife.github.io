# LTC Fish Browser V0.072 — runtime / workflow audit

## Scope of this audit
This was a **static code-path audit + smoke test pass** done before shipping the zip.
It is not a substitute for hands-on browser testing on the user’s actual PC/tablet/mobile devices.

## Issues targeted in this pass
- undo history for major staff state changes was not reliably available after refresh / re-entry
- sold/loss/quarantine/hold actions needed more explicit rollback buttons instead of only a generic undo path
- image loading after browser refresh was inconsistent
- fish detail close button was still drifting to the top-left in the user’s screenshots
- desktop fish detail top section looked visually split instead of grouped
- select/dropdown controls looked too white and unclear

## Code-path changes applied
- history snapshots now exclude heavy staff photo payloads for rollback persistence
- localStorage payload pruning also strips nested photo blobs out of saved history entries
- added dedicated rollback actions for sold/loss/quarantine/hold
- reduced image fetch burst concurrency and added retry-on-error image recovery
- forced modal close button placement from both CSS and JS
- grouped desktop image + header/stats into a shared hero shell
- styled select/options for dark-mode consistency

## Verification run
- smoke test: **0 errors, 1 existing translation warning**
- JS syntax: passed
- placeholder phrase scan: passed
- required files and catalog shape: passed

## Remaining honesty note
The following still need real-user validation in-browser:
- whether rollback history now survives the exact refresh flow the user described
- whether all broken image cases are fully resolved, not just reduced
- whether the close button now stays top-right on all target screen sizes
