#!/bin/bash
# ================================================================
# collect.sh — Fibidy codebase collector
#
# Aligned with PLAYBOOK v1.1 (3-Layer paradigm):
#   Layer 1 = INPUT (Settings)
#   Layer 2 = EDITOR (Studio + Blocks)
#   Layer 3 = OUTPUT (Storefront)
#
# Usage:
#   bash collect.sh                       # default = all
#   bash collect.sh <target>
#
# Available targets:
#
#   foundation                Universal files (config, i18n, API base, providers, types)
#
#   settings[:section]        Layer 1 INPUT — content editing forms
#       :hero | :about | :contact | :social | :password | :language
#       (no suffix = all settings sections)
#
#   studio                    Layer 2 EDITOR — section-agnostic shell
#                             (page, drawer, builder, hooks, store)
#
#   blocks[:section]          Layer 2 EDITOR — section variant components
#       :hero        currently 7 variants (hero1..hero7)
#       :header      future (HEADER_BLOCKS=[] — update array when adding)
#       :footer      future
#       :about       future (currently single design — see storefront:about)
#       :contact     future (currently single design)
#       :products    future (currently single design set)
#       (no suffix = all sections that have variants implemented)
#
#   storefront[:section]      Layer 3 OUTPUT — public-facing rendering
#       :hero | :about | :contact | :products | :checkout
#       (no suffix = full storefront including SEO + layout)
#
#   stores                    Cross-cutting Zustand stores + consumers + guards
#
#   layer1                    alias = foundation + settings
#   layer2                    alias = foundation + studio + blocks
#   layer3                    alias = foundation + storefront
#
#   all                       everything (large output — use sparingly)
#
# Examples:
#   bash collect.sh blocks:hero        # working on hero variants
#   bash collect.sh settings:contact   # editing contact form steps
#   bash collect.sh storefront:about   # building About variant on storefront
#   bash collect.sh layer2             # full Layer 2 editor context
#
# ================================================================

SRC="./src"
MSG="./messages"
OUT="collections"
mkdir -p "$OUT"

TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
TARGET="${1:-all}"

# ================================================================
# SECTION CONFIG — single source of truth
# Update these arrays when you add new variants.
# ================================================================

# Block variants (each = filename without .tsx)
HERO_BLOCKS=(hero1 hero2 hero3 hero4 hero5 hero6 hero7)
HEADER_BLOCKS=()      # future: header1 header2 ...
FOOTER_BLOCKS=()      # future
ABOUT_BLOCKS=()       # future (currently single design)
CONTACT_BLOCKS=()     # future (currently single design)
PRODUCTS_BLOCKS=()    # future

# Settings sections that have form components
SETTINGS_SECTIONS=(hero about contact social password language)

# ================================================================
# OUTPUT FILE NAMING
# ================================================================

TARGET_SLUG=$(echo "$TARGET" | tr ':' '-' | tr '[:lower:]' '[:upper:]')
FILE="$OUT/${TARGET_SLUG}-$TIMESTAMP.txt"

# ================================================================
# HELPERS
# ================================================================

cf() {
    local f=$1
    [ -f "$f" ] || { echo "  ⚠ NOT FOUND: $f"; return; }
    local rel="${f#./}"
    local lines=$(wc -l < "$f")
    printf "\n================================================\n" >> "$FILE"
    printf "FILE: %s\n"    "$rel"                                 >> "$FILE"
    printf "PATH: %s\n"    "$f"                                   >> "$FILE"
    printf "Lines: %s\n"   "$lines"                               >> "$FILE"
    printf "================================================\n\n" >> "$FILE"
    cat "$f"                                                      >> "$FILE"
    printf "\n\n"                                                 >> "$FILE"
    echo "  ✓ $rel ($lines lines)"
}

sec() {
    printf "\n################################################################\n" >> "$FILE"
    printf "##  %s\n" "$1"                                                       >> "$FILE"
    printf "################################################################\n\n" >> "$FILE"
    echo "▶ $1"
}

