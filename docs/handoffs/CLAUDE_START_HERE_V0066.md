Start from **V0.066**.

This build carries forward the earlier modal / 2C4 / 2C5 / catalog cleanup work and now also backfills the remaining missing core fish facts.

Key current state:
- core factual fields now filled across all 448 entries for:
  - scientific
  - maxSize
  - minTank
  - diet
- banned marker phrase audit: 0 hits
- doubled-word scan: 0 hits
- smoke test: 0 errors, 1 existing translation warning

If continuing from here, focus on:
1. random-card truth QA
2. species-by-species refinement where any profile still feels too generic for that exact fish
3. optional translation cleanup for the remaining ES warning keys
