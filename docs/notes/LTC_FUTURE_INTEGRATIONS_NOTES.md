# LTC Fish Browser — Future integrations / store workflow notes

## Manual livestock entry
Requested for later.

Why it matters:
- shops may want to add a fish/invert manually before or without a full Shopify product record
- staff may need a fast emergency / same-day entry path during receiving

Suggested future approach:
- staff-only **Add Livestock Entry** modal
- required fields: name, category, price, tank, stock #, quantity
- optional fields: size, vendor, arrival date, note, photo
- entry should be clearly marked as **local/manual** until synced or promoted into the main catalog

## Shopify API sync
Requested for later.

Goal:
- when a fish is added or updated in Shopify, mirror the relevant store data here automatically

Suggested scope for a later phase:
- pull/store fields such as title, price, image, inventory count, status, vendor, tags, and maybe metafields
- map Shopify product/variant IDs to local fish IDs where possible
- allow staff override fields locally, but show when a value came from Shopify vs local override
- start with **one-way import/sync** before attempting bidirectional edits

## Reservations / holds safety note
Right now holds remain **staff-only local flags**.

If public reservations are ever added later, they should not be open spam actions.
Possible gates:
- deposit required
- existing customer account only
- at least one previously delivered/fulfilled order
- staff approval before the hold becomes active
- auto-expiration window if unpaid / unconfirmed

## Recommendation order
1. manual livestock entry
2. Shopify import/sync foundation
3. clearer missing-store-data dashboard
4. only later, consider any public reservation/deposit flow


## Later requirement note from V0.070+ feedback
- keep explicit reverse actions for operational statuses (sold/loss/hold) easy to reach
- staff workflow should favor inventory-first controls over less-frequently changed utilities like food settings
- continue favoring simple small-business language like **Stock #** over SKU for livestock


## V0.072 carry-forward notes
- keep explicit, state-specific rollback actions visible for sold, loss, quarantine, and holds
- continue treating generic undo as secondary to clear operational recovery buttons
- keep testing browser-refresh image recovery; V0.072 changes reduce burst fetches and retry broken images, but real-device validation still matters
- modal close button should stay pinned top-right across desktop/tablet/mobile; keep checking this after future layout changes


## Future website navigation note
Requested for later.

- when the user taps/clicks the LTC logo, it should eventually go to the main LTC store homepage, not just back to the fish browser root
- until the broader site exists, keep this as a documented future navigation requirement rather than forcing a placeholder route now
- when the main site is ready, this should behave like going to the main LTC store landing page / homepage


## Later catalog-quality note
- re-review fish detail information later for double-verification and possible expansion
- keep future entry-writing precise enough that store staff can trust the system without manually re-researching each fish
- keep a later task to add more species entries as the catalog grows
- keep staff workflows friendly for non-technical store staff; default to obvious labels, easy rollback, and low-clutter flows
