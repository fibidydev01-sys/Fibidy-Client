#!/usr/bin/env bash
# ================================================================
# fibidy-marketing-collect-v8.sh — Marketing Polish v15.3 (May 2026)
#
# v8 = v7 + Vercel-vibes line-grid system + Geist font swap.
# Polish bundles delivered v15.0 → v15.3.
#
# CHANGES VS v7:
#   GROUP A — Marketing Components
#     + sections/scale-section.tsx       NEW (v15.0) — stacked-domains
#                                        proof point, slotted between
#                                        features and howItWorks.
#                                        Bottom 3 feature cols use
#                                        <LineGridFrame> from v15.2.
#     + shared/line-grid-frame.tsx       NEW (v15.2) — reusable primitive.
#                                        Subtle grid bg + bordered plate
#                                        + corner cross marks. Used by
#                                        SIX sections (see below).
#     ~ sections/problem-section.tsx     UPDATED (v15.3) — 3 cards now
#                                        flat columns inside LineGridFrame.
#     ~ sections/how-it-works-section.tsx UPDATED (v15.2) — rows wrapped
#                                        in LineGridFrame; 2-col kanan-kiri
#                                        alternating PRESERVED at md+.
#     ~ sections/pricing-section.tsx     UPDATED (v15.2) — cards in
#                                        LineGridFrame; Popular badge
#                                        z-30 on highlighted column.
#     ~ sections/faq-section.tsx         UPDATED (v15.3) — accordion in
#                                        LineGridFrame; last-child
#                                        border-b cleared.
#     ~ sections/final-cta-section.tsx   UPDATED (v15.3) — rounded-3xl
#                                        gradient + halo REMOVED, now
#                                        in LineGridFrame.
#     ~ shared/pricing-card.tsx          UPDATED (v15.1) — flat contract,
#                                        no outer chrome, coupled to
#                                        LineGridFrame wrapper.
#     ~ shared/faq-item.tsx              UPDATED (v15.3) — trigger and
#                                        content carry px-6 md:px-8.
#                                        Padding lives INSIDE item, not
#                                        on Accordion wrapper.
#
#   GROUP D — Marketing Data Layer
#     + lib/data/marketing/scale.ts      NEW (v15.0) — domain stack
#                                        entries + scale features.
#
#   GROUP E — Marketing i18n
#     ~ marketing.json {en,id}           UPDATED — added marketing.scale.*
#                                        block (v15.0) and
#                                        marketing.pricing.popularBadge
#                                        (v15.1).
#
#   GROUP F — Marketing Page Composer
#     ~ [locale]/(marketing)/page.tsx    UPDATED — REGISTRY now maps
#                                        'scale' → ScaleSection.
#
#   GROUP H — SoT Dependencies
#     ~ types/marketing.ts               UPDATED — SectionKey union
#                                        gained 'scale'.
#
#   GROUP J — Marketing-Adjacent Infra
#     ~ [locale]/layout.tsx              UPDATED (v15.3) — Inter →
#                                        Geist + Geist_Mono via
#                                        next/font/google. Variables:
#                                        --font-geist-sans + -mono.
#     ~ globals.css                      UPDATED (v15.3) — :root font
#                                        vars now reference geist vars.
#
# Section count: 10 (was 9) — scale slotted between features and
# howItWorks per DEFAULT_SECTIONS in lib/data/marketing/sections.ts.
#
# File collection ONLY — no sanity greps, no diffs. Pure code snapshot.
# Run from FE repo root: bash fibidy-marketing-collect-v8.sh
# Output: collections/COLLECT-marketing-polish-v8-[timestamp].txt
# ================================================================

set -u

GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; YELLOW='\033[1;33m'
WHITE='\033[1;37m'; DIM='\033[2m'; NC='\033[0m'

SRC="./src"; MSG="./messages"; PKG="./package.json"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-marketing-polish-v8-${TIMESTAMP}.txt"

