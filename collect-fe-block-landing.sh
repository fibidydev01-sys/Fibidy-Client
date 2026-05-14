#!/usr/bin/env bash
###############################################################################
# collect-storefront-dev.sh  (v6 — Post Landing Refactor)
#
# Scope: Settings (write) ↔ Studio (preview/publish) ↔ Store (render)
#        + Prisma schema + Server DTO/service/validator
#
# What changed vs v5 (May 2026 nuclear landing refactor):
#   - components/dashboard/blocks/       → components/dashboard/landing/
#   - components/dashboard/settings/hero → components/dashboard/settings/landing
#   - settings/form/hero/                → settings/form/landing/
#   - stores/use-builder-store.ts        → hooks/dashboard/use-builder-store.ts
#   - server/src/validator/              → server/src/validators/  (plural)
#   - Dropped: prisma/migrations/*.sql   (nuclear reset, no migration files)
#   - New file: components/dashboard/landing/block-loading-fallback.tsx
#
# USAGE:
#   # Dari railway/client:
#   ./collect-storefront-dev.sh
#
#   # Custom roots:
#   SRC_ROOT=./src \
#   MSG_ROOT=./messages \
#   SERVER_ROOT=../server/src \
#   PRISMA_ROOT=../prisma \
#     ./collect-storefront-dev.sh
###############################################################################

SRC_ROOT="${SRC_ROOT:-./src}"
MSG_ROOT="${MSG_ROOT:-./messages}"
SERVER_ROOT="${SERVER_ROOT:-../server/src}"
PRISMA_ROOT="${PRISMA_ROOT:-../prisma}"
OUT_DIR="${OUT_DIR:-./_collect-fe}"

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
OUT_FILE="$OUT_DIR/fe-sot-audit-${TIMESTAMP}.txt"
MANIFEST="$OUT_DIR/manifest-${TIMESTAMP}.txt"
MISSING="$OUT_DIR/missing-${TIMESTAMP}.txt"

if [[ ! -d "$SRC_ROOT" ]]; then
  echo "✗ SRC_ROOT tidak ditemukan: $SRC_ROOT"
  echo "  jalankan dari railway/client/ atau set SRC_ROOT="
  exit 1
fi

mkdir -p "$OUT_DIR"
: > "$OUT_FILE"
: > "$MANIFEST"
: > "$MISSING"

section() {
  local title="$1"
  { echo ""; echo "################################################################################"; echo "## $title"; echo "################################################################################"; } >> "$OUT_FILE"
  { echo ""; echo "## $title"; } >> "$MANIFEST"
}

dump_file() {
  local rel="$1"
  local abs="$SRC_ROOT/$rel"
  if [[ -f "$abs" ]]; then
    local lines; lines=$(wc -l < "$abs" 2>/dev/null || echo 0)
    { echo ""; echo "── FILE: $rel ($lines lines) ───────────────────────────────────────────────"; echo ""; cat "$abs"; echo ""; } >> "$OUT_FILE"
    echo "  ✓ $rel" >> "$MANIFEST"
  else
    echo "  ✗ $rel  (MISSING)" >> "$MANIFEST"
    echo "$rel" >> "$MISSING"
  fi
}

dump_msg() {
  local rel="$1"
  local abs="$MSG_ROOT/$rel"
  if [[ -f "$abs" ]]; then
    local lines; lines=$(wc -l < "$abs" 2>/dev/null || echo 0)
    { echo ""; echo "── FILE: messages/$rel ($lines lines) ──────────────────────────────────────"; echo ""; cat "$abs"; echo ""; } >> "$OUT_FILE"
    echo "  ✓ messages/$rel" >> "$MANIFEST"
  else
    echo "  ✗ messages/$rel  (MISSING)" >> "$MANIFEST"
    echo "messages/$rel" >> "$MISSING"
  fi
}

