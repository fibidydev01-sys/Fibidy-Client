#!/bin/bash
# ================================================================
# collect-audit-fe-final.sh
# FINAL COMPREHENSIVE Collection — FE Audit
#
# Scope gabungan:
#   [A] Batch 2 + Batch 4  : LS-vs-Stripe FE separation (original)
#   [B] IDR Migration       : currency display USD → IDR (frontend)
#   [C] All Transaction Areas (FE):
#       - Subscription      : checkout LS, verify, cancel, plan display
#       - Digital Products  : checkout Stripe Connect, library, refund
#       - Physical Products : product form, price input/display, store
#       - Price formatting  : format.ts, product-info, discover, schema
#       - i18n keys         : currency-related strings di messages/
#
# Plan refs:
#   docs/REFACTOR-PLAN-LS-VS-STRIPE.md
#   docs/GUIDE-STRIPE-IDR-MIGRATION.md
#
# Output: collections/COLLECT-audit-fe-[timestamp].txt
# Usage : bash collect-audit-fe-final.sh
# Run from: client root
# ================================================================

GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; WHITE='\033[1;37m'
DIM='\033[2m'; YELLOW='\033[0;33m'; NC='\033[0m'

SRC="./src"
MSG="./messages"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-audit-fe-${TIMESTAMP}.txt"

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
    { echo ""; echo "################################################################"; echo "##  $1"; echo "################################################################"; echo ""; } >> "$FILE"
}

block() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    { echo ""; echo "################################################################"; echo "##  BLOCK: $1"; echo "################################################################"; echo ""; } >> "$FILE"
}

# ================================================================
# HEADER OUTPUT FILE
# ================================================================
cat > "$FILE" << EOF
################################################################
##  COLLECTION REPORT — FE Full Audit
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##
##  Scope:
##    [A] LS-vs-Stripe FE Separation  (Batch 2 + Batch 4)
##    [B] IDR Currency Migration       (display USD → IDR)
##    [C] All Transaction Areas FE     (subscription, digital,
##                                      physical, price format, i18n)
##
##  Areas:
##    - API clients         : subscription, checkout, products, library, refund, discover
##    - Subscription UI     : page, hooks, plan display
##    - Checkout (Stripe)   : digital product purchase flow
##    - Digital Products    : library, refund, discover
##    - Physical Products   : product form, price input, store pages
##    - Price formatting    : format.ts utility + all price display components
##    - Types               : Product, Tenant types (price/currency fields)
##    - Config              : features.ts (feature flags)
##    - i18n messages       : currency + price strings di en/id JSON
##    - Store pages         : product detail, store landing, product list
################################################################

EOF

echo -e "\n${WHITE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║  FE Full Audit — collect-audit-fe-final.sh               ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════════════════╝${NC}"

# ================================================================
# BLOCK 1 — LS vs STRIPE FE SEPARATION (original Batch 2 + Batch 4)
# ================================================================
block "BLOCK 1 — LS vs STRIPE FE SEPARATION [Batch 2 + Batch 4]"

sec "Group A — API client subscription (Batch 2 + Batch 4 type cleanup)"
# Batch 2:
#   - Removed BillingProvider type
#   - Removed ReconcileResponse interface
#   - Removed reconcile() method
#   - Removed sessionId? param on verify()
# Batch 4:
#   - Removed stripeSubId dari SubscriptionRecord
#   - lsSubscriptionId/lsRenewsAt/lsEndsAt jadi non-optional
cf "$SRC/lib/api/subscription.ts"

sec "Group B — Subscription page (biggest UI change)"
# Batch 2:
#   - Removed sessionIdRef, runReconcile(), 'reconciling' state
#   - Simplified useEffect polling (no Stripe fork)
#   - Removed session_id URL param reading
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"

sec "Group C — i18n keys (reconcile-related strings removed)"
# Batch 2 — keys yang harus sudah DIHAPUS:
#   dashboard.json: reconcilingTitle, reconcilingBody
#   toast.json: reconcileFailed, reconcileSuccess, reconcileSuccessDetail
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"
cf "$MSG/en/toast.json"
cf "$MSG/id/toast.json"

