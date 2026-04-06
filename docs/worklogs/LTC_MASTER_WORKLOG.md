# LTC Fish Browser — Master Worklog

## V0.062
- modal background video reworked so `detail-bg.mp4` stayed associated with the popup instead of the main browse page
- main browse page kept `reef-bg.mp4`
- image recovery improved by letting local/store photos count as primary sources
- 2C3 predator / FOWLR pass applied
- later user QA found a regression:
  - popup would not scroll correctly
  - X button stopped working correctly
  - outside-click dismiss still worked

## V0.063
### Functional fixes
- popup shell hardened so the detail modal body scrolls again
- close button raised above the content stack so the X is clickable again
- detail-video styling kept inside the popup presentation without breaking interaction

### Content pass completed
- 2C4 cleanup crew / common invert rewrite completed for:
  - shrimp
  - crabs
  - snails / conchs / nudibranchs
  - urchins
  - starfish / serpent stars
  - general invert support items / worms / cucumbers / microfauna packs

### Content cleanup
- removed remaining 2C4 placeholder seed text such as:
  - `Needs enrichment`
  - `Roster seed`
  - `catalog expansion seed`
  - `not fully enriched`
- clarified specialist sales where honesty matters most:
  - harlequin shrimp
  - berghia nudibranch
  - linckia / fromia stars
  - sea cucumbers
  - sea hare
  - pod / microfauna support packs

### Verification
- smoke test passed
- 0 errors
- 1 existing translation warning
- 2C4 placeholder scan clean

## V0.064
### Content pass completed
- 2C5 anemones / clams / specialist rewrite completed for:
  - anemones
  - clams
  - flame scallop specialist follow-through

### 2C5 quality upgrades
- designer bubble-tip morphs now read as real `Entacmaea quadricolor` morphs instead of generic seed cards
- long tentacle, magnifica, and sebae now distinguish placement, tank maturity, and risk more honestly
- rock flower and maxi mini now read like real mixed-reef offerings instead of placeholder profiles
- crocea, derasa, and squamosa now distinguish giant-clam placement and long-term size more clearly
- flame scallop copy now explicitly warns that it is a specialist filter-feeding animal that often starves in ordinary mixed reefs

### Audit additions
- added `content-audit.js` so filler / seed-marker scanning can be repeated on demand
- added `LTC_V0064_CONTENT_AUDIT.md` as the current audit snapshot
- confirmed `Anemones` + `Clams` are clean for the known marker phrases:
  - `Needs enrichment`
  - `Roster seed`
  - `catalog expansion seed`
  - `not fully enriched`
  - `Look for look for`

### Important honesty note
- broader catalog scan shows many legacy seed / filler markers still remain outside 2C4 / 2C5
- current global audit count: **279 entries** still contain marker phrases in older category files
- do **not** claim the whole 448-entry catalog is fully customer-clean yet

### Verification
- smoke test passed
- 0 errors
- 1 existing translation warning
- 2C5 placeholder scan clean

## Next planned workload
### Catalog-wide truth / filler scrub
- use `LTC_V0064_CONTENT_AUDIT.md` as the roadmap
- prioritize the heaviest remaining files first:
  - wrasses
  - gobies / blennies
  - angelfish
  - clownfish
  - tangs
- once the older seed entries are cleaned, do random-card QA across the whole catalog

## V0.065
### Catalog-wide cleanup completed
- performed a catalog-wide customer-facing text cleanup across the remaining legacy seed profiles
- cleaned **279 previously flagged entries** across the older fish-category files
- removed the old placeholder / seed / rollout language from the live profile copy
- normalized leftover scalar placeholders from `Needs enrichment` / `—` to `Unknown` so unfinished hard-data fields no longer read like internal notes

