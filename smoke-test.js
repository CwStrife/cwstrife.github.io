# LTC Fish Browser V0.053 — ChatGPT Implementation Handoff

This build continues from V0.052 and focuses on compact/grid card balance, category rail affordance, folder tint visibility, and control polish.

## What changed

### 1) Compact/grid sale pricing reworked
- Sale cards in compact mode no longer use one oversized stacked sale-price block.
- Old/list price is now moved up beside the fish title as a smaller crossed-out inline price.
- The main visible price block stays closer in size to normal cards, which should reduce uneven card height/weight.

### 2) Compact quick-traits made more uniform
- Reef and care traits in compact mode are now laid out as a more consistent 2-column row.
- Each trait is centered and equalized so the row reads less chaotic.

### 3) Search/filter row scaled down slightly on desktop/tablet
- Search box height, filter chip height, and type size were reduced modestly so the top control row stops overpowering the cards.

### 4) Grid/detail toggle redesigned again
- Kept as a single-button toggle, but restyled to feel more polished and less awkward.
- Stronger icon treatment, tighter pill shape, less visual bulk.
- Mobile/landscape sizing tightened further.

### 5) Category shell / folder border tint strengthened
- Category tint now applies to both the category shell and the folder content area.
- Border/glow should read more clearly when changing tabs.
- Folder top seam now uses the active folder border color.

### 6) Category and bundle rail scroll cues improved
- Right-edge arrow is shown whenever the rail is scrollable.
- Arrows were restyled into cleaner vertical pills instead of soft circular blobs.
- Existing fades remain, but the “there is more to the right” cue should be easier to notice.

## Files modified
- `index.html`
- `css/style.css`
- `js/app.js`
- `js/features.js`

## Validation
- `node --check js/app.js`
- `node --check js/features.js`
- `node smoke-test.js`
- Build passed with the same non-fatal warnings as before.

## Still needs real-device verification
Please verify on actual devices/browsers:
- desktop compact sale cards
- desktop compact trait uniformity
- mobile portrait category rail cues
- mobile portrait bundle rail cues
- folder border/tint visibility when switching tabs
- single Grid/Detail toggle feel on desktop and mobile
