# LTC Fish Browser V0.081 — Workflow and UI Audit

## Scope of this pass
- Fish-detail desktop layout rollback for compatibility gauges
- Sale-price visibility in detail header
- Staff restore guidance for Remove (Loss)
- Recent Changes access from the top staff header
- More visual inventory cards
- Missing-species vs missing-store filter split

## Smoke test
- Passed
- 0 errors
- 1 translation warning (existing)

## Manual-review targets
- Confirm desktop fish detail looks like the simpler pre-V0.080 structure.
- Confirm sale fish show the original crossed-out price near the fish name.
- Confirm staff can reach Recent Changes without opening Inventory first.
- Confirm Remove (Loss) no longer feels like a dead end.
- Confirm inventory fish cards are easier to identify visually.
- Confirm Missing species data count/filter now refers only to species/core database gaps.
