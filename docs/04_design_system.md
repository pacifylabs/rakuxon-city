# Design System — Rakuxon City

**Project:** Rakuxon City — a Rakuxon (rakuxon.com) company project
**Version:** 1.0
**Derived from:** `05_REFERENCE_UI.png` — the client-approved reference layout, stored alongside this document in `docs/`. Open it before building any page. This document is the specification; the image is the evidence behind it. Where the two disagree, the image wins on visual rhythm and this document wins on tokens, naming, and the title-ribbon behaviour in §7 (which the reference does not cover).
**Brand position:** standalone identity. No tokens inherited from Rakuxon.

---

## 1. Direction

The sample is **editorial, calm, and land-first**. Its character comes from four things, and every decision below protects them:

1. A **pale sage-tinted canvas** rather than white — the page reads as paper, not screen.
2. **Large display type at regular weight**, set tight. Scale carries emphasis, never bold weight.
3. **Asymmetric text pairing** — headline left, supporting paragraph offset right, a wide gap between them.
4. **Photography does the selling.** Type and chrome stay quiet so land and buildings carry the page.

What we add for this market: land in Nigeria is bought under real anxiety about title. So the **signature element** is the title ribbon — see §7.

---

## 2. Colour

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#F1F4EF` | Page background. Never pure white |
| `surface` | `#FFFFFF` | Cards, floating panels, form fields |
| `ink` | `#171A16` | Headings, primary text |
| `ink-secondary` | `#5C635B` | Body copy, supporting paragraphs |
| `ink-muted` | `#8E948C` | Captions, metadata, placeholders |
| `accent` | `#3E7350` | Primary actions, links, active states, numerals |
| `accent-hover` | `#325D41` | Hover and pressed |
| `accent-tint` | `#E7EFE8` | Badge fills, selected filter chips, quiet panels |
| `hairline` | `#E2E7DF` | All borders and dividers, 1px |
| `deep` | `#101310` | Footer bar, overlay scrims |

**Status colours** — deliberately quiet, since status appears on every card:

| Token | Hex | Applies to |
|---|---|---|
| `status-available` | `#3E7350` on `#E7EFE8` | Available |
| `status-reserved` | `#8A6A1F` on `#F6EFDD` | Reserved |
| `status-sold` | `#6B6F69` on `#EDEFEB` | Sold |

**Rules**
- Text on `accent-tint` uses `accent`, never black or grey.
- One accent-filled action per viewport. Everything else is outline or text.
- No gradients, no drop shadows except the single card lift in §6.

---

## 3. Typography

| Role | Face | Loaded via |
|---|---|---|
| Display | **Instrument Sans** | `next/font/google` |
| Body and UI | **Inter** | `next/font/google` |
| Figures | Inter with `font-variant-numeric: tabular-nums` | Prices, areas, counts |

Only two weights: **400 regular** and **500 medium**. Never 600 or 700 — the sample gets its authority from size and spacing, and bold weight collapses that immediately.

| Step | Size / line-height | Tracking | Use |
|---|---|---|---|
| `display-xl` | 64 / 1.05 | -0.03em | Homepage hero |
| `display-l` | 48 / 1.1 | -0.025em | Section headings |
| `display-m` | 36 / 1.15 | -0.02em | Sub-section, listing title on detail |
| `heading` | 24 / 1.25 | -0.01em | Card titles, accordion questions |
| `body-l` | 17 / 1.6 | 0 | Long-form article body |
| `body` | 15 / 1.6 | 0 | Default UI and paragraph text |
| `caption` | 13 / 1.5 | 0 | Metadata, card sub-lines, form labels |
| `eyebrow` | 12 / 1.4 | 0.04em | Category labels above headings |

Mobile: `display-xl` → 40, `display-l` → 32, `display-m` → 26. Body sizes hold.

**Sentence case everywhere.** No title case, no all-caps — including eyebrows, which get letter-spacing instead.

---

## 4. Layout

- **Container:** max 1280px, 24px gutters on mobile, 64px from `lg`.
- **Grid:** 12 columns, 24px gap.
- **Asymmetric pairing** is the signature rhythm. Section headings occupy columns 1–6; the supporting paragraph sits in columns 8–11. Do not centre section headings.
- **Vertical rhythm:** 96px between sections on desktop, 64px on mobile. Generous whitespace is the design — resist filling it.
- **Column rules:** faint 1px `hairline` verticals at the container edges, running the page height behind content. Present in the sample; keep them, at 40% opacity, hidden below `lg`.

---

## 5. Radii, borders, elevation

| Token | Value |
|---|---|
| `radius-control` | 8px — inputs, small buttons |
| `radius-card` | 12px — cards, image containers |
| `radius-image-l` | 16px — hero and estate imagery |
| `radius-pill` | 999px — actions, badges, filter chips |
| `border` | 1px solid `hairline` |
| `lift` | `0 2px 12px rgba(23, 26, 22, 0.06)` — floating overlap cards only |

Elevation appears exactly twice: the floating callout card overlapping the hero imagery, and the FAQ panel overlapping the image collage. Everywhere else is flat with a hairline.

---

## 6. Components

### Buttons
- **Primary:** pill, `accent` fill, white label, 15px/500, padding 12px 24px.
- **Secondary:** pill, `surface` fill, 1px `accent` border, `accent` label.
- **Text:** `accent` label with a trailing arrow glyph, no fill.
- **Icon action:** 40px circle, `accent` fill, white arrow — used bottom-right on featured listing cards, as in the sample.

Labels are verb-first and sentence case: *Explore properties*, *Enquire about this plot*, *Book an inspection*. Never *Submit* or *Click here*.

