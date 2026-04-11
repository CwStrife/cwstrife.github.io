# LTC Design System (v0.177+)

The single source of truth for visual styling. Established in v0.177 (foundation), being migrated into in v0.178, fully cut over by v0.179.

> **The rule:** any new component MUST use these tokens or component classes. No more hardcoded colors. If you need a color that doesn't exist in the palette, add a token first, then use it.

---

## Design tokens (CSS variables on `:root`)

All tokens are namespaced `--ltc-*` so they don't collide with anything else.

### Surfaces
| Token | Purpose |
|---|---|
| `--ltc-surface-page` | Base page background |
| `--ltc-surface-panel` | Standard panel/section background (charcoal gradient) |
| `--ltc-surface-panel-flat` | Flat fill version of panel |
| `--ltc-surface-panel-raised` | Slightly lighter panel for layered surfaces |
| `--ltc-surface-card` | Card background (slightly raised vs panel) |
| `--ltc-surface-input` | Input field background — **visibly lighter than panel by design** |
| `--ltc-surface-input-focus` | Input field background when focused |
| `--ltc-surface-chip` | Pill / chip background |
| `--ltc-surface-chip-hover` | Chip background on hover |
| `--ltc-surface-overlay-bg` | Modal backdrop |
| `--ltc-surface-modal` | Modal panel background |

### Borders
| Token | Use |
|---|---|
| `--ltc-border-faint` | Barely-visible separators |
| `--ltc-border-subtle` | Default panel borders |
| `--ltc-border-default` | Chip borders |
| `--ltc-border-input` | Input field borders (thicker) |
| `--ltc-border-strong` | Emphasis borders |

### Text
| Token | Use |
|---|---|
| `--ltc-text-primary` | Default body text on dark surfaces |
| `--ltc-text-secondary` | Secondary copy |
| `--ltc-text-muted` | Muted helper text |
| `--ltc-text-faint` | Very subtle (placeholders, disabled) |
| `--ltc-text-on-accent` | Text rendered on a colored accent surface |

### Accent palette
9 brand colors. Each comes in `--ltc-c-NAME` (hex) and `--ltc-c-NAME-rgb` (comma-separated RGB for use in `rgba()`).

| Name | Hex | Use |
|---|---|---|
| `blue` | `#7bcfff` | Info, "All" filter, calm states |
| `teal` | `#5eebc8` | In-stock, success — **NOT default** |
| `purple` | `#c8b2ff` | Held / reserved |
| `amber` | `#ffcb5e` | Warning, default accent |
| `rose` | `#ff9bb6` | Missing data |
| `cyan` | `#5ed4dc` | Recent activity |
| `orange` | `#ffa850` | Missing store data |
| `red` | `#ff9a8a` | Out of stock, errors |
| `green` | `#4ade80` | Sold, completed |

### Default accent
| Token | Value |
|---|---|
| `--ltc-accent` | `var(--ltc-c-amber)` |
| `--ltc-accent-rgb` | `255,203,94` |

**Why amber?** v0.176 and earlier defaulted to teal which made every unthemed control read as "aqua." Amber is warm, neutral, and doesn't conflict with semantic states.

### Radii / Shadows / Spacing / Motion
Fixed scales. Use them, don't invent new values:
- Radii: `xs` (6) `sm` (10) `md` (14) `lg` (18) `xl` (24) `pill` (999)
- Shadows: `card` `card-hover` `modal` `input` `pop`
- Spacing: `1`-`8` (4px-32px)
- Motion: `fast` (140ms) `base` (200ms) `slow` (320ms)
- Tap target: `44px` minimum

---

## Component classes

Apply these in markup. They reference the tokens above so they update automatically when the tokens change.

### `.ltc-panel`
Full-bleed surface for sections. Use this for any container that's "the background of something."
```html
<div class="ltc-panel">...</div>
```

