#!/bin/bash

# ================================================================
# COLLECT FORM COMPONENTS
# Run from: client/ directory
# Scope: komponen form tersebar di:
#   src/components/auth/
#   src/components/dashboard/product/form/
#   src/components/dashboard/settings/form/
#   src/components/dashboard/shared/
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
OUT="collections"
mkdir -p "$OUT"

# Direktori-direktori yang mengandung form components
AUTH_DIR="$SRC/components/auth"
PRODUCT_FORM_DIR="$SRC/components/dashboard/product/form"
SETTINGS_FORM_DIR="$SRC/components/dashboard/settings/form"
DASHBOARD_SHARED_DIR="$SRC/components/dashboard/shared"

# ================================================================
# HELPER: tulis header file output
# ================================================================

write_header() {
    local output_file="$1"
    local title="$2"
    {
        echo "################################################################"
        echo "##  $title"
        echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "################################################################"
        echo ""
    } > "$output_file"
}

# ================================================================
# HELPER: tambahkan file ke output
# ================================================================

append_file() {
    local file="$1"
    local output_file="$2"
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
}

# ================================================================
# COLLECT: Semua form components
# ================================================================

collect_all() {
    local output_file="$OUT/FORM-ALL-$(date '+%Y%m%d-%H%M%S').txt"
    write_header "$output_file" "FORM COMPONENTS COLLECTION (ALL)"

    echo -e "${BOLD}${BLUE}  Collecting all form components...${NC}\n"

    local file_count=0

    local dirs=(
        "$AUTH_DIR"
        "$PRODUCT_FORM_DIR"
        "$SETTINGS_FORM_DIR"
        "$DASHBOARD_SHARED_DIR"
    )

    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            local label="${dir#$SRC/components/}"
            echo -e "\n  ${MAGENTA}📁 components/${label}/${NC}"
            while IFS= read -r file; do
                append_file "$file" "$output_file"
                ((file_count++))
            done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)
        else
            echo -e "  ${YELLOW}⚠ Tidak ditemukan:${NC} ${dir}"
        fi
    done

    echo ""
    echo -e "${BLUE}  ──────────────────────────────────────────${NC}"
    echo -e "  Total files: ${file_count}"
    echo -e "\n  ${CYAN}📂 $output_file${NC}"
}

# ================================================================
# COLLECT: Per subfolder
# ================================================================

