# LTC Fish Browser V0.072 — rollback persistence + image reload hardening + modal grouping

## What changed
- tightened **staff rollback persistence** by storing lighter history snapshots so undo state for sold/loss/quarantine/hold is more likely to survive refresh/re-entry
- added more explicit rollback actions:
  - **Undo Sold**
  - **Undo Loss**
  - **Undo Quarantine**
  - **Undo Hold**
- kept generic undo as a secondary fallback for smaller edits
- improved **image recovery after reload**:
  - reduced wiki-image fetches from a giant all-at-once burst to a small concurrency queue
  - added retry logic when a cached image breaks on render
  - staff photos are again preferred first when present
- hardened the fish detail **X button** positioning with both CSS and JS so it should stay top-right more reliably
- updated the desktop fish detail layout so the **hero image + header/stats** read more like one combined top section
- darkened styled input/select fields so dropdowns stop feeling like bright white native boxes

## What this pass specifically targets from user feedback
- sold state was persisting, but recent undo recovery was not surviving a leave/re-enter flow
- some fish images were failing again after browser reload
- detail modal close button was still appearing top-left instead of top-right
- the top portion of the detail page looked visually split instead of grouped
- dropdowns felt broken / empty-looking and too white

## Important honesty note
This build passes code/smoke checks, but the final verdict on these issues still depends on real browser/device testing:
- refresh + undo persistence
- real-world image recovery after reload
- exact X placement in the user’s environment
- touch feel for staff controls

## What to test first
1. mark a fish sold, refresh, leave/re-enter staff mode, then test **Undo Sold**
2. quarantine a fish, refresh, then test **Undo Quarantine**
3. create/clear a hold and test **Undo Hold**
4. reload the browser and spot-check fish image recovery again
5. open a fish profile and confirm the **X stays top-right**
6. look at the top of the fish profile and see whether the new grouped hero/header section feels better
7. open any stock-size/select dropdown and confirm options are visible and no longer bright white
