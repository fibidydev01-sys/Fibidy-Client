#!/bin/bash

# ================================================================
# CLIENT — SELLER ONBOARDING E2E COLLECTOR
# [ONBOARDING-GATE — May 2026]
#
# Pure collect. No logic. No checks. No warnings.
# Source of truth = documentation / .md files.
#
# Run dari root direktori client (tempat src/ ada):
#   bash collect-onboarding-e2e.sh
# ================================================================

PROJECT_ROOT="."
SRC="$PROJECT_ROOT/src"
MSG="$PROJECT_ROOT/messages"
OUT="collections"
mkdir -p "$OUT"

GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BLUE='\033[0;34m'
NC='\033[0m'

FOUND=0
MISSING=0
TOTAL=0

# ================================================================
# HELPERS
# ================================================================

collect_file() {
    local file=$1
    local output=$2
    local reason=${3:-""}
    TOTAL=$((TOTAL + 1))

    if [ -f "$file" ]; then
        local rel="${file#./}"
        local lines
        lines=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}✓${NC} $rel ${CYAN}($lines lines)${NC}${reason:+ — $reason}"
        FOUND=$((FOUND + 1))
        {
            echo "================================================"
            echo "FILE: $rel"
            echo "Lines: $lines"
            [ -n "$reason" ] && echo "Reason: $reason"
            echo "================================================"
            echo ""
            cat "$file"
            printf "\n\n"
        } >> "$output"
    else
        echo -e "  ${RED}✗ MISSING:${NC} ${file#./}"
        MISSING=$((MISSING + 1))
        {
            echo "================================================"
            echo "FILE: ${file#./}"
            echo "STATUS: *** FILE NOT FOUND ***"
            echo "================================================"
            echo ""
        } >> "$output"
    fi
}

section_header() {
    local num=$1
    local label=$2
    local output=$3
    local note=${4:-""}
    echo ""
    echo -e "${MAGENTA}▶ $num. $label${NC}"
    [ -n "$note" ] && echo -e "  ${CYAN}$note${NC}"
    {
        echo ""
        echo "################################################################"
        echo "##  $num. $label"
        [ -n "$note" ] && echo "##  NOTE: $note"
        echo "################################################################"
        echo ""
    } >> "$output"
}

