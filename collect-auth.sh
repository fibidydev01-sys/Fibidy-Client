#!/bin/bash

# ================================================================
# CLIENT — VERCEL VIBES COVERAGE CHECKER
# [VERCEL VIBES — May 2026]
#
# Collect semua file yang terlibat dalam:
#   1.  Proxy / Middleware (edge auth gate)
#   2.  Auth flow: login, register, forgot-password
#   3.  Auth components & layout (guard, auth-layout, auth-logo)
#   4.  Auth store & hooks
#   5.  Auth types & API module (client.ts)
#   6.  Marketing page (NEW: layout, page, header, footer, hero)
#   7.  i18n messages: marketing.json (en + id)
#   8.  Register wizard refactor (register-nav, register-step-indicator)
#   9.  User auth dialog (buy gate)
#
# Quality checks:
#   A.  Proxy ada auth gate (step 5) — check keyword
#   B.  (auth)/layout.tsx sudah TIDAK ada GuestGuard
#   C.  register.tsx pakai RegisterNav (bukan WizardNav)
#   D.  buy-button.tsx ada login redirect + ?from=
#   E.  auth-store TIDAK bocor ke page.tsx (server component)
#   F.  marketing.json exists di en/ dan id/
#   G.  auth page.tsx tidak ada 'use client'
#
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
        echo "================================================" >> "$output"
        echo "FILE: $rel" >> "$output"
        echo "Lines: $lines" >> "$output"
        echo "================================================" >> "$output"
        echo "" >> "$output"
        cat "$file" >> "$output"
        echo -e "\n\n" >> "$output"
    else
        echo -e "  ${RED}✗ MISSING:${NC} ${file#$PROJECT_ROOT/}"
        MISSING=$((MISSING + 1))
        echo "================================================" >> "$output"
        echo "FILE: ${file#$PROJECT_ROOT/}" >> "$output"
        echo "STATUS: *** FILE NOT FOUND ***" >> "$output"
        echo "================================================" >> "$output"
        echo "" >> "$output"
    fi
}

section_header() {
    local label=$1
    local output=$2
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  $label" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ $label${NC}"
}

# ================================================================
# QUALITY CHECK HELPERS
# ================================================================

check_pass() {
    local label=$1
    local output=$2
    echo -e "  ${GREEN}✓${NC} $label"
    echo "OK — $label" >> "$output"
}

check_fail() {
    local label=$1
    local output=$2
    echo -e "  ${RED}✗ VIOLATION:${NC} $label"
    echo "VIOLATION — $label" >> "$output"
}

check_warn() {
    local label=$1
    local output=$2
    echo -e "  ${YELLOW}⚠ WARNING:${NC} $label"
    echo "WARNING — $label" >> "$output"
}

check_missing() {
    local label=$1
    local output=$2
    echo -e "  ${RED}✗ MISSING:${NC} $label"
    echo "MISSING — $label" >> "$output"
}

# ================================================================
# A. PROXY — ada auth gate (step 5)
# ================================================================
check_proxy_auth_gate() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  CHECK A — proxy.ts: auth gate (step 5)" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ CHECK A — proxy.ts: auth gate${NC}"

    local file="$SRC_DIR/proxy.ts"
    if [ ! -f "$file" ]; then
        check_missing "proxy.ts tidak ditemukan!" "$output"
        return
    fi

    # Harus ada keyword auth gate
    if grep -qiE "auth.?gate|step.?5|isAuthenticated|fibidy.?token|cookie" "$file" 2>/dev/null; then
        check_pass "proxy.ts ada auth gate logic (cookie/token check)" "$output"
    else
        check_fail "proxy.ts TIDAK ada auth gate — cookie check tidak ditemukan" "$output"
    fi

    # Harus ada escape hatch untuk ?reason=
    if grep -q "reason" "$file" 2>/dev/null; then
        check_pass "proxy.ts ada stale-cookie escape hatch (?reason= param)" "$output"
    else
        check_warn "proxy.ts tidak ada ?reason= escape hatch — stale cookie bisa loop" "$output"
    fi

    # Harus ada ?from= handling
    if grep -q "from" "$file" 2>/dev/null; then
        check_pass "proxy.ts ada ?from= return URL handling" "$output"
    else
        check_warn "proxy.ts tidak ada ?from= — user tidak balik ke halaman asal setelah login" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# B. (auth)/layout.tsx — TIDAK boleh ada GuestGuard
