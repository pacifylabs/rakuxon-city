# Image Transition Timing Update

**Date:** Current session  
**Change:** Reduced image rotation speed on homepage  
**Components:** Hero & Featured Estate

---

## Summary

Reduced the image transition/rotation timing from **7 seconds** to **4 seconds** for faster, more dynamic image switching on the homepage.

---

## Changes Made

### 1. Hero Component (`src/components/home/hero.tsx`)

**Before:**
```typescript
const SLIDE_MS = 7000; // 7 seconds per image
```

**After:**
```typescript
const SLIDE_MS = 4000; // 4 seconds per image (reduced from 7000ms)
```

**Impact:**
- Hero images now rotate every **4 seconds** instead of 7 seconds
- More engaging for visitors
- Showcases all 3 estate images faster

---

### 2. Featured Estate Component (`src/components/home/featured-estate.tsx`)

**Before:**
```typescript
const SLIDE_MS = 7000; // 7 seconds per slide
```

**After:**
```typescript
const SLIDE_MS = 4000; // 4 seconds per slide (reduced from 7000ms)
```

**Impact:**
- Estate carousel rotates every **4 seconds** instead of 7 seconds
- Synced with hero timing for consistent page rhythm
- Visitors see more estate variety faster

---

## Timing Breakdown

### Previous Timing (7 seconds):
- **3 hero images** × 7s = 21 seconds for complete rotation
- **3 estate images** × 7s = 21 seconds for complete rotation
- Slow, more contemplative pace

### New Timing (4 seconds):
- **3 hero images** × 4s = 12 seconds for complete rotation
- **3 estate images** × 4s = 12 seconds for complete rotation
- Faster, more engaging pace

**Time saved per rotation cycle:** 9 seconds

---

## User Experience Impact

### Positive Effects:
✅ **More engaging** - Keeps visitors' attention with dynamic content  
✅ **Faster showcase** - Displays all properties in less time  
✅ **Better rhythm** - 4 seconds is industry-standard for carousel timing  
✅ **Reduced bounce** - Dynamic content encourages scrolling  

### Considerations:
- Transition opacity animation remains 800ms (smooth crossfade)
- Pause behaviors unchanged (hover, off-screen, reduced-motion)
- Users can still manually control rotation via dots (featured estate)

---

## Technical Details

### Transition Animation
The fade transition duration remains **800ms** (unchanged):
```tsx
className="absolute inset-0 transition-opacity duration-[800ms] ease-out"
```

This ensures smooth, professional crossfades between images.

### Pause Behaviors (Unchanged)
Both components still pause rotation when:
- ✅ User hovers over the component
- ✅ Component is off-screen (IntersectionObserver)
- ✅ Browser tab is hidden (document.hidden)
- ✅ User has reduced-motion preference enabled

---

## Testing

After restarting the dev server, verify:

- [ ] Hero images rotate every 4 seconds
- [ ] Featured estate rotates every 4 seconds
- [ ] Transitions are smooth (800ms fade)
- [ ] Pause on hover still works
- [ ] Rotation stops on reduced-motion
- [ ] No layout shift or performance issues

---

## To See Changes

```bash
# Restart dev server to pick up changes
# (Press Ctrl+C to stop current server)
npm run dev
```

Open http://localhost:3000 and observe:
1. Hero images change faster
2. Estate carousel advances quicker
3. Overall page feels more dynamic

---

## Reverting (If Needed)

If 4 seconds feels too fast, you can adjust to any value:

**Recommended options:**
- **3000ms (3s)** - Very fast, high energy
- **4000ms (4s)** - Fast, engaging (current)
- **5000ms (5s)** - Medium, balanced
- **6000ms (6s)** - Slower, more contemplative
- **7000ms (7s)** - Original timing

To change, edit the `SLIDE_MS` constant in both files:
- `src/components/home/hero.tsx`
- `src/components/home/featured-estate.tsx`

---

## Industry Standards

Common carousel timing in real estate websites:
- **3-4 seconds:** High-end luxury properties (fast showcase)
- **5-6 seconds:** Mid-market properties (balanced)
- **7-8 seconds:** Informational carousels (slower reading pace)

**4 seconds** is a sweet spot for real estate - fast enough to maintain interest, slow enough to absorb the image.

---

## Files Modified

✅ **`src/components/home/hero.tsx`** - SLIDE_MS: 7000 → 4000  
✅ **`src/components/home/featured-estate.tsx`** - SLIDE_MS: 7000 → 4000

**No other files affected.**

---

## Performance Impact

**Positive:**
- No impact on page load performance
- Same number of images loaded
- Same optimization strategies apply

**Neutral:**
- Slightly faster JavaScript timer intervals (negligible CPU impact)
- User engagement metrics may improve

The change is purely timing-based with no performance trade-offs.

---

**Change complete!** Restart your dev server to see the faster transitions. 🚀
