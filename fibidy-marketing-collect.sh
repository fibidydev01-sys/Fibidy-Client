#!/usr/bin/env bash
# ================================================================
# fibidy-marketing-collect.sh
# Marketing-Only Collection — POLISH PHASE
#
# Marketing development (Phases 1+2+3+4) is COMPLETE. This script
# collects only files relevant to marketing UX polish work — gap
# filling, consistency tightening, smoothness improvements.
#
# What's IN scope:
#   - All components/marketing/**
#   - All lib/data/marketing/*
#   - Marketing route group (app/[locale]/(marketing)/*)
#   - Marketing-driven register flow (auto-skip + agreement bridge)
#   - SoT dependencies marketing consumes (categories, reserved-
#     subdomains, slug, seo.config, features, common.json)
#   - Pricing mirror source (subscription page + dashboard.json) —
#     only because Q19 mirrors it; not a polish target itself
#   - Marketing-adjacent infra (proxy, root + locale layouts, schema)
#
# What's OUT of scope (skipped):
#   - Dashboard pages (except subscription, mirror-only)
#   - Storefront (store/[slug]/*)
#   - Admin
#   - Discover marketplace
#   - Library / Products / Studio / Settings
#   - Buyer flows (use-buyer-register, etc.)
#
# Groups:
#   A — Marketing Components       (sections + shared + store-builder)
#   B — Marketing Data Layer       (lib/data/marketing/*)
#   C — Marketing i18n             (messages/{en,id}/marketing.json + bridges)
#   D — Marketing Page Composer    (route group + layout)
#   E — Marketing-Driven Bridges   (register integration + wizard)
#   F — SoT Dependencies           (categories/reserved/slug/seo/features)
#   G — Pricing Mirror Source      (subscription page + dashboard.json)
#   H — Marketing-Adjacent Infra   (proxy + layouts + schema generators)
#   I — Polish-Phase Sanity Greps  (motion / a11y / focus / scroll / contrast)
#
# Run from FE repo root (directory containing src/ and messages/):
#   bash fibidy-marketing-collect.sh
#
# Output: collections/COLLECT-marketing-polish-[timestamp].txt
# Tested: macOS / Linux / Windows (Git Bash, WSL2)
# ================================================================

set -u

GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; WHITE='\033[1;37m'
YELLOW='\033[1;33m'; DIM='\033[2m'; NC='\033[0m'

SRC="./src"
MSG="./messages"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-marketing-polish-${TIMESTAMP}.txt"

mkdir -p "$OUT"
FOUND=0; MISSING=0; TOTAL=0
GREP_PASS=0; GREP_FAIL=0

# ── Helpers ─────────────────────────────────────────────────────

cf() {
  local f="$1"
  TOTAL=$((TOTAL + 1))
  if [ -f "$f" ]; then
    local lines
    lines=$(wc -l < "$f" 2>/dev/null || echo "0")
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
    {
      echo "================================================"
      echo "FILE: ${f#./}"
      echo "STATUS: *** FILE NOT FOUND ***"
      echo "================================================"
      echo ""
    } >> "$FILE"
  fi
}

