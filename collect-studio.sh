#!/bin/bash
# ================================================================
# collect-studio.sh
# Feature: Studio — Landing Page Builder
# Trace: app → components → hooks → stores → lib → types
# Usage: bash collect-studio.sh
# ================================================================

SRC="./src"
MSG="./messages"
OUT="collections"
mkdir -p "$OUT"

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/STUDIO-$TIMESTAMP.txt"

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
printf "##  STUDIO — Landing Page Builder (full trace)\n"                      >> "$FILE"
printf "##  Generated: %s\n"  "$(date '+%Y-%m-%d %H:%M:%S')"                  >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  IMPORT MAP\n"                                                       >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  app/(dashboard)/dashboard/studio/page.tsx\n"                       >> "$FILE"
printf "##    → components/dashboard/studio/builder-header.tsx\n"              >> "$FILE"
printf "##    → components/dashboard/studio/block-drawer.tsx\n"                >> "$FILE"
printf "##        → components/dashboard/studio/block-options.ts\n"            >> "$FILE"
printf "##    → components/dashboard/studio/live-preview.tsx\n"                >> "$FILE"
printf "##        → components/dashboard/blocks/block.tsx\n"                   >> "$FILE"
printf "##            → components/dashboard/blocks/hero1..7.tsx\n"            >> "$FILE"
printf "##    → components/dashboard/studio/full-preview-drawer.tsx\n"         >> "$FILE"
printf "##    → components/dashboard/studio/landing-error-boundary.tsx\n"      >> "$FILE"
printf "##    → components/dashboard/studio/builder-loading-steps.tsx\n"       >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  stores\n"                                                           >> "$FILE"
printf "##    → stores/use-builder-store.ts\n"                                 >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  hooks\n"                                                            >> "$FILE"
printf "##    → hooks/dashboard/use-landing-config.ts\n"                       >> "$FILE"
printf "##    → hooks/shared/use-tenant.ts\n"                                  >> "$FILE"
printf "##    → hooks/shared/use-preview.ts\n"                                 >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  lib\n"                                                              >> "$FILE"
printf "##    → lib/api/tenants.ts\n"                                          >> "$FILE"
printf "##    → lib/api/client.ts\n"                                           >> "$FILE"
printf "##    → lib/shared/colors.ts\n"                                        >> "$FILE"
printf "##    → lib/shared/utils.ts\n"                                         >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  types\n"                                                            >> "$FILE"
printf "##    → types/landing.ts\n"                                            >> "$FILE"
printf "##    → types/tenant.ts\n"                                             >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  i18n\n"                                                             >> "$FILE"
printf "##    → messages/en/studio.json\n"                                     >> "$FILE"
printf "##    → messages/id/studio.json\n"                                     >> "$FILE"
printf "################################################################\n\n"   >> "$FILE"

# ================================================================
# 1. APP — Page
# ================================================================

sec "1. APP — Page"
cf "$SRC/app/[locale]/(dashboard)/dashboard/studio/page.tsx"

# ================================================================
# 2. COMPONENTS — Studio (Builder UI)
# ================================================================

sec "2. COMPONENTS — Studio Builder"
cf "$SRC/components/dashboard/studio/builder-header.tsx"
cf "$SRC/components/dashboard/studio/builder-loading-steps.tsx"
cf "$SRC/components/dashboard/studio/block-drawer.tsx"
cf "$SRC/components/dashboard/studio/block-options.ts"
cf "$SRC/components/dashboard/studio/live-preview.tsx"
cf "$SRC/components/dashboard/studio/full-preview-drawer.tsx"
cf "$SRC/components/dashboard/studio/landing-error-boundary.tsx"

# ================================================================
# 3. COMPONENTS — Blocks (rendered inside live-preview)
# ================================================================

sec "3. COMPONENTS — Blocks"
cf "$SRC/components/dashboard/blocks/block.tsx"
cf "$SRC/components/dashboard/blocks/hero1.tsx"
cf "$SRC/components/dashboard/blocks/hero2.tsx"
cf "$SRC/components/dashboard/blocks/hero3.tsx"
cf "$SRC/components/dashboard/blocks/hero4.tsx"
cf "$SRC/components/dashboard/blocks/hero5.tsx"
cf "$SRC/components/dashboard/blocks/hero6.tsx"
cf "$SRC/components/dashboard/blocks/hero7.tsx"

# ================================================================
# 4. STORES
# ================================================================

sec "4. STORES"
cf "$SRC/stores/use-builder-store.ts"

# ================================================================
# 5. HOOKS
# ================================================================

sec "5. HOOKS"
cf "$SRC/hooks/dashboard/use-landing-config.ts"
cf "$SRC/hooks/shared/use-tenant.ts"
cf "$SRC/hooks/shared/use-preview.ts"

# ================================================================
# 6. LIB — API
# ================================================================

sec "6. LIB — API"
cf "$SRC/lib/api/tenants.ts"
cf "$SRC/lib/api/client.ts"

# ================================================================
# 7. LIB — Shared
# ================================================================

sec "7. LIB — Shared"
cf "$SRC/lib/shared/colors.ts"
cf "$SRC/lib/shared/utils.ts"

# ================================================================
# 8. TYPES
# ================================================================

sec "8. TYPES"
cf "$SRC/types/landing.ts"
cf "$SRC/types/tenant.ts"

# ================================================================
# 9. I18N
# ================================================================

sec "9. I18N — Studio translations"
cf "$MSG/en/studio.json"
cf "$MSG/id/studio.json"

# ================================================================
# Done
# ================================================================

FILE_COUNT=$(grep -c '^FILE:' "$FILE" 2>/dev/null || echo "?")
FILE_SIZE=$(du -h "$FILE" | cut -f1)

echo ""
echo "================================================================"
echo "  ✅  STUDIO collected"
echo "  📄  File  : $FILE"
echo "  📦  Files : $FILE_COUNT"
echo "  💾  Size  : $FILE_SIZE"
echo "================================================================"