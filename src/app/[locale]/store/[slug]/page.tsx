import { notFound } from 'next/navigation';
import { tenantsApi } from '@/lib/api/tenants';
import { TenantHero } from '@/components/dashboard/blocks/block';
import { BreadcrumbSchema } from '@/components/store/shared/breadcrumb-schema';
import { generateTenantBreadcrumbs } from '@/lib/shared/seo';
import type { PublicTenant } from '@/types/tenant';

// ============================================================================
// STORE LANDING PAGE
// File: src/app/[locale]/store/[slug]/page.tsx
//
// [LANDING TEMPLATE — 2026-05-13 PHASE 3]
// Slimmed to minimal orchestrator. Block template (block1/2/3) now renders
// the ENTIRE landing page: Hero → Contact → Pre-footer CTA.
//
// REMOVED in this phase:
//   - productsApi import + getProducts() fetch
//   - <TenantProducts/> render (products live at /products page only)
//   - <ProductListSchema/> (no products data on landing anymore)
//   - productsEnabled / hasAnySectionEnabled logic
//   - Fallback "landing not configured" block (template always renders
//     at minimum a hero with storeName fallback)
//
// KEPT:
//   - <BreadcrumbSchema/> for SEO (home → store)
//   - heroEnabled gate (if landing not enabled, show nothing — layout
//     still renders header/footer)
//
// The page is now ~30 lines. All visual rendering delegated to block.tsx
// dispatcher → block{N}.tsx template.
// ============================================================================

export const dynamic = 'force-dynamic';

interface StorePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getTenant(slug: string): Promise<PublicTenant | null> {
  try {
    return await tenantsApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant) {
    notFound();
  }

  const breadcrumbs = generateTenantBreadcrumbs({
    name: tenant.name,
    slug: tenant.slug,
  });

  const heroEnabled = tenant.landingConfig?.hero?.enabled === true;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />

      {/* ── FULL LANDING TEMPLATE — rendered by block{N}.tsx ──────────
          Block template handles: Hero + Contact + Pre-footer CTA.
          Full-bleed layout — no container wrapper needed. */}
      {heroEnabled && (
        <TenantHero config={tenant.landingConfig?.hero} tenant={tenant} />
      )}
    </>
  );
}
