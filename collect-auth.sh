#!/bin/bash

# ================================================================
# CLIENT — AUTH COVERAGE COLLECTOR
# [VERCEL VIBES — May 2026]
#
# Collect semua file yang terlibat dalam auth flow:
#   1.  Proxy / Middleware (edge auth gate)
#   2.  Auth types & API module
#   3.  Auth store & hooks
#   4.  App routes — (auth): login, register, forgot-password
#   5.  Components — auth: login, register wizard, forgot-password
#   6.  Components — register NEW: register-nav, register-step-indicator
#   7.  Layout — auth: auth-guard, auth-layout, auth-logo
#   8.  i18n messages — auth.json + common.json (en + id)
#   9.  User auth dialog (discover buy gate)
#
# Quality checks:
#   A.  proxy.ts ada auth gate + ?reason= + ?from=
#   B.  (auth)/layout.tsx TIDAK ada GuestGuard
#   C.  register.tsx pakai RegisterNav (bukan WizardNav)
#   D.  buy-button.tsx ada login redirect + ?from=
#   E.  auth-store TIDAK bocor ke page.tsx (server component)
#   F.  auth.json exists di en/ dan id/
#   G.  (auth)/page.tsx tidak ada 'use client'
#
# Run dari: root direktori client (tempat src/ ada)
#   bash fibidy-auth-collect.sh
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
# QUALITY CHECK HELPERS
# ================================================================

check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    echo "OK — $1" >> "$2"
}

check_fail() {
    echo -e "  ${RED}✗ VIOLATION:${NC} $1"
    echo "VIOLATION — $1" >> "$2"
}

check_warn() {
    echo -e "  ${YELLOW}⚠ WARNING:${NC} $1"
    echo "WARNING — $1" >> "$2"
}

check_missing() {
    echo -e "  ${RED}✗ MISSING:${NC} $1"
    echo "MISSING — $1" >> "$2"
}

