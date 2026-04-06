#!/bin/bash

# ================================================================
# COLLECT STORES
# Run from: client/ directory
# Scope: src/stores/
# ================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
NC='\033[0m'

SRC="./src"
STORES_DIR="$SRC/stores"
OUT="collections"
mkdir -p "$OUT"

# ================================================================
# COLLECT: Semua file dari src/stores/
# ================================================================

collect_all() {
    local output_file="$OUT/STORES-ALL-$(date '+%Y%m%d-%H%M%S').txt"

    echo -e "${BOLD}${BLUE}  Collecting all store files...${NC}\n"

    {
        echo "################################################################"
        echo "##  STORES COLLECTION"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Source: src/stores/"
        echo "################################################################"
        echo ""
    } > "$output_file"

    local file_count=0

    while IFS= read -r file; do
        local rel="${file#$SRC/}"

        echo -e "  ${GREEN}✓${NC} ${WHITE}${rel}${NC}"

        {
            echo "================================================================"
            echo "FILE: ${rel}"
            echo "================================================================"
            cat "$file"
            echo ""
            echo ""
        } >> "$output_file"

        ((file_count++))

    done < <(find "$STORES_DIR" -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)

    echo ""
    echo -e "${BLUE}  ──────────────────────────────────────────${NC}"
    echo -e "  Total files: ${file_count}"
    echo -e "\n  ${CYAN}📂 $output_file${NC}"
}

# ================================================================
# COLLECT: Pilih file spesifik
# ================================================================

collect_specific() {
    local files=(
        "admin-store.ts"
        "auth-store.ts"
        "products-store.ts"
        "use-builder-store.ts"
        "index.ts"
    )

    echo -e "${BOLD}${BLUE}  Pilih file yang ingin di-collect:${NC}\n"

    for i in "${!files[@]}"; do
        echo -e "  ${WHITE}$((i+1)))${NC} ${files[$i]}"
    done
    echo -e "  ${WHITE}$((${#files[@]}+1)))${NC} Semua file"
    echo ""
    echo -ne "  ${WHITE}Pilihan (bisa lebih dari satu, pisah spasi, contoh: 1 3): ${NC}"
    read -r choices

    local output_file="$OUT/STORES-SELECTED-$(date '+%Y%m%d-%H%M%S').txt"

    {
        echo "################################################################"
        echo "##  STORES COLLECTION (SELECTED)"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "##  Source: src/stores/"
        echo "################################################################"
        echo ""
    } > "$output_file"

    local file_count=0

    # Jika pilih "semua"
    if echo "$choices" | grep -qw "$((${#files[@]}+1))"; then
        choices=$(seq 1 ${#files[@]} | tr '\n' ' ')
    fi

    for choice in $choices; do
        local idx=$((choice - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#files[@]}" ]; then
            local fname="${files[$idx]}"
            local fpath="$STORES_DIR/$fname"

            if [ -f "$fpath" ]; then
                echo -e "  ${GREEN}✓${NC} ${WHITE}${fname}${NC}"
                {
                    echo "================================================================"
                    echo "FILE: stores/${fname}"
                    echo "================================================================"
                    cat "$fpath"
                    echo ""
                    echo ""
                } >> "$output_file"
                ((file_count++))
            else
                echo -e "  ${RED}✗ NOT FOUND:${NC} ${fname}"
            fi
        else
            echo -e "  ${RED}✗ Pilihan tidak valid: ${choice}${NC}"
        fi
    done

    echo ""
    echo -e "${BLUE}  ──────────────────────────────────────────${NC}"
    echo -e "  Collected: ${file_count} file(s)"
    echo -e "\n  ${CYAN}📂 $output_file${NC}"
}

# ================================================================
# MENU
# ================================================================

show_menu() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   COLLECT STORES                                          ║${NC}"
    echo -e "${BLUE}║   Scope: src/stores/                                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${WHITE}1)${NC} Collect semua file    ${GRAY}→ semua *.ts / *.tsx di stores/${NC}"
    echo -e "  ${WHITE}2)${NC} Collect file tertentu ${GRAY}→ pilih file yang diinginkan${NC}"
    echo ""
    echo -e "  ${RED}0)${NC} Exit"
    echo ""
    echo -e "  ${GRAY}Jalankan dari client/ (tempat src/ berada)${NC}"
    echo ""
    echo -ne "  ${WHITE}Pilihan: ${NC}"
}

# ================================================================
# MAIN
# ================================================================

main() {
    if [ ! -d "$SRC" ]; then
        echo -e "${RED}ERROR: src/ tidak ditemukan. Jalankan dari client/${NC}"
        exit 1
    fi

    if [ ! -d "$STORES_DIR" ]; then
        echo -e "${RED}ERROR: src/stores/ tidak ditemukan.${NC}"
        exit 1
    fi

    while true; do
        show_menu
        read -r choice

        case $choice in
            0) echo -e "\n${CYAN}Goodbye!${NC}"; exit 0 ;;
            1) echo ""; collect_all ;;
            2) echo ""; collect_specific ;;
            *) echo -e "${RED}  Invalid${NC}" ;;
        esac

        echo ""
        read -rp "  Enter untuk kembali ke menu..."
    done
}

main "$@"