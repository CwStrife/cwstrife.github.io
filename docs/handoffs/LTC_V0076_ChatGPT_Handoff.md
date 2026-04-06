# LTC Fish Browser V0.076 — Patch 2 Follow-up

## Scope of this pass
This was a narrow follow-up fix to the popup behavior issues found after V0.074/V0.075 testing.

## What changed
- Reworked the fish detail close button positioning logic so the close button is mounted to `document.body` and positioned from JavaScript against the active modal.
- Desktop close button should now pin to the modal's top-right instead of drifting to the left side.
- Mobile close button stays fixed in the top-right while the detail content scrolls underneath it.
- Shifted mobile fish detail scrolling back to the modal body as the main scroll owner.
- Added broader `touch-action: pan-y` coverage on the mobile detail surface so users can drag-scroll from the page content itself, not just the scrollbar gutter.

## What to check first
1. On desktop, open a fish detail popup and confirm the X is in the top-right.
2. Scroll deep into the popup and confirm the X remains easy to reach.
3. On phone, drag-scroll from the body/content of the fish detail page — not only the scrollbar.
4. Confirm the popup still closes from the X and from clicking outside on desktop.
5. Confirm popup scrolling still feels normal after these changes.

## What this pass did not touch
- Inventory manager layout/filter/dropdown behavior
- Stock # workflow polish
- Any species content changes
