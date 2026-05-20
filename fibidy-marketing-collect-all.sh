#!/usr/bin/env bash
# ================================================================
# fibidy-marketing-collect.sh — Interactive marketing snapshot tool
# UPDATED FOR POST-PHASE 10 STRUCTURE (FINAL)
#
# Run from FE repo root (where ./src + ./messages live):
#   bash fibidy-marketing-collect.sh
#
# Pick a group from the menu, output goes to:
#   collections/COLLECT-marketing-<group>-<timestamp>.txt
#
# ─── STRUCTURAL CHANGES vs Phase 7 baseline ────────────────────
#
# PHASE 8 — store-builder hook extraction:
#   sections/store-builder/index.tsx (337-line client monolith)
#     → sections/store-builder/{
#         index.tsx                 ← server composer (~80 lines)
#         form-island.tsx           ← client island (form orchestration)
#         use-store-builder.ts      ← client hook (state + side effects)
#         category-picker.tsx       ← unchanged
#         subdomain-input.tsx       ← unchanged
#         subdomain-suggestions.tsx ← unchanged
#         builder-preview.tsx       ← unchanged
#       }
#
# PHASE 9 — onboarding co-location:
#   lib/data/marketing/tours.tsx (config + provider + names mashed)
#     → lib/marketing/onboarding/{
#         tour-names.ts             ← MARKETING_TOURS + TOUR_AUTO_CLOSE_MS
#         tour-config.tsx           ← useMarketingTours() hook factory
#         tour-provider.tsx         ← MarketingTourProvider component
#       }
#   Tour identifier renamed: 'category-gate' → 'marketing-category-picker'
#   i18n key path UNCHANGED: marketing.storeBuilder.onboarding.categoryGate.*
#
# PHASE 10 — data namespace migration + registry pattern:
#   lib/data/marketing/* (13 files) → lib/marketing/data/*
#   NEW: components/marketing/registry.ts (SectionKey → Component map)
#   page.tsx slimmed: 115 lines → ~50 lines (registry-driven render)
#   sections.ts UPGRADED: exports ACTIVE_SECTIONS, MINIMAL_SECTIONS,
#                         FULL_SECTIONS, DEFAULT_SECTIONS (legacy alias)
#
# ─── PRESERVED FROM EARLIER PHASES ─────────────────────────────
#
# PHASE 4 — features visuals split (6 files in features/visuals/)
# PHASE 5 — scale section split (server composer + domain-stack island)
# PHASE 6 — how-it-works visuals split (5 files in how-it-works/visuals/)
# PHASE 7 — hero section split (5 files + storefront-mockup)
#
# ─── FINAL FOLDER LAYOUT ───────────────────────────────────────
#
# src/components/marketing/
#   ├── layout/        (Phase 1 — header, footer, lenis, etc.)
#   ├── primitives/    (Phase 2 — section-shell, section-eyebrow, etc.)
#   ├── sections/      (Phases 3-8 — 10 section folders)
#   └── registry.ts    (Phase 10 — SectionKey → Component)
#
# src/lib/marketing/
#   ├── data/          (Phase 10 — 13 data files)
#   └── onboarding/    (Phase 9 — 3 tour files)
#
# DELETED:
#   src/lib/data/marketing/    (gone, all files moved to lib/marketing/data/)
#   src/components/marketing/shared/    (gone since Phase 3)
#   src/components/marketing/store-builder/    (gone since Phase 3, root level)
#
# Groups:
#   Sections (10):
#     1)  announcement       6)  how-it-works
#     2)  hero               7)  pricing
#     3)  problem            8)  store-builder
#     4)  features           9)  faq
#     5)  scale             10)  final-cta
#
#   Cross-cutting (5):
#    11)  header             14)  i18n
#    12)  footer             15)  onboarding (NEW — Phase 9)
#    13)  primitives
#
#   Infra + everything (2):
#    16)  infra
#    17)  all
#
# CLI mode also supported:
#   bash fibidy-marketing-collect.sh hero
#   bash fibidy-marketing-collect.sh onboarding
#   bash fibidy-marketing-collect.sh all
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
STALE=0

# ────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────

# cf <path> — collect a file
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

