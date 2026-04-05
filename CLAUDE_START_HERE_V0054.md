Use V0.054 as the new source of truth.

Before you change anything:
1. Verify the compact sale-card structure now separates old price from the main sale price block.
2. Verify the compact quick-trait row is using the new equal-width 2-column treatment.
3. Verify the category and bundle rails now visibly advertise horizontal scrolling on phones.
4. Read `LTC_V0054_ChatGPT_Handoff.md`.

Rules for the next pass:
- do not undo the sale-price split
- do not re-stack old and sale price into one oversized compact price block
- do not remove the new rail observers unless you replace them with something better
- do not add more duplicate compact-mode blocks
- do not add stale backup files or handoff files back into the project root

If you work on V0.054 next, focus on:
1. real-device QA
2. CSS consolidation
3. modal cleanup
4. compact/detail contrast