# ================================================================
check_no_guest_guard() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  CHECK B — (auth)/layout.tsx: GuestGuard sudah dilepas" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ CHECK B — (auth)/layout.tsx: no GuestGuard${NC}"

    local file="$SRC_DIR/app/[locale]/(auth)/layout.tsx"
    if [ ! -f "$file" ]; then
        check_missing "(auth)/layout.tsx tidak ditemukan!" "$output"
        return
    fi

    if grep -q "GuestGuard" "$file" 2>/dev/null; then
        check_fail "(auth)/layout.tsx masih import GuestGuard — proxy sudah handle ini, hapus!" "$output"
    else
        check_pass "(auth)/layout.tsx bersih dari GuestGuard (proxy yang handle redirect)" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# C. register.tsx — pakai RegisterNav, BUKAN WizardNav
# ================================================================
check_register_uses_register_nav() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  CHECK C — register.tsx: pakai RegisterNav (bukan WizardNav)" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ CHECK C — register.tsx: RegisterNav check${NC}"

    local file="$SRC_DIR/components/auth/register/register.tsx"
    if [ ! -f "$file" ]; then
        check_missing "register.tsx tidak ditemukan!" "$output"
        return
    fi

    if grep -q "WizardNav" "$file" 2>/dev/null; then
        check_fail "register.tsx masih pakai WizardNav — harusnya pakai RegisterNav (fixed offset meleset)" "$output"
    else
        check_pass "register.tsx bersih dari WizardNav" "$output"
    fi

    if grep -q "RegisterNav" "$file" 2>/dev/null; then
        check_pass "register.tsx pakai RegisterNav (inline nav, no fixed offset)" "$output"
    else
        check_warn "register.tsx tidak pakai RegisterNav — pastikan nav-nya inline bukan floating" "$output"
    fi

    if grep -q "RegisterStepIndicator" "$file" 2>/dev/null; then
        check_pass "register.tsx pakai RegisterStepIndicator (auth-specific)" "$output"
    else
        check_warn "register.tsx tidak pakai RegisterStepIndicator" "$output"
    fi

    # pb-24 / pb-20 spacer harus sudah dihapus
    if grep -qE "pb-24|pb-20" "$file" 2>/dev/null; then
        check_warn "register.tsx masih ada pb-24/pb-20 spacer — harusnya sudah dihapus" "$output"
    else
        check_pass "register.tsx bersih dari pb-24/pb-20 spacer" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# D. buy-button.tsx — login redirect + ?from=
# ================================================================
check_buy_button_login_gate() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  CHECK D — buy-button.tsx: login gate + ?from=" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ CHECK D — buy-button.tsx: login gate${NC}"

    local file="$SRC_DIR/components/discover/buy-button.tsx"
    if [ ! -f "$file" ]; then
        check_missing "buy-button.tsx tidak ditemukan!" "$output"
        return
    fi

    if grep -q "login" "$file" 2>/dev/null; then
        check_pass "buy-button.tsx ada login redirect" "$output"
    else
        check_fail "buy-button.tsx TIDAK ada login redirect — user bisa coba beli tanpa login" "$output"
    fi

    if grep -q "from" "$file" 2>/dev/null; then
        check_pass "buy-button.tsx ada ?from= return URL" "$output"
    else
        check_warn "buy-button.tsx tidak ada ?from= — user tidak balik ke produk setelah login" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# E. auth-store — TIDAK bocor ke page.tsx (server component)
# ================================================================
check_auth_store_not_in_pages() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  CHECK E — auth-store: tidak dipakai di page.tsx" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ CHECK E — auth-store: server component safety${NC}"

    local violations
    violations=$(find "$SRC_DIR/app" -name "page.tsx" 2>/dev/null | xargs grep -l "auth-store" 2>/dev/null)

    if [ -n "$violations" ]; then
        check_fail "auth-store diimport di page.tsx (server component):" "$output"
        echo "$violations" | while read -r f; do
            echo -e "    ${RED}→ $f${NC}"
            echo "    → $f" >> "$output"
        done
    else
        check_pass "auth-store tidak bocor ke page.tsx (aman)" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# F. marketing.json — exists di en/ dan id/
