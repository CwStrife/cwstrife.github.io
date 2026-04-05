Use V0.051 as the new source of truth.

What changed in this pass:
1. Grid / Detail was rebuilt as a segmented control.
2. The segmented control now sits in the main filter row instead of wasting a separate row on desktop.
3. Compact cards on desktop/tablet now show a little more useful information instead of feeling empty.
4. The quick traits strip was made more readable.
5. Portrait phone and landscape phone control sizing was tightened.

If you build on top of this:
- do not revert the segmented control back to a weak single button
- do not move the mode switch back into an awkward isolated row
- keep portrait search on its own row
- keep compact mode as a true compact browse mode, not a shrunken detailed card
- preserve compare on both views

Before saying anything is done, manually check:
- desktop detailed mode
- desktop compact mode
- tablet compact mode
- phone portrait detailed mode
- phone portrait compact mode
- phone landscape detailed mode
- phone landscape compact mode
