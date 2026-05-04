#!/bin/bash
# ================================================================
# collect-settings.sh
# Feature: Settings (Toko + Channels)
#   Toko    : Hero · About · Contact
#   Channels: Payment · Shipping · Social
# Trace: app → components → hooks → lib → types → i18n
# Usage: bash collect-settings.sh
# ================================================================

SRC="./src"
MSG="./messages"
OUT="collections"
mkdir -p "$OUT"

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/SETTINGS-$TIMESTAMP.txt"

# ── Helpers ──────────────────────────────────────────────────────

cf() {
    local f=$1
    [ -f "$f" ] || { echo "  ⚠ NOT FOUND: $f"; return; }
    local rel="${f#./}"
    local lines=$(wc -l < "$f")
    printf "\n================================================\n" >> "$FILE"
    printf "FILE: %s\n"    "$rel"                                  >> "$FILE"
    printf "PATH: %s\n"    "$f"                                    >> "$FILE"
    printf "Lines: %s\n"   "$lines"                               >> "$FILE"
    printf "================================================\n\n" >> "$FILE"
    cat "$f"                                                       >> "$FILE"
    printf "\n\n"                                                  >> "$FILE"
    echo "  ✓ $rel ($lines lines)"
}

sec() {
    printf "\n################################################################\n" >> "$FILE"
    printf "##  %s\n"                                              "$1"           >> "$FILE"
    printf "################################################################\n\n"  >> "$FILE"
    echo "▶ $1"
}

# ── Header ───────────────────────────────────────────────────────

printf "################################################################\n"     > "$FILE"
printf "##  SETTINGS — full trace (Toko + Channels)\n"                        >> "$FILE"
printf "##  Generated: %s\n"  "$(date '+%Y-%m-%d %H:%M:%S')"                  >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  ╔══════════════════════════════════════════════════╗\n"            >> "$FILE"
printf "##  ║  PART A — TOKO (Hero · About · Contact)         ║\n"            >> "$FILE"
printf "##  ╚══════════════════════════════════════════════════╝\n"            >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  settings/toko/client.tsx\n"                                        >> "$FILE"
printf "##    → hero-section/hero-section.tsx\n"                               >> "$FILE"
printf "##        → shared/preview-modal.tsx\n"                                >> "$FILE"
printf "##        → shared/auto-save-status.tsx\n"                             >> "$FILE"
printf "##        → shared/step-wizard.tsx\n"                                  >> "$FILE"
printf "##        → step-identity.tsx\n"                                       >> "$FILE"
printf "##        → step-story.tsx\n"                                          >> "$FILE"
printf "##        → step-appearance.tsx\n"                                     >> "$FILE"
printf "##    → about-section/about-section.tsx\n"                             >> "$FILE"
printf "##        → shared/preview-modal.tsx\n"                                >> "$FILE"
printf "##        → step-highlights.tsx\n"                                     >> "$FILE"
printf "##    → contact-section/contact-section.tsx\n"                         >> "$FILE"
printf "##        → shared/preview-modal.tsx\n"                                >> "$FILE"
printf "##        → shared/auto-save-status.tsx\n"                             >> "$FILE"
printf "##        → shared/step-wizard.tsx\n"                                  >> "$FILE"
printf "##        → step-contact-info.tsx\n"                                   >> "$FILE"
printf "##        → step-location.tsx\n"                                       >> "$FILE"
printf "##        → step-section-heading.tsx\n"                                >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  ╔══════════════════════════════════════════════════╗\n"            >> "$FILE"
printf "##  ║  PART B — CHANNELS (Payment · Shipping · Social)║\n"            >> "$FILE"
printf "##  ╚══════════════════════════════════════════════════╝\n"            >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  settings/channels/client.tsx\n"                                    >> "$FILE"
printf "##    → pembayaran-section/pembayaran-section.tsx\n"                   >> "$FILE"
printf "##        → shared/auto-save-status.tsx\n"                             >> "$FILE"
printf "##        → shared/step-wizard.tsx\n"                                  >> "$FILE"
printf "##        → step-bank.tsx\n"                                           >> "$FILE"
printf "##        → step-ewallet.tsx\n"                                        >> "$FILE"
printf "##        → step-cod.tsx\n"                                            >> "$FILE"
printf "##        → bank-account-dialog.tsx\n"                                 >> "$FILE"
printf "##        → ewallet-dialog.tsx\n"                                      >> "$FILE"
printf "##        → payment-preview.tsx\n"                                     >> "$FILE"
printf "##            → shared/preview-modal.tsx\n"                            >> "$FILE"
printf "##    → pengiriman-section/pengiriman-section.tsx\n"                   >> "$FILE"
printf "##        → shared/auto-save-status.tsx\n"                             >> "$FILE"
printf "##        → step-carriers.tsx\n"                                       >> "$FILE"
printf "##        → step-preview.tsx\n"                                        >> "$FILE"
printf "##            → shared/preview-modal.tsx\n"                            >> "$FILE"
printf "##    → social-section/social-section.tsx\n"                           >> "$FILE"
printf "##        → shared/auto-save-status.tsx\n"                             >> "$FILE"
printf "##        → shared/preview-modal.tsx\n"                                >> "$FILE"
printf "##        → step-social-links.tsx\n"                                   >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  ╔══════════════════════════════════════════════════╗\n"            >> "$FILE"
printf "##  ║  SHARED (hooks · lib · types · i18n)            ║\n"            >> "$FILE"
printf "##  ╚══════════════════════════════════════════════════╝\n"            >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  hooks/shared/use-tenant.ts\n"                                      >> "$FILE"
printf "##  hooks/dashboard/use-auto-save.ts\n"                                >> "$FILE"
printf "##  lib/api/tenants.ts\n"                                              >> "$FILE"
printf "##  lib/api/client.ts\n"                                               >> "$FILE"
printf "##  lib/shared/colors.ts\n"                                            >> "$FILE"
printf "##  lib/shared/utils.ts\n"                                             >> "$FILE"
printf "##  types/tenant.ts\n"                                                 >> "$FILE"
printf "##  types/api.ts\n"                                                    >> "$FILE"
printf "##  messages/en/settings.json\n"                                       >> "$FILE"
printf "##  messages/id/settings.json\n"                                       >> "$FILE"
printf "################################################################\n\n"   >> "$FILE"

