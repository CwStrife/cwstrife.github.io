# LTC Fish Browser V0.054 — ChatGPT Fix Pass + Audit

## What changed in V0.054

This pass was intentionally narrow and focused on the items that had been missed or only half-fixed:

### 1. Compact/grid sale pricing was structurally fixed
The old list price is no longer supposed to live inside the same oversized stacked sale block.

New compact sale-card structure:
- fish name row
- crossed-out old price beside the name
- small SALE tag beside the old price
- main sale price in the normal price area

This is meant to stop sale cards from becoming taller/heavier than normal cards.

### 2. Compact quick-trait pills were made more uniform
The two compact traits now use a stricter equal-width 2-column layout with fixed height and centered text.

Goal:
- cleaner alignment
- less random width drift
- more consistent row height across cards

### 3. Category and bundle rails were reinforced as horizontal scrollers
The earlier “it still looks the same” complaint was valid.

This pass added:
- stronger right-edge fade
- stronger right-side scroll cue
- mobile “More” label on the right arrow pill
- scroll-snap on category and bundle rails
- resize/load observers so the rail UI recalculates after layout settles

### 4. Project cleanup
Removed old backup files and stale prior handoff docs from the project root so the package is cleaner and less confusing.

## Files modified
- `index.html`
- `js/app.js`
- `css/style.css`

## Files removed from project root
- old `*.bak` files
- stale V0051/V0052/V0053 handoff markdown files

## What I checked

### Syntax / build checks
- `node -c js/app.js` ✅
- `node -c js/features.js` ✅
- `node smoke-test.js` ✅

Smoke test result after edits:
- 0 errors
- 2 warnings (same non-fatal warnings as before)

### Manual code audit focus
I re-checked the areas that kept being missed:
- card sale-price rendering in `js/app.js`
- compact-card trait layout in `css/style.css`
- category scroll cue logic in `js/app.js`
- category/bundle rail cue styling in `css/style.css`
- project clutter / stale file cleanup

## Important honest note
I did not physically test this on your exact phone/browser.
This pass is based on code-level fixes plus build verification, not live device screenshots yet.

So the next real-world checks should be:
1. desktop compact sale cards
2. desktop compact quick-trait uniformity
3. mobile portrait category rail cue visibility
4. mobile portrait bundle rail cue visibility
5. confirm the whole page no longer feels like the category rail is “just cut off” with no clue

## Current technical-debt audit
These are still real issues in the codebase:

- CSS `!important` count is still very high: about **298**
- `@media` query count is still very high: about **49**
- inline `style=""` usage is still high across HTML/JS: about **77**
- compact-mode rules still exist in multiple places in the stylesheet
- modal layout still has desktop-first complexity in `app.js`
- features/bundles still rely on some inline layout markup

That means V0.054 is a targeted functional improvement, **not** a full architecture cleanup.

## Other things to do next
These are the next high-value items after you test V0.054:

1. **Desktop/tablet compact card polish**
   - decide whether compact cards should keep exactly 2 quick traits, or add a third lightweight trait
   - tighten vertical rhythm so cards feel more premium

2. **Mobile detail modal QA**
   - verify portrait modal still scrolls fully top-to-bottom
   - verify the close X remains easy to access while scrolling

3. **Category rail polish**
   - if the new cue is still too subtle, escalate to a stronger “More” treatment or a visible partial next-tab peek

4. **Compact vs detailed card contrast**
   - verify the two modes feel meaningfully different on all breakpoints

5. **CSS cleanup pass**
   - consolidate duplicate compact-mode rule blocks
   - reduce `!important`
   - pull more inline styles into shared classes

6. **Bundle row polish**
   - if the “More” cue is still weak, convert bundle cards to a more obvious snap-strip pattern

7. **Sale-price design pass**
   - if the new split layout is still not visually balanced enough, move the old price to an even lighter secondary treatment

## What to tell Claude later
If Claude resumes from here, the next pass should be:
- verify V0.054 on a real phone and desktop first
- do not re-break the sale-price structure
- do not remove the rail observers
- do not reintroduce backup files and stale handoff files into the site root
- focus next on CSS consolidation, not more patch stacking
