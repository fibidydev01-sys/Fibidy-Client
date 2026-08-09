#!/bin/bash

# ================================================================
# CLIENT — STUDIO FILES COLLECTOR (Block1 Only)
# 
# Collect semua file Studio/Landing Page Builder:
#   - Studio pages
#   - Block1 component only (skip block2-25)
#   - Studio UI components
#   - Studio hooks
#   - Landing types & config
#
# Run dari: root direktori client (tempat src/ ada)
#   bash collect-studio-files.sh
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
    local output_file="$OUT/STUDIO-FILES-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — STUDIO FILES (Landing Page Builder)"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
        echo "##  FOCUS AREAS:"
        echo "##    1. Studio Page"
        echo "##    2. Block1 Component"
        echo "##    3. Studio UI Components"
        echo "##    4. Studio Hooks"
        echo "##    5. Landing Types & Config"
        echo "##    6. Shared Components (OG Image, Preview)"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  STUDIO FILES COLLECTOR (Block1 Only)                   ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. STUDIO PAGE ─────────────────────────────────────────────
    section_header "1. STUDIO — MAIN PAGE" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/studio/page.tsx" "$output_file"

    # ── 2. BLOCK1 ───────────────────────────────────────────────────
    section_header "2. BLOCK — BLOCK1 ONLY" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/blocks/block.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/blocks/block1.tsx" "$output_file"

    # ── 3. STUDIO UI COMPONENTS ────────────────────────────────────
    section_header "3. STUDIO — UI COMPONENTS" "$output_file"
    
    collect_file "$SRC_DIR/components/dashboard/studio/block-drawer.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/block-options.ts" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/builder-header.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/builder-loading-steps.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/first-publish-dialog.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/full-preview-drawer.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/landing-error-boundary.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/live-preview.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/studio/save-status-pill.tsx" "$output_file"

    # ── 4. STUDIO HOOKS ────────────────────────────────────────────
    section_header "4. STUDIO — HOOKS" "$output_file"
    
    collect_file "$SRC_DIR/hooks/dashboard/use-builder-store.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/dashboard/use-landing-config.ts" "$output_file"

    # ── 5. LANDING TYPES ────────────────────────────────────────────
    section_header "5. LANDING — TYPES" "$output_file"
    
    collect_file "$SRC_DIR/types/landing.ts" "$output_file"

    # ── 6. SHARED COMPONENTS ───────────────────────────────────────
    section_header "6. SHARED — OG IMAGE & PREVIEW" "$output_file"
    
    collect_file "$SRC_DIR/components/dashboard/shared/og-image.tsx" "$output_file"
    collect_file "$SRC_DIR/hooks/shared/use-preview.ts" "$output_file"

    # ── 7. API ──────────────────────────────────────────────────────
    section_header "7. API — LANDING CONFIG" "$output_file"
    
    collect_file "$SRC_DIR/lib/api/tenants.ts" "$output_file"

    # ── 8. UI COMPONENTS ────────────────────────────────────────────
    section_header "8. UI — SHEET, DRAWER, DIALOG" "$output_file"
    
    collect_file "$SRC_DIR/components/ui/sheet.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/drawer.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/dialog.tsx" "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED
    [ $FOUND -eq 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  STUDIO FILES — SUMMARY                           ║${NC}"
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
        echo "Studio Page        : 1"
        echo "Block1             : 2"
        echo "Studio UI          : 9"
        echo "Studio Hooks       : 2"
        echo "Landing Types      : 1"
        echo "Shared Components  : 2"
        echo "API                : 1"
        echo "UI Components      : 3"
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"