# nf <path> — assert file is absent (orphan check)
# If file IS still there → it's stale debris from before refactor.
nf() {
  local f="$1"
  if [ -f "$f" ]; then
    echo -e "  ${RED}✗ STALE:${NC} ${f#./} ${DIM}(should be deleted post-refactor)${NC}"
    STALE=$((STALE + 1))
    echo "STALE FILE STILL PRESENT: ${f#./} — should be deleted" >> "$FILE"
  fi
  # Note: we do NOT count nf in TOTAL/FOUND — it's a separate orphan tracker.
}

# nd <path> — assert directory is absent (orphan check)
nd() {
  local d="$1"
  if [ -d "$d" ]; then
    echo -e "  ${RED}✗ STALE DIR:${NC} ${d#./} ${DIM}(should be deleted post-refactor)${NC}"
    STALE=$((STALE + 1))
    echo "STALE DIR STILL PRESENT: ${d#./} — should be deleted" >> "$FILE"
  fi
}

# sec <heading> — section heading
sec() {
  echo -e "\n${MAGENTA}▶ $1${NC}"
  echo -e "\n## $1\n" >> "$FILE"
}

# block <heading> — major block heading
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
# Shared bedrock — auto-included in every group except `all`
# (`all` already has these)
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
# Orphan probe — runs in every group to detect leftover debris
# from incomplete refactor migration.
# ────────────────────────────────────────────────────────────────
collect_orphan_probe() {
  sec "🧹 ORPHAN PROBE — files that should be DELETED post-refactor"

  # ── Phase 1-3 orphans ────────────────────────────────────────

  # Old shared/ folder — should be gone entirely
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

  # Old root-level header/footer
  nf "$SRC/components/marketing/marketing-header.tsx"
  nf "$SRC/components/marketing/marketing-footer.tsx"

  # Old store-builder/ root folder (Phase 3 moved these under sections/)
  nf "$SRC/components/marketing/store-builder/category-picker.tsx"
  nf "$SRC/components/marketing/store-builder/subdomain-input.tsx"
  nf "$SRC/components/marketing/store-builder/subdomain-suggestions.tsx"
  nf "$SRC/components/marketing/store-builder/builder-preview.tsx"
  nd "$SRC/components/marketing/store-builder"

  # Old flat section files (Phase 3 converted to folders)
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

  # ── Phase 4 orphan ───────────────────────────────────────────
  # features/visuals/index.tsx (the monolith) was renamed to .ts
  # AND split into 6 files. If .tsx is still around → stale.
  nf "$SRC/components/marketing/sections/features/visuals/index.tsx"

  # ── Phase 9 orphans ──────────────────────────────────────────
  # tours.tsx moved out of lib/data/marketing/ to lib/marketing/onboarding/
  nf "$SRC/lib/data/marketing/tours.tsx"

  # ── Phase 10 orphans ─────────────────────────────────────────
  # All 13 data files moved to lib/marketing/data/
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
  # And the directory itself
  nd "$SRC/lib/data/marketing"
  # lib/data may also be empty if nothing else lives there
  # (don't nd $SRC/lib/data — could legitimately have other contents)
}

# ────────────────────────────────────────────────────────────────
# GROUP COLLECTORS
# ────────────────────────────────────────────────────────────────

# ── 1. ANNOUNCEMENT ─────────────────────────────────────────────
collect_announcement() {
  block "ANNOUNCEMENT — top promo bar"
  sec "Section + data"
  cf "$SRC/components/marketing/sections/announcement/index.tsx"
  cf "$SRC/lib/marketing/data/announcement.ts"
}

# ── 2. HERO (post-Phase 7) ──────────────────────────────────────
collect_hero() {
  block "HERO — main landing band (post-Phase 7 split)"

  sec "Section composer + 4 sub-components + storefront mockup"
  cf "$SRC/components/marketing/sections/hero/index.tsx"
  cf "$SRC/components/marketing/sections/hero/eyebrow-pill.tsx"
  cf "$SRC/components/marketing/sections/hero/headline.tsx"
  cf "$SRC/components/marketing/sections/hero/cta-pair.tsx"
  cf "$SRC/components/marketing/sections/hero/motion-stagger.tsx"
  cf "$SRC/components/marketing/sections/hero/storefront-mockup.tsx"

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

  sec "i18n routing (cta-pair imports useRouter from here)"
  cf "$SRC/i18n/navigation.ts"
}

# ── 3. PROBLEM ──────────────────────────────────────────────────
collect_problem() {
  block "PROBLEM — pain-points section"

  sec "Section + data"
  cf "$SRC/components/marketing/sections/problem/index.tsx"
  cf "$SRC/lib/marketing/data/problem.ts"

  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
}