mkdir -p "$OUT"
FOUND=0; MISSING=0; TOTAL=0

cf() {
  local f="$1"; TOTAL=$((TOTAL + 1))
  if [ -f "$f" ]; then
    local lines; lines=$(wc -l < "$f" 2>/dev/null || echo "0")
    echo -e "  ${GREEN}✓${NC} ${f#./} ${DIM}(${lines} lines)${NC}"
    FOUND=$((FOUND + 1))
    { echo "================================================"
      echo "FILE: ${f#./}"; echo "Lines: $lines"
      echo "================================================"
      echo ""; cat "$f"; printf "\n\n"
    } >> "$FILE"
  else
    echo -e "  ${RED}✗ MISSING:${NC} ${f#./}"
    MISSING=$((MISSING + 1))
    echo "FILE: ${f#./} — *** NOT FOUND ***" >> "$FILE"
  fi
}

nf() {
  local f="$1"; TOTAL=$((TOTAL + 1))
  if [ -f "$f" ]; then
    echo -e "  ${RED}✗ STALE:${NC} ${f#./} ${DIM}(should be deleted)${NC}"
    MISSING=$((MISSING + 1)); echo "FILE: ${f#./} — STALE" >> "$FILE"
  else
    echo -e "  ${GREEN}✓ DELETED:${NC} ${f#./}"
    FOUND=$((FOUND + 1)); echo "FILE: ${f#./} — ✓ absent" >> "$FILE"
  fi
}

sec() { echo -e "\n${MAGENTA}▶ $1${NC}"; echo -e "\n## $1\n" >> "$FILE"; }
block() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "\n################################################################\n##  $1\n################################################################\n" >> "$FILE"
}

cat > "$FILE" << EOF
################################################################
##  COLLECTION — Fibidy Marketing Polish v15.3 (May 2026)
##  Generated  : $(date '+%Y-%m-%d %H:%M:%S')
##  Collector  : v8 (was v7)
##  Phase      : 5 polish — Vercel-vibes line-grid + Geist font
##  Sections   : 10 (added scale between features and howItWorks)
##  vs v7      : + scale-section, line-grid-frame, scale.ts data
##               ~ 6 sections wrapped in LineGridFrame
##               ~ Geist font replaces Inter via next/font/google
################################################################

EOF

echo -e "\n${WHITE}Fibidy Marketing Collector v8 — Polish v15.3 snapshot${NC}"

# ════════════════════════════════════════════════════════════════
block "GROUP A — Marketing Components"
# ════════════════════════════════════════════════════════════════

sec "Sections (10 total — scale added in v15.0)"
cf "$SRC/components/marketing/sections/announcement-bar.tsx"
cf "$SRC/components/marketing/sections/hero-section.tsx"
cf "$SRC/components/marketing/sections/problem-section.tsx"        # v15.3 — LineGridFrame
cf "$SRC/components/marketing/sections/features-section.tsx"       # v6 — 'use client', 4-card bento (UNCHANGED in v15)
cf "$SRC/components/marketing/sections/scale-section.tsx"          # v15.0 NEW + v15.2 LineGridFrame
cf "$SRC/components/marketing/sections/how-it-works-section.tsx"   # v15.2 — LineGridFrame, 2-col kanan-kiri preserved
cf "$SRC/components/marketing/sections/pricing-section.tsx"        # v15.2 — LineGridFrame, Popular badge
cf "$SRC/components/marketing/sections/store-builder-section.tsx"  # v4 — auto-dismiss tour (UNCHANGED in v15)
cf "$SRC/components/marketing/sections/faq-section.tsx"            # v15.3 — LineGridFrame
cf "$SRC/components/marketing/sections/final-cta-section.tsx"      # v15.3 — LineGridFrame, halo removed

