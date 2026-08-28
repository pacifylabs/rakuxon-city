# Open Graph (OG) Image Setup Guide

This guide explains how the OG (Open Graph) metadata and social sharing images work in Rakuxon City.

## Overview

Open Graph metadata controls how your site appears when shared on social media platforms (Facebook, Twitter, LinkedIn, WhatsApp, Slack, etc.). The most important element is the preview image that appears with your link.

## Current Implementation

### 1. Default Fallback Image
- **Location**: `/public/images/og.jpg`
- **Recommended Dimensions**: 1200×630px (1.91:1 aspect ratio)
- **Current Dimensions**: 1274×932px (needs optimization)
- **Format**: JPEG (optimized for fast loading)
- **File Size**: Aim for < 300KB for fast preview generation

### 2. Dynamic Images Per Page

The site uses a three-tier image system:

#### Tier 1: Database-Managed OG Images
- **Homepage**: Uses `site.ogImage` placement from database
- **Editable**: Via admin dashboard (Phase 7)
- **Fallback**: Falls back to `/public/images/og.jpg` if not set

#### Tier 2: Content-Specific Images
- **Estates**: First estate image becomes OG image
- **Listings (Land/Homes)**: First listing image becomes OG image
- **Articles**: First article image becomes OG image
- **Video Tours**: YouTube thumbnail or first video image

#### Tier 3: Fallback
- **All other pages**: Use `/public/images/og.jpg`
- **No image available**: Automatically falls back to default

## Production Setup Checklist

### Required Actions

1. **Replace OG Image**
   ```bash
   # Current: 1274×932px
   # Replace with: 1200×630px optimized JPEG
   
   # Location
   /public/images/og.jpg
   ```

2. **Optimize Image**
   - Resize to exactly 1200×630px
   - Use JPEG format with 80-85% quality
   - Target file size: 200-300KB
   - Use tools like:
     - Photoshop/Figma export
     - https://squoosh.app
     - ImageMagick: `convert og.jpg -resize 1200x630 -quality 85 og-optimized.jpg`

3. **Set Production URL**
   ```env
   # .env
   NEXT_PUBLIC_SITE_URL="https://rakuxoncity.com"
   ```
   
   This is **critical** - without it, OG images will have localhost URLs in production.

4. **Update Twitter Handle (Optional)**
   ```typescript
   // src/lib/seo.ts
   // Update these lines with your actual Twitter handle:
   creator: "@rakuxoncity", // Change to your handle
   site: "@rakuxoncity",    // Change to your handle
   ```

5. **Add Site Verification Tokens (Optional but Recommended)**
   ```typescript
   // src/app/layout.tsx
   verification: {
     google: "your-google-verification-code",
     yandex: "your-yandex-verification-code", 
     bing: "your-bing-verification-code",
   }
   ```

### Optional Enhancements

6. **Set Up Database OG Image** (Phase 7)
   - Upload a custom OG image via admin dashboard
   - Assign to `site.ogImage` placement
   - This will override the static `/public/images/og.jpg`

7. **Create Multiple OG Images**
   - Create section-specific images for better targeting
   - Example: Different images for Land, Homes, Estates sections

## Design Guidelines for OG Images

### Safe Zone
- **Critical content**: Keep within 1200×600px center
- **Text**: Minimum 60px from edges
- **Logos**: Position in upper corners or center

### Text Specifications
- **Headline**: 60-80px bold sans-serif
- **Subtext**: 30-40px regular weight
- **Maximum text**: ~12 words total
- **Contrast**: Ensure 4.5:1 minimum contrast ratio

### Brand Elements
- Include Rakuxon City logo
- Use brand colors (charcoal, champagne, ivory)
- Maintain consistency with site design

### Content Recommendations
- Show real estate imagery
- Include trust indicators ("Certificate of Occupancy", "Delivered Estates")
- Feature clear benefit statement
- Avoid clutter - one clear message

## Testing Your OG Images

### Testing Tools

1. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Tests: Facebook, Instagram, WhatsApp
   - Shows: Image preview, title, description
   - Feature: Force cache refresh

2. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Tests: Twitter/X previews
   - Shows: Card type, image, text

3. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Tests: LinkedIn previews
   - Feature: Cache refresh

4. **General Preview Tool**
   - URL: https://www.opengraph.xyz/
   - Tests: Multiple platforms
   - Shows: How link appears across platforms

### Testing Checklist

- [ ] Image loads quickly (< 1 second)
- [ ] Image displays at correct size (not stretched/cropped badly)
- [ ] Text is readable at small sizes
- [ ] Title and description appear correctly
- [ ] No broken images or 404 errors
- [ ] Test on mobile and desktop previews
- [ ] Verify absolute URLs (not localhost in production)

## Technical Details

### Metadata Structure

```typescript
// Every page includes:
{
  openGraph: {
    title: "Page Title — Rakuxon City",
    description: "Page description...",
    url: "https://rakuxoncity.com/page",
    type: "website", // or "article" for blog posts
    locale: "en_NG",
    siteName: "Rakuxon City",
    images: [{
      url: "https://rakuxoncity.com/images/og.jpg",
      width: 1200,
      height: 630,
      alt: "Image description",
      type: "image/jpeg"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title — Rakuxon City",
    description: "Page description...",
    images: ["https://rakuxoncity.com/images/og.jpg"],
    creator: "@rakuxoncity",
    site: "@rakuxoncity"
  }
}
```

### Image Priority

1. Page-specific image from `generateMetadata()`
2. Content image (estate/listing/article first image)
3. Database `site.ogImage` placement
4. Default `/public/images/og.jpg`

### URL Resolution

All image URLs are automatically converted to absolute URLs using the `NEXT_PUBLIC_SITE_URL` environment variable. Relative URLs like `/images/og.jpg` become `https://rakuxoncity.com/images/og.jpg`.

## Common Issues & Solutions

### Issue: Image not updating on social media
**Solution**: Use Facebook Debugger or LinkedIn Inspector to clear cache and fetch fresh metadata.

### Issue: Wrong image appears
**Solution**: Check image priority order. Page-specific images override defaults.

### Issue: Image appears stretched/cropped
**Solution**: Ensure image is exactly 1200×630px. Avoid images with critical content at edges.

### Issue: localhost URL in production
**Solution**: Set `NEXT_PUBLIC_SITE_URL` environment variable to production domain.

### Issue: Image too large / slow loading
**Solution**: Optimize JPEG to 80-85% quality. Target 200-300KB file size.

### Issue: No image appears
**Solution**: Verify `/public/images/og.jpg` exists and is accessible at `/images/og.jpg`.

## Platform-Specific Notes

### Facebook/Instagram
- Caches aggressively (use debugger to refresh)
- Prefers 1200×630px
- Shows title + description below image

### Twitter/X
- Uses `summary_large_image` card type
- Image appears above text
- 2:1 aspect ratio works well

### LinkedIn
- Professional audience - use high-quality imagery
- Can override with LinkedIn-specific tags if needed
- Caches for ~7 days

### WhatsApp
- Uses Facebook's OG parser
- Shows compact preview with image
- Image quality important for mobile

### Slack/Discord
- Uses OG tags
- Shows rich unfurls with image
- Can be disabled by users

## Support

For questions or issues with OG image setup:
1. Check this guide first
2. Test with the debugging tools listed above
3. Verify environment variables are set correctly
4. Check Next.js build logs for metadata errors

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
