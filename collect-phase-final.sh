#!/bin/bash
# ================================================================
# collect-refactor-fe.sh
# FINAL CLEAN Collection — FE files for LS-vs-Stripe Refactor
#
# Scope: Batch 2 (FE Stripe Subscription removal) + Batch 4 (FE type)
# Plan : docs/REFACTOR-PLAN-LS-VS-STRIPE.md
#
# Tier 1 — MODIFIED in Batch 2 + Batch 4 (must verify post-refactor)
#   Group A — API client (Batch 2 + 4)                       (1 file)
#   Group B — Subscription page (biggest UI change)          (1 file)
#   Group C — i18n keys (reconcile keys removed)             (4 files)
#
# Tier 2 — UNTOUCHED but adjacent (verify no stale refs)
#   Group D — Stripe Connect checkout pages (must be pristine) (4 files)
#   Group E — Auth + plan hooks (verify no Stripe billing leak) (2 files)
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
##  COLLECTION — FE Refactor Audit (FINAL CLEAN)
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##  Purpose   : Verify Batch 2 + Batch 4 FE final state
##  Scope     : Stripe Subscription billing removal (LS = sole provider)
##  Total     : 12 files
EOF

echo -e "\n${WHITE}  ── Collecting FE Refactor Files (FINAL CLEAN) ──${NC}"
echo -e "${YELLOW}  ── Tier 1: Modified in Batch 2 + Batch 4 ──${NC}"

block "TIER 1 — MODIFIED (verify final state matches batch READMEs)"

sec "Group A — API client (Batch 2 + Batch 4 type cleanup)"
# Batch 2:
#   - Removed BillingProvider type
#   - Removed ReconcileResponse interface
#   - Removed reconcile() method
#   - Removed sessionId? param on verify() (now zero-arg)
#   - Removed optional `subscription?` field on VerifySubscriptionResponse
# Batch 4:
#   - Removed `stripeSubId: string | null` from SubscriptionRecord
#   - Made lsSubscriptionId/lsRenewsAt/lsEndsAt non-optional
cf "$SRC/lib/api/subscription.ts"

sec "Group B — Subscription page (biggest UI change)"
# Batch 2:
#   - Removed sessionIdRef
#   - Removed runReconcile() callback
#   - Removed 'reconciling' from VerifyState union
#   - Removed reconciling banner JSX
#   - Simplified useEffect polling (no Stripe fork)
#   - Simplified handleManualRetry (no reconcile fallback)
#   - Removed session_id URL param reading
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"

sec "Group C — i18n keys (reconcile-related strings removed)"
# Batch 2 — keys to confirm DELETED:
#   dashboard.json:
#     ✗ dashboard.subscription.verify.reconcilingTitle
#     ✗ dashboard.subscription.verify.reconcilingBody
#   toast.json:
#     ✗ toast.subscription.reconcileFailed
#     ✗ toast.subscription.reconcileSuccess
#     ✗ toast.subscription.reconcileSuccessDetail
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"
cf "$MSG/en/toast.json"
cf "$MSG/id/toast.json"

echo -e "\n${YELLOW}  ── Tier 2: Untouched but adjacent (no stale refs) ──${NC}"

block "TIER 2 — VERIFY UNTOUCHED (no stale Stripe billing refs)"

sec "Group D — Stripe Connect checkout (marketplace, must be pristine)"
# WHY READ:
#   Per Batch 2 README, these are explicitly OUT OF SCOPE — they handle
#   Stripe Connect digital product purchase (different flow entirely).
#   Verify they don't accidentally reference removed subscription APIs
#   (subscriptionApi.reconcile, BillingProvider, etc.)
cf "$SRC/app/[locale]/checkout/cancel/page.tsx"
cf "$SRC/app/[locale]/checkout/cancel/client.tsx"
cf "$SRC/app/[locale]/checkout/success/page.tsx"
cf "$SRC/app/[locale]/checkout/success/client.tsx"

sec "Group E — Auth + subscription plan hooks (verify isolation)"
# WHY READ:
#   - use-auth.ts: gated by FEATURES.digitalProducts but might still
#     have stale subscription redirect refs
#   - use-subscription-plan.ts: read-only plan info, but should not
#     reference stripeSubId or billingProvider after Batch 4
cf "$SRC/hooks/auth/use-auth.ts"
cf "$SRC/hooks/dashboard/use-subscription-plan.ts"

PCT=0; [ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓ OK      : $FOUND / $TOTAL${NC}"
echo -e "  ${RED}✗ Missing : $MISSING${NC}"
echo -e "  Coverage  : $PCT%"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""
echo -e "${WHITE}  Sanity grep — should return ZERO hits in src/:${NC}"
echo -e "${DIM}    grep -rn 'reconcile\\|sessionId' src/app/\\[locale\\]/\\(dashboard\\)/dashboard/subscription${NC}"
echo -e "${DIM}    grep -rn 'BillingProvider\\|stripeSubId\\|ReconcileResponse' src/${NC}"
echo -e "${DIM}    grep -rn 'reconcilingTitle\\|reconcileFailed' messages/${NC}"
echo ""

{
  echo ""
  echo "##  SUMMARY"
  echo "OK       : $FOUND / $TOTAL"
  echo "Missing  : $MISSING"
  echo "Coverage : $PCT%"
  echo ""
  echo "##  TIER BREAKDOWN"
  echo "Tier 1 (MODIFIED)        : 6 files"
  echo "Tier 2 (VERIFY UNTOUCHED): 6 files"
  echo ""
  echo "##  POST-REFACTOR SANITY GREPS (run from client/)"
  echo "# These should ALL return zero hits:"
  echo "grep -rn 'BillingProvider\\|stripeSubId\\|ReconcileResponse' src/"
  echo "grep -rn 'subscriptionApi\\.reconcile\\|runReconcile' src/"
  echo "grep -rn 'reconciling\\|sessionIdRef' src/app"
  echo "grep -rn 'reconcilingTitle\\|reconcilingBody' messages/"
  echo "grep -rn 'reconcileFailed\\|reconcileSuccess' messages/"
  echo ""
  echo "# Stripe Connect checkout (marketplace) MAY still legitimately use"
  echo "# session_id — that is a different flow (Connect Direct Charge)."
  echo "# Confirm those refs are scoped to /checkout/* only:"
  echo "grep -rn 'session_id' src/app/\\[locale\\]/checkout/"
} >> "$FILE"