#!/bin/bash

# ================================================================
# CLIENT — DASHBOARD PRODUCT FILES COLLECTOR
# 
# Collect semua file product yang ada di DASHBOARD:
#   - Product pages (list, new, edit, downloads)
#   - Product components (grid, card, form, preview, upload)
#   - Product hooks & API
#   - Product types & utilities
#
# Run dari: root direktori client (tempat src/ ada)
#   bash collect-dashboard-product.sh
# ================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="."
SRC_DIR="$PROJECT_ROOT/src"
OUT="collections"
mkdir -p "$OUT"

FOUND=0
MISSING=0
TOTAL=0

# ================================================================
# HELPERS
# ================================================================

collect_file() {
    local file=$1
    local output=$2
    TOTAL=$((TOTAL + 1))

    if [ -f "$file" ]; then
        local rel="${file#$PROJECT_ROOT/}"
        local lines
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}✓${NC} $rel ${CYAN}(${lines} lines)${NC}"
        FOUND=$((FOUND + 1))
        {
            echo "================================================"
            echo "FILE: $rel"
            echo "Lines: $lines"
            echo "================================================"
            echo ""
            cat "$file"
            printf "\n\n"
        } >> "$output"
    else
        echo -e "  ${RED}✗ MISSING:${NC} ${file#$PROJECT_ROOT/}"
        MISSING=$((MISSING + 1))
        {
            echo "================================================"
            echo "FILE: ${file#$PROJECT_ROOT/}"
            echo "STATUS: *** FILE NOT FOUND ***"
            echo "================================================"
            echo ""
        } >> "$output"
    fi
}

section_header() {
    local label=$1
    local output=$2
    echo -e "\n${MAGENTA}▶ $label${NC}"
    {
        echo ""
        echo "################################################################"
        echo "##  $label"
        echo "################################################################"
        echo ""
    } >> "$output"
}

# ================================================================
# MAIN
# ================================================================

