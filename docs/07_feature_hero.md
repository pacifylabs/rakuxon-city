# Feature Addendum — Full-Bleed Hero

**Project:** Rakuxon City
**Version:** 1.0
**Applies to:** the homepage hero only. No other page changes.
**Reference:** `07_REFERENCE_HERO.png`
**Amends:** `01_SITE_ARCHITECTURE.md` §5.1 item 1, `04_DESIGN_SYSTEM.md` §8 (carve-out added at v2.1)

---

## 1. What changes, and what this costs

The hero becomes **full-bleed** — a near-full-viewport photograph with the headline, supporting copy, and actions overlaid, plus a floating feature panel top-right and an overlaid pill navigation.

**The existing background image rotation is retained.** Do not build a new carousel, do not source new images, do not change the interval. The current transition logic stays; only its container, scrim, and styling change.

**Be clear about the trade.** The approved layout in `05_REFERENCE_UI.png` opens light and editorial — headline on canvas, imagery below it. This replaces that with a dark cinematic opening. Two consequences worth accepting knowingly:

1. The first impression shifts from *editorial and calm* toward *cinematic and premium*. Everything below the hero stays as built, so the page now has two registers. That reads as intentional if the transition into the ivory canvas is clean, and as inconsistent if it isn't. §7 covers that seam.
2. A full-viewport image becomes the LCP element on a 3G Android. This is now the single largest performance risk in the project, ahead of the video tours. §5 is not optional.

---

## 2. Structure

```
<section> full-bleed, height 88svh (desktop) / 92svh (mobile)
  ├── Background layer — rotating images, crossfade, absolute inset-0
  ├── Scrim layer — fixed gradient, absolute inset-0
  ├── Header — overlaid pill navigation, absolute top
  ├── Feature panel — floating, top-right, desktop only
  └── Content block — bottom-left aligned
        ├── Headline (display-xl)
        ├── Supporting paragraph (body, max 52ch)
        └── Two actions
```

**Height is 88svh, not 100vh.** Two reasons: `svh` avoids the mobile browser-chrome jump that `vh` causes, and stopping short of full height lets the next section peek above the fold, which measurably improves scroll-through. Never `100vh`.

---

## 3. Content

The reference sells "luxury living". Ours sells **verified land and homes**, so the panel content changes even though the layout doesn't.

**Headline:** two lines, `display-xl`, weight 400, `ivory-light`. One emphasis word in `champagne-light` — see §4.

**Supporting paragraph:** `body` in `ivory` at 90% opacity, capped at 52 characters per line.

**Actions:** two, side by side.
- Primary: `champagne` fill, **`charcoal` label** — *Explore properties*
- Secondary: `charcoal-soft` fill at 85% with a 1px `border-dark` border, `ivory-light` label — *Book an inspection*

**Feature panel (top-right):** the reference lists lifestyle features. Ours lists **verification**, tying the hero to the title ribbon:

- Verified title documentation
- Registered survey plans
- Gazette and C of O plots
- Estate infrastructure in place
- Structured payment plans
- Handover support

Each with a small `champagne` glyph. Panel is `charcoal-soft` at 78% opacity with `backdrop-blur-md`, 1px `border-dark`, `radius-card`, `ivory-light` text at `caption`. Hidden below `lg` — it is the first thing to go on mobile.

---

## 4. Scrim — the part that must be exact

Text sits over photographs that change every few seconds. Contrast cannot be verified per-image, so the scrim must be strong enough for the **brightest image in the rotation**, not the average.

```css
/* Applied as a single layer above the images, below all content */
background:
  linear-gradient(
    to top,
    rgba(13, 15, 14, 0.88) 0%,
    rgba(13, 15, 14, 0.72) 32%,
    rgba(13, 15, 14, 0.42) 62%,
    rgba(13, 15, 14, 0.30) 100%
  );
```

A second, softer horizontal pass from the left improves the bottom-left content block without darkening the whole frame:

```css
background:
  linear-gradient(to right, rgba(13,15,14,0.55) 0%, rgba(13,15,14,0) 55%);
```

**Verification requirement:** measure `ivory-light` against the composited hero at the headline's position for **every image in the rotation**, not just the first. Minimum 4.5:1. If any image fails, deepen the scrim — never lighten the text, never swap the image.

