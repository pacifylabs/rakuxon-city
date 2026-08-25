#!/bin/bash

# Image Download and Processing Script for Rakuxon City
# This script helps download and process Nigerian real estate images

set -e

PROJECT_ROOT="/Users/mac/Desktop/rakuxon-city"
TEMP_DIR="$PROJECT_ROOT/temp-images"
OUTPUT_DIR="$PROJECT_ROOT/public/images/photography"
BACKUP_DIR="$PROJECT_ROOT/backup-images-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏘️  Rakuxon City - Image Replacement Tool"
echo "========================================"
echo ""

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo -e "${RED}❌ ImageMagick not found${NC}"
    echo "Install it with: brew install imagemagick"
    exit 1
fi

echo -e "${GREEN}✓${NC} ImageMagick found"

# Create directories
mkdir -p "$TEMP_DIR"
mkdir -p "$BACKUP_DIR"

# Function to download image
download_image() {
    local url="$1"
    local filename="$2"
    
    echo "  Downloading $filename..."
    curl -s -L "$url" -o "$TEMP_DIR/$filename"
    
    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} Downloaded"
    else
        echo -e "  ${RED}✗${NC} Failed to download"
        return 1
    fi
}

# Function to resize and crop image
process_image() {
    local input="$1"
    local output="$2"
    local width="$3"
    local height="$4"
    local quality="${5:-85}"
    
    if [ ! -f "$input" ]; then
        echo -e "  ${RED}✗${NC} Input file not found: $input"
        return 1
    fi
    
    echo "  Processing: $(basename $input) → $(basename $output) (${width}×${height})"
    
    magick "$input" \
        -resize "${width}x${height}^" \
        -gravity center \
        -extent "${width}x${height}" \
        -quality "$quality" \
        -strip \
        "$output"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$output" | cut -f1)
        echo -e "  ${GREEN}✓${NC} Processed (${size})"
    else
        echo -e "  ${RED}✗${NC} Failed to process"
        return 1
    fi
}

