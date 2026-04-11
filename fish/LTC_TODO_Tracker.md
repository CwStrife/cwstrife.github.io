# LTC Fish Browser — TODO Tracker

Last updated: v0.183. Live document — Claude updates this after every build.

---

## 🎯 Active feature queue (in priority order)

### Next up
1. **Animation Experiments 04** (cadence due — last was 03 in v0.172). Per Chris's direction in v0.175: fish-themed. Bubbles WITH fish, fish eating, more crab uses, waves on the compatibility bars (like the v8 water gauge). Ship as `LTC_Animation_Experiments_04.html` to outputs.
2. **Photo gallery modal** — tap-to-expand, multi-photo carousel, preserve-on-upload. Open question for Chris: tap main image vs dedicated button to trigger?
3. **Flotsam drift port** — third Animation Experiments 03 winner that's still pending. Same code path as kelp. Question for Chris: same locations as kelp (main browser bottom + staff hub bottom) or different?

### Queued
4. **Recently received row** in receive flow step 1 (ambient context for staff)
5. **Sale history quick re-add** in receive flow (one-tap restock from a previous sale)
6. **2 more stat tile candidates** Chris asked about: New this week, Top category today
7. **Bridge entry rewrites** — ~205 templated species entries still in customer voice debt
8. **Continue Spanish translation pass**
9. **Staff hub tile additions** — open question: what should live in "What needs doing" and "More tools"?

### Open questions for Chris
- Multi-photo gallery interaction (tap main vs dedicated button?)
- Recently received row grouping (flat chronological vs by day?)
- 2 more stat tiles — yes/no?
- Flotsam port target locations
- Staff hub additions

---

## 🐛 Open bugs / known issues

*(none currently — last visual scrub was v0.182, all known navy/aqua eliminated as of v0.183)*

---

## ✅ Recently shipped

### v0.183 — Stat tile graphics + tracker rewrite
- 8 stat tiles now have 8 unique reaction graphics (was 6 unique + 2 duplicates)
- New `treasure` reaction for Stock value tile: gold bar drops + silver bar drops + diamond pops with sparkles
- New `clock` reaction for Oldest in stock tile: clock face appears, hour and minute hands rewind backwards through time
- New `heart` reaction for Customer holds tile: 3 pink hearts pop and float upward at staggered intervals
- Tracker fully rewritten and brought current

### v0.182 — Chip + analytics-panel migration + bulk navy sweep #2
- `.analytics-panel` base definition migrated to `--ltc-surface-panel` (this single change fixes inventory + foods + analytics + recent + tank mover overlay backgrounds)
- `.inventory-chip-filter` early aqua override killed (was `rgba(90,220,200)` hardcoded)
- `.inventory-toolbar-note` navy-purple base migrated
- `.food-settings-hero .food-settings-metric` migrated (`#7bcfff` blue default → amber)
- 10 more navy color tuples bulk-replaced: `rgba(10,22,36)`, `rgba(10,22,35)`, `rgba(9,22,35)`, `rgba(7,15,24)`, `rgba(7,17,27)`, `rgba(30,55,90)`, `rgba(12,22,36)`, `rgba(25,51,79)`, `rgba(27,54,84)`, `rgba(12,25,39)`
- Final audit: zero functional navy values remaining in CSS (only 4 in comments + 3 in light-mode text)

### v0.181 — Final input modal navy kill
- Found and killed THIRD `.input-modal-field input` definition at line 9231 that v0.176 + v0.179 had both missed
- Was `rgba(14,28,44)` → `rgba(8,16,28)` navy with !important
- 11 more navy hex values bulk-replaced: `#0e1a2a`, `#0e1c2c`, `#102233`, `#173655`, `#0d1b2b`, `#16334d`, `#0f2438`, `#1b3b59`, `#0f2436`, `#1a3a58`, `#0b1d2d`
- New discipline locked in: grep ALL definitions before declaring done

### v0.180 — Tank mover + receive flow migration
- Tank mover panel killed `rgba(18,14,30)` → `rgba(8,16,28)` → `rgba(14,10,24)` navy gradient
- Receive flow search bar, step 2 fields, and panel migrated to tokens
- 30 more navy color tuples bulk-replaced via sed

### v0.179 — Inventory search/input family migration
- 8 separate definitions of `.inventory-search` / `.inventory-filter` consolidated
- All migrated to `var(--ltc-surface-input)` and friends
- Per-control semantic accents preserved (search=blue, status=teal, category=purple)
- Aqua focus glows replaced with semantic-color focus glows

### v0.178 — Late-cascade input modal navy kill (partial)
- Killed `.input-modal` panel hardcoded navy at line 9272
- Killed `.input-choice-btn` navy base + blue default
- Killed `.btn-confirm` hardcoded teal
- Reordered `INPUT_MODAL_PALETTE` to lead with warm colors (amber, rose, purple) instead of blue, teal
- Did NOT catch the line 9231 `.input-modal-field input` rule (caught in v0.181)

### v0.177 — Design token foundation
- Added 62 design tokens in `:root` namespaced `--ltc-*`
- Added 11 component classes: `.ltc-panel`, `.ltc-card`, `.ltc-modal`, `.ltc-overlay-bg`, `.ltc-input`, `.ltc-back-btn`, `.ltc-chip`, `.ltc-btn-primary`, `.ltc-btn-secondary`, `.ltc-text-h1/h2/body/caption/muted`
- Added 9 theme modifier classes (`.ltc-themed-blue`, `.ltc-themed-teal`, etc)
- Default accent changed from teal `#5eebc8` to amber `#ffcb5e` — this single change is why unthemed controls stopped reading as aqua
- Pure additive build, no existing rules touched
- Created `DESIGN_SYSTEM.md` reference doc