dump_server() {
  local rel="$1"
  local abs="$SERVER_ROOT/$rel"
  if [[ -f "$abs" ]]; then
    local lines; lines=$(wc -l < "$abs" 2>/dev/null || echo 0)
    { echo ""; echo "── FILE: server/src/$rel ($lines lines) ────────────────────────────────────"; echo ""; cat "$abs"; echo ""; } >> "$OUT_FILE"
    echo "  ✓ server/src/$rel" >> "$MANIFEST"
  else
    echo "  ✗ server/src/$rel  (MISSING)" >> "$MANIFEST"
    echo "server/src/$rel" >> "$MISSING"
  fi
}

dump_prisma() {
  local rel="$1"
  local abs="$PRISMA_ROOT/$rel"
  if [[ -f "$abs" ]]; then
    local lines; lines=$(wc -l < "$abs" 2>/dev/null || echo 0)
    { echo ""; echo "── FILE: prisma/$rel ($lines lines) ────────────────────────────────────────"; echo ""; cat "$abs"; echo ""; } >> "$OUT_FILE"
    echo "  ✓ prisma/$rel" >> "$MANIFEST"
  else
    echo "  ✗ prisma/$rel  (MISSING)" >> "$MANIFEST"
    echo "prisma/$rel" >> "$MISSING"
  fi
}

# ── HEADER ────────────────────────────────────────────────────────────────────
cat >> "$OUT_FILE" << HEADER
================================================================================
Full Stack SoT Audit — Storefront Dev (v6 — post landing refactor)
Generated : $(date '+%Y-%m-%d %H:%M:%S')

SCOPE: Settings (write) ↔ Studio (preview/publish) ↔ Store (render)
       + Prisma schema + Server DTO/service/validator

READ ORDER:
   CLIENT
    0. TYPES          — PublicTenant, BlockId, TenantLandingConfig
    1. API            — tenantsApi + client + server-headers
    2. STORE ROOT     — store/[slug] layout + page
    3. STORE LAYOUT   — header/footer/breadcrumb/not-found/skeleton
    4. LANDING        — dispatcher + block1/2/3 + loading fallback
    5. STUDIO         — block-drawer, live-preview, publish
    6. SETTINGS       — landing/about/contact/social/password/language
    7. SETTINGS FORM  — wizard steps (actual field inputs)
    8. SHARED         — image-slot, wizard-nav, step-wizard, upgrade-modal
    9. DASH PAGES     — settings + studio wrappers
   10. HOOKS          — use-tenant, use-landing-config, use-builder-store,
                        use-cloudinary-upload, use-nav-guard, use-subscription-plan
   11. STORES         — auth-store only (builder store moved to hooks/)
   12. THEME          — colors.ts + theme-colors + landing.constants
   13. URLS           — store-url helpers
   14. TRANSLATIONS   — en/id: store, studio, settings, dashboard, common

   SERVER
   15. PRISMA         — schema.prisma (nuclear reset: no migration SQL)
   16. VALIDATORS     — landing-config.validator.ts (AJV) [validators/ plural]
   17. TENANTS        — update-tenant.dto.ts + tenants.service.ts