# ================================================================
# PART A — TOKO
# ================================================================

# ----------------------------------------------------------------
# A1. APP — Pages (Toko)
# ----------------------------------------------------------------

sec "A1. APP — Pages (Toko)"
cf "$SRC/app/[locale]/(dashboard)/dashboard/settings/page.tsx"
cf "$SRC/app/[locale]/(dashboard)/dashboard/settings/client.tsx"

# ----------------------------------------------------------------
# A2. COMPONENTS — Hero Section
# ----------------------------------------------------------------

sec "A2. COMPONENTS — Hero Section"
cf "$SRC/components/dashboard/settings/form/hero/step-identity.tsx"
cf "$SRC/components/dashboard/settings/form/hero/step-story.tsx"
cf "$SRC/components/dashboard/settings/form/hero/step-appearance.tsx"
cf "$SRC/components/dashboard/settings/hero.tsx"

# ----------------------------------------------------------------
# A3. COMPONENTS — About Section
# ----------------------------------------------------------------

sec "A3. COMPONENTS — About Section"
cf "$SRC/components/dashboard/settings/about.tsx"
cf "$SRC/components/dashboard/settings/form/about/step-highlights.tsx"

# ----------------------------------------------------------------
# A4. COMPONENTS — Contact Section
# ----------------------------------------------------------------

sec "A4. COMPONENTS — Contact Section"
cf "$SRC/components/dashboard/settings/contact.tsx"
cf "$SRC/components/dashboard/settings/form/contact/step-contact-info.tsx"
cf "$SRC/components/dashboard/settings/form/contact/step-location.tsx"
cf "$SRC/components/dashboard/settings/form/contact/step-section-heading.tsx"

# ----------------------------------------------------------------
# A5. COMPONENTS — Social (Toko side)
# ----------------------------------------------------------------

sec "A5. COMPONENTS — Social Links"
cf "$SRC/components/dashboard/settings/social.tsx"
cf "$SRC/components/dashboard/settings/form/social/step-social-links.tsx"

# ================================================================
# PART B — CHANNELS
# ================================================================

# ----------------------------------------------------------------
# B1. APP — Pages (Channels) — placeholder if separate route exists
# ----------------------------------------------------------------

# (Channels currently lives under the same settings page;
#  add a separate entry below if you later split it out)
# cf "$SRC/app/[locale]/(dashboard)/dashboard/settings/channels/page.tsx"
# cf "$SRC/app/[locale]/(dashboard)/dashboard/settings/channels/client.tsx"

# ----------------------------------------------------------------
# B2. COMPONENTS — Password & Language (misc settings)
# ----------------------------------------------------------------

sec "B2. COMPONENTS — Password & Language"
cf "$SRC/components/dashboard/settings/password.tsx"
cf "$SRC/components/dashboard/settings/language.tsx"

# ================================================================
# SHARED SETTINGS COMPONENTS
# ================================================================

sec "SHARED — Dashboard Shared (Step Wizard · Image Slot · OG Image)"
cf "$SRC/components/dashboard/shared/step-wizard.tsx"
cf "$SRC/components/dashboard/shared/image-slot.tsx"
cf "$SRC/components/dashboard/shared/og-image.tsx"

# ================================================================
# PUBLIC STORE PREVIEW BLOCKS
# ================================================================

sec "PUBLIC STORE — Preview blocks used in settings previews"
cf "$SRC/components/store/about/tenant-about.tsx"
cf "$SRC/components/store/contact/tenant-contact.tsx"

# ================================================================
# HOOKS
# ================================================================

sec "HOOKS"
cf "$SRC/hooks/shared/use-tenant.ts"

# ================================================================
# LIB — API
# ================================================================

sec "LIB — API"
cf "$SRC/lib/api/tenants.ts"
cf "$SRC/lib/api/client.ts"

# ================================================================
# LIB — Shared
# ================================================================

sec "LIB — Shared"
cf "$SRC/lib/shared/colors.ts"
cf "$SRC/lib/shared/utils.ts"
cf "$SRC/lib/shared/schema.ts"
cf "$SRC/lib/shared/validations.ts"

# ================================================================
# TYPES
# ================================================================

sec "TYPES"
cf "$SRC/types/tenant.ts"
cf "$SRC/types/api.ts"

# ================================================================
# I18N — Settings translations
# ================================================================

sec "I18N — Settings translations"
cf "$MSG/en/settings.json"
cf "$MSG/id/settings.json"

# ================================================================
# Done
# ================================================================

FILE_COUNT=$(grep -c '^FILE:' "$FILE" 2>/dev/null || echo "?")
FILE_SIZE=$(du -h "$FILE" | cut -f1)

echo ""
echo "================================================================"
echo "  ✅  SETTINGS collected (Toko + Channels)"
echo "  📄  File  : $FILE"
echo "  📦  Files : $FILE_COUNT"
echo "  💾  Size  : $FILE_SIZE"
echo "================================================================"