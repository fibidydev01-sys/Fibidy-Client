#!/bin/bash
# collect-marketing.sh - Collect ALL marketing flow files
# Sesuai folder map src/ + scope marketing + learn + legal + roadmap
#
# SCOPE MAP (semua path di-relatifkan dari src/):
#
#   [0]  Root Layout              app/[locale]/layout.tsx
#   [0B] Providers                lib/providers/*
#   [0C] i18n Config              i18n/*
#   [0D] Organization Schema      components/store/shared/organization-schema.tsx
#                                 + json-ld.tsx (dependency)
#   [A]  Marketing Layout & Page  app/[locale]/(marketing)/{layout,page}.tsx
#   [B]  Marketing Components     components/marketing/*.tsx
#                                 (14 file + 2 navbar subsystem = 16 file)
#   [C]  Learn Hub Pages          app/[locale]/(marketing)/learn/**/page.tsx (5 file)
#   [D]  Learn Components         components/marketing/learn/track-detail-view.tsx
#   [E]  Learn Data               lib/learn-data/*.ts (3 file)
#   [F]  Roadmap Page             app/[locale]/(marketing)/roadmap/page.tsx
#   [G]  Legal Pages              app/[locale]/(legal)/**/*.tsx (7 file)
#   [H]  SEO & Site Constants     lib/constants/shared/{seo.config,site,constants}.ts
#                                 + lib/shared/seo.ts
#                                 + lib/constants/shared/reserved-subdomains.ts
#   [I]  UI Dependencies          components/ui/* (subset yang benar-benar dipakai)
#   [J]  Shared Utils             lib/shared/{markdown,utils}.ts
#
# CATATAN:
# - Section "sections/index.tsx" DIBUANG karena tidak ada di folder map.
# - Counter total file dihitung dinamis (bukan hardcode).
# - UI primitives ditambahkan karena dipakai langsung oleh marketing/learn.
#   Kalau tidak mau ikut, comment blok [I] saja.
#
# [MEGA MENU REBUILD — Sep 2026]
# - navbar-data.ts + navbar-components.tsx = file BARU (subsystem navbar).
#   navbar-data.ts: data mega menu (Produk, Solusi, Panduan) + command items.
#   navbar-components.tsx: komponen reusable (MegaMenuPanel, MegaMenuItem, dll).
#   navbar.tsx: import dari kedua file di atas, jadi WAJIB ada — kalau tidak,
#   navbar.tsx akan error saat build karena import unresolved.
# - why-section.tsx + bento-grid.tsx: di-rebuild v15 (CTA selalu tampil,
#   background pattern CSS-only). Tetap di scope marketing, tidak berubah.
# - footer-section.tsx: rebuild 5 kolom. Tetap di scope marketing.

COLLECTIONS_DIR="collections"
mkdir -p "$COLLECTIONS_DIR"

OUTPUT="$COLLECTIONS_DIR/collection-marketing.txt"
> "$OUTPUT"

# ── counter ──────────────────────────────────────────────────────────────────
FOUND=0
MISSING=0

collect_group() {
  local group_label="$1"
  shift
  local files=("$@")

  echo "" >> "$OUTPUT"
  echo "## $group_label" >> "$OUTPUT"
  echo "" >> "$OUTPUT"

  for FILE in "${files[@]}"; do
    if [ -f "$FILE" ]; then
      echo "📄 $FILE"
      FOUND=$((FOUND + 1))
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
      MISSING=$((MISSING + 1))
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
}

# ── header (setelah counter siap, ditulis ulang di akhir) ────────────────────
# Header ditulis di akhir supaya angka FOUND/MISSING akurat.

# ============================================
# 0. ROOT LAYOUT (1 file)
# ============================================
collect_group "0. ROOT LAYOUT (1 file)" \
  "src/app/[locale]/layout.tsx"

# ============================================
# 0B. PROVIDERS (3 files)
# ============================================
collect_group "0B. PROVIDERS (3 files)" \
  "src/lib/providers/root-provider.tsx" \
  "src/lib/providers/theme-provider.tsx" \
  "src/lib/providers/toast-provider.tsx"

# ============================================
# 0C. I18N CONFIG (3 files)
# ============================================
collect_group "0C. I18N CONFIG (3 files)" \
  "src/i18n/navigation.ts" \
  "src/i18n/request.ts" \
  "src/i18n/routing.ts"