# ================================================================
# BLOCK 2 — IDR CURRENCY MIGRATION (price display USD → IDR)
# ================================================================
block "BLOCK 2 — IDR CURRENCY MIGRATION [Display USD → IDR]"

sec "Group D — Price formatting utility (SSOT untuk semua format harga)"
# CRITICAL: format.ts adalah tempat utama format currency di FE
# Perlu cek:
#   - formatPrice() / formatCurrency() — apakah sudah support IDR?
#   - Intl.NumberFormat locale dan currency param
#   - Default currency hardcode ke 'USD' atau dynamic dari product?
cf "$SRC/lib/shared/format.ts"

sec "Group E — Product types (price + currency fields)"
# Types yang perlu dicek currency field-nya:
#   - product.ts  : Product.price (number), Product.currency (string)
#   - tenant.ts   : Tenant.currency (default field)
#   - api.ts      : response types kalau ada currency field
cf "$SRC/types/product.ts"
cf "$SRC/types/tenant.ts"
cf "$SRC/types/api.ts"

sec "Group F — Price display components"
# Semua komponen yang render harga produk ke user:
#   - product-info.tsx    : harga utama di store product detail
#   - product-card.tsx    : harga di card list/grid store
#   - product-schema.tsx  : JSON-LD schema (price + currency field)
#   - product-list-schema.tsx : JSON-LD list schema
cf "$SRC/components/store/showcase/product-info.tsx"
cf "$SRC/components/store/showcase/product-card.tsx"
cf "$SRC/components/store/shared/product-schema.tsx"
cf "$SRC/components/store/shared/product-list-schema.tsx"

sec "Group G — Discover price display"
# Discover = platform marketplace, tampilkan harga digital product
#   - discover-card.tsx   : harga di card discover
#   - discover-detail.tsx : harga di detail page
cf "$SRC/components/discover/discover-card.tsx"
cf "$SRC/components/discover/discover-detail.tsx"

sec "Group H — Digital product price input (seller side)"
# Seller set harga produk digital — input validation + display
#   - step-details.tsx    : step harga di form upload digital product
#   - product.tsx         : product form wrapper (price field handling)
cf "$SRC/components/dashboard/product/form/step-details.tsx"
cf "$SRC/components/dashboard/product/form/product.tsx"

# ================================================================
# BLOCK 3 — ALL TRANSACTION AREAS (FE)
# ================================================================
block "BLOCK 3 — ALL TRANSACTION AREAS FE"

sec "Group I — API clients (semua yang menyentuh transaksi)"
# Semua API client yang terlibat dalam transaksi:
#   - subscription.ts  : LS subscription flow
#   - checkout.ts      : Stripe Connect checkout
#   - products.ts      : CRUD + digital upload
#   - library.ts       : buyer's purchased products
#   - refund.ts        : digital product refund
#   - discover.ts      : public marketplace
cf "$SRC/lib/api/subscription.ts"
cf "$SRC/lib/api/checkout.ts"
cf "$SRC/lib/api/products.ts"
cf "$SRC/lib/api/library.ts"
cf "$SRC/lib/api/refund.ts"
cf "$SRC/lib/api/discover.ts"

sec "Group J — Subscription (LS billing — sole provider)"
# Full subscription flow FE:
#   - page.tsx                  : subscription page (polling + UI)
#   - use-subscription-plan.ts  : hook untuk plan info + usage
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"
cf "$SRC/hooks/dashboard/use-subscription-plan.ts"