### Sections completed
- ✅ angelfish
- ✅ anthias
- ✅ basslets / dottybacks
- ✅ butterflyfish
- ✅ cardinalfish
- ✅ clownfish
- ✅ damsels
- ✅ eels
- ✅ gobies / blennies / jawfish / dragonets
- ✅ hawkfish
- ✅ lionfish
- ✅ other fish / oddballs
- ✅ puffers / boxfish / cowfish
- ✅ rabbitfish
- ✅ shrimp residual cleanup
- ✅ snails residual cleanup
- ✅ tangs
- ✅ triggerfish
- ✅ urchins residual cleanup
- ✅ wrasses

### What changed in the copy
- replaced seed-style `facts` blocks with customer-facing compatibility / care notes
- rewrote broken `headerSummary` lines that had duplicate wording or placeholder grammar
- cleaned repeated `Look for look for` / `Look for use the` style errors
- replaced obviously internal filler language such as rollout / verification notes with real customer-facing copy
- tightened subgroup wording where generic category text was misleading:
  - dragonets / mandarins
  - jawfish
  - tusk and larger wrasses
  - filefish / anglers / waspfish / comet-type oddballs

### Audit status
- global banned-marker phrase audit now returns **0 hits** across all 448 species entries
- current hard-data gap still remaining: **111 entries** still show `Unknown` for one or more scalar fields like `maxSize`, `minTank`, or `diet`
- important distinction:
  - customer-facing filler / cringe / internal-note text is scrubbed from the profiles
  - some late-added profiles still need future factual backfill for missing hard data

### Verification
- smoke test passed
- 0 errors
- 1 existing translation warning (`Sort`, `Compare`, `Quarantine` missing from ES)

## V0.066
### Core factual backfill completed
- filled the remaining **111 late-added fish profiles** that were still missing one or more core factual fields
- core fields now backfilled across the full 448-entry catalog:
  - scientific name
  - max adult size
  - minimum tank size
  - diet
- fixed the audit gap from V0.065 where empty-string scientific names were not being counted

### Additional text cleanup
- corrected lingering awkward/internal phrasing in a few entries that still read too much like staff shorthand or sales scripting
- fixed the doubled-word issue in `zebra-hermit-crab`
- toned down remaining `kiosk` / `should sell as` phrasing in a few support-item and fish entries
- corrected several blenny / fang-blenny profiles so the behavior copy now better matches the actual fish type

### Audit status
- banned marker phrase audit: **0 hits**
- doubled-word scan: **0 hits**
- empty / `Unknown` core factual fields (`scientific`, `maxSize`, `minTank`, `diet`): **0 remaining**

### Verification
- smoke test passed
- 0 errors
- 1 existing translation warning (`Sort`, `Compare`, `Quarantine` missing from ES)

### Important scope note
- this pass focused on cleaning customer-visible copy and backfilling the main husbandry facts that were still blank
- `stockSize` remains a shop/inventory-style field and still has many `Unknown` values by design unless store-specific sizing is actually known


## V0.067
### Staff-side inventory workflow pass
- added a dedicated **Inventory Manager** overlay for staff mode so the shop can edit livestock values without hunting through customer-facing cards
- added **local browser persistence** for staff changes so local edits survive refresh/reopen on that device
- added **export / import / reset** tools for staff edit backups
- added staff controls for:
  - price
  - tank code
  - in-store stock size
  - staff note
  - store photo upload
  - sold / loss / restock state
- added **mobile-friendly quick-edit controls inside fish detail popups** so tablet / phone staff can make changes more easily

### Stock-size handling cleanup
- converted legacy `stockSize: "Unknown"` placeholders to blank stored values
- stock size now displays as **`—`** until the store sets a real local size
- restock flow now includes a stock-size picker

### Staff bug fixes
- fixed the restock path so it clears the correct loss flag (`lossAt`) instead of the wrong field
- staff photo uploads now persist into local saved staff data
- staff edits now refresh the inventory manager after each change

### Verification
- smoke test passed
- 0 errors
- 1 existing translation warning (`Sort`, `Compare`, `Quarantine` missing from ES)
- content audit still clean for banned marker phrases and doubled-word issues

