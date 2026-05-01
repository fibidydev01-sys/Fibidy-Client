import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { tenantsApi } from '@/lib/api/tenants';
import { productsApi } from '@/lib/api/products';
import { TenantHero } from '@/components/dashboard/blocks/tenant-hero';
import { TenantProducts } from '@/components/store/products/tenant-products';
import { BreadcrumbSchema } from '@/components/store/shared/breadcrumb-schema';
import { ProductListSchema } from '@/components/store/shared/product-list-schema';
import { generateTenantBreadcrumbs } from '@/lib/shared/seo';
import type { PublicTenant } from '@/types/tenant';
import type { Product } from '@/types/product';

// ==========================================
// STORE LANDING PAGE
// File: src/app/[locale]/store/[slug]/page.tsx
//
// [i18n FIX — 2026-04-19]
// Two pieces of copy and one structured-data label moved to JSON:
//
//   - "Landing page not configured yet" → store.landingNotConfigured.title
//   - "Enable sections in Dashboard > Landing Builder" → store.landingNotConfigured.description
//
//   - ProductListSchema `listName` prop — was `${tenant.name} Products`,
//     now uses `store.productList.suffix` template with `{tenant}` slot.
//     This appears in JSON-LD payload consumed by Google/search engines;
//     translating it keeps local-language SERP snippets coherent when a
//     non-EN locale is added.
//
// The `t()` hook can't be called at top level of a server component, so
// we `await getTranslations` once inside the default export and reuse
// the resolved strings.
// ==========================================

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

async function getProducts(slug: string, limit = 8): Promise<Product[]> {
  try {
    const response = await productsApi.getByStore(slug, {
      isActive: true,
      limit,
    });
    return response.data;
  } catch {
    return [];
  }
}

export default async function StorePage({ params }: StorePageProps) {
  const { locale, slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'store' });

  const landingConfig = tenant.landingConfig;

  const breadcrumbs = generateTenantBreadcrumbs({
    name: tenant.name,
    slug: tenant.slug,
  });

  const productLimit = (landingConfig?.products?.config?.limit as number) || 8;
  const products = await getProducts(slug, productLimit);

  const heroEnabled = landingConfig?.hero?.enabled === true;
  const productsEnabled = products.length > 0;
  const hasAnySectionEnabled = heroEnabled || productsEnabled;

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      {products.length > 0 && (
        <ProductListSchema
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            images: p.images,
          }))}
          tenant={{ name: tenant.name, slug: tenant.slug }}
          listName={t('productList.suffix', { tenant: tenant.name })}
        />
      )}

      <div className="container px-4 py-8 space-y-8">
        {heroEnabled && (
          <TenantHero config={landingConfig?.hero} tenant={tenant} />
        )}
        {productsEnabled && (
          <TenantProducts
            products={products}
            config={landingConfig?.products}
            storeSlug={slug}
            tenant={tenant}
          />
        )}

        {!hasAnySectionEnabled && (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2">
              {t('landingNotConfigured.title')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('landingNotConfigured.description')}
            </p>
          </div>
        )}
      </div>
    </>
  );
}