pos_grep() {
  local label="$1"
  local pattern="$2"
  local scope="${3:-$SRC}"
  local hits
  if [ ! -e "$scope" ]; then
    echo -e "  ${YELLOW}⊘ SKIP${NC} $label ${DIM}(scope not found)${NC}"
    echo "[SKIP] $label" >> "$FILE"
    return
  fi
  hits=$(grep -rnE "$pattern" "$scope" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$hits" -gt 0 ]; then
    echo -e "  ${GREEN}✓ PASS${NC} $label ${DIM}($hits hits)${NC}"
    GREP_PASS=$((GREP_PASS + 1))
    {
      echo "[PASS] $label — $hits hits"
      grep -rnE "$pattern" "$scope" 2>/dev/null | head -8 | sed 's/^/    /'
    } >> "$FILE"
  else
    echo -e "  ${RED}✗ FAIL${NC} $label ${DIM}(0 hits, expected ≥1)${NC}"
    GREP_FAIL=$((GREP_FAIL + 1))
    echo "[FAIL] $label — 0 hits for /$pattern/ in $scope" >> "$FILE"
  fi
  echo "" >> "$FILE"
}

neg_grep() {
  local label="$1"
  local pattern="$2"
  local scope="${3:-$SRC}"
  local hits
  if [ ! -e "$scope" ]; then
    echo -e "  ${YELLOW}⊘ SKIP${NC} $label ${DIM}(scope not found)${NC}"
    echo "[SKIP] $label" >> "$FILE"
    return
  fi
  hits=$(grep -rnE "$pattern" "$scope" 2>/dev/null | wc -l | tr -d ' ')
  if [ "$hits" -eq 0 ]; then
    echo -e "  ${GREEN}✓ PASS${NC} $label"
    GREP_PASS=$((GREP_PASS + 1))
    echo "[PASS] $label — 0 hits" >> "$FILE"
  else
    echo -e "  ${RED}✗ FAIL${NC} $label ${DIM}($hits hits found — should be 0)${NC}"
    GREP_FAIL=$((GREP_FAIL + 1))
    {
      echo "[FAIL] $label — $hits hits (should be 0)"
      grep -rnE "$pattern" "$scope" 2>/dev/null | head -10 | sed 's/^/    /'
    } >> "$FILE"
  fi
  echo "" >> "$FILE"
}

probe_grep() {
  # Discovery grep — prints hits as INFO, never fails. Used for polish-phase
  # observability where we want to see what's there but no expected count.
  local label="$1"
  local pattern="$2"
  local scope="${3:-$SRC}"
  local hits
  if [ ! -e "$scope" ]; then
    echo -e "  ${YELLOW}⊘ SKIP${NC} $label ${DIM}(scope not found)${NC}"
    echo "[SKIP] $label" >> "$FILE"
    return
  fi
  hits=$(grep -rnE "$pattern" "$scope" 2>/dev/null | wc -l | tr -d ' ')
  echo -e "  ${CYAN}◉ INFO${NC} $label ${DIM}($hits hits)${NC}"
  {
    echo "[INFO] $label — $hits hits"
    grep -rnE "$pattern" "$scope" 2>/dev/null | head -12 | sed 's/^/    /'
  } >> "$FILE"
  echo "" >> "$FILE"
}

sec() {
  echo -e "\n${MAGENTA}▶ $1${NC}"
  {
    echo ""
    echo "################################################################"
    echo "##  $1"
    echo "################################################################"
    echo ""
  } >> "$FILE"
}

block() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
  {
    echo ""
    echo "################################################################"
    echo "##  BLOCK: $1"
    echo "################################################################"
    echo ""
  } >> "$FILE"
}

# ── File header ──────────────────────────────────────────────────

cat > "$FILE" << EOF
################################################################
##  COLLECTION — Fibidy Marketing Polish Phase
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##
##  Marketing development is COMPLETE through Phase 4.
##  This collection focuses on UX polish + gap filling work only —
##  no big-feature scope.
##
##  Groups:
##    A — Marketing Components
##    B — Marketing Data Layer
##    C — Marketing i18n
##    D — Marketing Page Composer
##    E — Marketing-Driven Bridges (register integration)
##    F — SoT Dependencies (consumed by marketing)
##    G — Pricing Mirror Source (parity reference, NOT a polish target)
##    H — Marketing-Adjacent Infra
##    I — Polish-Phase Sanity Greps
################################################################

EOF

echo -e "\n${WHITE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║  Fibidy Marketing Polish Collector                        ║${NC}"
echo -e "${WHITE}║  Marketing dev: COMPLETE — collecting for polish phase    ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════════════════╝${NC}"

# ════════════════════════════════════════════════════════════════
block "GROUP A — Marketing Components"
# Every component under components/marketing/ — these are the polish targets.
# Read-only ref for STATUS.md mapping; primary scope for GAPS.md.
# ════════════════════════════════════════════════════════════════

