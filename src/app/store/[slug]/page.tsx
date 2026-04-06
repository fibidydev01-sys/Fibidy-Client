import { notFound } from 'next/navigation';
import { tenantsApi } from '@/lib/api/tenants';
import { productsApi } from '@/lib/api/products';
import { TenantHero } from '@/components/dashboard/blocks/block';
import { TenantProducts } from '@/components/store/products/tenant-products';
import { BreadcrumbSchema } from '@/components/store/shared/breadcrumb-schema';
import { ProductListSchema } from '@/components/store/shared/product-list-schema';
import { generateTenantBreadcrumbs } from '@/lib/shared/seo';
import type { PublicTenant } from '@/types/tenant';
import type { Product } from '@/types/product';

export const dynamic = 'force-dynamic';

interface StorePageProps {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant) {
    notFound();
  }

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
          listName={`${tenant.name} Products`}
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
              Landing page not configured yet
            </p>
            <p className="text-sm text-muted-foreground">
              Enable sections in Dashboard &gt; Landing Builder
            </p>
          </div>
        )}
      </div>
    </>
  );
}