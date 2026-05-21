#!/usr/bin/env bash
# ================================================================
# fibidy-marketing-collect.sh — LIVE-CODE collector (post-Phase 10)
#
# PERUBAHAN vs versi lama:
#   - Hanya meng-collect KODE YANG BERFUNGSI.
#   - DEADCODE (tour system, CategoryPicker, BuilderPreview, backup)
#     DIKELUARKAN dari isi collect.
#   - ORPHAN tetap dicek lewat probe (sebagai warning), TAPI tidak
#     ikut jadi isi collect.
#   - Deadcode dilaporkan terpisah sebagai DEADCODE PROBE (warning).
#
# Jalankan dari root repo FE (yang punya ./src + ./messages):
#   bash fibidy-marketing-collect.sh           # menu interaktif
#   bash fibidy-marketing-collect.sh hero       # langsung group
#   bash fibidy-marketing-collect.sh all
#
# Output → collections/COLLECT-marketing-<group>-<timestamp>.txt
#
# DAFTAR DEADCODE YANG DIBUANG DARI COLLECT (lihat DEADCODE-REPORT.md):
#   - lib/marketing/onboarding/tour-names.ts        (tour mati)
#   - lib/marketing/onboarding/tour-config.tsx      (tour mati)
#   - lib/marketing/onboarding/tour-provider.tsx    (tour mati)
#   - components/shared/onboarding/nextstep-provider.tsx (tour mati)
#   - components/shared/onboarding/nextstep-types.ts     (tour mati)
#   - sections/store-builder/category-picker.tsx    (tak diimpor)
#   - sections/store-builder/builder-preview.tsx    (tak dirender)
#   - components/marketing/marketing-header-bak.tsx  (backup)
# ================================================================

set -u

# ── Colors ──────────────────────────────────────────────────────
GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
WHITE='\033[1;37m'; DIM='\033[2m'; BOLD='\033[1m'; NC='\033[0m'

# ── Paths ───────────────────────────────────────────────────────
SRC="./src"
MSG="./messages"
PKG="./package.json"
OUT="collections"

# ── Counters ────────────────────────────────────────────────────
FOUND=0; MISSING=0; TOTAL=0
STALE=0      # orphan files/dirs that should be gone
DEADHIT=0    # deadcode files still present (expected, but flagged)

# ────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────

# cf <path> — collect a LIVE file
cf() {
  local f="$1"; TOTAL=$((TOTAL + 1))
  if [ -f "$f" ]; then
    local lines; lines=$(wc -l < "$f" 2>/dev/null || echo "0")
    echo -e "  ${GREEN}✓${NC} ${f#./} ${DIM}(${lines} lines)${NC}"
    FOUND=$((FOUND + 1))
    {
      echo "================================================"
      echo "FILE: ${f#./}"
      echo "Lines: $lines"
      echo "================================================"
      echo ""
      cat "$f"
      printf "\n\n"
    } >> "$FILE"
  else
    echo -e "  ${RED}✗ MISSING:${NC} ${f#./}"
    MISSING=$((MISSING + 1))
    echo "FILE: ${f#./} — *** NOT FOUND ***" >> "$FILE"
  fi
}

# dead <path> <reason> — DEADCODE probe.
# File ini TIDAK di-collect isinya. Kita hanya laporkan kalau masih ada,
# supaya orang tahu kandidat hapus. Tidak dihitung di TOTAL/FOUND.
dead() {
  local f="$1"; local reason="${2:-deadcode}"
  if [ -f "$f" ]; then
    echo -e "  ${YELLOW}☠ DEAD:${NC} ${f#./} ${DIM}(${reason} — NOT collected)${NC}"
    DEADHIT=$((DEADHIT + 1))
    echo "DEADCODE (not collected): ${f#./} — ${reason}" >> "$FILE"
  fi
}

# nf <path> — orphan file probe (should be absent)
nf() {
  local f="$1"
  if [ -f "$f" ]; then
    echo -e "  ${RED}✗ STALE:${NC} ${f#./} ${DIM}(should be deleted post-refactor)${NC}"
    STALE=$((STALE + 1))
    echo "STALE FILE STILL PRESENT: ${f#./} — should be deleted" >> "$FILE"
  fi
}

# nd <path> — orphan dir probe (should be absent)
nd() {
  local d="$1"
  if [ -d "$d" ]; then
    echo -e "  ${RED}✗ STALE DIR:${NC} ${d#./} ${DIM}(should be deleted post-refactor)${NC}"
    STALE=$((STALE + 1))
    echo "STALE DIR STILL PRESENT: ${d#./} — should be deleted" >> "$FILE"
  fi
}

sec() {
  echo -e "\n${MAGENTA}▶ $1${NC}"
  echo -e "\n## $1\n" >> "$FILE"
}

block() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  {
    echo ""
    echo "################################################################"
    echo "##  $1"
    echo "################################################################"
    echo ""
  } >> "$FILE"
}