# ── 4. FEATURES (post-Phase 4) ──────────────────────────────────
collect_features() {
  block "FEATURES — Magic UI bento grid (post-Phase 4 visuals split)"

  sec "Section composer"
  cf "$SRC/components/marketing/sections/features/index.tsx"

  sec "Visuals (split into 6 files post-Phase 4)"
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

  sec "Magic UI primitives (CLI-installed, read-only)"
  cf "$SRC/components/ui/bento-grid.tsx"
  cf "$SRC/components/ui/marquee.tsx"
  cf "$SRC/components/ui/animated-list.tsx"
  cf "$SRC/components/ui/animated-beam.tsx"
  cf "$SRC/components/ui/calendar.tsx"
}

# ── 5. SCALE (post-Phase 5) ─────────────────────────────────────
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

# ── 6. HOW-IT-WORKS (post-Phase 6) ──────────────────────────────
collect_how_it_works() {
  block "HOW-IT-WORKS — 3-step narrative (post-Phase 6 visuals split)"

  sec "Section composer"
  cf "$SRC/components/marketing/sections/how-it-works/index.tsx"

  sec "Visuals (split into 5 files post-Phase 6)"
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

# ── 7. PRICING ──────────────────────────────────────────────────
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

  sec "Feature flag gate (digitalProducts → Coming Soon group)"
  cf "$SRC/lib/config/features.ts"

  sec "Mirror SOURCE — dashboard subscription page (DO NOT modify in polish)"
  cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"

  sec "Mirror i18n — dashboard.subscription.plans.* lives here"
  cf "$MSG/en/dashboard.json"
  cf "$MSG/id/dashboard.json"
}

# ── 8. STORE-BUILDER (post-Phase 8 + 9) ─────────────────────────
collect_store_builder() {
  block "STORE-BUILDER — interactive funnel + register handoff (post-Phase 8 hook split)"

  sec "Section composer (server) + form island (client) + hook"
  cf "$SRC/components/marketing/sections/store-builder/index.tsx"
  cf "$SRC/components/marketing/sections/store-builder/form-island.tsx"
  cf "$SRC/components/marketing/sections/store-builder/use-store-builder.ts"

  sec "Sub-components (untouched since Phase 3)"
  cf "$SRC/components/marketing/sections/store-builder/category-picker.tsx"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-input.tsx"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-suggestions.tsx"
  cf "$SRC/components/marketing/sections/store-builder/builder-preview.tsx"

  sec "Data + onboarding (Phase 9 — tours moved to lib/marketing/onboarding/)"
  cf "$SRC/lib/marketing/data/store-builder.ts"
  cf "$SRC/lib/marketing/onboarding/tour-names.ts"
  cf "$SRC/lib/marketing/onboarding/tour-config.tsx"
  cf "$SRC/lib/marketing/onboarding/tour-provider.tsx"

  sec "Primitives consumed"
  cf "$SRC/components/marketing/primitives/browser-mockup.tsx"
  cf "$SRC/components/marketing/primitives/section-shell.tsx"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"

  sec "Slug + category SoT (validated at module-load time)"
  cf "$SRC/lib/utils/slug-suggestions.ts"
  cf "$SRC/lib/constants/shared/categories.ts"
  cf "$SRC/lib/constants/shared/reserved-subdomains.ts"
  cf "$SRC/lib/constants/shared/slug.constants.ts"

  sec "NextStep onboarding wrapper (generic, untouched by Phase 9)"
  cf "$SRC/components/shared/onboarding/nextstep-provider.tsx"
  cf "$SRC/components/shared/onboarding/nextstep-types.ts"

  sec "Register bridge — where the funnel hands off"
  cf "$SRC/app/[locale]/(auth)/register/page.tsx"
  cf "$SRC/components/auth/register/register.tsx"
  cf "$SRC/components/auth/register/step-review.tsx"
  cf "$SRC/hooks/auth/use-register-wizard.ts"

  sec "Auth i18n (register copy + slug-conflict dialog)"
  cf "$MSG/en/auth.json"
  cf "$MSG/id/auth.json"

  sec "Common i18n (category labels — preview banner reads these)"
  cf "$MSG/en/common.json"
  cf "$MSG/id/common.json"

  sec "i18n routing (locale-aware router)"
  cf "$SRC/i18n/navigation.ts"
}