# ================================================================
# CHECK A — proxy.ts: auth gate
# ================================================================
check_proxy_auth_gate() {
    local output=$1
    section_header "CHECK A — proxy.ts: auth gate (step 5)" "$output"

    local file="$SRC_DIR/proxy.ts"
    if [ ! -f "$file" ]; then
        check_missing "proxy.ts tidak ditemukan!" "$output"
        return
    fi

    if grep -qiE "auth.?gate|fibidy.?auth|cookie" "$file" 2>/dev/null; then
        check_pass "proxy.ts ada auth gate logic (cookie check)" "$output"
    else
        check_fail "proxy.ts TIDAK ada auth gate — cookie check tidak ditemukan" "$output"
    fi

    if grep -q "reason" "$file" 2>/dev/null; then
        check_pass "proxy.ts ada stale-cookie escape hatch (?reason= param)" "$output"
    else
        check_warn "proxy.ts tidak ada ?reason= — stale cookie bisa loop" "$output"
    fi

    if grep -q "from" "$file" 2>/dev/null; then
        check_pass "proxy.ts ada ?from= return URL handling" "$output"
    else
        check_warn "proxy.ts tidak ada ?from= — user tidak balik ke halaman asal setelah login" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# CHECK B — (auth)/layout.tsx: tidak ada GuestGuard
# ================================================================
check_no_guest_guard() {
    local output=$1
    section_header "CHECK B — (auth)/layout.tsx: GuestGuard sudah dilepas" "$output"

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
# CHECK C — register.tsx: pakai RegisterNav bukan WizardNav
# ================================================================
check_register_uses_register_nav() {
    local output=$1
    section_header "CHECK C — register.tsx: RegisterNav (bukan WizardNav)" "$output"

    local file="$SRC_DIR/components/auth/register/register.tsx"
    if [ ! -f "$file" ]; then
        check_missing "register.tsx tidak ditemukan!" "$output"
        return
    fi

    if grep -q "WizardNav" "$file" 2>/dev/null; then
        check_fail "register.tsx masih pakai WizardNav — harusnya RegisterNav" "$output"
    else
        check_pass "register.tsx bersih dari WizardNav" "$output"
    fi

    if grep -q "RegisterNav" "$file" 2>/dev/null; then
        check_pass "register.tsx pakai RegisterNav (inline nav, no fixed offset)" "$output"
    else
        check_warn "register.tsx tidak pakai RegisterNav" "$output"
    fi

    if grep -q "RegisterStepIndicator" "$file" 2>/dev/null; then
        check_pass "register.tsx pakai RegisterStepIndicator (auth-specific)" "$output"
    else
        check_warn "register.tsx tidak pakai RegisterStepIndicator" "$output"
    fi

    if grep -qE "pb-24|pb-20" "$file" 2>/dev/null; then
        check_warn "register.tsx masih ada pb-24/pb-20 spacer — harusnya sudah dihapus" "$output"
    else
        check_pass "register.tsx bersih dari pb-24/pb-20 spacer" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# CHECK D — buy-button.tsx: login redirect + ?from=
# ================================================================
check_buy_button_login_gate() {
    local output=$1
    section_header "CHECK D — buy-button.tsx: login gate + ?from=" "$output"

    local file="$SRC_DIR/components/discover/buy-button.tsx"
    if [ ! -f "$file" ]; then
        check_missing "buy-button.tsx tidak ditemukan!" "$output"
        return
    fi

    if grep -q "login" "$file" 2>/dev/null; then
        check_pass "buy-button.tsx ada login redirect" "$output"
    else
        check_fail "buy-button.tsx TIDAK ada login redirect" "$output"
    fi

    if grep -q "from" "$file" 2>/dev/null; then
        check_pass "buy-button.tsx ada ?from= return URL" "$output"
    else
        check_warn "buy-button.tsx tidak ada ?from= — user tidak balik ke produk setelah login" "$output"
    fi

    echo "" >> "$output"
}

# ================================================================
# CHECK E — auth-store tidak bocor ke page.tsx
# ================================================================
check_auth_store_not_in_pages() {
    local output=$1
    section_header "CHECK E — auth-store: tidak dipakai di page.tsx" "$output"

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
# CHECK F — auth.json exists di en/ dan id/
# ================================================================
check_auth_json() {
    local output=$1
    section_header "CHECK F — auth.json exists (en + id)" "$output"

    for locale in en id; do
        local f="$MSG_DIR/$locale/auth.json"
        if [ -f "$f" ]; then
            local lines
            lines=$(wc -l < "$f" 2>/dev/null || echo "0")
            check_pass "messages/$locale/auth.json ada (${lines} lines)" "$output"
            for key in "login" "register" "forgotPassword"; do
                if grep -q "\"$key\"" "$f" 2>/dev/null; then
                    echo -e "    ${GREEN}✓${NC} $locale/auth.json → \"$key\" key ada"
                    echo "    OK — $locale/auth.json: \"$key\" key ada" >> "$output"
                else
                    echo -e "    ${RED}✗${NC} $locale/auth.json → \"$key\" key MISSING!"
                    echo "    MISSING — $locale/auth.json: \"$key\" key tidak ada" >> "$output"
                fi
            done
        else
            check_missing "messages/$locale/auth.json TIDAK ADA!" "$output"
        fi
    done

    echo "" >> "$output"
}

# ================================================================
# CHECK G — (auth)/page.tsx tidak ada 'use client'
# ================================================================
check_auth_pages_no_use_client() {
    local output=$1
    section_header "CHECK G — (auth)/page.tsx: tidak boleh 'use client'" "$output"

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
    local output_file="$OUT/AUTH-COLLECT-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — AUTH COVERAGE REPORT"
        echo "##  [VERCEL VIBES — May 2026]"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  AUTH COVERAGE COLLECTOR — [VERCEL VIBES May 2026]        ${NC}"
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

    # ── 6. REGISTER NEW — VERCEL VIBES ───────────────────────────
    section_header "6. REGISTER NEW [VERCEL VIBES] — register-nav + step-indicator" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/register-nav.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/register-step-indicator.tsx" "$output_file"

    # ── 7. LAYOUT — AUTH ─────────────────────────────────────────
    section_header "7. LAYOUT — AUTH" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-guard.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-layout.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-logo.tsx" "$output_file"

    # ── 8. i18n MESSAGES ─────────────────────────────────────────
    section_header "8. i18n MESSAGES — auth.json + common.json (en + id)" "$output_file"
    collect_file "$MSG_DIR/en/auth.json" "$output_file"
    collect_file "$MSG_DIR/id/auth.json" "$output_file"
    collect_file "$MSG_DIR/en/common.json" "$output_file"
    collect_file "$MSG_DIR/id/common.json" "$output_file"

    # ── 9. USER AUTH DIALOG — discover buy gate ──────────────────
    section_header "9. USER AUTH DIALOG — discover buy gate" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/auth-dialog.tsx" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/dialog-login-form.tsx" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/dialog-register-form.tsx" "$output_file"
    collect_file "$SRC_DIR/components/discover/buy-button.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/discover/[id]/client.tsx" "$output_file"

    # ── QUALITY CHECKS ───────────────────────────────────────────
    {
        echo ""
        echo "################################################################"
        echo "##  QUALITY CHECKS"
        echo "################################################################"
        echo ""
    } >> "$output_file"

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  QUALITY CHECKS                                           ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    check_proxy_auth_gate "$output_file"
    check_no_guest_guard "$output_file"
    check_register_uses_register_nav "$output_file"
    check_buy_button_login_gate "$output_file"
    check_auth_store_not_in_pages "$output_file"
    check_auth_json "$output_file"
    check_auth_pages_no_use_client "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  AUTH COLLECT — SUMMARY                            ║${NC}"
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
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"