# ────────────────────────────────────────────────────────────────
# Shared bedrock — auto-included tiap group kecuali `all`
# ────────────────────────────────────────────────────────────────
collect_bedrock() {
  block "BEDROCK — Shared context (auto-included)"

  sec "Section registry + type contracts (Phase 10)"
  cf "$SRC/lib/marketing/data/sections.ts"
  cf "$SRC/components/marketing/registry.ts"
  cf "$SRC/types/marketing.ts"

  sec "Page composer (registry-driven render — Phase 10)"
  cf "$SRC/app/[locale]/(marketing)/page.tsx"

  sec "Marketing layout (route-group level)"
  cf "$SRC/app/[locale]/(marketing)/layout.tsx"

  sec "Marketing i18n (both locales — for copy context)"
  cf "$MSG/en/marketing.json"
  cf "$MSG/id/marketing.json"
}

# ────────────────────────────────────────────────────────────────
# DEADCODE PROBE — file mati, dilaporkan tapi TIDAK di-collect
# ────────────────────────────────────────────────────────────────
collect_deadcode_probe() {
  sec "☠ DEADCODE PROBE — kode mati (TIDAK ikut di-collect)"

  # Sistem NextStep tour — mati total sejak use-store-builder Phase 1 SLIM
  dead "$SRC/lib/marketing/onboarding/tour-names.ts"    "tour system never fires"
  dead "$SRC/lib/marketing/onboarding/tour-config.tsx"  "tour system never fires"
  dead "$SRC/lib/marketing/onboarding/tour-provider.tsx" "tour system never fires"
  dead "$SRC/components/shared/onboarding/nextstep-provider.tsx" "tour system never fires"
  dead "$SRC/components/shared/onboarding/nextstep-types.ts"     "tour system never fires"

  # Store-builder dead UI (tak diimpor / tak dirender)
  dead "$SRC/components/marketing/sections/store-builder/category-picker.tsx" "not imported"
  dead "$SRC/components/marketing/sections/store-builder/builder-preview.tsx" "not rendered"

  # Backup file
  dead "$SRC/components/marketing/marketing-header-bak.tsx" "backup file"
}

# ────────────────────────────────────────────────────────────────
# ORPHAN PROBE — file yang seharusnya sudah terhapus
# ────────────────────────────────────────────────────────────────
collect_orphan_probe() {
  sec "🧹 ORPHAN PROBE — files that should be DELETED post-refactor"

  # shared/ folder
  nf "$SRC/components/marketing/shared/section-shell.tsx"
  nf "$SRC/components/marketing/shared/section-eyebrow.tsx"
  nf "$SRC/components/marketing/shared/line-grid-frame.tsx"
  nf "$SRC/components/marketing/shared/browser-mockup.tsx"
  nf "$SRC/components/marketing/shared/storefront-mockup.tsx"
  nf "$SRC/components/marketing/shared/feature-visuals.tsx"
  nf "$SRC/components/marketing/shared/pricing-card.tsx"
  nf "$SRC/components/marketing/shared/faq-item.tsx"
  nf "$SRC/components/marketing/shared/lenis-provider.tsx"
  nf "$SRC/components/marketing/shared/locale-switcher.tsx"
  nf "$SRC/components/marketing/shared/theme-toggle.tsx"
  nf "$SRC/components/marketing/shared/marketing-schema.tsx"
  nd "$SRC/components/marketing/shared"

  # Old root header/footer
  nf "$SRC/components/marketing/marketing-header.tsx"
  nf "$SRC/components/marketing/marketing-footer.tsx"

  # Old store-builder root folder
  nf "$SRC/components/marketing/store-builder/category-picker.tsx"
  nf "$SRC/components/marketing/store-builder/subdomain-input.tsx"
  nf "$SRC/components/marketing/store-builder/subdomain-suggestions.tsx"
  nf "$SRC/components/marketing/store-builder/builder-preview.tsx"
  nd "$SRC/components/marketing/store-builder"

  # Old flat section files
  nf "$SRC/components/marketing/sections/announcement-bar.tsx"
  nf "$SRC/components/marketing/sections/hero-section.tsx"
  nf "$SRC/components/marketing/sections/problem-section.tsx"
  nf "$SRC/components/marketing/sections/features-section.tsx"
  nf "$SRC/components/marketing/sections/scale-section.tsx"
  nf "$SRC/components/marketing/sections/how-it-works-section.tsx"
  nf "$SRC/components/marketing/sections/pricing-section.tsx"
  nf "$SRC/components/marketing/sections/store-builder-section.tsx"
  nf "$SRC/components/marketing/sections/faq-section.tsx"
  nf "$SRC/components/marketing/sections/final-cta-section.tsx"

  # Phase 4 orphan
  nf "$SRC/components/marketing/sections/features/visuals/index.tsx"

  # Phase 9 orphan
  nf "$SRC/lib/data/marketing/tours.tsx"

  # Phase 10 orphans
  nf "$SRC/lib/data/marketing/announcement.ts"
  nf "$SRC/lib/data/marketing/cta.ts"
  nf "$SRC/lib/data/marketing/faq.ts"
  nf "$SRC/lib/data/marketing/features.ts"
  nf "$SRC/lib/data/marketing/footer.ts"
  nf "$SRC/lib/data/marketing/hero.ts"
  nf "$SRC/lib/data/marketing/how-it-works.ts"
  nf "$SRC/lib/data/marketing/nav.ts"
  nf "$SRC/lib/data/marketing/pricing.ts"
  nf "$SRC/lib/data/marketing/problem.ts"
  nf "$SRC/lib/data/marketing/scale.ts"
  nf "$SRC/lib/data/marketing/sections.ts"
  nf "$SRC/lib/data/marketing/store-builder.ts"
  nd "$SRC/lib/data/marketing"
}

