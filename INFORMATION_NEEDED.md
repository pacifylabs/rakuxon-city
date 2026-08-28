# 📋 Information Needed for Production

This document lists all information you need to provide to complete the Open Graph metadata setup for production deployment.

---

## 🚨 CRITICAL - Required Before Launch

### 1. Production Website URL

**What we need:**
```
Your actual production domain
```

**Example:**
```
https://rakuxoncity.com
```

**Where to provide:**
Set as environment variable in your deployment platform or .env file:
```bash
NEXT_PUBLIC_SITE_URL="https://rakuxoncity.com"
```

**Why it's critical:**
- Without this, social media links will show "localhost:3000"
- This is the most common deployment mistake
- Affects ALL social media shares (Facebook, Twitter, LinkedIn, WhatsApp)

**Checklist:**
- [ ] Includes `https://` (not http://)
- [ ] No trailing slash (use `/`, not `/.com`)
- [ ] Matches your actual domain
- [ ] Set in deployment platform environment variables

---

### 2. Optimized OG Image

**What we need:**
A high-quality brand image for social media sharing

**Current status:**
- Current image: `/public/images/og.jpg` (1274×932px)
- Needs optimization to: 1200×630px

**Specifications:**
```
Dimensions:    1200×630px (exactly)
Format:        JPEG
File Size:     < 300KB (ideally 200-250KB)
Quality:       80-85% compression
Content:       Your brand imagery + text overlay
File Location: /public/images/og.jpg
```

**Design requirements:**
- Include Rakuxon City logo
- Show real estate imagery (land/homes/estates)
- Include trust indicators (e.g., "Certificate of Occupancy", "Delivered Estates")
- Keep text readable at small sizes
- Use brand colors (charcoal, champagne, ivory)
- Keep important content 60px from edges (safe zone)

**Tools to create:**
- Photoshop/Figma (export at 1200×630px, quality 80%)
- Canva (use "Facebook Post" template, resize to 1200×630px)
- Online: https://squoosh.app (for compression)

**Where to provide:**
Replace the existing file at:
```
/public/images/og.jpg
```

**Testing:**
After creating, verify with:
```bash
pnpm verify:og
```

---

## 📝 RECOMMENDED - Optional But Beneficial

### 3. Twitter/X Handle (Optional)

**What we need:**
```
Your official Twitter/X handle
```

**Example:**
```
@rakuxoncity
```

**Current status:**
Currently set to `@rakuxoncity` as placeholder

**Where to provide:**
If your actual handle is different, let us know and we'll update:
```typescript
// File: src/lib/seo.ts
// Lines ~80-90

twitter: {
  creator: "@your_actual_handle",  ← Update this
  site: "@your_actual_handle",     ← Update this
}
```

**Why it's useful:**
- Enables Twitter attribution
- Shows your profile when links are shared
- Improves social media presence
- No impact if not set (just less attribution)

**Checklist:**
- [ ] Includes `@` symbol
- [ ] Matches your actual Twitter profile
- [ ] Same handle for both `creator` and `site` (in most cases)

---

### 4. Search Engine Verification Tokens (Optional)

**What we need:**
Verification codes from Google Search Console and Bing Webmaster Tools

**Example format:**
```
Google: abc123def456ghi789jkl012
Bing:   1234567890ABCDEF1234567890ABCDEF
```

**Current status:**
Not set (commented out in code, ready to add)

**Where to provide:**
After you verify your site with Google/Bing, provide the verification codes

**Where we'll add them:**
```typescript
// File: src/app/layout.tsx
// Around line 75

verification: {
  google: "your-google-verification-code-here",
  bing: "your-bing-verification-code-here",
}
```

**How to get these:**
1. **Google Search Console**:
   - Go to https://search.google.com/search-console
   - Add property with your domain
   - Choose "HTML tag" method
   - Copy the content attribute from the meta tag
   - Example: `<meta name="google-site-verification" content="abc123..." />`
   - Provide the `abc123...` part

2. **Bing Webmaster Tools**:
   - Go to https://www.bing.com/webmasters
   - Add site
   - Choose "HTML meta tag" option
   - Copy the content attribute
   - Provide the verification code

**Why it's useful:**
- Required to use Google Search Console
- Access to search performance data
- Submit sitemaps
- Monitor crawl errors
- See search analytics
- No negative impact if not set

---

## 📊 Summary Checklist

### Before Production Launch

- [ ] **Production URL** (CRITICAL)
  - Format: `https://yourdomain.com`
  - No trailing slash
  - Set in environment variables

- [ ] **Optimized OG Image** (CRITICAL)
  - Dimensions: 1200×630px
  - File size: < 300KB
  - Format: JPEG
  - Replaced at `/public/images/og.jpg`

- [ ] **Twitter Handle** (Optional)
  - Format: `@yourhandle`
  - Verified it's correct

- [ ] **Google Verification** (Optional)
  - Obtained from Search Console
  - Format: 32-64 character string

- [ ] **Bing Verification** (Optional)
  - Obtained from Webmaster Tools
  - Format: 32-64 character string

---

## 🚀 How to Provide This Information

### Option 1: Email/Message
Send us:
```
1. Production URL: https://rakuxoncity.com
2. OG Image: [attach optimized 1200×630px JPEG]
3. Twitter Handle: @rakuxoncity
4. Google Verification: abc123def456...
5. Bing Verification: 123456789...
```

### Option 2: Direct Update
If you have repository access:

1. **Production URL**: Add to `.env` or deployment platform
   ```bash
   NEXT_PUBLIC_SITE_URL="https://rakuxoncity.com"
   ```

2. **OG Image**: Replace file
   ```bash
   cp your-optimized-image.jpg public/images/og.jpg
   ```

3. **Twitter Handle**: Edit `src/lib/seo.ts` (lines 80-90)

4. **Verification Codes**: Edit `src/app/layout.tsx` (line ~75)

Then run:
```bash
pnpm verify:og  # Verify setup
pnpm build      # Build for production
```

---

## ⚡ Priority Guide

### Must Have (Before Launch)
1. **Production URL** → Most important, affects all shares
2. **Optimized OG Image** → Affects visual quality of shares

### Nice to Have (Can Add Later)
3. **Twitter Handle** → Improves attribution
4. **Google Verification** → For Search Console access
5. **Bing Verification** → For Webmaster Tools access

---

## 📞 Questions?

If you have questions about:

### Image Creation
- **Q**: "What should the image look like?"
- **A**: See design examples in `OG_IMAGE_SETUP.md` → Design Guidelines

### Production URL
- **Q**: "Where do I set this?"
- **A**: In your deployment platform (Vercel, Netlify, etc.) environment variables section

### Twitter Handle
- **Q**: "Is this required?"
- **A**: No, it's optional. Default `@rakuxoncity` will be used if not provided

### Verification Codes
- **Q**: "When should I add these?"
- **A**: After launch, when you're ready to use Search Console / Webmaster Tools

---

## ✅ Verification

After you provide this information:

1. We'll update the configuration
2. Run automated verification: `pnpm verify:og`
3. Test with Facebook Debugger
4. Test with Twitter Card Validator
5. Test manual sharing on WhatsApp/Slack
6. Confirm all checks pass
7. ✅ Ready for production launch!

---

## 📋 Template Email

Feel free to copy and fill in:

```
Subject: Rakuxon City - OG Metadata Production Info

Hi,

Here's the information for the OG metadata setup:

1. PRODUCTION URL
   https://

2. OPTIMIZED OG IMAGE
   [Attached: og-optimized.jpg - 1200×630px, < 300KB]
   OR
   Can be found at: [Google Drive link / Dropbox link]

3. TWITTER HANDLE (Optional)
   @

4. GOOGLE VERIFICATION CODE (Optional)
   [After getting from Search Console]

5. BING VERIFICATION CODE (Optional)
   [After getting from Webmaster Tools]

Let me know if you need anything else!
```

---

**Document Created**: 2026-08-27  
**Status**: Awaiting information  
**Priority**: CRITICAL (items 1-2) before production launch  
**Estimated Time**: 15 minutes to gather all information