block_header() {
    local title=$1
    local subtitle=$2
    printf "################################################################\n" >> "$FILE"
    printf "##  %s\n" "$title"                                                  >> "$FILE"
    [ -n "$subtitle" ] && printf "##  %s\n" "$subtitle"                         >> "$FILE"
    printf "##  Generated: %s\n" "$(date '+%Y-%m-%d %H:%M:%S')"                 >> "$FILE"
    printf "##  Playbook v1.1 alignment\n"                                      >> "$FILE"
    printf "################################################################\n\n" >> "$FILE"
}

summary() {
    local label=$1
    local file=$2
    local count size
    count=$(grep -c '^FILE:' "$file" 2>/dev/null || echo "?")
    size=$(du -h "$file" | cut -f1)
    echo ""
    echo "================================================================"
    echo "  ✅  $label collected"
    echo "  📄  File  : $file"
    echo "  📦  Files : $count"
    echo "  💾  Size  : $size"
    echo "================================================================"
}

# Collect blocks for a given section
# args: $1 = section name (hero|header|footer|about|contact|products)
#       $2 = nameref to array of block names
collect_section_blocks() {
    local section=$1
    local -n arr=$2

    if [ "${#arr[@]}" -eq 0 ]; then
        echo "  ⚠ ${section} blocks not yet implemented (update ${section^^}_BLOCKS array in script config)"
        printf "##  ⚠ %s blocks: not yet implemented\n" "$section" >> "$FILE"
        return
    fi

    sec "${section^} blocks (${#arr[@]} variants)"
    for b in "${arr[@]}"; do
        cf "$SRC/components/dashboard/blocks/${b}.tsx"
    done
}

# ================================================================
# COLLECTORS
# ================================================================

# ---------- FOUNDATION ----------
collect_foundation() {
    block_header "FOUNDATION" "Universal cross-cutting files"
    echo ""
    echo "════════════════════════════════════════"
    echo "  📦  Collecting: FOUNDATION"
    echo "════════════════════════════════════════"

    sec "Project root config"
    cf "package.json"
    cf "next.config.ts"
    cf "next.config.js"
    cf "tsconfig.json"

    sec "i18n config"
    cf "$SRC/i18n/routing.ts"
    cf "$SRC/i18n/navigation.ts"
    cf "$SRC/i18n/request.ts"

    sec "API client base"
    cf "$SRC/lib/api/client.ts"
    cf "$SRC/lib/api/server-headers.ts"
    cf "$SRC/proxy.ts"

    sec "Providers"
    cf "$SRC/lib/providers/root-provider.tsx"
    cf "$SRC/lib/providers/theme-provider.tsx"
    cf "$SRC/lib/providers/toast-provider.tsx"

    sec "Constants"
    cf "$SRC/lib/constants/shared/constants.ts"
    cf "$SRC/lib/constants/shared/site.ts"
    cf "$SRC/lib/constants/shared/seo.config.ts"
    cf "$SRC/lib/constants/shared/theme-colors.ts"
    cf "$SRC/lib/constants/shared/categories.ts"
    cf "$SRC/lib/constants/shared/route-guard.ts"

    sec "Feature flags"
    cf "$SRC/lib/config/features.ts"

    sec "Shared utilities (lib/shared)"
    cf "$SRC/lib/shared/utils.ts"
    cf "$SRC/lib/shared/format.ts"
    cf "$SRC/lib/shared/colors.ts"
    cf "$SRC/lib/shared/validations.ts"
    cf "$SRC/lib/shared/schema.ts"
    cf "$SRC/lib/shared/seo.ts"
    cf "$SRC/lib/shared/query-keys.ts"
    cf "$SRC/lib/shared/cloudinary.ts"
    cf "$SRC/lib/shared/product-utils.ts"

    sec "Core types"
    cf "$SRC/types/api.ts"
    cf "$SRC/types/tenant.ts"
    cf "$SRC/types/landing.ts"
    cf "$SRC/types/auth.ts"
    cf "$SRC/types/product.ts"

    sec "Global app shell"
    cf "$SRC/app/layout.tsx"
    cf "$SRC/app/[locale]/layout.tsx"
    cf "$SRC/app/globals.css"
    cf "$SRC/app/favicon.ico"
}