sec "Sections"
cf "$SRC/components/marketing/sections/announcement-bar.tsx"
cf "$SRC/components/marketing/sections/hero-section.tsx"
cf "$SRC/components/marketing/sections/problem-section.tsx"
cf "$SRC/components/marketing/sections/features-section.tsx"
cf "$SRC/components/marketing/sections/pricing-section.tsx"
cf "$SRC/components/marketing/sections/store-builder-section.tsx"
cf "$SRC/components/marketing/sections/faq-section.tsx"
cf "$SRC/components/marketing/sections/final-cta-section.tsx"

sec "Shared primitives"
cf "$SRC/components/marketing/shared/section-shell.tsx"
cf "$SRC/components/marketing/shared/section-eyebrow.tsx"
cf "$SRC/components/marketing/shared/feature-tile.tsx"
cf "$SRC/components/marketing/shared/pricing-card.tsx"
cf "$SRC/components/marketing/shared/faq-item.tsx"
cf "$SRC/components/marketing/shared/storefront-mockup.tsx"
cf "$SRC/components/marketing/shared/marketing-schema.tsx"
cf "$SRC/components/marketing/shared/lenis-provider.tsx"
cf "$SRC/components/marketing/shared/locale-switcher.tsx"
cf "$SRC/components/marketing/shared/theme-toggle.tsx"

sec "Store builder (Phase 3)"
cf "$SRC/components/marketing/store-builder/category-picker.tsx"
cf "$SRC/components/marketing/store-builder/subdomain-input.tsx"
cf "$SRC/components/marketing/store-builder/subdomain-suggestions.tsx"
cf "$SRC/components/marketing/store-builder/builder-preview.tsx"

sec "Header + footer"
cf "$SRC/components/marketing/marketing-header.tsx"
cf "$SRC/components/marketing/marketing-footer.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP B — Marketing Data Layer"
# Non-translatable values: section registry, icon assignments, dot colors,
# tier ids. Polish work touches these for visual consistency.
# ════════════════════════════════════════════════════════════════

sec "Data files"
cf "$SRC/lib/data/marketing/sections.ts"
cf "$SRC/lib/data/marketing/announcement.ts"
cf "$SRC/lib/data/marketing/hero.ts"
cf "$SRC/lib/data/marketing/problem.ts"
cf "$SRC/lib/data/marketing/features.ts"
cf "$SRC/lib/data/marketing/pricing.ts"
cf "$SRC/lib/data/marketing/store-builder.ts"
cf "$SRC/lib/data/marketing/faq.ts"
cf "$SRC/lib/data/marketing/cta.ts"
cf "$SRC/lib/data/marketing/footer.ts"
cf "$SRC/lib/data/marketing/nav.ts"

sec "Marketing-adjacent utils"
cf "$SRC/lib/utils/slug-suggestions.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP C — Marketing i18n"
# Primary marketing namespace + auth bridges + common (category groups).
# Polish-phase concerns: long-string overflow, parity, voice consistency.
# ════════════════════════════════════════════════════════════════

sec "Marketing namespace"
cf "$MSG/en/marketing.json"
cf "$MSG/id/marketing.json"

sec "Auth bridges (Phase 3 — register consumes builder agreement bridge)"
cf "$MSG/en/auth.json"
cf "$MSG/id/auth.json"

sec "Common (category group labels + state primitives shared with marketing)"
cf "$MSG/en/common.json"
cf "$MSG/id/common.json"

# ════════════════════════════════════════════════════════════════
block "GROUP D — Marketing Page Composer"
# The route group that assembles sections via REGISTRY. Polish work
# may touch page-level concerns: section ordering, layout chrome,
# Lenis provider scope, suspense boundaries.
# ════════════════════════════════════════════════════════════════