WHAT'S NO LONGER COLLECTED (deleted in refactor):
   - components/dashboard/blocks/*        (renamed to landing/)
   - components/dashboard/settings/hero.tsx              (renamed to landing.tsx)
   - components/dashboard/settings/form/hero/*           (renamed to form/landing/)
   - stores/use-builder-store.ts          (moved to hooks/dashboard/)
   - components/marketing/marketing-header-bak.tsx       (orphan deleted)
   - prisma/migrations/*.sql              (nuclear reset, no migrations)
================================================================================
HEADER

echo "▶ SRC_ROOT    = $SRC_ROOT"
echo "▶ MSG_ROOT    = $MSG_ROOT"
echo "▶ SERVER_ROOT = $SERVER_ROOT"
echo "▶ PRISMA_ROOT = $PRISMA_ROOT"
echo "▶ OUT         = $OUT_FILE"
echo ""

# ═══ 0. TYPES ═════════════════════════════════════════════════════════════════
section "0. TYPES — field contract SoT"
dump_file "types/tenant.ts"
dump_file "types/landing.ts"
dump_file "types/api.ts"
dump_file "types/cloudinary.ts"

# ═══ 1. API ═══════════════════════════════════════════════════════════════════
section "1. API — tenantsApi + client"
dump_file "lib/api/tenants.ts"
dump_file "lib/api/client.ts"
dump_file "lib/api/server-headers.ts"

# ═══ 2. STORE ROOT ════════════════════════════════════════════════════════════
section "2. STORE ROOT — landing page (block render consumer)"
dump_file "app/[locale]/store/[slug]/page.tsx"
dump_file "app/[locale]/store/[slug]/layout.tsx"

# ═══ 3. STORE LAYOUT ══════════════════════════════════════════════════════════
section "3. STORE LAYOUT — chrome (read tenant fields)"
dump_file "components/layout/store/store-header.tsx"
dump_file "components/layout/store/store-footer.tsx"
dump_file "components/layout/store/store-breadcrumb.tsx"
dump_file "components/layout/store/store-not-found.tsx"
dump_file "components/layout/store/store-skeleton.tsx"

# ═══ 4. LANDING ═══════════════════════════════════════════════════════════════
# (was section 4 "BLOCKS" in v5 — renamed: blocks/ → landing/)
section "4. LANDING — dispatcher + 3 block variants + loading fallback"
dump_file "components/dashboard/landing/landing.tsx"
dump_file "components/dashboard/landing/block1.tsx"
dump_file "components/dashboard/landing/block2.tsx"
dump_file "components/dashboard/landing/block3.tsx"
dump_file "components/dashboard/landing/block-loading-fallback.tsx"

# ═══ 5. STUDIO ════════════════════════════════════════════════════════════════
section "5. STUDIO — block selector + live preview + publish"
dump_file "components/dashboard/studio/block-options.ts"
dump_file "components/dashboard/studio/block-drawer.tsx"
dump_file "components/dashboard/studio/builder-loading-steps.tsx"
dump_file "components/dashboard/studio/landing-error-boundary.tsx"
dump_file "components/dashboard/studio/live-preview.tsx"
dump_file "components/dashboard/studio/save-status-pill.tsx"

# ═══ 6. SETTINGS — top-level forms ════════════════════════════════════════════
# (was hero.tsx in v5 — renamed to landing.tsx)
section "6. SETTINGS — top-level forms (writers)"
dump_file "components/dashboard/settings/landing.tsx"
dump_file "components/dashboard/settings/about.tsx"
dump_file "components/dashboard/settings/contact.tsx"
dump_file "components/dashboard/settings/social.tsx"
dump_file "components/dashboard/settings/password.tsx"
dump_file "components/dashboard/settings/language.tsx"

# ═══ 7. SETTINGS FORM — wizard steps ══════════════════════════════════════════
# (was form/hero/ in v5 — renamed to form/landing/)
section "7. SETTINGS FORM — wizard steps (field inputs)"
dump_file "components/dashboard/settings/form/landing/step-appearance.tsx"
dump_file "components/dashboard/settings/form/landing/step-identity.tsx"
dump_file "components/dashboard/settings/form/landing/step-story.tsx"
dump_file "components/dashboard/settings/form/about/step-highlights.tsx"
dump_file "components/dashboard/settings/form/contact/step-contact-info.tsx"
dump_file "components/dashboard/settings/form/contact/step-location.tsx"
dump_file "components/dashboard/settings/form/contact/step-section-heading.tsx"
dump_file "components/dashboard/settings/form/social/step-social-links.tsx"

# ═══ 8. SHARED — wizard primitives ════════════════════════════════════════════
section "8. SHARED — wizard + image-slot + upgrade-modal"
dump_file "components/dashboard/shared/image-slot.tsx"
dump_file "components/dashboard/shared/wizard-nav.tsx"
dump_file "components/dashboard/shared/step-wizard.tsx"
dump_file "components/dashboard/shared/upgrade-modal.tsx"
dump_file "components/dashboard/shared/og-image.tsx"

# ═══ 9. DASH PAGES ════════════════════════════════════════════════════════════
section "9. DASH PAGES — settings + studio wrappers"
dump_file "app/[locale]/(dashboard)/dashboard/settings/page.tsx"
dump_file "app/[locale]/(dashboard)/dashboard/settings/client.tsx"
dump_file "app/[locale]/(dashboard)/dashboard/studio/page.tsx"
dump_file "app/[locale]/(dashboard)/layout.tsx"

# ═══ 10. HOOKS ════════════════════════════════════════════════════════════════
# use-builder-store moved here from stores/ in the refactor.
section "10. HOOKS — tenant, landing config, builder, upload, nav-guard, subscription"
dump_file "hooks/shared/use-tenant.ts"
dump_file "hooks/shared/use-nav-guard.ts"
dump_file "hooks/shared/use-cloudinary-upload.ts"
dump_file "hooks/dashboard/use-landing-config.ts"
dump_file "hooks/dashboard/use-builder-store.ts"
dump_file "hooks/dashboard/use-subscription-plan.ts"

# ═══ 11. STORES ═══════════════════════════════════════════════════════════════
# Only auth-store now. Builder store moved to hooks/dashboard/.
section "11. STORES — auth only (builder moved to hooks/)"
dump_file "stores/auth-store.ts"

# ═══ 12. THEME ════════════════════════════════════════════════════════════════
section "12. THEME — CSS injection + palette + landing constants"
dump_file "lib/shared/colors.ts"
dump_file "lib/constants/shared/theme-colors.ts"
dump_file "lib/constants/shared/landing.constants.ts"

# ═══ 13. URLS ═════════════════════════════════════════════════════════════════
section "13. URLS — store URL helpers"
dump_file "lib/public/store-url.ts"
dump_file "lib/public/use-store-urls.ts"

# ═══ 14. TRANSLATIONS ═════════════════════════════════════════════════════════
section "14. TRANSLATIONS — en/id (store, studio, settings, dashboard, common)"
dump_msg "en/store.json"
dump_msg "id/store.json"
dump_msg "en/studio.json"
dump_msg "id/studio.json"
dump_msg "en/settings.json"
dump_msg "id/settings.json"
dump_msg "en/dashboard.json"
dump_msg "id/dashboard.json"
dump_msg "en/common.json"
dump_msg "id/common.json"

# ═══ 15. PRISMA ═══════════════════════════════════════════════════════════════
# Nuclear reset — no migration SQL files anymore.
section "15. PRISMA — schema only (no migrations after nuclear reset)"
dump_prisma "schema.prisma"

# ═══ 16. SERVER · VALIDATORS ══════════════════════════════════════════════════
# Folder name is "validators/" (plural) — project convention.
section "16. SERVER · VALIDATORS — AJV landingConfig"
dump_server "validators/landing-config.validator.ts"

# ═══ 17. SERVER · TENANTS ═════════════════════════════════════════════════════
section "17. SERVER · TENANTS — DTO + service"
dump_server "tenants/dto/update-tenant.dto.ts"
dump_server "tenants/tenants.service.ts"

# ── FOOTER ────────────────────────────────────────────────────────────────────
{ echo ""; echo "################################################################################"; echo "## END OF COLLECTION (Full Stack SoT Audit v6)"; echo "################################################################################"; } >> "$OUT_FILE"

collected=$(grep -c "^── FILE:" "$OUT_FILE" 2>/dev/null || echo 0)
missing_count=$(wc -l < "$MISSING" | tr -d ' ')

echo "─────────────────────────────────────────────────────────────"
echo "  ✓ Collected : $collected files"
echo "  ✗ Missing   : $missing_count entries"
echo "─────────────────────────────────────────────────────────────"

if [[ "$missing_count" -gt 0 ]]; then
  echo ""
  echo "  File missing:"
  while IFS= read -r line; do echo "    ✗ $line"; done < "$MISSING"
fi

echo ""
echo "Output:"
echo "  → $OUT_FILE"
echo "  → $MANIFEST"
echo "  → $MISSING"