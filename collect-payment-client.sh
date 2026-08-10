#!/bin/bash
# ================================================================
# collect-payment-client.sh
# Collection Script — Payment & Billing (Client/Frontend)
#
# ┌─────────────────────────────────────────────────────────┐
# │  Scope: semua file payment/billing di client:          │
# │         - Subscription pages & components              │
# │         - Checkout pages & components                 │
# │         - Payment method dialog                       │
# │         - Tripay payment waiting                      │
# │         - Stripe checkout button                      │
# │         - Hooks (use-checkout, use-subscription)      │
# │         - API (checkout, subscription, refund)        │
# │         - Types (api, product)                       │
# └─────────────────────────────────────────────────────────┘
#
# Output:
#   collections/COLLECTION-payment-client-[timestamp].txt
#
# Usage    : bash collect-payment-client.sh
# Run from : railway/client/ directory
# ================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'

PROJECT_ROOT="."
SRC="$PROJECT_ROOT/src"
OUT="collections"

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE_PAYMENT="$OUT/COLLECTION-payment-client-${TIMESTAMP}.txt"

# ================================================================
# HELPERS
# ================================================================

collect_file() {
    local f="$1"
    local out="$2"

    if [ -f "$f" ]; then
        local rel="${f#$PROJECT_ROOT/}"
        local lines
        lines=$(wc -l < "$f" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}✓${NC} $rel ${DIM}(${lines} lines)${NC}"
        {
            echo "================================================"
            echo "FILE: $rel"
            echo "Lines: $lines"
            echo "================================================"
            echo ""
            cat "$f"
            printf "\n\n"
        } >> "$out"
    else
        echo -e "  ${RED}✗ NOT FOUND:${NC} ${f#$PROJECT_ROOT/}"
    fi
}

collect_folder() {
    local folder="$1"
    local out="$2"

    if [ ! -d "$folder" ]; then
        echo -e "  ${RED}✗ FOLDER NOT FOUND:${NC} ${folder#$PROJECT_ROOT/}"
        return
    fi

    local count=0
    while IFS= read -r -d '' file; do
        collect_file "$file" "$out"
        ((count++))
    done < <(find "$folder" -type f \( -name "*.tsx" -o -name "*.ts" \) \
        ! -name "*.spec.*" ! -name "*.test.*" \
        ! -path "*/node_modules/*" -print0 2>/dev/null | sort -z)

    echo -e "  ${CYAN}→ $count file(s) collected${NC}"
}

sec() {
    local label="$1"
    local out="$2"
    echo -e "\n${MAGENTA}▶ $label${NC}"
    {
        echo ""
        echo "################################################################"
        echo "##  $label"
        echo "################################################################"
        echo ""
    } >> "$out"
}

