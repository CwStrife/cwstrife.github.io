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
