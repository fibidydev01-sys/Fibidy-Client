#!/bin/bash

SRC="./src"
OUT="collections"
mkdir -p "$OUT"

# ================================================================
# HELPERS
# ================================================================

cf() {
    local f=$1
    [ -f "$f" ] || { echo "  ⚠ NOT FOUND: $f"; return; }
    local rel="${f#./}"
    local lines=$(wc -l < "$f")
    echo "================================================" >> "$FILE"
    echo "FILE: $rel"                                        >> "$FILE"
    echo "Lines: $lines"                                     >> "$FILE"
    echo "================================================" >> "$FILE"
    echo ""                                                  >> "$FILE"
    cat "$f"                                                 >> "$FILE"
    printf "\n\n"                                            >> "$FILE"
    echo "  ✓ $rel ($lines)"
}

cfolder() {
    local dir=$1
    [ -d "$dir" ] || { echo "  ⚠ NOT FOUND: $dir"; return; }
    local count=0
    while IFS= read -r -d '' f; do
        cf "$f"
        ((count++))
    done < <(find "$dir" -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | sort -z)
    echo "  → $count files dari $dir"
}

cfolder_r() {
    local dir=$1
    [ -d "$dir" ] || { echo "  ⚠ NOT FOUND: $dir"; return; }
    local count=0
    while IFS= read -r -d '' f; do
        cf "$f"
        ((count++))
    done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | sort -z)
    echo "  → $count files dari $dir"
}

sec() {
    printf "\n################################################################\n##  %s\n################################################################\n\n" "$1" >> "$FILE"
    echo "▶ $1"
}

init_file() {
    FILE="$OUT/$1-$(date '+%Y%m%d-%H%M%S').txt"
    printf "################################################################\n##  %s\n##  Generated: %s\n################################################################\n\n" "$1" "$(date '+%Y-%m-%d %H:%M:%S')" > "$FILE"
}

done_msg() {
    echo ""
    echo "✅ $FILE"
    echo "   Files : $(grep -c '^FILE:' "$FILE")"
    echo "   Size  : $(du -h "$FILE" | cut -f1)"
}

# ================================================================
# FEATURES
# ================================================================

# ── 1. API ──────────────────────────────────────────────────────
feat_api() {
    init_file "LIB-API"
    sec "LIB — API"
    cfolder "$SRC/lib/api"
    done_msg
}

# ── 2. SHARED ───────────────────────────────────────────────────
feat_shared() {
    init_file "LIB-SHARED"
    sec "LIB — Shared"
    cfolder "$SRC/lib/shared"
    done_msg
}

# ── 3. CONSTANTS ────────────────────────────────────────────────
feat_constants() {
    init_file "LIB-CONSTANTS"
    sec "CONSTANTS — Shared"
    cfolder "$SRC/lib/constants/shared"
    sec "CONSTANTS — Index"
    cf "$SRC/lib/constants/index.ts"
    done_msg
}

# ── 4. PROVIDERS ────────────────────────────────────────────────
feat_providers() {
    init_file "LIB-PROVIDERS"
    sec "PROVIDERS"
    cfolder "$SRC/lib/providers"
    done_msg
}

# ── 5. PUBLIC ───────────────────────────────────────────────────
feat_public() {
    init_file "LIB-PUBLIC"
    sec "PUBLIC"
    cfolder "$SRC/lib/public"
    done_msg
}

# ── 6. LIB INDEX ────────────────────────────────────────────────
feat_lib_index() {
    init_file "LIB-INDEX"
    sec "LIB — Root Index"
    cf "$SRC/lib/index.ts"
    done_msg
}

# ── 7. SEMUA LIB ────────────────────────────────────────────────
feat_all() {
    init_file "LIB-ALL"

    sec "LIB — API"
    cfolder "$SRC/lib/api"

    sec "LIB — Shared"
    cfolder "$SRC/lib/shared"

    sec "LIB — Constants (Shared)"
    cfolder "$SRC/lib/constants/shared"

    sec "LIB — Constants Index"
    cf "$SRC/lib/constants/index.ts"

    sec "LIB — Providers"
    cfolder "$SRC/lib/providers"

    sec "LIB — Public"
    cfolder "$SRC/lib/public"

    sec "LIB — Root Index"
    cf "$SRC/lib/index.ts"

    done_msg
}

# ================================================================
# MENU
# ================================================================

show_menu() {
    clear
    echo "================================================================"
    echo "  CLIENT — LIB COLLECTION"
    echo "  Scope: src/lib/"
    echo "================================================================"
    echo ""
    echo "  Struktur:"
    echo "  src/lib/"
    echo "  ├── api/          → client, auth, products, tenants, admin..."
    echo "  ├── constants/    → shared/ (categories, seo, site...)"
    echo "  ├── providers/    → hydration, theme, toast"
    echo "  ├── public/       → og-utils, store-url"
    echo "  ├── shared/       → format, utils, schema, validations..."
    echo "  └── index.ts"
    echo ""
    echo "  1) API            (lib/api/)"
    echo "  2) Shared         (lib/shared/)"
    echo "  3) Constants      (lib/constants/)"
    echo "  4) Providers      (lib/providers/)"
    echo "  5) Public         (lib/public/)"
    echo "  6) Lib Index      (lib/index.ts)"
    echo ""
    echo "  all) Semua lib sekaligus"
    echo "  0)   Exit"
    echo "================================================================"
    echo ""
}

run_choice() {
    case $1 in
        1) feat_api ;;
        2) feat_shared ;;
        3) feat_constants ;;
        4) feat_providers ;;
        5) feat_public ;;
        6) feat_lib_index ;;
        *) echo "  ⚠ Unknown: $1" ;;
    esac
}

while true; do
    show_menu
    read -rp "Pilih: " choices
    [ "$choices" = "0" ] && echo "Bye!" && exit 0
    [ -z "$choices" ] && continue

    if [ "$choices" = "all" ]; then
        feat_all
    else
        for c in $choices; do run_choice "$c"; done
    fi

    echo ""
    read -rp "Enter untuk kembali ke menu..."
done