`champagne-light` (`#D8BF91`) on the scrimmed ground at the headline position measures comfortably above 4.5:1 and is the only permitted use of gold over photography on the site.

---

## 5. Performance — mandatory

The hero is now the LCP element. Targets from `02_PRD.md` §6 are unchanged: LCP under 2.5s on a mid-range Android over 3G.

1. **Only the first image is eager.** `priority` on image one; every other image in the rotation loads lazily after the `load` event or on `requestIdleCallback`. Never preload the whole set.
2. **Responsive sources.** `next/image` with `fill`, `sizes="100vw"`, AVIF then WebP. Serve a genuinely smaller mobile crop — not the desktop file scaled down.
3. **A dominant-colour or blurred placeholder** behind image one so the scrim and text render before the photograph arrives. Text must never appear over an empty white box.
4. **Crossfade only** — opacity transition, 800ms. No zoom, no Ken Burns, no parallax. Motion over a 2MB image on a mid-range phone stutters and looks cheap.
5. **Pause the rotation** when the hero is scrolled out of view (`IntersectionObserver`) and when the tab is hidden.
6. **`prefers-reduced-motion: reduce` stops rotation entirely** and shows image one only.
7. **Cap the rotation at 4 images.** More is unnecessary and multiplies the payload.
8. **Budget:** each hero image ≤ 250KB at mobile width, ≤ 500KB at desktop width, after conversion.

---

## 6. Overlaid navigation

The header now sits on the photograph, which changes its requirements.

- **At scroll top:** pill navigation with `charcoal-soft` at 55% and `backdrop-blur-sm`, `ivory-light` labels. The pill background is required — labels directly on a rotating photograph will fail contrast on at least one image.
- **On scroll past the hero:** transitions to a solid `background` bar with `foreground` labels and a 1px `line` bottom border. 200ms.
- Logo is `ivory-light` at top, `foreground` after transition.
- The *Contact us* action is `champagne` fill with a `charcoal` label in both states.
- **Mobile:** panel hidden, navigation collapses to a hamburger in a `charcoal-soft` blurred circle.

---

## 7. The seam into the page

The hero ends dark and the next section is ivory. Handle it deliberately or it looks like two websites glued together.

- No decorative wave, no diagonal cut, no gradient fade between them. A clean horizontal edge is correct for this design's restraint.
- The section immediately below is the **two-lane block**, on `background`, with the standard 96px top padding. The abrupt light-to-dark contrast is the point — it reads as a title sequence ending and the document beginning.
- Do not add a scroll-hint chevron. The next section already peeks above the fold by design.

---

## 8. Accessibility

- Rotating images are decorative — `alt=""` — since the headline carries the meaning. Do not write alt text describing each property; a screen reader announcing a new image every six seconds is hostile.
- The rotation must not be the only route to any information.
- Focus states on hero actions use a 2px `ivory-light` ring, not charcoal, since charcoal on the scrim is invisible.
- Headline is a single `<h1>`; the emphasis word is a `<span>`, never a separate heading.

---

## 9. Acceptance criteria

1. Hero renders at 88svh desktop, 92svh mobile, with no browser-chrome jump on mobile scroll.
2. `ivory-light` at the headline position measures ≥ 4.5:1 against **every** image in the rotation.
3. Only one hero image is fetched before the `load` event, verified in the network panel.
4. Homepage LCP stays under 2.5s on a simulated mid-range Android over 3G.
5. Rotation pauses off-screen, pauses on hidden tab, and stops entirely under reduced motion.
6. Navigation is legible at scroll top over every image, and transitions to the solid bar on scroll.
7. The feature panel is absent below `lg` with no layout shift.
8. Champagne appears in the hero in exactly two places: the emphasis word and the primary action. Nowhere else.
9. Homepage Lighthouse mobile performance ≥ 85 and accessibility ≥ 95, unchanged from before this feature.

---

## 10. What not to do

- No `100vh`.
- No new carousel library — retain the existing rotation logic.
- No new images sourced. The current set, recropped and recompressed only.
- No zoom, parallax, or Ken Burns.
- No gold scrim, gold tint, or gold wash over the photograph. The emphasis word is the entire exception.
- No white text on the champagne action. Charcoal label, always.
- No autoplaying video in the hero.
- No text over an unscrimmed photograph anywhere, at any breakpoint.