sec "Group K — Checkout Stripe Connect (digital product purchase)"
# Stripe Connect checkout = direct charge untuk digital product
# Gated oleh DIGITAL_PRODUCTS_ENABLED feature flag
#   - checkout.ts              : API client
#   - use-checkout.ts          : hook untuk checkout flow
#   - stripe-checkout-button.tsx : tombol beli + trigger checkout
#   - success page + client    : post-checkout polling + verify
#   - cancel page + client     : checkout dibatalkan
cf "$SRC/lib/api/checkout.ts"
cf "$SRC/hooks/dashboard/use-checkout.ts"
cf "$SRC/components/store/checkout/stripe-checkout-button.tsx"
cf "$SRC/app/[locale]/checkout/success/page.tsx"
cf "$SRC/app/[locale]/checkout/success/client.tsx"
cf "$SRC/app/[locale]/checkout/cancel/page.tsx"
cf "$SRC/app/[locale]/checkout/cancel/client.tsx"

sec "Group L — Library (buyer's purchased digital products)"
# Library = semua produk digital yang sudah dibeli
#   - page.tsx + client.tsx : library dashboard page
#   - use-library.ts        : hook untuk library data
#   - library-card.tsx      : card per purchased product
#   - library-grid.tsx      : grid layout library
cf "$SRC/app/[locale]/(dashboard)/dashboard/library/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/library/client.tsx"
cf "$SRC/hooks/dashboard/use-library.ts"
cf "$SRC/components/library/library-card.tsx"
cf "$SRC/components/library/library-grid.tsx"

sec "Group M — Refund (digital product refund flow)"
# Refund flow = auto-evaluated, buyer request → auto-approve/reject
#   - use-refund.ts      : hook untuk refund request
#   - refund-button.tsx  : tombol request refund
#   - refund-dialog.tsx  : dialog konfirmasi + status
cf "$SRC/hooks/dashboard/use-refund.ts"
cf "$SRC/components/library/refund-button.tsx"
cf "$SRC/components/library/refund-dialog.tsx"

sec "Group N — Discover (public marketplace digital products)"
# Discover = platform-wide digital product marketplace
#   - page.tsx + client.tsx : discover listing
#   - [id]/page.tsx + client.tsx : product detail + buy button
#   - buy-button.tsx        : CTA di discover (trigger checkout)
#   - discover-grid.tsx     : grid layout
#   - discover-filters.tsx  : search + filter
cf "$SRC/app/[locale]/discover/page.tsx"
cf "$SRC/app/[locale]/discover/client.tsx"
cf "$SRC/app/[locale]/discover/[id]/page.tsx"
cf "$SRC/app/[locale]/discover/[id]/client.tsx"
cf "$SRC/components/discover/buy-button.tsx"
cf "$SRC/components/discover/discover-grid.tsx"
cf "$SRC/components/discover/discover-filters.tsx"

sec "Group O — Physical Products (seller CRUD + price form)"
# Physical product punya price field juga, plus currency di schema
#   - page.tsx + client.tsx : products dashboard listing
#   - [id]/edit/page.tsx    : edit product page (uploaded di prompt)
#   - new/page.tsx          : create new product
#   - product-grid.tsx      : grid display di dashboard
#   - product-grid-card.tsx : card per product di dashboard
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/client.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/[id]/edit/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/new/page.tsx"
cf "$SRC/components/dashboard/product/product-grid.tsx"
cf "$SRC/components/dashboard/product/product-grid-card.tsx"

sec "Group P — Physical product download stats (seller side)"
# Download history untuk digital products
#   - downloads page + client : seller melihat download history
#   - download-history-table  : tabel data
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/downloads/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/products/downloads/client.tsx"
cf "$SRC/components/dashboard/product/download-history-table.tsx"

sec "Group Q — Store pages (product display + price)"
# Store = public-facing halaman toko seller
# Semua page ini menampilkan harga — perlu display IDR yang benar
#   - store/[slug]/page.tsx             : landing toko
#   - store/[slug]/products/page.tsx    : list semua produk toko
#   - store/[slug]/products/[id]/page.tsx : detail produk toko
#   - product-actions.tsx               : WhatsApp order + checkout button
#   - featured-products.tsx             : produk featured di landing toko
cf "$SRC/app/[locale]/store/[slug]/page.tsx"
cf "$SRC/app/[locale]/store/[slug]/products/page.tsx"
cf "$SRC/app/[locale]/store/[slug]/products/[id]/page.tsx"
cf "$SRC/components/store/showcase/product-actions.tsx"
cf "$SRC/components/store/showcase/featured-products.tsx"

