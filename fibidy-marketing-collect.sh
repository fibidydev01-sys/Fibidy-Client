#!/usr/bin/env bash
# ================================================================
# fibidy-marketing-collect-v4.sh
# Marketing-Only Collection — POLISH PHASE v4 (May 2026)
#
# Marketing development (Phases 1+2+3+4) is COMPLETE.
# Phase 5 polish v1 (Huly bento + StoreBuilder gate)            — SHIPPED
# Phase 5 polish v2 (Studio rewrite + Vercel timeline + toast)  — SHIPPED
# Phase 5 polish v3 (bento 3 tiles + side-by-side rows + NextStep) — SHIPPED
# Phase 5 polish v4 (declutter + auto-dismiss tour + Geist)     — SHIPPED
#                                                                 ↑ current
#
# v4 changes vs v3:
#   - feature-visuals.tsx DECLUTTERED — Studio became 4 templates in
#     a 2x2 grid (no preview pane, no LIVE indicator). Multi-tenant
#     became 2 URL pills (no mini browser windows). WhatsApp became
#     2 chat bubbles (no phone frame). White space as luxury.
#   - subdomain-input.tsx: toast action button "Show me" REMOVED.
#     onCategoryRequested fires AUTOMATICALLY on threshold breach.
#     Toast duration shortened 3500ms → 2500ms.
#   - store-builder-section.tsx: handleCategoryGuidance now schedules
#     setTimeout(closeNextStep, 2000) — auto-dismissing flash tour.
#     Re-entry guarded by isNextStepVisible. Timer ref + cleanup.
#   - tours.tsx: showSkip: false (was true) — non-interactive.
#   - i18n: toastAction key DROPPED, onboarding.categoryGate.content
#     shortened for fast 2s read.
#   - Geist font (Vercel's own typeface) integrated via 'geist' npm
#     package — root layout + globals.css @theme inline.
#
# v3 changes vs v2 (still in effect):
#   - Bento simplified 6 → 3 tiles (theme/seo/mobile DROPPED).
#   - How-it-works restructured from vertical timeline → side-by-side
#     alternating rows. No vertical line, no -left-12 absolute nodes.
#   - NextStep.js onboarding integrated (3 NEW files in
#     components/shared/onboarding/ + lib/data/marketing/tours.tsx).
#   - safari-frame.tsx orphan DELETED.
#
# This script collects the CURRENT v3+v4 code state for the next
# polish chat. Pair with HANDOFF.md to brief the next Claude.
#
# What's IN scope:
#   - All components/marketing/**
#   - All components/shared/onboarding/** (v3 NEW)
#   - All lib/data/marketing/* (incl. tours.tsx — v3 NEW)
#   - Marketing route group (app/[locale]/(marketing)/*)
#   - Marketing-driven register flow (auto-skip + agreement bridge)
#   - SoT dependencies marketing consumes
#   - Pricing mirror source (subscription page + dashboard.json)
#   - Marketing-adjacent infra (proxy, root + locale layouts, schema)
#
# What's OUT of scope (skipped):
#   - Dashboard pages (except subscription, mirror-only)
#   - Storefront, Admin, Discover, Library, Products, Studio, Settings
#   - Buyer flows
#
# Groups:
#   A — Marketing Components       (sections + shared + store-builder)
#   B — Onboarding Wrapper (v3)    (components/shared/onboarding/*)
#   C — Marketing Data Layer       (lib/data/marketing/* incl tours.tsx)
#   D — Marketing i18n             (messages/{en,id}/marketing.json + bridges)
#   E — Marketing Page Composer    (route group + layout)
#   F — Marketing-Driven Bridges   (register integration + wizard)
#   G — SoT Dependencies           (categories/reserved/slug/seo/features)
#   H — Pricing Mirror Source      (subscription page + dashboard.json)
#   I — Marketing-Adjacent Infra   (proxy + layouts + schema generators)
#   J — Sanity Greps               (J.1 v4 / J.2 v3 / J.3 v2 carry / J.4 Phase 1-4 / J.5 probes)
#
# Run from FE repo root (directory containing src/ and messages/):
#   bash fibidy-marketing-collect-v4.sh
#
# Output: collections/COLLECT-marketing-polish-v4-[timestamp].txt
# Tested: macOS / Linux / Windows (Git Bash, WSL2)
# ================================================================

set -u

GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; WHITE='\033[1;37m'
YELLOW='\033[1;33m'; DIM='\033[2m'; NC='\033[0m'

SRC="./src"
MSG="./messages"
PKG="./package.json"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-marketing-polish-v4-${TIMESTAMP}.txt"

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

