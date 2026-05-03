#!/bin/bash

# ================================================================
# CLIENT — AUTH FLOW COVERAGE CHECKER
# Cek semua file auth domain: login, register, forgot-password,
# auth guard, auth store, hooks, discover buy flow (login-gate)
# Run from: client directory (where src/ lives)
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
        local lines=$(wc -l < "$file" 2>/dev/null || echo "0")
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
# CHECK: auth-guard redirect ke /login kalau belum login
# ================================================================
check_auth_guard_redirect() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  AUTH GUARD CHECK — redirect ke /login" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"

    echo -e "\n${MAGENTA}▶ AUTH GUARD CHECK${NC}"

    local file="$SRC_DIR/components/layout/auth/auth-guard.tsx"

    if [ ! -f "$file" ]; then
        echo -e "  ${RED}✗ MISSING: auth-guard.tsx tidak ditemukan!${NC}"
        echo "MISSING — auth-guard.tsx tidak ditemukan" >> "$output"
    else
        if grep -q "login" "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} auth-guard.tsx ada referensi redirect ke login"
            echo "OK — auth-guard redirect ke login" >> "$output"
        else
            echo -e "  ${RED}✗ auth-guard.tsx tidak redirect ke /login!${NC}"
            echo "VIOLATION — auth-guard.tsx tidak ada redirect ke login" >> "$output"
        fi
    fi
    echo "" >> "$output"
}

# ================================================================
# CHECK: buy-button.tsx harus redirect ke /login?from=/discover/:id
# kalau belum authenticated
# ================================================================
check_buy_button_login_gate() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  BUY BUTTON LOGIN GATE CHECK" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"

    echo -e "\n${MAGENTA}▶ BUY BUTTON LOGIN GATE CHECK${NC}"

    local file="$SRC_DIR/components/discover/buy-button.tsx"

    if [ ! -f "$file" ]; then
        echo -e "  ${RED}✗ MISSING: buy-button.tsx tidak ditemukan!${NC}"
        echo "MISSING — buy-button.tsx tidak ditemukan" >> "$output"
    else
        if grep -q "login" "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} buy-button.tsx ada login redirect"
            echo "OK — buy-button.tsx ada login redirect" >> "$output"
        else
            echo -e "  ${RED}✗ buy-button.tsx tidak ada login redirect!${NC}"
            echo "MISSING — buy-button.tsx tidak ada login redirect" >> "$output"
        fi

        if grep -q "from" "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} buy-button.tsx ada ?from= return URL"
            echo "OK — buy-button.tsx ada ?from= return URL" >> "$output"
        else
            echo -e "  ${YELLOW}⚠ buy-button.tsx tidak ada ?from= param — user tidak balik ke produk setelah login${NC}"
            echo "WARNING — buy-button.tsx tidak ada ?from= return URL" >> "$output"
        fi
    fi
    echo "" >> "$output"
}

# ================================================================
# CHECK: login page harus handle ?from= redirect setelah login sukses
# ================================================================
check_login_from_redirect() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  LOGIN FROM REDIRECT CHECK — handle ?from= param" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"

    echo -e "\n${MAGENTA}▶ LOGIN FROM REDIRECT CHECK${NC}"

    local file="$SRC_DIR/components/auth/login/login.tsx"

    if [ ! -f "$file" ]; then
        echo -e "  ${RED}✗ MISSING: components/auth/login/login.tsx tidak ditemukan!${NC}"
        echo "MISSING — login.tsx tidak ditemukan" >> "$output"
    else
        if grep -q "from\|searchParams\|useSearchParams" "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} login.tsx handle ?from= redirect"
            echo "OK — login.tsx handle ?from= redirect" >> "$output"
        else
            echo -e "  ${YELLOW}⚠ login.tsx tidak handle ?from= — user tidak balik ke halaman asal setelah login${NC}"
            echo "WARNING — login.tsx tidak handle ?from= searchParam" >> "$output"
        fi
    fi
    echo "" >> "$output"
}

