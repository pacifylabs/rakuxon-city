# Design System — Rakuxon City

**Project:** Rakuxon City — a Rakuxon (rakuxon.com) company project
**Version:** 2.0 — **palette change: charcoal · ivory · champagne**
**Supersedes:** v1.0 (sage). Every colour token is replaced. Structure, type, layout, and motion are unchanged.
**Reference:** `05_REFERENCE_UI.png` — still the layout target. Its rhythm, spacing, and type behaviour survive the palette change intact; only its colour is replaced.

---

## 1. Direction

Charcoal for authority, ivory for space, champagne for the seal.

The layout character is unchanged from v1.0 and is not up for renegotiation here:

1. A **warm tinted canvas** rather than pure white — the page reads as paper, not screen. Ivory now does what sage did.
2. **Large display type at regular weight**, set tight. Scale carries emphasis, never bold weight.
3. **Asymmetric text pairing** — heading left, supporting paragraph offset right, wide gap between.
4. **Photography does the selling.** Chrome stays quiet.

What changes is what the accent *means*. Sage was inherited from a reference layout about temperate forest and carried no meaning here. **Champagne carries the semantics of a seal** — certificate, stamp, notarised document. That is why the title ribbon in §7 is the centre of this palette rather than an afterthought on it.

---

## 2. Colour

Source of truth is the CSS custom property block in §10. This table is the working reference.

### Brand

| Token | Hex | Role |
|---|---|---|
| `charcoal` | `#171918` | Primary ink, dark sections, primary buttons |
| `charcoal-deep` | `#0D0F0E` | Footer bar, overlay scrims, pressed states |
| `charcoal-soft` | `#242725` | Elevated surfaces *within* dark sections |
| `ivory` | `#F5F1E8` | Muted surface, quiet panels, alternating bands |
| `ivory-light` | `#FAF8F3` | Page background |
| `champagne` | `#C5A46D` | Accent fills, seals, rules, the title ribbon |
| `champagne-light` | `#D8BF91` | Champagne text **on charcoal only** |
| `champagne-dark` | `#A88650` | Accent hover, large-text accent |
| `taupe` | `#A69B8A` | Decorative dividers, disabled states |
| `taupe-light` | `#D2C9BA` | Decorative only |
| `white` | `#FFFFFF` | Card and field surfaces |

### Semantic

| Token | Value | Use |
|---|---|---|
| `background` | `ivory-light` | Page background. Never pure white |
| `surface` | `white` | Cards, floating panels, form fields |
| `surface-muted` | `ivory` | Quiet panels, alternating sections |
| `foreground` | `charcoal` | Headings and primary text |
| `muted-text` | `#746F66` | Body copy, supporting paragraphs, captions |
| `light-text` | `#A69F93` | **Non-text only** — see the audit below |
| `primary` | `charcoal` | Primary button fill |
| `primary-hover` | `charcoal-deep` | |
| `accent` | `champagne` | Accent fills, rules, seals |
| `accent-hover` | `champagne-dark` | |
| `accent-text` | `#8A6A2F` | **New.** Champagne as text on light backgrounds |
| `accent-tint` | `#F0E7D6` | **New.** Badge fills, selected chips — replaces the old sage tint |
| `border` | `#DED8CC` | Decorative dividers, card hairlines |
| `border-input` | `#9A907C` | **New.** Form field and control boundaries |
| `border-dark` | `#3A3D3B` | Dividers inside dark sections |
| `success` | `#536B57` | |
| `error` | `#9A4F4F` | |

### Contrast audit

Your PRD commits to WCAG 2.1 AA and Lighthouse accessibility ≥ 95. Measured against `ivory-light`:

