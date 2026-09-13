#!/bin/bash
# collect-seller-files.sh — Client: collect HANYA file yang nyebut "seller"
# Handle .ts, .tsx, .json (messages/)
# Jalankan dari: railway/client/
# Output: collections/seller-files-client.txt

set -euo pipefail

OUT_DIR="collections"
OUT_FILE="$OUT_DIR/seller-files-client.txt"
mkdir -p "$OUT_DIR"

echo "==> Collecting CLIENT files yang nyebut 'seller'..."
echo "    Output: $OUT_FILE"
echo ""

{
  echo "================================================================"
  echo " CLIENT — FILES YANG NYEBUT 'SELLER'"
  echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo " Working dir: $(pwd)"
  echo "================================================================"
  echo ""
  echo "Filter: HANYA file yang mengandung 'seller' (case-insensitive)"
  echo "Scope : src/ + messages/"
  echo ""
} > "$OUT_FILE"

# ── Step 1: Kumpulin file dari src/ ─────────────────────────────
echo "── Scanning src/ ──"
FILES_SRC=$(grep -rli --include="*.ts" --include="*.tsx" \
  "seller" src/ 2>/dev/null | sort)

# ── Step 2: Kumpulin file dari messages/ (i18n) ─────────────────
FILES_MSG=""
if [ -d "messages" ]; then
  echo "── Scanning messages/ ──"
  FILES_MSG=$(grep -rli --include="*.json" \
    "seller" messages/ 2>/dev/null | sort)
fi

# ── Gabungin ────────────────────────────────────────────────────
FILES=$(printf "%s\n%s" "$FILES_SRC" "$FILES_MSG" | grep -v '^$' | sort -u)

if [ -z "$FILES" ]; then
  echo "⚠️  Tidak ada file yang nyebut 'seller'."
  exit 0
fi

TOTAL=$(echo "$FILES" | wc -l)
TOTAL_SRC=$(echo "$FILES_SRC" | grep -c . || echo 0)
TOTAL_MSG=$(echo "$FILES_MSG" | grep -c . || echo 0)

echo "  Ketemu $TOTAL file unik (src: $TOTAL_SRC, messages: $TOTAL_MSG)"
echo ""

# ── Step 3: Tulis daftar file ───────────────────────────────────
{
  echo "================================================================"
  echo " DAFTAR FILE YANG NYEBUT 'SELLER' ($TOTAL file)"
  echo "================================================================"
  echo "── src/ ($TOTAL_SRC file) ──"
  echo "$FILES_SRC" | nl -w2 -s'. '
  echo ""
  if [ -n "$FILES_MSG" ]; then
    echo "── messages/ ($TOTAL_MSG file) ──"
    echo "$FILES_MSG" | nl -w2 -s'. '
    echo ""
  fi
  echo ""
} >> "$OUT_FILE"

# ── Step 4: Dump isi tiap file ──────────────────────────────────
echo "── Dumping file contents ──"
echo "$FILES" | while read -r file; do
  echo "  📄  $file"
  {
    echo ""
    echo "################################################################################"
    echo "## FILE: $file"
    echo "################################################################################"
    cat "$file"
    echo ""
    echo ""
  } >> "$OUT_FILE"
done

echo ""
echo "✅  Selesai!"
echo "    Output      : $OUT_FILE"
echo "    Total file  : $TOTAL"
echo "    Total baris : $(wc -l < "$OUT_FILE")"
echo "    Ukuran file : $(du -sh "$OUT_FILE" | cut -f1)"