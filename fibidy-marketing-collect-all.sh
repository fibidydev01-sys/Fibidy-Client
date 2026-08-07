#!/bin/bash

# ================================================================
# CLIENT — MARKETING LANDING PAGE COVERAGE COLLECTOR
#
# Collect semua file marketing ke SATU file .txt (isi lengkap).
#
# Mode:
#   interaktif  → menu pilih section
#   <key>       → langsung by section key  (e.g. hero)
#   <number>    → langsung by nomor menu   (e.g. 2)
#   all         → semua section sekaligus
#   shared      → hanya file bersama
#
# Usage:
#   bash fibidy-marketing-collect.sh              ← menu interaktif
#   bash fibidy-marketing-collect.sh hero         ← langsung
#   bash fibidy-marketing-collect.sh 2            ← by nomor
#   bash fibidy-marketing-collect.sh all          ← semua
#   bash fibidy-marketing-collect.sh shared       ← shared only
#
# Output: collections/MARKETING-COLLECT-<section>-<timestamp>.txt
# Run dari: root direktori client (tempat src/ ada)
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
MSG_DIR="$PROJECT_ROOT/messages"
OUT="collections"
mkdir -p "$OUT"

FOUND=0
MISSING=0
TOTAL=0

# ================================================================
# SECTION REGISTRY
# ================================================================

SECTION_KEYS=(announcement hero problem features scale howItWorks pricing storeBuilder faq finalCta)

declare -A FOLDER_OF=(
    [announcement]="announcement"
    [hero]="hero"
    [problem]="problem"
    [features]="features"
    [scale]="scale"
    [howItWorks]="how-it-works"
    [pricing]="pricing"
    [storeBuilder]="store-builder"
    [faq]="faq"
    [finalCta]="final-cta"
)

declare -A DATA_OF=(
    [announcement]="announcement"
    [hero]="hero"
    [problem]="problem"
    [features]="features"
    [scale]="scale"
    [howItWorks]="how-it-works"
    [pricing]="pricing"
    [storeBuilder]="store-builder"
    [faq]="faq"
    [finalCta]="cta"
)

declare -A LABEL_OF=(
    [announcement]="Announcement bar"
    [hero]="Hero"
    [problem]="Problem / resonance"
    [features]="Features (bento grid)"
    [scale]="Scale (multi-tenant proof)"
    [howItWorks]="How It Works"
    [pricing]="Pricing"
    [storeBuilder]="Store Builder (conversion form)"
    [faq]="FAQ"
    [finalCta]="Final CTA"
)

# ================================================================
# MENU & RESOLVE
# ================================================================

print_menu() {
    local i=1
    for key in "${SECTION_KEYS[@]}"; do
        printf "  ${GREEN}%2d.${NC} %-14s ${CYAN}(%s)${NC}\n" "$i" "$key" "${LABEL_OF[$key]}"
        i=$((i + 1))
    done
    echo -e "  ${GREEN} a.${NC} all           ${CYAN}(semua section)${NC}"
    echo -e "  ${GREEN} s.${NC} shared        ${CYAN}(cuma file bersama: layout, registry, data, i18n)${NC}"
}

