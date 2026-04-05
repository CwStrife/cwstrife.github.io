# LTC Fish Browser V0.070 — Staff recovery + persistence + undo pass

## Why this pass happened
This build responds directly to the reported issues after V0.069 testing:
- staff actions not persisting after refresh
- fish pictures feeling lost after refresh
- sold/loss actions lacking a real undo path
- staff mode still carrying compare UI
- stock # editing not being obvious enough
- popup scroll breaking again

## What changed
### Staff undo/history
- Added **Undo Last Change** in Inventory Manager.
- Added **per-item Undo** buttons on cards, popups, and inventory cards.
- Added a **recent change history strip** per fish so staff can see the latest actions and roll them back.

### Persistence hardening
- Staff edits now save to **IndexedDB first** with **localStorage fallback**.
- This is meant to survive refreshes better than storing everything in localStorage alone, especially once store photos are involved.
- Image URLs are now cached locally so the catalog can recover fish pictures faster after refresh.

### Staff workflow cleanup
- Added direct **Stock #** edit buttons in the main staff action surfaces.
- Removed customer **Compare** controls from staff mode.
- Fixed the **Missing store data** filter / summary behavior.

### Modal / popup hardening
- Added extra touch-scroll / overflow rules to make the fish popup more stable again on phone / tablet sized layouts.
- Detail video remains inside the modal presentation while keeping pointer events off the video layer itself.

### Customer-facing text cleanup
- The card-level display path now cleans overview / diet / origin text more consistently before showing it.
- This reduces the chance of customers seeing raw awkward phrasing that should have been normalized first.

## What was not built yet
- No full **manual livestock entry** flow yet.
- No **Shopify API sync** yet.
- No customer-facing reservation flow.

Those are now documented for later inside `docs/notes/`.

## What to test first
1. Enter **Staff Mode**.
2. Mark one fish sold, refresh the page, and confirm the change remains.
3. Undo that change and confirm the fish comes back.
4. Upload or change a store photo, refresh, and confirm the fish still resolves to a real image path.
5. Open Inventory Manager and use:
   - Missing store data
   - Undo Last Change
   - Stock # edit
6. Open fish popups on desktop and phone/tablet-sized view and confirm:
   - scroll works
   - close button works
   - detail background still feels correct
7. Confirm staff mode no longer shows Compare on cards.

## Verification
- smoke test passed
- 0 errors
- 1 existing translation warning
- 50-card deterministic display audit: 0 customer-facing marker/phrasing hits

## Main caveat
I can verify the code path and smoke test in-container, but the real persistence verdict still depends on testing in your actual browser/device flow after refresh.
