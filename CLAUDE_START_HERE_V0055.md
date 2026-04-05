Use V0.055 as the source of truth.

This pass was a broad catalog-wide content cleanup, not a finished species-by-species fact verification pass.

Read first:
1. `LTC_V0055_ChatGPT_Handoff.md`
2. inspect the updated `data/fish.js`
3. inspect the revised modal logic in `js/app.js`

What changed:
- all profiles now have `visualCue`, `facts`, `bestWith`, `cautionWith`, and `staffNote`
- modal content now has safer no-info handling
- long reading blocks are less random and more grounded in structured data
- water parameter blocks can now show `Unknown` if data is missing

What NOT to do next:
- do not undo the new fallback logic
- do not reintroduce undefined modal sections
- do not go back to generic filler paragraphs

What SHOULD happen next:
- species-by-species factual QA on the highest-risk / highest-traffic livestock
- photo audit
- water-parameter sanity check for specialist livestock
- keep improving content accuracy without breaking the UI shell