### Listing card
`surface` fill, `radius-card`, hairline border, no shadow. Image at 4:3 with `radius-card` on the top corners.

Body order — this order is fixed across both tracks so scanning is consistent:
1. Title type badge (land) or build stage badge (homes)
2. Listing name, `heading`
3. One-line description, `caption` in `ink-secondary`
4. Price, `display-m` in tabular figures — or *Price on request* at `heading` in `ink-muted`
5. Sub-line: area or bedrooms, `caption` in `ink-muted`
6. Status badge, bottom-left

### Filter bar
Horizontal row of pill chips above the grid. Idle: `surface` fill, hairline border, `ink-secondary` label. Selected: `accent-tint` fill, `accent` border and label. Range filters open a small popover, never a modal.

### Accordion
Hairline divider between rows, question at `heading`, a `+` / `−` glyph right-aligned in `accent`. Open state reveals `body` copy in `ink-secondary`. Used for FAQ and resource pages.

### Testimonial
Circular 48px avatar, name at `body`/500, role at `caption`/`ink-muted`, quote at `display-m` weight 400, centred, with a large quote glyph in `accent-tint` above it.

### Forms
Fields are 44px minimum for touch, `surface` fill, hairline border, `radius-control`. Focus: 2px `accent` ring, no glow. Labels sit above fields at `caption`. Errors appear inline beneath the field in `#A33A2D`, and state what to do: *Enter a phone number we can reach you on*.

### Footer
`deep` bar across the full width. Three columns — contact, socials, newsletter — at `body` in a light tint of canvas. The line *A Rakuxon company* sits in the bottom rule at `caption`, with the parent's name as the only Rakuxon reference on the site.

---

## 7. Signature element — the title ribbon

Every piece of land in Nigeria is bought against the fear that the paperwork isn't real. So the one place this design spends boldness is documentation.

**On land cards:** a pill badge in `accent-tint` with `accent` text carrying the title type — *C of O*, *Governor's consent*, *Gazette*, *Deed of assignment*, *Excision*. It sits above the listing name, before anything else, including price. It is the first thing read.

**On plot detail:** a full-width ribbon directly beneath the gallery — `accent-tint` band, hairline top and bottom, holding the title type, survey number, and a list of available documents with a small file glyph each. Before the description. Before the price.

**Where a listing has weaker documentation** — survey only — the badge renders in the neutral `status-sold` palette rather than sage, and the ribbon states plainly what is and isn't available. Do not hide it. A site that shows title honestly beats one that shows it selectively, and the honesty is the differentiator against every competitor in this market.

Nothing else on the page competes at this level of emphasis.

---

## 8. Imagery

- **Land:** wide establishing shots showing boundaries, access roads, and terrain. Buyers want to see the edges of what they're buying, not a mood.
- **Homes:** exterior first, then interiors, then floor plan.
- **Estates:** dated development progress shots. A sequence proves delivery in a way a render never will.
- Aspect ratios: 4:3 cards, 16:9 hero, 3:4 portrait for collage tiles.
- Renders must be labelled *Artist's impression* at `caption` in `ink-muted`. Non-negotiable on off-plan listings.

---

## 9. Motion

Restrained. The sample is still, and stillness is part of its credibility.

- Section headings and cards: fade and 12px rise on scroll into view, 400ms, ease-out, staggered 60ms across a grid.
- Hover: card border darkens to `ink-muted`, image scales 1.02 over 300ms.
- Carousels: 300ms slide.
- No parallax, no counters, no autoplay.
- All of it wrapped in `prefers-reduced-motion: reduce`.

---

## 10. Tailwind theme

```js
theme: {
  extend: {
    colors: {
      canvas: '#F1F4EF',
      surface: '#FFFFFF',
      ink: { DEFAULT: '#171A16', secondary: '#5C635B', muted: '#8E948C' },
      accent: { DEFAULT: '#3E7350', hover: '#325D41', tint: '#E7EFE8' },
      hairline: '#E2E7DF',
      deep: '#101310',
      status: {
        available: '#3E7350', availableBg: '#E7EFE8',
        reserved: '#8A6A1F', reservedBg: '#F6EFDD',
        sold: '#6B6F69', soldBg: '#EDEFEB',
      },
    },
    fontFamily: {
      display: ['var(--font-instrument-sans)', 'sans-serif'],
      sans: ['var(--font-inter)', 'sans-serif'],
    },
    fontSize: {
      'display-xl': ['4rem',    { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      'display-l':  ['3rem',    { lineHeight: '1.1',  letterSpacing: '-0.025em' }],
      'display-m':  ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      heading:      ['1.5rem',  { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      'body-l':     ['1.0625rem', { lineHeight: '1.6' }],
      body:         ['0.9375rem', { lineHeight: '1.6' }],
      caption:      ['0.8125rem', { lineHeight: '1.5' }],
      eyebrow:      ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.04em' }],
    },
    borderRadius: { control: '8px', card: '12px', 'image-l': '16px' },
    boxShadow: { lift: '0 2px 12px rgba(23, 26, 22, 0.06)' },
  },
}
```

---

## 11. What not to do

- No pure white page background. The canvas tint is the identity.
- No bold weight for emphasis. Go up a size instead.
- No centred section headings — the asymmetric pairing is the rhythm.
- No second accent colour. Sage carries everything; status colours are not accents.
- No shadows on listing cards. Hairlines only.
- No stock-photo people. Land and buildings only, plus real buyer photographs in testimonials.
- No price on a card without either a figure or an explicit *Price on request* — never a blank.