# ============================================
# 0D. ORGANIZATION SCHEMA + JSON-LD (2 files)
#     json-ld.tsx ditambahkan karena organization-schema.tsx
#     mengimpor MultiJsonLd dari situ — tanpa ini tidak bisa
#     diverifikasi apa yang di-render ke <head>.
# ============================================
collect_group "0D. ORGANIZATION SCHEMA + JSON-LD (2 files)" \
  "src/components/store/shared/organization-schema.tsx" \
  "src/components/store/shared/json-ld.tsx"

# ============================================
# A. MARKETING LAYOUT & PAGE (2 files)
# ============================================
collect_group "A. MARKETING LAYOUT & PAGE (2 files)" \
  "src/app/[locale]/(marketing)/layout.tsx" \
  "src/app/[locale]/(marketing)/page.tsx"

# ============================================
# B. MARKETING COMPONENTS (16 files)
#     Termasuk 2 file subsystem navbar (data + components) yang baru
#     ditambahkan pada MEGA MENU REBUILD Sep 2026.
# ============================================
collect_group "B. MARKETING COMPONENTS (16 files)" \
  "src/components/marketing/navbar-data.ts" \
  "src/components/marketing/navbar-components.tsx" \
  "src/components/marketing/navbar.tsx" \
  "src/components/marketing/banner-section.tsx" \
  "src/components/marketing/hero-section.tsx" \
  "src/components/marketing/what-is-section.tsx" \
  "src/components/marketing/who-is-it-for-section.tsx" \
  "src/components/marketing/why-section.tsx" \
  "src/components/marketing/features-section.tsx" \
  "src/components/marketing/how-it-works-section.tsx" \
  "src/components/marketing/pricing-section.tsx" \
  "src/components/marketing/faq-section.tsx" \
  "src/components/marketing/contact-section.tsx" \
  "src/components/marketing/cta-section.tsx" \
  "src/components/marketing/footer-section.tsx"

# ============================================
# C. LEARN HUB PAGES (5 files)
# ============================================
collect_group "C. LEARN HUB PAGES (5 files)" \
  "src/app/[locale]/(marketing)/learn/page.tsx" \
  "src/app/[locale]/(marketing)/learn/onboarding/page.tsx" \
  "src/app/[locale]/(marketing)/learn/operasional/page.tsx" \
  "src/app/[locale]/(marketing)/learn/kustomisasi/page.tsx" \
  "src/app/[locale]/(marketing)/learn/monitoring/page.tsx"

# ============================================
# D. LEARN COMPONENTS (1 file)
# ============================================
collect_group "D. LEARN COMPONENTS (1 file)" \
  "src/components/marketing/learn/track-detail-view.tsx"

# ============================================
# E. LEARN DATA (3 files)
# ============================================
collect_group "E. LEARN DATA / CONTENT (3 files)" \
  "src/lib/learn-data/hub-content.ts" \
  "src/lib/learn-data/tracks.ts" \
  "src/lib/learn-data/workflow-cases.ts"

# ============================================
# F. ROADMAP PAGE (1 file)
# ============================================
collect_group "F. ROADMAP PAGE (1 file)" \
  "src/app/[locale]/(marketing)/roadmap/page.tsx"

# ============================================
# G. LEGAL PAGES (7 files)
#     Termasuk faq/page.tsx yang sebelumnya kelewat.
# ============================================
collect_group "G. LEGAL PAGES (7 files)" \
  "src/app/[locale]/(legal)/layout.tsx" \
  "src/app/[locale]/(legal)/legal/page.tsx" \
  "src/app/[locale]/(legal)/legal/about/page.tsx" \
  "src/app/[locale]/(legal)/legal/faq/page.tsx" \
  "src/app/[locale]/(legal)/legal/privacy/page.tsx" \
  "src/app/[locale]/(legal)/legal/terms/page.tsx" \
  "src/app/[locale]/(legal)/legal/cookies/page.tsx"

# ============================================
# H. SEO & SITE CONSTANTS (5 files)
#     reserved-subdomains.ts ditambahkan karena
#     seo.config.ts mengimpornya sebagai RESERVED_SUBDOMAINS.
# ============================================
collect_group "H. SEO & SITE CONSTANTS (5 files)" \
  "src/lib/constants/shared/seo.config.ts" \
  "src/lib/constants/shared/site.ts" \
  "src/lib/constants/shared/reserved-subdomains.ts" \
  "src/lib/shared/seo.ts" \
  "src/lib/constants/shared/constants.ts"

