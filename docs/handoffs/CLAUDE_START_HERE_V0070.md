Open these first, in order:
1. REFERENCE_FOR_CHATGPT_CLAUDE.md
2. docs/handoffs/LTC_V0070_ChatGPT_Handoff.md
3. docs/worklogs/LTC_MASTER_WORKLOG.md
4. docs/audits/LTC_V0070_STAFF_RUNTIME_AUDIT.md
5. docs/notes/LTC_FUTURE_INTEGRATIONS_NOTES.md

What changed in V0.070:
- undo/history for staff edits
- IndexedDB-first persistence with localStorage fallback
- image URL caching for refresh recovery
- direct Stock # editing in staff surfaces
- compare removed from staff mode
- popup scroll hardening
- docs reorganized into docs/ folders with root reference file

Main things to test:
- sold/restock + refresh persistence
- undo after sold/loss/edit
- stock # edits from cards/popups/inventory
- popup scroll and X button
- staff mode no compare buttons
