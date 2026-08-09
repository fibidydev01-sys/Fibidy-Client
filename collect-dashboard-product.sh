#!/bin/bash

# ================================================================
# CLIENT — PRODUCT CRUD FILES COLLECTOR (FINAL)
#
# Collect semua file untuk CRUD Product di Dashboard:
#   - CREATE: New product form + upload
#   - READ: Product list + grid + preview drawer + download history
#   - UPDATE: Edit product form
#   - DELETE: Delete dialog
#
# [FINAL REVISION]
# Ditambahkan dependency yang sebelumnya missing (di-import langsung
# oleh file-file product tapi belum ikut ter-collect):
#   - hooks/shared/use-media-query.ts     → dipakai product-preview-drawer.tsx
#   - hooks/shared/use-image-crop.ts      → dipakai step-media.tsx, image-crop-modal.tsx
#   - lib/api/client.ts                   → dipakai lib/api/products.ts
#   - lib/api/subscription.ts             → dipakai use-subscription-plan.ts, step-media.tsx
#   - stores/auth-store.ts                → dipakai kyc-banner.tsx
#   - lib/config/features.ts              → dipakai hampir semua (FEATURES.digitalProducts)
#   - lib/shared/utils.ts                 → cn(), dipakai hampir semua komponen
#   - components/dashboard/product/download-history-table.tsx → bagian READ (digital product)
#   - app/.../products/downloads/client.tsx + page.tsx         → halaman download history
#
# Run dari: root direktori client (tempat src/ ada)
#   bash collect-product-crud.sh
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

    # [PURE-FILES GUARD] Skip test files even if accidentally passed in.
    # Matches: *.test.ts(x), *.spec.ts(x), __tests__/, /test/ or /tests/ dirs.
    # This collector is for production source only — test files are a
    # separate concern and should never be pulled into a CRUD file dump.
    if echo "$file" | grep -qE '\.(test|spec)\.(ts|tsx|js|jsx)$|__tests__|(^|/)tests?/'; then
        local rel="${file#$PROJECT_ROOT/}"
        echo -e "  ${YELLOW}⊘ SKIPPED (test file):${NC} $rel"
        TOTAL=$((TOTAL - 1))
        return
    fi

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
    local output_file="$OUT/PRODUCT-CRUD-$timestamp.txt"

    {
        echo "################################################################"
        echo "##  CLIENT — PRODUCT CRUD FILES (FINAL)"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Working dir: $(pwd)"
        echo "################################################################"
        echo ""
        echo "##  CRUD OPERATIONS:"
        echo "##    📖 READ  - Product list, grid, preview drawer, download history"
        echo "##    ✏️ CREATE - New product form, upload, wizard"
        echo "##    🔄 UPDATE - Edit product form"
        echo "##    🗑️ DELETE - Delete dialog"
        echo "################################################################"
        echo ""
    } > "$output_file"

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  PRODUCT CRUD FILES COLLECTOR (FINAL)                    ${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    # ── 1. READ (LIST PRODUCTS) ──────────────────────────────────
    section_header "1. 📖 READ — PRODUCT LIST & GRID" "$output_file"

    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/client.tsx" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/product/product-grid.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/product-grid-card.tsx" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/product/product-preview-drawer.tsx" "$output_file"

    # ── 1B. READ — DOWNLOAD HISTORY (digital product detail view) ────
    section_header "1B. 📖 READ — DOWNLOAD HISTORY" "$output_file"

    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/downloads/page.tsx" "$output_file"
    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/downloads/client.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/download-history-table.tsx" "$output_file"

    # ── 2. CREATE (NEW PRODUCT) ──────────────────────────────────
    section_header "2. ✏️ CREATE — NEW PRODUCT FORM" "$output_file"

    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/new/page.tsx" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/product/form/product.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/types.ts" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/product/form/step-details.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/step-upload.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/step-media.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/form/step-preview.tsx" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/product/upload-dropzone.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/storage-usage-bar.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/product/kyc-banner.tsx" "$output_file"

    # ── 3. UPDATE (EDIT PRODUCT) ──────────────────────────────────
    section_header "3. 🔄 UPDATE — EDIT PRODUCT FORM" "$output_file"

    collect_file "$SRC_DIR/app/[locale]/(dashboard)/dashboard/products/[id]/edit/page.tsx" "$output_file"

    # ── 4. DELETE PRODUCT ──────────────────────────────────────────
    section_header "4. 🗑️ DELETE — DELETE DIALOG" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/product/product-delete-dialog.tsx" "$output_file"

    # ── 5. PRODUCT HOOKS ──────────────────────────────────────────
    section_header "5. ⚡ HOOKS — CRUD OPERATIONS" "$output_file"

    collect_file "$SRC_DIR/hooks/dashboard/use-products.ts" "$output_file"

    # ── 6. PRODUCT API ────────────────────────────────────────────
    section_header "6. 🌐 API — CRUD ENDPOINTS" "$output_file"

    collect_file "$SRC_DIR/lib/api/products.ts" "$output_file"
    # [FINAL] api client base — products.ts imports { api }, ApiRequestError, getErrorMessage from here
    collect_file "$SRC_DIR/lib/api/client.ts" "$output_file"

    # ── 7. PRODUCT TYPES ──────────────────────────────────────────
    section_header "7. 📦 TYPES — PRODUCT SCHEMA" "$output_file"

    collect_file "$SRC_DIR/types/product.ts" "$output_file"

    # ── 8. VALIDATIONS ────────────────────────────────────────────
    section_header "8. ✅ VALIDATIONS — ZOD SCHEMA" "$output_file"

    collect_file "$SRC_DIR/lib/shared/validations.ts" "$output_file"

    # ── 9. SHARED COMPONENTS ──────────────────────────────────────
    section_header "9. 🔧 SHARED COMPONENTS" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/shared/wizard-nav.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/step-indicator.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/step-wizard.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/upgrade-modal.tsx" "$output_file"

    collect_file "$SRC_DIR/components/dashboard/shared/image-slot.tsx" "$output_file"
    collect_file "$SRC_DIR/components/dashboard/shared/image-crop-modal.tsx" "$output_file"

    # ── 10. UI COMPONENTS ──────────────────────────────────────────
    section_header "10. 🎨 UI COMPONENTS" "$output_file"

    collect_file "$SRC_DIR/components/ui/optimized-image.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/validation-dialog.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/empty.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/progress.tsx" "$output_file"
    collect_file "$SRC_DIR/components/ui/combobox.tsx" "$output_file"

    # ── 11. CLOUDINARY ─────────────────────────────────────────────
    section_header "11. ☁️ CLOUDINARY UPLOAD" "$output_file"

    collect_file "$SRC_DIR/hooks/shared/use-cloudinary-upload.ts" "$output_file"
    # [FINAL] use-image-crop — required by step-media.tsx & image-crop-modal.tsx
    # (useImageCrop, CROP_ASPECT, CropAspect, AspectChoice)
    collect_file "$SRC_DIR/hooks/shared/use-image-crop.ts" "$output_file"
    # [FINAL v2] use-media-query — useIsMobile(), required by product-preview-drawer.tsx
    # to pick drawer direction (bottom sheet on mobile vs right panel on desktop).
    # Was called out in a code comment in the previous revision but never actually
    # added to the collect_file calls below — confirmed missing on audit.
    collect_file "$SRC_DIR/hooks/shared/use-media-query.ts" "$output_file"
    collect_file "$SRC_DIR/lib/shared/cloudinary.ts" "$output_file"
    collect_file "$SRC_DIR/types/cloudinary.ts" "$output_file"

    # ── 12. UTILITIES ──────────────────────────────────────────────
    section_header "12. 📐 UTILITIES" "$output_file"

    collect_file "$SRC_DIR/lib/shared/product-utils.ts" "$output_file"
    collect_file "$SRC_DIR/lib/shared/format.ts" "$output_file"
    collect_file "$SRC_DIR/lib/shared/query-keys.ts" "$output_file"
    # [FINAL] cn() — used by virtually every component in this collection
    collect_file "$SRC_DIR/lib/shared/utils.ts" "$output_file"
    # [FINAL] FEATURES.digitalProducts — gates step-upload, kyc-banner,
    # storage-usage-bar, product.tsx's showFileStep logic, and several hooks
    collect_file "$SRC_DIR/lib/config/features.ts" "$output_file"

    # ── 13. CONSTANTS ──────────────────────────────────────────────
    section_header "13. 📋 CONSTANTS" "$output_file"

    collect_file "$SRC_DIR/lib/constants/shared/categories.ts" "$output_file"
    collect_file "$SRC_DIR/lib/constants/shared/constants.ts" "$output_file"

    # ── 14. SUBSCRIPTION PLAN (Tier) ────────────────────────────────
    section_header "14. 💳 SUBSCRIPTION PLAN (Tier)" "$output_file"

    collect_file "$SRC_DIR/hooks/dashboard/use-subscription-plan.ts" "$output_file"
    collect_file "$SRC_DIR/lib/constants/dashboard/pricing.ts" "$output_file"
    # [FINAL] SubscriptionTier type + subscriptionApi — imported by
    # use-subscription-plan.ts and step-media.tsx
    collect_file "$SRC_DIR/lib/api/subscription.ts" "$output_file"

    # ── 15. AUTH / TENANT STATE ─────────────────────────────────────
    section_header "15. 👤 AUTH / TENANT STORE" "$output_file"

    # [FINAL] useAuthStore — kyc-banner.tsx reads tenant.isEduMode from here
    # to hide the KYC banner entirely for EDU sellers
    collect_file "$SRC_DIR/stores/auth-store.ts" "$output_file"
    # [FINAL v2] Tenant type — auth-store.ts imports { Tenant } from here
    collect_file "$SRC_DIR/types/tenant.ts" "$output_file"
    # [FINAL v3] TenantLandingConfig — tenant.ts imports this from './landing'
    # for the Tenant.landingConfig field. tenant.ts does not compile without it.
    collect_file "$SRC_DIR/types/landing.ts" "$output_file"

    # ── 16. BASE TYPES ────────────────────────────────────────────
    section_header "16. 📐 BASE API TYPES" "$output_file"

    # [FINAL v2] ApiError, PaginatedResponse — imported by lib/api/client.ts
    # and lib/api/products.ts. Without this, the API layer's response
    # shapes and error handling contract are incomplete.
    collect_file "$SRC_DIR/types/api.ts" "$output_file"
    # [FINAL v2] getCsrfToken, refreshCsrfToken, clearCsrfToken, CSRF_HEADER —
    # lib/api/client.ts imports these directly for CSRF-protected mutations
    # (POST/PATCH/PUT/DELETE). client.ts is not functionally complete without it.
    collect_file "$SRC_DIR/lib/api/csrf.ts" "$output_file"

    # ── 17. UPGRADE / PAYMENT FLOW ───────────────────────────────────
    section_header "17. 💰 UPGRADE PAYMENT FLOW" "$output_file"

    # [FINAL v2] PaymentMethodDialog — upgrade-modal.tsx opens this after
    # the upgrade modal closes, to let the seller choose card vs QRIS (Tripay).
    # Part of the product form's tier-upgrade path (StepMedia -> UpgradeModal).
    collect_file "$SRC_DIR/components/dashboard/subscription/payment-method-dialog.tsx" "$output_file"
    # [FINAL v3] useTripayCheckout — payment-method-dialog.tsx's QRIS button
    # calls startCheckout/resetIntent/isLoading directly from this hook.
    # Without it, the dialog we just added to complete the upgrade flow is
    # itself incomplete — same reason it was added in the first place.
    collect_file "$SRC_DIR/hooks/dashboard/use-tripay-checkout.ts" "$output_file"

    # ── 18. FEATURE-FLAG FALLBACK UI ─────────────────────────────────
    section_header "18. 🚧 FEATURE-FLAG FALLBACK UI" "$output_file"

    # [FINAL v2] ComingSoonPage — rendered by downloads/page.tsx when
    # FEATURES.digitalProducts is false. Same flag gates step-upload,
    # kyc-banner, and storage-usage-bar, so this fallback UI is part of
    # the same feature-flag story running through the whole CRUD flow.
    collect_file "$SRC_DIR/components/shared/coming-soon-page.tsx" "$output_file"

    # ── SUMMARY ──────────────────────────────────────────────────
    local pct=0
    [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))

    local color=$GREEN
    [ $MISSING -gt 0 ] && color=$RED
    [ $FOUND -eq 0 ] && color=$RED

    echo ""
    echo -e "${color}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${color}║  PRODUCT CRUD — SUMMARY                           ║${NC}"
    echo -e "${color}╠════════════════════════════════════════════════════╣${NC}"
    printf "${color}║  ✓ Found   : %-3d / %-3d                             ║${NC}\n" "$FOUND" "$TOTAL"
    printf "${color}║  ✗ Missing : %-3d                                    ║${NC}\n" "$MISSING"
    printf "${color}║  Coverage  : %-3d%%                                  ║${NC}\n" "$pct"
    echo -e "${color}╚════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${YELLOW}📋 CRUD OPERATIONS COVERAGE:${NC}"
    echo -e "  ${GREEN}✓${NC} READ    - Product list, grid, preview drawer, download history"
    echo -e "  ${GREEN}✓${NC} CREATE  - New product form + upload wizard"
    echo -e "  ${GREEN}✓${NC} UPDATE  - Edit product form"
    echo -e "  ${GREEN}✓${NC} DELETE  - Delete dialog"
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
        echo ""
        echo "## CRUD OPERATIONS COVERAGE"
        echo "READ    - Product list, grid, preview drawer, download history"
        echo "CREATE  - New product form + upload wizard"
        echo "UPDATE  - Edit product form"
        echo "DELETE  - Delete dialog"
        echo ""
        echo "## FILE COUNT BY CATEGORY"
        echo "READ (List & Grid)         : 5"
        echo "READ (Download History)    : 3"
        echo "CREATE (New Form)          : 9"
        echo "UPDATE (Edit Form)         : 1"
        echo "DELETE (Dialog)            : 1"
        echo "Hooks                      : 1"
        echo "API                        : 2"
        echo "Types                      : 1"
        echo "Validations                : 1"
        echo "Shared Components          : 6"
        echo "UI Components              : 5"
        echo "Cloudinary                 : 4"
        echo "Utilities                  : 5"
        echo "Constants                  : 2"
        echo "Subscription               : 3"
        echo "Auth / Tenant Store        : 2"
        echo "Base API Types             : 2"
        echo "Upgrade Payment Flow       : 1"
        echo "Feature-Flag Fallback UI   : 1"
        echo ""
        echo "## [FINAL] DEPENDENCIES ADDED IN PREVIOUS REVISION"
        echo "- app/.../products/downloads/page.tsx + client.tsx  (READ — download history page)"
        echo "- components/dashboard/product/download-history-table.tsx (READ — table UI)"
        echo "- lib/api/client.ts             (base api client — products.ts depends on it)"
        echo "- hooks/shared/use-image-crop.ts (useImageCrop, CROP_ASPECT — step-media.tsx, image-crop-modal.tsx)"
        echo "- lib/shared/utils.ts           (cn() — used almost everywhere)"
        echo "- lib/config/features.ts        (FEATURES.digitalProducts — gates multiple components)"
        echo "- lib/api/subscription.ts       (SubscriptionTier, subscriptionApi)"
        echo "- stores/auth-store.ts          (useAuthStore — kyc-banner.tsx EDU-mode check)"
        echo ""
        echo "## [FINAL v2] DEPENDENCIES ADDED AFTER IMPORT-LEVEL AUDIT"
        echo "- hooks/shared/use-media-query.ts   (useIsMobile — product-preview-drawer.tsx drawer direction)"
        echo "- types/tenant.ts                   (Tenant type — auth-store.ts)"
        echo "- types/api.ts                      (ApiError, PaginatedResponse — client.ts, products.ts)"
        echo "- lib/api/csrf.ts                   (CSRF token helpers — client.ts)"
        echo "- components/dashboard/subscription/payment-method-dialog.tsx (upgrade-modal.tsx's payment flow)"
        echo "- components/shared/coming-soon-page.tsx (FEATURES.digitalProducts fallback — downloads/page.tsx)"
    } >> "$output_file"

    [ $MISSING -gt 0 ] && exit 1
    exit 0
}

main "$@"