# Negative file check — file should NOT exist (e.g. orphan deleted in v3).
nf() {
  local f="$1"
  TOTAL=$((TOTAL + 1))
  if [ -f "$f" ]; then
    echo -e "  ${RED}✗ STALE:${NC} ${f#./} ${DIM}(should be deleted)${NC}"
    MISSING=$((MISSING + 1))
    {
      echo "================================================"
      echo "FILE: ${f#./}"
      echo "STATUS: *** FILE STILL EXISTS — should be deleted in v3 ***"
      echo "================================================"
      echo ""
    } >> "$FILE"
  else
    echo -e "  ${GREEN}✓ DELETED:${NC} ${f#./}"
    FOUND=$((FOUND + 1))
    {
      echo "================================================"
      echo "FILE: ${f#./}"
      echo "STATUS: ✓ correctly deleted in v3"
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
##  COLLECTION — Fibidy Marketing Polish Phase v4 (May 2026)
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##
##  Marketing development is COMPLETE through Phase 4.
##  Phase 5 polish v1 SHIPPED (Huly bento + disabled-style gate).
##  Phase 5 polish v2 SHIPPED (Studio rewrite + Vercel timeline).
##  Phase 5 polish v3 SHIPPED (3-tile bento + side-by-side rows
##    + NextStep onboarding + safari-frame orphan deletion).
##  Phase 5 polish v4 SHIPPED — CURRENT STATE:
##    + feature-visuals.tsx DECLUTTERED (3× lighter per tile)
##    + Subdomain toast action button REMOVED
##    + Tour auto-fires alongside toast, auto-dismisses ~2s
##    + tours.tsx showSkip: false
##    + i18n toastAction key dropped, onboarding copy shortened
##    + Geist font (Vercel's typeface) integrated via 'geist' pkg
##
##  This collection captures v3+v4 cumulative state on disk.
##
##  Groups:
##    A — Marketing Components
##    B — Onboarding Wrapper (v3 NEW infrastructure)
##    C — Marketing Data Layer (incl. tours.tsx)
##    D — Marketing i18n
##    E — Marketing Page Composer
##    F — Marketing-Driven Bridges (register integration)
##    G — SoT Dependencies (consumed by marketing)
##    H — Pricing Mirror Source (parity reference, NOT a polish target)
##    I — Marketing-Adjacent Infra
##    J — Sanity Greps
##         J.1 — v4 contract reaffirms
##         J.2 — v3 contract reaffirms
##         J.3 — v2 carryover (still passing)
##         J.4 — Phase 1-4 invariants
##         J.5 — Discovery probes
################################################################

EOF

echo -e "\n${WHITE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${WHITE}║  Fibidy Marketing Polish Collector v4 (Phase 5 v4)        ║${NC}"
echo -e "${WHITE}║  Bento decluttered · Tour auto-dismiss · Geist font       ║${NC}"
echo -e "${WHITE}╚══════════════════════════════════════════════════════════╝${NC}"

# ════════════════════════════════════════════════════════════════
block "GROUP A — Marketing Components"
# Every component under components/marketing/ — these are the polish targets.
# Note: in v3+v4 the bento + how-it-works visuals were redesigned.
# ════════════════════════════════════════════════════════════════

sec "Sections (9 total — howItWorks restructured side-by-side rows in v3)"
cf "$SRC/components/marketing/sections/announcement-bar.tsx"
cf "$SRC/components/marketing/sections/hero-section.tsx"
cf "$SRC/components/marketing/sections/problem-section.tsx"
cf "$SRC/components/marketing/sections/features-section.tsx"
cf "$SRC/components/marketing/sections/how-it-works-section.tsx"    # v3 RESTRUCTURED · side-by-side rows
cf "$SRC/components/marketing/sections/pricing-section.tsx"
cf "$SRC/components/marketing/sections/store-builder-section.tsx"   # v4 RESTRUCTURED · auto-dismiss tour
cf "$SRC/components/marketing/sections/faq-section.tsx"
cf "$SRC/components/marketing/sections/final-cta-section.tsx"

sec "Shared primitives"
cf "$SRC/components/marketing/shared/section-shell.tsx"
cf "$SRC/components/marketing/shared/section-eyebrow.tsx"
cf "$SRC/components/marketing/shared/feature-tile.tsx"
cf "$SRC/components/marketing/shared/feature-visuals.tsx"           # v4 DECLUTTERED · 3 visuals (was 6)
cf "$SRC/components/marketing/shared/pricing-card.tsx"
cf "$SRC/components/marketing/shared/faq-item.tsx"
cf "$SRC/components/marketing/shared/storefront-mockup.tsx"
cf "$SRC/components/marketing/shared/browser-mockup.tsx"
cf "$SRC/components/marketing/shared/marketing-schema.tsx"
cf "$SRC/components/marketing/shared/lenis-provider.tsx"
cf "$SRC/components/marketing/shared/locale-switcher.tsx"
cf "$SRC/components/marketing/shared/theme-toggle.tsx"

sec "Store builder (v3 NextStep wiring + v4 non-interactive tour)"
cf "$SRC/components/marketing/store-builder/category-picker.tsx"    # v3 — id="builder-category-picker"
cf "$SRC/components/marketing/store-builder/subdomain-input.tsx"    # v4 — toast action removed
cf "$SRC/components/marketing/store-builder/subdomain-suggestions.tsx"
cf "$SRC/components/marketing/store-builder/builder-preview.tsx"

sec "Header + footer"
cf "$SRC/components/marketing/marketing-header.tsx"
cf "$SRC/components/marketing/marketing-footer.tsx"

sec "Orphan check (v3 deletion)"
nf "$SRC/components/marketing/shared/safari-frame.tsx"              # v3 DELETED · expect missing

# ════════════════════════════════════════════════════════════════
block "GROUP B — Onboarding Wrapper (v3 NEW infrastructure)"
# Reusable NextStep.js wrapper — designed for marketing AND dashboard
# scopes (per CEO direction: "PALING STABIL DAN SANGAT COCOK,
# NANTI AKAN KITA PAKE KE DASHBOARD JUGA").
# ════════════════════════════════════════════════════════════════

sec "Generic wrapper + types (reusable across route groups)"
cf "$SRC/components/shared/onboarding/nextstep-provider.tsx"        # v3 NEW · NextStepWrapper component
cf "$SRC/components/shared/onboarding/nextstep-types.ts"            # v3 NEW · NextStepTour / NextStepStep types

# ════════════════════════════════════════════════════════════════
block "GROUP C — Marketing Data Layer"
# v3+v4 changes: features.ts now has 3 entries (was 6). NEW file
# tours.tsx with marketing tour definitions. how-it-works.ts unchanged.
# ════════════════════════════════════════════════════════════════

sec "Data files"
cf "$SRC/lib/data/marketing/sections.ts"
cf "$SRC/lib/data/marketing/announcement.ts"
cf "$SRC/lib/data/marketing/hero.ts"
cf "$SRC/lib/data/marketing/problem.ts"
cf "$SRC/lib/data/marketing/how-it-works.ts"
cf "$SRC/lib/data/marketing/features.ts"                            # v3 · 3 entries (was 6)
cf "$SRC/lib/data/marketing/pricing.ts"
cf "$SRC/lib/data/marketing/store-builder.ts"
cf "$SRC/lib/data/marketing/faq.ts"
cf "$SRC/lib/data/marketing/cta.ts"
cf "$SRC/lib/data/marketing/footer.ts"
cf "$SRC/lib/data/marketing/nav.ts"
cf "$SRC/lib/data/marketing/tours.tsx"                              # v3 NEW · v4 showSkip:false

sec "Marketing-adjacent utils"
cf "$SRC/lib/utils/slug-suggestions.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP D — Marketing i18n"
# v3+v4 changes:
#   - DROPPED: features.items.{theme,seo,mobile}        (-6 leaf keys, v3)
#   - DROPPED: subdomainStep.states.toastAction         (-1 leaf key, v4)
#   - ADDED: storeBuilder.onboarding.categoryGate.{title,content} (+2, v3)
#   - VALUE CHANGES: features headline/subheadline rewritten,
#     howItWorks step eyebrows simplified ("Step 01 · Build" → "Build"),
#     onboarding.categoryGate.content shortened for 2s flash (v4).
# ════════════════════════════════════════════════════════════════

sec "Marketing namespace (v3+v4 — 3-tile bento + onboarding keys)"
cf "$MSG/en/marketing.json"                                         # v4 · -1 toastAction, shorter onboarding
cf "$MSG/id/marketing.json"                                         # v4 · GoTo voice mirror

sec "Auth bridges (Phase 3 — register consumes builder agreement bridge)"
cf "$MSG/en/auth.json"
cf "$MSG/id/auth.json"

sec "Common (category group labels + state primitives shared with marketing)"
cf "$MSG/en/common.json"
cf "$MSG/id/common.json"

# ════════════════════════════════════════════════════════════════
block "GROUP E — Marketing Page Composer"
# v3 — layout.tsx wraps with <MarketingOnboardingProvider>.
# Page composer's REGISTRY map unchanged from v2.
# ════════════════════════════════════════════════════════════════

sec "Marketing route group"
cf "$SRC/app/[locale]/(marketing)/page.tsx"
cf "$SRC/app/[locale]/(marketing)/layout.tsx"                       # v3 · MarketingOnboardingProvider

# ════════════════════════════════════════════════════════════════
block "GROUP F — Marketing-Driven Bridges"
# Phase 3 functional contracts. v3+v4 don't touch these — bridge
# behavior is unchanged. Included for cross-reference.
# ════════════════════════════════════════════════════════════════

sec "Register entry + components"
cf "$SRC/app/[locale]/(auth)/register/page.tsx"
cf "$SRC/components/auth/register/register.tsx"
cf "$SRC/components/auth/register/step-review.tsx"

sec "Wizard hook (auto-skip + agreement bridge consumer)"
cf "$SRC/hooks/auth/use-register-wizard.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP G — SoT Dependencies (consumed by marketing)"
# Invariants. Polish PRs read these for context, never modify.
# ════════════════════════════════════════════════════════════════

sec "Categories registry (Q17 SoT — auth + marketing builder)"
cf "$SRC/lib/constants/shared/categories.ts"

sec "Reserved subdomains + slug regex (Phase 1 mirror)"
cf "$SRC/lib/constants/shared/reserved-subdomains.ts"
cf "$SRC/lib/constants/shared/slug.constants.ts"

sec "SEO config (Q14 — siteUrl, OG, hreflang base)"
cf "$SRC/lib/constants/shared/seo.config.ts"

sec "Feature flags"
cf "$SRC/lib/config/features.ts"

sec "Site constants"
cf "$SRC/lib/constants/shared/site.ts"

sec "Marketing types (v3 — FeatureVisualKey reduced 6→3)"
cf "$SRC/types/marketing.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP H — Pricing Mirror Source"
# Q19 mirror — DO NOT modify in polish phase.
# ════════════════════════════════════════════════════════════════

sec "Subscription page (mirror reference)"
cf "$SRC/app/[locale]/(dashboard)/dashboard/subscription/page.tsx"

sec "Dashboard i18n (mirror source for marketing pricing)"
cf "$MSG/en/dashboard.json"
cf "$MSG/id/dashboard.json"

# ════════════════════════════════════════════════════════════════
block "GROUP I — Marketing-Adjacent Infra"
# ════════════════════════════════════════════════════════════════

sec "Proxy (Phase 4 — drift-free shared constants)"
cf "$SRC/proxy.ts"

sec "Root + locale layouts (v4 — Geist font integration target)"
cf "$SRC/app/layout.tsx"
cf "$SRC/app/[locale]/layout.tsx"

sec "Schema generators"
cf "$SRC/lib/shared/marketing-schema.ts"
cf "$SRC/lib/shared/seo.ts"

sec "OG image edge runtimes"
cf "$SRC/app/opengraph-image.tsx"
cf "$SRC/app/twitter-image.tsx"

sec "Build config (Geist font + NextStep deps)"
cf "$PKG"
cf "./next.config.mjs"
cf "./next.config.ts"
cf "$SRC/app/globals.css"
cf "./app/globals.css"
cf "./styles/globals.css"

# ════════════════════════════════════════════════════════════════
block "GROUP J — Sanity Greps"
# Five sub-blocks:
#   J.1 — v4 contract reaffirms (must pass after v4 — newest)
#   J.2 — v3 contract reaffirms (must still pass)
#   J.3 — v2 carryover (drag-drop ban, howItWorks active)
#   J.4 — Phase 1-4 contract reaffirms (must still pass)
#   J.5 — Discovery probes (no pass/fail, surface polish opportunities)
# ════════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────
sec "[J.1 v4 contracts] Bento decluttered — feature-visuals stripped"
# ────────────────────────────────────────────────────────────────
pos_grep "feature-visuals.tsx still has FEATURE_VISUALS registry" \
  'FEATURE_VISUALS' "$SRC/components/marketing/shared/feature-visuals.tsx"
pos_grep "feature-visuals.tsx exports exactly 3 visual keys (studio/multiTenant/whatsapp)" \
  '(studio|multiTenant|whatsapp)\s*:\s*[A-Z]' "$SRC/components/marketing/shared/feature-visuals.tsx"
neg_grep "feature-visuals.tsx no longer has theme/seo/mobile keys (v3 dropped)" \
  '(theme|seo|mobile)\s*:\s*[A-Z]\w*Visual' "$SRC/components/marketing/shared/feature-visuals.tsx"
pos_grep "StudioVisual still references templates" \
  "(Minimal|Bold|Pastel|Editorial)" "$SRC/components/marketing/shared/feature-visuals.tsx"
neg_grep "StudioVisual decluttered — no LIVE indicator (v3 had it, v4 removed)" \
  '(animate-ping|>Live<)' "$SRC/components/marketing/shared/feature-visuals.tsx"
neg_grep "StudioVisual decluttered — no browser chrome ('live preview' string was v3)" \
  'live preview' "$SRC/components/marketing/shared/feature-visuals.tsx"
neg_grep "StudioVisual decluttered — no product grid (v3 had Toko Senja preview)" \
  'Toko Senja|kopi-senja\.fibidy\.com' "$SRC/components/marketing/shared/feature-visuals.tsx"
probe_grep "feature-visuals padding (v4 should use p-8 sm:p-10 generous breathing room)" \
  'p-(8|10|12)' "$SRC/components/marketing/shared/feature-visuals.tsx"
probe_grep "feature-visuals only has 3 visual function definitions (v4 declutter)" \
  'function\s+\w+Visual\(' "$SRC/components/marketing/shared/feature-visuals.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.1 v4 contracts] Subdomain toast — action button removed"
# ────────────────────────────────────────────────────────────────
pos_grep "subdomain-input still imports toast from sonner" \
  "from\s+['\"]sonner['\"]" "$SRC/components/marketing/store-builder/subdomain-input.tsx"
pos_grep "subdomain-input still has toastNeedCategory reference" \
  "toastNeedCategory" "$SRC/components/marketing/store-builder/subdomain-input.tsx"
neg_grep "subdomain-input no longer has toast action button (v4 — dropped 'Show me')" \
  "states\.toastAction" "$SRC/components/marketing/store-builder/subdomain-input.tsx"
neg_grep "subdomain-input no longer references toastAction key" \
  "'toastAction'|\"toastAction\"" "$SRC/components/marketing/store-builder/subdomain-input.tsx"
pos_grep "subdomain-input still calls onCategoryRequested" \
  "onCategoryRequested\?\.\(\)" "$SRC/components/marketing/store-builder/subdomain-input.tsx"
probe_grep "subdomain-input toast duration (v4 shortened to 2500ms)" \
  'duration:\s*2500' "$SRC/components/marketing/store-builder/subdomain-input.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.1 v4 contracts] Store builder section — auto-dismiss tour"
# ────────────────────────────────────────────────────────────────
pos_grep "store-builder-section declares TOUR_AUTO_CLOSE_MS constant" \
  'TOUR_AUTO_CLOSE_MS' "$SRC/components/marketing/sections/store-builder-section.tsx"
pos_grep "store-builder-section uses 2000ms auto-dismiss timeout" \
  'TOUR_AUTO_CLOSE_MS\s*=\s*2000|setTimeout.*2000' "$SRC/components/marketing/sections/store-builder-section.tsx"
pos_grep "store-builder-section guards re-entry via isNextStepVisible" \
  'isNextStepVisible' "$SRC/components/marketing/sections/store-builder-section.tsx"
pos_grep "store-builder-section tracks tour timer in ref (cleanup)" \
  'tourCloseTimerRef' "$SRC/components/marketing/sections/store-builder-section.tsx"
pos_grep "store-builder-section schedules closeNextStep via setTimeout" \
  'setTimeout\s*\(\s*\(\s*\)\s*=>\s*\{?\s*closeNextStep' "$SRC/components/marketing/sections/store-builder-section.tsx"
pos_grep "store-builder-section clears timer on unmount" \
  'clearTimeout\s*\(\s*tourCloseTimerRef' "$SRC/components/marketing/sections/store-builder-section.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.1 v4 contracts] Tour config — non-interactive flash"
# ────────────────────────────────────────────────────────────────
pos_grep "tours.tsx has showSkip: false (v4 — no manual dismiss)" \
  'showSkip:\s*false' "$SRC/lib/data/marketing/tours.tsx"
pos_grep "tours.tsx has showControls: false" \
  'showControls:\s*false' "$SRC/lib/data/marketing/tours.tsx"
neg_grep "tours.tsx no longer has showSkip: true" \
  'showSkip:\s*true' "$SRC/lib/data/marketing/tours.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.1 v4 contracts] i18n — toastAction key dropped"
# ────────────────────────────────────────────────────────────────
neg_grep "EN marketing.json no longer has toastAction key (v4 removed)" \
  '"toastAction"' "$MSG/en/marketing.json"
neg_grep "ID marketing.json no longer has toastAction key (v4 removed)" \
  '"toastAction"' "$MSG/id/marketing.json"
neg_grep "EN no longer has 'Show me' string anywhere in marketing.json" \
  '"Show me"' "$MSG/en/marketing.json"
neg_grep "ID no longer has 'Tunjukin' string anywhere in marketing.json" \
  '"Tunjukin"' "$MSG/id/marketing.json"

# ────────────────────────────────────────────────────────────────
sec "[J.1 v4 contracts] Geist font — typography upgrade (probes)"
# Geist setup is documented in SETUP-GEIST-FONT.md and lives in root
# layout + globals.css. These checks are probes since the user may
# integrate them in stages.
# ────────────────────────────────────────────────────────────────
probe_grep "geist package present in package.json" \
  '"geist"\s*:' "$PKG"
probe_grep "GeistSans imported in any layout" \
  "from\s+['\"]geist/font/sans['\"]" "$SRC/app"
probe_grep "GeistMono imported in any layout" \
  "from\s+['\"]geist/font/mono['\"]" "$SRC/app"
probe_grep "GeistSans.variable applied to <html> className" \
  'GeistSans\.variable' "$SRC/app"
probe_grep "Tailwind v4 @theme inline wires --font-sans to geist" \
  '\-\-font-sans:\s*var\(\-\-font-geist-sans\)' "$SRC"
probe_grep "@theme inline block present in globals.css (Tailwind v4 idiom)" \
  '@theme\s+inline' "$SRC"

# ────────────────────────────────────────────────────────────────
sec "[J.2 v3 contracts] Bento simplified to 3 tiles"
# ────────────────────────────────────────────────────────────────
pos_grep "FeatureVisualKey union has exactly 3 keys (v3)" \
  "FeatureVisualKey\s*=\s*['\"]?(studio|multiTenant|whatsapp)" "$SRC/types/marketing.ts"
neg_grep "FeatureVisualKey no longer includes theme/seo/mobile" \
  "FeatureVisualKey\s*=.*?(theme|seo|mobile)" "$SRC/types/marketing.ts"
pos_grep "featureTiles array has 3 entries (studio + multiTenant + whatsapp)" \
  "id:\s*'(studio|multiTenant|whatsapp)'" "$SRC/lib/data/marketing/features.ts"
neg_grep "featureTiles no longer has theme/seo/mobile entries" \
  "id:\s*'(theme|seo|mobile)'" "$SRC/lib/data/marketing/features.ts"
neg_grep "EN marketing.json no longer has features.items.theme" \
  '"theme":\s*\{\s*"title"' "$MSG/en/marketing.json"
neg_grep "EN marketing.json no longer has features.items.seo" \
  '"seo":\s*\{\s*"title"' "$MSG/en/marketing.json"
neg_grep "EN marketing.json no longer has features.items.mobile" \
  '"mobile":\s*\{\s*"title"' "$MSG/en/marketing.json"
neg_grep "ID marketing.json no longer has features.items.theme" \
  '"theme":\s*\{\s*"title"' "$MSG/id/marketing.json"
neg_grep "ID marketing.json no longer has features.items.seo" \
  '"seo":\s*\{\s*"title"' "$MSG/id/marketing.json"
neg_grep "ID marketing.json no longer has features.items.mobile" \
  '"mobile":\s*\{\s*"title"' "$MSG/id/marketing.json"

# ────────────────────────────────────────────────────────────────
sec "[J.2 v3 contracts] How-it-works restructured side-by-side rows"
# ────────────────────────────────────────────────────────────────
pos_grep "how-it-works uses md:grid-cols-2 alternating rows pattern" \
  'md:grid-cols-2.*items-center|items-center.*md:grid-cols-2' "$SRC/components/marketing/sections/how-it-works-section.tsx"
pos_grep "how-it-works uses isReversed for zigzag layout" \
  'isReversed|md:order-(1|2)' "$SRC/components/marketing/sections/how-it-works-section.tsx"
pos_grep "how-it-works has space-y-* generous vertical rhythm" \
  'space-y-(16|20|24|32)' "$SRC/components/marketing/sections/how-it-works-section.tsx"
neg_grep "how-it-works no longer has vertical timeline gradient (v2 pattern, v3 removed)" \
  'gradient-to-b\s+from-primary' "$SRC/components/marketing/sections/how-it-works-section.tsx"
neg_grep "how-it-works no longer uses -left-12/-left-16 absolute timeline nodes" \
  '\-left-(12|16)' "$SRC/components/marketing/sections/how-it-works-section.tsx"
pos_grep "BuildVisual / ShareVisual / SellVisual still defined inline (v2 carry)" \
  'function\s+(BuildVisual|ShareVisual|SellVisual)' "$SRC/components/marketing/sections/how-it-works-section.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.2 v3 contracts] NextStep.js onboarding integration"
# ────────────────────────────────────────────────────────────────
pos_grep "nextstepjs in package.json deps" \
  '"nextstepjs"\s*:' "$PKG"
pos_grep "NextStepWrapper component file exists" \
  'NextStepWrapper' "$SRC/components/shared/onboarding/nextstep-provider.tsx"
pos_grep "NextStepProvider + NextStep imported from nextstepjs" \
  "from\s+['\"]nextstepjs['\"]" "$SRC/components/shared/onboarding/nextstep-provider.tsx"
pos_grep "Local NextStepTour types defined" \
  'NextStepTour|NextStepStep' "$SRC/components/shared/onboarding/nextstep-types.ts"
pos_grep "tours.tsx exports MarketingOnboardingProvider" \
  'MarketingOnboardingProvider' "$SRC/lib/data/marketing/tours.tsx"
pos_grep "tours.tsx exports MARKETING_TOUR_NAMES constant" \
  'MARKETING_TOUR_NAMES' "$SRC/lib/data/marketing/tours.tsx"
pos_grep "tours.tsx defines 'category-gate' tour" \
  "'category-gate'|category-gate" "$SRC/lib/data/marketing/tours.tsx"
pos_grep "tours.tsx targets #builder-category-picker selector" \
  "#builder-category-picker" "$SRC/lib/data/marketing/tours.tsx"
pos_grep "marketing layout mounts MarketingOnboardingProvider" \
  'MarketingOnboardingProvider' "$SRC/app/[locale]/(marketing)/layout.tsx"
pos_grep "category-picker.tsx carries id='builder-category-picker'" \
  'id="builder-category-picker"' "$SRC/components/marketing/store-builder/category-picker.tsx"
pos_grep "store-builder-section uses useNextStep hook" \
  'useNextStep' "$SRC/components/marketing/sections/store-builder-section.tsx"
pos_grep "store-builder-section calls startNextStep" \
  'startNextStep' "$SRC/components/marketing/sections/store-builder-section.tsx"
neg_grep "store-builder-section no longer uses categoryPickerRef + scrollIntoView (v2 pattern)" \
  'categoryPickerRef|scrollToCategoryPicker' "$SRC/components/marketing/sections/store-builder-section.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.2 v3 contracts] i18n new onboarding namespace"
# ────────────────────────────────────────────────────────────────
pos_grep "EN onboarding.categoryGate.title key present" \
  '"categoryGate"' "$MSG/en/marketing.json"
pos_grep "ID onboarding.categoryGate.title key present" \
  '"categoryGate"' "$MSG/id/marketing.json"
pos_grep "EN has onboarding namespace under storeBuilder" \
  '"onboarding"\s*:' "$MSG/en/marketing.json"
pos_grep "ID has onboarding namespace under storeBuilder" \
  '"onboarding"\s*:' "$MSG/id/marketing.json"

# ────────────────────────────────────────────────────────────────
sec "[J.3 v2 carryover] Studio drag-drop ban"
# ────────────────────────────────────────────────────────────────
neg_grep "no 'drag-drop' in marketing components" \
  'drag.?drop' "$SRC/components/marketing"
neg_grep "no 'drag-drop' in EN marketing.json" \
  'drag.?drop' "$MSG/en/marketing.json"
neg_grep "no 'drag-drop' in ID marketing.json" \
  'drag.?drop' "$MSG/id/marketing.json"
neg_grep "no GripVertical imports in feature-visuals (drag-drop indicator)" \
  'GripVertical' "$SRC/components/marketing/shared/feature-visuals.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.3 v2 carryover] HowItWorks section + i18n active"
# ────────────────────────────────────────────────────────────────
pos_grep "'howItWorks' in SectionKey union" \
  "'howItWorks'" "$SRC/types/marketing.ts"
pos_grep "'howItWorks' in DEFAULT_SECTIONS" \
  "'howItWorks'" "$SRC/lib/data/marketing/sections.ts"
pos_grep "HowItWorksSection registered in REGISTRY" \
  'howItWorks:\s*HowItWorksSection|HowItWorksSection' "$SRC/app/[locale]/(marketing)/page.tsx"
pos_grep "HowItWorksSection function exported" \
  'export\s+(async\s+)?function\s+HowItWorksSection' "$SRC/components/marketing/sections/how-it-works-section.tsx"
pos_grep "howItWorks namespace in EN marketing.json" \
  '"howItWorks"\s*:' "$MSG/en/marketing.json"
pos_grep "howItWorks namespace in ID marketing.json" \
  '"howItWorks"\s*:' "$MSG/id/marketing.json"
pos_grep "lockedHint key still present in EN" \
  '"lockedHint"' "$MSG/en/marketing.json"
pos_grep "lockedHint key still present in ID" \
  '"lockedHint"' "$MSG/id/marketing.json"
pos_grep "toastNeedCategory still present in EN" \
  '"toastNeedCategory"' "$MSG/en/marketing.json"
pos_grep "toastNeedCategory still present in ID" \
  '"toastNeedCategory"' "$MSG/id/marketing.json"
pos_grep "subdomain-input declares CATEGORY_GATE_THRESHOLD" \
  'CATEGORY_GATE_THRESHOLD' "$SRC/components/marketing/store-builder/subdomain-input.tsx"
pos_grep "subdomain-input accepts categorySelected prop" \
  'categorySelected\s*:\s*boolean' "$SRC/components/marketing/store-builder/subdomain-input.tsx"
pos_grep "subdomain-input accepts onCategoryRequested prop" \
  'onCategoryRequested' "$SRC/components/marketing/store-builder/subdomain-input.tsx"
neg_grep "subdomain-input no longer accepts disabled prop (v1 pattern)" \
  'disabled\?:\s*boolean' "$SRC/components/marketing/store-builder/subdomain-input.tsx"
pos_grep "store-builder-section passes categorySelected to SubdomainInput" \
  'categorySelected=' "$SRC/components/marketing/sections/store-builder-section.tsx"
pos_grep "store-builder-section passes onCategoryRequested to SubdomainInput" \
  'onCategoryRequested=' "$SRC/components/marketing/sections/store-builder-section.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.4 Phase 1-4 contracts — must still pass]"
# ────────────────────────────────────────────────────────────────
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
neg_grep "safari-frame.tsx import nowhere in components" \
  'safari-frame' "$SRC/components/marketing"
pos_grep "browser-mockup.tsx imported in components" \
  'browser-mockup' "$SRC/components/marketing"
neg_grep "categoryKey nullable (should be non-nullable post Phase 5)" \
  'categoryKey.*null\b' "$SRC/lib/data/marketing/store-builder.ts"
neg_grep "FlickeringGrid must not be imported in marketing" \
  'FlickeringGrid' "$SRC/components/marketing"
neg_grep "HexagonPattern must not be imported in marketing" \
  'HexagonPattern' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] White space + breathing room (v4 spirit)"
# ────────────────────────────────────────────────────────────────
probe_grep "generous tile padding (p-8 / p-10 — Vercel scale)" \
  'p-(8|10|12)' "$SRC/components/marketing"
probe_grep "generous gap utilities (gap-6 / gap-8 / gap-12)" \
  'gap-(6|8|10|12|16)' "$SRC/components/marketing"
probe_grep "generous space-y on stacks (space-y-12+)" \
  'space-y-(12|16|20|24|32)' "$SRC/components/marketing"
probe_grep "section py-* (24+ for Vercel-vibe vertical rhythm)" \
  'py-(20|24|28|32)' "$SRC/components/marketing/sections"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Bento + timeline visual signature"
# ────────────────────────────────────────────────────────────────
probe_grep "feature-visuals function definitions (expect 3 in v4)" \
  'function\s+(StudioVisual|MultiTenantVisual|WhatsappVisual)' \
  "$SRC/components/marketing/shared/feature-visuals.tsx"
probe_grep "v3-style how-it-works visuals (BuildVisual/ShareVisual/SellVisual)" \
  'function\s+(BuildVisual|ShareVisual|SellVisual)' \
  "$SRC/components/marketing/sections/how-it-works-section.tsx"
probe_grep "BuildVisual still has LIVE indicator (kept in v4 — only feature-visuals stripped)" \
  'animate-ping' "$SRC/components/marketing/sections/how-it-works-section.tsx"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] NextStep tour invocations across marketing"
