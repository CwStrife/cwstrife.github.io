# LTC v0.135 — QM Gap Bridge for Claude

This file exists so Claude can bridge inventory-system work against the QM gap additions without losing track of the newly added species cards.

- Total bridged entries: **213**
- Fish entries: **187**
- Invert entries: **26**

## What Claude should trust

- `data/species/*.js` are now the source of truth for the new QM additions.
- `data/qm_gap_inventory_bridge.json` is the machine-readable manifest of those additions.
- `window.LTC_QM_GAP_BRIDGE_IDS` in `data/fish.js` is a lightweight runtime list of added species IDs.

## What is in the bridge manifest

- species id
- name
- scientific name
- category
- owning species file
- photoTitle/image key
- aliases
- fish/invert type

## Inventory integration intent

Use the bridge manifest when inventory records, tank assignments, uncataloged-item flows, or image/title linking need to recognize the newly added QM species without guessing which species file owns the card.

## Flagged entries needing human judgment

- `yellow-tip-hermit-crab-calcinus-latens-clibanarius-virescens` — **Yellow Tip Hermit Crab** — `Calcinus latens / Clibanarius virescens` (taxonomy-ambiguity)
- `slipper-lobster-scyllaridae-thenus-sp` — **Slipper Lobster** — `Scyllaridae/Thenus sp.` (taxonomy-ambiguity)
- `earmuff-wrasse-halichoeres-melasmapomus-xanti` — **Earmuff Wrasse** — `Halichoeres melasmapomus/xanti` (taxonomy-ambiguity)