## V0.068
### Staff workflow upgrade pass
- kept the earlier staff-mode foundation from V0.067, but shifted the next priority away from a quarantine dashboard / QR ideas and into **real day-to-day store workflow fields**
- added inventory controls for:
  - **quantity on hand**
  - **hold / reservation status**
  - **reserved-for name / note**
  - **arrival date**
  - **vendor / source**
- added these controls in both places staff are most likely to use them:
  - **Inventory Manager**
  - **fish detail popup quick edits**

### Inventory behavior improvements
- sold / loss actions now behave better for multi-animal entries:
  - if quantity is greater than 1, sold / loss decrements the count instead of immediately wiping the entry out of stock
  - if quantity drops to 0, the entry flips out of stock as expected
- restock flow now captures more useful store info in one pass:
  - price
  - tank
  - stock size
  - quantity
  - arrival date
  - vendor / source
- inventory cards now show a fuller snapshot:
  - price
  - tank
  - stock size
  - quantity
  - hold status
  - arrival date
  - vendor
  - photo source
  - updated timestamp / last action

### Inventory manager visibility improvements
- added a top summary strip for the current inventory view showing:
  - SKU count
  - estimated live count
  - held / reserved count
  - entries missing price
  - entries using wiki/default image only
- added a **Held / reserved** filter option
- kept everything local-browser based so the store can still export / import the JSON without needing a backend yet

### Scope note
- no expanded quarantine dashboard was added in this pass
- no QR workflow was added in this pass
- this was intentionally focused on practical daily shop edits that are more likely to matter immediately

### Verification
- smoke test passed
- 0 errors
- 1 existing translation warning (`Sort`, `Compare`, `Quarantine` missing from ES)
- content audit still clean for banned marker phrases and doubled-word issues

## V0.069 — Stock # staff pass + random content audit (2026-04-05)
- Added optional **Stock #** field for livestock so small-business inventory can use simple stock numbers instead of SKU language.
- Inventory Manager now supports a **Missing store data** filter keyed to price, tank, qty, stock #, or store photo.
- Expanded customer-facing cleanup layer so older sales-floor/internal phrasing is normalized before display.
- Ran a deterministic 50-entry random audit across mixed categories; sample passed with no marker phrases, no doubled words, and no sales-floor phrasing after display cleanup.
- Keeps reservation/hold status staff-only in this build; no public reserve flow added.


## V0.070 — Staff recovery / persistence / undo pass (2026-04-05)
- Added **undo + per-fish recent change history** for staff edits, with an **Undo Last Change** control in Inventory Manager and per-item Undo controls.
- Added direct **Stock # editing** where staff actually touch the app most: cards, popups, and Inventory Manager.
- Removed **compare** behavior from staff mode so staff UI stays focused on operational actions instead of customer compare tools.
- Fixed the **Missing store data** filter path and the matching summary card count in Inventory Manager.
- Hardened staff persistence by switching to **IndexedDB first** with **localStorage fallback**, so sold/restocked/edited records are more likely to survive refreshes even when staff photos are added.
- Added **fish image URL caching** so the browse grid can recover faster after refresh instead of relying on a fresh image fetch pass every time.
- Hardened modal scrolling with extra mobile-safe overflow rules and touch scrolling support.
- Expanded customer-facing display cleanup so overview/diet/origin card text uses the cleaned display path instead of raw copy where applicable.
- Added future-integration notes for:
  - manual livestock entry
  - Shopify sync / API import path
  - reservation safety / deposit or trusted-customer gating
- Verification this pass:
  - smoke test passed
  - 0 errors
  - 1 existing translation warning (`Sort`, `Compare`, `Quarantine` missing from ES)
  - 50-card deterministic display audit passed with 0 customer-facing marker/phrasing hits


