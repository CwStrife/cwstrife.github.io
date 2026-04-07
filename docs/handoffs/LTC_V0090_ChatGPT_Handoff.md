# LTC Fish Browser — ChatGPT Handoff (V0.090 first pass)

## What changed in this pass
- Baked the fish text cleanup into the actual species source files instead of relying on the runtime `stripTemplateNoise` rewrite chain.
- Reduced ambient “sheen everywhere” behavior in the UI.
- Kept gauges as the hero motion lane.
- Converted button/filter/sort interactions toward click feedback with ripple + subtle bubble burst + short press flash.
- Changed modal pills to load-in pop motion instead of endless shimmer.
- Kept the mode toggle sweep, but slowed and softened it.
- Left image persistence/backend sync for a later architecture pass.

## Current status
- Smoke test passes with 0 errors / 0 warnings.
- Species count still loads at 448.
- Runtime placeholder phrase scan is clean.
- Inventory-card image issue was already considered resolved before this pass.

## What still needs work
1. Do a source-backed fish content enrichment pass by category, starting with the most templated families and highest-traffic fish.
2. Review remaining repetitive phrasing so species read more individual and less family-template driven.
3. Define backend field ownership / sync contract before Shopify or POS work begins.
4. Keep animation polish tasteful and verify on the real deployed target.
