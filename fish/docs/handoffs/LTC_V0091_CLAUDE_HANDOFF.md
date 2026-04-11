# LTC Fish Browser — Claude Handoff (V0.091 coordination pack)

## What this is
A customer-facing fish browser plus a staff-side inventory tool for Low Tide Corals & Aquatics. The project is working, but it is now in the awkward middle stage where the foundation is solid and the remaining work is polish, UX cleanup, content accuracy, and future persistence architecture.

## Current build to use
Use the files in this zip as the latest working handoff build. Functional state is roughly V0.091:
- inventory button was repaired after a helper-path regression
- yellow `QUARANTINE` overlay now exists in staff mode like `SOLD`
- tang content pass has started
- species count still loads at 448
- smoke test was passing at last ChatGPT pass

## What is already working well
- Fish browser loads and is broadly usable
- Staff mode exists with sold / hold / quarantine / loss flows
- Recent Changes and restore paths exist
- Inventory cards now show fish imagery on-card again
- A first motion pass exists and gauges are the strongest part of it
- Documentation structure is now much cleaner than earlier versions

## Highest-priority unresolved issues
1. **Category / folder rail UX is still not solved cleanly**
   - scrolling is still not as convenient as it should be
   - there are breakpoint/layout cases where the rail can feel awkward or double-row-ish
   - it still needs a cleaner “obviously horizontal and easy to use” treatment

2. **Fish popup card still has dead / wasted space**
   - layout is better than before, but parts of the modal still breathe too much in the wrong places
   - mobile and desktop still need tighter content balance

3. **Popup live video is not working**
   - the code still references `detailBgVideo` / `detail-bg.mp4`
   - the package currently does not contain the actual video file assets, so this likely cannot work as-is
   - please verify whether the intended effect should be restored, replaced, or removed cleanly

4. **Animations still need a more useful pass**
   - too many prior attempts drifted into shimmer / sheen / metallic behavior
   - desired direction is: load-in motion for pills/tags, tactile click feedback for buttons, useful motion on interaction, not endless ambient chrome
   - gauges are the best reference lane right now

5. **Fish-card text still needs a serious source-backed cleanup pass**
   - much better than earlier builds, but not final
   - remaining risk is family-template phrasing and occasional retail-script tone
   - important goal: accurate, useful customer guidance without filler or copy-paste vendor language

6. **Staff mode convenience still needs work**
   - needs to stay friendly for non-technical employees
   - inventory editing can still get dense / busy
   - more obvious quick actions and simpler layouts would help

## Short task list for Claude
Please focus on the following in order:

### Task 1 — Category / folder rail cleanup
- make category scrolling feel obvious and convenient
- prevent weird multi-row / wrap behavior at awkward widths
- keep the folder-tab visual style, but make the UX more reliable

### Task 2 — Fish popup layout cleanup
- remove dead space
- make the hero/content balance tighter on desktop and mobile
- keep close / scroll behavior stable

### Task 3 — Popup video diagnosis
- inspect why the popup video is not appearing
- if files are missing, say so clearly
- either restore the effect properly or remove the broken path cleanly

### Task 4 — Useful motion polish
- reduce or eliminate pointless constant shimmer
- keep pills/tags as a one-time load-in moment
- use click/tap feedback for buttons and controls
- preserve tasteful gauge motion

### Task 5 — Fish content pass
- continue the species cleanup with real source-backed husbandry improvements
- prioritize tangs, wrasses, gobies/blennies, and other high-traffic families
- keep language original, clear, and customer-useful

## Guardrails
- Do not destabilize the popup close/scroll behavior again.
- Do not make the UI louder just because motion exists.
- Do not reintroduce browser-only assumptions for future persistence.
- Keep staff workflows simple enough for non-technical store employees.

## Architecture reality to preserve
Final website + in-store + POS use cannot rely on browser-local persistence alone. Long term, sold status, quantity, notes, and media need a backend/shared source of truth. Shopify/POS sync is expected later, but Shopify access is not available yet.