# ── 9. FAQ ──────────────────────────────────────────────────────
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

  sec "JSON-LD pipeline (FAQ feeds FAQPage schema — now in layout/)"
  cf "$SRC/components/marketing/layout/seo-schema.tsx"
  cf "$SRC/lib/shared/marketing-schema.ts"

  sec "UI primitive"
  cf "$SRC/components/ui/accordion.tsx"
}

# ── 10. FINAL-CTA ───────────────────────────────────────────────
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

# ── 11. HEADER ──────────────────────────────────────────────────
collect_header() {
  block "HEADER — sticky nav (now in layout/, currently minimal mode)"

  sec "Header component (new path)"
  cf "$SRC/components/marketing/layout/header.tsx"

  sec "Backup of full mega-menu version (reference only — still at root)"
  cf "$SRC/components/marketing/marketing-header-bak.tsx"

  sec "Nav data (full mega-menu structure, used when restored)"
  cf "$SRC/lib/marketing/data/nav.ts"

  sec "Logo dependency"
  cf "$SRC/components/layout/auth/auth-logo.tsx"
}

# ── 12. FOOTER ──────────────────────────────────────────────────
collect_footer() {
  block "FOOTER — links + locale + theme (all in layout/)"

  sec "Footer component + data"
  cf "$SRC/components/marketing/layout/footer.tsx"
  cf "$SRC/lib/marketing/data/footer.ts"

  sec "Footer islands (locale switcher + theme toggle)"
  cf "$SRC/components/marketing/layout/locale-switcher.tsx"
  cf "$SRC/components/marketing/layout/theme-toggle.tsx"

  sec "Site config (siteConfig.links.*)"
  cf "$SRC/lib/constants/shared/site.ts"

  sec "Logo + i18n routing (locale switcher reads these)"
  cf "$SRC/components/layout/auth/auth-logo.tsx"
  cf "$SRC/i18n/routing.ts"
  cf "$SRC/i18n/navigation.ts"
}

# ── 13. PRIMITIVES ──────────────────────────────────────────────
# Use this when iterating on the primitives themselves — every
# section depends on these, so refactoring one ripples everywhere.
collect_primitives() {
  block "PRIMITIVES — cross-section reusable layout"

  sec "Layout primitives (4 files in primitives/)"
  cf "$SRC/components/marketing/primitives/section-shell.tsx"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  cf "$SRC/components/marketing/primitives/browser-mockup.tsx"

  sec "Section-specific helpers (now co-located with sections)"
  cf "$SRC/components/marketing/sections/hero/storefront-mockup.tsx"
  cf "$SRC/components/marketing/sections/pricing/pricing-card.tsx"
  cf "$SRC/components/marketing/sections/faq/faq-item.tsx"

  sec "Features visuals barrel (Phase 4 split — list barrel only)"
  cf "$SRC/components/marketing/sections/features/visuals/index.ts"

  sec "How-it-works visuals barrel (Phase 6 split — list barrel only)"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/index.ts"

  sec "Section registry (Phase 10)"
  cf "$SRC/components/marketing/registry.ts"

  sec "Layout chrome (page-level scaffolding)"
  cf "$SRC/components/marketing/layout/lenis-provider.tsx"
  cf "$SRC/components/marketing/layout/seo-schema.tsx"
  cf "$SRC/components/marketing/layout/locale-switcher.tsx"
  cf "$SRC/components/marketing/layout/theme-toggle.tsx"
}