# ────────────────────────────────────────────────────────────────
# GROUP COLLECTORS (hanya kode hidup)
# ────────────────────────────────────────────────────────────────

collect_announcement() {
  block "ANNOUNCEMENT — top promo bar"
  sec "Section + data"
  cf "$SRC/components/marketing/sections/announcement/index.tsx"
  cf "$SRC/lib/marketing/data/announcement.ts"
}

collect_hero() {
  block "HERO — main landing band (post-Phase 7 split)"

  sec "Section composer + sub-components + storefront mockup"
  cf "$SRC/components/marketing/sections/hero/index.tsx"
  cf "$SRC/components/marketing/sections/hero/eyebrow-pill.tsx"
  cf "$SRC/components/marketing/sections/hero/headline.tsx"
  cf "$SRC/components/marketing/sections/hero/cta-pair.tsx"
  cf "$SRC/components/marketing/sections/hero/motion-stagger.tsx"
  cf "$SRC/components/marketing/sections/hero/storefront-mockup.tsx"
  cf "$SRC/components/marketing/sections/hero/video-placeholder.tsx"

  sec "Hero data"
  cf "$SRC/lib/marketing/data/hero.ts"

  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/browser-mockup.tsx"

  sec "UI primitives consumed by hero"
  cf "$SRC/components/ui/word-rotate.tsx"
  cf "$SRC/components/ui/animated-gradient-text.tsx"
  cf "$SRC/components/ui/rainbow-button.tsx"
  cf "$SRC/components/ui/morphing-text.tsx"
  cf "$SRC/components/ui/button.tsx"

  sec "i18n routing"
  cf "$SRC/i18n/navigation.ts"
}

collect_problem() {
  block "PROBLEM — pain-points section"
  sec "Section + data"
  cf "$SRC/components/marketing/sections/problem/index.tsx"
  cf "$SRC/lib/marketing/data/problem.ts"
  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
}

collect_features() {
  block "FEATURES — Magic UI bento grid (post-Phase 4 visuals split)"
  sec "Section composer"
  cf "$SRC/components/marketing/sections/features/index.tsx"
  sec "Visuals (6 files)"
  cf "$SRC/components/marketing/sections/features/visuals/index.ts"
  cf "$SRC/components/marketing/sections/features/visuals/studio-marquee.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/orders-list.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/channels-beam.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/channels-icons.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/save-time-calendar.tsx"
  sec "Features data"
  cf "$SRC/lib/marketing/data/features.ts"
  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  sec "Magic UI primitives"
  cf "$SRC/components/ui/bento-grid.tsx"
  cf "$SRC/components/ui/marquee.tsx"
  cf "$SRC/components/ui/animated-list.tsx"
  cf "$SRC/components/ui/animated-beam.tsx"
  cf "$SRC/components/ui/calendar.tsx"
}

collect_scale() {
  block "SCALE — multi-tenant proof point (post-Phase 5 split)"
  sec "Section composer (server) + DomainStack (client island)"
  cf "$SRC/components/marketing/sections/scale/index.tsx"
  cf "$SRC/components/marketing/sections/scale/domain-stack.tsx"
  sec "Scale data"
  cf "$SRC/lib/marketing/data/scale.ts"
  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
}

collect_how_it_works() {
  block "HOW-IT-WORKS — 3-step narrative (post-Phase 6 visuals split)"
  sec "Section composer"
  cf "$SRC/components/marketing/sections/how-it-works/index.tsx"
  sec "Visuals (5 files)"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/index.ts"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/dotted-background.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/build-visual.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/share-visual.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/sell-visual.tsx"
  sec "How-it-works data"
  cf "$SRC/lib/marketing/data/how-it-works.ts"
  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
}

collect_pricing() {
  block "PRICING — 3-tier comparison (mirrors dashboard subscription)"
  sec "Section + co-located card primitive"
  cf "$SRC/components/marketing/sections/pricing/index.tsx"
  cf "$SRC/components/marketing/sections/pricing/pricing-card.tsx"
  sec "Pricing data"
  cf "$SRC/lib/marketing/data/pricing.ts"
  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  sec "Feature flag gate"
  cf "$SRC/lib/config/features.ts"
  sec "Mirror SOURCE — dashboard subscription page (DO NOT modify in polish)"
  cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"
  sec "Mirror i18n — dashboard.subscription.plans.*"
  cf "$MSG/en/dashboard.json"
  cf "$MSG/id/dashboard.json"
}