sec "Marketing route group"
cf "$SRC/app/[locale]/(marketing)/page.tsx"
cf "$SRC/app/[locale]/(marketing)/layout.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP E — Marketing-Driven Bridges"
# Register flow integrates with marketing builder via:
#   - sessionStorage 'fibidy_builder_agreement'
#   - ?slug & ?category & ?agreement query params
#   - auto-skip Welcome+Category+StoreInfo when arriving from builder
# These bridges are Phase 3 functional contracts — polish work shouldn't
# break them. Including for cross-reference during polish PRs.
# ════════════════════════════════════════════════════════════════

sec "Register entry + components"
cf "$SRC/app/[locale]/(auth)/register/page.tsx"
cf "$SRC/components/auth/register/register.tsx"
cf "$SRC/components/auth/register/step-review.tsx"

sec "Wizard hook (auto-skip + agreement bridge consumer)"
cf "$SRC/hooks/auth/use-register-wizard.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP F — SoT Dependencies (consumed by marketing)"
# These are NOT polish targets. They're invariants. Polish PRs that
# need to read them for context, never to modify them.
# ════════════════════════════════════════════════════════════════

sec "Categories registry (Q17 SoT — auth + marketing builder)"
cf "$SRC/lib/constants/shared/categories.ts"

sec "Reserved subdomains + slug regex (Phase 1 mirror — proxy + register + builder)"
cf "$SRC/lib/constants/shared/reserved-subdomains.ts"
cf "$SRC/lib/constants/shared/slug.constants.ts"

sec "SEO config (Q14 — siteUrl, OG, hreflang base)"
cf "$SRC/lib/constants/shared/seo.config.ts"

sec "Feature flags (gates Coming Soon panels in marketing pricing)"
cf "$SRC/lib/config/features.ts"

sec "Site constants"
cf "$SRC/lib/constants/shared/site.ts"

sec "Marketing types"
cf "$SRC/types/marketing.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP G — Pricing Mirror Source"
# Subscription page is NOT a polish target in this phase. It's the
# Q19 mirror source — marketing pricing-section reads its i18n
# namespace. Included for parity reference only: when polishing the
# marketing pricing card, verify the subscription card looks IDENTICAL.
# ════════════════════════════════════════════════════════════════

sec "Subscription page (mirror reference — DO NOT modify in polish phase)"
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"

sec "Dashboard i18n (mirror source for marketing pricing)"
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"

# ════════════════════════════════════════════════════════════════
block "GROUP H — Marketing-Adjacent Infra"
# Proxy + root layouts + schema generators. Polish work that touches
# SEO/OG/JSON-LD/headers lives here.
# ════════════════════════════════════════════════════════════════

sec "Proxy (Phase 4 — drift-free shared constants)"
cf "$SRC/proxy.ts"

sec "Root + locale layouts"
cf "$SRC/app/layout.tsx"
cf "$SRC/app/[locale]/layout.tsx"

sec "Schema generators"
cf "$SRC/lib/shared/marketing-schema.ts"
cf "$SRC/lib/shared/seo.ts"

sec "OG image edge runtimes (root + storefront — review for visual consistency)"
cf "$SRC/app/opengraph-image.tsx"
cf "$SRC/app/twitter-image.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP I — Polish-Phase Sanity Greps"
# Discovery-mode greps. These don't have pass/fail expectations — they
# surface polish opportunities. Use the grep output to prioritize work.
# ════════════════════════════════════════════════════════════════

sec "[Polish] Motion timing audit"
probe_grep "framer-motion duration values" \
  'duration:\s*[0-9]' "$SRC/components/marketing"
probe_grep "framer-motion ease values" \
  "ease:\s*['\"]" "$SRC/components/marketing"
probe_grep "staggerChildren values" \
  'staggerChildren:\s*[0-9]' "$SRC/components/marketing"
probe_grep "delayChildren values" \
  'delayChildren:\s*[0-9]' "$SRC/components/marketing"
probe_grep "transition objects with type" \
  "type:\s*['\"](spring|tween|inertia|keyframes)['\"]" "$SRC/components/marketing"

sec "[Polish] Reduced motion respect"
probe_grep "explicit prefers-reduced-motion guards" \
  'prefers.?reduced.?motion|useReducedMotion|MotionConfig' "$SRC/components/marketing"

