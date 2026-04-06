#!/bin/bash

# ================================================================
# COLLECT APP FILES
# Run from: client/ directory
#   ./collect-app.sh
#
# Collects semua file dalam src/app/
# Skip: favicon.ico, globals.css
# ================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

SRC="./src/app"
OUT="collections"
mkdir -p "$OUT"
OUTPUT_FILE="$OUT/APP-$(date '+%Y%m%d-%H%M%S').txt"

SKIP_FILES=("favicon.ico" "globals.css")

# ================================================================
# HEADER
# ================================================================

echo -e "${BOLD}${BLUE}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║   COLLECT APP FILES                         ║"
echo "  ║   src/app/** (skip favicon & globals.css)   ║"
echo "  ╚══════════════════════════════════════════════╝"
echo -e "${NC}"

{
  echo "################################################################"
  echo "##  APP FILES COLLECTION"
  echo "##  Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "##  Source   : src/app/"
  echo "################################################################"
  echo ""
} > "$OUTPUT_FILE"

file_count=0

# ================================================================
# COLLECT
# ================================================================

while IFS= read -r -d '' file; do
  filename=$(basename "$file")

  # Skip favicon dan globals.css
  skip=false
  for s in "${SKIP_FILES[@]}"; do
    if [ "$filename" == "$s" ]; then
      skip=true
      break
    fi
  done
  [ "$skip" = true ] && continue

  rel="${file#./src/}"

  echo -e "  ${GREEN}✓${NC}  ${WHITE}${rel}${NC}"

  {
    echo "================================================================"
    echo "FILE : ${rel}"
    echo "================================================================"
    cat "$file"
    echo ""
    echo ""
  } >> "$OUTPUT_FILE"

  ((file_count++))

done < <(find "$SRC" -type f -print0 | sort -z)

# ================================================================
# SUMMARY
# ================================================================

{
  echo "################################################################"
  echo "##  SUMMARY"
  echo "##  Collected : ${file_count} files"
  echo "################################################################"
} >> "$OUTPUT_FILE"

echo ""
echo -e "  ${BLUE}────────────────────────────────────────${NC}"
echo -e "  Collected : ${WHITE}${file_count}${NC} files"
echo -e "\n  ${CYAN}📂 ${OUTPUT_FILE}${NC}\n"