collect_store_builder() {
  block "STORE-BUILDER — interactive funnel + register handoff (LIVE-ONLY)"

  sec "Section composer (server) + form island (client) + hook"
  cf "$SRC/components/marketing/sections/store-builder/index.tsx"
  cf "$SRC/components/marketing/sections/store-builder/form-island.tsx"
  cf "$SRC/components/marketing/sections/store-builder/use-store-builder.ts"

  sec "Sub-components yang AKTIF dipakai form-island"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-input.tsx"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-suggestions.tsx"
  # CATATAN: category-picker.tsx & builder-preview.tsx = DEADCODE (lihat probe di bawah)

  sec "Form motion stagger (dipakai form-island)"
  # form-island mengimpor './form-motion-stagger' — collect kalau ada
  cf "$SRC/components/marketing/sections/store-builder/form-motion-stagger.tsx"

  sec "Visual chrome imports dari hero (form-island reuse)"
  cf "$SRC/components/marketing/sections/hero/eyebrow-pill.tsx"
  cf "$SRC/components/marketing/sections/hero/headline.tsx"

  sec "Data store-builder"
  cf "$SRC/lib/marketing/data/store-builder.ts"

  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/section-shell.tsx"

  sec "Slug + category SoT (validated at module-load time)"
  cf "$SRC/lib/utils/slug-suggestions.ts"
  cf "$SRC/lib/constants/shared/categories.ts"
  cf "$SRC/lib/constants/shared/reserved-subdomains.ts"
  cf "$SRC/lib/constants/shared/slug.constants.ts"

  sec "Register bridge — where the funnel hands off"
  cf "$SRC/app/[locale]/(auth)/register/page.tsx"
  cf "$SRC/components/auth/register/register.tsx"
  cf "$SRC/components/auth/register/step-review.tsx"
  cf "$SRC/hooks/auth/use-register-wizard.ts"

  sec "Auth i18n + common i18n"
  cf "$MSG/en/auth.json"
  cf "$MSG/id/auth.json"
  cf "$MSG/en/common.json"
  cf "$MSG/id/common.json"

  sec "i18n routing"
  cf "$SRC/i18n/navigation.ts"
}

collect_faq() {
  block "FAQ — accordion + JSON-LD feed"
  sec "Section + co-located item primitive"
  cf "$SRC/components/marketing/sections/faq/index.tsx"
  cf "$SRC/components/marketing/sections/faq/faq-item.tsx"
  sec "FAQ data"
  cf "$SRC/lib/marketing/data/faq.ts"
  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  sec "JSON-LD pipeline"
  cf "$SRC/components/marketing/layout/seo-schema.tsx"
  cf "$SRC/lib/shared/marketing-schema.ts"
  sec "UI primitive"
  cf "$SRC/components/ui/accordion.tsx"
}

collect_final_cta() {
  block "FINAL-CTA — closing CTA band"
  sec "Section + data"
  cf "$SRC/components/marketing/sections/final-cta/index.tsx"
  cf "$SRC/lib/marketing/data/cta.ts"
  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  sec "UI primitive"
  cf "$SRC/components/ui/rainbow-button.tsx"
}

collect_header() {
  block "HEADER — sticky nav (layout/)"
  sec "Header component"
  cf "$SRC/components/marketing/layout/header.tsx"
  # CATATAN: marketing-header-bak.tsx = BACKUP, tidak di-collect
  sec "Nav data"
  cf "$SRC/lib/marketing/data/nav.ts"
  sec "Logo dependency"
  cf "$SRC/components/layout/auth/auth-logo.tsx"
}

collect_footer() {
  block "FOOTER — links + locale + theme (layout/)"
  sec "Footer component + data"
  cf "$SRC/components/marketing/layout/footer.tsx"
  cf "$SRC/lib/marketing/data/footer.ts"
  sec "Footer islands"
  cf "$SRC/components/marketing/layout/locale-switcher.tsx"
  cf "$SRC/components/marketing/layout/theme-toggle.tsx"
  sec "Site config"
  cf "$SRC/lib/constants/shared/site.ts"
  sec "Logo + i18n routing"
  cf "$SRC/components/layout/auth/auth-logo.tsx"
  cf "$SRC/i18n/routing.ts"
  cf "$SRC/i18n/navigation.ts"
}

