#!/bin/bash

# ================================================================
# CLIENT — SETTINGS FILES COLLECTOR
# 
# Collect semua file Settings:
#   - Settings pages (main, client)
#   - Settings sections (about, contact, hero, social, language, password)
#   - Settings form components (step by step)
#   - Settings hooks & API
#
# Run dari: root direktori client (tempat src/ ada)
#   bash collect-settings-files.sh
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
    local output_file="$OUT/SETTINGS-FILES-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — SETTINGS FILES"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
        echo "##  FOCUS AREAS:"
        echo "##    1. Settings Pages"
        echo "##    2. Settings Sections (About, Contact, Hero, Social, Language, Password)"
        echo "##    3. Settings Form Components (step by step)"
        echo "##    4. Settings Hooks"
        echo "##    5. Settings API"
        echo "##    6. Settings Types"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  SETTINGS FILES COLLECTOR                               ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. SETTINGS PAGES ──────────────────────────────────────────
    section_header "1. SETTINGS — PAGES" "$output_file"
    
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/settings/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/settings/client.tsx" "$output_file"

    # ── 2. SETTINGS SECTIONS ───────────────────────────────────────
    section_header "2. SETTINGS — SECTIONS" "$output_file"
    
    collect_file "$SRC_DIR/components/dashboard/settings/about.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/contact.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/hero.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/social.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/language.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/password.tsx" "$output_file"

    # ── 3. SETTINGS FORM COMPONENTS ────────────────────────────────
    section_header "3. SETTINGS — FORM COMPONENTS" "$output_file"
    
    # About
    collect_file "$SRC_DIR/components/dashboard/settings/form/about/step-highlights.tsx" "$output_file"
    
    # Contact
    collect_file "$SRC_DIR/components/dashboard/settings/form/contact/step-contact-info.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/form/contact/step-location.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/form/contact/step-section-heading.tsx" "$output_file"
    
    # Hero
    collect_file "$SRC_DIR/components/dashboard/settings/form/hero/step-appearance.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/form/hero/step-identity.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/settings/form/hero/step-story.tsx" "$output_file"
    
    # Social
    collect_file "$SRC_DIR/components/dashboard/settings/form/social/step-social-links.tsx" "$output_file"

    # ── 4. SETTINGS HOOKS ──────────────────────────────────────────
    section_header "4. SETTINGS — HOOKS" "$output_file"
    
    collect_file "$SRC_DIR/hooks/dashboard/use-tenant.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/dashboard/use-landing-config.ts" "$output_file"

    # ── 5. SETTINGS API ────────────────────────────────────────────
    section_header "5. SETTINGS — API" "$output_file"
    
    collect_file "$SRC_DIR/lib/api/tenants.ts" "$output_file"

    # ── 6. SETTINGS TYPES ──────────────────────────────────────────
    section_header "6. SETTINGS — TYPES" "$output_file"
    
    collect_file "$SRC_DIR/types/tenant.ts" "$output_file"
    collect_file "$SRC_DIR/types/landing.ts" "$output_file"

    # ── 7. SETUP STORE ─────────────────────────────────────────────
    section_header "7. SETUP STORE — RELATED" "$output_file"
    
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/setup-store/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/setup-store/client.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/setup-store/setup-step-indicator.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/setup-store/setup-wizard-nav.tsx" "$output_file"

    # ── 8. SHARED WIZARD ───────────────────────────────────────────
    section_header "8. SHARED — WIZARD COMPONENTS" "$output_file"
    
    collect_file "$SRC_DIR/components/dashboard/shared/wizard-nav.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/step-indicator.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/step-wizard.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/upgrade-modal.tsx" "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED
    [ $FOUND -eq 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  SETTINGS FILES — SUMMARY                         ║${NC}"
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
        echo "Settings Pages        : 2"
        echo "Settings Sections     : 6"
        echo "Settings Form         : 8"
        echo "Settings Hooks        : 2"
        echo "Settings API          : 1"
        echo "Settings Types        : 2"
        echo "Setup Store           : 4"
        echo "Shared Wizard         : 4"
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"