# ---------- LAYER 1 — INPUT (Settings) ----------
collect_settings() {
    local section="${1:-all}"

    block_header "LAYER 1 — INPUT (Settings)" "Section filter: $section"
    echo ""
    echo "════════════════════════════════════════"
    echo "  📦  Collecting: SETTINGS [$section]"
    echo "════════════════════════════════════════"

    if [ "$section" = "all" ]; then
        sec "Settings entry pages"
        cf "$SRC/app/[locale]/(dashboard)/dashboard/settings/page.tsx"
        cf "$SRC/app/[locale]/(dashboard)/dashboard/settings/client.tsx"
    fi

    case "$section" in
        all|hero)
            sec "Settings — Hero (3-step wizard)"
            cf "$SRC/components/dashboard/settings/hero.tsx"
            cf "$SRC/components/dashboard/settings/form/hero/step-identity.tsx"
            cf "$SRC/components/dashboard/settings/form/hero/step-story.tsx"
            cf "$SRC/components/dashboard/settings/form/hero/step-appearance.tsx"
            ;;
    esac

    case "$section" in
        all|about)
            sec "Settings — About (highlights)"
            cf "$SRC/components/dashboard/settings/about.tsx"
            cf "$SRC/components/dashboard/settings/form/about/step-highlights.tsx"
            ;;
    esac

    case "$section" in
        all|contact)
            sec "Settings — Contact (3-step wizard)"
            cf "$SRC/components/dashboard/settings/contact.tsx"
            cf "$SRC/components/dashboard/settings/form/contact/step-contact-info.tsx"
            cf "$SRC/components/dashboard/settings/form/contact/step-location.tsx"
            cf "$SRC/components/dashboard/settings/form/contact/step-section-heading.tsx"
            ;;
    esac

    case "$section" in
        all|social)
            sec "Settings — Social (13 platforms grouped)"
            cf "$SRC/components/dashboard/settings/social.tsx"
            cf "$SRC/components/dashboard/settings/form/social/step-social-links.tsx"
            ;;
    esac

    case "$section" in
        all|password)
            sec "Settings — Password"
            cf "$SRC/components/dashboard/settings/password.tsx"
            # NOTE: per Playbook v1.1, this file has inline Zod schema
            # that duplicates createPasswordChangeSchema in lib/shared/validations.ts.
            # Decision Log #16 — flagged for consolidation.
            ;;
    esac

    case "$section" in
        all|language)
            sec "Settings — Language (locale switcher)"
            cf "$SRC/components/dashboard/settings/language.tsx"
            ;;
    esac

    if [ "$section" = "all" ]; then
        sec "Settings shared dependencies"
        cf "$SRC/components/dashboard/shared/wizard-nav.tsx"
        cf "$SRC/components/dashboard/shared/step-wizard.tsx"
        cf "$SRC/components/dashboard/shared/image-slot.tsx"
        cf "$SRC/components/dashboard/shared/upgrade-modal.tsx"
        cf "$SRC/components/dashboard/shared/og-image.tsx"

        sec "KYC banner (rendered inside settings)"
        cf "$SRC/components/dashboard/product/kyc-banner.tsx"

        sec "Hooks (settings consumers)"
        cf "$SRC/hooks/shared/use-tenant.ts"
        cf "$SRC/hooks/shared/use-cloudinary-upload.ts"
        cf "$SRC/hooks/dashboard/use-subscription-plan.ts"
        cf "$SRC/hooks/auth/use-auth.ts"
        cf "$SRC/hooks/dashboard/use-products.ts"

        sec "API"
        cf "$SRC/lib/api/tenants.ts"

        sec "Types"
        cf "$SRC/types/tenant.ts"

        sec "i18n"
        cf "$MSG/en/settings.json"
        cf "$MSG/id/settings.json"
    fi
}

