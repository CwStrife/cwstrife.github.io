# V0.084 Workflow / Visual Audit

## Scope of this pass
- Detailed fish popup desktop spacing cleanup
- Inline sale/current price visibility
- Inventory card visual treatment
- Immediate restore clarity after Remove (Loss)
- Non-technical-staff friendliness

## Checks run
- smoke test executed from project root
- Result: **0 errors, 1 existing translation warning**

## Notes
- The build still carries the V0.083 effects code, but this pass does not claim that the subtle motion is satisfactory yet.
- This pass is focused on making the UI easier to understand and harder to misuse before resuming motion work.
- Inventory recovery now has two paths:
  - immediate action toast
  - Recent Changes history path

## Remaining likely follow-ups
- Revisit the subtle effects so they are visible enough to matter without looking gaudy
- Keep simplifying staff recovery/history for fast in-store use
- Validate the inventory card density on tablet/mobile after the image hero treatment
