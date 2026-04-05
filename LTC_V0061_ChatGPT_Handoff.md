# LTC Fish Browser V0.061 — ChatGPT Handoff

This build continues from the V0.059 codebase and applies the fixes that were requested after the modal/background and image issues were reported.

## What changed in V0.061

### 1. Detail modal background video behavior fixed
- `reef-bg.mp4` remains the main page background.
- `detail-bg.mp4` now renders **inside the fish detail modal only**.
- The page behind the modal is dimmed more solidly so it no longer feels oddly transparent.
- The modal itself now owns the detail video visually instead of the full-screen overlay.

### 2. Fish card image population recovery
- The card/detail image lookup now tries multiple candidates per fish instead of relying almost entirely on `photoTitle`.
- Current order:
  1. `photoTitle`
  2. scientific name
  3. fish name
  4. aliases
  5. underscore/space variants of all of the above
- Local thumb overrides still work and now also populate the per-fish image cache.

### 3. Phase 2C2 completed — active reef fish content pass
This pass enriched the following category files:
- `data/species/tangs.js`
- `data/species/angelfish.js`
- `data/species/wrasses.js`
- `data/species/anthias.js`
- `data/species/hawkfish.js`
- `data/species/butterflyfish.js`
- `data/species/rabbitfish.js`

For those categories, the pass normalized/filled:
- `headerSummary`
- `behavior`
- `feedingNotes`
- `buyingGuidance`
- `recognitionNotes`

These entries should now read more like real store guidance instead of mixed template/generic text.

## Files changed
- `index.html`
- `css/style.css`
- `js/app.js`
- `js/features.js`
- `data/species/tangs.js`
- `data/species/angelfish.js`
- `data/species/wrasses.js`
- `data/species/anthias.js`
- `data/species/hawkfish.js`
- `data/species/butterflyfish.js`
- `data/species/rabbitfish.js`

## Verification run
- `node --check js/app.js` ✅
- `node --check js/features.js` ✅
- `node --check data/catalog-base.js` ✅
- `node --check data/fish.js` ✅
- `node smoke-test.js` ✅
- Result: **0 errors, 1 existing translation warning**

## What to check first on real devices
1. Main page still shows `reef-bg.mp4`.
2. Fish detail modal shows `detail-bg.mp4` only inside the modal.
3. The page behind the modal no longer feels weirdly transparent.
4. Fish cards and detail headers are showing real images again.
5. Tangs / angelfish / wrasses / anthias / hawkfish / butterflyfish / rabbitfish profiles read more like actual in-store guidance.

## Phase checklist
- ✅ 2A foundation/schema cleanup
- ✅ 2B food system completed locally
- ✅ 2C1 common reef/community fish completed in prior pass
- ✅ 2C2 active reef fish completed in this pass
- ❌ 2C3 predator / FOWLR fish factual rewrite
- ❌ 2C4 cleanup crew / common invert rewrite
- ❌ 2C5 anemones / clams / specialist rewrite
