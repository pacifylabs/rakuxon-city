# 🚀 Production OG Metadata Checklist

Quick checklist for deploying Open Graph metadata to production.

## Pre-Deployment

### ✅ Required Actions

- [ ] **Optimize OG Image**
  ```bash
  # Replace /public/images/og.jpg with:
  # - Dimensions: 1200×630px (exactly)
  # - Format: JPEG
  # - Quality: 80-85%
  # - File size: < 300KB
  # - Content: High-quality brand imagery with text overlay
  ```

- [ ] **Set Production URL**
  ```bash
  # Add to .env (or environment variables)
  NEXT_PUBLIC_SITE_URL="https://rakuxoncity.com"
  
  # ⚠️ CRITICAL: Must be your actual production domain
  # ⚠️ Must include https://
  # ⚠️ No trailing slash
  ```

- [ ] **Install Dependencies**
  ```bash
  pnpm install
  ```

- [ ] **Run Verification**
  ```bash
  pnpm verify:og
  
  # Should show:
  # ✓ 0 errors
  # ⚠️ 0 warnings (or only informational ones)
  ```

### 📝 Recommended (Update When Available)

- [ ] **Update Twitter Handle**
  ```typescript
  // File: src/lib/seo.ts
  // Line ~80-90
  
  creator: "@your_actual_twitter_handle",
  site: "@your_actual_twitter_handle",
  ```

- [ ] **Add Search Verification Tokens**
  ```typescript
  // File: src/app/layout.tsx
  // Line ~75 (in metadata object)
  
  verification: {
    google: "paste-google-console-token-here",
    bing: "paste-bing-webmaster-token-here",
  }
  ```

## Post-Deployment Testing

### 1. Automated Check
```bash
# On production server or after deploy
pnpm verify:og
```

### 2. Facebook Debugger
1. Go to: https://developers.facebook.com/tools/debug/
2. Enter: `https://rakuxoncity.com`
3. Click "Scrape Again"
4. Verify:
   - [ ] Image displays (1200×630px)
   - [ ] Title is correct
   - [ ] Description appears
   - [ ] URL is production domain (not localhost)

### 3. Twitter Card Validator
1. Go to: https://cards-dev.twitter.com/validator
2. Enter: `https://rakuxoncity.com`
3. Verify:
   - [ ] Card type: "summary_large_image"
   - [ ] Image displays correctly
   - [ ] Title and description correct

### 4. LinkedIn Inspector
1. Go to: https://www.linkedin.com/post-inspector/
2. Enter: `https://rakuxoncity.com`
3. Verify:
   - [ ] Image appears professional
   - [ ] Text is readable
   - [ ] No errors shown

### 5. Manual Share Test
- [ ] Share a link on WhatsApp - image appears
- [ ] Share a link on Slack - rich preview shows
- [ ] Share on Twitter - card displays correctly
- [ ] Share on Facebook - preview looks good

## Key Pages to Test

Test OG metadata on these critical pages:

- [ ] Homepage: `https://rakuxoncity.com/`
- [ ] Land listing: `https://rakuxoncity.com/land`
- [ ] Sample plot: `https://rakuxoncity.com/land/[slug]`
- [ ] Homes listing: `https://rakuxoncity.com/homes`
- [ ] Sample home: `https://rakuxoncity.com/homes/[slug]`
- [ ] Estates: `https://rakuxoncity.com/estates`
- [ ] Sample estate: `https://rakuxoncity.com/estates/[slug]`
- [ ] About page: `https://rakuxoncity.com/about`
- [ ] Contact page: `https://rakuxoncity.com/contact`

## Troubleshooting

### ❌ Image not showing
**Check:**
1. Run `pnpm verify:og` - does image exist?
2. Is `NEXT_PUBLIC_SITE_URL` set correctly?
3. Is image path `/public/images/og.jpg`?
4. Can you access `https://yourdomain.com/images/og.jpg` directly?

**Fix:**
- Use Facebook Debugger to see exact error
- Check browser console for image load errors
- Verify build includes public/images directory

### ❌ localhost appears in URLs
**Check:**
1. Environment variable set: `echo $NEXT_PUBLIC_SITE_URL`
2. Correct domain in .env file
3. Rebuilt after changing .env

**Fix:**
```bash
# Set variable
export NEXT_PUBLIC_SITE_URL="https://rakuxoncity.com"

# Rebuild
pnpm build

# Or set in deployment platform UI
```

### ❌ Old image showing after update
**Fix:**
1. Use platform debugger tools to clear cache
2. Wait 24-48 hours for CDN cache expiry
3. Or add cache buster: `og.jpg?v=2`

### ⚠️ Image looks pixelated
**Check:**
- Image dimensions (should be 1200×630px)
- Image quality (should be 80-85%)
- Not stretched from wrong aspect ratio

**Fix:**
- Export new image at exactly 1200×630px
- Use high-quality source image
- Optimize with tool like Squoosh.app

## Quick Reference

### Environment Variable
```bash
NEXT_PUBLIC_SITE_URL="https://rakuxoncity.com"
```

### Image Specs
- **Size**: 1200×630px
- **Format**: JPEG
- **Quality**: 80-85%
- **Max file size**: 300KB

### Test URLs
- Facebook: https://developers.facebook.com/tools/debug/
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: https://www.linkedin.com/post-inspector/

### Verification Command
```bash
pnpm verify:og
```

## Success Criteria

✅ **Ready for Production** when:
- [ ] `pnpm verify:og` passes with 0 errors
- [ ] Facebook Debugger shows production image
- [ ] Twitter Card Validator displays correctly
- [ ] All test pages show proper previews
- [ ] Production URL set in environment
- [ ] Image is optimized (1200×630px, < 300KB)

## Documentation

For detailed information, see:
- `OG_IMAGE_SETUP.md` - Complete setup guide
- `OG_IMPLEMENTATION_SUMMARY.md` - Technical details
- `pnpm verify:og` - Run automated checks

---

**Last Updated**: 2026-08-27
**Verification**: Run `pnpm verify:og` before deploying