# Function to backup existing images
backup_existing() {
    echo ""
    echo "📦 Backing up existing images..."
    
    if [ -d "$OUTPUT_DIR" ]; then
        cp "$OUTPUT_DIR"/*.jpg "$BACKUP_DIR/" 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Backup created at: $BACKUP_DIR"
    else
        echo -e "${YELLOW}⚠${NC}  Output directory doesn't exist yet"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "Select an option:"
    echo "  1) Download images from URLs (provide URL list)"
    echo "  2) Process images from temp-images/ folder"
    echo "  3) Process specific image manually"
    echo "  4) Show image specifications"
    echo "  5) Backup existing images"
    echo "  6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1) download_from_urls ;;
        2) process_all_temp_images ;;
        3) process_manual ;;
        4) show_specs ;;
        5) backup_existing ;;
        6) echo "Goodbye! 👋"; exit 0 ;;
        *) echo -e "${RED}Invalid choice${NC}"; show_menu ;;
    esac
}

# Download from URL list
download_from_urls() {
    echo ""
    echo "📥 Download from URLs"
    echo "Paste image URLs (one per line), then press Ctrl+D:"
    echo ""
    
    local urls=()
    while IFS= read -r line; do
        urls+=("$line")
    done
    
    if [ ${#urls[@]} -eq 0 ]; then
        echo -e "${YELLOW}No URLs provided${NC}"
        show_menu
        return
    fi
    
    echo ""
    echo "Downloaded ${#urls[@]} URLs"
    
    local i=1
    for url in "${urls[@]}"; do
        download_image "$url" "temp-image-$i.jpg"
        ((i++))
    done
    
    echo ""
    echo -e "${GREEN}✓${NC} Download complete!"
    echo "Files saved to: $TEMP_DIR"
    show_menu
}

# Process all images from temp folder
process_all_temp_images() {
    echo ""
    echo "🔄 Processing images from temp-images/"
    echo ""
    
    # Check if temp directory has images
    if [ ! "$(ls -A $TEMP_DIR/*.jpg 2>/dev/null)" ]; then
        echo -e "${YELLOW}⚠${NC}  No images found in $TEMP_DIR"
        echo "Place your downloaded images there first"
        show_menu
        return
    fi
    
    backup_existing
    
    echo ""
    echo "Processing estate images..."
    
    # Estate card images (4:3 - 1200x900)
    if [ -f "$TEMP_DIR/temp-estate-1.jpg" ]; then
        process_image "$TEMP_DIR/temp-estate-1.jpg" "$OUTPUT_DIR/estate-emerald-ridge.jpg" 1200 900
        process_image "$TEMP_DIR/temp-estate-1.jpg" "$OUTPUT_DIR/estate-emerald-ridge-hero-desktop.jpg" 2400 800 80
    fi
    
    if [ -f "$TEMP_DIR/temp-estate-2.jpg" ]; then
        process_image "$TEMP_DIR/temp-estate-2.jpg" "$OUTPUT_DIR/estate-cornerstone-gardens.jpg" 1200 900
        process_image "$TEMP_DIR/temp-estate-2.jpg" "$OUTPUT_DIR/estate-cornerstone-gardens-hero-desktop.jpg" 2400 800 80
    fi
    
    if [ -f "$TEMP_DIR/temp-estate-3.jpg" ]; then
        process_image "$TEMP_DIR/temp-estate-3.jpg" "$OUTPUT_DIR/estate-sabon-lugbe-court.jpg" 1200 900
        process_image "$TEMP_DIR/temp-estate-3.jpg" "$OUTPUT_DIR/estate-sabon-lugbe-court-hero-desktop.jpg" 2400 800 80
    fi
    
    echo ""
    echo "Processing home images..."
    
    # Home images (4:3 - 1200x900)
    for i in {1..8}; do
        if [ -f "$TEMP_DIR/temp-home-$i.jpg" ]; then
            local padded=$(printf "%02d" $i)
            process_image "$TEMP_DIR/temp-home-$i.jpg" "$OUTPUT_DIR/home-$padded.jpg" 1200 900
        fi
    done
    
    echo ""
    echo "Processing collage images..."
    
    # Collage images (3:4 portrait - 900x1200)
    for i in {1..3}; do
        if [ -f "$TEMP_DIR/temp-collage-$i.jpg" ]; then
            process_image "$TEMP_DIR/temp-collage-$i.jpg" "$OUTPUT_DIR/collage-$i.jpg" 900 1200
        fi
    done
    
    echo ""
    echo "Processing hero estate..."
    
    # Hero estate (16:9 - 1920x1080)
    if [ -f "$TEMP_DIR/temp-hero-estate.jpg" ]; then
        process_image "$TEMP_DIR/temp-hero-estate.jpg" "$OUTPUT_DIR/hero-estate.jpg" 1920 1080
    fi
    
    echo ""
    echo -e "${GREEN}✓ Processing complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Clear Next.js cache: rm -rf .next"
    echo "  2. Rebuild: npm run build"
    echo "  3. Start dev server: npm run dev"
    
    show_menu
}

# Process specific image manually
process_manual() {
    echo ""
    echo "🔧 Manual Image Processing"
    echo ""
    read -p "Input file path: " input_file
    read -p "Output file path: " output_file
    read -p "Width (px): " width
    read -p "Height (px): " height
    read -p "Quality (1-100, default 85): " quality
    quality=${quality:-85}
    
    process_image "$input_file" "$output_file" "$width" "$height" "$quality"
    
    show_menu
}

# Show image specifications
show_specs() {
    echo ""
    echo "📐 Image Specifications"
    echo "======================"
    echo ""
    echo "Estate Card Images (6 total):"
    echo "  - Normal: 1200×900 (4:3), quality 85"
    echo "  - Hero:   2400×800 (3:1), quality 80"
    echo ""
    echo "Home Images (8 total):"
    echo "  - Size:   1200×900 (4:3), quality 85"
    echo ""
    echo "Collage Images (3 total):"
    echo "  - Size:   900×1200 (3:4 portrait), quality 85"
    echo ""
    echo "Hero Estate (1 total):"
    echo "  - Size:   1920×1080 (16:9), quality 85"
    echo ""
    echo "File naming:"
    echo "  - Place downloaded images in temp-images/ as:"
    echo "    • temp-estate-1.jpg, temp-estate-2.jpg, temp-estate-3.jpg"
    echo "    • temp-home-1.jpg through temp-home-8.jpg"
    echo "    • temp-collage-1.jpg, temp-collage-2.jpg, temp-collage-3.jpg"
    echo "    • temp-hero-estate.jpg"
    
    show_menu
}

# Start the script
echo ""
echo "This script will help you:"
echo "  • Download images from URLs"
echo "  • Resize and crop to correct dimensions"
echo "  • Replace existing images"
echo ""

show_menu