# ────────────────────────────────────────────────────────────────
probe_grep "useNextStep callsites in marketing" \
  'useNextStep\(\)' "$SRC/components/marketing"
probe_grep "MARKETING_TOUR_NAMES references" \
  'MARKETING_TOUR_NAMES' "$SRC/components/marketing"
probe_grep "isNextStepVisible guards (re-entry protection)" \
  'isNextStepVisible' "$SRC/components/marketing"
probe_grep "closeNextStep usage" \
  'closeNextStep' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Motion timing + reduced motion"
# ────────────────────────────────────────────────────────────────
probe_grep "framer-motion duration values" \
  'duration:\s*[0-9]' "$SRC/components/marketing"
probe_grep "framer-motion ease values" \
  "ease:\s*['\"]" "$SRC/components/marketing"
probe_grep "transition objects with type" \
  "type:\s*['\"](spring|tween|inertia|keyframes)['\"]" "$SRC/components/marketing"
probe_grep "explicit prefers-reduced-motion guards" \
  'prefers.?reduced.?motion|useReducedMotion|MotionConfig' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Anchor scroll + section IDs"
# ────────────────────────────────────────────────────────────────
probe_grep "scroll-mt-* utilities" \
  'scroll-mt' "$SRC/components/marketing"
probe_grep "section IDs (anchor targets) — should include 'how-it-works' + 'store-builder'" \
  'id="(hero|pricing|features|faq|store-builder|problem|how-it-works)"' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Typography hierarchy + tracking"
