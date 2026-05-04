#!/bin/bash
# ================================================================
# collect-stores.sh
# Feature: Global State — Zustand Stores
# Trace: stores → types → hooks (consumers)
# Usage: bash collect-stores.sh
# ================================================================

SRC="./src"
MSG="./messages"
OUT="collections"
mkdir -p "$OUT"

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/STORES-$TIMESTAMP.txt"

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
printf "##  STORES — Global State (Zustand)\n"                                 >> "$FILE"
printf "##  Generated: %s\n"  "$(date '+%Y-%m-%d %H:%M:%S')"                  >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  STORE MAP\n"                                                        >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  stores/\n"                                                          >> "$FILE"
printf "##    ├── auth-store.ts          → session, user, token\n"             >> "$FILE"
printf "##    ├── auth-dialog-store.ts   → login/register modal state\n"       >> "$FILE"
printf "##    ├── admin-store.ts         → admin session state\n"              >> "$FILE"
printf "##    └── use-builder-store.ts   → studio landing page builder\n"      >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  CONSUMERS\n"                                                        >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  auth-store\n"                                                       >> "$FILE"
printf "##    → hooks/auth/use-auth.ts\n"                                      >> "$FILE"
printf "##    → components/layout/auth/auth-guard.tsx\n"                       >> "$FILE"
printf "##    → components/layout/dashboard/dashboard-route-guard.tsx\n"       >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  auth-dialog-store\n"                                                >> "$FILE"
printf "##    → components/user-auth/auth-dialog.tsx\n"                        >> "$FILE"
printf "##    → components/user-auth/dialog-login-form.tsx\n"                  >> "$FILE"
printf "##    → components/user-auth/dialog-register-form.tsx\n"               >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  admin-store\n"                                                      >> "$FILE"
printf "##    → hooks/admin/use-admin.ts\n"                                    >> "$FILE"
printf "##    → components/layout/admin/admin-guard.tsx\n"                     >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  use-builder-store\n"                                                >> "$FILE"
printf "##    → hooks/dashboard/use-landing-config.ts\n"                       >> "$FILE"
printf "##    → components/dashboard/studio/live-preview.tsx\n"                >> "$FILE"
printf "##    → components/dashboard/studio/block-drawer.tsx\n"                >> "$FILE"
printf "##    → components/dashboard/studio/builder-header.tsx\n"              >> "$FILE"
printf "##\n"                                                                   >> "$FILE"
printf "##  types\n"                                                            >> "$FILE"
printf "##    → types/auth.ts\n"                                               >> "$FILE"
printf "##    → types/admin.ts\n"                                              >> "$FILE"
printf "##    → types/landing.ts\n"                                            >> "$FILE"
printf "##    → types/tenant.ts\n"                                             >> "$FILE"
printf "################################################################\n\n"   >> "$FILE"

# ================================================================
# 1. STORES
# ================================================================

sec "1. STORES — Auth"
cf "$SRC/stores/auth-store.ts"
cf "$SRC/stores/auth-dialog-store.ts"

sec "2. STORES — Admin"
cf "$SRC/stores/admin-store.ts"

sec "3. STORES — Builder (Studio)"
cf "$SRC/stores/use-builder-store.ts"

# ================================================================
# 2. TYPES (depended on by stores)
# ================================================================

sec "4. TYPES"
cf "$SRC/types/auth.ts"
cf "$SRC/types/admin.ts"
cf "$SRC/types/landing.ts"
cf "$SRC/types/tenant.ts"

# ================================================================
# 3. HOOK CONSUMERS
# ================================================================

sec "5. HOOKS — Auth consumers"
cf "$SRC/hooks/auth/use-auth.ts"
cf "$SRC/hooks/auth/use-register-wizard.ts"

sec "6. HOOKS — Admin consumers"
cf "$SRC/hooks/admin/use-admin.ts"

sec "7. HOOKS — Builder consumers"
cf "$SRC/hooks/dashboard/use-landing-config.ts"

# ================================================================
# 4. COMPONENT CONSUMERS — Auth guard & dialog
# ================================================================

sec "8. COMPONENTS — Auth guard & layout"
cf "$SRC/components/layout/auth/auth-guard.tsx"
cf "$SRC/components/layout/dashboard/dashboard-route-guard.tsx"
cf "$SRC/components/layout/admin/admin-guard.tsx"

sec "9. COMPONENTS — Auth dialog (auth-dialog-store consumers)"
cf "$SRC/components/user-auth/auth-dialog.tsx"
cf "$SRC/components/user-auth/dialog-login-form.tsx"
cf "$SRC/components/user-auth/dialog-register-form.tsx"

# ================================================================
# 5. LIB — API (used inside stores / hooks)
# ================================================================

sec "10. LIB — API"
cf "$SRC/lib/api/auth.ts"
cf "$SRC/lib/api/client.ts"
cf "$SRC/lib/api/admin-client.ts"

# ================================================================
# Done
# ================================================================

FILE_COUNT=$(grep -c '^FILE:' "$FILE" 2>/dev/null || echo "?")
FILE_SIZE=$(du -h "$FILE" | cut -f1)

echo ""
echo "================================================================"
echo "  ✅  STORES collected"
echo "  📄  File  : $FILE"
echo "  📦  Files : $FILE_COUNT"
echo "  💾  Size  : $FILE_SIZE"
echo "================================================================"