# Claude Start Here — V0.065

Use this build as the current carry-forward base.

## Current state
- modal interaction fixes are in
- 2C4 is in
- 2C5 is in
- catalog-wide customer-facing boilerplate cleanup pass is in
- banned marker audit is clean

## Important truth boundary
Do **not** reintroduce placeholder language, seed notes, rollout notes, or generic internal scaffolding into customer-facing entries.

## Still unfinished
Some later-added entries still have `Unknown` in hard-data fields such as:
- `maxSize`
- `minTank`
- `diet`

That means the next good workload is **factual backfill**, not another vague rewrite pass.

## Good next step
Take the `Unknown` entries file-by-file and backfill missing hard data carefully instead of redoing the whole catalog again.
