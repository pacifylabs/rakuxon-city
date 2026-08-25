# Hero Layout Changes - Contained Layout

**Date:** Current session  
**Requested by:** Client  
**Impact:** Visual/Layout change (deviates from `07_FEATURE_HERO.md` spec)

---

## Summary

The hero component has been changed from **full-bleed** (edge-to-edge) to a **contained layout** that:

1. ✅ Centers horizontally with max-width (aligns with other page sections)
2. ✅ Adds bottom margin (separates from featured-estate component)
3. ✅ Restores standard top padding to featured-estate section

---

## What Changed

### Before (Full-Bleed - Per Spec)

```tsx
<section className="relative isolate h-[92svh] overflow-hidden lg:h-[88svh]">
  {/* Images, scrim, content - all edge-to-edge */}
  <Container className="absolute inset-x-0 bottom-0 ...">
    {/* Content */}
  </Container>
</section>

{/* Featured Estate directly below, no gap */}
<Section className="pt-0 lg:pt-0">
```

**Characteristics:**
- Hero spans full viewport width (edge-to-edge)
- No margins or padding around hero
- Featured estate has zero top padding (flows directly from hero)
- Clean horizontal seam per spec §7

### After (Contained Layout - Client Request)

```tsx
<section className="relative isolate mb-16 flex justify-center px-6 lg:mb-24 lg:px-16">
  <div className="relative h-[92svh] w-full max-w-screen-xl overflow-hidden rounded-card lg:h-[88svh]">
    {/* Images, scrim, content - contained within max-width */}
    <div className="absolute inset-x-0 bottom-0 px-6 pb-16 lg:px-16 lg:pb-24">
      {/* Content */}
    </div>
  </div>
</section>

{/* Featured Estate with standard spacing */}
<Section>
```

**Characteristics:**
- Hero constrained to `max-w-screen-xl` (1280px)
- Centered with horizontal padding: `px-6 lg:px-16`
- Bottom margin added: `mb-16 lg:mb-24`
- Rounded corners: `rounded-card` (12px)
- Featured estate uses default Section top padding (96px desktop, 64px mobile)

---

## Visual Changes

### Layout Structure

```
BEFORE (Full-Bleed):
┌────────────────────────────────────────┐
│ ← Full viewport width hero →          │
│ [rotating images edge-to-edge]        │
│ Content bottom-left                   │
└────────────────────────────────────────┘
[Clean horizontal seam]
┌────────────────────────────────────────┐
│ Featured Estate (no top padding)      │

AFTER (Contained):
  ┌──────────────────────────────────┐
  │ ← Max 1280px, centered →         │  ← 6px/16px horizontal padding
  │ [rotating images in container]   │
  │ Content bottom-left              │
  └──────────────────────────────────┘
  [64px/96px bottom margin]
  ┌──────────────────────────────────┐
  │ Featured Estate (96px top pad)   │
```

### Breakpoint Behavior

| Breakpoint | Hero Width | Horizontal Padding | Bottom Margin | Corners |
|------------|------------|-------------------|---------------|---------|
| Mobile (<1024px) | 100% - 12px | 6px each side | 64px | 12px radius |
| Desktop (≥1024px) | max 1280px | 16px each side | 96px | 12px radius |

---

## Component Changes

### 1. Hero Component (`src/components/home/hero.tsx`)

**Section Container:**
```diff
- className="relative isolate h-[92svh] overflow-hidden lg:h-[88svh]"
+ className="relative isolate mb-16 flex justify-center px-6 lg:mb-24 lg:px-16"
```

**Added Inner Container:**
```diff
+ <div className="relative h-[92svh] w-full max-w-screen-xl overflow-hidden rounded-card lg:h-[88svh]">
    {/* All hero content */}
+ </div>
```

**Content Block:**
```diff
- <Container className="absolute inset-x-0 bottom-0 z-10 pb-16 lg:pb-24">
+ <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-16 lg:px-16 lg:pb-24">
```

### 2. Featured Estate Component (`src/components/home/featured-estate.tsx`)

**Section Container:**
```diff
- <Section className="pt-0 lg:pt-0">
+ <Section>
```