# ── 14. I18N (copywriting polish — TODO target) ─────────────────
collect_i18n() {
  block "I18N — copywriting polish (all bundles + data layer)"

  sec "Marketing i18n (both locales)"
  cf "$MSG/en/marketing.json"
  cf "$MSG/id/marketing.json"

  sec "Auth i18n (register bridge from store-builder)"
  cf "$MSG/en/auth.json"
  cf "$MSG/id/auth.json"

  sec "Common i18n (category labels — used in builder preview, register review)"
  cf "$MSG/en/common.json"
  cf "$MSG/id/common.json"

  sec "Dashboard i18n (pricing-section mirrors subscription.plans.*)"
  cf "$MSG/en/dashboard.json"
  cf "$MSG/id/dashboard.json"

  sec "Marketing data layer — Phase 10 paths (shows which keys feed which section)"
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

# ── 15. ONBOARDING (Phase 9 — NEW group) ────────────────────────
collect_onboarding() {
  block "ONBOARDING — NextStep tours (Phase 9 co-location)"

  sec "Marketing-specific tour plumbing (lib/marketing/onboarding/)"
  cf "$SRC/lib/marketing/onboarding/tour-names.ts"
  cf "$SRC/lib/marketing/onboarding/tour-config.tsx"
  cf "$SRC/lib/marketing/onboarding/tour-provider.tsx"

  sec "Generic NextStep wrapper (untouched by Phase 9)"
  cf "$SRC/components/shared/onboarding/nextstep-provider.tsx"
  cf "$SRC/components/shared/onboarding/nextstep-types.ts"

  sec "Tour consumer — store-builder hook (Phase 8)"
  cf "$SRC/components/marketing/sections/store-builder/use-store-builder.ts"

  sec "Tour target — CategoryPicker (id='builder-category-picker')"
  cf "$SRC/components/marketing/sections/store-builder/category-picker.tsx"

  sec "Marketing layout — wires MarketingTourProvider"
  cf "$SRC/app/[locale]/(marketing)/layout.tsx"

  sec "Marketing i18n (tour copy at marketing.storeBuilder.onboarding.categoryGate.*)"
  cf "$MSG/en/marketing.json"
  cf "$MSG/id/marketing.json"
}

# ── 16. INFRA ───────────────────────────────────────────────────
collect_infra() {
  block "INFRA — routing, layout, fonts, OG, SEO config"

  sec "Layouts (root + locale + marketing route group)"
  cf "$SRC/app/layout.tsx"
  cf "$SRC/app/[locale]/layout.tsx"
  cf "$SRC/app/[locale]/(marketing)/layout.tsx"
  cf "$SRC/app/[locale]/(marketing)/page.tsx"

  sec "Section registry (Phase 10)"
  cf "$SRC/components/marketing/registry.ts"

  sec "Edge proxy (subdomain + custom domain + auth gate)"
  cf "$SRC/proxy.ts"

  sec "Global CSS (font vars + theme tokens)"
  cf "$SRC/app/globals.css"

  sec "OG images (root fallback)"
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

# ── 17. ALL — full snapshot (post-Phase 10) ─────────────────────
collect_all() {
  block "GROUP A — Marketing Components (post-Phase 10 structure)"

  sec "Sections (10 total, each in its own folder)"
  cf "$SRC/components/marketing/sections/announcement/index.tsx"

  # Hero — Phase 7 split (5 sub-files + storefront-mockup)
  cf "$SRC/components/marketing/sections/hero/index.tsx"
  cf "$SRC/components/marketing/sections/hero/eyebrow-pill.tsx"
  cf "$SRC/components/marketing/sections/hero/headline.tsx"
  cf "$SRC/components/marketing/sections/hero/cta-pair.tsx"
  cf "$SRC/components/marketing/sections/hero/motion-stagger.tsx"
  cf "$SRC/components/marketing/sections/hero/storefront-mockup.tsx"

  cf "$SRC/components/marketing/sections/problem/index.tsx"

  # Features — Phase 4 split (composer + 6 visuals)
  cf "$SRC/components/marketing/sections/features/index.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/index.ts"
  cf "$SRC/components/marketing/sections/features/visuals/studio-marquee.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/orders-list.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/channels-beam.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/channels-icons.tsx"
  cf "$SRC/components/marketing/sections/features/visuals/save-time-calendar.tsx"

  # Scale — Phase 5 split (composer + domain-stack)
  cf "$SRC/components/marketing/sections/scale/index.tsx"
  cf "$SRC/components/marketing/sections/scale/domain-stack.tsx"

  # How-it-works — Phase 6 split (composer + 5 visuals)
  cf "$SRC/components/marketing/sections/how-it-works/index.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/index.ts"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/dotted-background.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/build-visual.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/share-visual.tsx"
  cf "$SRC/components/marketing/sections/how-it-works/visuals/sell-visual.tsx"

  cf "$SRC/components/marketing/sections/pricing/index.tsx"
  cf "$SRC/components/marketing/sections/pricing/pricing-card.tsx"

  # Store-builder — Phase 8 split (composer + form-island + hook + 4 sub-components)
  cf "$SRC/components/marketing/sections/store-builder/index.tsx"
  cf "$SRC/components/marketing/sections/store-builder/form-island.tsx"
  cf "$SRC/components/marketing/sections/store-builder/use-store-builder.ts"
  cf "$SRC/components/marketing/sections/store-builder/category-picker.tsx"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-input.tsx"
  cf "$SRC/components/marketing/sections/store-builder/subdomain-suggestions.tsx"
  cf "$SRC/components/marketing/sections/store-builder/builder-preview.tsx"

  cf "$SRC/components/marketing/sections/faq/index.tsx"
  cf "$SRC/components/marketing/sections/faq/faq-item.tsx"
  cf "$SRC/components/marketing/sections/final-cta/index.tsx"

  sec "Section registry (Phase 10)"
  cf "$SRC/components/marketing/registry.ts"

  sec "Primitives (cross-section)"
  cf "$SRC/components/marketing/primitives/section-shell.tsx"
  cf "$SRC/components/marketing/primitives/section-eyebrow.tsx"
  cf "$SRC/components/marketing/primitives/line-grid-frame.tsx"
  cf "$SRC/components/marketing/primitives/browser-mockup.tsx"

  sec "Layout chrome (page-level scaffolding)"
  cf "$SRC/components/marketing/layout/header.tsx"
  cf "$SRC/components/marketing/layout/footer.tsx"
  cf "$SRC/components/marketing/layout/lenis-provider.tsx"
  cf "$SRC/components/marketing/layout/locale-switcher.tsx"
  cf "$SRC/components/marketing/layout/theme-toggle.tsx"
  cf "$SRC/components/marketing/layout/seo-schema.tsx"

  sec "Backup files still at root level"
  cf "$SRC/components/marketing/marketing-header-bak.tsx"

  sec "🧹 Orphan probe (these should all be ABSENT)"
  collect_orphan_probe

  block "GROUP B — Magic UI Primitives (CLI-installed, read-only)"
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

  block "GROUP C — Onboarding (Phase 9 split + generic wrapper)"
  sec "Marketing-specific onboarding (lib/marketing/onboarding/)"
  cf "$SRC/lib/marketing/onboarding/tour-names.ts"
  cf "$SRC/lib/marketing/onboarding/tour-config.tsx"
  cf "$SRC/lib/marketing/onboarding/tour-provider.tsx"
  sec "Generic NextStep wrapper (untouched)"
  cf "$SRC/components/shared/onboarding/nextstep-provider.tsx"
  cf "$SRC/components/shared/onboarding/nextstep-types.ts"

  block "GROUP D — Marketing Data Layer (Phase 10 paths)"
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

  block "GROUP E — Marketing i18n"
  sec "Marketing namespace"
  cf "$MSG/en/marketing.json"
  cf "$MSG/id/marketing.json"
  sec "Auth bridges (register consumes builder agreement)"
  cf "$MSG/en/auth.json"
  cf "$MSG/id/auth.json"
  sec "Common (category labels + shared state primitives)"
  cf "$MSG/en/common.json"
  cf "$MSG/id/common.json"

  block "GROUP F — Marketing Page Composer (Phase 10 slim version)"
  cf "$SRC/app/[locale]/(marketing)/page.tsx"
  cf "$SRC/app/[locale]/(marketing)/layout.tsx"

  block "GROUP G — Register Bridges"
  cf "$SRC/app/[locale]/(auth)/register/page.tsx"
  cf "$SRC/components/auth/register/register.tsx"
  cf "$SRC/components/auth/register/step-review.tsx"
  cf "$SRC/hooks/auth/use-register-wizard.ts"

  block "GROUP H — SoT Dependencies (consumed by marketing)"
  cf "$SRC/lib/constants/shared/categories.ts"
  cf "$SRC/lib/constants/shared/reserved-subdomains.ts"
  cf "$SRC/lib/constants/shared/slug.constants.ts"
  cf "$SRC/lib/constants/shared/seo.config.ts"
  cf "$SRC/lib/constants/shared/site.ts"
  cf "$SRC/lib/config/features.ts"
  cf "$SRC/types/marketing.ts"

  block "GROUP I — Pricing Mirror Source (DO NOT modify in polish)"
  cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"
  cf "$MSG/en/dashboard.json"
  cf "$MSG/id/dashboard.json"

  block "GROUP J — Marketing-Adjacent Infra"
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

declare -a GROUP_KEYS=(
  "announcement"   #  1
  "hero"           #  2
  "problem"        #  3
  "features"       #  4
  "scale"          #  5
  "how-it-works"   #  6
  "pricing"        #  7
  "store-builder"  #  8
  "faq"            #  9
  "final-cta"      # 10
  "header"         # 11
  "footer"         # 12
  "primitives"     # 13
  "i18n"           # 14
  "onboarding"     # 15  (NEW — Phase 9)
  "infra"          # 16
  "all"            # 17
)

group_label() {
  case "$1" in
    announcement)  echo "announcement bar (top promo strip)" ;;
    hero)          echo "hero section (Phase 7: 5 files + mockup)" ;;
    problem)       echo "problem section (3 pain points)" ;;
    features)      echo "features bento (Phase 4: composer + 6 visuals)" ;;
    scale)         echo "scale section (Phase 5: server + DomainStack island)" ;;
    how-it-works)  echo "how-it-works (Phase 6: composer + 5 visuals)" ;;
    pricing)       echo "pricing section (3-tier + dashboard mirror)" ;;
    store-builder) echo "store-builder funnel (Phase 8: composer + island + hook)" ;;
    faq)           echo "FAQ accordion + JSON-LD feed" ;;
    final-cta)     echo "final CTA band (closing)" ;;
    header)        echo "marketing header (layout/, currently minimal mode)" ;;
    footer)        echo "marketing footer (layout/, links + locale + theme)" ;;
    primitives)    echo "primitives (cross-section layout, mockups, helpers)" ;;
    i18n)          echo "all i18n bundles + data layer (copywriting polish)" ;;
    onboarding)    echo "NextStep tours (Phase 9: lib/marketing/onboarding/)" ;;
    infra)         echo "routing, layouts, fonts, OG, SEO config" ;;
    all)           echo "FULL snapshot (everything — post-Phase 10 + orphan probe)" ;;
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
    onboarding)    collect_onboarding ;;
    infra)         collect_infra ;;
    all)           collect_all ;;
    *)             return 1 ;;
  esac
}

