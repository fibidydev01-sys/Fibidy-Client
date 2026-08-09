#!/bin/bash

# ================================================================
# CLIENT — STOREFRONT BREADCRUMB FILES COLLECTOR
# 
# Collect file yang berkaitan dengan breadcrumb storefront:
#   - store-breadcrumb.tsx (komponen render breadcrumb)
#   - store product detail page (manggil breadcrumb)
#   - seo.ts (logic generate breadcrumb)
#   - store-url.ts (helper URL)
#
# Run dari: root direktori client (tempat src/ ada)
#   bash collect-breadcrumb-files.sh
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
# ORPHAN CHECK
# ================================================================

check_missing_file() {
    local file=$1
    local output=$2
    local rel="${file#$PROJECT_ROOT/}"
    
    echo -e "\n  ${YELLOW}🔍 Checking: $rel${NC}"
    echo "" >> "$output"
    echo "--- STATUS CHECK: $rel ---" >> "$output"
    
    if [ -f "$file" ]; then
        local lines
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}✓ EXISTS${NC} (${lines} lines)"
        echo "STATUS: EXISTS (${lines} lines)" >> "$output"
    else
        echo -e "  ${RED}✗ MISSING${NC} — FILE TIDAK ADA!"
        echo "STATUS: *** FILE NOT FOUND ***" >> "$output"
    fi
    echo "" >> "$output"
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
    local output_file="$OUT/BREADCRUMB-FILES-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — STOREFRONT BREADCRUMB FILES"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
        echo "##  FOCUS AREAS:"
        echo "##    1. Breadcrumb component (store-breadcrumb.tsx)"
        echo "##    2. Store product detail page (manggil breadcrumb)"
        echo "##    3. SEO logic (generate breadcrumb)"
        echo "##    4. Store URL helper (store-url.ts)"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  STOREFRONT BREADCRUMB FILES COLLECTOR                  ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. BREADCRUMB COMPONENT ──────────────────────────────────
    section_header "1. BREADCRUMB COMPONENT" "$output_file"
    collect_file "$SRC_DIR/components/layout/store/store-breadcrumb.tsx" "$output_file"

    # ── 2. STORE PRODUCT DETAIL PAGE ─────────────────────────────
    section_header "2. STORE PRODUCT DETAIL PAGE" "$output_file"
    
    # Cari semua file page.tsx di store product detail
    echo -e "\n  ${CYAN}📋 Finding store product detail pages...${NC}"
    echo "" >> "$output_file"
    echo "--- STORE PRODUCT DETAIL PAGES ---" >> "$output_file"
    
    find "$SRC_DIR/app/[locale]/store" -path "*/products/[id]/page.tsx" 2>/dev/null | while read -r f; do
        collect_file "$f" "$output_file"
    done
    
    # Kalau ga nemu, coba cari alternative
    if [ $(find "$SRC_DIR/app/[locale]/store" -path "*/products/[id]/page.tsx" 2>/dev/null | wc -l) -eq 0 ]; then
        echo -e "  ${YELLOW}⚠ No product detail page found at expected path${NC}"
        echo "WARNING: No product detail page found at expected path" >> "$output_file"
        
        # Coba cari semua page.tsx di store
        echo "" >> "$output_file"
        echo "--- ALL STORE PAGES (fallback) ---" >> "$output_file"
        find "$SRC_DIR/app/[locale]/store" -name "page.tsx" 2>/dev/null | while read -r f; do
            collect_file "$f" "$output_file"
        done
    fi

    # ── 3. STORE LAYOUT ──────────────────────────────────────────
    section_header "3. STORE LAYOUT" "$output_file"
    
    # Cari layout store yang mungkin manggil breadcrumb
    find "$SRC_DIR/app/[locale]/store" -name "layout.tsx" 2>/dev/null | while read -r f; do
        collect_file "$f" "$output_file"
    done

    # ── 4. SEO LOGIC ──────────────────────────────────────────────
    section_header "4. SEO — BREADCRUMB SCHEMA" "$output_file"
    collect_file "$SRC_DIR/lib/shared/seo.ts" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/breadcrumb-schema.tsx" "$output_file"
    collect_file "$SRC_DIR/components/store/shared/json-ld.tsx" "$output_file"

    # ── 5. STORE URL HELPER ──────────────────────────────────────
    section_header "5. STORE URL HELPER" "$output_file"
    collect_file "$SRC_DIR/lib/public/store-url.ts" "$output_file"
    collect_file "$SRC_DIR/lib/public/use-store-urls.ts" "$output_file"

    # ── 6. RELATED UTILITIES ─────────────────────────────────────
    section_header "6. RELATED UTILITIES" "$output_file"
    collect_file "$SRC_DIR/lib/shared/schema.ts" "$output_file"

    # ── 7. CHECK MISSING FILES ──────────────────────────────────
    section_header "7. FILE STATUS CHECK" "$output_file"
    
    echo "" >> "$output_file"
    echo "## CRITICAL FILES STATUS" >> "$output_file"
    echo "" >> "$output_file"
    
    check_missing_file "$SRC_DIR/components/layout/store/store-breadcrumb.tsx" "$output_file"
    check_missing_file "$SRC_DIR/lib/public/store-url.ts" "$output_file"
    check_missing_file "$SRC_DIR/lib/shared/seo.ts" "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED
    [ $FOUND -eq 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  BREADCRUMB FILES — SUMMARY                       ║${NC}"
    echo -e "${color}╠════════════════════════════════════════════════════╣${NC}"
    printf "${color}║  ✓ Found   : %-3d / %-3d                             ║${NC}\n" "$FOUND" "$TOTAL"
    printf "${color}║  ✗ Missing : %-3d                                    ║${NC}\n" "$MISSING"
    printf "${color}║  Coverage  : %-3d%%                                  ║${NC}\n" "$pct"
    echo -e "${color}╚════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Show critical files status
    echo -e "${YELLOW}📋 CRITICAL FILES STATUS:${NC}"
    if [ -f "$SRC_DIR/components/layout/store/store-breadcrumb.tsx" ]; then
        echo -e "  ${GREEN}✓${NC} store-breadcrumb.tsx — EXISTS"
    else
        echo -e "  ${RED}✗${NC} store-breadcrumb.tsx — MISSING (ini yang render breadcrumb!)"
    fi
    
    if [ -f "$SRC_DIR/lib/public/store-url.ts" ]; then
        echo -e "  ${GREEN}✓${NC} store-url.ts — EXISTS"
    else
        echo -e "  ${RED}✗${NC} store-url.ts — MISSING (ini helper URL!)"
    fi
    
    if [ -f "$SRC_DIR/lib/shared/seo.ts" ]; then
        echo -e "  ${GREEN}✓${NC} seo.ts — EXISTS"
    else
        echo -e "  ${RED}✗${NC} seo.ts — MISSING (logic breadcrumb ada di sini!)"
    fi
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
        echo "## CRITICAL FILES STATUS"
        echo "store-breadcrumb.tsx: $([ -f "$SRC_DIR/components/layout/store/store-breadcrumb.tsx" ] && echo "EXISTS" || echo "MISSING")"
        echo "store-url.ts: $([ -f "$SRC_DIR/lib/public/store-url.ts" ] && echo "EXISTS" || echo "MISSING")"
        echo "seo.ts: $([ -f "$SRC_DIR/lib/shared/seo.ts" ] && echo "EXISTS" || echo "MISSING")"
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"