sec "Shared primitives"
cf "$SRC/components/marketing/shared/section-shell.tsx"
cf "$SRC/components/marketing/shared/section-eyebrow.tsx"
cf "$SRC/components/marketing/shared/line-grid-frame.tsx"          # v15.2 NEW — Vercel-vibes primitive
cf "$SRC/components/marketing/shared/feature-visuals.tsx"          # v6 — 4 visuals (UNCHANGED in v15)
cf "$SRC/components/marketing/shared/pricing-card.tsx"             # v15.1 — flat, coupled to LineGridFrame
cf "$SRC/components/marketing/shared/faq-item.tsx"                 # v15.3 — px-6 md:px-8 trigger/content
cf "$SRC/components/marketing/shared/storefront-mockup.tsx"
cf "$SRC/components/marketing/shared/browser-mockup.tsx"
cf "$SRC/components/marketing/shared/marketing-schema.tsx"
cf "$SRC/components/marketing/shared/lenis-provider.tsx"
cf "$SRC/components/marketing/shared/locale-switcher.tsx"
cf "$SRC/components/marketing/shared/theme-toggle.tsx"

sec "Store builder (UNCHANGED in v15)"
cf "$SRC/components/marketing/store-builder/category-picker.tsx"
cf "$SRC/components/marketing/store-builder/subdomain-input.tsx"
cf "$SRC/components/marketing/store-builder/subdomain-suggestions.tsx"
cf "$SRC/components/marketing/store-builder/builder-preview.tsx"

sec "Header + footer (UNCHANGED in v15 — Geist auto-upgrades typography)"
cf "$SRC/components/marketing/marketing-header.tsx"
cf "$SRC/components/marketing/marketing-footer.tsx"

sec "Orphans (should be absent)"
nf "$SRC/components/marketing/shared/safari-frame.tsx"
nf "$SRC/components/marketing/shared/feature-tile.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP B — Magic UI Primitives (CLI-installed, read-only)"
# ════════════════════════════════════════════════════════════════

cf "$SRC/components/ui/bento-grid.tsx"
cf "$SRC/components/ui/marquee.tsx"
cf "$SRC/components/ui/animated-list.tsx"
cf "$SRC/components/ui/animated-beam.tsx"
cf "$SRC/components/ui/calendar.tsx"
cf "$SRC/components/ui/button.tsx"
cf "$SRC/components/ui/accordion.tsx"   # consumed by faq-item.tsx

# ════════════════════════════════════════════════════════════════
block "GROUP C — Onboarding Wrapper (NextStep.js — UNCHANGED in v15)"
# ════════════════════════════════════════════════════════════════

cf "$SRC/components/shared/onboarding/nextstep-provider.tsx"
cf "$SRC/components/shared/onboarding/nextstep-types.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP D — Marketing Data Layer"
# ════════════════════════════════════════════════════════════════

cf "$SRC/lib/data/marketing/sections.ts"
cf "$SRC/lib/data/marketing/announcement.ts"
cf "$SRC/lib/data/marketing/hero.ts"
cf "$SRC/lib/data/marketing/problem.ts"
cf "$SRC/lib/data/marketing/how-it-works.ts"
cf "$SRC/lib/data/marketing/features.ts"                            # v6 — 4 tiles (UNCHANGED in v15)
cf "$SRC/lib/data/marketing/scale.ts"                               # v15.0 NEW — domain stack + features
cf "$SRC/lib/data/marketing/pricing.ts"
cf "$SRC/lib/data/marketing/store-builder.ts"
cf "$SRC/lib/data/marketing/faq.ts"
cf "$SRC/lib/data/marketing/cta.ts"
cf "$SRC/lib/data/marketing/footer.ts"
cf "$SRC/lib/data/marketing/nav.ts"
cf "$SRC/lib/data/marketing/tours.tsx"                              # v4 — showSkip:false (UNCHANGED in v15)
cf "$SRC/lib/utils/slug-suggestions.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP E — Marketing i18n"
# v15.0 added marketing.scale.* block in en + id
# v15.1 added marketing.pricing.popularBadge in en + id
# ════════════════════════════════════════════════════════════════