### v0.176 — Modal panel charcoal + uncataloged fish modal theme
- `.input-modal` early panel definition (line ~1500) migrated to charcoal
- `staffAddUncatalogedFish` modal theme switched from `cyan` to `amber`
- Did NOT catch the late-cascade duplicates (caught across v0.178 + v0.181)

### v0.175 — Visual scrub + breadcrumb + clear X + kelp density + crab slowdown
- Bulk sed scrub of 14 navy color tuples
- Killed redundant "Staff home" pill in inventory catalog banner
- Killed aqua Back button top-right, replaced with charcoal+amber+bouncing arrow
- Group buttons (Tank/Category/Flat) get semantic per-mode colors
- inv-group-head chev + count badge rainbow rotation
- Dynamic breadcrumb in inventory topbar h2 (`Inventory · Tank A`, etc)
- Search bar X clear button
- Fixed weird ass swimming fish in search bar (proper SVG instead of stacked gradients)
- Kelp forest density: 10 → 21 strands, 6 bubbles, 1 fish drifting through
- Crab slowed 3.4s → 6.8s, leg keyframes proportionally slowed
- Crab triggers on empty search bar click (7th trigger)

### v0.174 — Backdrop audit + nav scrub + kelp/crab port
- Added `receiveFlow.back()` context-sensitive method
- Registered receiveFlowOverlay, fishOverlay, tankMoverOverlay for backdrop click
- Massive navy scrub of `.inventory-card-fullbg` + 8 children
- Search bars pushed to `rgba(76,82,96)` (the brighter charcoal Chris asked for)
- Idle swimming fish in empty search bar
- Kelp forest port to main fish browser bottom + staff hub bottom
- Crab easter egg shipped (6 trigger types, 25% spawn chance, staff-mode only)

### v0.173 — French Angel dedupe + previous tracker rewrite
### v0.172 — 2 new stat tiles (Customer holds, Oldest in stock) + Animation Experiments 03
### v0.171 — Backdrop click bug fix in inventory submenus

---

## 🎨 Animation experiment winners (from Experiments 03)

- ✅ **Crab scuttle** — APPROVED, ported in v0.174, slowed in v0.175
- ✅ **Kelp forest sway** — APPROVED, ported in v0.174, polished in v0.175 (denser, bubbles, drifting fish)
- ⏳ **Flotsam drift + fish eating flotsam** — APPROVED, port pending. Open question: where to put it?
- ❌ **Octopus tentacle reach** — REJECTED

## 📝 Animation experiment cadence

Last shipped: Experiments 03 in v0.172. Cadence is "every 2-3 builds." Currently OVERDUE — should ship Experiments 04 in v0.184. Direction per Chris: more fish-related stuff (bubbles WITH fish, fish eating, waves like compatibility bars). "Keep experimenting there will be shit I will like eventually like the crab was super dope."

---

## 🏗️ Architectural state

### Design system (v0.177+)
- 62 design tokens in `:root` block at top of `css/style.css`
- 11 component classes for shared markup (`.ltc-panel`, `.ltc-input`, `.ltc-back-btn`, etc)
- 9 theme modifier classes for accent color application
- Full reference in `DESIGN_SYSTEM.md`
- **Migration status:** input/search/modal families fully migrated. Chip family + analytics-panel base migrated. Back button family + receive flow chrome partially migrated (functionally fine but still has structural duplicates).

### Migration debt remaining
Functionally these elements look correct, but they're not yet using the shared component classes — they have their own CSS rules that reference the tokens directly. Fine for now, can be consolidated in a future cleanup pass:
- `.inventory-topbar-back` and `.icb-back` (back button family)
- Various panel chrome rules across inventory and staff hub
- Some receive flow internals (chip waves, size pill rainbow cycling)

### Recurring discipline (locked in v0.181)
**Before declaring any color fix done:** grep ALL definitions of the affected class with `grep -nE '\\.classname\\b' css/style.css`. If count > 1, migrate ALL of them in the same build, not just the first. Audit for zero remaining hardcoded color values for that family before shipping.

---

## 📦 GPT photo research pipeline

- **Brief v3 → v4 sequence:** v3 was rejected because GPT fabricated a 512-species pass in seconds. v4 is format-first JSON, deferral preferred over guessing, hard wall-clock cap, banned phrases, opening template line check.
- **Status:** v4 brief delivered, Chris is testing it in fresh Deep Research session. Awaiting first real batch.
- **Claude responsibility when batches arrive:** write a parser/validator that HEAD-checks `image_url`, GETs `source_page_url`, validates JSON schema, cross-checks scientific names against the kiosk species database. Reject entries that fail. 3+ failures in a pass = reject the entire pass.

---

## 🚀 Sequence going forward

- **v0.184** — Animation Experiments 04 (overdue)
- **v0.185** — Photo gallery modal + flotsam port
- **v0.186** — Recently received row in receive flow + sale history quick re-add
- **v0.187+** — Bridge entry rewrites continue, Spanish translation continues
- **As needed** — GPT photo batch parser when first verified batch arrives
