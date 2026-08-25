# Nigerian Real Estate Image Replacement Guide

**Project:** Rakuxon City  
**Task:** Replace 18 placeholder images with authentic Nigerian real estate photography  
**Locations:** Lagos, Ogun State, Abuja  
**Strategy:** Mix of authentic Nigerian images + high-quality African/tropical architecture

---

## Image Inventory

### Images to Replace:

1. **Estate Images** (3 cards + 3 hero versions):
   - `estate-emerald-ridge.jpg` + `-hero-desktop.jpg`
   - `estate-cornerstone-gardens.jpg` + `-hero-desktop.jpg`
   - `estate-sabon-lugbe-court.jpg` + `-hero-desktop.jpg`

2. **Individual Homes** (8):
   - `home-01.jpg` through `home-08.jpg`

3. **Collage/Development** (3):
   - `collage-1.jpg`, `collage-2.jpg`, `collage-3.jpg`

4. **Hero Estate** (1):
   - `hero-estate.jpg`

**Total:** 18 images

---

## Recommended Sources

### 1. **Unsplash** (Best for Authentic Nigerian Content)

**Direct Links:**
- Lagos general: https://unsplash.com/s/photos/lagos-nigeria
- Lagos buildings: https://unsplash.com/s/photos/lagos-city
- Structures of Lagos (photographer): https://unsplash.com/@structuresoflagos
- Nigeria general: https://unsplash.com/s/photos/nigeria

**Search Terms to Try:**
- "Lagos residential"
- "Lagos housing"
- "Nigerian architecture"
- "Lagos estate"
- "Nigerian property"

### 2. **Pexels** (Good for African Architecture)

**Direct Links:**
- Lagos Nigeria buildings: https://www.pexels.com/search/lagos%20nigeria%20buildings/
- Houses in Nigeria: https://www.pexels.com/search/houses%20in%20nigeria/
- African modern houses: https://www.pexels.com/search/african%20modern%20houses/
- Tropical residential: https://www.pexels.com/search/tropical%20residential%20houses/

**Search Terms to Try:**
- "tropical estate"
- "African residential"
- "modern tropical house"
- "gated community tropical"

### 3. **Pixabay** (Additional Options)

**Direct Link:**
- https://pixabay.com/images/search/nigeria/

**Search Terms to Try:**
- "Africa residential"
- "tropical housing development"
- "modern African architecture"

---

## Image Specifications & Requirements

### Estate Card Images (6 total: 3 normal + 3 hero)

**Normal Card Images:**
- Aspect ratio: **4:3**
- Recommended size: **1200 × 900 px minimum**
- Content: Wide establishing shots showing estate boundaries, access roads, layout
- What to look for:
  - Gated communities
  - Multiple buildings visible
  - Roads and infrastructure
  - Mix of completed and under-construction OK
  - Drone/aerial views ideal

**Hero Desktop Images:**
- Aspect ratio: **3:1** (similar to current 2172 × 724)
- Recommended size: **2400 × 800 px minimum**
- Content: Wider panoramic version of estate shots
- Same estates as above, but more dramatic/cinematic
- Can be cropped from wider estate photos

### Home Images (8 total)

**Specifications:**
- Aspect ratio: **4:3**
- Recommended size: **1200 × 900 px minimum**
- Content: Individual residential properties
- Mix needed:
  - 3-4 luxury homes (detached, modern design)
  - 2-3 middle-market homes (terraces, semi-detached)
  - 1-2 under-construction homes (showing structure/framework)
- Exteriors preferred, but 1-2 interiors OK

### Collage Images (3 total)

**Specifications:**
- Aspect ratio: **3:4 (portrait)**
- Recommended size: **900 × 1200 px minimum**
- Content: Development progress / construction photos
- What to look for:
  - Infrastructure being built
  - Road construction in estates
  - Multiple buildings at different completion stages
  - "Progress" shots showing transformation

### Hero Estate Image (1 total)

**Specifications:**
- Aspect ratio: **16:9**
- Recommended size: **1920 × 1080 px minimum**
- Content: Hero/banner quality estate photograph
- Most dramatic/impressive shot

---

## Download Instructions