sec "Group R — KYC + Stripe Connect onboarding (seller setup)"
# Seller onboarding ke Stripe Connect untuk bisa jual digital product
#   - kyc-banner.tsx     : status KYC di dashboard
#   - onboard/refresh    : redirect dari Stripe setelah onboarding
cf "$SRC/components/dashboard/product/kyc-banner.tsx"
cf "$SRC/app/[locale]/onboard/refresh/page.tsx"
cf "$SRC/app/[locale]/onboard/refresh/client.tsx"

sec "Group S — Config + hooks (feature flags + auth)"
# Feature flag menentukan apakah digital products / Connect aktif
#   - features.ts         : FEATURES config (digitalProducts flag)
#   - use-auth.ts         : auth hook (subscription tier check)
#   - validations.ts      : form validations (price validation IDR?)
cf "$SRC/lib/config/features.ts"
cf "$SRC/hooks/auth/use-auth.ts"
cf "$SRC/lib/shared/validations.ts"

sec "Group T — i18n messages (semua currency + price strings)"
# Messages JSON yang mungkin punya string terkait currency/price:
#   - en/dashboard.json : dashboard strings (subscription, products)
#   - id/dashboard.json : Indonesian translation
#   - en/store.json     : store/product display strings
#   - id/store.json     : Indonesian translation
#   - en/toast.json     : toast messages (payment, subscription)
#   - id/toast.json     : Indonesian translation
#   - en/common.json    : shared strings (kalau ada format currency)
#   - id/common.json    : Indonesian translation
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"
cf "$MSG/en/store.json"
cf "$MSG/id/store.json"
cf "$MSG/en/toast.json"
cf "$MSG/id/toast.json"
cf "$MSG/en/common.json"
cf "$MSG/id/common.json"