# ================================================================
# CHECK: page.tsx di [locale]/(auth)/ tidak boleh ada 'use client'
# ================================================================
check_auth_pages_pattern() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  PATTERN CHECK — [locale]/(auth)/page.tsx tidak boleh use client" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"

    echo -e "\n${MAGENTA}▶ PATTERN CHECK (auth pages)${NC}"

    # Path yang benar: app/[locale]/(auth)/
    local auth_dir="$SRC_DIR/app/[locale]/(auth)"
    local violations=""

    if [ -d "$auth_dir" ]; then
        local found
        found=$(find "$auth_dir" -name "page.tsx" 2>/dev/null | xargs grep -l "'use client'" 2>/dev/null)
        if [ -n "$found" ]; then
            violations="$found"
        fi
    else
        echo -e "  ${RED}✗ Directory tidak ditemukan: $auth_dir${NC}"
        echo "MISSING — auth dir tidak ditemukan: $auth_dir" >> "$output"
        echo "" >> "$output"
        return
    fi

    if [ -n "$violations" ]; then
        echo -e "  ${RED}✗ page.tsx dengan 'use client' ditemukan di [locale]/(auth)/:${NC}"
        echo "$violations" | while read -r f; do echo "    $f"; done
        echo "VIOLATION: auth page.tsx mengandung use client:" >> "$output"
        echo "$violations" >> "$output"
    else
        echo -e "  ${GREEN}✓${NC} Semua [locale]/(auth)/page.tsx bersih dari 'use client'"
        echo "OK — semua auth page.tsx bersih" >> "$output"
    fi
    echo "" >> "$output"
}

