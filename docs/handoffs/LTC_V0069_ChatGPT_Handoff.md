# LTC Fish Browser V0.069 — Staff Stock # Pass + Random Content Audit

## What changed
- Added **Stock #** as a staff-managed local inventory field.
- Updated restock and stock-details flows so staff can edit Stock # on mobile, tablet, or desktop.
- Updated Inventory Manager cards and quick-edit panel to show Stock #.
- Added a **Missing store data** filter to the Inventory Manager.
- Expanded customer-facing text cleanup so older sales-floor phrasing is normalized before display.
- Kept holds/reservations as **staff-only local flags** — no public reservation flow was added.

## Random audit pass
- Reviewed **50 random catalog entries** across mixed categories.
- Checked for leftover boilerplate markers, doubled words, and sales-floor/internal phrasing in presentation text.
- Result for the 50-entry sample after display cleanup: **0 marker hits, 0 doubled-word hits, 0 sales-floor phrasing hits**.

## Broader content scan
- Species entries scanned: **448**
- Presentation-text marker hits: **0**
- Presentation-text sales-floor phrasing hits: **49**

## Verification
- Smoke test: **0 errors, 1 existing translation warning**
- Master worklog included inside zip
- Audit reports included inside zip

## What to test first
1. Staff Mode → Inventory Manager → edit **Stock #** on a few fish.
2. Use **Missing store data** filter.
3. Open a few random fish cards and read the longer sections to make sure wording feels natural.
4. Re-check popup scroll/X/close behavior while you are in there.