# ---------- LAYER 2A — EDITOR (Studio shell, section-agnostic) ----------
collect_studio() {
    block_header "LAYER 2 — EDITOR (Studio shell)" "Section-agnostic builder logic"
    echo ""
    echo "════════════════════════════════════════"
    echo "  📦  Collecting: STUDIO"
    echo "════════════════════════════════════════"

    sec "Studio page (entry)"
    cf "$SRC/app/[locale]/(dashboard)/dashboard/studio/page.tsx"

    sec "Studio components (cross-section)"
    cf "$SRC/components/dashboard/studio/builder-header.tsx"
    cf "$SRC/components/dashboard/studio/builder-loading-steps.tsx"
    cf "$SRC/components/dashboard/studio/block-drawer.tsx"
    cf "$SRC/components/dashboard/studio/block-options.ts"
    cf "$SRC/components/dashboard/studio/live-preview.tsx"
    cf "$SRC/components/dashboard/studio/full-preview-drawer.tsx"
    cf "$SRC/components/dashboard/studio/landing-error-boundary.tsx"

    sec "Studio store + hooks"
    cf "$SRC/stores/use-builder-store.ts"
    cf "$SRC/hooks/dashboard/use-landing-config.ts"
    cf "$SRC/hooks/dashboard/use-subscription-plan.ts"
    cf "$SRC/hooks/shared/use-tenant.ts"

    sec "Block resolver (shared with storefront!)"
    cf "$SRC/components/dashboard/blocks/block.tsx"

    sec "Modals shared with studio"
    cf "$SRC/components/dashboard/shared/upgrade-modal.tsx"

    sec "Types"
    cf "$SRC/types/landing.ts"
    cf "$SRC/types/tenant.ts"

    sec "API"
    cf "$SRC/lib/api/tenants.ts"

    sec "i18n"
    cf "$MSG/en/studio.json"
    cf "$MSG/id/studio.json"
}

# ---------- LAYER 2B — BLOCKS (per-section variants) ----------
collect_blocks() {
    local section="${1:-all}"

    block_header "LAYER 2 — BLOCKS" "Section variants (filter: $section)"
    echo ""
    echo "════════════════════════════════════════"
    echo "  📦  Collecting: BLOCKS [$section]"
    echo "════════════════════════════════════════"

    sec "Block resolver (TenantHero — dynamic loader)"
    cf "$SRC/components/dashboard/blocks/block.tsx"

    case "$section" in
        all|hero)
            collect_section_blocks "hero" HERO_BLOCKS
            ;;
    esac

    case "$section" in
        all|header)
            collect_section_blocks "header" HEADER_BLOCKS
            ;;
    esac

    case "$section" in
        all|footer)
            collect_section_blocks "footer" FOOTER_BLOCKS
            ;;
    esac

    case "$section" in
        all|about)
            collect_section_blocks "about" ABOUT_BLOCKS
            ;;
    esac

    case "$section" in
        all|contact)
            collect_section_blocks "contact" CONTACT_BLOCKS
            ;;
    esac

    case "$section" in
        all|products|product)
            collect_section_blocks "products" PRODUCTS_BLOCKS
            ;;
    esac

    if [ "$section" = "all" ]; then
        sec "Block options + types"
        cf "$SRC/components/dashboard/studio/block-options.ts"
        cf "$SRC/types/landing.ts"
    fi
}