collect_primitives() {
  block "PRIMITIVES — cross-section reusable layout"
  sec "Layout primitives"
  cf "$SRC/components/marketing/primitives/section-shell.tsx"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  cf "$SRC/components/marketing/primitives/browser-mockup.tsx"
  sec "Section-specific helpers"
cf "$SRC/components/marketing/sections/hero/storefront-mockup.tsx"
cf "$SRC/components/marketing/sections/hero/video-placeholder.tsx"
  cf "$SRC/components/marketing/sections/pricing/pricing-card.tsx"
  cf "$SRC/components/marketing/sections/faq/faq-item.tsx"
  sec "Visuals barrels"
  cf "$SRC/components/marketing/sections/features/visuals/index.ts"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/index.ts"
  sec "Section registry"
  cf "$SRC/components/marketing/registry.ts"
  sec "Layout chrome"
  cf "$SRC/components/marketing/layout/lenis-provider.tsx"
  cf "$SRC/components/marketing/layout/seo-schema.tsx"
  cf "$SRC/components/marketing/layout/locale-switcher.tsx"
  cf "$SRC/components/marketing/layout/theme-toggle.tsx"
}

collect_i18n() {
  block "I18N — copywriting polish (all bundles + data layer)"
  sec "Marketing i18n"
  cf "$MSG/en/marketing.json"
  cf "$MSG/id/marketing.json"
  sec "Auth i18n"
  cf "$MSG/en/auth.json"
  cf "$MSG/id/auth.json"
  sec "Common i18n"
  cf "$MSG/en/common.json"
  cf "$MSG/id/common.json"
  sec "Dashboard i18n"
  cf "$MSG/en/dashboard.json"
  cf "$MSG/id/dashboard.json"
  sec "Marketing data layer (Phase 10 paths)"
  cf "$SRC/lib/marketing/data/sections.ts"
  cf "$SRC/lib/marketing/data/announcement.ts"
  cf "$SRC/lib/marketing/data/hero.ts"
  cf "$SRC/lib/marketing/data/problem.ts"
  cf "$SRC/lib/marketing/data/features.ts"
  cf "$SRC/lib/marketing/data/scale.ts"
  cf "$SRC/lib/marketing/data/how-it-works.ts"
  cf "$SRC/lib/marketing/data/pricing.ts"
  cf "$SRC/lib/marketing/data/store-builder.ts"
  cf "$SRC/lib/marketing/data/faq.ts"
  cf "$SRC/lib/marketing/data/cta.ts"
  cf "$SRC/lib/marketing/data/footer.ts"
  cf "$SRC/lib/marketing/data/nav.ts"
}

collect_infra() {
  block "INFRA — routing, layout, fonts, OG, SEO config"
  sec "Layouts"
  cf "$SRC/app/layout.tsx"
  cf "$SRC/app/[locale]/layout.tsx"
  cf "$SRC/app/[locale]/(marketing)/layout.tsx"
  cf "$SRC/app/[locale]/(marketing)/page.tsx"
  sec "Section registry"
  cf "$SRC/components/marketing/registry.ts"
  sec "Edge proxy"
  cf "$SRC/proxy.ts"
  sec "Global CSS"
  cf "$SRC/app/globals.css"
  sec "OG images"
  cf "$SRC/app/opengraph-image.tsx"
  cf "$SRC/app/twitter-image.tsx"
  sec "SEO config + helpers"
  cf "$SRC/lib/constants/shared/seo.config.ts"
  cf "$SRC/lib/constants/shared/site.ts"
  cf "$SRC/lib/shared/seo.ts"
  cf "$SRC/lib/shared/marketing-schema.ts"
  cf "$SRC/lib/shared/utils.ts"
  sec "i18n routing config"
  cf "$SRC/i18n/routing.ts"
  cf "$SRC/i18n/navigation.ts"
  cf "$SRC/i18n/request.ts"
  sec "Package + Next config"
  cf "$PKG"
  if [ -f "./next.config.mjs" ]; then
    cf "./next.config.mjs"
  else
    cf "./next.config.ts"
  fi
}

