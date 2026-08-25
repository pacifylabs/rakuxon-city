# Logo Update Summary

**Date:** Current session  
**Logo File:** `/Users/mac/Desktop/rakuxon-city/public/logo.png`  
**Status:** ✅ **CONFIGURED AND READY**

---

## Current Configuration

The logo at `/public/logo.png` is already configured throughout the application. No additional changes needed beyond updating the seed file size metadata.

### Logo File Details

| Property | Value |
|----------|-------|
| **Path** | `/public/logo.png` |
| **Dimensions** | 2172 × 724 pixels |
| **Format** | PNG (RGBA, 8-bit/color) |
| **File Size** | 924,555 bytes (903 KB) |
| **Aspect Ratio** | 3:1 (wide horizontal mark) |

---

## Where the Logo Appears

### 1. **Header Navigation** (`src/components/layout/header.tsx`)

The logo renders in the header at two sizes:
- **Mobile:** `h-10` (40px height)
- **Desktop:** `h-13` (52px height, sm breakpoint)

**Display behavior:**
```tsx
<Image
  src={logo.url}
  alt={logo.alt}
  width={logo.width}
  height={logo.height}
  priority
  sizes="(min-width: 640px) 216px, 168px"
  className="h-10 w-auto sm:h-13"
/>
```

The logo scales proportionally, maintaining the 3:1 aspect ratio.

### 2. **On Homepage Hero Overlay** (`src/components/layout/header.tsx`)

When on the homepage at scroll top, the logo gets a translucent background:
```tsx
// On homepage hero, before scroll
<span className="inline-flex rounded-full bg-charcoal-soft/55 px-3 py-1.5 backdrop-blur-sm">
  <Image src={logo} ... />
</span>
```

This ensures legibility over the rotating hero photographs.

### 3. **Schema.org Structured Data** (`src/lib/schema.ts`)

The logo is used in JSON-LD markup for SEO:
```typescript
logo: absoluteUrl("/logo.png"),
image: absoluteUrl("/logo.png"),
```

This helps search engines identify the organization's brand mark.

---

## Configuration Files

### 1. **Fallback Configuration** (`src/app/(public)/layout.tsx`)

```typescript
const LOGO_FALLBACK = {
  url: "/logo.png",
  alt: "Rakuxon City",
  width: 2172,
  height: 724,
};
```

**Purpose:** If the database placement is missing, the app falls back to this. Ensures the site never appears without a logo.

### 2. **Database Seed** (`prisma/seed.ts`) ✅ **UPDATED**

```typescript
const logo = await prisma.media.create({
  data: {
    url: "/logo.png",
    alt: "Rakuxon City",
    width: 2172,
    height: 724,
    mimeType: "image/png",
    sizeBytes: 924_555,  // ← Updated from 502_823
    isStandIn: false,
  },
});
```

**Change made:** Updated `sizeBytes` to match the actual file size (924,555 bytes).

### 3. **Media Placement** (`prisma/seed.ts`)

```typescript
{
  key: "site.logo",
  mediaId: logo.id,
  label: "Site logo",
  guidance: "Wide mark, transparent background. Renders at 32px tall in the header.",
}
```

This creates an editable slot in the admin UI (Phase 7) where the logo can be swapped without code changes.

---

## Data Flow

```
┌─────────────────────────────────────────────────┐
│ 1. Layout loads                                 │
│    src/app/(public)/layout.tsx                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. Fetch placement: getPlacement("site.logo")  │
│    Queries database for MediaPlacement record  │
└────────────────┬────────────────────────────────┘
                 │
                 ├─── Found ──────────────────────┐
                 │                                 │
                 │                                 ▼
                 │                    ┌────────────────────────┐
                 │                    │ Returns Media record   │
                 │                    │ { url, width, height } │
                 │                    └────────┬───────────────┘
                 │                             │
                 └─── Not Found ───────────────┤
                                               │
                                               ▼
┌─────────────────────────────────────────────────┐
│ 3. Use logo (from DB) or LOGO_FALLBACK         │
│    const logo = (await ...) ?? LOGO_FALLBACK   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 4. Pass to Header component                    │
│    <Header logo={logo} />                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 5. Render with next/image                      │
│    <Image src={logo.url} ... />                │
│                                                 │
│    URL: /logo.png                              │
│    Served from: public/logo.png                │
└─────────────────────────────────────────────────┘
```

---

## Responsive Behavior

The logo adapts across viewport sizes:

| Viewport | Logo Height | Approx Width | Context |
|----------|-------------|--------------|---------|
| Mobile (<640px) | 40px | ~120px | Standard header |
| Desktop (≥640px) | 52px | ~156px | Standard header |
| Mobile on hero | 40px | ~120px | With translucent pill background |
| Desktop on hero | 52px | ~156px | With translucent pill background |

The width automatically scales to maintain the 3:1 aspect ratio.

---

## Next.js Image Optimization

The logo is automatically optimized by Next.js:

1. **Format conversion:** Serves WebP/AVIF to supporting browsers
2. **Size variants:** Generates optimized sizes based on `sizes` attribute
3. **Priority loading:** Uses `priority` flag for immediate fetch (no lazy loading)
4. **Responsive:** `sizes="(min-width: 640px) 216px, 168px"` tells browser expected display size

**Example optimized URL:**
```
/_next/image?url=%2Flogo.png&w=384&q=75
```

---

## Verification Checklist

To confirm the logo is displaying correctly:

- [ ] Logo appears in header on all pages
- [ ] Logo is 40px tall on mobile, 52px on desktop
- [ ] Logo maintains 3:1 aspect ratio (no stretching/squashing)
- [ ] Logo has translucent background on homepage hero (at scroll top)
- [ ] Logo transitions to normal display after scrolling past hero
- [ ] Logo is sharp/crisp at all display sizes (not pixelated)
- [ ] Logo file loads from `/logo.png` (check Network tab)
- [ ] Logo has correct alt text: "Rakuxon City"

---

## Design Specifications

Per `TODO.md` §1.1 and `04_DESIGN_SYSTEM.md`:

> **The logo is navy and gold** — the palette that replaced sage in v2.0 is drawn directly from this mark. The champagne accent exists because the logo brought it, and the documentation semantics (§7, the title ribbon) justify keeping it.

**Color palette derived from logo:**
- **Navy/Charcoal:** Primary brand color (`#171918`)
- **Gold/Champagne:** Accent color (`#C5A46D`) for seals, verification, emphasis

The design system's champagne accent is intentionally aligned with the logo's gold, creating visual consistency between the brand mark and the UI.

---

## File Updated

✅ **`prisma/seed.ts`** - Updated `sizeBytes` from 502,823 to 924,555 to match actual file size

**No other changes required.** The logo was already correctly configured at `/public/logo.png` with proper dimensions throughout the application.

---

## Admin UI (Phase 7)

Once Phase 7 is implemented, the logo can be changed via:

1. Navigate to **Settings → Media Placements**
2. Find the **"Site logo"** placement
3. Upload a new logo file
4. The new logo appears immediately across the site (no code deployment needed)

**Requirements for replacement logo:**
- Wide horizontal mark (recommended 3:1 to 4:1 aspect ratio)
- Transparent background (PNG with alpha channel)
- Minimum width: 600px (for retina displays)
- File size: <1MB recommended

The guidance text in the database reminds admins: "Wide mark, transparent background. Renders at 32px tall in the header."