| Pair | Ratio | Verdict |
|---|---|---|
| `charcoal` on `ivory-light` | ~17:1 | Passes comfortably |
| `muted-text` on `ivory-light` | ~4.8:1 | Passes AA for body text |
| `success` / `error` on `ivory-light` | ~5.6:1 | Pass |
| `charcoal` on `champagne` | ~7.5:1 | Passes — **this is how gold buttons work** |
| `champagne` on `ivory-light` | **~2.3:1** | **Fails.** Not usable as text or as a control boundary |
| `champagne-dark` on `ivory-light` | ~3.4:1 | Fails body text. Usable for large display text (24px+) and non-text UI |
| `accent-text` on `ivory-light` | ~4.8:1 | Passes — use this wherever gold must be text |
| `light-text` on `ivory-light` | ~2.5:1 | **Fails.** Decorative only |
| `border` on `ivory-light` | ~1.2:1 | Fine for decorative rules, **fails** as a form field boundary |

**Three rules follow, and they are not stylistic:**

1. **`champagne` is a fill colour, never a text colour on light.** A champagne button carries a `charcoal` label, not white — white on champagne is roughly 2.1:1 and is the single most common accessibility failure in this palette. Where gold must be text, use `accent-text`.
2. **`light-text` never carries text.** Use it for dividers, decorative glyphs, and disabled states. `muted-text` covers captions and metadata.
3. **Form controls use `border-input`, not `border`.** WCAG 1.4.11 requires 3:1 for the boundary of an interactive component; the decorative border does not meet it.

### Status colours

Redefined for the new palette — deliberately quiet, since status appears on every card.

| Token | Foreground / background | Applies to |
|---|---|---|
| `status-available` | `#3F5544` on `#E4EAE3` | Available |
| `status-reserved` | `#7A5C28` on `#F0E7D6` | Reserved |
| `status-sold` | `#6B655C` on `#EDE9E0` | Sold |

Reserved deliberately shares the champagne family without using `accent` itself — status colours are never the accent.

### Dark sections

Charcoal earns its 30% through **full-bleed sections and the footer**, not through card fills. Twelve charcoal cards on a hub page would invert the relationship the layout depends on, where cards recede and photography advances.

Use charcoal sections for: the footer, the investor strip, one estate or hero band, and the FAQ backdrop if it needs weight. Inside them: `ivory-light` text, `champagne-light` for accent text (~6:1 on charcoal), `charcoal-soft` for raised panels, `border-dark` for dividers.

**Rules**
- One accent-filled action per viewport. Everything else is charcoal, outline, or text.
- No gradients. No shadows except the single card lift in §5.
- Champagne never appears over a photograph, in a hero headline, or on a price. See §7.

---

## 3. Typography

Unchanged from v1.0.

| Role | Face | Loaded via |
|---|---|---|
| Display | **Instrument Sans** | `next/font/google` |
| Body and UI | **Inter** | `next/font/google` |
| Figures | Inter with `font-variant-numeric: tabular-nums` | Prices, areas, counts |

Two weights only: **400** and **500**. Never 600 or 700.

| Step | Size / line-height | Tracking | Use |
|---|---|---|---|
| `display-xl` | 64 / 1.05 | -0.03em | Homepage hero |
| `display-l` | 48 / 1.1 | -0.025em | Section headings |
| `display-m` | 36 / 1.15 | -0.02em | Sub-sections, listing title on detail |
| `heading` | 24 / 1.25 | -0.01em | Card titles, accordion questions |
| `body-l` | 17 / 1.6 | 0 | Article body |
| `body` | 15 / 1.6 | 0 | Default UI and paragraph text |
| `caption` | 13 / 1.5 | 0 | Metadata, card sub-lines, form labels |
| `eyebrow` | 12 / 1.4 | 0.04em | Category labels above headings |

Mobile: `display-xl` → 40, `display-l` → 32, `display-m` → 26. Body sizes hold.

Sentence case everywhere.

> **A note, not a change.** Champagne-and-ivory palettes often pair with a serif display face, and a serif would push this further toward luxury. It is deliberately not adopted here: the reference layout's rhythm depends on tight-tracked grotesque display type, and swapping the display face changes proportion and line breaks across every page. That is a separate decision with a real cost, worth taking on its own merits rather than bundled into a palette change.

---

## 4. Layout

Unchanged from v1.0.