# ────────────────────────────────────────────────────────────────
probe_grep "h2/h3 size classes" \
  'text-(3xl|4xl|5xl|6xl|7xl).*font-(bold|semibold)' "$SRC/components/marketing"
probe_grep "tracking-* utilities (tight/wider/eyebrow)" \
  'tracking-(tight|wide|widest|\[)' "$SRC/components/marketing"
probe_grep "leading-relaxed body copy (Vercel rhythm)" \
  'leading-relaxed|leading-loose' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Color tokens (dark mode parity)"
# ────────────────────────────────────────────────────────────────
probe_grep "amber colors used (Editorial template + product gradient)" \
  'amber-[0-9]+' "$SRC/components/marketing"
probe_grep "emerald colors used (WhatsApp + LIVE indicator)" \
  'emerald-[0-9]+' "$SRC/components/marketing"
probe_grep "rose colors used (Bold template + accent)" \
  'rose-[0-9]+' "$SRC/components/marketing"
probe_grep "explicit dark: variants" \
  'dark:' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] A11y signals"
# ────────────────────────────────────────────────────────────────
probe_grep "aria-pressed / aria-expanded / aria-current" \
  'aria-(pressed|expanded|current|selected)' "$SRC/components/marketing"
probe_grep "aria-label" \
  'aria-label' "$SRC/components/marketing"
