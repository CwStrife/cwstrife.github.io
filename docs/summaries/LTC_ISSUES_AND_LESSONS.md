# LTC Fish Browser — Issues, Lessons, and Known Friction

## Repeated issue patterns
- The fish detail popup has been the most regression-prone surface. Layout changes there should stay conservative.
- Inventory card fish-photo rendering has been fragile across multiple attempts; verify it in the deployed environment before piling on more styling.
- Overly subtle effect passes can technically exist in code but still fail the real-world “can staff/customers notice it?” test.

## Lessons worth preserving
- When a workflow is already working, do not redesign it unless the gain is obvious.
- Dense staff UIs need visual grouping, obvious restore paths, and fewer admin controls at the same priority level.
- Keep separate concepts separate: species facts vs store setup vs recent changes vs sale history.
- Reduce file count for GitHub sanity, but keep rationale, bug history, and solved-problem notes available in compact docs.

## Current known watchpoints
- Live deployment should still be checked for inventory-card image hydration.
- Multi-device persistence is still limited because staff data is browser-local.
- Top-traffic species categories should still get future accuracy/expansion passes.
