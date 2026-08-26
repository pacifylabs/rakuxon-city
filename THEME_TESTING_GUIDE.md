# Theme Color Testing Guide

This guide explains how to test different color themes in the Rakuxon City project without modifying component code.

## Overview

All hardcoded color values have been converted to reusable CSS variables in `src/app/globals.css`. This enables easy theme testing and customization through CSS variable overrides.

## Converted Color Variables

### 1. **Scrim Gradients** (Hero Component)
- **Variable**: `--color-scrim-base`
- **Default**: `13, 15, 14` (RGB values of charcoal-deep)
- **Usage**: Powers the two-layer gradient overlay on hero images
- **Location**: `src/components/home/hero.tsx`

### 2. **Shadow Effects**
- **Variable**: `--color-shadow-base`
- **Default**: `23, 25, 24` (RGB values of charcoal)
- **Usage**: Box shadow for elevation effects (`--shadow-lift`)
- **Used**: Callout panels and FAQ sections

## How to Test a Theme

### Method 1: Via HTML Attribute (Recommended)

Add a `data-theme` attribute to the `<body>` or `<html>` element:

```tsx
// In src/app/(public)/layout.tsx or src/app/layout.tsx
<body data-theme="sage-gold">
  {children}
</body>
```

### Method 2: Programmatic Toggle

Add a theme switcher component or browser console command:

```javascript
// Toggle theme in browser console
document.documentElement.dataset.theme = 'sage-gold';

// Revert to default
document.documentElement.dataset.theme = '';
```

### Method 3: Environment Variable

For staging/production splits:

```tsx
// In layout.tsx
const theme = process.env.NEXT_PUBLIC_THEME || 'default';

<body data-theme={theme}>
```

Then set in `.env.local`:
```
NEXT_PUBLIC_THEME=sage-gold
```

## Available Theme Examples

Three example themes are included (commented out) in `src/app/globals.css`:

### 1. Sage & Gold (v1.0 Palette)
```css
[data-theme="sage-gold"] {
  --color-accent: #8B7355;
  --color-accent-hover: #75614A;
  --color-accent-light: #A69080;
  --color-accent-text: #6B5A47;
  --color-accent-tint: #EDE9E3;
}
```

### 2. Monochrome (Charcoal-only)
```css
[data-theme="monochrome"] {
  --color-accent: var(--color-charcoal);
  --color-accent-hover: var(--color-charcoal-deep);
  --color-accent-light: var(--color-taupe-light);
  --color-accent-text: var(--color-charcoal-deep);
  --color-accent-tint: var(--color-ivory);
}
```

### 3. Dark Mode Foundation
```css
[data-theme="dark"] {
  --color-background: var(--color-charcoal-deep);
  --color-foreground: var(--color-ivory-light);
  --color-surface: var(--color-charcoal);
  --color-surface-muted: var(--color-charcoal-soft);
  --color-line: var(--color-charcoal-soft);
  --color-scrim-base: 245, 241, 232; /* ivory RGB */
  --color-shadow-base: 0, 0, 0; /* pure black */
}
```

## Creating a Custom Theme

1. **Open** `src/app/globals.css`
2. **Add** a new `[data-theme="your-theme-name"]` block after the existing examples
3. **Override** only the CSS variables you want to change:

```css
[data-theme="custom-blue"] {
  /* Only override accent colors */
  --color-accent: #4A7BA7;
  --color-accent-hover: #3A6A96;
  --color-accent-light: #7BA4CB;
  --color-accent-text: #2E5876;
  --color-accent-tint: #E8F0F7;
}
```

4. **Activate** by setting `data-theme="custom-blue"` on the body element

## WCAG Compliance Checklist

When creating new themes, verify contrast ratios:

- ✅ **Text on backgrounds**: 4.5:1 minimum (AA standard)
- ✅ **Large text (18pt+)**: 3:1 minimum
- ✅ **UI components** (borders, focus indicators): 3:1 minimum
- ✅ **Hero text over scrim**: 4.5:1 minimum (test with actual images)

**Tools:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Inspect element → Color picker shows contrast ratio
- Firefox DevTools: Accessibility panel

## Current Palette Compliance Notes

The existing charcoal/ivory/champagne palette has three documented WCAG corrections in `globals.css`:

1. `--color-accent-text`: Darkened from #8A6A2F to #81632C (4.56:1 on accent-tint)
2. `--color-line-input`: Darkened from #9A907C to #998F7B (3.01:1 on ivory-light)
3. `--color-muted`: Darkened from #746F66 to #6C6860 (4.92:1 on ivory)

## Files Modified for Modularity

### Changed:
- ✅ `src/app/globals.css` - Added `--color-scrim-base` and `--color-shadow-base` variables
- ✅ `src/components/home/hero.tsx` - Converted hardcoded rgba values to use CSS variables

### No Changes Needed:
- ✅ All components already use semantic tokens
- ✅ Button, Badge, Field components use abstracted variants
- ✅ No hardcoded hex values in component files

## Testing Workflow

1. **Add theme variant** in `globals.css`
2. **Set data-theme** attribute in layout or via console
3. **Refresh browser** - changes apply instantly
4. **Test contrast** with browser DevTools
5. **Verify UI components**: buttons, forms, badges, status indicators
6. **Test hero scrim** against all three estate images

## Reverting Changes

To revert to the default theme:

```javascript
// Remove attribute
document.documentElement.removeAttribute('data-theme');

// Or set to empty
document.documentElement.dataset.theme = '';
```

Or simply remove the `data-theme` attribute from your layout file.

## Advantages of This Approach

✅ **Zero component changes** - All components continue to work unchanged
✅ **Instant switching** - No rebuild required, just refresh browser
✅ **Easy rollback** - Remove attribute to revert instantly
✅ **Feature flag ready** - Can A/B test themes via environment variables
✅ **Staging-safe** - Test themes on staging without affecting production
✅ **Developer-friendly** - Toggle themes via browser console for quick testing

## Example: Quick Browser Testing

Open browser console and test different themes:

```javascript
// Test sage-gold theme
document.documentElement.dataset.theme = 'sage-gold';

// Wait 5 seconds, then test monochrome
setTimeout(() => {
  document.documentElement.dataset.theme = 'monochrome';
}, 5000);

// Wait 5 more seconds, then revert to default
setTimeout(() => {
  document.documentElement.dataset.theme = '';
}, 10000);
```

## Need Help?

Refer to:
- `src/app/globals.css` - All color definitions and theme examples
- `04_design_system.md` - Design system rules and rationale
- `07_feature_hero.md` - Hero scrim specifications and contrast verification

---

**Note**: Theme variants are commented out by default. Uncomment or create your own theme blocks in `globals.css` to start testing.
