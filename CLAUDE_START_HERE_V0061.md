Use V0.061 as the new source of truth.

This pass specifically did three things:
1. fixed the detail background video so it stays inside the modal
2. improved fish image lookup so cards/details populate images more reliably
3. completed the 2C2 active reef fish content pass

If you touch these areas later:
- do not move `detail-bg.mp4` back to the full overlay
- do not regress `reef-bg.mp4` on the main page
- do not reduce image lookup back to `photoTitle` only
- keep the active reef fish guidance fields intact

Next recommended chunk after user verification:
- 2C3 predator / FOWLR fish
- then 2C4 + 2C5 together if stability holds
