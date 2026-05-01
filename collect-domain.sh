#!/bin/bash
# ================================================================
# collect-seo-subdomain.sh
# Targeted Collection — SEO, Subdomain, Proxy & Sitemap Files
#
# Scope:
#   Group A — Proxy / Middleware (CORE)    (1 file)  [TIER 1 KRITIS]
#   Group B — i18n Routing                 (3 files) [TIER 1 KRITIS]
#   Group C — Sitemap Routes               (2 files) [TIER 1 KRITIS]
#   Group D — OpenGraph & Twitter Images   (4 files) [TIER 1]
#   Group E — SEO Config & Utilities       (3 files) [TIER 1 KRITIS]
#   Group F — Store URL / Subdomain Logic  (2 files) [TIER 1 KRITIS]
#   Group G — JSON-LD Schema Components    (6 files) [TIER 1]
#   Group H — Store Layout & Pages (SEO)   (5 files) [TIER 1]
#   Group I — Tenant API & Types           (3 files) [TIER 1]
#   Group J — Social Share                 (1 file)  [TIER 2]
#   Group K — Next.js Root Config          (3 files) [TIER 1]
#
# Total: 33 files
# Output: collections/COLLECT-seo-subdomain-[timestamp].txt
# Usage : bash collect-seo-subdomain.sh
# Run from: client root
# ================================================================

GREEN='\033[0;32m'; BLUE='\033[0;34m'; CYAN='\033[0;36m'
MAGENTA='\033[0;35m'; RED='\033[0;31m'; WHITE='\033[1;37m'
YELLOW='\033[1;33m'; DIM='\033[2m'; NC='\033[0m'

SRC="./src"
OUT="collections"
TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
FILE="$OUT/COLLECT-seo-subdomain-${TIMESTAMP}.txt"
ROOT="."

mkdir -p "$OUT"

FOUND=0; MISSING=0; TOTAL=0

cf() {
    local f="$1"
    TOTAL=$((TOTAL + 1))
    if [ -f "$f" ]; then
        local lines=$(wc -l < "$f" 2>/dev/null || echo "0")
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

sec() {
    echo -e "\n${MAGENTA}▶ $1${NC}"
    { echo ""; echo "##  $1"; echo ""; } >> "$FILE"
}

block() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    { echo ""; echo "##  BLOCK: $1"; echo ""; } >> "$FILE"
}

# ── Header ──────────────────────────────────────────────────────
cat > "$FILE" << EOF
##  COLLECTION — SEO, Subdomain, Proxy & Sitemap Files
##  Generated : $(date '+%Y-%m-%d %H:%M:%S')
##  Scope     : Proxy/Middleware / i18n Routing / Sitemap / OG Image /
##              SEO Config / Store URL / JSON-LD / Tenant API / Next Config
##  Total     : 33 files
EOF

echo -e "\n${WHITE}  ── Collecting SEO & Subdomain Files (Complete) ──${NC}"