sec "Marketing namespace"
cf "$MSG/en/marketing.json"
cf "$MSG/id/marketing.json"

sec "Auth bridges (register consumes builder agreement — UNCHANGED in v15)"
cf "$MSG/en/auth.json"
cf "$MSG/id/auth.json"

sec "Common (category labels + shared state primitives — UNCHANGED in v15)"
cf "$MSG/en/common.json"
cf "$MSG/id/common.json"

# ════════════════════════════════════════════════════════════════
block "GROUP F — Marketing Page Composer"
# v15.0 — REGISTRY gained 'scale' → ScaleSection mapping
# ════════════════════════════════════════════════════════════════

cf "$SRC/app/[locale]/(marketing)/page.tsx"
cf "$SRC/app/[locale]/(marketing)/layout.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP G — Register Bridges (UNCHANGED in v15)"
# Phase 3 contracts — v15.x doesn't modify these. Cross-reference only.
# ════════════════════════════════════════════════════════════════

cf "$SRC/app/[locale]/(auth)/register/page.tsx"
cf "$SRC/components/auth/register/register.tsx"
cf "$SRC/components/auth/register/step-review.tsx"
cf "$SRC/hooks/auth/use-register-wizard.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP H — SoT Dependencies (consumed by marketing)"
# ════════════════════════════════════════════════════════════════

cf "$SRC/lib/constants/shared/categories.ts"
cf "$SRC/lib/constants/shared/reserved-subdomains.ts"
cf "$SRC/lib/constants/shared/slug.constants.ts"
cf "$SRC/lib/constants/shared/seo.config.ts"
cf "$SRC/lib/constants/shared/site.ts"
cf "$SRC/lib/config/features.ts"
cf "$SRC/types/marketing.ts"                                        # v15.0 — SectionKey union + 'scale'

# ════════════════════════════════════════════════════════════════
block "GROUP I — Pricing Mirror Source (DO NOT modify in polish)"
# ════════════════════════════════════════════════════════════════

cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"

# ════════════════════════════════════════════════════════════════
block "GROUP J — Marketing-Adjacent Infra"
# v15.3 — Geist font swap + globals.css font var update
# ════════════════════════════════════════════════════════════════

cf "$SRC/proxy.ts"
cf "$SRC/app/layout.tsx"                                            # root — verify Geist source (geist pkg vs next/font/google)
cf "$SRC/app/[locale]/layout.tsx"                                   # v15.3 — Geist via next/font/google
cf "$SRC/lib/shared/marketing-schema.ts"
cf "$SRC/lib/shared/seo.ts"
cf "$SRC/lib/shared/utils.ts"
cf "$SRC/app/opengraph-image.tsx"
cf "$SRC/app/twitter-image.tsx"
cf "$PKG"
cf "./next.config.mjs" 2>/dev/null || cf "./next.config.ts"
cf "$SRC/app/globals.css"                                           # v15.3 — --font-sans + --font-mono updated to geist vars

# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

PCT=0; [ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓ Found  : $FOUND / $TOTAL${NC}"
[ $MISSING -gt 0 ] && \
  echo -e "  ${RED}✗ Missing: $MISSING${NC}" || \
  echo -e "  ${GREEN}✗ Missing: 0${NC}"
echo -e "  Coverage : ${YELLOW}$PCT%${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""
echo -e "  ${DIM}── Reading order for next polish chat ───────────────${NC}"
echo -e "  ${DIM}  1. HANDOFF.md                       (v15.0→v15.3 polish state)${NC}"
echo -e "  ${DIM}  2. This collection output            (current code on disk)${NC}"
echo -e "  ${DIM}  3. The 4 v15.x bundles, if needed    (fibidy-vercel-vibes etc.)${NC}"
echo ""

{ echo ""
  echo "## SUMMARY"
  echo "Found    : $FOUND / $TOTAL"
  echo "Missing  : $MISSING"
  echo "Coverage : $PCT%"
} >> "$FILE"