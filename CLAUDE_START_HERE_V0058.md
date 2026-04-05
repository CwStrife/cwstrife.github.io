Use the attached V0.059 build as the new source of truth.

This pass completed **Phase 2B** of the local food system.
Do not re-open 2C species rewrites until you confirm 2B behaves correctly in the UI.

Check first:
1. fish detail modal food section
2. staff food settings overlay
3. enabling/disabling brands and products
4. featured food behavior
5. export/import/reset food settings

Do not collapse the food system back into a tiny rule-matcher.
The point now is:
- local catalog
- local settings
- local persistence
- profile-aware food guidance
- store-carried product filtering

If changes are made later, keep these files in sync:
- `data/foods/catalog.js`
- `data/foods/store-settings.js`
- `data/foods/profile-rules.js`
- `js/app.js`
- `css/style.css`
