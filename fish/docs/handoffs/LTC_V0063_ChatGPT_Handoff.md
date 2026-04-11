# LTC Fish Browser V0.063 — Modal Interaction Fix + 2C4 Cleanup Crew / Inverts Pass

## What changed
- Reworked the fish detail modal shell so the popup is scrollable again without the background-video layer breaking interaction.
- Raised and isolated the main close button so the **X button** is clickable again instead of being trapped behind the modal content.
- Kept the detail video inside the popup presentation while tightening the modal body overflow behavior.
- Completed **2C4** cleanup / common invert rewrite pass across the placeholder-heavy entries in:
  - `Shrimp`
  - `Crabs`
  - `Snails`
  - `Urchins`
  - `Starfish / serpent stars`
  - `Inverts` utility/support entries
- Replaced remaining 2C4 placeholder seed text like `Needs enrichment`, `Roster seed`, and generic catalog-expansion boilerplate with customer-facing copy.
- Left **2C5 intentionally deferred** for the next workload:
  - anemones
  - clams
  - flame scallop / specialist follow-through

## 2C4 focus notes
This pass specifically targeted the customer-facing weak spots that were still leaking filler / seed text in the invert side of the catalog.

Highlights:
- shrimp entries now better distinguish:
  - cleaners vs fire shrimp
  - coral banded types
  - pistol shrimp / goby-burrow behavior
  - harlequin as a specialist starfish feeder
  - mysid culture as a live-food / refugium support item instead of fake display livestock copy
- crab entries now better distinguish:
  - hermits vs mithrax-style algae crabs
  - porcelain / anemone porcelain behavior
  - arrow / decorator / pom pom / sally lightfoot / strawberry crab cautions
- snail entries now better distinguish:
  - algae grazers vs scavengers
  - sand-bed conchs
  - berghia as **Aiptasia-only** specialist
  - lettuce nudibranch as a delicate oddball, not a miracle cleanup fix
- urchins now better distinguish:
  - carry/decorate types
  - long-spine caution and scale
  - pencil urchin rougher reef fit
- starfish now better distinguish:
  - hardy serpent / brittle types
  - risky decorative linckia / fromia types
  - chocolate chip as non-reef-safe
  - pod culture as a support product, not livestock fluff
- utility invert entries now better distinguish:
  - cucumbers
  - coco / feather duster worms
  - copepods / amphipods / refugium packs
  - sea hare as a tactical algae animal, not permanent casual livestock

## Audit / verification run
- `js/app.js` syntax ✅
- `js/features.js` syntax ✅
- `data/catalog-base.js` syntax ✅
- `data/fish.js` syntax ✅
- smoke test ✅
- Result: **0 errors, 1 existing translation warning**

Additional content audit:
- 2C4 files scanned for:
  - `Needs enrichment`
  - `Roster seed`
  - `catalog expansion seed`
  - `not fully enriched`
- Result: **0 remaining hits in 2C4 files** ✅
- 2C5 still has placeholder content and is deliberately left for the next pass.

## What to check first
1. Open a fish detail popup.
2. Scroll deep into it.
3. Confirm the popup scroll works again.
4. Confirm the **X button** works again.
5. Confirm clicking outside still closes the popup.
6. Confirm the popup still keeps the detail-video feel instead of dropping into a dead plain background.
7. Spot-check random 2C4 entries, especially:
   - Harlequin Shrimp
   - Tiger Pistol Shrimp / Randall's Pistol Shrimp
   - Pom Pom Crab
   - Sally Lightfoot Crab
   - Berghia Nudibranch
   - Queen Conch
   - Long Spine Urchin
   - Blue Linckia Starfish
   - Tiger Tail Sea Cucumber
   - Sea Hare

## Phase checklist
- ✅ 2A foundation/schema cleanup
- ✅ 2B local food system completed
- ✅ 2C1 common reef/community fish
- ✅ 2C2 active reef fish
- ✅ 2C3 predator / FOWLR fish
- ✅ 2C4 cleanup crew / common invert rewrite
- ⏸️ 2C5 anemones / clams / specialist rewrite deferred to next workload