# ================================================================
check_marketing_json() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  CHECK F — marketing.json exists (en + id)" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ CHECK F — marketing.json i18n files${NC}"

    local en_file="$MSG_DIR/en/marketing.json"
    local id_file="$MSG_DIR/id/marketing.json"

    if [ -f "$en_file" ]; then
        local lines
        lines=$(wc -l < "$en_file" 2>/dev/null || echo "0")
        check_pass "messages/en/marketing.json ada (${lines} lines)" "$output"
        # Cek keys penting
        for key in "metadata" "header" "hero" "footer"; do
            if grep -q "\"$key\"" "$en_file" 2>/dev/null; then
                echo -e "    ${GREEN}✓${NC} en/marketing.json → \"$key\" key ada"
                echo "    OK — en/marketing.json: \"$key\" key ada" >> "$output"
            else
                echo -e "    ${RED}✗${NC} en/marketing.json → \"$key\" key MISSING!"
                echo "    MISSING — en/marketing.json: \"$key\" key tidak ada" >> "$output"
            fi
        done
    else
        check_missing "messages/en/marketing.json TIDAK ADA — jalankan json-patch.md!" "$output"
    fi

    if [ -f "$id_file" ]; then
        local lines
        lines=$(wc -l < "$id_file" 2>/dev/null || echo "0")
        check_pass "messages/id/marketing.json ada (${lines} lines)" "$output"
        for key in "metadata" "header" "hero" "footer"; do
            if grep -q "\"$key\"" "$id_file" 2>/dev/null; then
                echo -e "    ${GREEN}✓${NC} id/marketing.json → \"$key\" key ada"
                echo "    OK — id/marketing.json: \"$key\" key ada" >> "$output"
            else
                echo -e "    ${RED}✗${NC} id/marketing.json → \"$key\" key MISSING!"
                echo "    MISSING — id/marketing.json: \"$key\" key tidak ada" >> "$output"
            fi
        done
    else
        check_missing "messages/id/marketing.json TIDAK ADA — jalankan json-patch.md!" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# G. auth page.tsx — tidak ada 'use client'
# ================================================================
check_auth_pages_no_use_client() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  CHECK G — (auth)/page.tsx: tidak boleh 'use client'" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"
    echo -e "\n${MAGENTA}▶ CHECK G — auth page.tsx pattern${NC}"

    local auth_dir="$SRC_DIR/app/[locale]/(auth)"
    if [ ! -d "$auth_dir" ]; then
        check_missing "Directory tidak ditemukan: $auth_dir" "$output"
        return
    fi

    local violations
    violations=$(find "$auth_dir" -name "page.tsx" 2>/dev/null | xargs grep -l "'use client'" 2>/dev/null)

    if [ -n "$violations" ]; then
        check_fail "(auth)/page.tsx dengan 'use client' ditemukan:" "$output"
        echo "$violations" | while read -r f; do
            echo -e "    ${RED}→ $f${NC}"
            echo "    → $f" >> "$output"
        done
    else
        check_pass "Semua (auth)/page.tsx bersih dari 'use client'" "$output"
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
    local output_file="$OUT/VERCEL-VIBES-COVERAGE-$timestamp.txt"

    cat > "$output_file" << EOF
################################################################
##  CLIENT — VERCEL VIBES COVERAGE REPORT
##  [VERCEL VIBES — May 2026]
##  Generated: $(date '+%Y-%m-%d %H:%M:%S')
##
##  Sections:
##    1.  Proxy (edge auth gate)
##    2.  Auth types & API module
##    3.  Auth store & hooks
##    4.  App routes — (auth): login, register, forgot-password
##    5.  Components — auth: login, register wizard, forgot-password
##    6.  Components — register NEW: register-nav, register-step-indicator
##    7.  Layout — auth: auth-guard, auth-layout, auth-logo
##    8.  App routes — (marketing): layout, page
##    9.  Components — marketing: header, footer, hero
##    10. i18n messages — marketing.json (en + id)
##    11. User auth dialog (discover buy gate)
##
##  Quality Checks:
##    A.  proxy.ts ada auth gate + ?reason= + ?from=
##    B.  (auth)/layout.tsx TIDAK ada GuestGuard
##    C.  register.tsx pakai RegisterNav (bukan WizardNav)
##    D.  buy-button.tsx ada login redirect + ?from=
##    E.  auth-store tidak bocor ke page.tsx
##    F.  marketing.json exists + semua keys ada
##    G.  (auth)/page.tsx tidak ada 'use client'
################################################################