### Step-by-Step Process:

1. **Visit each source** (Unsplash, Pexels, Pixabay)

2. **Search using the terms above**

3. **Select images that match criteria:**
   - Authentic Nigerian OR believable as Nigerian (tropical, African architecture)
   - Mix of luxury and middle-market
   - Mix of completed and under-construction
   - High quality (sharp, good lighting, professional)

4. **Download high-resolution versions:**
   - Unsplash: Click "Download" → Select largest size
   - Pexels: Click "Download" → Select "Original" size
   - Pixabay: Click "Free Download" → Select largest size

5. **Save with temporary names first:**
   - `temp-estate-1.jpg`, `temp-estate-2.jpg`, etc.
   - `temp-home-1.jpg`, `temp-home-2.jpg`, etc.

6. **Resize/crop if needed** (see next section)

7. **Rename to match existing filenames** (see mapping below)

---

## Image Processing & Resizing

### Tools You Can Use:

**Option A: Online (No installation needed)**
- **Squoosh**: https://squoosh.app/ (Google's image compressor)
- **iloveimg**: https://www.iloveimg.com/resize-image
- **Photopea**: https://www.photopea.com/ (Online Photoshop alternative)

**Option B: Command Line (Mac)**
```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Resize and crop to 4:3 aspect ratio (1200x900)
magick input.jpg -resize 1200x900^ -gravity center -extent 1200x900 output.jpg

# Resize and crop to 3:1 (hero desktop - 2400x800)
magick input.jpg -resize 2400x800^ -gravity center -extent 2400x800 output.jpg

# Resize and crop to 3:4 portrait (900x1200)
magick input.jpg -resize 900x1200^ -gravity center -extent 900x1200 output.jpg

# Compress to reduce file size
magick input.jpg -quality 85 -strip output.jpg
```

### Batch Processing Script:

Create a file called `process-images.sh`:

```bash
#!/bin/bash

# Process estate cards (4:3)
for i in {1..3}; do
  magick "temp-estate-$i.jpg" -resize 1200x900^ -gravity center -extent 1200x900 -quality 85 "estate-$i.jpg"
done

# Process estate hero (3:1)
for i in {1..3}; do
  magick "temp-estate-$i.jpg" -resize 2400x800^ -gravity center -extent 2400x800 -quality 80 "estate-$i-hero.jpg"
done

# Process homes (4:3)
for i in {1..8}; do
  magick "temp-home-$i.jpg" -resize 1200x900^ -gravity center -extent 1200x900 -quality 85 "home-0$i.jpg"
done

# Process collage (3:4 portrait)
for i in {1..3}; do
  magick "temp-collage-$i.jpg" -resize 900x1200^ -gravity center -extent 900x1200 -quality 85 "collage-$i.jpg"
done

# Process hero estate (16:9)
magick "temp-hero-estate.jpg" -resize 1920x1080^ -gravity center -extent 1920x1080 -quality 85 "hero-estate.jpg"

echo "✓ All images processed!"
```

Run with:
```bash
chmod +x process-images.sh
./process-images.sh
```

---

## Filename Mapping

### Estate Images:

| Download As | Resize/Crop To | Final Filename |
|-------------|----------------|----------------|
| temp-estate-1.jpg | 1200×900 (4:3) | `estate-emerald-ridge.jpg` |
| temp-estate-1.jpg | 2400×800 (3:1) | `estate-emerald-ridge-hero-desktop.jpg` |
| temp-estate-2.jpg | 1200×900 (4:3) | `estate-cornerstone-gardens.jpg` |
| temp-estate-2.jpg | 2400×800 (3:1) | `estate-cornerstone-gardens-hero-desktop.jpg` |
| temp-estate-3.jpg | 1200×900 (4:3) | `estate-sabon-lugbe-court.jpg` |
| temp-estate-3.jpg | 2400×800 (3:1) | `estate-sabon-lugbe-court-hero-desktop.jpg` |

### Home Images:

| Download As | Resize/Crop To | Final Filename |
|-------------|----------------|----------------|
| temp-home-1.jpg | 1200×900 (4:3) | `home-01.jpg` |
| temp-home-2.jpg | 1200×900 (4:3) | `home-02.jpg` |
| temp-home-3.jpg | 1200×900 (4:3) | `home-03.jpg` |
| temp-home-4.jpg | 1200×900 (4:3) | `home-04.jpg` |
| temp-home-5.jpg | 1200×900 (4:3) | `home-05.jpg` |
| temp-home-6.jpg | 1200×900 (4:3) | `home-06.jpg` |
| temp-home-7.jpg | 1200×900 (4:3) | `home-07.jpg` |
| temp-home-8.jpg | 1200×900 (4:3) | `home-08.jpg` |

### Collage Images:

| Download As | Resize/Crop To | Final Filename |
|-------------|----------------|----------------|
| temp-collage-1.jpg | 900×1200 (3:4) | `collage-1.jpg` |
| temp-collage-2.jpg | 900×1200 (3:4) | `collage-2.jpg` |
| temp-collage-3.jpg | 900×1200 (3:4) | `collage-3.jpg` |

### Hero Estate:

| Download As | Resize/Crop To | Final Filename |
|-------------|----------------|----------------|
| temp-hero-estate.jpg | 1920×1080 (16:9) | `hero-estate.jpg` |

---

## Installation & Replacement

Once images are processed:

```bash
# Navigate to project
cd /Users/mac/Desktop/rakuxon-city

# Backup existing images
mkdir -p backup-images
cp public/images/photography/*.jpg backup-images/

# Copy new images
cp estate-*.jpg public/images/photography/
cp home-*.jpg public/images/photography/
cp collage-*.jpg public/images/photography/
cp hero-estate.jpg public/images/photography/

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## Search Strategy Recommendations

### For Estate Images (Wide shots showing development):
1. Search "Lagos gated community" on Unsplash
2. Look for "aerial view residential development"
3. Try "housing estate construction Nigeria"
4. Alternative: "tropical residential development aerial"

### For Home Images (Individual properties):
1. Search "Lagos modern house" on Pexels
2. Look for "Nigerian duplex" or "Nigerian bungalow"
3. Try "African luxury home exterior"
4. Alternative: "tropical modern villa"

### For Collage Images (Development progress):
1. Search "construction Nigeria" on Unsplash
2. Look for "building construction progress"
3. Try "infrastructure development Lagos"
4. Alternative: "housing development construction"

---

## Quality Checklist

Before finalizing each image, verify:

- [ ] **Resolution**: High enough to look sharp when displayed
- [ ] **Aspect ratio**: Matches requirement (4:3, 3:1, 3:4, or 16:9)
- [ ] **Relevance**: Could believably be Lagos/Ogun/Abuja
- [ ] **Quality**: Professional, well-lit, in focus
- [ ] **Variety**: Mix of luxury/middle-market, completed/under-construction
- [ ] **Architecture**: Tropical/African style (not European/American)
- [ ] **License**: Free for commercial use (Unsplash/Pexels/Pixabay are all CC0)

---

## Attribution (Optional but Recommended)

While Unsplash, Pexels, and Pixabay don't require attribution, it's good practice to credit photographers.

Create a file: `public/images/photography/CREDITS.md`

```markdown
# Photo Credits

Estate images courtesy of [Photographer Name] via Unsplash
Home images courtesy of [Photographer Name] via Pexels
...
```

---

## Alternative: AI-Assisted Approach

If you can't find enough authentic Nigerian images, consider:

1. **Use AI upscaling** on lower-res Nigerian property listing photos
   - https://www.upscale.media/
   - https://bigjpg.com/

2. **Use AI image generation** for supplementary images
   - Midjourney: "modern residential estate Lagos Nigeria aerial view"
   - DALL-E: "gated community tropical architecture Nigeria"
   - Stable Diffusion: "Nigerian housing development construction progress"

⚠️ **Note**: AI-generated images should be clearly labeled if used for actual property listings.

---

## Need Help?

If you encounter issues:
1. Check image file sizes (should be <1MB each after compression)
2. Verify aspect ratios match requirements
3. Clear browser cache after replacing images
4. Restart dev server: `npm run dev`

Happy image hunting! 📸🏘️
