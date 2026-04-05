# LTC Fish Browser V0.065 — Catalog-wide Boilerplate Cleanup

## What this version is for
This build is the catalog-wide cleanup pass aimed at removing old seed text, boilerplate, placeholder chatter, and awkward internal-style wording from the remaining fish profiles.

## Scope completed
- ✅ modal/invert/anemone/clams work from prior builds carried forward
- ✅ catalog-wide cleanup pass applied to the remaining legacy fish profiles
- ✅ 279 previously flagged entries cleaned
- ✅ master worklog included inside the zip
- ✅ content audit included inside the zip

## Section checklist
- ✅ Angelfish
- ✅ Anthias
- ✅ Basslets / Dottybacks
- ✅ Butterflyfish
- ✅ Cardinalfish
- ✅ Clownfish
- ✅ Damsels
- ✅ Eels
- ✅ Gobies / Blennies / Jawfish / Dragonets
- ✅ Hawkfish
- ✅ Lionfish
- ✅ Other Fish / Oddballs
- ✅ Puffers / Boxfish / Cowfish
- ✅ Rabbitfish
- ✅ Tangs
- ✅ Triggerfish
- ✅ Wrasses
- ✅ residual cleanup touches in Shrimp / Snails / Urchins

## What changed in this pass
- removed customer-visible seed phrases and internal-note language
- rewrote bad summary lines with duplicated / broken wording
- normalized placeholder scalar values so the app no longer shows `Needs enrichment` or `—` in those fields
- replaced many weak generic facts with cleaner customer-facing care / compatibility notes
- tightened copy in subgroup areas where broad category wording was misleading

## Important honesty note
This pass cleans the **customer-facing text quality** problem.
It does **not** fully backfill every missing hard-data field for every late-added profile.
So:
- banned marker / boilerplate phrases: **clean**
- some profiles still show `Unknown` for missing scalar facts like size / tank / diet: **still present in 111 entries**

## Verification
- smoke test passed
- 0 errors
- 1 existing translation warning
- banned-marker audit: **0 hits across 448 entries**

## What to test first
1. Open random fish cards from older problem categories.
2. Check that the details read like normal customer-facing copy.
3. Confirm you do not see old phrases like:
   - `Needs enrichment`
   - `Roster seed`
   - `catalog expansion seed`
   - `not fully enriched`
   - `Look for look for`
4. Spot-check categories that were previously the worst offenders:
   - wrasses
   - gobies / blennies
   - angelfish
   - clownfish
   - tangs
   - triggers

## Files in this zip
- app files
- `LTC_MASTER_WORKLOG.md`
- `LTC_V0065_ChatGPT_Handoff.md`
- `LTC_V0065_CONTENT_AUDIT.md`
- `content-audit.js`
- prior handoff snapshots kept for continuity