## V0.071 — Staff UX cleanup + restore actions pass (2026-04-05)
- Added **explicit restore availability actions** so staff can quickly reverse sold/loss states without hunting through history. This shows as calm aqua restore buttons such as **Undo Sold**, **Undo Loss**, or **Restore Stock** depending on the item state.
- Kept the generic Undo path, but made sold/loss recovery more obvious on cards, popups, and Inventory Manager.
- Added **click-off-screen close** behavior for Inventory, Foods, and Analytics overlays so staff can dismiss those panels without only targeting the top-right close button.
- Added a real **All categories** inventory filter alongside status filtering so staff can filter by tangs, gobies-blennies, wrasses, shrimp, crabs, etc.
- Expanded inventory search matching to include category labels, stock numbers, aliases, vendor, reserved-for names, and scientific names.
- Reworked Inventory Manager cards so the editable field tiles are now **clickable themselves**, and each tile has its **edit button directly underneath the value** instead of pushing all actions to one large bottom button wall.
- Demoted **Food Settings** from the main top-right staff header. It now stays reachable from Inventory Manager instead of taking prime header space.
- Strengthened modal close placement rules so the fish-profile **X stays anchored top-right** more reliably across layouts.
- Verification this pass:
  - smoke test passed
  - 0 errors
  - 1 existing translation warning (`Sort`, `Compare`, `Quarantine` missing from ES)
  - note: browser/device click-through behavior still needs user confirmation in real use


## V0.072
- made staff rollback history snapshots leaner so sold/loss/quarantine/hold undo state is more likely to persist across refresh/re-entry
- added explicit rollback actions: Undo Sold, Undo Loss, Undo Quarantine, Undo Hold
- reduced image fetch burst load from all-at-once to a small concurrency queue and retry-on-error flow
- forced modal close button positioning with JS + CSS so it stays top-right more reliably
- added desktop modal hero shell so the image and header/stats read like one grouped top section
- darkened/styled select dropdowns to reduce the white native dropdown feel


## V0.073
### Patch 1 only — staff rollback persistence hardening
- narrowed this pass to the first outstanding patch only: **undo/restore + persistence**
- replaced the old generic-toolbar undo emphasis with **persistent per-fish rollback actions** for operational changes:
  - Undo Sold
  - Undo Loss
  - Undo Quarantine
  - Undo Hold
- added dedicated persisted rollback snapshots for those operational changes so the rollback target survives refresh / re-entering staff mode more reliably than the earlier generic undo path
- kept history chips, but made them secondary to explicit operational rollback buttons
- updated the inventory toolbar copy so staff are told rollback is handled per fish rather than through one universal undo button

### Carry-forward notes
- this patch intentionally does **not** try to fix popup X placement, modal layout, image reload, or dropdown issues yet; those remain for patches 2 and 3
- future website navigation requirement logged: the LTC logo should eventually go to the main LTC store homepage once that broader site exists


## V0.074
### Patch 2 only — popup close / modal hero / image reload pass
- narrowed this pass to the second outstanding patch only: **popup X placement + popup top-section layout + image reload reliability**
- moved the fish-profile **X** to the overlay layer and force-positioned it as a fixed top-right control with safe-area handling, so it is no longer dependent on modal layout flow
- strengthened the close-button CSS with explicit `right`, `inset-inline-end`, and higher z-index rules to reduce the top-left regression seen in browser testing
- unified the **mobile** fish-profile top section so the image, name/header, and key stats read as one grouped hero block instead of disconnected boxes
- kept the desktop hero grouping and gave the mobile stack the same grouped-shell treatment for a more consistent card-detail feel
- changed startup order so **staff edits hydrate before render/loadAllImages**, which should improve refresh behavior when locally edited records and photos exist
- reduced image queue concurrency again and added per-target retry tracking, `decoding='async'`, and a lighter reload path so broken image recovery should be less fragile after refresh
- verification this pass:
  - smoke test passed
  - 0 errors
  - 1 existing translation warning (`Sort`, `Compare`, `Quarantine` missing from ES)

### Carry-forward notes
- this patch intentionally does **not** touch patch 3 items yet: dropdown/select options, inventory layout ergonomics, category-filter polish, or broader stock-field UI refinement
- next step after this is **Patch 3 only**, then user tests patch 1 + 2 + 3 together