probe_grep "aria-hidden on decorative elements" \
  'aria-hidden' "$SRC/components/marketing"
probe_grep "role= attributes" \
  'role=' "$SRC/components/marketing"
probe_grep "focus-visible utilities" \
  'focus-visible' "$SRC/components/marketing"
probe_grep "focus-within utilities (subdomain composite input)" \
  'focus-within' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Mobile tap-target & sticky"
# ────────────────────────────────────────────────────────────────
probe_grep "min-h-[*] tap targets" \
  'min-h-\[' "$SRC/components/marketing"
probe_grep "fixed/sticky positioning (sticky CTA + announcement bar)" \
  '(fixed|sticky)\s+(inset|top|bottom)' "$SRC/components/marketing"
probe_grep "lg:hidden / md:hidden mobile-only blocks" \
  '(lg|md):hidden' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Loading / empty / error states"
# ────────────────────────────────────────────────────────────────
probe_grep "Skeleton or skeleton classes" \
  'Skeleton|skeleton|animate-pulse' "$SRC/components/marketing"
probe_grep "loading state markers" \
  'isLoading|isPending|isFetching|isChecking' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] i18n long-string risk areas"
# ────────────────────────────────────────────────────────────────
probe_grep "uppercase + tracking eyebrows (long ID strings risk overflow)" \
  'uppercase.*tracking|tracking.*uppercase' "$SRC/components/marketing"
