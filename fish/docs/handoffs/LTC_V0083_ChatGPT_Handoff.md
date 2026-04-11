# LTC Fish Browser V0.083 — Subtle Effects Pass 1

## What changed
- Added a first-pass microinteraction layer intended to feel noticeable but restrained.
- Compatibility gauges now have:
  - a soft liquid-style reveal on open
  - a subtle internal shimmer pass
  - a gentle marker settle/drift effect
- Added waterline / sheen motion to key interactive surfaces such as:
  - category tabs
  - CTA buttons
  - staff action buttons
  - inventory filter chips
  - active pills / mini pills / tank pills
  - modal close button
- Expanded ripple feedback to more clickable controls so interactions feel acknowledged immediately.
- Added `prefers-reduced-motion` handling so the interface tones itself down automatically when users request less motion.

## What this pass did NOT try to solve
- No functional workflow changes.
- No new data/model changes.
- No new popup layout experiments.
- No Shopify/POS integration work.

## Intent
This is meant to create the kind of “wait… did that just do something?” feedback layer without making the site feel noisy or silly. The biggest visual focus is still the compatibility gauges.

## What to look at first
1. Open a fish detail popup and watch the compatibility gauges load.
2. Hover / click category tabs and CTA buttons.
3. Open staff mode and try a few action buttons/chips.
4. Make sure the animation still feels subtle rather than distracting.
5. Confirm the site still feels readable and responsive.