# ════════════════════════════════════════════════════════════════
block "GROUP A — Proxy / Middleware CORE (1 file) [TIER 1 KRITIS]"
# proxy.ts IS the middleware — it exports `proxy` as default AND
# exports `config` (matcher). No separate middleware.ts exists.
# Contains: subdomain extraction, custom domain resolve,
# path-based /store/ rewrite, reserved subdomain list,
# next-intl delegation, skip rules for static/OG/sitemap.
# ════════════════════════════════════════════════════════════════
sec "proxy.ts — subdomain routing, custom domain, path rewrite, matcher"
cf "$SRC/proxy.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP B — i18n Routing (3 files) [TIER 1 KRITIS]"
# proxy.ts reads routing.locales + routing.defaultLocale at runtime
# to inject locale into rewrite paths (e.g. /en/store/[slug]).
# Any change to locales or localePrefix directly affects all rewrites.
# ════════════════════════════════════════════════════════════════
sec "Locale + localePrefix config (consumed by proxy.ts at runtime)"
cf "$SRC/i18n/routing.ts"
sec "next-intl navigation helpers (Link, redirect, useRouter)"
cf "$SRC/i18n/navigation.ts"
sec "next-intl request config (getRequestConfig)"
cf "$SRC/i18n/request.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP C — Sitemap Routes (2 files) [TIER 1 KRITIS]"
# Sitemap URLs must use the correct canonical format —
# subdomain (tokoA.fibidy.com) in prod, path (/store/tokoA) in dev.
# Must stay in sync with store-url.ts URL builder logic.
# ════════════════════════════════════════════════════════════════
sec "Root sitemap index (submitted to Google Search Console)"
cf "$SRC/app/server-sitemap-index.xml/route.ts"
sec "Dynamic sitemap per page (store + product URLs)"
cf "$SRC/app/server-sitemap/[page]/route.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP D — OpenGraph & Twitter Images (4 files) [TIER 1]"
# proxy.ts explicitly skips /opengraph-image & /twitter-image paths
# (NextResponse.next()), so these files self-resolve tenant slug
# via params or x-tenant-slug header set by proxy for custom domains.
# ════════════════════════════════════════════════════════════════
sec "Root OG & Twitter images (platform-level)"
cf "$SRC/app/opengraph-image.tsx"
cf "$SRC/app/twitter-image.tsx"
sec "Per-store OG image (accessed via subdomain or /store/[slug])"
cf "$SRC/app/[locale]/store/[slug]/opengraph-image.tsx"
sec "Per-product OG image"
cf "$SRC/app/[locale]/store/[slug]/products/[id]/opengraph-image.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP E — SEO Config & Utilities (3 files) [TIER 1 KRITIS]"
# seo.config.ts: metadataBase, canonical base URL, robots rules.
# seo.ts: generateMetadata() helpers used by all store pages/layouts.
# site.ts: NEXT_PUBLIC_ROOT_DOMAIN constant — MUST match
#          NEXT_PUBLIC_ROOT_DOMAIN env var read by proxy.ts as PROD_DOMAIN.
# ════════════════════════════════════════════════════════════════
sec "Global SEO config (metadataBase, canonical, robots)"
cf "$SRC/lib/constants/shared/seo.config.ts"
sec "SEO utility functions (generateMetadata helpers)"
cf "$SRC/lib/shared/seo.ts"
sec "Site constants (ROOT_DOMAIN must match proxy.ts PROD_DOMAIN)"
cf "$SRC/lib/constants/shared/site.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP F — Store URL / Subdomain Builder (2 files) [TIER 1 KRITIS]"
# store-url.ts: CLIENT-SIDE mirror of proxy.ts routing logic.
#   prod  → https://[slug].fibidy.com  (subdomain)
#   dev   → http://localhost:3000/store/[slug]  (path-based)
#   custom→ https://[customDomain]
# These URLs are used in JSON-LD schemas, sitemap, social share,
# and canonical tags — must stay in sync with proxy rewrite logic.
# ════════════════════════════════════════════════════════════════
sec "Store URL builder (subdomain vs path-based per environment)"
cf "$SRC/lib/public/store-url.ts"
sec "useStoreUrls React hook (wraps store-url.ts)"
cf "$SRC/lib/public/use-store-urls.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP G — JSON-LD Schema Components (6 files) [TIER 1]"
# Structured data for Google rich results.
# Canonical URLs inside schemas must match proxy rewrite output —
# wrong URL format = Google indexes wrong URL variant.
# ════════════════════════════════════════════════════════════════
sec "Base JSON-LD script injector"
cf "$SRC/components/store/shared/json-ld.tsx"
sec "LocalBusiness schema (store homepage)"
cf "$SRC/components/store/shared/local-business-schema.tsx"
sec "Organization schema"
cf "$SRC/components/store/shared/organization-schema.tsx"
sec "ProductList schema (store /products page)"
cf "$SRC/components/store/shared/product-list-schema.tsx"
sec "Product schema (single product page)"
cf "$SRC/components/store/shared/product-schema.tsx"
sec "BreadcrumbList schema"
cf "$SRC/components/store/shared/breadcrumb-schema.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP H — Store Layout & Pages with generateMetadata (5 files) [TIER 1]"
# All contain generateMetadata() / metadata exports.
# store/[slug]/layout.tsx sets metadataBase = tenant canonical URL
# (subdomain in prod, path in dev) — this is critical for correct
# <link rel="canonical"> and OG url tags on all child pages.
# ════════════════════════════════════════════════════════════════
sec "Store shell layout (metadataBase = tenant canonical URL)"
cf "$SRC/app/[locale]/store/[slug]/layout.tsx"
sec "Store homepage (title, description, OG from tenant data)"
cf "$SRC/app/[locale]/store/[slug]/page.tsx"
sec "Store products list page (metadata)"
cf "$SRC/app/[locale]/store/[slug]/products/page.tsx"
sec "Store single product page (metadata per product)"
cf "$SRC/app/[locale]/store/[slug]/products/[id]/page.tsx"
sec "Store about page (metadata)"
cf "$SRC/app/[locale]/store/[slug]/about/page.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP I — Tenant API & Types (3 files) [TIER 1]"
# tenants.ts: getBySlug() + getByDomain() — feeds canonical slug
# into store pages, JSON-LD, and OG images.
# tenant.ts: must have slug + customDomain fields for URL building.
# api.ts: shared response envelope types.
# ════════════════════════════════════════════════════════════════
sec "Tenant API client (getBySlug, getByDomain)"
cf "$SRC/lib/api/tenants.ts"
sec "Tenant type definition (slug, customDomain fields)"
cf "$SRC/types/tenant.ts"
sec "Shared API response types"
cf "$SRC/types/api.ts"