# ================================================================
# SUMMARY + SANITY GREPS
# ================================================================
PCT=0; [ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓ OK      : $FOUND / $TOTAL${NC}"
echo -e "  ${RED}✗ Issues  : $MISSING${NC}"
echo -e "  Coverage  : $PCT%"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""

echo -e "${WHITE}  ── SANITY GREPS (jalankan dari client/) ──${NC}"
echo ""
echo -e "${YELLOW}  [Batch 2+4] Harus ZERO hits:${NC}"
echo -e "${DIM}    grep -rn 'BillingProvider\\|stripeSubId\\|ReconcileResponse' src/${NC}"
echo -e "${DIM}    grep -rn 'subscriptionApi\\.reconcile\\|runReconcile' src/${NC}"
echo -e "${DIM}    grep -rn 'reconciling\\|sessionIdRef' src/app${NC}"
echo -e "${DIM}    grep -rn 'reconcilingTitle\\|reconcileFailed' messages/${NC}"
echo ""
echo -e "${YELLOW}  [IDR Migration] Harus ZERO hits (hardcode USD di price display):${NC}"
echo -e "${DIM}    grep -rn \"'USD'\\|\\\"USD\\\"\" src/lib/shared/format.ts${NC}"
echo -e "${DIM}    grep -rn \"currency.*USD\\|USD.*currency\" src/components/store/${NC}"
echo -e "${DIM}    grep -rn \"currency.*USD\\|USD.*currency\" src/components/discover/${NC}"
echo ""
echo -e "${YELLOW}  [IDR Migration] Verifikasi format price pakai locale id-ID:${NC}"
echo -e "${DIM}    grep -rn 'id-ID\\|IDR\\|Intl.NumberFormat' src/lib/shared/format.ts${NC}"
echo -e "${DIM}    grep -rn 'formatPrice\\|formatCurrency\\|formatIDR' src/components/${NC}"
echo ""
echo -e "${YELLOW}  [Discover + Store] Tidak boleh hardcode 'USD' di JSON-LD:${NC}"
echo -e "${DIM}    grep -rn 'priceCurrency.*USD' src/components/store/shared/${NC}"
echo -e "${DIM}    grep -rn 'priceCurrency.*USD' src/components/discover/${NC}"
echo ""
echo -e "${YELLOW}  [Feature Flag] Verifikasi gating konsisten:${NC}"
echo -e "${DIM}    grep -rn 'DIGITAL_PRODUCTS_ENABLED\\|digitalProducts' src/lib/config/${NC}"
echo -e "${DIM}    grep -rn 'digitalProducts' src/hooks/{NC}"
echo ""
echo -e "${YELLOW}  [Price Input] Harus integer (no decimal) untuk IDR:${NC}"
echo -e "${DIM}    grep -rn 'step.*0\\.01\\|type.*number' src/components/dashboard/product/form/${NC}"
echo ""
echo -e "${YELLOW}  [Stripe Connect Checkout] Boleh masih pakai session_id — ini NORMAL:${NC}"
echo -e "${DIM}    grep -rn 'session_id' src/app/\\[locale\\]/checkout/   # NORMAL, biarkan${NC}"
echo ""
echo -e "${YELLOW}  [LemonSqueezy] Boleh tetap USD — ini NORMAL:${NC}"
echo -e "${DIM}    grep -rn 'USD' src/app/\\[locale\\]/\\(dashboard\\)/dashboard/subscription/  # NORMAL${NC}"
echo ""

{
  echo ""
  echo "################################################################"
  echo "##  SUMMARY"
  echo "################################################################"
  echo "OK       : $FOUND / $TOTAL"
  echo "Issues   : $MISSING"
  echo "Coverage : $PCT%"
  echo ""
  echo "##  BLOCK BREAKDOWN"
  echo "Block 1 — LS vs Stripe FE Separation : Group A-C  (6 files)"
  echo "Block 2 — IDR Currency Migration      : Group D-H  (14 files)"
  echo "Block 3 — All Transaction Areas FE    : Group I-T  (50+ files)"
  echo ""
  echo "##  POST-REFACTOR SANITY GREPS (run from client/)"
  echo ""
  echo "# [Batch 2+4] Harus ZERO hits:"
  echo "grep -rn 'BillingProvider\|stripeSubId\|ReconcileResponse' src/"
  echo "grep -rn 'subscriptionApi\.reconcile\|runReconcile' src/"
  echo "grep -rn 'reconciling\|sessionIdRef' src/app"
  echo "grep -rn 'reconcilingTitle\|reconcileFailed' messages/"
  echo ""
  echo "# [IDR Migration] Harus ZERO hits (hardcode USD di price display):"
  echo "grep -rn \"'USD'\|\\\"USD\\\"\" src/lib/shared/format.ts"
  echo "grep -rn \"currency.*USD\|USD.*currency\" src/components/store/"
  echo "grep -rn \"currency.*USD\|USD.*currency\" src/components/discover/"
  echo ""
  echo "# [IDR Migration] Verifikasi format pakai id-ID:"
  echo "grep -rn 'id-ID\|IDR\|Intl.NumberFormat' src/lib/shared/format.ts"
  echo ""
  echo "# [JSON-LD Schema] priceCurrency harus IDR bukan USD:"
  echo "grep -rn 'priceCurrency.*USD' src/components/store/shared/"
  echo "grep -rn 'priceCurrency.*USD' src/components/discover/"
  echo ""
  echo "# [Price Input] IDR harus integer (step=1, no decimal):"
  echo "grep -rn 'step.*0\.01\|type.*number' src/components/dashboard/product/form/"
  echo ""
  echo "# [Stripe Connect] BOLEH ada session_id di /checkout/* — beda flow:"
  echo "grep -rn 'session_id' src/app/\[locale\]/checkout/   # ini NORMAL"
  echo ""
  echo "# [LemonSqueezy] BOLEH tetap USD di subscription page — NORMAL:"
  echo "grep -rn 'USD' src/app/\[locale\]/\(dashboard\)/dashboard/subscription/"
} >> "$FILE"