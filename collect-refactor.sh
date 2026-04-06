#!/bin/bash

# ================================================================
# COLLECT EDIT-PRODUCT FLOW
# Full flow: EditProductPage → EditProductClient → ProductForm
# ================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

SRC="./src"
OUT="collections"
mkdir -p "$OUT"
OUTPUT_FILE="$OUT/EDIT-PRODUCT-FLOW-$(date '+%Y%m%d-%H%M%S').txt"

if [ ! -d "$SRC" ]; then
  echo -e "  ${YELLOW}⚠ Directory tidak ditemukan: ${SRC}${NC}"
  echo -e "  Jalankan dari root project (sejajar folder src/)"
  exit 1
fi

# ================================================================
# TARGET FILES
# Format: "GRUP|LABEL|PATH"
# ================================================================

TARGETS=(
  # ── ROUTE ENTRY POINT ────────────────────────────────────────
  "ROUTE|page.tsx|app/(dashboard)/dashboard/products/[id]/edit/page.tsx"
  "ROUTE|client.tsx|app/(dashboard)/dashboard/products/[id]/edit/client.tsx"

  # ── PRODUCT FORM (WIZARD) ────────────────────────────────────
  "FORM|product.tsx|components/dashboard/product/form/product.tsx"
  "FORM|step-details.tsx|components/dashboard/product/form/step-details.tsx"
  "FORM|step-media.tsx|components/dashboard/product/form/step-media.tsx"
  "FORM|step-preview.tsx|components/dashboard/product/form/step-preview.tsx"
  "FORM|types.ts|components/dashboard/product/form/types.ts"

  # ── SHARED DASHBOARD COMPONENTS ──────────────────────────────
  "SHARED|wizard-nav.tsx|components/dashboard/shared/wizard-nav.tsx"
  "SHARED|step-wizard.tsx|components/dashboard/shared/step-wizard.tsx"
  "SHARED|upgrade-modal.tsx|components/dashboard/shared/upgrade-modal.tsx"
  "SHARED|image-slot.tsx|components/dashboard/shared/image-slot.tsx"

  # ── HOOKS ────────────────────────────────────────────────────
  "HOOK|use-products.ts|hooks/dashboard/use-products.ts"
  "HOOK|use-subscription-plan.ts|hooks/dashboard/use-subscription-plan.ts"
  "HOOK|use-tenant.ts|hooks/shared/use-tenant.ts"
  "HOOK|use-cloudinary-upload.ts|hooks/shared/use-cloudinary-upload.ts"

  # ── API LAYER ────────────────────────────────────────────────
  "API|products.ts|lib/api/products.ts"
  "API|server-headers.ts|lib/api/server-headers.ts"
  "API|client.ts|lib/api/client.ts"
  "API|subscription.ts|lib/api/subscription.ts"

  # ── TYPES ────────────────────────────────────────────────────
  "TYPE|product.ts|types/product.ts"
  "TYPE|api.ts|types/api.ts"
  "TYPE|tenant.ts|types/tenant.ts"

  # ── SHARED UTILS & VALIDATIONS ───────────────────────────────
  "UTIL|validations.ts|lib/shared/validations.ts"
  "UTIL|product-utils.ts|lib/shared/product-utils.ts"
  "UTIL|query-keys.ts|lib/shared/query-keys.ts"

  # ── SUBSCRIPTION PAGE ────────────────────────────────────────
  "SUBSCRIPTION|page.tsx|app/(dashboard)/dashboard/subscription/page.tsx"
  "SUBSCRIPTION|client.tsx|app/(dashboard)/dashboard/subscription/client.tsx"
)

# ================================================================
# HEADER
# ================================================================

echo -e "${BOLD}${BLUE}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║   COLLECT EDIT-PRODUCT FLOW                  ║"
echo "  ║   Full wizard flow — server to client        ║"
echo "  ╚══════════════════════════════════════════════╝"
echo -e "${NC}"

{
  echo "################################################################"
  echo "##  EDIT-PRODUCT FLOW COLLECTION"
  echo "##  Generated : $(date '+%Y-%m-%d %H:%M:%S')"
  echo "##"
  echo "##  Flow:"
  echo "##    EditProductPage (server)"
  echo "##      → getServerHeaders() + productsApi.getById/getCategories"
  echo "##      → EditProductClient (client boundary)"
  echo "##        → ProductForm (wizard)"
  echo "##          → StepDetails / StepMedia / StepPreview"
  echo "##          → WizardNav"
  echo "##          → useCreateProduct / useUpdateProduct"
  echo "##          → useSubscriptionPlan / useTenant"
  echo "################################################################"
  echo ""
} > "$OUTPUT_FILE"

ok_count=0
missing_count=0
current_grup=""

# ================================================================
# PROCESS
# ================================================================

for entry in "${TARGETS[@]}"; do
  IFS='|' read -r grup label rel_path <<< "$entry"
  full_path="$SRC/$rel_path"

  # Cetak header grup kalau berganti
  if [ "$grup" != "$current_grup" ]; then
    current_grup="$grup"
    echo -e "\n  ${BOLD}${BLUE}── ${grup} ──────────────────────────────────${NC}"
    {
      echo ""
      echo "################################################################"
      echo "##  ${grup}"
      echo "################################################################"
      echo ""
    } >> "$OUTPUT_FILE"
  fi

  echo -e "  ${CYAN}${label}${NC}  ${WHITE}${rel_path}${NC}"

  {
    echo "================================================"
    echo "FILE: src/${rel_path}"
    echo "================================================"
    echo ""
  } >> "$OUTPUT_FILE"

  if [ ! -f "$full_path" ]; then
    echo -e "    ${YELLOW}✗ FILE NOT FOUND${NC}"
    {
      echo "  ⚠ FILE NOT FOUND"
      echo ""
    } >> "$OUTPUT_FILE"
    ((missing_count++))
    continue
  fi

  lines=$(wc -l < "$full_path")
  echo -e "    ${GREEN}✓ OK${NC}  (${lines} lines)"

  {
    cat "$full_path"
    echo ""
    echo ""
  } >> "$OUTPUT_FILE"

  ((ok_count++))
done

# ================================================================
# SUMMARY
# ================================================================

{
  echo "################################################################"
  echo "##  SUMMARY"
  echo "##  Collected : ${ok_count} file"
  echo "##  Missing   : ${missing_count} file"
  echo "################################################################"
} >> "$OUTPUT_FILE"

echo ""
echo -e "  ${BLUE}────────────────────────────────────────${NC}"
echo -e "  Collected : ${WHITE}${ok_count}${NC} file"
if [ "$missing_count" -gt 0 ]; then
  echo -e "  Missing   : ${YELLOW}${missing_count}${NC} file tidak ditemukan"
else
  echo -e "  Missing   : ${GREEN}0${NC} — semua ada ✓"
fi
echo -e "\n  ${CYAN}📂 Output → ${OUTPUT_FILE}${NC}\n"