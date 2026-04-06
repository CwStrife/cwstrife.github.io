# LTC Fish Browser V0.073 — Patch 1 Only (Staff rollback persistence)

## Scope of this pass
This version intentionally handles **Patch 1 only** from the outstanding-fixes list:
- staff undo / restore behavior
- persistence of rollback targets after refresh / re-entering staff mode
- de-emphasizing the old universal undo approach

This pass does **not** attempt to fix:
- popup X placement
- popup top-section layout
- image reload reliability
- dropdown/select problems
- inventory layout polish

Those remain for Patch 2 and Patch 3.

## What changed
- Added **dedicated persisted rollback snapshots** for major operational actions:
  - `Undo Sold`
  - `Undo Loss`
  - `Undo Quarantine`
  - `Undo Hold`
- These rollback targets are now stored alongside the local staff edit payload so they can survive refresh/reload more reliably than the earlier generic undo path.
- Kept staff history chips, but made them **secondary** to the explicit rollback buttons.
- Removed the main toolbar emphasis on **Undo Last Change** and replaced it with copy telling staff rollback is handled **per fish**.
- Updated staff quick-edit copy to say rollback buttons are **persistent per-action** controls.

## What to test first
1. Mark a fish sold.
2. Refresh the browser.
3. Re-enter staff mode.
4. Confirm **Undo Sold** is still available and restores the fish.
5. Repeat the same pattern for:
   - loss/removal
   - quarantine
   - hold

## Expected result
- the operational state should persist
- the corresponding rollback button should also persist
- rollback should restore the prior local store state for that fish

## Notes added for later
- LTC logo behavior is now documented for future site work:
  - when the broader LTC site exists, clicking the LTC logo should go to the **main LTC store homepage**, not merely the fish browser root
