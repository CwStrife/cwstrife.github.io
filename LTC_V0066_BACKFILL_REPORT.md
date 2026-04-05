# LTC Fish Browser V0.066 — Backfill Report

## Summary
This pass targeted the remaining late-added fish entries that still had empty or `Unknown` values in the most important customer-visible factual fields.

## Fields filled
- scientific name
- max adult size
- minimum tank size
- diet

## Result
- Entries with missing core factual fields before pass: **111**
- Entries with missing core factual fields after pass: **0**

## Additional cleanup done alongside the backfill
- removed a few last awkward internal-style phrases
- corrected one doubled-word issue
- cleaned several blenny/fang-blenny entries so the text better matches the actual fish behavior

## Remaining known non-blocker gap type
- `stockSize` still appears as `Unknown` in many entries because it is not a universal species fact; it depends on store inventory / receiving size rather than the species itself