- **Container:** max 1280px, 24px gutters on mobile, 64px from `lg`.
- **Grid:** 12 columns, 24px gap.
- **Asymmetric pairing:** section headings in columns 1–6, supporting paragraph in columns 8–11. Never centred.
- **Vertical rhythm:** 96px between sections on desktop, 64px on mobile.
- **Column rules:** faint 1px `border` verticals at container edges, 40% opacity, hidden below `lg`.

---

## 5. Radii, borders, elevation

| Token | Value |
|---|---|
| `radius-control` | 8px |
| `radius-card` | 12px |
| `radius-image-l` | 16px |
| `radius-pill` | 999px |
| `border` | 1px solid `border` |
| `lift` | `0 2px 12px rgba(23, 25, 24, 0.07)` |

Elevation appears exactly twice per page: the callout overlapping the hero imagery, and the FAQ panel over the image collage. Everywhere else is flat with a hairline.

---

## 6. Components

### Buttons
- **Primary:** pill, `charcoal` fill, `ivory-light` label, 15px/500, padding 12px 24px.
- **Accent:** pill, `champagne` fill, **`charcoal` label**. Reserved for the single highest-intent action in a view — *Enquire about this plot*, *Book an inspection*, *Schedule a viewing*. Never white text.
- **Secondary:** pill, `surface` fill, 1px `charcoal` border, `charcoal` label.
- **Text:** `accent-text` label with a trailing arrow glyph, no fill.
- **Icon action:** 40px circle, `charcoal` fill, `ivory-light` arrow.

Labels are verb-first and sentence case. Never *Submit* or *Click here*.

### Listing card
`surface` fill, `radius-card`, 1px `border`, no shadow. Image at 4:3 with `radius-card` on the top corners.

Fixed body order across both tracks:
1. Title type badge (land) or build stage badge (homes)
2. Listing name at `heading` in `foreground`
3. One-line description at `caption` in `muted-text`
4. Price at `display-m` in tabular figures — or *Price on request* at `heading` in `muted-text`
5. Sub-line: area or bedrooms at `caption` in `muted-text`
6. Status badge, bottom-left

### Filter bar
Pill chips above the grid. Idle: `surface` fill, `border-input` border, `muted-text` label. Selected: `accent-tint` fill, `champagne-dark` border, `accent-text` label. Range filters open a popover, never a modal.

### Accordion
`border` divider between rows, question at `heading`, `+` / `−` glyph right-aligned in `accent-text`. Open state reveals `body` copy in `muted-text`.

### Testimonial
48px circular avatar, name at `body`/500, role at `caption` in `muted-text`, quote at `display-m` weight 400, centred, with a large quote glyph in `accent-tint` above.

### Forms
44px minimum height, `surface` fill, 1px `border-input`, `radius-control`. Focus: 2px `charcoal` ring — not champagne, which fails contrast as a focus indicator. Labels above fields at `caption`. Errors inline beneath the field in `error`, stating what to do: *Enter a phone number we can reach you on*.

### Footer
`charcoal-deep` bar, full width. Three columns — contact, socials, newsletter — at `body` in `ivory-light`. Dividers in `border-dark`. *A Rakuxon company* in the bottom rule at `caption` in `taupe`.

---

## 7. Signature element — the title ribbon

This is where the palette earns itself.

Every plot in Nigeria is bought against the fear that the paperwork isn't real. Champagne is the colour of a seal — certificate, stamp, notarisation. So the one place this design spends its accent is documentation, and the association does real work rather than decorative work.

**On land cards:** a pill badge in `accent-tint` with `accent-text` type carrying the title type — *C of O*, *Governor's consent*, *Gazette*, *Deed of assignment*, *Excision*. It sits above the listing name, before anything else including price. It is the first thing read.

**On plot detail:** a full-width ribbon directly beneath the gallery — `ivory` band with a **2px `champagne` rule along its top edge**, holding the title type, survey number, and the document list with a small file glyph each. The rule is the seal. It appears nowhere else on the site.

**Where documentation is weaker** — survey only — the badge and rule render in `status-sold` neutral rather than champagne, and the ribbon states plainly what is and isn't available. Do not hide it. The gold rule means something precisely because it is withheld when it isn't earned.

Nothing else competes at this level of emphasis.