main() {
    if [ ! -d "$SRC_DIR" ]; then
        echo -e "${RED}ERROR: src/ tidak ditemukan di: $PROJECT_ROOT${NC}"
        echo -e "Jalankan script ini dari root direktori client (tempat src/ ada)"
        exit 1
    fi

    local timestamp
    timestamp=$(date '+%Y%m%d-%H%M%S')
    local output_file="$OUT/DASHBOARD-PRODUCT-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — DASHBOARD PRODUCT FILES"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
        echo "##  FOCUS AREAS:"
        echo "##    1. Product Pages (list, new, edit, downloads, library)"
        echo "##    2. Product Components (grid, card, form, preview, upload)"
        echo "##    3. Product Hooks"
        echo "##    4. Product API"
        echo "##    5. Product Types"
        echo "##    6. Product Utilities & Constants"
        echo "##    7. Shared Components (image-slot, crop-modal, dll)"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  DASHBOARD PRODUCT FILES COLLECTOR                      ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. PRODUCT PAGES ──────────────────────────────────────────
    section_header "1. PRODUCT PAGES" "$output_file"
    
    # Main products page
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/client.tsx" "$output_file"
    
    # New product page
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/new/page.tsx" "$output_file"
    
    # Edit product page
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/[id]/edit/page.tsx" "$output_file"
    
    # Downloads page
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/downloads/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/downloads/client.tsx" "$output_file"
    
    # Library page
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/library/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/library/client.tsx" "$output_file"

    # ── 2. PRODUCT COMPONENTS ─────────────────────────────────────
    section_header "2. PRODUCT COMPONENTS" "$output_file"
    
    # Product grid & card
    collect_file "$SRC_DIR/components/dashboard/product/product-grid.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/product-grid-card.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/product-delete-dialog.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/product-preview-drawer.tsx" "$output_file"
    
    # Upload & storage
    collect_file "$SRC_DIR/components/dashboard/product/upload-dropzone.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/storage-usage-bar.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/download-history-table.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/kyc-banner.tsx" "$output_file"

    # ── 3. PRODUCT FORM ───────────────────────────────────────────
    section_header "3. PRODUCT FORM (WIZARD)" "$output_file"
    
    # Main form
    collect_file "$SRC_DIR/components/dashboard/product/form/product.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/types.ts" "$output_file"
    
    # Form steps
    collect_file "$SRC_DIR/components/dashboard/product/form/step-details.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/step-upload.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/step-media.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/step-preview.tsx" "$output_file"

    # ── 4. PRODUCT HOOKS ──────────────────────────────────────────
    section_header "4. PRODUCT HOOKS" "$output_file"
    
    collect_file "$SRC_DIR/hooks/dashboard/use-products.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/dashboard/use-library.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/dashboard/use-refund.ts" "$output_file"

    # ── 5. PRODUCT API ────────────────────────────────────────────
    section_header "5. PRODUCT API" "$output_file"
    
    collect_file "$SRC_DIR/lib/api/products.ts" "$output_file"
    collect_file "$SRC_DIR/lib/api/library.ts" "$output_file"

    # ── 6. PRODUCT TYPES ──────────────────────────────────────────
    section_header "6. PRODUCT TYPES" "$output_file"
    
    collect_file "$SRC_DIR/types/product.ts" "$output_file"

    # ── 7. PRODUCT UTILITIES ──────────────────────────────────────
    section_header "7. PRODUCT UTILITIES & CONSTANTS" "$output_file"
    
    collect_file "$SRC_DIR/lib/shared/product-utils.ts" "$output_file"
    collect_file "$SRC_DIR/lib/shared/validations.ts" "$output_file"
    collect_file "$SRC_DIR/lib/constants/shared/categories.ts" "$output_file"
    collect_file "$SRC_DIR/lib/constants/shared/constants.ts" "$output_file"

    # ── 8. SHARED COMPONENTS ──────────────────────────────────────
    section_header "8. SHARED COMPONENTS (Image, Crop, Wizard)" "$output_file"
    
    # Image related
    collect_file "$SRC_DIR/components/dashboard/shared/image-slot.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/image-crop-modal.tsx" "$output_file"
    
    # Wizard & navigation
    collect_file "$SRC_DIR/components/dashboard/shared/wizard-nav.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/step-indicator.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/step-wizard.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/upgrade-modal.tsx" "$output_file"
    
    # Other shared
    collect_file "$SRC_DIR/components/dashboard/shared/offline-aware-button.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/pwa-install-prompt.tsx" "$output_file"

    # ── 9. UI COMPONENTS (khusus yang dipakai) ────────────────────
    section_header "9. UI COMPONENTS (OptimizedImage, ValidationDialog)" "$output_file"
    
    collect_file "$SRC_DIR/components/ui/optimized-image.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/validation-dialog.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/empty.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/progress.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/combobox.tsx" "$output_file"

    # ── 10. CLOUDINARY ─────────────────────────────────────────────
    section_header "10. CLOUDINARY UPLOAD" "$output_file"
    
    collect_file "$SRC_DIR/hooks/shared/use-cloudinary-upload.ts" "$output_file"
    collect_file "$SRC_DIR/lib/shared/cloudinary.ts" "$output_file"
    collect_file "$SRC_DIR/types/cloudinary.ts" "$output_file"

    # ── 11. SUBSCRIPTION (terkait product) ────────────────────────
    section_header "11. SUBSCRIPTION (Product tier & KYC)" "$output_file"
    
    collect_file "$SRC_DIR/hooks/dashboard/use-subscription-plan.ts" "$output_file"
    collect_file "$SRC_DIR/lib/constants/dashboard/pricing.ts" "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED
    [ $FOUND -eq 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  DASHBOARD PRODUCT — SUMMARY                      ║${NC}"
    echo -e "${color}╠════════════════════════════════════════════════════╣${NC}"
    printf "${color}║  ✓ Found   : %-3d / %-3d                             ║${NC}\n" "$FOUND" "$TOTAL"
    printf "${color}║  ✗ Missing : %-3d                                    ║${NC}\n" "$MISSING"
    printf "${color}║  Coverage  : %-3d%%                                  ║${NC}\n" "$pct"
    echo -e "${color}╚════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${CYAN}📂 Output: $output_file${NC}"
    echo ""

    {
        echo ""
        echo "################################################################"
        echo "##  SUMMARY"
        echo "################################################################"
        echo "Found   : $FOUND / $TOTAL"
        echo "Missing : $MISSING"
        echo "Coverage: $pct%"
        echo ""
        echo "## FILE COUNT BY CATEGORY"
        echo "Product Pages: 8"
        echo "Product Components: 8"
        echo "Product Form: 6"
        echo "Product Hooks: 3"
        echo "Product API: 2"
        echo "Product Types: 1"
        echo "Product Utilities: 4"
        echo "Shared Components: 7"
        echo "UI Components: 5"
        echo "Cloudinary: 3"
        echo "Subscription: 2"
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"