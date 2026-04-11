# LTC Fish Browser V0.089 — Inventory Full-Card Photo + Stronger Microinteraction Pass

## What changed
- Inventory Manager cards were rebuilt to use an explicit full-card fish image element instead of relying only on CSS variable paint.
- Inventory-card image hydration now re-syncs after inventory renders and after image fetches complete.
- The first microinteraction pass was strengthened so gauge animations and button interactions are easier to notice in real use.
- Running project docs were expanded in a compact way with dedicated Current State / To-Do / Done / Issues & Lessons summaries so fewer files can still preserve rationale and solved-problem history.
- App/runtime version updated to V0.089.

## What to test first
1. Staff Mode → Inventory
2. Confirm each inventory card shows the fish as the background of the full card, not just a tiny top strip.
3. Confirm controls remain readable over the image.
4. Open a fish detail popup and watch the compatibility gauges.
5. Hover/click tabs/buttons/pills and confirm you can actually notice a response now.

## Important notes
- This build is intentionally focused on the inventory-card photo path plus a stronger effects pass, not a large workflow rewrite.
- The docs keep fewer individual files for GitHub sanity, but preserve rationale in compact summary docs and the master worklog.