---

## 8. Imagery

- **Land:** wide establishing shots showing boundaries, access roads, terrain. Buyers want the edges of what they're buying.
- **Homes:** exterior, then interiors, then floor plan.
- **Estates:** dated development progress shots. A sequence proves delivery; a render never will.
- Aspect ratios: 4:3 cards, 16:9 hero and video posters, 3:4 portrait collage tiles.
- Renders labelled *Artist's impression* at `caption` in `muted-text`. Non-negotiable on off-plan listings.
- **No champagne overlays or gold-tinted scrims on photography.** Gold over an image reads as a stock luxury template and undoes the seal semantics immediately.

  **One carve-out, added in v2.1:** a single emphasis word in the full-bleed hero headline may use `champagne-light` (`#D8BF91`), provided it sits on the mandated scrim in `07_FEATURE_HERO.md` §4. The rule exists to forbid gold *tints and washes* over imagery, not a single letterform on a controlled dark ground. This is the only exception on the site.

---

## 9. Motion

Restrained — stillness is part of the credibility.

- Section headings and cards: fade with 12px rise on scroll into view, 400ms ease-out, staggered 60ms across a grid.
- Hover: card border darkens to `taupe`, image scales 1.02 over 300ms.
- Carousels: 300ms slide.
- No parallax, no counters, no autoplay.
- All wrapped in `prefers-reduced-motion: reduce`.

---

## 10. Tokens

### CSS custom properties — source of truth

```css
:root {
  /* Brand */
  --rakuxon-charcoal:        #171918;
  --rakuxon-charcoal-deep:   #0D0F0E;
  --rakuxon-charcoal-soft:   #242725;
  --rakuxon-ivory:           #F5F1E8;
  --rakuxon-ivory-light:     #FAF8F3;
  --rakuxon-champagne:       #C5A46D;
  --rakuxon-champagne-light: #D8BF91;
  --rakuxon-champagne-dark:  #A88650;
  --rakuxon-taupe:           #A69B8A;
  --rakuxon-taupe-light:     #D2C9BA;
  --rakuxon-white:           #FFFFFF;
  --rakuxon-black:           #000000;

  /* Semantic */
  --background:    var(--rakuxon-ivory-light);
  --foreground:    var(--rakuxon-charcoal);
  --surface:       var(--rakuxon-white);
  --surface-muted: var(--rakuxon-ivory);
  --primary:       var(--rakuxon-charcoal);
  --primary-hover: var(--rakuxon-charcoal-deep);
  --accent:        var(--rakuxon-champagne);
  --accent-hover:  var(--rakuxon-champagne-dark);
  --border:        #DED8CC;
  --border-dark:   #3A3D3B;
  --muted-text:    #746F66;
  --light-text:    #A69F93;
  --success:       #536B57;
  --error:         #9A4F4F;

  /* Added for accessibility and component needs — see §2 audit */
  --accent-text:   #8A6A2F;   /* champagne as text on light: 4.8:1 */
  --accent-tint:   #F0E7D6;   /* badge and chip fills */
  --border-input:  #9A907C;   /* interactive control boundaries: 3:1 */

  /* Status */
  --status-available:    #3F5544;  --status-available-bg: #E4EAE3;
  --status-reserved:     #7A5C28;  --status-reserved-bg:  #F0E7D6;
  --status-sold:         #6B655C;  --status-sold-bg:      #EDE9E0;
}
```

### Tailwind theme