block() {
    local label="$1"
    local out="$2"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $label${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    {
        echo ""
        echo "################################################################"
        echo "##  BLOCK: $label"
        echo "################################################################"
        echo ""
    } >> "$out"
}

write_header() {
    local out="$1"
    cat >> "$out" << EOF
################################################################
##  COLLECTION REPORT — PAYMENT & BILLING (Client)
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##
##  Project   : Next.js Frontend — Multi-Tenant UMKM
##  Scope     : Subscription · Checkout · Payment Methods
##              · Tripay · Stripe · Refund
################################################################

EOF
}

print_summary() {
    local out="$1"

    local file_count total_lines file_size
    file_count=$(grep -c "^FILE:" "$out" 2>/dev/null || echo "0")
    total_lines=$(wc -l < "$out" 2>/dev/null || echo "0")
    file_size=$(du -h "$out" 2>/dev/null | cut -f1)

    {
        echo ""
        echo "################################################################"
        echo "##  SUMMARY"
        echo "################################################################"
        echo "Files  : $file_count"
        echo "Lines  : $total_lines"
        echo "Size   : $file_size"
        echo ""
        echo "##  FILE COUNT BY CATEGORY"
        echo "Subscription Pages    : 3"
        echo "Subscription Comp    : 4"
        echo "Checkout Pages       : 4"
        echo "Checkout Comp        : 3"
        echo "Payment Hooks        : 4"
        echo "Payment API          : 3"
        echo "Payment Types        : 2"
        echo "Payment Store        : 1"
    } >> "$out"

    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  COLLECTION SELESAI ✓                                         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo -e "${CYAN}  📂 Output : $out${NC}"
    echo -e "${CYAN}  📊 Files  : $file_count${NC}"
    echo -e "${CYAN}  📄 Lines  : $total_lines${NC}"
    echo -e "${CYAN}  📦 Size   : $file_size${NC}"
}

# ================================================================
# SECTION RUNNERS
# ================================================================

run_subscription_pages() {
    sec "SUBSCRIPTION — Pages" "$FILE_PAYMENT"
    collect_file "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx" "$FILE_PAYMENT"
    collect_file "$SRC/app/[locale]/(dashboard)/dashboard/subscription/pay/[paymentId]/page.tsx" "$FILE_PAYMENT"
}

run_subscription_components() {
    sec "SUBSCRIPTION — Components" "$FILE_PAYMENT"
    collect_folder "$SRC/components/dashboard/subscription" "$FILE_PAYMENT"
}

run_checkout_pages() {
    sec "CHECKOUT — Pages" "$FILE_PAYMENT"
    collect_file "$SRC/app/[locale]/checkout/success/page.tsx" "$FILE_PAYMENT"
    collect_file "$SRC/app/[locale]/checkout/success/client.tsx" "$FILE_PAYMENT"
    collect_file "$SRC/app/[locale]/checkout/cancel/page.tsx" "$FILE_PAYMENT"
    collect_file "$SRC/app/[locale]/checkout/cancel/client.tsx" "$FILE_PAYMENT"
}

run_checkout_components() {
    sec "CHECKOUT — Components (Store)" "$FILE_PAYMENT"
    collect_folder "$SRC/components/store/checkout" "$FILE_PAYMENT"
}

run_payment_hooks() {
    sec "PAYMENT — Hooks" "$FILE_PAYMENT"
    collect_file "$SRC/hooks/dashboard/use-checkout.ts" "$FILE_PAYMENT"
    collect_file "$SRC/hooks/dashboard/use-subscription-plan.ts" "$FILE_PAYMENT"
    collect_file "$SRC/hooks/dashboard/use-tripay-checkout.ts" "$FILE_PAYMENT"
    collect_file "$SRC/hooks/dashboard/use-tripay-payment.ts" "$FILE_PAYMENT"
    collect_file "$SRC/hooks/dashboard/use-refund.ts" "$FILE_PAYMENT"
}

run_payment_api() {
    sec "PAYMENT — API" "$FILE_PAYMENT"
    collect_file "$SRC/lib/api/checkout.ts" "$FILE_PAYMENT"
    collect_file "$SRC/lib/api/subscription.ts" "$FILE_PAYMENT"
    collect_file "$SRC/lib/api/refund.ts" "$FILE_PAYMENT"
}

run_payment_types() {
    sec "PAYMENT — Types" "$FILE_PAYMENT"
    collect_file "$SRC/types/api.ts" "$FILE_PAYMENT"
    collect_file "$SRC/types/product.ts" "$FILE_PAYMENT"
}

run_payment_store() {
    sec "PAYMENT — Store" "$FILE_PAYMENT"
    collect_file "$SRC/stores/auth-store.ts" "$FILE_PAYMENT"
}

run_pricing_constants() {
    sec "PAYMENT — Pricing Constants" "$FILE_PAYMENT"
    collect_file "$SRC/lib/constants/dashboard/pricing.ts" "$FILE_PAYMENT"
}

# ================================================================
# MAIN RUNNER — ALL
# ================================================================

run_all() {
    : > "$FILE_PAYMENT"
    write_header "$FILE_PAYMENT"

    echo -e "\n${WHITE}  ── Collecting PAYMENT & BILLING (Client) ──${NC}\n"

    block "LAYER 1 · SUBSCRIPTION" "$FILE_PAYMENT"
    run_subscription_pages
    run_subscription_components

    block "LAYER 2 · CHECKOUT" "$FILE_PAYMENT"
    run_checkout_pages
    run_checkout_components

    block "LAYER 3 · PAYMENT HOOKS" "$FILE_PAYMENT"
    run_payment_hooks

    block "LAYER 4 · PAYMENT API" "$FILE_PAYMENT"
    run_payment_api

    block "LAYER 5 · PAYMENT TYPES" "$FILE_PAYMENT"
    run_payment_types

    block "LAYER 6 · PAYMENT STORE" "$FILE_PAYMENT"
    run_payment_store

    block "LAYER 7 · PRICING CONSTANTS" "$FILE_PAYMENT"
    run_pricing_constants

    print_summary "$FILE_PAYMENT"
}

# ================================================================
# MENU
# ================================================================

show_menu() {
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   COLLECT — Payment & Billing (Client)                       ║${NC}"
    echo -e "${BLUE}║   Subscription · Checkout · Tripay · Stripe · Refund         ║${NC}"
    echo -e "${BLUE}╠═══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  1)${NC} SUBSCRIPTION PAGES   subscription/ pages       ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  2)${NC} SUBSCRIPTION COMP    subscription/components   ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  3)${NC} CHECKOUT PAGES      checkout/ pages          ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  4)${NC} CHECKOUT COMP       store/checkout/          ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  5)${NC} PAYMENT HOOKS       hooks/dashboard/         ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  6)${NC} PAYMENT API         lib/api/                 ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  7)${NC} PAYMENT TYPES       types/                    ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  8)${NC} PAYMENT STORE       stores/                   ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${GREEN}  9)${NC} PRICING CONSTANTS   lib/constants/dashboard/  ${BLUE}      ║${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}╠═══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║  ${MAGENTA}  A)${NC} ALL  — Semua section → 1 file output           ${BLUE}      ║${NC}"
    echo -e "${BLUE}║  ${RED}  0)${NC} Exit                                           ${BLUE}      ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${DIM}  Output dir : $OUT/${NC}"
    echo -e "${DIM}  Output file: COLLECTION-payment-client-[timestamp].txt${NC}"
    echo ""
    echo -ne "${WHITE}  Pilihan [1-9/A/0]: ${NC}"
}

# ================================================================
# ENTRY POINT
# ================================================================

main() {
    if [ ! -d "$SRC" ]; then
        echo -e "${YELLOW}⚠  PERINGATAN: src/ tidak ditemukan!${NC}"
        echo -e "${YELLOW}   Jalankan dari railway/client/ directory.${NC}"
        echo ""
        exit 1
    fi

    mkdir -p "$OUT"

    while true; do
        TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
        FILE_PAYMENT="$OUT/COLLECTION-payment-client-${TIMESTAMP}.txt"

        show_menu
        read -r raw_input

        [ -z "$raw_input" ] && continue

        case "${raw_input^^}" in
            0)
                echo -e "\n${CYAN}Goodbye! ✌${NC}\n"
                exit 0
                ;;
            1)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 1 · SUBSCRIPTION" "$FILE_PAYMENT"
                run_subscription_pages
                print_summary "$FILE_PAYMENT"
                ;;
            2)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 1 · SUBSCRIPTION" "$FILE_PAYMENT"
                run_subscription_components
                print_summary "$FILE_PAYMENT"
                ;;
            3)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 2 · CHECKOUT" "$FILE_PAYMENT"
                run_checkout_pages
                print_summary "$FILE_PAYMENT"
                ;;
            4)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 2 · CHECKOUT" "$FILE_PAYMENT"
                run_checkout_components
                print_summary "$FILE_PAYMENT"
                ;;
            5)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 3 · PAYMENT HOOKS" "$FILE_PAYMENT"
                run_payment_hooks
                print_summary "$FILE_PAYMENT"
                ;;
            6)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 4 · PAYMENT API" "$FILE_PAYMENT"
                run_payment_api
                print_summary "$FILE_PAYMENT"
                ;;
            7)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 5 · PAYMENT TYPES" "$FILE_PAYMENT"
                run_payment_types
                print_summary "$FILE_PAYMENT"
                ;;
            8)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 6 · PAYMENT STORE" "$FILE_PAYMENT"
                run_payment_store
                print_summary "$FILE_PAYMENT"
                ;;
            9)
                : > "$FILE_PAYMENT"
                write_header "$FILE_PAYMENT"
                block "LAYER 7 · PRICING CONSTANTS" "$FILE_PAYMENT"
                run_pricing_constants
                print_summary "$FILE_PAYMENT"
                ;;
            A)
                run_all
                ;;
            *)
                echo -e "${RED}  Pilihan tidak valid. Masukkan 1-9, A, atau 0.${NC}"
                sleep 1
                continue
                ;;
        esac

        echo ""
        read -rp "  Tekan Enter untuk kembali ke menu..."
    done
}

main "$@"