# ── ALL — full snapshot (LIVE CODE ONLY) ────────────────────────
collect_all() {
  block "GROUP A — Marketing Components (LIVE CODE — post-Phase 10)"

  sec "Sections (live files only)"
  cf "$SRC/components/marketing/sections/announcement/index.tsx"

  cf "$SRC/components/marketing/sections/hero/index.tsx"
  cf "$SRC/components/marketing/sections/hero/eyebrow-pill.tsx"
  cf "$SRC/components/marketing/sections/hero/headline.tsx"
  cf "$SRC/components/marketing/sections/hero/cta-pair.tsx"
  cf "$SRC/components/marketing/sections/hero/motion-stagger.tsx"
cf "$SRC/components/marketing/sections/hero/storefront-mockup.tsx"
cf "$SRC/components/marketing/sections/hero/video-placeholder.tsx"

  cf "$SRC/components/marketing/sections/problem/index.tsx"

  cf "$SRC/components/marketing/sections/features/index.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/index.ts"
  cf "$SRC/components/marketing/sections/features/visuals/studio-marquee.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/orders-list.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/channels-beam.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/channels-icons.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/save-time-calendar.tsx"

  cf "$SRC/components/marketing/sections/scale/index.tsx"
  cf "$SRC/components/marketing/sections/scale/domain-stack.tsx"

  cf "$SRC/components/marketing/sections/how-it-works/index.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/index.ts"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/dotted-background.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/build-visual.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/share-visual.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/sell-visual.tsx"

  cf "$SRC/components/marketing/sections/pricing/index.tsx"
  cf "$SRC/components/marketing/sections/pricing/pricing-card.tsx"

  # Store-builder — HANYA file hidup
  cf "$SRC/components/marketing/sections/store-builder/index.tsx"
  cf "$SRC/components/marketing/sections/store-builder/form-island.tsx"
  cf "$SRC/components/marketing/sections/store-builder/use-store-builder.ts"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-input.tsx"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-suggestions.tsx"
  cf "$SRC/components/marketing/sections/store-builder/form-motion-stagger.tsx"
  # category-picker.tsx & builder-preview.tsx = DEAD (lihat deadcode probe)

  cf "$SRC/components/marketing/sections/faq/index.tsx"
  cf "$SRC/components/marketing/sections/faq/faq-item.tsx"
  cf "$SRC/components/marketing/sections/final-cta/index.tsx"

  sec "Section registry"
  cf "$SRC/components/marketing/registry.ts"

  sec "Primitives"
  cf "$SRC/components/marketing/primitives/section-shell.tsx"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  cf "$SRC/components/marketing/primitives/browser-mockup.tsx"

  sec "Layout chrome"
  cf "$SRC/components/marketing/layout/header.tsx"
  cf "$SRC/components/marketing/layout/footer.tsx"
  cf "$SRC/components/marketing/layout/lenis-provider.tsx"
  cf "$SRC/components/marketing/layout/locale-switcher.tsx"
  cf "$SRC/components/marketing/layout/theme-toggle.tsx"
  cf "$SRC/components/marketing/layout/seo-schema.tsx"

  block "GROUP B — Magic UI Primitives (read-only)"
  cf "$SRC/components/ui/bento-grid.tsx"
  cf "$SRC/components/ui/marquee.tsx"
  cf "$SRC/components/ui/animated-list.tsx"
  cf "$SRC/components/ui/animated-beam.tsx"
  cf "$SRC/components/ui/calendar.tsx"
  cf "$SRC/components/ui/button.tsx"
  cf "$SRC/components/ui/accordion.tsx"
  cf "$SRC/components/ui/word-rotate.tsx"
  cf "$SRC/components/ui/animated-gradient-text.tsx"
  cf "$SRC/components/ui/rainbow-button.tsx"
  cf "$SRC/components/ui/morphing-text.tsx"

  block "GROUP C — Marketing Data Layer"
  cf "$SRC/lib/marketing/data/sections.ts"
  cf "$SRC/lib/marketing/data/announcement.ts"
  cf "$SRC/lib/marketing/data/hero.ts"
  cf "$SRC/lib/marketing/data/problem.ts"
  cf "$SRC/lib/marketing/data/how-it-works.ts"
  cf "$SRC/lib/marketing/data/features.ts"
  cf "$SRC/lib/marketing/data/scale.ts"
  cf "$SRC/lib/marketing/data/pricing.ts"
  cf "$SRC/lib/marketing/data/store-builder.ts"
  cf "$SRC/lib/marketing/data/faq.ts"
  cf "$SRC/lib/marketing/data/cta.ts"
  cf "$SRC/lib/marketing/data/footer.ts"
  cf "$SRC/lib/marketing/data/nav.ts"
  cf "$SRC/lib/utils/slug-suggestions.ts"

  block "GROUP D — Marketing i18n"
  sec "Marketing"
  cf "$MSG/en/marketing.json"
  cf "$MSG/id/marketing.json"
  sec "Auth bridges"
  cf "$MSG/en/auth.json"
  cf "$MSG/id/auth.json"
  sec "Common"
  cf "$MSG/en/common.json"
  cf "$MSG/id/common.json"

  block "GROUP E — Page Composer"
  cf "$SRC/app/[locale]/(marketing)/page.tsx"
  cf "$SRC/app/[locale]/(marketing)/layout.tsx"

  block "GROUP F — Register Bridges"
  cf "$SRC/app/[locale]/(auth)/register/page.tsx"
  cf "$SRC/components/auth/register/register.tsx"
  cf "$SRC/components/auth/register/step-review.tsx"
  cf "$SRC/hooks/auth/use-register-wizard.ts"

  block "GROUP G — SoT Dependencies"
  cf "$SRC/lib/constants/shared/categories.ts"
  cf "$SRC/lib/constants/shared/reserved-subdomains.ts"
  cf "$SRC/lib/constants/shared/slug.constants.ts"
  cf "$SRC/lib/constants/shared/seo.config.ts"
  cf "$SRC/lib/constants/shared/site.ts"
  cf "$SRC/lib/config/features.ts"
  cf "$SRC/types/marketing.ts"

  block "GROUP H — Pricing Mirror Source (DO NOT modify)"
  cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"
  cf "$MSG/en/dashboard.json"
  cf "$MSG/id/dashboard.json"

  block "GROUP I — Marketing-Adjacent Infra"
  cf "$SRC/proxy.ts"
  cf "$SRC/app/layout.tsx"
  cf "$SRC/app/[locale]/layout.tsx"
  cf "$SRC/lib/shared/marketing-schema.ts"
  cf "$SRC/lib/shared/seo.ts"
  cf "$SRC/lib/shared/utils.ts"
  cf "$SRC/app/opengraph-image.tsx"
  cf "$SRC/app/twitter-image.tsx"
  cf "$PKG"
  if [ -f "./next.config.mjs" ]; then
    cf "./next.config.mjs"
  else
    cf "./next.config.ts"
  fi
  cf "$SRC/app/globals.css"
}