sec "[Polish] Anchor scroll offset"
probe_grep "scroll-mt-* utilities" \
  'scroll-mt' "$SRC/components/marketing"
probe_grep "section IDs (anchor targets)" \
  'id="(hero|pricing|features|faq|store-builder|problem)"' "$SRC/components/marketing"

sec "[Polish] Section spacing rhythm"
probe_grep "py-* values on sections" \
  'py-(8|10|12|14|16|20|24|28|32)\s' "$SRC/components/marketing/sections"
probe_grep "max-w-* containers" \
  'max-w-(2xl|3xl|4xl|5xl|6xl|7xl)' "$SRC/components/marketing"

sec "[Polish] Typography hierarchy"
probe_grep "h1/h2/h3 size classes" \
  'text-(3xl|4xl|5xl|6xl).*font-(bold|semibold)' "$SRC/components/marketing"
probe_grep "tracking-* utilities" \
  'tracking-(tight|wide|widest|\[)' "$SRC/components/marketing"

sec "[Polish] Color tokens (dark mode parity)"
probe_grep "amber colors used" \
  'amber-[0-9]+' "$SRC/components/marketing"
probe_grep "emerald colors used" \
  'emerald-[0-9]+' "$SRC/components/marketing"
probe_grep "violet/purple colors used" \
  '(violet|purple)-[0-9]+' "$SRC/components/marketing"
probe_grep "explicit dark: variants" \
  'dark:' "$SRC/components/marketing"

sec "[Polish] A11y signals"
probe_grep "aria-pressed / aria-expanded / aria-current" \
  'aria-(pressed|expanded|current|selected)' "$SRC/components/marketing"
probe_grep "aria-label" \
  'aria-label' "$SRC/components/marketing"
probe_grep "aria-hidden on decorative elements" \
  'aria-hidden' "$SRC/components/marketing"
probe_grep "role= attributes" \
  'role=' "$SRC/components/marketing"
probe_grep "alt=\"\" or empty alt (decorative imagery)" \
  'alt=""' "$SRC/components/marketing"

sec "[Polish] Focus management"
probe_grep "focus-visible utilities" \
  'focus-visible' "$SRC/components/marketing"
probe_grep "explicit focus utilities" \
  'focus:' "$SRC/components/marketing"
probe_grep "autoFocus props" \
  'autoFocus' "$SRC/components/marketing"

sec "[Polish] Mobile tap-target & sticky behaviors"
probe_grep "min-h-[*] tap targets" \
  'min-h-\[' "$SRC/components/marketing"
probe_grep "fixed/sticky positioning" \
  '(fixed|sticky)\s+(inset|top|bottom)' "$SRC/components/marketing"
probe_grep "lg:hidden / md:hidden mobile-only blocks" \
  '(lg|md):hidden' "$SRC/components/marketing"

sec "[Polish] Loading / empty / error states"
probe_grep "Skeleton or skeleton classes" \
  'Skeleton|skeleton|animate-pulse' "$SRC/components/marketing"
probe_grep "loading state markers" \
  'isLoading|isPending|isFetching' "$SRC/components/marketing"
probe_grep "empty state messaging" \
  'noResults|empty|kosong|nothingHere' "$SRC/components/marketing"

sec "[Polish] i18n long-string risk areas"
probe_grep "uppercase + tracking eyebrows (long ID strings risk overflow)" \
  'uppercase.*tracking|tracking.*uppercase' "$SRC/components/marketing"
probe_grep "truncate / line-clamp utilities" \
  '(truncate|line-clamp)' "$SRC/components/marketing"

sec "[Polish] Performance hints"
probe_grep "next/image consumers" \
  "from\s+['\"]next/image['\"]" "$SRC/components/marketing"
probe_grep "priority / fetchPriority hints" \
  '(priority|fetchPriority)' "$SRC/components/marketing"
probe_grep "dynamic imports / lazy loaded" \
  'dynamic\(|React\.lazy|import\(' "$SRC/components/marketing"

