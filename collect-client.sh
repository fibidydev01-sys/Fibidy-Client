#!/bin/bash
# ================================================================
# collect.sh — Interactive file collector per layer
# Run from: client root (tempat src/ dan messages/ berada)
# ================================================================

SRC="./src"
MSG="./messages"
OUT="collections"
mkdir -p "$OUT"

# ── Colors ───────────────────────────────────────────────────────
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

# ── Menu ─────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}╔══════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║        FILE COLLECTOR MENU           ║${RESET}"
echo -e "${BOLD}╠══════════════════════════════════════╣${RESET}"
echo -e "${BOLD}║  1.${RESET}  ${CYAN}app/${RESET}                           ${BOLD}║${RESET}"
echo -e "${BOLD}║  2.${RESET}  ${CYAN}lib/${RESET}                           ${BOLD}║${RESET}"
echo -e "${BOLD}║  3.${RESET}  ${CYAN}components/${RESET} ${YELLOW}(skip ui/)${RESET}       ${BOLD}║${RESET}"
echo -e "${BOLD}║  4.${RESET}  ${CYAN}hooks/${RESET}                         ${BOLD}║${RESET}"
echo -e "${BOLD}║  5.${RESET}  ${CYAN}stores/${RESET}                        ${BOLD}║${RESET}"
echo -e "${BOLD}║  6.${RESET}  ${CYAN}types/${RESET}                         ${BOLD}║${RESET}"
echo -e "${BOLD}║  7.${RESET}  ${CYAN}src/ root${RESET}                      ${BOLD}║${RESET}"
echo -e "${BOLD}║  8.${RESET}  ${CYAN}messages/${RESET} ${YELLOW}(i18n JSON)${RESET}        ${BOLD}║${RESET}"
echo -e "${BOLD}║  9.${RESET}  ${CYAN}i18n/${RESET}                          ${BOLD}║${RESET}"
echo -e "${BOLD}║  10.${RESET} ${GREEN}ALL LAYERS${RESET}                     ${BOLD}║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════╝${RESET}"
echo ""
echo -e "${YELLOW}Pilih layer (contoh: 1 atau 1 3 4 atau 10):${RESET} "
read -r INPUT

# ── Helpers ──────────────────────────────────────────────────────
FOUND=0; MISSING=0; TOTAL=0
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-${TIMESTAMP}.txt"

cat > "$FILE" << EOF
################################################################
##  COLLECTION
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##  Selection : $INPUT
################################################################

EOF

cf() {
    local f="$1"
    TOTAL=$((TOTAL + 1))
    { echo ""; echo "================================================"; echo "FILE: ${f#./}"; } >> "$FILE"
    if [ -f "$f" ]; then
        local lines; lines=$(wc -l < "$f" 2>/dev/null || echo "0")
        echo -e "  ${GREEN}✓${RESET} ${f#./} (${lines} lines)"
        FOUND=$((FOUND + 1))
        { echo "Lines: $lines"; echo "================================================"; echo ""; cat "$f"; printf "\n\n"; } >> "$FILE"
    else
        echo -e "  ${RED}✗${RESET} MISSING: ${f#./}"
        MISSING=$((MISSING + 1))
        { echo "STATUS: *** FILE NOT FOUND ***"; echo "================================================"; echo ""; } >> "$FILE"
    fi
}

sec() {
    echo -e "\n${BOLD}▶ $1${RESET}"
    { echo ""; echo "────────────────────────────────────────────────"; echo "##  $1"; echo "────────────────────────────────────────────────"; echo ""; } >> "$FILE"
}

collect_dir() {
    local label="$1"
    local dir="$2"
    local exclude="$3"
    local exts="$4"   # optional: "ts_tsx" (default) or "json"
    sec "$label"
    { echo ""; echo "################################################################"; echo "##  $label"; echo "################################################################"; } >> "$FILE"
    if [ -d "$dir" ]; then
        if [ "$exts" = "json" ]; then
            # collect JSON files
            if [ -n "$exclude" ]; then
                while IFS= read -r -d '' f; do cf "$f"; done < <(find "$dir" -type f -name "*.json" ! -path "$exclude" -print0 | sort -z)
            else
                while IFS= read -r -d '' f; do cf "$f"; done < <(find "$dir" -type f -name "*.json" -print0 | sort -z)
            fi
        else
            # default: collect .ts and .tsx files
            if [ -n "$exclude" ]; then
                while IFS= read -r -d '' f; do cf "$f"; done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "$exclude" -print0 | sort -z)
            else
                while IFS= read -r -d '' f; do cf "$f"; done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | sort -z)
            fi
        fi
    else
        echo -e "  ${RED}⚠ DIR NOT FOUND: $dir${RESET}"
    fi
}

# ── Layer definitions ─────────────────────────────────────────────
run_layer() {
    case "$1" in
        1)  collect_dir "app/"                      "$SRC/app"        ""                    ;;
        2)  collect_dir "lib/"                      "$SRC/lib"        ""                    ;;
        3)  collect_dir "components/ (skip ui/)"    "$SRC/components" "*/components/ui/*"   ;;
        4)  collect_dir "hooks/"                    "$SRC/hooks"      ""                    ;;
        5)  collect_dir "stores/"                   "$SRC/stores"     ""                    ;;
        6)  collect_dir "types/"                    "$SRC/types"      ""                    ;;
        7)  sec "src/ root"
            { echo ""; echo "################################################################"; echo "##  src/ root"; echo "################################################################"; } >> "$FILE"
            while IFS= read -r -d '' f; do cf "$f"; done < <(find "$SRC" -maxdepth 1 -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | sort -z) ;;
        8)  collect_dir "messages/ (i18n JSON)"     "$MSG"            ""                    "json" ;;
        9)  collect_dir "i18n/"                     "$SRC/i18n"       ""                    ;;
        *)  echo -e "  ${RED}⚠ Pilihan tidak valid: $1${RESET}" ;;
    esac
}

# ── Execute ───────────────────────────────────────────────────────
if echo "$INPUT" | grep -qw "10"; then
    for i in 1 2 3 4 5 6 7 8 9; do run_layer $i; done
else
    for i in $INPUT; do run_layer "$i"; done
fi

# ── Summary ───────────────────────────────────────────────────────
pct=0; [ $TOTAL -gt 0 ] && pct=$(( FOUND * 100 / TOTAL ))
echo ""
echo -e "${BOLD}════════════════════════════════════${RESET}"
echo -e "  ${GREEN}✓ Found   : $FOUND / $TOTAL${RESET}"
echo -e "  ${RED}✗ Missing : $MISSING${RESET}"
echo -e "  Coverage  : $pct%"
echo -e "${BOLD}════════════════════════════════════${RESET}"
echo -e "  Output: ${CYAN}$FILE${RESET}"
echo ""

{ echo ""; echo "################################################################"; echo "##  SUMMARY"; echo "################################################################"; echo "Found   : $FOUND / $TOTAL"; echo "Missing : $MISSING"; echo "Coverage: $pct%"; } >> "$FILE"