collect_by_folder() {
    # Format: "label|absolute_path"
    local folders=(
        "auth/forgot-password|$AUTH_DIR/forgot-password"
        "auth/login|$AUTH_DIR/login"
        "auth/register|$AUTH_DIR/register"
        "auth (semua)|$AUTH_DIR"
        "dashboard/product/form|$PRODUCT_FORM_DIR"
        "dashboard/settings/form/about|$SETTINGS_FORM_DIR/about"
        "dashboard/settings/form/contact|$SETTINGS_FORM_DIR/contact"
        "dashboard/settings/form/hero|$SETTINGS_FORM_DIR/hero"
        "dashboard/settings/form/social|$SETTINGS_FORM_DIR/social"
        "dashboard/settings/form (semua)|$SETTINGS_FORM_DIR"
        "dashboard/shared|$DASHBOARD_SHARED_DIR"
    )

    echo -e "${BOLD}${BLUE}  Pilih subfolder yang ingin di-collect:${NC}\n"

    for i in "${!folders[@]}"; do
        IFS='|' read -r label _ <<< "${folders[$i]}"
        echo -e "  ${WHITE}$((i+1)))${NC} ${label}"
    done
    echo -e "  ${WHITE}$((${#folders[@]}+1)))${NC} Semua subfolder"
    echo ""
    echo -ne "  ${WHITE}Pilihan (bisa lebih dari satu, pisah spasi, contoh: 1 3): ${NC}"
    read -r choices

    local output_file="$OUT/FORM-FOLDER-$(date '+%Y%m%d-%H%M%S').txt"
    write_header "$output_file" "FORM COMPONENTS COLLECTION (BY FOLDER)"

    local file_count=0

    if echo "$choices" | grep -qw "$((${#folders[@]}+1))"; then
        choices=$(seq 1 ${#folders[@]} | tr '\n' ' ')
    fi

    for choice in $choices; do
        local idx=$((choice - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#folders[@]}" ]; then
            IFS='|' read -r label folder_path <<< "${folders[$idx]}"

            if [ -d "$folder_path" ]; then
                echo -e "\n  ${MAGENTA}📁 ${label}/${NC}"
                while IFS= read -r file; do
                    append_file "$file" "$output_file"
                    ((file_count++))
                done < <(find "$folder_path" -type f \( -name "*.ts" -o -name "*.tsx" \) | sort)
            else
                echo -e "  ${RED}✗ Tidak ditemukan:${NC} ${folder_path}"
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
# COLLECT: File spesifik
# ================================================================

collect_specific() {
    # Format: "label_tampil|path_relatif_dari_SRC"
    local files=(
        # --- auth ---
        "auth/forgot-password/forgot-password.tsx|components/auth/forgot-password/forgot-password.tsx"
        "auth/login/login.tsx|components/auth/login/login.tsx"
        "auth/register/register.tsx|components/auth/register/register.tsx"
        "auth/register/register-nav.tsx|components/auth/register/register-nav.tsx"
        "auth/register/register-step-indicator.tsx|components/auth/register/register-step-indicator.tsx"
        "auth/register/step-account.tsx|components/auth/register/step-account.tsx"
        "auth/register/step-category.tsx|components/auth/register/step-category.tsx"
        "auth/register/step-review.tsx|components/auth/register/step-review.tsx"
        "auth/register/step-store-info.tsx|components/auth/register/step-store-info.tsx"
        "auth/register/step-welcome.tsx|components/auth/register/step-welcome.tsx"
        # --- dashboard/product/form ---
        "dashboard/product/form/product.tsx|components/dashboard/product/form/product.tsx"
        "dashboard/product/form/step-details.tsx|components/dashboard/product/form/step-details.tsx"
        "dashboard/product/form/step-media.tsx|components/dashboard/product/form/step-media.tsx"
        "dashboard/product/form/step-preview.tsx|components/dashboard/product/form/step-preview.tsx"
        "dashboard/product/form/step-upload.tsx|components/dashboard/product/form/step-upload.tsx"
        "dashboard/product/form/types.ts|components/dashboard/product/form/types.ts"
        # --- dashboard/settings/form ---
        "dashboard/settings/form/about/step-highlights.tsx|components/dashboard/settings/form/about/step-highlights.tsx"
        "dashboard/settings/form/contact/step-contact-info.tsx|components/dashboard/settings/form/contact/step-contact-info.tsx"
        "dashboard/settings/form/contact/step-location.tsx|components/dashboard/settings/form/contact/step-location.tsx"
        "dashboard/settings/form/contact/step-section-heading.tsx|components/dashboard/settings/form/contact/step-section-heading.tsx"
        "dashboard/settings/form/hero/step-appearance.tsx|components/dashboard/settings/form/hero/step-appearance.tsx"
        "dashboard/settings/form/hero/step-identity.tsx|components/dashboard/settings/form/hero/step-identity.tsx"
        "dashboard/settings/form/hero/step-story.tsx|components/dashboard/settings/form/hero/step-story.tsx"
        "dashboard/settings/form/social/step-social-links.tsx|components/dashboard/settings/form/social/step-social-links.tsx"
        # --- dashboard/settings (top-level) ---
        "dashboard/settings/about.tsx|components/dashboard/settings/about.tsx"
        "dashboard/settings/contact.tsx|components/dashboard/settings/contact.tsx"
        "dashboard/settings/hero.tsx|components/dashboard/settings/hero.tsx"
        "dashboard/settings/language.tsx|components/dashboard/settings/language.tsx"
        "dashboard/settings/password.tsx|components/dashboard/settings/password.tsx"
        "dashboard/settings/social.tsx|components/dashboard/settings/social.tsx"
        # --- dashboard/shared ---
        "dashboard/shared/step-wizard.tsx|components/dashboard/shared/step-wizard.tsx"
        "dashboard/shared/wizard-nav.tsx|components/dashboard/shared/wizard-nav.tsx"
        "dashboard/shared/image-slot.tsx|components/dashboard/shared/image-slot.tsx"
        "dashboard/shared/upgrade-modal.tsx|components/dashboard/shared/upgrade-modal.tsx"
    )

    echo -e "${BOLD}${BLUE}  Pilih file yang ingin di-collect:${NC}\n"

    for i in "${!files[@]}"; do
        IFS='|' read -r label _ <<< "${files[$i]}"
        echo -e "  ${WHITE}$((i+1)))${NC} ${label}"
    done
    echo -e "  ${WHITE}$((${#files[@]}+1)))${NC} Semua file"
    echo ""
    echo -ne "  ${WHITE}Pilihan (bisa lebih dari satu, pisah spasi, contoh: 1 3): ${NC}"
    read -r choices

    local output_file="$OUT/FORM-SELECTED-$(date '+%Y%m%d-%H%M%S').txt"
    write_header "$output_file" "FORM COMPONENTS COLLECTION (SELECTED)"

    local file_count=0

    if echo "$choices" | grep -qw "$((${#files[@]}+1))"; then
        choices=$(seq 1 ${#files[@]} | tr '\n' ' ')
    fi

    for choice in $choices; do
        local idx=$((choice - 1))
        if [ "$idx" -ge 0 ] && [ "$idx" -lt "${#files[@]}" ]; then
            IFS='|' read -r label rel_path <<< "${files[$idx]}"
            local fpath="$SRC/$rel_path"

            if [ -f "$fpath" ]; then
                echo -e "  ${GREEN}✓${NC} ${WHITE}${label}${NC}"
                {
                    echo "================================================================"
                    echo "FILE: ${rel_path}"
                    echo "================================================================"
                    cat "$fpath"
                    echo ""
                    echo ""
                } >> "$output_file"
                ((file_count++))
            else
                echo -e "  ${RED}✗ Tidak ditemukan:${NC} ${fpath}"
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
    echo -e "${BLUE}║   COLLECT FORM COMPONENTS                                 ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║   Scope:                                                  ║${NC}"
    echo -e "${BLUE}║   • components/auth/                                      ║${NC}"
    echo -e "${BLUE}║   • components/dashboard/product/form/                    ║${NC}"
    echo -e "${BLUE}║   • components/dashboard/settings/form/                   ║${NC}"
    echo -e "${BLUE}║   • components/dashboard/shared/                          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${WHITE}1)${NC} Collect semua file    ${GRAY}→ semua *.ts / *.tsx dari 4 direktori${NC}"
    echo -e "  ${WHITE}2)${NC} Collect per subfolder ${GRAY}→ pilih folder spesifik${NC}"
    echo -e "  ${WHITE}3)${NC} Collect file tertentu ${GRAY}→ pilih file satu per satu${NC}"
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
        echo -e "${RED}ERROR: src/ tidak ditemukan. Jalankan dari direktori client/${NC}"
        exit 1
    fi

    # Cek minimal satu direktori form ada
    local found=0
    for dir in "$AUTH_DIR" "$PRODUCT_FORM_DIR" "$SETTINGS_FORM_DIR" "$DASHBOARD_SHARED_DIR"; do
        [ -d "$dir" ] && found=1 && break
    done

    if [ "$found" -eq 0 ]; then
        echo -e "${RED}ERROR: Tidak ada direktori form yang ditemukan di bawah src/components/${NC}"
        exit 1
    fi

    while true; do
        show_menu
        read -r choice

        case $choice in
            0) echo -e "\n${CYAN}Goodbye!${NC}"; exit 0 ;;
            1) echo ""; collect_all ;;
            2) echo ""; collect_by_folder ;;
            3) echo ""; collect_specific ;;
            *) echo -e "${RED}  Pilihan tidak valid${NC}" ;;
        esac

        echo ""
        read -rp "  Enter untuk kembali ke menu..."
    done
}

main "$@"