sec "[Polish] Lenis scroll integration"
probe_grep "Lenis usage / scope" \
  'Lenis|lenis' "$SRC"

sec "[Marketing contract reaffirm — should still pass after polish]"
neg_grep "no Stripe in marketing components" \
  'Stripe\b' "$SRC/components/marketing"
pos_grep "marketing.pricing reads from dashboard.subscription" \
  "dashboard\.subscription\.plans|dashboard\.subscription\.comingSoon|dashboard\.subscription\.platformFee" \
  "$SRC/components/marketing"
pos_grep "categories SoT consumed by builder" \
  'getCategoryConfig|getCategoryList' "$SRC/lib/data/marketing"
neg_grep "inline RESERVED_SUBDOMAINS in proxy.ts (should be import)" \
  'RESERVED_SUBDOMAINS\s*=\s*\[' "$SRC/proxy.ts"
pos_grep "hreflang per-locale in [locale]/layout.tsx" \
  "languages:.*['\"](en|id|x-default)['\"]" "$SRC/app/[locale]/layout.tsx"
pos_grep "robots gating via VERCEL_ENV" \
  'VERCEL_ENV' "$SRC/app/[locale]/layout.tsx"
pos_grep "JSON-LD inLanguage emitted" \
  'inLanguage' "$SRC/lib/shared/marketing-schema.ts"

# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════

PCT=0
[ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  FILE COLLECTION:"
echo -e "  ${GREEN}✓ Found   : $FOUND / $TOTAL${NC}"
[ $MISSING -gt 0 ] && \
  echo -e "  ${RED}✗ Missing : $MISSING${NC}" || \
  echo -e "  ${GREEN}✗ Missing : 0${NC}"
echo -e "  Coverage  : ${YELLOW}$PCT%${NC}"
echo ""
echo -e "  GREP VERIFICATION (contract reaffirms):"
echo -e "  ${GREEN}✓ PASS    : $GREP_PASS${NC}"
echo -e "  ${RED}✗ FAIL    : $GREP_FAIL${NC}"
echo -e "  ${DIM}(probe greps don't count — they're discovery only)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""
echo -e "  ${DIM}── Reading order for the polish phase ─────────────────${NC}"
echo -e "  ${DIM}  1. STATUS.md   → what shipped, architecture invariants${NC}"
echo -e "  ${DIM}  2. GAPS.md     → polish inventory (per-section + global)${NC}"
echo -e "  ${DIM}  3. PLAYBOOK.md → execution rules, PR sizing, don't-break${NC}"
echo ""
echo -e "  ${DIM}── Expected MISSING (OK, not polish targets) ──────────${NC}"
echo -e "  ${DIM}    - lib/utils/slug-suggestions.ts (if not yet created)${NC}"
echo -e "  ${DIM}── Expected FAIL (none — contracts must hold) ─────────${NC}"
echo -e "  ${DIM}    All grep PASS/FAIL items are contract-reaffirms.${NC}"
echo -e "  ${DIM}    Any FAIL means a regression has been introduced —${NC}"
echo -e "  ${DIM}    investigate before continuing polish work.${NC}"

{
  echo ""
  echo "################################################################"
  echo "##  SUMMARY"
  echo "##  Found    : $FOUND / $TOTAL"
  echo "##  Missing  : $MISSING"
  echo "##  Coverage : $PCT%"
  echo "##  Grep Pass: $GREP_PASS"
  echo "##  Grep Fail: $GREP_FAIL"
  echo "##"
  echo "##  Reading order:"
  echo "##    1. STATUS.md    — what shipped, architecture invariants"
  echo "##    2. GAPS.md      — polish inventory"
  echo "##    3. PLAYBOOK.md  — execution rules + PR sizing"
  echo "##"
  echo "##  Probe greps surface polish opportunities — read the output"
  echo "##  in the file, not just the terminal counts."
  echo "################################################################"
} >> "$FILE"

echo ""
echo -e "  ${DIM}Done.${NC}"
