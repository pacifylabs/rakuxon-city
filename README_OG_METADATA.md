# 📱 Open Graph Metadata - Quick Start

## What This Is

Open Graph (OG) metadata controls how your website appears when shared on social media. It's what makes your links look professional with images, titles, and descriptions on Facebook, Twitter, LinkedIn, WhatsApp, and Slack.

## ✅ What's Already Done

Your Rakuxon City site now has a complete OG metadata system:

✓ Every page has proper OG tags  
✓ Automatic fallback images  
✓ Dynamic images for listings, estates, and articles  
✓ Twitter card support  
✓ Absolute URL handling  
✓ Verification tools  
✓ Comprehensive documentation  

## 🚀 What You Need to Do

### For Production Deployment

**1. Optimize Your OG Image** ⚠️ **REQUIRED**

Current image is 1274×932px. Social platforms expect 1200×630px.

```bash
# Replace this file:
public/images/og.jpg

# With an optimized version:
- Dimensions: 1200×630px (exactly)
- Format: JPEG
- File size: < 300KB
- Content: Your brand imagery with text
```

**Tools to use:**
- Photoshop/Figma: Export at 1200×630px, quality 80%
- Online: https://squoosh.app
- Command line: `convert og.jpg -resize 1200x630 -quality 85 og-optimized.jpg`

**2. Set Your Production URL** ⚠️ **CRITICAL**

```bash
# Add to your .env file or deployment platform:
NEXT_PUBLIC_SITE_URL="https://rakuxoncity.com"
```

Without this, social media will show "localhost:3000" URLs. This is the most common mistake!

**3. Verify Everything Works**

```bash
# Install dependencies (includes sharp for image checking)
pnpm install

# Run automated verification
pnpm verify:og
```

Should show 0 errors and only informational warnings.

### Optional But Recommended

**4. Update Twitter Handle**

```typescript
// Edit: src/lib/seo.ts (around line 80)
creator: "@your_actual_handle",
site: "@your_actual_handle",
```

**5. Add Search Console Verification**

When you have Google/Bing verification codes:

```typescript
// Edit: src/app/layout.tsx (around line 75)
verification: {
  google: "your-code-here",
  bing: "your-code-here",
}
```

## 📊 Testing After Deployment

### Quick Test
```bash
pnpm verify:og
```

### Platform Testing

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Click "Scrape Again"
   - Verify image and text appear

2. **Twitter Validator**: https://cards-dev.twitter.com/validator
   - Enter your URL
   - Check card displays correctly

3. **LinkedIn Inspector**: https://www.linkedin.com/post-inspector/
   - Enter your URL
   - Verify professional appearance

4. **Real Share Test**
   - Share a link on WhatsApp
   - Paste in Slack
   - Tweet the link
   - All should show rich previews

## 📚 Documentation

Three comprehensive guides have been created:

1. **PRODUCTION_OG_CHECKLIST.md** - Quick checklist before deploying
2. **OG_IMAGE_SETUP.md** - Detailed setup and troubleshooting
3. **OG_IMPLEMENTATION_SUMMARY.md** - Technical details and architecture

## 🔧 Common Issues

### Problem: Image not showing on Facebook
**Solution**: Use Facebook Debugger to clear cache and scrape again

### Problem: localhost showing in shared links  
**Solution**: Set `NEXT_PUBLIC_SITE_URL` environment variable to production domain

### Problem: Image looks pixelated
**Solution**: Ensure og.jpg is exactly 1200×630px, not stretched from different size

### Problem: Verification script fails
**Solution**: Run `pnpm install` to ensure sharp is installed

## 🎯 How It Works

### Three-Tier Image System

1. **Page-specific images** (if available)
   - Estates use estate image
   - Listings use listing image  
   - Articles use featured image

2. **Database images** (Phase 7)
   - Homepage can use editable `site.ogImage`

3. **Static fallback** (always available)
   - `/public/images/og.jpg` for all other pages

### Example: Sharing an Estate

```
User shares: https://rakuxoncity.com/estates/emerald-ridge
↓
System checks: Does this estate have images?
↓
Yes → Uses first estate image (1200×630px optimized)
↓
Social platform receives:
- Title: "Emerald Ridge — Rakuxon City"  
- Description: Estate description (155 chars)
- Image: https://rakuxoncity.com/uploaded-estate-image.jpg
- URL: https://rakuxoncity.com/estates/emerald-ridge
```

## 📋 Production Checklist

Use this before deploying:

- [ ] OG image optimized (1200×630px, < 300KB)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] `pnpm verify:og` passes
- [ ] Tested with Facebook Debugger
- [ ] Tested with Twitter Validator
- [ ] Manual share test successful

## 💡 Tips

- **Image Design**: Keep important text/logos 60px from edges (safe zone)
- **File Size**: Smaller = faster previews. Aim for 200-300KB
- **Testing**: Test before launch AND after first deploy
- **Cache**: Social platforms cache aggressively. Use debugger tools to refresh
- **Mobile**: Most shares happen on mobile. Test on phone

## 🆘 Need Help?

1. Run `pnpm verify:og` for automated diagnostics
2. Check `OG_IMAGE_SETUP.md` for detailed troubleshooting
3. Use platform debugger tools (links above)
4. Check Next.js build logs for metadata errors

## ⚡ Quick Commands

```bash
# Verify setup
pnpm verify:og

# Install dependencies
pnpm install

# Build for production
pnpm build

# Test locally
pnpm dev
# Then test at http://localhost:3000
```

## 🎉 Success!

When everything is set up correctly:
- Every page has a beautiful preview image when shared
- Professional appearance across all platforms  
- Increased click-through rates on shared links
- Better brand consistency
- Improved social media presence

---

**Status**: ✅ Implementation Complete  
**Your Action Required**: Optimize og.jpg and set NEXT_PUBLIC_SITE_URL  
**Time to Complete**: ~15 minutes  
**Impact**: High - affects all social shares

For detailed information, see the other documentation files:
- `PRODUCTION_OG_CHECKLIST.md`
- `OG_IMAGE_SETUP.md`
- `OG_IMPLEMENTATION_SUMMARY.md`