# ============================================
# I. UI DEPENDENCIES (subset yang dipakai marketing/learn)
#     Hanya yang benar-benar di-import oleh file di section
#     A–G. Kalau tidak mau ikut, comment blok ini.
# ============================================
collect_group "I. UI DEPENDENCIES (14 files)" \
  "src/components/ui/sonner.tsx" \
  "src/components/ui/badge.tsx" \
  "src/components/ui/button.tsx" \
  "src/components/ui/card.tsx" \
  "src/components/ui/accordion.tsx" \
  "src/components/ui/tabs.tsx" \
  "src/components/ui/scroll-area.tsx" \
  "src/components/ui/separator.tsx" \
  "src/components/ui/sheet.tsx" \
  "src/components/ui/navigation-menu.tsx" \
  "src/components/ui/tooltip.tsx" \
  "src/components/ui/dropdown-menu.tsx" \
  "src/components/ui/command.tsx" \
  "src/components/ui/carousel.tsx"

# ============================================
# I2. UI DECORATIVE (8 files)
#     Komponen visual yang dipakai langsung oleh
#     hero/banner/why/roadmap.
# ============================================
collect_group "I2. UI DECORATIVE (8 files)" \
  "src/components/ui/animated-shiny-text.tsx" \
  "src/components/ui/shimmer-button.tsx" \
  "src/components/ui/bento-grid.tsx" \
  "src/components/ui/safari.tsx" \
  "src/components/ui/flickering-grid.tsx" \
  "src/components/ui/input.tsx" \
  "src/components/ui/textarea.tsx" \
  "src/components/ui/label.tsx"

# ============================================
# J. SHARED UTILS (2 files)
#     utils.ts (cn) dipakai hampir semua file.
#     markdown.ts dipakai seo.ts.
# ============================================
collect_group "J. SHARED UTILS (2 files)" \
  "src/lib/shared/utils.ts" \
  "src/lib/shared/markdown.ts"

# ============================================
# SUMMARY + HEADER REWRITE
# ============================================
# Tulis ulang header dengan angka dinamis.
TMP="$(mktemp)"
{
  echo "=========================================="
  echo " COLLECTION – MARKETING + LEARN FULL FLOW"
  echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "=========================================="
  echo ""
  echo "Files found  : $FOUND"
  echo "Files missing: $MISSING"
  echo ""
} > "$TMP"
cat "$OUTPUT" >> "$TMP"
{
  echo ""
  echo "=========================================="
  echo " COLLECTION COMPLETE"
  echo " Files found  : $FOUND"
  echo " Files missing: $MISSING"
  echo " Generated: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "=========================================="
} >> "$TMP"
mv "$TMP" "$OUTPUT"

echo ""
echo "✅ Output: $OUTPUT"
echo "   Files found  : $FOUND"
echo "   Files missing: $MISSING"
if command -v wc &> /dev/null; then
  echo "   Lines: $(wc -l < "$OUTPUT")"
fi
echo ""
echo "📁 Breakdown:"
echo "   [0]  Root Layout              : 1 file"
echo "   [0B] Providers                : 3 files"
echo "   [0C] i18n Config              : 3 files"
echo "   [0D] Organization Schema      : 2 files  (+json-ld)"
echo "   [A]  Marketing Layout & Page  : 2 files"
echo "   [B]  Marketing Components     : 16 files (+navbar-data, +navbar-components)"
echo "   [C]  Learn Hub Pages          : 5 files"
echo "   [D]  Learn Components         : 1 file"
echo "   [E]  Learn Data / Content     : 3 files"
echo "   [F]  Roadmap Page             : 1 file"
echo "   [G]  Legal Pages              : 7 files  (+faq)"
echo "   [H]  SEO & Site Constants     : 5 files  (+reserved-subdomains)"
echo "   [I]  UI Dependencies          : 14 files"
echo "   [I2] UI Decorative            : 8 files"
echo "   [J]  Shared Utils             : 2 files"
echo ""
echo "📌 Total target: 73 files (dari 70 → +3 navbar subsystem)"