EOF

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  VERCEL VIBES — AUTH + COOKIE + MARKETING COVERAGE       ${NC}"
    echo -e "${BLUE}  [VERCEL VIBES — May 2026]                                ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. PROXY ─────────────────────────────────────────────────
    section_header "1. PROXY — edge auth gate" "$output_file"
    collect_file "$SRC_DIR/proxy.ts" "$output_file"

    # ── 2. AUTH TYPES & API MODULE ───────────────────────────────
    section_header "2. AUTH TYPES & API MODULE" "$output_file"
    collect_file "$SRC_DIR/types/auth.ts" "$output_file"
    collect_file "$SRC_DIR/lib/api/auth.ts" "$output_file"
    collect_file "$SRC_DIR/lib/api/client.ts" "$output_file"

    # ── 3. STORE & HOOKS ─────────────────────────────────────────
    section_header "3. STORE & HOOKS" "$output_file"
    collect_file "$SRC_DIR/stores/auth-store.ts" "$output_file"
    collect_file "$SRC_DIR/stores/auth-dialog-store.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/auth/use-auth.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/auth/use-register-wizard.ts" "$output_file"

    # ── 4. APP ROUTES — (auth) ───────────────────────────────────
    section_header "4. APP ROUTES — (auth)" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/layout.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/login/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/login/banner.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/register/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/forgot-password/page.tsx" "$output_file"

    # ── 5. COMPONENTS — AUTH ─────────────────────────────────────
    section_header "5. COMPONENTS — AUTH" "$output_file"
    collect_file "$SRC_DIR/components/auth/login/login.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/register.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-account.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-category.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-store-info.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-review.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-welcome.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/forgot-password/forgot-password.tsx" "$output_file"

    # ── 6. COMPONENTS — REGISTER NEW (VERCEL VIBES) ──────────────
    section_header "6. COMPONENTS — REGISTER NEW [VERCEL VIBES]" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/register-nav.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/register-step-indicator.tsx" "$output_file"

    # ── 7. LAYOUT — AUTH ─────────────────────────────────────────
    section_header "7. LAYOUT — AUTH" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-guard.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-layout.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-logo.tsx" "$output_file"

    # ── 8. APP ROUTES — (marketing) NEW ──────────────────────────
    section_header "8. APP ROUTES — (marketing) [VERCEL VIBES NEW]" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(marketing)/layout.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(marketing)/page.tsx" "$output_file"

    # ── 9. COMPONENTS — MARKETING NEW ────────────────────────────
    section_header "9. COMPONENTS — MARKETING [VERCEL VIBES NEW]" "$output_file"
    collect_file "$SRC_DIR/components/marketing/marketing-header.tsx" "$output_file"
    collect_file "$SRC_DIR/components/marketing/marketing-footer.tsx" "$output_file"
    collect_file "$SRC_DIR/components/marketing/marketing-hero.tsx" "$output_file"

    # ── 10. i18n MESSAGES — MARKETING ────────────────────────────
    section_header "10. i18n MESSAGES — marketing.json" "$output_file"
    collect_file "$MSG_DIR/en/marketing.json" "$output_file"
    collect_file "$MSG_DIR/id/marketing.json" "$output_file"

    # ── 11. USER AUTH DIALOG (discover buy gate) ─────────────────
    section_header "11. USER AUTH DIALOG — discover buy gate" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/auth-dialog.tsx" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/dialog-login-form.tsx" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/dialog-register-form.tsx" "$output_file"
    collect_file "$SRC_DIR/components/discover/buy-button.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/discover/[id]/client.tsx" "$output_file"

    # ── QUALITY CHECKS ───────────────────────────────────────────
    echo "" >> "$output_file"
    echo "################################################################" >> "$output_file"
    echo "##  QUALITY CHECKS" >> "$output_file"
    echo "################################################################" >> "$output_file"

    check_proxy_auth_gate "$output_file"
    check_no_guest_guard "$output_file"
    check_register_uses_register_nav "$output_file"
    check_buy_button_login_gate "$output_file"
    check_auth_store_not_in_pages "$output_file"
    check_marketing_json "$output_file"
    check_auth_pages_no_use_client "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    if [ $TOTAL -gt 0 ]; then
        pct=$(( FOUND * 100 / TOTAL ))
    fi

    local summary_color=$GREEN
    [ $MISSING -gt 0 ] && summary_color=$RED

    echo ""
    echo -e "${summary_color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${summary_color}║  VERCEL VIBES — COVERAGE REPORT                    ║${NC}"
    echo -e "${summary_color}╠════════════════════════════════════════════════════╣${NC}"
    printf "${summary_color}║  ✓ Found   : %-3d / %-3d                             ║${NC}\n" "$FOUND" "$TOTAL"
    printf "${summary_color}║  ✗ Missing : %-3d                                    ║${NC}\n" "$MISSING"
    printf "${summary_color}║  Coverage  : %-3d%%                                  ║${NC}\n" "$pct"
    echo -e "${summary_color}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}📂 Output: $output_file${NC}"
    echo ""

    echo "" >> "$output_file"
    echo "################################################################" >> "$output_file"
    echo "##  SUMMARY" >> "$output_file"
    echo "################################################################" >> "$output_file"
    echo "Found   : $FOUND / $TOTAL" >> "$output_file"
    echo "Missing : $MISSING" >> "$output_file"
    echo "Coverage: $pct%" >> "$output_file"

    if [ $MISSING -gt 0 ]; then
        exit 1
    fi
}

main "$@"