#!/bin/bash
# ================================================================
# collect-refactor-fe.sh
# Targeted Collection — FE files affected by Stripe Billing → LS Refactor
#
# Used in NEXT chat session to implement Batch 2 (Frontend cleanup)
# of REFACTOR-PLAN-LS-VS-STRIPE.md
#
# Scope:
#   TIER 1 — DEFINITELY MODIFIED (consumer of changed BE contract)
#     Group A — API client: subscription.ts                   (1 file)
#     Group B — Subscription page (biggest change)            (1 file)
#     Group C — i18n keys cleanup                             (4 files)
#
#   TIER 2 — DEFENSIVE SCAN (might have stale Stripe billing refs)
#     Group D — Checkout pages (Stripe Connect ambiguity)     (4 files)
#     Group E — Other API clients & shared infra              (3 files)
#     Group F — Auth flow (uses subscription redirects)       (2 files)
#
#   TIER 3 — REFERENCE ONLY (read-only context)
#     Group G — Types & config                                (3 files)
#
# Output: collections/COLLECT-refactor-fe-[timestamp].txt
# Usage : bash collect-refactor-fe.sh
# Run from: client root
# ================================================================

GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; WHITE='\033[1;37m'
DIM='\033[2m'; YELLOW='\033[0;33m'; NC='\033[0m'

SRC="./src"
MSG="./messages"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-refactor-fe-${TIMESTAMP}.txt"

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
##  COLLECTION — FE Refactor Audit
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##  Purpose   : Implement Batch 2 of REFACTOR-PLAN-LS-VS-STRIPE.md
##  Scope     : Files affected by Stripe Billing removal (LS becomes sole provider)
##  Total     : 18 files
EOF

echo -e "\n${WHITE}  ── Collecting Refactor-Affected FE Files ──${NC}"
echo -e "${YELLOW}  ── Tier 1: Definitely modified ──${NC}"

block "TIER 1 — DEFINITELY MODIFIED (BE contract consumers)"

sec "Group A — API client: subscription.ts (CORE CHANGES)"
# CHANGES:
#   - Remove reconcile() method
#   - Remove BillingProvider type
#   - Remove ReconcileResponse interface
#   - Simplify VerifySubscriptionResponse (remove subscription? field)
#   - Remove sessionId param from verify()
#   - Clean up "[PHASE 3 — LEMONSQUEEZY MIGRATION]" comments
cf "$SRC/lib/api/subscription.ts"

sec "Group B — Subscription page (BIGGEST CHANGE)"
# CHANGES:
#   - Remove sessionIdRef
#   - Remove runReconcile() function
#   - Remove 'reconciling' from VerifyState type
#   - Remove conditional sessionId checks in poll() and handleManualRetry()
#   - Remove reconciling Alert banner JSX
#   - Simplify URL search params (no session_id)
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"

sec "Group C — i18n keys cleanup"
# CHANGES IN THESE 4 FILES:
#   dashboard.json:
#     - Remove: dashboard.subscription.verify.reconcilingTitle
#     - Remove: dashboard.subscription.verify.reconcilingBody
#   toast.json:
#     - Remove: toast.subscription.reconcileFailed
#     - Remove: toast.subscription.reconcileSuccess
#     - Remove: toast.subscription.reconcileSuccessDetail
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"
cf "$MSG/en/toast.json"
cf "$MSG/id/toast.json"

echo -e "\n${YELLOW}  ── Tier 2: Defensive scan ──${NC}"

block "TIER 2 — DEFENSIVE SCAN (might have stale Stripe billing refs)"

sec "Group D — Checkout pages (Stripe Connect vs Subscription ambiguity)"
# WHY SCAN:
#   STRIPE_SUCCESS_URL was originally:
#     "https://fibidy.com/checkout/success?session_id={CHECKOUT_SESSION_ID}"
#
#   This was Stripe Connect product purchase redirect, NOT subscription.
#   Subscription uses /dashboard/subscription?status=success now.
#
#   Verify these pages are PURELY for Stripe Connect product purchase:
#     - If YES: keep as-is (Connect dormant, gated by feature flag)
#     - If NO (handles subscription too): need cleanup
#
# RISK if skipped:
#   Dead code referencing stripe-billing only flow could remain.
cf "$SRC/app/[locale]/checkout/cancel/page.tsx"
cf "$SRC/app/[locale]/checkout/cancel/client.tsx"
cf "$SRC/app/[locale]/checkout/success/page.tsx"
cf "$SRC/app/[locale]/checkout/success/client.tsx"

sec "Group E — Related API clients & infra (verify no Stripe billing refs)"
# WHY SCAN:
#   - checkout.ts: Stripe Connect product purchase API. Should be clean.
#   - client.ts: Generic API client. Should be clean.
#   - query-keys.ts: Verify subscription.payments key still relevant
cf "$SRC/lib/api/checkout.ts"
cf "$SRC/lib/api/client.ts"
cf "$SRC/lib/shared/query-keys.ts"

sec "Group F — Auth flow (subscription redirect target)"
# WHY SCAN:
#   - use-auth.ts already conditional on FEATURES.digitalProducts
#   - But might have stale subscription-related redirects
cf "$SRC/hooks/auth/use-auth.ts"
cf "$SRC/hooks/dashboard/use-subscription-plan.ts"

echo -e "\n${YELLOW}  ── Tier 3: Reference only ──${NC}"

block "TIER 3 — REFERENCE ONLY (read-only context for refactor)"

sec "Group G — Types & config (verify type contracts)"
# WHY READ:
#   - api.ts: Verify ApiError shape unchanged (BE removes Stripe-only error codes)
#   - features.ts: Confirm DIGITAL_PRODUCTS flag still master switch
#   - tenant.ts: Verify tenant type doesn't have stale Stripe-billing fields
cf "$SRC/types/api.ts"
cf "$SRC/lib/config/features.ts"
cf "$SRC/types/tenant.ts"

PCT=0; [ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓ Found   : $FOUND / $TOTAL${NC}"
echo -e "  ${RED}✗ Missing : $MISSING${NC}"
echo -e "  Coverage  : $PCT%"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""
echo -e "${WHITE}  Next: attach output to next chat with Claude${NC}"
echo -e "${WHITE}  Say: \"Lanjut Batch 2 dari REFACTOR-PLAN, file FE attached\"${NC}"

{ 
  echo ""
  echo "##  SUMMARY"
  echo "Found    : $FOUND / $TOTAL"
  echo "Missing  : $MISSING"
  echo "Coverage : $PCT%"
  echo ""
  echo "##  TIER BREAKDOWN"
  echo "Tier 1 (DEFINITELY MODIFIED) : 6 files"
  echo "Tier 2 (DEFENSIVE SCAN)      : 9 files"
  echo "Tier 3 (REFERENCE ONLY)      : 3 files"
  echo ""
  echo "##  NEXT STEPS"
  echo "1. Verify all Tier 1 files present"
  echo "2. Grep Tier 2 files for stale Stripe billing refs:"
  echo "   grep -rn 'reconcile\\|sessionId\\|STRIPE_PRICE\\|STRIPE_SUCCESS_URL' src/"
  echo "3. Attach output file to next Claude chat"
  echo "4. Say: 'Lanjut Batch 2 dari REFACTOR-PLAN'"
} >> "$FILE"