#!/bin/bash

# ================================================================
# CLIENT — SETTINGS BIO FILES COLLECTOR
# 
# Collect file yang berkaitan dengan BIO/Profile/About toko:
#   - Settings about/bio
#   - Setup store story & highlights
#   - Tenant types (bio, description, highlights)
#   - Hooks terkait tenant/landing config
#
# Run dari: root direktori client (tempat src/ ada)
#   bash collect-bio-files.sh
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
    local output_file="$OUT/BIO-FILES-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — SETTINGS BIO FILES"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
        echo "##  FOCUS AREAS:"
        echo "##    1. Settings About/Bio"
        echo "##    2. Setup Store Story & Highlights"
        echo "##    3. Tenant Types (bio, description, highlights)"
        echo "##    4. Hooks & API"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  SETTINGS BIO FILES COLLECTOR                           ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. SETTINGS ABOUT/BIO ──────────────────────────────────────
    section_header "1. SETTINGS — ABOUT/BIO" "$output_file"
    
    collect_file "$SRC_DIR/components/dashboard/settings/about.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/form/about/step-highlights.tsx" "$output_file"

    # ── 2. SETUP STORE — STORY & HIGHLIGHTS ───────────────────────
    section_header "2. SETUP STORE — STORY & HIGHLIGHTS" "$output_file"
    
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-story.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-highlights.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/setup-store/seller/use-seller-setup-autofill.ts" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/setup-store/seller/autofill-badge.tsx" "$output_file"

    # ── 3. SETTINGS HERO ───────────────────────────────────────────
    section_header "3. SETTINGS — HERO (Story)" "$output_file"
    
    collect_file "$SRC_DIR/components/dashboard/settings/hero.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/form/hero/step-story.tsx" "$output_file"

    # ── 4. TYPES ────────────────────────────────────────────────────
    section_header "4. TYPES — TENANT (Bio/Description/Highlights)" "$output_file"
    
    collect_file "$SRC_DIR/types/tenant.ts" "$output_file"

    # ── 5. HOOKS ────────────────────────────────────────────────────
    section_header "5. HOOKS — TENANT & LANDING CONFIG" "$output_file"
    
    collect_file "$SRC_DIR/hooks/dashboard/use-tenant.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/dashboard/use-landing-config.ts" "$output_file"

    # ── 6. API ──────────────────────────────────────────────────────
    section_header "6. API — TENANTS" "$output_file"
    
    collect_file "$SRC_DIR/lib/api/tenants.ts" "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED
    [ $FOUND -eq 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  BIO FILES — SUMMARY                              ║${NC}"
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
        echo "## FILES COLLECTED"
        echo "Settings About/Bio: 2"
        echo "Setup Store Story & Highlights: 4"
        echo "Settings Hero (Story): 2"
        echo "Types (Tenant): 1"
        echo "Hooks: 2"
        echo "API: 1"
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"