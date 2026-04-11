# LTC Fish Browser V0.062 — Modal Background Fix + 2C3 Predator/FOWLR Pass

## What changed
- Fixed the detail modal background so `detail-bg.mp4` is mounted inside the modal body instead of behaving like it is replacing the main page background.
- Kept `reef-bg.mp4` as the main browse background.
- Dimmed the page behind the modal more strongly so the main page no longer feels weirdly transparent.
- Added a taller, scroll-linked detail video layer so the modal background keeps showing as the user scrolls instead of falling into flat dark blue/black.
- Improved primary image lookup so cards/details also consider staff photos as first-class primary images.
- Started **2C3** factual/content cleanup for predator/FOWLR categories:
  - Triggerfish
  - Puffers / boxfish / cowfish
  - Eels
  - Lionfish
  - Other Fish oddballs / predator-adjacent entries
- Scrubbed the repeated tang buying-guidance boilerplate that was still reading like filler on entries like Gem Tang.

## Notes
- This pass keeps the modal layout intact. It is not a redesign.
- The modal background video now belongs to the modal content area only.
- If `detail-bg.mp4` is missing, the modal will just use the normal dark layered background.

## Verification run
- `js/app.js` syntax ✅
- `js/features.js` syntax ✅
- `data/catalog-base.js` syntax ✅
- `data/fish.js` syntax ✅
- smoke test ✅
- Result: 0 errors, 1 existing translation warning

## What to check first
1. Open a fish detail modal and scroll well past the top section.
2. Confirm the modal still shows the detail video look while scrolling instead of dropping into plain black/dark blue.
3. Confirm the main page behind the modal still uses `reef-bg.mp4` and is more solidly dimmed.
4. Check that fish cards/details are showing real images again where available.
5. Spot-check a few 2C3 entries, especially triggers, puffers, eels, lionfish, and oddballs.

## Phase checklist
- ✅ 2A foundation/schema cleanup
- ✅ 2B local food system completed
- ✅ 2C1 common reef/community fish
- ✅ 2C2 active reef fish
- ✅ 2C3 predator / FOWLR fish started and applied in this build
- ❌ 2C4 cleanup crew / common invert rewrite
- ❌ 2C5 anemones / clams / specialist rewrite