# ────────────────────────────────────────────────────────────────
# Menu rendering
# ────────────────────────────────────────────────────────────────

print_menu() {
  echo ""
  echo -e "${WHITE}${BOLD}Fibidy Marketing Collector${NC} ${DIM}(post-Phase 10 structure — FINAL)${NC}"
  echo -e "${DIM}Pick a group to snapshot. Output → ${OUT}/COLLECT-marketing-<group>-<ts>.txt${NC}"
  echo ""
  echo -e "  ${CYAN}Sections (10)${NC}"
  echo -e "    ${YELLOW}1)${NC}  announcement     ${YELLOW}6)${NC}  how-it-works ${DIM}(P6)${NC}"
  echo -e "    ${YELLOW}2)${NC}  hero ${DIM}(P7)${NC}        ${YELLOW}7)${NC}  pricing"
  echo -e "    ${YELLOW}3)${NC}  problem          ${YELLOW}8)${NC}  store-builder ${DIM}(P8)${NC}"
  echo -e "    ${YELLOW}4)${NC}  features ${DIM}(P4)${NC}    ${YELLOW}9)${NC}  faq"
  echo -e "    ${YELLOW}5)${NC}  scale ${DIM}(P5)${NC}      ${YELLOW}10)${NC}  final-cta"
  echo ""
  echo -e "  ${CYAN}Cross-cutting${NC}"
  echo -e "   ${YELLOW}11)${NC}  header          ${YELLOW}14)${NC}  i18n  ${DIM}(copywriting polish)${NC}"
  echo -e "   ${YELLOW}12)${NC}  footer          ${YELLOW}15)${NC}  onboarding ${DIM}(P9 — NextStep tours)${NC}"
  echo -e "   ${YELLOW}13)${NC}  primitives"
  echo ""
  echo -e "  ${CYAN}Infra + everything${NC}"
  echo -e "   ${YELLOW}16)${NC}  infra           ${YELLOW}17)${NC}  all   ${DIM}(full + orphan probe)${NC}"
  echo ""
  echo -e "    ${YELLOW}q)${NC}  quit"
  echo ""
}

