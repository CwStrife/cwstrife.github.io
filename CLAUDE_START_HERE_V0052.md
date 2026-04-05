Use V0.052 as the current source of truth.

This pass solved these concrete issues:
- single-button Grid / Detail toggle instead of two tiny buttons
- stronger horizontal-scroll cues for category tabs and bundle packs
- reduced desktop control-row bulk
- better compact-card sale price layout
- partial compact-card info recovery on desktop/tablet
- stronger horizontal overflow containment on phone

If you continue from here, do not revert these fixes.

Priority order for the next pass:
1. real-device verify phone portrait modal scroll
2. verify category and bundle rail cues on mobile
3. verify compact-card density on desktop/tablet
4. only then polish spacing / typography further

Do not reintroduce:
- two tiny Grid/Detail buttons on mobile
- full-page horizontal dragging on phone
- giant sale-price blocks that unbalance compact cards