# ================================================================
# MAIN
# ================================================================
main() {
    if [ ! -d "$SRC" ]; then
        echo -e "${RED}ERROR: src/ tidak ditemukan. Jalankan dari root direktori client.${NC}"
        exit 1
    fi

    local ts
    ts=$(date '+%Y%m%d-%H%M%S')
    local OUT_FILE="$OUT/ONBOARDING-E2E-COLLECT-$ts.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — SELLER ONBOARDING E2E COLLECTOR"
        echo "##  [ONBOARDING-GATE — May 2026]"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "##"
        echo "##  Flow: Register Wizard → Gate Check → Mandatory Onboarding"
        echo "##        → isOnboardingComplete: true → Dashboard Terbuka"
        echo "##"
        echo "##  Scope: SELLER only. BUYER flow di-skip."
        echo "################################################################"
    } > "$OUT_FILE"

    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  SELLER ONBOARDING E2E COLLECTOR                         ${NC}"
    echo -e "${BLUE}  Register Wizard → Gate → Onboarding → Dashboard         ${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"

    # ── SECTION 1: TIPE & API ─────────────────────────────────────
    section_header "1" "TIPE & API LAYER" "$OUT_FILE" \
        "Field inventory + endpoint yang dipakai onboarding"
    collect_file "$SRC/types/tenant.ts"        "$OUT_FILE" "isOnboardingComplete + semua field onboarding"
    collect_file "$SRC/lib/api/tenants.ts"     "$OUT_FILE" "PATCH /tenants/me, upgrade-to-seller endpoint"
    collect_file "$SRC/lib/config/features.ts" "$OUT_FILE" "FEATURES flag — digitalProducts"

    # ── SECTION 2: AUTH LAYER E2E ─────────────────────────────────
    section_header "2" "AUTH LAYER — E2E Register → Onboarding" "$OUT_FILE" \
        "useRegister redirect + gate client-side + route constants"
    collect_file "$SRC/hooks/auth/use-auth.ts"                                            "$OUT_FILE" "useRegister → onboarding, useLogin → cek isOnboardingComplete"
    collect_file "$SRC/hooks/auth/use-register-wizard.ts"                                 "$OUT_FILE" "wizard state + builder handoff"
    collect_file "$SRC/lib/constants/shared/route-guard.ts"                               "$OUT_FILE" "SELLER_ONLY_ROUTES"
    collect_file "$SRC/components/layout/dashboard/dashboard-route-guard.tsx"             "$OUT_FILE" "gate client-side"

    # ── SECTION 3: AUTH STORE ─────────────────────────────────────
    section_header "3" "AUTH STORE" "$OUT_FILE" \
        "setTenant sync setelah onboarding submit"
    collect_file "$SRC/stores/auth-store.ts" "$OUT_FILE" "tenant state + isOnboardingComplete sync ke store"

    # ── SECTION 4: ONBOARDING PAGE ───────────────────────────────
    section_header "4" "ONBOARDING PAGE — target build" "$OUT_FILE" \
        "Wizard orchestrator"
    collect_file "$SRC/app/[locale]/(dashboard)/dashboard/setup-store/page.tsx"   "$OUT_FILE" "server wrapper + metadata"
    collect_file "$SRC/app/[locale]/(dashboard)/dashboard/setup-store/client.tsx" "$OUT_FILE" "ORCHESTRATOR UTAMA — semua step di-wire di sini"

    # ── SECTION 5: SETTINGS ORCHESTRATORS ────────────────────────
    section_header "5" "SETTINGS ORCHESTRATORS — referensi pattern save" "$OUT_FILE" \
        "Pola: init formData dari tenant → per-step update → handleSave → PATCH"
    collect_file "$SRC/components/dashboard/settings/hero.tsx"    "$OUT_FILE" "pola: 3-step wizard + PATCH /tenants/me"
    collect_file "$SRC/components/dashboard/settings/contact.tsx" "$OUT_FILE" "pola: 3-step wizard + PATCH /tenants/me"
    collect_file "$SRC/components/dashboard/settings/about.tsx"   "$OUT_FILE" "pola: 1-step + validate + PATCH"
    collect_file "$SRC/components/dashboard/settings/social.tsx"  "$OUT_FILE" "pola: 1-step + PATCH"

    # ── SECTION 6: STEP COMPONENTS ───────────────────────────────
    section_header "6" "STEP COMPONENTS — semua akan di-reuse di onboarding" "$OUT_FILE" \
        "Import langsung ke onboarding client.tsx — tidak perlu tulis ulang"
    collect_file "$SRC/components/dashboard/settings/form/hero/step-identity.tsx"        "$OUT_FILE" "Step 1A: nama, slug (locked), kategori (locked), CTA button"
    collect_file "$SRC/components/dashboard/settings/form/hero/step-story.tsx"           "$OUT_FILE" "Step 1B: headline, subheading, tagline"
    collect_file "$SRC/components/dashboard/settings/form/hero/step-appearance.tsx"      "$OUT_FILE" "Step 1C: logo upload, hero bg, brand color"
    collect_file "$SRC/components/dashboard/settings/form/contact/step-contact-info.tsx" "$OUT_FILE" "Step 3A: WhatsApp (wajib), phone, address"
    collect_file "$SRC/components/dashboard/settings/form/contact/step-location.tsx"     "$OUT_FILE" "Step 3B: Google Maps embed + show/hide toggle"
    collect_file "$SRC/components/dashboard/settings/form/about/step-highlights.tsx"     "$OUT_FILE" "Step 4: feature highlights (opsional)"
    collect_file "$SRC/components/dashboard/settings/form/social/step-social-links.tsx"  "$OUT_FILE" "Step 5: social links (opsional)"

    # ── SECTION 7: SHARED WIZARD PRIMITIVES ──────────────────────
    section_header "7" "SHARED WIZARD PRIMITIVES" "$OUT_FILE" \
        "Komponen navigasi yang dipakai semua step"
    collect_file "$SRC/components/dashboard/shared/wizard-nav.tsx"  "$OUT_FILE" "Prev/Next/Save fixed bottom bar"
    collect_file "$SRC/components/dashboard/shared/step-wizard.tsx" "$OUT_FILE" "StepIndicator (numbered) + StepDots (progress)"
    collect_file "$SRC/components/dashboard/shared/image-slot.tsx"  "$OUT_FILE" "FilledSlot/EmptySlot — dipakai step-appearance"

    # ── SECTION 8: HOOKS PENDUKUNG ────────────────────────────────
    section_header "8" "HOOKS PENDUKUNG" "$OUT_FILE" \
        "Hooks yang langsung dipakai di onboarding wizard"
    collect_file "$SRC/hooks/user/use-upgrade-to-seller.ts"   "$OUT_FILE" "PATCH upgrade-to-seller — jika onboarding via BUYER flow"
    collect_file "$SRC/hooks/shared/use-tenant.ts"            "$OUT_FILE" "get tenant + refresh setelah setiap save step"
    collect_file "$SRC/hooks/shared/use-cloudinary-upload.ts" "$OUT_FILE" "logo + hero background upload"

    # ── SECTION 9: SHARED UTILS ───────────────────────────────────
    section_header "9" "SHARED UTILS" "$OUT_FILE" \
        "Utils yang dipakai step components"
    collect_file "$SRC/lib/constants/shared/categories.ts" "$OUT_FILE" "getCategoryConfig — dipakai step-identity category display"
    collect_file "$SRC/lib/shared/cloudinary.ts"           "$OUT_FILE" "ensureCloudinaryScript — script loader widget upload"

    # ── SECTION 10: i18n ─────────────────────────────────────────
    section_header "10" "i18n — E2E Coverage (4 namespace × 2 locale)" "$OUT_FILE" \
        "dashboard + settings + toast + auth"
    for locale in en id; do
        for namespace in dashboard settings toast auth; do
            collect_file "$MSG/$locale/$namespace.json" "$OUT_FILE"
        done
    done

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ "$TOTAL" -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  SELLER ONBOARDING E2E COLLECT — SUMMARY                ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
    printf "${GREEN}║  ✓ Found      : %-3d / %-3d                               ║${NC}\n" "$FOUND" "$TOTAL"
    printf "${GREEN}║  ✗ Missing    : %-3d                                      ║${NC}\n" "$MISSING"
    printf "${GREEN}║  Coverage     : %-3d%%                                    ║${NC}\n" "$pct"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Flow yang dicollect:                                    ║${NC}"
    echo -e "${GREEN}║    Register Wizard → Gate Check → Onboarding → Dashboard ║${NC}"
    echo -e "${GREEN}║  Scope: SELLER only                                      ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Sengaja tidak dicollect:                                ║${NC}"
    echo -e "${GREEN}║    lib/api/client.ts  → 509 lines, tidak diubah          ║${NC}"
    echo -e "${GREEN}║    proxy.ts           → 383 lines, gate di route guard   ║${NC}"
    echo -e "${GREEN}║    use-buyer-register → buyer scope, di-skip             ║${NC}"
    echo -e "${GREEN}║    common/validation  → tidak ada onboarding keys baru   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}📂 Output: $OUT_FILE${NC}"
    echo ""

    {
        echo ""
        echo "################################################################"
        echo "##  SUMMARY"
        echo "################################################################"
        echo "Found    : $FOUND / $TOTAL"
        echo "Missing  : $MISSING"
        echo "Coverage : $pct%"
        echo ""
        echo "Flow: Register Wizard → Gate Check → Mandatory Onboarding → Dashboard"
        echo "Scope: SELLER only"
        echo ""
        echo "Sengaja tidak dicollect:"
        echo "  lib/api/client.ts  → 509 lines, tidak diubah"
        echo "  proxy.ts           → 383 lines, gate di route guard"
        echo "  use-buyer-register → buyer scope"
        echo "  common/validation  → tidak ada onboarding keys baru"
    } >> "$OUT_FILE"
}

main "$@"