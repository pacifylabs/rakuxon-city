# Quick Start: Replace All Images in 30 Minutes

**Goal:** Replace all 18 placeholder images with Nigerian/African real estate photography

---

## 🚀 30-Minute Workflow

### Step 1: Download Images (15 minutes)

1. **Open these 3 tabs:**
   - https://unsplash.com/@structuresoflagos
   - https://www.pexels.com/search/tropical%20houses/
   - https://www.pexels.com/search/african%20architecture/

2. **Download images in this order:**

   **Tab 1 - Unsplash @structuresoflagos (Get 6 images):**
   - Find 3 wide estate/development shots → Save as `temp-estate-1.jpg`, `temp-estate-2.jpg`, `temp-estate-3.jpg`
   - Find 3 individual building shots → Save as `temp-home-1.jpg`, `temp-home-2.jpg`, `temp-home-3.jpg`

   **Tab 2 - Pexels tropical houses (Get 9 images):**
   - Find 5 modern tropical houses → Save as `temp-home-4.jpg` through `temp-home-8.jpg`
   - Find 3 construction/progress shots → Save as `temp-collage-1.jpg`, `temp-collage-2.jpg`, `temp-collage-3.jpg`
   - Find 1 hero-quality estate → Save as `temp-hero-estate.jpg`

3. **Move all downloaded images to:**
   ```bash
   /Users/mac/Desktop/rakuxon-city/temp-images/
   ```

---

### Step 2: Process Images (5 minutes)

```bash
# Navigate to project
cd /Users/mac/Desktop/rakuxon-city

# Run the processing script
./scripts/download-images.sh
```

**In the menu:**
- Press `2` (Process images from temp-images/ folder)
- Script will automatically:
  - Backup existing images
  - Resize all images to correct dimensions
  - Save to `public/images/photography/`

---

### Step 3: Deploy Changes (10 minutes)

```bash
# Clear cache
rm -rf .next

# Rebuild
npm run build

# Start dev server
npm run dev
```

**Open browser:** http://localhost:3000

**Check:**
- Homepage hero (rotating images)
- Homepage featured estate section
- Scroll through page
- Check on mobile view (resize browser)

---

## ✅ Verification Checklist

Quick check that everything worked:

- [ ] Homepage hero shows new images
- [ ] Hero images rotate every 7 seconds
- [ ] Featured estate section shows new images
- [ ] All images load without errors
- [ ] Images look sharp (not pixelated)
- [ ] Mobile view looks good

---

## 🎯 Image Selection Quick Reference

### Estate Images (3 needed):
**Look for:** Wide shots, multiple buildings, roads visible, aerial views
**Keywords:** "lagos gated community", "tropical estate aerial", "housing development"

### Home Images (8 needed):
**Look for:** Individual houses, mix of modern/traditional, exteriors
**Keywords:** "tropical house", "african villa", "modern tropical home"
**Mix:**
- 4 luxury/modern homes
- 3 middle-market homes
- 1 under-construction home

### Collage Images (3 needed):
**Look for:** Construction progress, infrastructure, portrait orientation
**Keywords:** "construction site", "building progress", "development construction"

### Hero Estate (1 needed):
**Look for:** Most impressive estate shot, wide format, dramatic
**Keywords:** "residential estate aerial", "gated community panorama"

---

## 💡 If You Get Stuck

### Problem: Can't find enough Nigerian-specific images
**Solution:** Use tropical/African architecture instead. Focus on:
- Modern tropical houses
- African residential buildings
- Gated communities in tropical climates
- These will look authentic for Lagos/Ogun/Abuja

### Problem: Images are too large (>2MB each)
**Solution:** The processing script automatically compresses them. If still too large:
```bash
# Compress further (reduces quality to 75)
for img in public/images/photography/*.jpg; do
  magick "$img" -quality 75 "$img"
done
```

### Problem: Images don't look right after processing
**Solution:** Check aspect ratios. The script crops to center - if important parts are cut off:
1. Manually crop the temp image before processing
2. Or use: `magick input.jpg -resize WIDTHxHEIGHT^ -gravity south -extent WIDTHxHEIGHT output.jpg`
   (Change `south` to `north`, `east`, `west` to change crop focus)

### Problem: Script says "ImageMagick not found"
**Solution:** Install it:
```bash
brew install imagemagick
```

---

## 🎨 Optional: Fine-Tune Individual Images

If you want to manually adjust specific images:

```bash
# Resize with custom gravity (focus point)
magick input.jpg -resize 1200x900^ -gravity center -extent 1200x900 output.jpg

# Change gravity to: north, south, east, west, northeast, etc.
# to control which part of image is kept during crop

# Compress more
magick input.jpg -quality 70 -strip output.jpg

# Adjust brightness
magick input.jpg -brightness-contrast 10x5 output.jpg
```

---

## 📁 Project Structure After Completion

```
/Users/mac/Desktop/rakuxon-city/
├── temp-images/                    # Your downloaded images (can delete after)
│   ├── temp-estate-1.jpg
│   ├── temp-estate-2.jpg
│   └── ...
├── backup-images-YYYYMMDD-HHMMSS/ # Backup of old images
│   └── (old images preserved here)
├── public/images/photography/      # NEW images deployed here
│   ├── estate-emerald-ridge.jpg
│   ├── estate-emerald-ridge-hero-desktop.jpg
│   ├── home-01.jpg
│   └── ...
└── scripts/
    └── download-images.sh          # The processing script
```

---

## 🔄 If You Need to Start Over

```bash
# Restore original images
cp backup-images-YYYYMMDD-HHMMSS/*.jpg public/images/photography/

# Clear temp folder
rm -rf temp-images/*

# Start fresh
mkdir -p temp-images
```

---

## 📸 Download Checklist

As you download, check off what you have:

**Estate shots:**
- [ ] temp-estate-1.jpg (wide estate view)
- [ ] temp-estate-2.jpg (wide estate view)
- [ ] temp-estate-3.jpg (wide estate view)

**Home shots:**
- [ ] temp-home-1.jpg (luxury home)
- [ ] temp-home-2.jpg (luxury home)
- [ ] temp-home-3.jpg (luxury home)
- [ ] temp-home-4.jpg (middle-market home)
- [ ] temp-home-5.jpg (middle-market home)
- [ ] temp-home-6.jpg (middle-market home)
- [ ] temp-home-7.jpg (under-construction)
- [ ] temp-home-8.jpg (any style)

**Collage shots (portrait):**
- [ ] temp-collage-1.jpg (construction/progress)
- [ ] temp-collage-2.jpg (construction/progress)
- [ ] temp-collage-3.jpg (construction/progress)

**Hero shot:**
- [ ] temp-hero-estate.jpg (best estate shot)

---

## ⏱️ Time Breakdown

- **Image hunting & download:** 15 min
- **Running processing script:** 2 min
- **Building & testing:** 10 min
- **Fine-tuning (optional):** 5-10 min

**Total:** ~30 minutes

---

You've got this! 💪 Start with Unsplash @structuresoflagos and you'll have great Nigerian content in no time.