resolve_group() {
  local input="$1"
  input="$(echo "$input" | tr -d '[:space:]')"

  case "$input" in
    1)  echo "announcement"  ;;
    2)  echo "hero"          ;;
    3)  echo "problem"       ;;
    4)  echo "features"      ;;
    5)  echo "scale"         ;;
    6)  echo "how-it-works"  ;;
    7)  echo "pricing"       ;;
    8)  echo "store-builder" ;;
    9)  echo "faq"           ;;
    10) echo "final-cta"     ;;
    11) echo "header"        ;;
    12) echo "footer"        ;;
    13) echo "primitives"    ;;
    14) echo "i18n"          ;;
    15) echo "onboarding"    ;;
    16) echo "infra"         ;;
    17) echo "all"           ;;
    *)
      case "$input" in
        announcement|announce) echo "announcement" ;;
        hero)                  echo "hero" ;;
        problem)               echo "problem" ;;
        features|feature)      echo "features" ;;
        scale)                 echo "scale" ;;
        how-it-works|howitworks|how) echo "how-it-works" ;;
        pricing|price)         echo "pricing" ;;
        store-builder|storebuilder|builder) echo "store-builder" ;;
        faq)                   echo "faq" ;;
        final-cta|finalcta|cta) echo "final-cta" ;;
        header|head)           echo "header" ;;
        footer|foot)           echo "footer" ;;
        primitives|shared|prim) echo "primitives" ;;
        i18n|copy|copywriting) echo "i18n" ;;
        onboarding|tours|tour|nextstep) echo "onboarding" ;;
        infra|infrastructure)  echo "infra" ;;
        all|everything|full)   echo "all" ;;
        *)                     return 1 ;;
      esac
      ;;
  esac
}

