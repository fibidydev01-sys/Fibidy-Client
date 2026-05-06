#!/bin/bash
# ============================================================
# FONT AUDIT — Find every font reference in the Fibidy codebase
# Run from project root: bash font-audit.sh
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
YEL='\033[1;33m'
GRN='\033[0;32m'
CYN='\033[0;36m'
NC='\033[0m'

# Directories to scan (adjust if needed)
SCAN_DIRS="src messages"
EXCLUDE="node_modules .next dist .git"

# Build grep exclude args
EXCLUDE_ARGS=""
for d in $EXCLUDE; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$d"
done

echo ""
echo "============================================================"
echo -e "${CYN}FONT AUDIT — Fibidy Codebase${NC}"
echo "============================================================"
echo ""

# ─────────────────────────────────────────────────────────────
# 1. Hardcoded font-family in CSS/TSX/JS
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[1] Hardcoded font-family declarations${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -E "font-family\s*:" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 2. Tailwind font-* utility classes (font-sans, font-mono,
#    font-serif, font-inter, etc.)
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[2] Tailwind font-* utility classes${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -oE '(font-sans|font-mono|font-serif|font-inter|font-geist|font-body|font-heading|font-display)[^a-zA-Z-]' \
  $SCAN_DIRS 2>/dev/null | head -60 || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 3. Any "Inter" references (the old font)
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[3] References to 'Inter' font${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -i "inter" \
  --include="*.tsx" --include="*.ts" --include="*.css" --include="*.json" \
  $SCAN_DIRS 2>/dev/null \
  | grep -iv "internal\|interface\|interact\|interop\|intercept\|interval\|interpreter\|intersection\|interleav\|intermediate\|interpolat\|internat\|internet" \
  || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 4. Any next/font imports (what fonts are being loaded?)
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[4] next/font imports${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  "next/font" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 5. Google Fonts imports (link tags or @import)
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[5] Google Fonts link/import references${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -E "(fonts\.googleapis|fonts\.gstatic|@import.*font)" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 6. CSS variable --font-* definitions and usages
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[6] CSS --font-* variable definitions${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -E "--font-[a-z]" \
  --include="*.css" --include="*.tsx" --include="*.ts" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 7. Inline style={{ fontFamily: ... }} in TSX
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[7] Inline fontFamily in style props${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -E "fontFamily" \
  --include="*.tsx" --include="*.ts" --include="*.jsx" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 8. Tailwind config font overrides
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[8] Tailwind config font settings${NC}"
echo "────────────────────────────────────────"
for f in tailwind.config.ts tailwind.config.js tailwind.config.mjs; do
  if [ -f "$f" ]; then
    echo -e "  ${CYN}Found: $f${NC}"
    grep -n "font" "$f" 2>/dev/null || echo "    (no font references)"
  fi
done
# Also check postcss / next.config
for f in postcss.config.mjs postcss.config.js next.config.mjs next.config.ts next.config.js; do
  if [ -f "$f" ]; then
    echo -e "  ${CYN}Found: $f${NC}"
    grep -n "font" "$f" 2>/dev/null || echo "    (no font references)"
  fi
done
echo ""

# ─────────────────────────────────────────────────────────────
# 9. @font-face declarations
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[9] @font-face declarations${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  "@font-face" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 10. Check if Geist is actually referenced in the layout
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[10] Geist references across codebase${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -i "geist" \
  --include="*.tsx" --include="*.ts" --include="*.css" \
  $SCAN_DIRS 2>/dev/null || echo -e "${RED}  ⚠ NO Geist references found!${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 11. Check body/html className for font classes
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[11] <body> and <html> className attributes${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -E "<(body|html)[^>]*class" \
  --include="*.tsx" --include="*.ts" --include="*.jsx" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 12. Any .woff / .woff2 / .ttf / .otf in public/
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[12] Font files in public/ directory${NC}"
echo "────────────────────────────────────────"
find public/ -type f \( -name "*.woff" -o -name "*.woff2" -o -name "*.ttf" -o -name "*.otf" -o -name "*.eot" \) 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 13. Check what font-mono and font-sans resolve to
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[13] --font-sans and --font-mono definitions in globals.css${NC}"
echo "────────────────────────────────────────"
grep -n "font-sans\|font-mono\|font-serif" src/app/globals.css 2>/dev/null || echo "  globals.css not found"
echo ""

# ─────────────────────────────────────────────────────────────
# 14. Preconnect/DNS-prefetch for fonts
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[14] Font preconnect/prefetch links${NC}"
echo "────────────────────────────────────────"
grep -rn $EXCLUDE_ARGS \
  -E "preconnect.*font|dns-prefetch.*font|fonts\.(googleapis|gstatic)" \
  --include="*.tsx" --include="*.ts" --include="*.html" \
  $SCAN_DIRS 2>/dev/null || echo -e "${GRN}  None found${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 15. Check Network tab clues - sw.js or service worker font caching
# ─────────────────────────────────────────────────────────────
echo -e "${YEL}[15] Service worker / sw.js font references${NC}"
echo "────────────────────────────────────────"
if [ -f "public/sw.js" ]; then
  grep -n "font\|woff\|geist\|inter" public/sw.js 2>/dev/null || echo "  No font refs in sw.js"
else
  echo "  No public/sw.js found"
fi
echo ""

echo "============================================================"
echo -e "${CYN}AUDIT COMPLETE${NC}"
echo "============================================================"
echo ""
echo "Key things to check from the screenshot:"
echo "  1. The Network tab shows two .woff2 files loading — check"
echo "     what font they actually are (click them in DevTools)"
echo "  2. In DevTools Elements tab, inspect any text → Computed"
echo "     → font-family to see what's actually rendering"
echo "  3. If Geist CSS var (--font-geist-sans) is empty/undefined,"
echo "     the chain falls to system sans-serif"
echo ""