probe_grep "truncate / line-clamp utilities" \
  '(truncate|line-clamp)' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Performance hints"
# ────────────────────────────────────────────────────────────────
probe_grep "next/image consumers" \
  "from\s+['\"]next/image['\"]" "$SRC/components/marketing"
probe_grep "priority / fetchPriority hints" \
  '(priority|fetchPriority)' "$SRC/components/marketing"
probe_grep "dynamic imports / lazy loaded" \
  'dynamic\(|React\.lazy|import\(' "$SRC/components/marketing"

# ────────────────────────────────────────────────────────────────
sec "[J.5 Probes] Magic UI usage"
# ────────────────────────────────────────────────────────────────
probe_grep "RainbowButton usage (hero CTA)" \
  'RainbowButton' "$SRC/components/marketing"
probe_grep "BrowserMockup usage" \
  'BrowserMockup' "$SRC/components/marketing"
probe_grep "Lenis usage / scope" \
  'Lenis|lenis' "$SRC"

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
echo -e "  ${DIM}── Reading order for the next polish chat ────────────${NC}"
echo -e "  ${DIM}  1. FIBIDY MARKETING DEV HANDBOOK   (Phases 1-4 lock)${NC}"
echo -e "  ${DIM}  2. HANDOFF.md                       (v1+v2+v3+v4 polish state)${NC}"
echo -e "  ${DIM}  3. This collection output            (current code on disk)${NC}"
echo ""
echo -e "  ${DIM}── v3+v4 changes captured by this script ─────────────${NC}"
echo -e "  ${DIM}    + onboarding/nextstep-provider.tsx       (Group B — v3 NEW)${NC}"
echo -e "  ${DIM}    + onboarding/nextstep-types.ts            (Group B — v3 NEW)${NC}"
echo -e "  ${DIM}    + lib/data/marketing/tours.tsx            (Group C — v3 NEW)${NC}"
echo -e "  ${DIM}    + safari-frame.tsx deleted                (Group A — v3)${NC}"
echo -e "  ${DIM}    + feature-visuals.tsx 3 visuals           (v3 + v4 declutter)${NC}"
echo -e "  ${DIM}    + how-it-works side-by-side rows          (v3 restructure)${NC}"
echo -e "  ${DIM}    + subdomain-input no toast action         (v4)${NC}"
echo -e "  ${DIM}    + store-builder TOUR_AUTO_CLOSE_MS=2000   (v4)${NC}"
echo -e "  ${DIM}    + tours.tsx showSkip:false                 (v4)${NC}"
echo -e "  ${DIM}    + Geist font setup probes                  (v4)${NC}"
echo ""
echo -e "  ${DIM}── J.1 v4 contracts — newest, must pass after v4 ────${NC}"
echo -e "  ${DIM}    Bento decluttered (no LIVE/chrome in feature-visuals)${NC}"
echo -e "  ${DIM}    Subdomain toast action removed${NC}"
echo -e "  ${DIM}    Tour auto-dismiss with timer ref + isNextStepVisible guard${NC}"
echo -e "  ${DIM}    Tours.tsx showSkip:false${NC}"
echo -e "  ${DIM}    i18n toastAction key dropped${NC}"
echo -e "  ${DIM}    Geist font probes (may PASS or be still pending integration)${NC}"
echo ""
echo -e "  ${DIM}── J.2 v3 contracts — must still pass ───────────────${NC}"
echo -e "  ${DIM}    FeatureVisualKey union has only 3 keys${NC}"
echo -e "  ${DIM}    HowItWorks side-by-side rows (no vertical line)${NC}"
echo -e "  ${DIM}    NextStep wired (provider + types + tours + layout mount)${NC}"
echo -e "  ${DIM}    onboarding.categoryGate i18n keys present${NC}"
echo ""
echo -e "  ${DIM}── J.3 v2 carryover — must still pass ───────────────${NC}"
echo -e "  ${DIM}    drag-drop ban (3 negative greps)${NC}"
echo -e "  ${DIM}    HowItWorks section + namespace active${NC}"
echo -e "  ${DIM}    SubdomainInput accepts categorySelected/onCategoryRequested${NC}"
echo -e "  ${DIM}    No 'disabled' prop (replaced by toast block)${NC}"
echo ""
echo -e "  ${DIM}── J.4 Phase 1-4 invariants — must still pass ───────${NC}"
echo -e "  ${DIM}    No Stripe in marketing components${NC}"
echo -e "  ${DIM}    Pricing reads from dashboard.subscription mirror${NC}"
echo -e "  ${DIM}    Reserved subdomains imported (not inlined)${NC}"
echo -e "  ${DIM}    safari-frame fully removed (v3 cleanup)${NC}"
echo ""
echo -e "  ${DIM}── Expected MISSING (OK, not polish targets) ─────────${NC}"
echo -e "  ${DIM}    safari-frame.tsx (v3 deleted, expect missing — counted as DELETED)${NC}"
echo -e "  ${DIM}    next.config.ts vs next.config.mjs (whichever your project uses)${NC}"
echo -e "  ${DIM}    globals.css path (script tries 3 common locations)${NC}"
echo ""
echo -e "  ${DIM}── Expected FAIL (none — contracts must hold) ────────${NC}"
echo -e "  ${DIM}    Any FAIL in J.1 means v4 was reverted / regressed.${NC}"
echo -e "  ${DIM}    Any FAIL in J.2 means v3 contract broke.${NC}"
echo -e "  ${DIM}    Any FAIL in J.3 means v2 carryover broke.${NC}"
echo -e "  ${DIM}    Any FAIL in J.4 means a Phase 1-4 invariant broke.${NC}"
echo -e "  ${DIM}    Geist probes in J.1 may not all pass yet — that's${NC}"
echo -e "  ${DIM}    OK if you haven't done the SETUP-GEIST-FONT.md steps.${NC}"

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
  echo "##  v3+v4 changes captured by this script:"
  echo "##    + onboarding/nextstep-provider.tsx       (Group B — v3 NEW)"
  echo "##    + onboarding/nextstep-types.ts            (Group B — v3 NEW)"
  echo "##    + lib/data/marketing/tours.tsx            (Group C — v3 NEW)"
  echo "##    + safari-frame.tsx deleted                (Group A — v3)"
  echo "##    + feature-visuals.tsx 3 visuals           (v3 + v4 declutter)"
  echo "##    + how-it-works side-by-side rows          (v3 restructure)"
  echo "##    + subdomain-input no toast action         (v4)"
  echo "##    + store-builder TOUR_AUTO_CLOSE_MS=2000   (v4)"
  echo "##    + tours.tsx showSkip:false                 (v4)"
  echo "##    + Geist font setup probes                  (v4)"
  echo "##"
  echo "##  Sanity grep blocks:"
  echo "##    J.1 — v4 contract reaffirms (newest)"
  echo "##    J.2 — v3 contract reaffirms (must still pass)"
  echo "##    J.3 — v2 carryover (still passing)"
  echo "##    J.4 — Phase 1-4 invariants (must still pass)"
  echo "##    J.5 — Discovery probes (no pass/fail)"
  echo "##"
  echo "##  Reading order for the next chat:"
  echo "##    1. FIBIDY MARKETING DEV HANDBOOK   — Phases 1-4 lock"
  echo "##    2. HANDOFF.md                       — v1+v2+v3+v4 polish state"
  echo "##    3. This collection output            — current code on disk"
  echo "##"
  echo "##  Probe greps surface polish opportunities — read the output"
  echo "##  in the file, not just the terminal counts."
  echo "################################################################"
} >> "$FILE"

echo ""
echo -e "  ${DIM}Done.${NC}"