### `.ltc-card`
Raised content card. Slightly lighter than panel, adds default padding.
```html
<div class="ltc-card">...</div>
```

### `.ltc-modal`
Modal dialog wrapper. Use with `.ltc-overlay-bg` for the backdrop.
```html
<div class="ltc-overlay-bg">
  <div class="ltc-modal">...</div>
</div>
```

### `.ltc-input` / `.ltc-input-wrap`
Standard input field. Visibly lighter than panel by design — Chris explicitly requested this in v0.174.
```html
<input class="ltc-input" type="text">

<!-- Wrapper version for inputs with side decorations (clear X, fish, etc) -->
<div class="ltc-input-wrap">
  <input type="text">
  <button class="clear-x">×</button>
</div>
```

### `.ltc-back-btn`
The unified back/close button. Replaces every one-off back button. Picks up its color from `--ltc-accent` (amber by default), so applying a theme modifier changes its color without any extra CSS.
```html
<button class="ltc-back-btn">Back</button>
<button class="ltc-back-btn ltc-themed-blue">Back</button>
```

### `.ltc-chip`
Pill / filter chip. Hover and active states built in. Active picks up the accent color.
```html
<button class="ltc-chip">All</button>
<button class="ltc-chip is-active ltc-themed-green">In Stock</button>
```

### `.ltc-btn-primary` / `.ltc-btn-secondary`
Primary action (themed) and secondary action (neutral). Both use the accent token.
```html
<button class="ltc-btn-primary ltc-themed-amber">Add to catalog</button>
<button class="ltc-btn-secondary">Cancel</button>
```

### Type scale
```html
<h1 class="ltc-text-h1">Page title</h1>
<h2 class="ltc-text-h2">Section heading</h2>
<p class="ltc-text-body">Body copy.</p>
<span class="ltc-text-caption">CAPTION TEXT</span>
<span class="ltc-text-muted">Muted helper</span>
```

---

## Theme modifiers

Apply alongside any base class to change just the accent color for that element:

```html
<button class="ltc-chip ltc-themed-blue">Blue chip</button>
<button class="ltc-chip ltc-themed-purple">Purple chip</button>
<button class="ltc-chip ltc-themed-rose">Rose chip</button>
```

Available: `ltc-themed-blue`, `ltc-themed-teal`, `ltc-themed-purple`, `ltc-themed-amber`, `ltc-themed-rose`, `ltc-themed-cyan`, `ltc-themed-orange`, `ltc-themed-red`, `ltc-themed-green`.

This is how a row of 8 chips can each be a different color **without writing a single per-chip CSS rule.** The accent inherits down through descendants too, so a themed parent automatically themes its children.

---

## Migration plan

- **v0.177 (this build):** Foundation only. Tokens + component classes added. NO existing rules touched. Zero risk to existing UI.
- **v0.178:** Migration. Existing one-off rules systematically migrated to use the tokens or component classes. Highest regression risk.
- **v0.179:** Cleanup. Dead one-off rules removed. Final visual audit. From here on, navy/aqua bugs become impossible.

After v0.179, the rule for new work is **never hardcode a color, gradient, border, or radius.** Always reference a token or apply a component class. If you need a value that doesn't exist, add a token to the system first.

---

## How to add a new token

1. Open `css/style.css`
2. Find the v0.177 token block (top of file, inside `:root`)
3. Add the token in the appropriate category section (surface / border / text / accent / radius / shadow / spacing / motion)
4. Use the naming convention `--ltc-<category>-<role>[-<state>]`
5. Document it in this file

## How to add a new component class

1. Open `css/style.css`
2. Find the v0.177 component class block (right after `:root`)
3. Add the class. Reference tokens — never hardcode values.
4. Document it in this file.
5. Make sure it has a `:hover`, `:focus`, and `:active` state where appropriate.
6. Make sure it respects `prefers-reduced-motion` (the v0.177 block already covers all `.ltc-*` classes generically).
