# LTC Fish Browser — Current State (V0.089)

## What this project is
A customer-facing fish browser plus a staff-facing inventory, history, and restore tool for Low Tide Corals & Aquatics.

## Stable baseline
Use **V0.089** as the current audited working baseline. It is based on the cleaned V0.088 package with additional fixes for inventory-card full-background fish images and a more visible first-pass microinteraction layer.

## What is currently stable
- 448 species load correctly.
- Smoke test passes cleanly with **0 errors, 0 warnings**.
- EN/ES translations are complete.
- Staff restore flows exist for sold, loss, quarantine, and hold.
- Recent Changes exists as a top-level staff workflow entry.
- Sale history exists and can be reused during restock flows.
- Fish popup X / outside-click / mobile scroll are currently considered stable enough to keep unless a new regression is reproduced.

## Active items still worth checking in live use
- Inventory Manager fish-photo full-card backgrounds in the real deployed environment.
- Whether the stronger button/gauge microinteractions now read clearly enough in actual use.
- Staff density/usability on tablet and phone-sized screens.

## Principles to preserve
- Staff UX must stay easy for non-technical store staff.
- Species information trust matters as much as visuals.
- Missing **species/core** data and missing **store setup** data must stay separate concepts.
- Effects should feel alive and premium, never noisy or gimmicky.

## Future notes to preserve
- Clicking the LTC logo should eventually route to the main LTC store homepage when the larger site exists.
- Continue re-reviewing fish detail accuracy later and expand entries as the catalog grows.
- Shopify/POS sync should not be attempted until field mapping and conflict rules are written down.
