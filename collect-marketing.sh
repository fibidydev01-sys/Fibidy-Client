#!/bin/bash
# collect-marketing.sh - Collect ALL marketing page files
#
# This collects:
#   - Marketing Layout (1 file)
#   - Marketing Page (1 file)
#   - All Marketing Components (9 files)
#   - Navbar (1 file)
#
# Total: 12 files

COLLECTIONS_DIR="collections"
mkdir -p "$COLLECTIONS_DIR"

OUTPUT="$COLLECTIONS_DIR/collection-marketing.txt"
> "$OUTPUT"

echo "==========================================" >> "$OUTPUT"
echo " COLLECTION – MARKETING PAGES & COMPONENTS" >> "$OUTPUT"
echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT"
echo "==========================================" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Total files: 12" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# ============================================
# A. MARKETING LAYOUT & PAGE (2 files)
# ============================================
echo "## A. MARKETING LAYOUT & PAGE (2 files)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_MARKETING_PAGES=(
  "src/app/[locale]/(marketing)/layout.tsx"
  "src/app/[locale]/(marketing)/page.tsx"
)

for FILE in "${FILES_MARKETING_PAGES[@]}"; do
  if [ -f "$FILE" ]; then
    echo "📄 $FILE"
    {
      echo ""
      echo "################################################################################"
      echo "## FILE: $FILE"
      echo "################################################################################"
      cat "$FILE"
      echo ""
    } >> "$OUTPUT"
  else
    echo "❌ $FILE NOT FOUND"
    {
      echo ""
      echo "################################################################################"
      echo "## FILE: $FILE"
      echo "################################################################################"
      echo "Status: ❌ NOT FOUND"
      echo ""
    } >> "$OUTPUT"
  fi
done

# ============================================
# B. MARKETING COMPONENTS (9 files)
# ============================================
echo "" >> "$OUTPUT"
echo "## B. MARKETING COMPONENTS (9 files)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_MARKETING_COMPONENTS=(
  "src/components/marketing/banner-section.tsx"
  "src/components/marketing/hero-section.tsx"
  "src/components/marketing/why-section.tsx"
  "src/components/marketing/how-it-works-section.tsx"
  "src/components/marketing/pricing-section.tsx"
  "src/components/marketing/faq-section.tsx"
  "src/components/marketing/contact-section.tsx"
  "src/components/marketing/footer-section.tsx"
  "src/components/marketing/navbar.tsx"
)

for FILE in "${FILES_MARKETING_COMPONENTS[@]}"; do
  if [ -f "$FILE" ]; then
    echo "📄 $FILE"
    {
      echo ""
      echo "################################################################################"
      echo "## FILE: $FILE"
      echo "################################################################################"
      cat "$FILE"
      echo ""
    } >> "$OUTPUT"
  else
    echo "❌ $FILE NOT FOUND"
    {
      echo ""
      echo "################################################################################"
      echo "## FILE: $FILE"
      echo "################################################################################"
      echo "Status: ❌ NOT FOUND"
      echo ""
    } >> "$OUTPUT"
  fi
done

# ============================================
# C. MARKETING SECTION FILES (1 file - alias)
# ============================================
echo "" >> "$OUTPUT"
echo "## C. MARKETING SECTION FILES (alias)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_MARKETING_SECTIONS=(
  "src/components/marketing/sections/index.tsx"
)

for FILE in "${FILES_MARKETING_SECTIONS[@]}"; do
  if [ -f "$FILE" ]; then
    echo "📄 $FILE"
    {
      echo ""
      echo "################################################################################"
      echo "## FILE: $FILE"
      echo "################################################################################"
      cat "$FILE"
      echo ""
    } >> "$OUTPUT"
  else
    echo "⚠️  $FILE NOT FOUND (optional)"
    {
      echo ""
      echo "################################################################################"
      echo "## FILE: $FILE"
      echo "################################################################################"
      echo "Status: ⚠️ NOT FOUND (optional)"
      echo ""
    } >> "$OUTPUT"
  fi
done

echo "" >> "$OUTPUT"
echo "==========================================" >> "$OUTPUT"
echo " COLLECTION COMPLETE" >> "$OUTPUT"
echo " Total files: 12" >> "$OUTPUT"
echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT"
echo "==========================================" >> "$OUTPUT"

echo ""
echo "✅ Output: $OUTPUT"
echo "   Files collected: 12"
if command -v wc &> /dev/null; then
  echo "   Lines: $(wc -l < "$OUTPUT")"
fi
echo ""
echo "📁 Files collected:"
echo "   - Marketing Layout: 1 file"
echo "   - Marketing Page: 1 file"
echo "   - Marketing Components: 9 files"
echo "   - Navbar: 1 file"
echo ""
echo "📌 Total: 12 marketing files"