# ---------- LAYER 3 — OUTPUT (Storefront) ----------
collect_storefront() {
    local section="${1:-all}"

    block_header "LAYER 3 — OUTPUT (Storefront)" "Section filter: $section"
    echo ""
    echo "════════════════════════════════════════"
    echo "  📦  Collecting: STOREFRONT [$section]"
    echo "════════════════════════════════════════"

    if [ "$section" = "all" ]; then
        sec "Storefront pages (SSR/SSG)"
        cf "$SRC/app/[locale]/store/[slug]/layout.tsx"
        cf "$SRC/app/[locale]/store/[slug]/page.tsx"
        cf "$SRC/app/[locale]/store/[slug]/about/page.tsx"
        cf "$SRC/app/[locale]/store/[slug]/contact/page.tsx"
        cf "$SRC/app/[locale]/store/[slug]/products/page.tsx"
        cf "$SRC/app/[locale]/store/[slug]/products/[id]/page.tsx"
        cf "$SRC/app/[locale]/store/[slug]/products/[id]/not-found.tsx"

        sec "Storefront layout (Header/Footer — currently single design)"
        cf "$SRC/components/layout/store/store-header.tsx"
        cf "$SRC/components/layout/store/store-footer.tsx"
        cf "$SRC/components/layout/store/store-breadcrumb.tsx"
        cf "$SRC/components/layout/store/store-not-found.tsx"
        cf "$SRC/components/layout/store/store-skeleton.tsx"
    fi

    case "$section" in
        all|hero)
            sec "Storefront — Hero rendering (uses TenantHero from blocks)"
            cf "$SRC/components/dashboard/blocks/block.tsx"
            ;;
    esac

    case "$section" in
        all|about)
            sec "Storefront — About"
            cf "$SRC/components/store/about/tenant-about.tsx"
            ;;
    esac

    case "$section" in
        all|contact)
            sec "Storefront — Contact"
            cf "$SRC/components/store/contact/tenant-contact.tsx"
            ;;
    esac

    case "$section" in
        all|products|product)
            sec "Storefront — Products & Showcase"
            cf "$SRC/components/store/products/tenant-products.tsx"
            cf "$SRC/components/store/showcase/product-card.tsx"
            cf "$SRC/components/store/showcase/product-grid.tsx"
            cf "$SRC/components/store/showcase/product-info.tsx"
            cf "$SRC/components/store/showcase/product-gallery.tsx"
            cf "$SRC/components/store/showcase/product-actions.tsx"
            cf "$SRC/components/store/showcase/product-filters.tsx"
            cf "$SRC/components/store/showcase/product-pagination.tsx"
            cf "$SRC/components/store/showcase/related-products.tsx"
            cf "$SRC/components/store/showcase/featured-products.tsx"
            cf "$SRC/components/store/showcase/category-list.tsx"
            ;;
    esac

    case "$section" in
        all|checkout)
            sec "Storefront — Checkout buttons"
            cf "$SRC/components/store/checkout/stripe-checkout-button.tsx"
            cf "$SRC/components/store/checkout/whatsapp-order-button.tsx"
            cf "$SRC/components/store/checkout/contact-seller-button.tsx"
            ;;
    esac

    if [ "$section" = "all" ]; then
        sec "SEO — OG images"
        cf "$SRC/app/[locale]/store/[slug]/opengraph-image.tsx"
        cf "$SRC/app/[locale]/store/[slug]/products/[id]/opengraph-image.tsx"
        cf "$SRC/app/opengraph-image.tsx"
        cf "$SRC/app/twitter-image.tsx"

        sec "SEO — JSON-LD schemas"
        cf "$SRC/components/store/shared/json-ld.tsx"
        cf "$SRC/components/store/shared/breadcrumb-schema.tsx"
        cf "$SRC/components/store/shared/organization-schema.tsx"
        cf "$SRC/components/store/shared/local-business-schema.tsx"
        cf "$SRC/components/store/shared/product-schema.tsx"
        cf "$SRC/components/store/shared/product-list-schema.tsx"
        cf "$SRC/components/store/shared/social-share.tsx"
        cf "$SRC/lib/shared/schema.ts"
        cf "$SRC/lib/shared/seo.ts"
        cf "$SRC/lib/constants/shared/seo.config.ts"

        sec "SEO — Sitemap"
        cf "$SRC/app/server-sitemap-index.xml/route.ts"
        cf "$SRC/app/server-sitemap/[page]/route.ts"

        sec "API"
        cf "$SRC/lib/api/tenants.ts"
        cf "$SRC/lib/api/products.ts"

        sec "Types"
        cf "$SRC/types/tenant.ts"
        cf "$SRC/types/product.ts"

        sec "i18n"
        cf "$MSG/en/store.json"
        cf "$MSG/id/store.json"
    fi
}

