# LTC Fish Browser V0.087 — Inventory Full-Card Photo + Stability Audit

## Summary
This pass focused on two things:
1. Make Inventory Manager cards use the fish image as the full card background.
2. Clean up a few quick-win issues highlighted in the V0.083 Claude review.

## Changes checked
- Inventory card photo state now updates after render and after image hydration.
- Inventory card background treatment now uses the full card rather than a small top hero strip.
- Title/version now use a single `APP_VERSION` constant.
- ES translation completeness warning is resolved.
- Disabled "Per-action rollback only" button is no longer shown when there is nothing to undo.

## Verification
- smoke test: passed
- result: 0 errors, 0 warnings
