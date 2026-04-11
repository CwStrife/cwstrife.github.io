# LTC Fish Browser V0.087 — Inventory Full-Card Photo Pass + Stability Cleanup

## What changed
- Rebuilt Inventory Manager cards so the fish photo is applied to the **entire card background**, not just a small hero strip.
- Added direct inventory-card photo state syncing so cards update after fish images are fetched or rehydrated.
- Added a cleaner no-photo fallback state so cards do not show the giant `LTC` placeholder block.
- Added `APP_VERSION` handling so the document title now reflects the shipped build version automatically.
- Fixed the lingering ES translation warning by adding the missing `Sort`, `Compare`, and `Quarantine` keys.
- Removed the disabled **Per-action rollback only** button when no rollback exists.

## Why this pass happened
The prior inventory-card attempts were visually wrong:
- one pass only added a small media strip
- another pass still left placeholder-heavy cards
- the live result still did not read as "fish photo behind the whole card"

This build changes the inventory cards to use the fish photo as the full card background and updates that background again after image hydration runs.

## What to check first
1. Open **Staff Mode → Inventory**.
2. Confirm each fish card uses the fish photo as the **entire card background**.
3. Confirm cards without a loaded image fall back cleanly without the giant `LTC` block.
4. Confirm controls remain readable over the photo background.
5. Confirm the page still loads normally and does not dump raw script/code into the browser.

## Verification run
- smoke test passed
- 0 errors
- 0 warnings
