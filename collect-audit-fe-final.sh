#!/bin/bash
# ================================================================
# collect-fe.sh
# Pure file collector — no greps, no hangs
# Output: collections/COLLECT-fe-[timestamp].txt
# Run from: client/ root
# ================================================================

GREEN='\033[0;32m'; RED='\033[0;31m'; DIM='\033[2m'
BLUE='\033[0;34m'; MAGENTA='\033[0;35m'; WHITE='\033[1;37m'; NC='\033[0m'

SRC="./src"
MSG="./messages"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-fe-${TIMESTAMP}.txt"

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
    { echo ""; echo "################################################################"
      echo "##  $1"
      echo "################################################################"; echo ""; } >> "$FILE"
}

block() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    { echo ""; echo "################################################################"
      echo "##  BLOCK: $1"
      echo "################################################################"; echo ""; } >> "$FILE"
}

# ── HEADER ────────────────────────────────────────────────────
cat > "$FILE" << EOF
################################################################
##  COLLECTION REPORT — FE Files
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
################################################################

EOF

echo -e "\n${WHITE}╔══════════════════════════════════════╗${NC}"
echo -e "${WHITE}║  FE File Collector — collect-fe.sh   ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════╝${NC}"

# ================================================================
# BLOCK 1 — LS vs STRIPE FE SEPARATION
# ================================================================
block "BLOCK 1 — LS vs STRIPE FE SEPARATION"

sec "API client subscription"
cf "$SRC/lib/api/subscription.ts"

sec "Subscription page"
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"

sec "i18n keys"
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"
cf "$MSG/en/toast.json"
cf "$MSG/id/toast.json"

# ================================================================
# BLOCK 2 — IDR CURRENCY MIGRATION
# ================================================================
block "BLOCK 2 — IDR CURRENCY MIGRATION"

sec "Price formatting utility"
cf "$SRC/lib/shared/format.ts"
cf "$SRC/lib/shared/seo.ts"

sec "Product types"
cf "$SRC/types/product.ts"
cf "$SRC/types/tenant.ts"
cf "$SRC/types/api.ts"

sec "Price display components"
cf "$SRC/components/store/showcase/product-info.tsx"
cf "$SRC/components/store/showcase/product-card.tsx"
cf "$SRC/components/store/shared/product-schema.tsx"
cf "$SRC/components/store/shared/product-list-schema.tsx"

sec "Discover price display"
cf "$SRC/components/discover/discover-card.tsx"
cf "$SRC/components/discover/discover-detail.tsx"

sec "Digital product price input (seller)"
cf "$SRC/components/dashboard/product/form/step-details.tsx"
cf "$SRC/components/dashboard/product/form/product.tsx"
cf "$SRC/components/dashboard/product/form/types.ts"
cf "$SRC/components/dashboard/product/form/step-upload.tsx"
cf "$SRC/components/dashboard/product/form/step-media.tsx"
cf "$SRC/components/dashboard/product/form/step-preview.tsx"

# ================================================================
# BLOCK 3 — ALL TRANSACTION AREAS FE
# ================================================================
block "BLOCK 3 — ALL TRANSACTION AREAS FE"

sec "API clients"
cf "$SRC/lib/api/subscription.ts"
cf "$SRC/lib/api/checkout.ts"
cf "$SRC/lib/api/products.ts"
cf "$SRC/lib/api/library.ts"
cf "$SRC/lib/api/refund.ts"
cf "$SRC/lib/api/discover.ts"
cf "$SRC/lib/api/client.ts"

sec "Subscription hooks"
cf "$SRC/hooks/dashboard/use-subscription-plan.ts"

sec "Checkout Stripe Connect"
cf "$SRC/hooks/dashboard/use-checkout.ts"
cf "$SRC/components/store/checkout/stripe-checkout-button.tsx"
cf "$SRC/components/store/checkout/contact-seller-button.tsx"
cf "$SRC/app/[locale]/checkout/success/page.tsx"
cf "$SRC/app/[locale]/checkout/success/client.tsx"
cf "$SRC/app/[locale]/checkout/cancel/page.tsx"
cf "$SRC/app/[locale]/checkout/cancel/client.tsx"

sec "Library"
cf "$SRC/app/[locale]/(dashboard)/dashboard/library/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/library/client.tsx"
cf "$SRC/hooks/dashboard/use-library.ts"
cf "$SRC/components/library/library-card.tsx"
cf "$SRC/components/library/library-grid.tsx"

sec "Refund"
cf "$SRC/hooks/dashboard/use-refund.ts"
cf "$SRC/components/library/refund-button.tsx"
cf "$SRC/components/library/refund-dialog.tsx"

sec "Discover"
cf "$SRC/app/[locale]/discover/page.tsx"
cf "$SRC/app/[locale]/discover/client.tsx"
cf "$SRC/app/[locale]/discover/[id]/page.tsx"
cf "$SRC/app/[locale]/discover/[id]/client.tsx"
cf "$SRC/components/discover/buy-button.tsx"
cf "$SRC/components/discover/discover-grid.tsx"
cf "$SRC/components/discover/discover-filters.tsx"
cf "$SRC/components/discover/pdf-preview.tsx"

sec "Physical Products"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/client.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/[id]/edit/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/new/page.tsx"
cf "$SRC/components/dashboard/product/product-grid.tsx"
cf "$SRC/components/dashboard/product/product-grid-card.tsx"
cf "$SRC/components/dashboard/product/product-preview-drawer.tsx"
cf "$SRC/components/dashboard/product/product-delete-dialog.tsx"
cf "$SRC/hooks/dashboard/use-products.ts"

sec "Download stats"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/downloads/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/downloads/client.tsx"
cf "$SRC/components/dashboard/product/download-history-table.tsx"

sec "Store pages"
cf "$SRC/app/[locale]/store/[slug]/page.tsx"
cf "$SRC/app/[locale]/store/[slug]/products/page.tsx"
cf "$SRC/app/[locale]/store/[slug]/products/[id]/page.tsx"
cf "$SRC/components/store/showcase/product-actions.tsx"
cf "$SRC/components/store/showcase/featured-products.tsx"

sec "KYC + onboarding"
cf "$SRC/components/dashboard/product/kyc-banner.tsx"
cf "$SRC/app/[locale]/onboard/refresh/page.tsx"
cf "$SRC/app/[locale]/onboard/refresh/client.tsx"

sec "Admin"
cf "$SRC/app/[locale]/(admin)/admin/page.tsx"

sec "Config + hooks"
cf "$SRC/lib/config/features.ts"
cf "$SRC/hooks/auth/use-auth.ts"
cf "$SRC/lib/shared/validations.ts"
cf "$SRC/lib/shared/schema.ts"
cf "./next.config.ts"
cf "./tsconfig.json"

sec "i18n messages"
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"
cf "$MSG/en/store.json"
cf "$MSG/id/store.json"
cf "$MSG/en/toast.json"
cf "$MSG/id/toast.json"
cf "$MSG/en/common.json"
cf "$MSG/id/common.json"
cf "$MSG/en/validation.json"
cf "$MSG/id/validation.json"

# ── SUMMARY ───────────────────────────────────────────────────
PCT=0; [ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓ OK     : $FOUND / $TOTAL${NC}  (${PCT}%)"
echo -e "  ${RED}✗ Missing: $MISSING${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "  Output: $FILE"
echo ""

{
  echo "################################################################"
  echo "##  SUMMARY"
  echo "##  OK      : $FOUND / $TOTAL  (${PCT}%)"
  echo "##  Missing : $MISSING"
  echo "################################################################"
} >> "$FILE"