# ════════════════════════════════════════════════════════════════
block "GROUP J — Social Share (1 file) [TIER 2]"
# Builds share URLs via store-url.ts — must produce correct
# subdomain or path-based URL depending on environment.
# ════════════════════════════════════════════════════════════════
sec "Social share component"
cf "$SRC/components/store/shared/social-share.tsx"

# ════════════════════════════════════════════════════════════════
block "GROUP K — Next.js Root Config (3 files) [TIER 1]"
# next.config: images.remotePatterns must include *.fibidy.com wildcard
# for subdomain tenant images to load. Also any custom headers/rewrites.
# Root app/layout.tsx: global metadataBase — affects all non-store routes.
# public/robots.txt: crawl rules (Disallow /api, allow /store/* etc).
# ════════════════════════════════════════════════════════════════
sec "Next.js config (try both .ts and .js extensions)"
cf "$ROOT/next.config.ts"
sec "Root app layout (global metadataBase, viewport, lang attribute)"
cf "$SRC/app/layout.tsx"
sec "Static robots.txt"
cf "$ROOT/public/robots.txt"

# ════════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════════
PCT=0; [ $TOTAL -gt 0 ] && PCT=$(( FOUND * 100 / TOTAL ))

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}✓ Found   : $FOUND / $TOTAL${NC}"
[ $MISSING -gt 0 ] && echo -e "  ${RED}✗ Missing : $MISSING${NC}" || echo -e "  ${GREEN}✗ Missing : 0${NC}"
echo -e "  Coverage  : ${YELLOW}$PCT%${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "  Output: ${CYAN}$FILE${NC}"
echo ""
[ $MISSING -gt 0 ] && echo -e "  ${YELLOW}⚠ Missing = belum dibuat atau path beda. Cek & adjust.${NC}"

{
    echo ""
    echo "##  SUMMARY"
    echo "Found    : $FOUND / $TOTAL"
    echo "Missing  : $MISSING"
    echo "Coverage : $PCT%"
} >> "$FILE"