resolve_key() {
    local input="$1"
    local lower
    lower="$(printf '%s' "$input" | tr '[:upper:]' '[:lower:]')"

    case "$lower" in
        all|a) echo "all"; return 0 ;;
        shared|s) echo "shared"; return 0 ;;
    esac

    if [[ "$input" =~ ^[0-9]+$ ]]; then
        local idx=$((input - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#SECTION_KEYS[@]}" ]; then
            echo "${SECTION_KEYS[$idx]}"
            return 0
        fi
        return 1
    fi

    for key in "${SECTION_KEYS[@]}"; do
        local key_lower
        key_lower="$(printf '%s' "$key" | tr '[:upper:]' '[:lower:]')"
        if [ "$key_lower" = "$lower" ]; then
            echo "$key"
            return 0
        fi
    done
    return 1
}

# ================================================================
# HELPERS — collect ke satu TXT
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

collect_dir() {
    local dir=$1
    local output=$2

    if [ ! -d "$dir" ]; then
        echo -e "  ${RED}✗ DIR MISSING:${NC} ${dir#$PROJECT_ROOT/}"
        {
            echo "================================================"
            echo "DIR: ${dir#$PROJECT_ROOT/}"
            echo "STATUS: *** DIRECTORY NOT FOUND ***"
            echo "================================================"
            echo ""
        } >> "$output"
        return
    fi

    while IFS= read -r file; do
        collect_file "$file" "$output"
    done < <(find "$dir" -type f | sort)
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
# QUALITY CHECK HELPERS
# ================================================================

check_pass()    { echo -e "  ${GREEN}✓${NC} $1"; echo "OK — $1" >> "$2"; }
check_fail()    { echo -e "  ${RED}✗ VIOLATION:${NC} $1"; echo "VIOLATION — $1" >> "$2"; }
check_warn()    { echo -e "  ${YELLOW}⚠ WARNING:${NC} $1"; echo "WARNING — $1" >> "$2"; }
check_missing() { echo -e "  ${RED}✗ MISSING:${NC} $1"; echo "MISSING — $1" >> "$2"; }

# ================================================================
# SHARED FILES — selalu dikumpulkan di setiap mode
# ================================================================

collect_shared() {
    local output=$1

    section_header "LAYOUT & ROUTING — (marketing)" "$output"
    collect_file "$SRC_DIR/app/[locale]/(marketing)/layout.tsx" "$output"
    collect_file "$SRC_DIR/app/[locale]/(marketing)/page.tsx" "$output"
    collect_file "$SRC_DIR/i18n/routing.ts" "$output"
    collect_file "$SRC_DIR/i18n/navigation.ts" "$output"
    collect_file "$SRC_DIR/i18n/request.ts" "$output"

    section_header "REGISTRY & TYPES" "$output"
    collect_file "$SRC_DIR/components/marketing/registry.ts" "$output"
    collect_file "$SRC_DIR/types/marketing.ts" "$output"

    section_header "SHARED LAYOUT COMPONENTS — header, footer, dll" "$output"
    collect_file "$SRC_DIR/components/marketing/layout/header.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/layout/footer.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/layout/locale-switcher.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/layout/theme-toggle.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/layout/lenis-provider.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/layout/seo-schema.tsx" "$output"

    section_header "MARKETING PRIMITIVES — shared building blocks" "$output"
    collect_file "$SRC_DIR/components/marketing/primitives/browser-mockup.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/primitives/line-grid-frame.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/primitives/section-eyebrow.tsx" "$output"
    collect_file "$SRC_DIR/components/marketing/primitives/section-shell.tsx" "$output"

    section_header "DATA FILES — lib/marketing/data/" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/sections.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/nav.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/footer.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/announcement.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/hero.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/problem.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/features.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/scale.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/how-it-works.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/pricing.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/store-builder.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/faq.ts" "$output"
    collect_file "$SRC_DIR/lib/marketing/data/cta.ts" "$output"

    section_header "ONBOARDING / TOUR" "$output"
    collect_file "$SRC_DIR/lib/marketing/onboarding/tour-provider.tsx" "$output"
    collect_file "$SRC_DIR/lib/marketing/onboarding/tour-config.tsx" "$output"
    collect_file "$SRC_DIR/lib/marketing/onboarding/tour-names.ts" "$output"

    section_header "i18n MESSAGES — marketing.json (en + id)" "$output"
    collect_file "$MSG_DIR/en/marketing.json" "$output"
    collect_file "$MSG_DIR/id/marketing.json" "$output"
}

# ================================================================
# COLLECT SATU SECTION
# ================================================================

collect_one_section() {
    local key=$1
    local output=$2
    local folder="${FOLDER_OF[$key]}"
    local data="${DATA_OF[$key]}"
    local label="${LABEL_OF[$key]}"

    section_header "SECTION: ${key} — ${label}" "$output"
    collect_dir "$SRC_DIR/components/marketing/sections/${folder}" "$output"
}

# ================================================================
# QUALITY CHECKS
# ================================================================

run_quality_checks() {
    local output=$1

    {
        echo ""
        echo "################################################################"
        echo "##  QUALITY CHECKS"
        echo "################################################################"
        echo ""
    } >> "$output"

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  QUALITY CHECKS                                           ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # CHECK A
    echo -e "\n${MAGENTA}▶ CHECK A — registry.ts: semua 10 SectionKey terdaftar${NC}"
    echo "" >> "$output"; echo "## CHECK A — registry.ts completeness" >> "$output"
    local reg="$SRC_DIR/components/marketing/registry.ts"
    if [ ! -f "$reg" ]; then
        check_missing "registry.ts tidak ditemukan!" "$output"
    else
        for key in "${SECTION_KEYS[@]}"; do
            if grep -q "$key" "$reg" 2>/dev/null; then
                check_pass "registry.ts: '$key' terdaftar" "$output"
            else
                check_fail "registry.ts: '$key' TIDAK terdaftar!" "$output"
            fi
        done
    fi

    # CHECK B
    echo -e "\n${MAGENTA}▶ CHECK B — types/marketing.ts: SectionKey union ada${NC}"
    echo "" >> "$output"; echo "## CHECK B — SectionKey union" >> "$output"
    local tfile="$SRC_DIR/types/marketing.ts"
    if [ ! -f "$tfile" ]; then
        check_missing "types/marketing.ts tidak ditemukan!" "$output"
    elif grep -q "SectionKey" "$tfile" 2>/dev/null; then
        check_pass "types/marketing.ts ada SectionKey" "$output"
    else
        check_fail "types/marketing.ts TIDAK ada SectionKey!" "$output"
    fi

    # CHECK C
    echo -e "\n${MAGENTA}▶ CHECK C — section folders: semua ada di sections/${NC}"
    echo "" >> "$output"; echo "## CHECK C — section folders" >> "$output"
    for key in "${SECTION_KEYS[@]}"; do
        local dir="$SRC_DIR/components/marketing/sections/${FOLDER_OF[$key]}"
        if [ -d "$dir" ]; then
            local count
            count=$(find "$dir" -type f | wc -l)
            check_pass "sections/${FOLDER_OF[$key]}/ ada ($count files)" "$output"
        else
            check_fail "sections/${FOLDER_OF[$key]}/ TIDAK ADA!" "$output"
        fi
    done

    # CHECK D
    echo -e "\n${MAGENTA}▶ CHECK D — data files: lib/marketing/data/ per section${NC}"
    echo "" >> "$output"; echo "## CHECK D — data files" >> "$output"
    for key in "${SECTION_KEYS[@]}"; do
        local path="$SRC_DIR/lib/marketing/data/${DATA_OF[$key]}.ts"
        if [ -f "$path" ]; then
            local lines
            lines=$(wc -l < "$path" 2>/dev/null || echo "0")
            check_pass "data/${DATA_OF[$key]}.ts ada ($lines lines)" "$output"
        else
            check_fail "data/${DATA_OF[$key]}.ts TIDAK ADA! (key: $key)" "$output"
        fi
    done

    # CHECK E
    echo -e "\n${MAGENTA}▶ CHECK E — marketing.json: en + id${NC}"
    echo "" >> "$output"; echo "## CHECK E — marketing.json" >> "$output"
    for locale in en id; do
        local f="$MSG_DIR/$locale/marketing.json"
        if [ -f "$f" ]; then
            local lines
            lines=$(wc -l < "$f" 2>/dev/null || echo "0")
            check_pass "messages/$locale/marketing.json ada ($lines lines)" "$output"
        else
            check_missing "messages/$locale/marketing.json TIDAK ADA!" "$output"
        fi
    done

    # CHECK F
    echo -e "\n${MAGENTA}▶ CHECK F — (marketing)/layout.tsx: tidak boleh 'use client'${NC}"
    echo "" >> "$output"; echo "## CHECK F — layout Server Component" >> "$output"
    local lfile="$SRC_DIR/app/[locale]/(marketing)/layout.tsx"
    if [ ! -f "$lfile" ]; then
        check_missing "(marketing)/layout.tsx tidak ditemukan!" "$output"
    elif grep -q "'use client'" "$lfile" 2>/dev/null; then
        check_fail "(marketing)/layout.tsx ada 'use client' — harus Server Component!" "$output"
    else
        check_pass "(marketing)/layout.tsx bersih dari 'use client'" "$output"
    fi

    # CHECK G
    echo -e "\n${MAGENTA}▶ CHECK G — (marketing)/page.tsx: render sections dinamis${NC}"
    echo "" >> "$output"; echo "## CHECK G — page.tsx dynamic rendering" >> "$output"
    local pfile="$SRC_DIR/app/[locale]/(marketing)/page.tsx"
    if [ ! -f "$pfile" ]; then
        check_missing "(marketing)/page.tsx tidak ditemukan!" "$output"
    elif grep -qiE "section|registry|map|render" "$pfile" 2>/dev/null; then
        check_pass "(marketing)/page.tsx ada dynamic section rendering" "$output"
    else
        check_warn "(marketing)/page.tsx tidak jelas ada dynamic rendering — cek manual" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# SUMMARY
# ================================================================

print_summary() {
    local output=$1
    local label=$2

    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    printf "${color}║  MARKETING COLLECT — SUMMARY [%-20s] ║${NC}\n" "$label"
    echo -e "${color}╠════════════════════════════════════════════════════╣${NC}"
    printf "${color}║  ✓ Found   : %-3d / %-3d                             ║${NC}\n" "$FOUND" "$TOTAL"
    printf "${color}║  ✗ Missing : %-3d                                    ║${NC}\n" "$MISSING"
    printf "${color}║  Coverage  : %-3d%%                                  ║${NC}\n" "$pct"
    echo -e "${color}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}📂 Output: $output${NC}"
    echo ""

    {
        echo ""
        echo "################################################################"
        echo "##  SUMMARY [$label]"
        echo "################################################################"
        echo "Found   : $FOUND / $TOTAL"
        echo "Missing : $MISSING"
        echo "Coverage: $pct%"
    } >> "$output"
}

# ================================================================
# MAIN
# ================================================================

main() {
    if [ ! -d "$SRC_DIR" ]; then
        echo -e "${RED}ERROR: src/ tidak ditemukan di: $(pwd)${NC}"
        echo -e "Jalankan script ini dari root direktori client (tempat src/ ada)"
        exit 1
    fi

    local selector="${1:-}"

    # ── interaktif kalau tidak ada argumen ───────────────────────
    if [ -z "$selector" ]; then
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}  MARKETING COVERAGE COLLECTOR                             ${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "\n${MAGENTA}Pilih section marketing yang mau di-collect:${NC}\n"
        print_menu
        echo ""
        read -r -p "Pilihan (angka/key): " selector
    fi

    local resolved
    resolved="$(resolve_key "$selector")" || {
        echo -e "${RED}Section tidak dikenal: '$selector'${NC}" >&2
        echo -e "Pilihan valid: ${SECTION_KEYS[*]} | all | shared" >&2
        exit 1
    }

    # ── siapkan output file ───────────────────────────────────────
    local timestamp
    timestamp=$(date '+%Y%m%d-%H%M%S')
    local slug
    slug="$(printf '%s' "$resolved" | tr '[:upper:]' '[:lower:]')"
    local output_file="$OUT/MARKETING-COLLECT-${slug}-${timestamp}.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — MARKETING LANDING PAGE COVERAGE REPORT"
        echo "##  Section : $resolved"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  MARKETING COVERAGE COLLECTOR — [$resolved]               ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── collect ───────────────────────────────────────────────────
    case "$resolved" in
        all)
            collect_shared "$output_file"
            echo ""
            for key in "${SECTION_KEYS[@]}"; do
                collect_one_section "$key" "$output_file"
            done
            ;;
        shared)
            collect_shared "$output_file"
            ;;
        *)
            # single section: shared dulu, lalu section spesifik
            collect_shared "$output_file"
            echo ""
            collect_one_section "$resolved" "$output_file"
            ;;
    esac

    run_quality_checks "$output_file"
    print_summary "$output_file" "$resolved"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"
ENDOFSCRIPT