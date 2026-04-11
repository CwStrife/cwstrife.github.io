# Claude V0.083 Review — Condensed Takeaways

## What Claude said was strongest
- Species data cleanup and honesty about specialist-care entries.
- Staff workflow iteration showed real product thinking.
- Compatibility gauges are a standout product element.
- Documentation discipline is unusually strong.

## What Claude said was weakest
- The fish detail popup has been the highest-maintenance problem area.
- Code architecture is strained by monolithic JS/CSS and duplicated modal rendering paths.
- Inventory toolbar is too dense.
- Hard-data unknowns remain a trust issue.

## Claude quick wins
- Collapse inventory toolbar into primary controls plus overflow.
- Keep APP_VERSION as the single source of truth.
- Complete ES translations.
- Tone down infinite shimmer loops on pills.
- Add a safer reset confirmation.
- Hide disabled rollback placeholders when nothing can be undone.

## Claude bigger recommendations
- Merge mobile/desktop modal templates into one responsive template.
- Split CSS into smaller files later.
- Write Shopify field mapping before sync work begins.
- Improve offline/kiosk resilience for fish images.