```js
theme: {
  extend: {
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      surface: { DEFAULT: 'var(--surface)', muted: 'var(--surface-muted)' },
      primary: { DEFAULT: 'var(--primary)', hover: 'var(--primary-hover)' },
      accent: {
        DEFAULT: 'var(--accent)',
        hover:   'var(--accent-hover)',
        text:    'var(--accent-text)',
        tint:    'var(--accent-tint)',
        light:   'var(--rakuxon-champagne-light)',
      },
      charcoal: {
        DEFAULT: 'var(--rakuxon-charcoal)',
        deep:    'var(--rakuxon-charcoal-deep)',
        soft:    'var(--rakuxon-charcoal-soft)',
      },
      ivory: {
        DEFAULT: 'var(--rakuxon-ivory)',
        light:   'var(--rakuxon-ivory-light)',
      },
      taupe: {
        DEFAULT: 'var(--rakuxon-taupe)',
        light:   'var(--rakuxon-taupe-light)',
      },
      muted: 'var(--muted-text)',
      faint: 'var(--light-text)',
      line:  { DEFAULT: 'var(--border)', input: 'var(--border-input)', dark: 'var(--border-dark)' },
      success: 'var(--success)',
      error:   'var(--error)',
      status: {
        available: 'var(--status-available)', availableBg: 'var(--status-available-bg)',
        reserved:  'var(--status-reserved)',  reservedBg:  'var(--status-reserved-bg)',
        sold:      'var(--status-sold)',      soldBg:      'var(--status-sold-bg)',
      },
    },
    fontFamily: {
      display: ['var(--font-instrument-sans)', 'sans-serif'],
      sans:    ['var(--font-inter)', 'sans-serif'],
    },
    fontSize: {
      'display-xl': ['4rem',      { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      'display-l':  ['3rem',      { lineHeight: '1.1',  letterSpacing: '-0.025em' }],
      'display-m':  ['2.25rem',   { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      heading:      ['1.5rem',    { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      'body-l':     ['1.0625rem', { lineHeight: '1.6' }],
      body:         ['0.9375rem', { lineHeight: '1.6' }],
      caption:      ['0.8125rem', { lineHeight: '1.5' }],
      eyebrow:      ['0.75rem',   { lineHeight: '1.4', letterSpacing: '0.04em' }],
    },
    borderRadius: { control: '8px', card: '12px', 'image-l': '16px' },
    boxShadow: { lift: '0 2px 12px rgba(23, 25, 24, 0.07)' },
  },
}
```

---

## 11. Migration map — v1.0 → v2.0

Mechanical replacements for the existing codebase. Everything not listed keeps its class name.

| v1.0 token / class | v2.0 replacement | Notes |
|---|---|---|
| `canvas` `#F1F4EF` | `background` `#FAF8F3` | Page background |
| `ink` `#171A16` | `foreground` `#171918` | |
| `ink-secondary` `#5C635B` | `muted` `#746F66` | |
| `ink-muted` `#8E948C` | `muted` `#746F66` | Two greys collapse to one; do not map to `faint` |
| `accent` `#3E7350` (fills) | `accent` `#C5A46D` | **Label colour flips to charcoal** |
| `accent` (as text) | `accent-text` `#8A6A2F` | Links, text buttons, accordion glyphs |
| `accent-hover` `#325D41` | `accent-hover` `#A88650` | |
| `accent-tint` `#E7EFE8` | `accent-tint` `#F0E7D6` | |
| `hairline` `#E2E7DF` | `line` `#DED8CC` | Decorative only |
| — | `line-input` `#9A907C` | **New.** Every form field and chip boundary |
| `deep` `#101310` | `charcoal-deep` `#0D0F0E` | Footer, scrims |
| `status-*` | See §2 | All three redefined |
| Primary button: sage fill / white label | `charcoal` fill / `ivory-light` label | |
| — | Accent button: `champagne` fill / **charcoal** label | New variant, highest-intent actions only |
| Focus ring: sage | Focus ring: `charcoal` | Champagne fails as a focus indicator |

---

## 12. What not to do

- No pure white page background. The ivory tint is the identity.
- **No white text on champagne.** Roughly 2.1:1. This is the failure to watch for.
- **No champagne text on ivory.** Use `accent-text`.
- No champagne over photography — no gold scrims, no gold overlays, no gold in a hero headline.
- No champagne on prices. Money in gold is the register of the operators you are trying not to resemble.
- No charcoal card fills on listing grids. Charcoal earns its weight through full-bleed sections and the footer.
- No bold weight for emphasis. Go up a size.
- No centred section headings — asymmetric pairing is the rhythm.
- No shadows on listing cards. Hairlines only.
- No stock-photo people. Land, buildings, and real buyer photographs only.