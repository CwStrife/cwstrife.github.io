Use V0.068 as the current carry-forward build.

What changed in V0.068:
- added quantity tracking
- added hold / reservation tracking
- added arrival date + vendor/source fields
- upgraded restock flow to include those fields
- sold / loss now decrement quantity when qty > 1
- inventory manager now shows summary cards and a held/reserved filter
- popup quick-edit block also includes Qty / Hold / Stock Details

What to test first:
1. Inventory Manager quantity editing
2. Hold / reservation editing
3. Stock details editing
4. sold/loss decrement behavior for qty > 1
5. restock flow with quantity + arrival/vendor
6. popup quick edits on tablet / phone-sized view

What was NOT expanded in this pass:
- no larger quarantine dashboard
- no QR/scan workflow
- no backend sync/user accounts
