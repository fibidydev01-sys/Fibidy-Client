#!/bin/bash
# collect-logo-branding.sh - Collect ALL logo/branding-related files
#
# This collects:
#   - Marketing Header & Footer (2 files)
#   - Auth Logo (1 file)
#   - Dashboard Layout Logo Spots (3 files)
#   - Store (Public Tenant) Header & Footer (2 files)
#   - Social/SEO Metadata (3 files)
#
# Total: 11 files

COLLECTIONS_DIR="collections"
mkdir -p "$COLLECTIONS_DIR"

OUTPUT="$COLLECTIONS_DIR/collection-logo-branding.txt"
> "$OUTPUT"

echo "==========================================" >> "$OUTPUT"
echo " COLLECTION – LOGO / BRANDING FILES" >> "$OUTPUT"
echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT"
echo "==========================================" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "Total files: 11" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# ============================================
# A. MARKETING HEADER & FOOTER (2 files)
# ============================================
echo "## A. MARKETING HEADER & FOOTER (2 files)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_MARKETING=(
  "src/components/marketing/navbar.tsx"
  "src/components/marketing/footer-section.tsx"
)

for FILE in "${FILES_MARKETING[@]}"; do
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
# B. AUTH LOGO (1 file)
# ============================================
echo "" >> "$OUTPUT"
echo "## B. AUTH LOGO (1 file)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_AUTH=(
  "src/components/layout/auth/auth-logo.tsx"
)

for FILE in "${FILES_AUTH[@]}"; do
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
# C. DASHBOARD LAYOUT LOGO SPOTS (3 files)
# ============================================
echo "" >> "$OUTPUT"
echo "## C. DASHBOARD LAYOUT LOGO SPOTS (3 files)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_DASHBOARD=(
  "src/components/layout/dashboard/dashboard-sidebar.tsx"
  "src/components/layout/dashboard/dashboard-topbar.tsx"
  "src/components/layout/dashboard/mobile-navbar.tsx"
)

for FILE in "${FILES_DASHBOARD[@]}"; do
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
# D. STORE (PUBLIC TENANT) HEADER & FOOTER (2 files)
# ============================================
echo "" >> "$OUTPUT"
echo "## D. STORE (PUBLIC TENANT) HEADER & FOOTER (2 files)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_STORE=(
  "src/components/layout/store/store-header.tsx"
  "src/components/layout/store/store-footer.tsx"
)

for FILE in "${FILES_STORE[@]}"; do
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
# E. SOCIAL / SEO METADATA (3 files)
# ============================================
echo "" >> "$OUTPUT"
echo "## E. SOCIAL / SEO METADATA (3 files)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

FILES_METADATA=(
  "src/app/opengraph-image.tsx"
  "src/app/twitter-image.tsx"
  "src/app/[locale]/layout.tsx"
)

for FILE in "${FILES_METADATA[@]}"; do
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

echo "" >> "$OUTPUT"
echo "==========================================" >> "$OUTPUT"
echo " COLLECTION COMPLETE" >> "$OUTPUT"
echo " Total files: 11" >> "$OUTPUT"
echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')" >> "$OUTPUT"
echo "==========================================" >> "$OUTPUT"

echo ""
echo "✅ Output: $OUTPUT"
echo "   Files collected: 11"
if command -v wc &> /dev/null; then
  echo "   Lines: $(wc -l < "$OUTPUT")"
fi
echo ""
echo "📁 Files collected:"
echo "   - Marketing Header & Footer: 2 files"
echo "   - Auth Logo: 1 file"
echo "   - Dashboard Layout Logo Spots: 3 files"
echo "   - Store Header & Footer: 2 files"
echo "   - Social/SEO Metadata: 3 files"
echo ""
echo "📌 Total: 11 logo/branding files"