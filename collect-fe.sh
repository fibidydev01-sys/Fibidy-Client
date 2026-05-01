#!/bin/bash
# ================================================================
# collect-phase3.sh
# Targeted Collection — Phase 3 Frontend Implementation
# Digital Products / LemonSqueezy Feature Flag
#
# Scope:
#   Group A — API clients & types          (8 files) [TIER 1 KRITIS]
#   Group B — Shared infra                 (3 files) [TIER 1]
#   Group C — Hooks                        (7 files) [TIER 1]
#   Group D — Pages yang di-gate/di-modify (7 files) [TIER 1]
#   Group E — Layout & route guards        (4 files) [TIER 1]
#   Group F — Components yang di-modify    (4 files) [TIER 1]
#   Group G — Stores & config              (4 files) [TIER 2]
#   Group H — Setup-store flow             (3 files) [TIER 2]
#   Group I — i18n dashboard + toast       (4 files) [TIER 1 KRITIS]
#   Group J — NEW files (patch bundle)     (2 files) [NEW]
#
# Output: collections/COLLECT-phase3-[timestamp].txt
# Usage : bash collect-phase3.sh
# Run from: client root
# ================================================================

GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; WHITE='\033[1;37m'
DIM='\033[2m'; NC='\033[0m'

SRC="./src"
MSG="./messages"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-phase3-${TIMESTAMP}.txt"

mkdir -p "$OUT"

FOUND=0; MISSING=0; TOTAL=0

cf() {
    local f="$1"
    TOTAL=$((TOTAL + 1))
    if [ -f "$f" ]; then
        local lines=$(wc -l < "$f" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}✓${NC} ${f#./} ${DIM}(${lines} lines)${NC}"
        FOUND=$((FOUND + 1))
        {
            echo "================================================"
            echo "FILE: ${f#./}"
            echo "Lines: $lines"
            echo "================================================"
            echo ""
            cat "$f"
            printf "\n\n"
        } >> "$FILE"
    else
        echo -e "  ${RED}✗ MISSING:${NC} ${f#./}"
        MISSING=$((MISSING + 1))
        {
            echo "================================================"
            echo "FILE: ${f#./}"
            echo "STATUS: *** FILE NOT FOUND ***"
            echo "================================================"
            echo ""
        } >> "$FILE"
    fi
}

sec() {
    echo -e "\n${MAGENTA}▶ $1${NC}"
    { echo ""; echo "##  $1"; echo ""; } >> "$FILE"
}

block() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    { echo ""; echo "##  BLOCK: $1"; echo ""; } >> "$FILE"
}

cat > "$FILE" << EOF
##  COLLECTION — Phase 3 Frontend Audit
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##  Total     : 46 files
EOF

echo -e "\n${WHITE}  ── Collecting Phase 3 Implementation Files ──${NC}"

block "GROUP A — API clients & types (8 files) [TIER 1 KRITIS]"
sec "API Clients"
cf "$SRC/lib/api/auth.ts"
cf "$SRC/lib/api/products.ts"
cf "$SRC/lib/api/subscription.ts"
cf "$SRC/lib/api/tenants.ts"
cf "$SRC/lib/api/client.ts"
sec "Types"
cf "$SRC/types/auth.ts"
cf "$SRC/types/tenant.ts"
cf "$SRC/types/api.ts"

block "GROUP B — Shared infra (3 files) [TIER 1]"
cf "$SRC/lib/shared/query-keys.ts"
cf "$SRC/lib/providers/root-provider.tsx"
cf "$SRC/lib/constants/shared/route-guard.ts"

block "GROUP C — Hooks (7 files) [TIER 1]"
sec "Dashboard Hooks"
cf "$SRC/hooks/dashboard/use-products.ts"
cf "$SRC/hooks/dashboard/use-subscription-plan.ts"
cf "$SRC/hooks/dashboard/use-library.ts"
cf "$SRC/hooks/dashboard/use-checkout.ts"
cf "$SRC/hooks/dashboard/use-refund.ts"
sec "Auth & User Hooks"
cf "$SRC/hooks/auth/use-auth.ts"
cf "$SRC/hooks/user/use-upgrade-to-seller.ts"

block "GROUP D — Pages yang di-gate / di-modify (7 files) [TIER 1]"
sec "Subscription (BIGGEST CHANGE)"
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"
sec "Library"
cf "$SRC/app/[locale]/(dashboard)/dashboard/library/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/library/client.tsx"
sec "Downloads"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/downloads/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/downloads/client.tsx"
sec "Settings (KycBanner location)"
cf "$SRC/app/[locale]/(dashboard)/dashboard/settings/client.tsx"
sec "Discover"
cf "$SRC/app/[locale]/discover/layout.tsx"

block "GROUP E — Layout & route guards (4 files) [TIER 1]"
cf "$SRC/components/layout/dashboard/dashboard-route-guard.tsx"
cf "$SRC/components/layout/dashboard/dashboard-sidebar.tsx"
cf "$SRC/components/layout/dashboard/mobile-navbar.tsx"
cf "$SRC/app/[locale]/(dashboard)/layout.tsx"

block "GROUP F — Components yang di-modify (4 files) [TIER 1]"
cf "$SRC/components/dashboard/product/kyc-banner.tsx"
cf "$SRC/components/dashboard/product/storage-usage-bar.tsx"
cf "$SRC/components/discover/buy-button.tsx"
cf "$SRC/components/user-auth/auth-dialog.tsx"

block "GROUP G — Stores & config (4 files) [TIER 2]"
sec "Stores"
cf "$SRC/stores/auth-store.ts"
cf "$SRC/stores/auth-dialog-store.ts"
sec "Config"
cf "$SRC/i18n/routing.ts"
cf "$SRC/lib/constants/shared/constants.ts"

block "GROUP H — Setup-store flow / BUYER redirect target (3 files) [TIER 2]"
cf "$SRC/app/[locale]/(dashboard)/dashboard/setup-store/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/setup-store/client.tsx"
cf "$SRC/hooks/user/use-buyer-register.ts"

block "GROUP I — i18n dashboard + toast (4 files) [TIER 1 KRITIS]"
sec "dashboard.json — Q3 features split + comingSoon namespace"
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"
sec "toast.json — feature-disabled error scenarios"
cf "$MSG/en/toast.json"
cf "$MSG/id/toast.json"

block "GROUP J — NEW files dari patch bundle (2 files) [NEW]"
sec "Feature flag config"
cf "$SRC/lib/config/features.ts"
sec "Shared coming-soon component"
cf "$SRC/components/shared/coming-soon-page.tsx"

PCT=0; [ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓ Found   : $FOUND / $TOTAL${NC}"
echo -e "  ${RED}✗ Missing : $MISSING${NC}"
echo -e "  Coverage  : $PCT%"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"

{ echo ""; echo "##  SUMMARY"; echo "Found    : $FOUND / $TOTAL"; echo "Missing  : $MISSING"; echo "Coverage : $PCT%"; } >> "$FILE"