# ---------- STORES (cross-cutting Zustand) ----------
collect_stores() {
    block_header "STORES" "Cross-cutting Zustand state + consumers + guards"
    echo ""
    echo "════════════════════════════════════════"
    echo "  📦  Collecting: STORES"
    echo "════════════════════════════════════════"

    sec "Zustand stores"
    cf "$SRC/stores/auth-store.ts"
    cf "$SRC/stores/auth-dialog-store.ts"
    cf "$SRC/stores/admin-store.ts"
    cf "$SRC/stores/use-builder-store.ts"

    sec "Hook consumers"
    cf "$SRC/hooks/auth/use-auth.ts"
    cf "$SRC/hooks/auth/use-register-wizard.ts"
    cf "$SRC/hooks/admin/use-admin.ts"
    cf "$SRC/hooks/dashboard/use-landing-config.ts"
    cf "$SRC/hooks/shared/use-tenant.ts"
    cf "$SRC/hooks/user/use-buyer-register.ts"
    cf "$SRC/hooks/user/use-upgrade-to-seller.ts"

    sec "Guards"
    cf "$SRC/components/layout/auth/auth-guard.tsx"
    cf "$SRC/components/layout/admin/admin-guard.tsx"
    cf "$SRC/components/layout/dashboard/dashboard-route-guard.tsx"

    sec "Auth dialog (auth-dialog-store consumers)"
    cf "$SRC/components/user-auth/auth-dialog.tsx"
    cf "$SRC/components/user-auth/dialog-login-form.tsx"
    cf "$SRC/components/user-auth/dialog-register-form.tsx"

    sec "API"
    cf "$SRC/lib/api/auth.ts"
    cf "$SRC/lib/api/admin.ts"
    cf "$SRC/lib/api/admin-client.ts"

    sec "Types"
    cf "$SRC/types/auth.ts"
    cf "$SRC/types/admin.ts"
}

# ================================================================
# DISPATCH
# ================================================================

# Truncate / create output file
> "$FILE"

# Parse "target:section" syntax
TARGET_BASE="${TARGET%%:*}"
TARGET_SECTION="${TARGET#*:}"
[ "$TARGET_BASE" = "$TARGET_SECTION" ] && TARGET_SECTION="all"

print_help() {
    echo ""
    echo "  Usage: bash collect.sh [target]"
    echo ""
    echo "  Targets:"
    echo "    foundation                  Universal cross-cutting files"
    echo "    settings[:section]          Layer 1 INPUT — content forms"
    echo "                                  sections: hero|about|contact|social|password|language"
    echo "    studio                      Layer 2 EDITOR — section-agnostic shell"
    echo "    blocks[:section]            Layer 2 EDITOR — section variants"
    echo "                                  sections: hero|header|footer|about|contact|products"
    echo "    storefront[:section]        Layer 3 OUTPUT — public rendering"
    echo "                                  sections: hero|about|contact|products|checkout"
    echo "    stores                      Cross-cutting Zustand + consumers + guards"
    echo "    layer1                      = foundation + settings"
    echo "    layer2                      = foundation + studio + blocks"
    echo "    layer3                      = foundation + storefront"
    echo "    all                         everything (use sparingly)"
    echo ""
    echo "  Examples:"
    echo "    bash collect.sh blocks:hero          # working on hero variants"
    echo "    bash collect.sh settings:contact     # editing contact form"
    echo "    bash collect.sh storefront:about     # building About variant"
    echo "    bash collect.sh layer2               # full Layer 2 editor context"
    echo ""
    echo "  Note: To enable header/footer/about/contact/products blocks,"
    echo "        update the corresponding *_BLOCKS array near the top of this script."
    echo ""
}

case "$TARGET_BASE" in
    foundation)
        collect_foundation
        ;;
    settings)
        collect_settings "$TARGET_SECTION"
        ;;
    studio)
        collect_studio
        ;;
    blocks)
        collect_blocks "$TARGET_SECTION"
        ;;
    storefront)
        collect_storefront "$TARGET_SECTION"
        ;;
    stores)
        collect_stores
        ;;
    layer1)
        collect_foundation
        collect_settings "all"
        ;;
    layer2)
        collect_foundation
        collect_studio
        collect_blocks "all"
        ;;
    layer3)
        collect_foundation
        collect_storefront "all"
        ;;
    all)
        collect_foundation
        collect_settings "all"
        collect_studio
        collect_blocks "all"
        collect_storefront "all"
        collect_stores
        ;;
    *)
        echo ""
        echo "  ❌  Unknown target: '$TARGET'"
        print_help
        exit 1
        ;;
esac

summary "$TARGET" "$FILE"