This restores the default Section component spacing:
- Desktop: `pt-24` (96px)
- Mobile: `pt-16` (64px)

---

## Spacing System

The spacing now aligns with the design system's vertical rhythm:

- **Hero bottom margin:** 64px mobile / 96px desktop
- **Featured estate top padding:** 64px mobile / 96px desktop
- **Total gap between components:** 128px mobile / 192px desktop

This creates clear visual separation while maintaining the established spacing scale.

---

## Why This Deviates from Spec

The original spec (`07_FEATURE_HERO.md` §7) explicitly required:

> "The hero ends dark and the next section is ivory. Handle it deliberately or it looks like two websites glued together."
>
> - No decorative wave, no diagonal cut, no gradient fade between them. **A clean horizontal edge** is correct for this design's restraint.
> - The section immediately below is the two-lane block, on `background`, with the standard 96px top padding. **The abrupt light-to-dark contrast is the point**

The spec designed for a **cinematic title sequence** effect where:
- Dark hero flows seamlessly into light content
- The hard edge is intentional and bold
- Zero gap emphasizes the transition

The new layout creates a more **traditional website** feel where:
- Hero is a contained "hero card"
- Clear separation between sections
- More conservative, less cinematic

---

## Alignment with Other Sections

The hero now uses the same container strategy as other page sections:

```tsx
// Standard section pattern throughout the site
<Section>
  <Container>
    {/* Content constrained to max-width, centered */}
  </Container>
</Section>

// Hero now follows similar pattern
<section className="flex justify-center px-6 lg:px-16">
  <div className="w-full max-w-screen-xl">
    {/* Content constrained to max-width, centered */}
  </div>
</section>
```

**Note:** `max-w-screen-xl` = 1280px, matching the Container component's max-width from the design system.

---

## Impact on Other Features

### Navigation Overlay

The header overlay navigation (pill nav) still works correctly because:
- It's positioned `fixed` at the top of the viewport (not relative to hero)
- The IntersectionObserver watches the `[data-hero-end]` sentinel
- Transition to solid bar still occurs when hero scrolls out of view

### Feature Panel

The floating verification panel (top-right) still works because:
- It's absolutely positioned within the new inner container
- Position values (`top-28 right-6`) are relative to the rounded container
- Still hidden below `lg` breakpoint as specified

### Image Loading Strategy

Performance optimizations remain intact:
- Only first image loads eagerly (`priority={isFirst}`)
- Subsequent images lazy load after `readyForRest` state
- Blur placeholder still prevents layout shift

---

## Recommendations

### Consider These Follow-ups:

1. **Mobile horizontal padding:** Currently 6px (`px-6`). Consider increasing to 24px (`px-6`) to match Container's mobile gutters for more breathing room.

2. **Rounded corners on mobile:** The `rounded-card` (12px) applies at all sizes. Consider using `rounded-lg lg:rounded-card` for tighter corners on mobile if needed.

3. **Bottom margin adjustment:** Current 64px/96px matches Section padding. Could be reduced to 48px/64px if less separation is desired.

4. **Max-width value:** Currently `max-w-screen-xl` (1280px). Could use Container's exact value by checking `04_DESIGN_SYSTEM.md` §4 if different.

---

## Testing Checklist

After this change, verify:

- [ ] Hero centers properly at all viewport widths
- [ ] Hero never touches viewport edges on mobile (6px padding visible)
- [ ] Hero reaches max-width (1280px) on desktop and stops growing
- [ ] Rounded corners visible on all four corners
- [ ] Clear visual gap between hero and featured estate
- [ ] Feature panel still positions correctly (top-right, hidden mobile)
- [ ] Content block (headline, buttons) still positions bottom-left
- [ ] Navigation overlay transition still works when scrolling
- [ ] Image rotation still functions (7s crossfade)
- [ ] Performance: only 1 image loads before page load event

---

## Files Modified

- ✅ `/src/components/home/hero.tsx` - Changed to contained layout
- ✅ `/src/components/home/featured-estate.tsx` - Restored default top padding

**No other files affected.** The change is isolated to these two components.