# ================================================================
# CHECK: auth-store tidak bocor ke server component
# ================================================================
check_auth_store_usage() {
    local output=$1
    echo "" >> "$output"
    echo "################################################################" >> "$output"
    echo "##  AUTH STORE CHECK — tidak dipakai di page.tsx (server component)" >> "$output"
    echo "################################################################" >> "$output"
    echo "" >> "$output"

    echo -e "\n${MAGENTA}▶ AUTH STORE USAGE CHECK${NC}"

    local violations
    violations=$(find "$SRC_DIR/app" -name "page.tsx" 2>/dev/null | xargs grep -l "auth-store" 2>/dev/null)

    if [ -n "$violations" ]; then
        echo -e "  ${RED}✗ auth-store diimport di page.tsx (server component):${NC}"
        echo "$violations" | while read -r f; do echo "    $f"; done
        echo "VIOLATION: auth-store diimport di page.tsx" >> "$output"
        echo "$violations" >> "$output"
    else
        echo -e "  ${GREEN}✓${NC} auth-store tidak diimport di page.tsx (aman)"
        echo "OK — auth-store tidak bocor ke server component" >> "$output"
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
    local output_file="$OUT/FE-AUTH-COVERAGE-$timestamp.txt"

    cat > "$output_file" << EOF
################################################################
##  CLIENT — AUTH FLOW COVERAGE REPORT
##  Generated: $(date '+%Y-%m-%d %H:%M:%S')
##
##  Checks:
##    1.  Types               — auth.ts, tenant.ts, discover.ts
##    2.  API module          — lib/api/auth.ts, client.ts
##    3.  Store               — auth-store.ts, auth-dialog-store.ts
##    4.  Hooks               — use-auth.ts, use-register-wizard.ts
##    5.  App routes (auth)   — login, register, forgot-password
##    6.  Components (auth)   — login, register, forgot-password
##    7.  Layout (auth)       — auth-guard, auth-layout, auth-logo
##    8.  User auth dialog    — auth-dialog, dialog-login-form, dialog-register-form
##    9.  Discover buy gate   — buy-button.tsx login redirect
##    10. Auth guard check    — redirect ke /login
##    11. Login ?from= check  — return URL setelah login
##    12. Pattern check       — auth page.tsx tidak use client
##    13. Auth store check    — tidak bocor ke server component
################################################################

EOF

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  FE AUTH FLOW — COVERAGE CHECKER                         ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. TYPES ─────────────────────────────────────────────────
    section_header "1. TYPES" "$output_file"
    collect_file "$SRC_DIR/types/auth.ts" "$output_file"
    collect_file "$SRC_DIR/types/tenant.ts" "$output_file"
    collect_file "$SRC_DIR/types/discover.ts" "$output_file"

    # ── 2. API MODULE ─────────────────────────────────────────────
    section_header "2. LIB — API MODULE" "$output_file"
    collect_file "$SRC_DIR/lib/api/auth.ts" "$output_file"
    collect_file "$SRC_DIR/lib/api/client.ts" "$output_file"

    # ── 3. STORE ─────────────────────────────────────────────────
    section_header "3. STORE" "$output_file"
    collect_file "$SRC_DIR/stores/auth-store.ts" "$output_file"
    collect_file "$SRC_DIR/stores/auth-dialog-store.ts" "$output_file"

    # ── 4. HOOKS ─────────────────────────────────────────────────
    section_header "4. HOOKS — AUTH" "$output_file"
    collect_file "$SRC_DIR/hooks/auth/use-auth.ts" "$output_file"
    collect_file "$SRC_DIR/hooks/auth/use-register-wizard.ts" "$output_file"

    # ── 5. APP ROUTES — AUTH (path: app/[locale]/(auth)/) ────────
    section_header "5. APP ROUTES — AUTH" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/layout.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/login/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/login/banner.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/register/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(auth)/forgot-password/page.tsx" "$output_file"

    # ── 6. COMPONENTS — AUTH ─────────────────────────────────────
    section_header "6. COMPONENTS — AUTH" "$output_file"
    collect_file "$SRC_DIR/components/auth/login/login.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/register.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-account.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-category.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-store-info.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-review.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/register/step-welcome.tsx" "$output_file"
    collect_file "$SRC_DIR/components/auth/forgot-password/forgot-password.tsx" "$output_file"

    # ── 7. LAYOUT — AUTH ─────────────────────────────────────────
    section_header "7. LAYOUT — AUTH" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-guard.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-layout.tsx" "$output_file"
    collect_file "$SRC_DIR/components/layout/auth/auth-logo.tsx" "$output_file"

    # ── 8. USER AUTH DIALOG ───────────────────────────────────────
    section_header "8. USER AUTH DIALOG" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/auth-dialog.tsx" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/dialog-login-form.tsx" "$output_file"
    collect_file "$SRC_DIR/components/user-auth/dialog-register-form.tsx" "$output_file"

    # ── 9. DISCOVER BUY GATE ─────────────────────────────────────
    # path: app/[locale]/discover/[id]/client.tsx
    section_header "9. DISCOVER — BUY LOGIN GATE" "$output_file"
    collect_file "$SRC_DIR/components/discover/buy-button.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/discover/[id]/client.tsx" "$output_file"

    # ── QUALITY CHECKS ───────────────────────────────────────────
    check_auth_guard_redirect "$output_file"
    check_buy_button_login_gate "$output_file"
    check_login_from_redirect "$output_file"
    check_auth_pages_pattern "$output_file"
    check_auth_store_usage "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    if [ $TOTAL -gt 0 ]; then
        pct=$(( FOUND * 100 / TOTAL ))
    fi

    local summary_color=$GREEN
    [ $MISSING -gt 0 ] && summary_color=$RED

    echo ""
    echo -e "${summary_color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${summary_color}║  COVERAGE REPORT                                   ║${NC}"
    echo -e "${summary_color}╠════════════════════════════════════════════════════╣${NC}"
    echo -e "${summary_color}║  ✓ Found  : ${FOUND} / ${TOTAL}                              ║${NC}"
    echo -e "${summary_color}║  ✗ Missing: ${MISSING}                                       ║${NC}"
    echo -e "${summary_color}║  Coverage : ${pct}%                                   ║${NC}"
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