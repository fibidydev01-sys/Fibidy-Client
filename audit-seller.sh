#!/usr/bin/env bash
# ============================================================
# audit-seller.sh  —  Audit istilah "SELLER" di project CLIENT
# Taruh di root folder: railway/client/
# Jalankan: bash audit-seller.sh
# Output : audit-seller-client.txt
# ============================================================

set -euo pipefail

OUT="audit-seller-client.txt"
SRC="src"
MSG="messages"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}==> Audit SELLER di CLIENT...${NC}"

if [ ! -d "$SRC" ]; then
  echo "ERROR: folder '$SRC' tidak ditemukan. Jalankan script dari root project client."
  exit 1
fi

{
  echo "# Audit Istilah \"SELLER\" — CLIENT (FE)"
  echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Working dir: $(pwd)"
  echo ""
  echo "============================================================"
  echo "A. ENUM / TIPE / NILAI RUNTIME  (case-sensitive: SELLER)"
  echo "============================================================"
  grep -rn --include="*.ts" --include="*.tsx" \
    -E "['\"]SELLER['\"]" "$SRC" 2>/dev/null || echo "(tidak ada)"
  echo ""

  echo "============================================================"
  echo "B. IDENTIFIER / VARIABEL / KOMPONEN (seller, Seller, SELLER)"
  echo "============================================================"
  grep -rn --include="*.ts" --include="*.tsx" \
    -E "\b(seller|Seller|SELLER)\b" "$SRC" 2>/dev/null \
    | grep -v -E "^\s*//|/\*|\*" || echo "(tidak ada)"
  echo ""

  echo "============================================================"
  echo "C. KOMENTAR YANG NYEBUT SELLER"
  echo "============================================================"
  grep -rn --include="*.ts" --include="*.tsx" \
    -iE "(//|/\*|\*).*seller" "$SRC" 2>/dev/null || echo "(tidak ada)"
  echo ""

  echo "============================================================"
  echo "D. FOLDER / FILE YANG NAMANYA 'seller'"
  echo "============================================================"
  find "$SRC" -iname "*seller*" 2>/dev/null | sort || echo "(tidak ada)"
  echo ""

  echo "============================================================"
  echo "E. IMPORT PATH YANG MENGANDUNG 'seller'"
  echo "============================================================"
  grep -rn --include="*.ts" --include="*.tsx" \
    -E "from ['\"][^'\"]*seller[^'\"]*['\"]" "$SRC" 2>/dev/null || echo "(tidak ada)"
  echo ""

  echo "============================================================"
  echo "F. i18n KEYS — cari 'seller' di messages/*.json"
  echo "============================================================"
  if [ -d "$MSG" ]; then
    grep -rn -i "seller" "$MSG" 2>/dev/null || echo "(tidak ada)"
  else
    echo "(folder '$MSG' tidak ditemukan)"
  fi
  echo ""

  echo "============================================================"
  echo "G. STRING / USER-FACING TEXT YANG NYEBUT SELLER"
  echo "============================================================"
  grep -rn --include="*.ts" --include="*.tsx" \
    -iE "['\"\`][^'\"\`]*seller[^'\"\`]*['\"\`]" "$SRC" 2>/dev/null || echo "(tidak ada)"
  echo ""

  echo "============================================================"
  echo "H. FILE UNIK YANG MENGANDUNG 'seller'"
  echo "============================================================"
  grep -rli --include="*.ts" --include="*.tsx" \
    "seller" "$SRC" 2>/dev/null | sort || echo "(tidak ada)"
  echo ""

  echo "============================================================"
  echo "I. TOTAL HITUNGAN"
  echo "============================================================"
  echo -n "Nilai enum 'SELLER'   : "
  grep -rn --include="*.ts" --include="*.tsx" -E "['\"]SELLER['\"]" "$SRC" 2>/dev/null | wc -l
  echo -n "Kata 'seller' (case-insensitive) : "
  grep -rni --include="*.ts" --include="*.tsx" "seller" "$SRC" 2>/dev/null | wc -l
  echo -n "File unik            : "
  grep -rli --include="*.ts" --include="*.tsx" "seller" "$SRC" 2>/dev/null | wc -l
  echo -n "Folder/file bernama seller : "
  find "$SRC" -iname "*seller*" 2>/dev/null | wc -l

} > "$OUT"

echo -e "${GREEN}✔ Selesai. Output: ${YELLOW}$OUT${NC}"
echo -e "${CYAN}Buka dengan: less $OUT  atau  cat $OUT${NC}"