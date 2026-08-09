#!/bin/bash

# ================================================================
# CLIENT — STORE FILES COLLECTOR
# 
# Collect semua file Store Frontend:
#   - Store pages (home, products, product detail)
#   - Store layout & components
#   - Store product components
#   - Store shared components (schema, social share)
#   - Store checkout components
#   - Store URL helpers
#
# Run dari: root direktori client (tempat src/ ada)
#   bash collect-store-files.sh
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
    local output_file="$OUT/STORE-FILES-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — STORE FRONTEND FILES"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
        echo "##  FOCUS AREAS:"
        echo "##    1. Store Pages (home, products, product detail)"
        echo "##    2. Store Layout Components (header, footer, breadcrumb)"
        echo "##    3. Store Product Components"
        echo "##    4. Store Shared Components (schema, social share)"
        echo "##    5. Store Checkout Components"
        echo "##    6. Store URL Helpers"
        echo "##    7. Store Skeleton"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  STORE FRONTEND FILES COLLECTOR                         ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. STORE PAGES ─────────────────────────────────────────────
    section_header "1. STORE — PAGES" "$output_file"
    
    # Store home
    collect_file "$SRC_DIR/app/[locale]/store/[slug]/page.tsx" "$output_file"
    
    # Store products list
    collect_file "$SRC_DIR/app/[locale]/store/[slug]/products/page.tsx" "$output_file"
    
    # Store product detail
    collect_file "$SRC_DIR/app/[locale]/store/[slug]/products/[id]/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/store/[slug]/products/[id]/not-found.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/store/[slug]/products/[id]/opengraph-image.tsx" "$output_file"
    
    # Store layout
    collect_file "$SRC_DIR/app/[locale]/store/[slug]/layout.tsx" "$output_file"
    
    # Store opengraph-image
    collect_file "$SRC_DIR/app/[locale]/store/[slug]/opengraph-image.tsx" "$output_file"

    # ── 2. STORE LAYOUT COMPONENTS ─────────────────────────────────
    section_header "2. STORE — LAYOUT COMPONENTS" "$output_file"
    
    collect_file "$SRC_DIR/components/layout/store/store-header.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/store/store-footer.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/store/store-breadcrumb.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/store/store-not-found.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/store/store-skeleton.tsx" "$output_file"

    # ── 3. STORE PRODUCT COMPONENTS ────────────────────────────────
    section_header "3. STORE — PRODUCT COMPONENTS" "$output_file"
    
    collect_file "$SRC_DIR/components/store/product/product-card.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/product-grid.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/product-gallery.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/product-info.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/product-actions.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/product-filters.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/featured-products.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/related-products.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/category-list.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/product/product-pagination.tsx" "$output_file"

    # ── 4. STORE SHARED COMPONENTS ─────────────────────────────────
    section_header "4. STORE — SHARED COMPONENTS" "$output_file"
    
    collect_file "$SRC_DIR/components/store/shared/product-schema.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/product-list-schema.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/breadcrumb-schema.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/json-ld.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/social-share.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/organization-schema.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/local-business-schema.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/edu-banner.tsx" "$output_file"

    # ── 5. STORE CHECKOUT ───────────────────────────────────────────
    section_header "5. STORE — CHECKOUT COMPONENTS" "$output_file"
    
    collect_file "$SRC_DIR/components/store/checkout/stripe-checkout-button.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/checkout/whatsapp-order-button.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/checkout/contact-seller-button.tsx" "$output_file"

    # ── 6. STORE URL HELPERS ────────────────────────────────────────
    section_header "6. STORE — URL HELPERS" "$output_file"
    
    collect_file "$SRC_DIR/lib/public/store-url.ts" "$output_file"
    collect_file "$SRC_DIR/lib/public/store-url.server.ts" "$output_file"
    collect_file "$SRC_DIR/lib/public/use-store-urls.ts" "$output_file"

    # ── 7. CHECKOUT PAGES ───────────────────────────────────────────
    section_header "7. CHECKOUT — PAGES" "$output_file"
    
    collect_file "$SRC_DIR/app/[locale]/checkout/success/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/checkout/success/client.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/checkout/cancel/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/checkout/cancel/client.tsx" "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED
    [ $FOUND -eq 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  STORE FILES — SUMMARY                            ║${NC}"
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
        echo "Store Pages          : 8"
        echo "Store Layout         : 5"
        echo "Store Products       : 10"
        echo "Store Shared         : 8"
        echo "Store Checkout       : 3"
        echo "Store URL Helpers    : 3"
        echo "Checkout Pages       : 4"
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"