# ────────────────────────────────────────────────────────────────
# Group registry
# ────────────────────────────────────────────────────────────────

group_label() {
  case "$1" in
    announcement)  echo "announcement bar (top promo strip)" ;;
    hero)          echo "hero section (5 files + mockup)" ;;
    problem)       echo "problem section (3 pain points)" ;;
    features)      echo "features bento (composer + 6 visuals)" ;;
    scale)         echo "scale section (server + DomainStack island)" ;;
    how-it-works)  echo "how-it-works (composer + 5 visuals)" ;;
    pricing)       echo "pricing section (3-tier + dashboard mirror)" ;;
    store-builder) echo "store-builder funnel (LIVE files only)" ;;
    faq)           echo "FAQ accordion + JSON-LD feed" ;;
    final-cta)     echo "final CTA band (closing)" ;;
    header)        echo "marketing header (layout/)" ;;
    footer)        echo "marketing footer (layout/)" ;;
    primitives)    echo "primitives (cross-section layout)" ;;
    i18n)          echo "all i18n bundles + data layer" ;;
    infra)         echo "routing, layouts, fonts, OG, SEO config" ;;
    all)           echo "FULL snapshot (LIVE code only + probes)" ;;
    *)             echo "(unknown group)" ;;
  esac
}

collect_for() {
  case "$1" in
    announcement)  collect_announcement ;;
    hero)          collect_hero ;;
    problem)       collect_problem ;;
    features)      collect_features ;;
    scale)         collect_scale ;;
    how-it-works)  collect_how_it_works ;;
    pricing)       collect_pricing ;;
    store-builder) collect_store_builder ;;
    faq)           collect_faq ;;
    final-cta)     collect_final_cta ;;
    header)        collect_header ;;
    footer)        collect_footer ;;
    primitives)    collect_primitives ;;
    i18n)          collect_i18n ;;
    infra)         collect_infra ;;
    all)           collect_all ;;
    *)             return 1 ;;
  esac
}

print_menu() {
  echo ""
  echo -e "${WHITE}${BOLD}Fibidy Marketing Collector${NC} ${DIM}(LIVE-CODE only — deadcode excluded)${NC}"
  echo -e "${DIM}Output → ${OUT}/COLLECT-marketing-<group>-<ts>.txt${NC}"
  echo ""
  echo -e "  ${CYAN}Sections${NC}"
  echo -e "    ${YELLOW}1)${NC}  announcement     ${YELLOW}6)${NC}  how-it-works"
  echo -e "    ${YELLOW}2)${NC}  hero             ${YELLOW}7)${NC}  pricing"
  echo -e "    ${YELLOW}3)${NC}  problem          ${YELLOW}8)${NC}  store-builder"
  echo -e "    ${YELLOW}4)${NC}  features         ${YELLOW}9)${NC}  faq"
  echo -e "    ${YELLOW}5)${NC}  scale           ${YELLOW}10)${NC}  final-cta"
  echo ""
  echo -e "  ${CYAN}Cross-cutting${NC}"
  echo -e "   ${YELLOW}11)${NC}  header          ${YELLOW}13)${NC}  primitives"
  echo -e "   ${YELLOW}12)${NC}  footer          ${YELLOW}14)${NC}  i18n"
  echo ""
  echo -e "  ${CYAN}Infra + everything${NC}"
  echo -e "   ${YELLOW}15)${NC}  infra           ${YELLOW}16)${NC}  all"
  echo ""
  echo -e "    ${YELLOW}q)${NC}  quit"
  echo ""
}