# ────────────────────────────────────────────────────────────────
# Main
# ────────────────────────────────────────────────────────────────

if [ ! -d "$SRC" ] || [ ! -d "$MSG" ]; then
  echo -e "${RED}✗ Error:${NC} this script must be run from the FE repo root."
  echo -e "  Expected to find ${CYAN}./src${NC} and ${CYAN}./messages${NC} in $(pwd)"
  exit 1
fi

mkdir -p "$OUT"

GROUP=""
if [ $# -ge 1 ]; then
  GROUP="$(resolve_group "$1")" || {
    echo -e "${RED}✗ Unknown group:${NC} $1"
    echo -e "  Run ${CYAN}bash $0${NC} (no args) to see the menu."
    exit 1
  }
else
  while true; do
    print_menu
    printf "  ${BOLD}Pick a group [1-17, name, or q]:${NC} "
    read -r INPUT

    case "$INPUT" in
      q|Q|quit|exit)
        echo -e "${DIM}Bye.${NC}"
        exit 0
        ;;
      "")
        echo -e "${YELLOW}  (empty — pick a number, name, or q)${NC}"
        continue
        ;;
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
  echo "##  COLLECTION — Fibidy Marketing (post-Phase 10 structure — FINAL)"
  echo "##  Group      : $GROUP"
  echo "##  Label      : $LABEL"
  echo "##  Generated  : $(date '+%Y-%m-%d %H:%M:%S')"
  echo "##  Working dir: $(pwd)"
  echo "################################################################"
  echo ""
} > "$FILE"

echo ""
echo -e "${WHITE}${BOLD}→ Collecting:${NC} ${CYAN}$GROUP${NC} ${DIM}(${LABEL})${NC}"

# Auto-include shared bedrock for every group except `all`
if [ "$GROUP" != "all" ]; then
  collect_bedrock
fi

# Run the group-specific collector
collect_for "$GROUP"

# Run orphan probe for non-`all` groups (`all` already runs it inline)
if [ "$GROUP" != "all" ]; then
  block "🧹 ORPHAN PROBE — leftover debris check"
  collect_orphan_probe
fi

# ────────────────────────────────────────────────────────────────
# Summary
# ────────────────────────────────────────────────────────────────

PCT=0
[ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Group   : ${CYAN}$GROUP${NC}"
echo -e "  ${GREEN}✓ Found  : $FOUND / $TOTAL${NC}"
if [ $MISSING -gt 0 ]; then
  echo -e "  ${RED}✗ Missing: $MISSING${NC}"
else
  echo -e "  ${GREEN}✗ Missing: 0${NC}"
fi
if [ $STALE -gt 0 ]; then
  echo -e "  ${RED}🧹 Stale  : $STALE  ${DIM}(orphan files/dirs still present — should be deleted)${NC}"
else
  echo -e "  ${GREEN}🧹 Stale  : 0  ${DIM}(no orphan debris — clean)${NC}"
fi
echo -e "  Coverage : ${YELLOW}$PCT%${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""

{
  echo ""
  echo "## SUMMARY"
  echo "Group    : $GROUP"
  echo "Found    : $FOUND / $TOTAL"
  echo "Missing  : $MISSING"
  echo "Stale    : $STALE  (orphan files/dirs that should have been deleted)"
  echo "Coverage : $PCT%"
} >> "$FILE"