resolve_group() {
  local input="$1"
  input="$(echo "$input" | tr -d '[:space:]')"
  case "$input" in
    1)  echo "announcement"  ;; 2)  echo "hero" ;; 3)  echo "problem" ;;
    4)  echo "features" ;; 5)  echo "scale" ;; 6)  echo "how-it-works" ;;
    7)  echo "pricing" ;; 8)  echo "store-builder" ;; 9)  echo "faq" ;;
    10) echo "final-cta" ;; 11) echo "header" ;; 12) echo "footer" ;;
    13) echo "primitives" ;; 14) echo "i18n" ;; 15) echo "infra" ;;
    16) echo "all" ;;
    *)
      case "$input" in
        announcement|announce) echo "announcement" ;;
        hero) echo "hero" ;; problem) echo "problem" ;;
        features|feature) echo "features" ;; scale) echo "scale" ;;
        how-it-works|howitworks|how) echo "how-it-works" ;;
        pricing|price) echo "pricing" ;;
        store-builder|storebuilder|builder) echo "store-builder" ;;
        faq) echo "faq" ;; final-cta|finalcta|cta) echo "final-cta" ;;
        header|head) echo "header" ;; footer|foot) echo "footer" ;;
        primitives|shared|prim) echo "primitives" ;;
        i18n|copy|copywriting) echo "i18n" ;;
        infra|infrastructure) echo "infra" ;;
        all|everything|full) echo "all" ;;
        *) return 1 ;;
      esac
      ;;
  esac
}

# ────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────

if [ ! -d "$SRC" ] || [ ! -d "$MSG" ]; then
  echo -e "${RED}✗ Error:${NC} jalankan dari root repo FE (butuh ./src dan ./messages)."
  echo -e "  Sekarang di: $(pwd)"
  exit 1
fi

mkdir -p "$OUT"

GROUP=""
if [ $# -ge 1 ]; then
  GROUP="$(resolve_group "$1")" || {
    echo -e "${RED}✗ Unknown group:${NC} $1"
    echo -e "  Jalankan ${CYAN}bash $0${NC} (tanpa argumen) untuk menu."
    exit 1
  }
else
  while true; do
    print_menu
    printf "  ${BOLD}Pick a group [1-16, name, or q]:${NC} "
    read -r INPUT
    case "$INPUT" in
      q|Q|quit|exit) echo -e "${DIM}Bye.${NC}"; exit 0 ;;
      "") echo -e "${YELLOW}  (kosong — pilih angka, nama, atau q)${NC}"; continue ;;
    esac
    GROUP="$(resolve_group "$INPUT")" && break
    echo -e "${RED}  ✗ Unknown choice: $INPUT${NC}"
  done
fi

LABEL="$(group_label "$GROUP")"
TIMESTAMP="$(date '+%Y%m%d-%H%M%S')"
FILE="$OUT/COLLECT-marketing-${GROUP}-${TIMESTAMP}.txt"

{
  echo "################################################################"
  echo "##  COLLECTION — Fibidy Marketing (LIVE-CODE ONLY)"
  echo "##  Group      : $GROUP"
  echo "##  Label      : $LABEL"
  echo "##  Generated  : $(date '+%Y-%m-%d %H:%M:%S')"
  echo "##  Working dir: $(pwd)"
  echo "##  NOTE       : deadcode tidak ikut di-collect (lihat probe)"
  echo "################################################################"
  echo ""
} > "$FILE"

echo ""
echo -e "${WHITE}${BOLD}→ Collecting:${NC} ${CYAN}$GROUP${NC} ${DIM}(${LABEL})${NC}"

if [ "$GROUP" != "all" ]; then
  collect_bedrock
fi

collect_for "$GROUP"

# Probes selalu jalan di akhir
block "☠ DEADCODE PROBE — kode mati (TIDAK di-collect)"
collect_deadcode_probe

block "🧹 ORPHAN PROBE — leftover debris check"
collect_orphan_probe

# ── Summary ─────────────────────────────────────────────────────
PCT=0
[ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Group    : ${CYAN}$GROUP${NC}"
echo -e "  ${GREEN}✓ Found   : $FOUND / $TOTAL${NC}"
if [ $MISSING -gt 0 ]; then
  echo -e "  ${RED}✗ Missing : $MISSING${NC}"
else
  echo -e "  ${GREEN}✗ Missing : 0${NC}"
fi
if [ $DEADHIT -gt 0 ]; then
  echo -e "  ${YELLOW}☠ Deadcode: $DEADHIT  ${DIM}(masih ada — kandidat hapus, TIDAK di-collect)${NC}"
else
  echo -e "  ${GREEN}☠ Deadcode: 0  ${DIM}(sudah bersih)${NC}"
fi
if [ $STALE -gt 0 ]; then
  echo -e "  ${RED}🧹 Stale   : $STALE  ${DIM}(orphan masih ada — harusnya terhapus)${NC}"
else
  echo -e "  ${GREEN}🧹 Stale   : 0  ${DIM}(no orphan debris)${NC}"
fi
echo -e "  Coverage : ${YELLOW}$PCT%${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""

{
  echo ""
  echo "## SUMMARY"
  echo "Group     : $GROUP"
  echo "Found     : $FOUND / $TOTAL"
  echo "Missing   : $MISSING"
  echo "Deadcode  : $DEADHIT  (kandidat hapus, TIDAK di-collect)"
  echo "Stale     : $STALE  (orphan files/dirs that should have been deleted)"
  echo "Coverage  : $PCT%"
} >> "$FILE"
