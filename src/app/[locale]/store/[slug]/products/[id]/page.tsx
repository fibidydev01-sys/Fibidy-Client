import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { PublicTenant } from '@/types/tenant';
import type { Product } from '@/types/product';
import { tenantsApi } from '@/lib/api/tenants';
import { productsApi } from '@/lib/api/products';
import { StoreBreadcrumb } from '@/components/layout/store/store-breadcrumb';
import { ProductGallery } from '@/components/store/showcase/product-gallery';
import { ProductInfo } from '@/components/store/showcase/product-info';
import { ProductActions } from '@/components/store/showcase/product-actions';
import { RelatedProducts } from '@/components/store/showcase/related-products';
import { ProductGridSkeleton } from '@/components/layout/store/store-skeleton';
import { ProductSchema } from '@/components/store/shared/product-schema';
import { BreadcrumbSchema } from '@/components/store/shared/breadcrumb-schema';
import { SocialShare } from '@/components/store/shared/social-share';
import { generateProductBreadcrumbs } from '@/lib/shared/seo';
import { createProductMetadata } from '@/lib/shared/seo';
import { Separator } from '@/components/ui/separator';

// ==========================================
// STORE PRODUCT DETAIL PAGE
// File: src/app/[locale]/store/[slug]/products/[id]/page.tsx
//
// [i18n FIX — 2026-04-19]
// Four pieces moved to JSON:
//
//   - Metadata fallback title + description (when tenant/product 404)
//     → `store.metadata.productNotFoundTitle`
//     → `store.metadata.productNotFoundDescription`
//
//   - Social-share description fallback (rendered when product has no
//     description of its own) — was `Buy ${product.name} at ${tenant.name}`.
//     Now `store.product.detail.buyFallbackDescription` with `{name}` and
//     `{tenant}` slots. Follows the same convention as the discover
//     detail page.
//
//   - Breadcrumb "Products" label → `store.breadcrumb.products`.
//
//   - "Share this product:" label → `store.product.detail.shareLabel`.
//
// `createProductMetadata` composes the happy-path metadata from
// user-authored fields; that helper is outside this audit scope and
// already handles its own description composition.
// ==========================================

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string; id: string }>;
}

async function getTenant(slug: string): Promise<PublicTenant | null> {
  try {
    return await tenantsApi.getBySlug(slug);
  } catch {
    return null;
  }
}

async function getProduct(slug: string, productId: string): Promise<Product | null> {
  try {
    return await productsApi.getByStoreAndId(slug, productId);
  } catch {
    return null;
  }
}

async function getRelatedProducts(
  slug: string,
  currentId: string,
  category?: string | null
): Promise<Product[]> {
  try {
    const response = await productsApi.getByStore(slug, {
      isActive: true,
      category: category || undefined,
      limit: 4,
    });
    return response.data.filter((p) => p.id !== currentId);
  } catch {
    return [];
  }
}

// ==========================================
// METADATA
// ==========================================

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug, id } = await params;
  const [tenant, product] = await Promise.all([getTenant(slug), getProduct(slug, id)]);

  if (!tenant || !product) {
    const t = await getTranslations({ locale, namespace: 'store.metadata' });
    return {
      title: t('productNotFoundTitle'),
      description: t('productNotFoundDescription'),
      robots: { index: false, follow: false },
    };
  }

  return createProductMetadata({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
    },
    tenant: {
      name: tenant.name,
      slug: tenant.slug,
    },
  });
}

// ==========================================
// PAGE
// ==========================================

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug, id } = await params;

  const [tenant, product] = await Promise.all([getTenant(slug), getProduct(slug, id)]);

  if (!tenant || !product) notFound();

  const [tDetail, tBreadcrumb] = await Promise.all([
    getTranslations({ locale, namespace: 'store.product.detail' }),
    getTranslations({ locale, namespace: 'store.breadcrumb' }),
  ]);

  const relatedProducts = await getRelatedProducts(slug, id, product.category);
  const productUrl = `https://www.fibidy.com/store/${tenant.slug}/products/${product.id}`;

  const breadcrumbs = generateProductBreadcrumbs(
    { name: tenant.name, slug: tenant.slug },
    { name: product.name, id: product.id, slug: product.slug, category: product.category }
  );

  // Fallback description for SocialShare — product-authored description
  // wins when present, i18n template kicks in otherwise.
  const shareDescription =
    product.description ||
    tDetail('buyFallbackDescription', { name: product.name, tenant: tenant.name });

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ProductSchema
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          comparePrice: product.comparePrice,
          images: product.images,
          category: product.category,
        }}
        tenant={{
          name: tenant.name,
          slug: tenant.slug,
          whatsapp: tenant.whatsapp || '',
        }}
      />

      <div className="container px-4 py-8">

        {/* Breadcrumb */}
        <div className="mb-6">
          <StoreBreadcrumb
            storeSlug={slug}
            storeName={tenant.name}
            items={[
              { label: tBreadcrumb('products'), href: `/store/${slug}/products` },
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Detail */}
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="space-y-6">
            <ProductInfo product={product} />

            {/* Share */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {tDetail('shareLabel')}
              </span>
              <SocialShare
                url={productUrl}
                title={`${product.name} - ${tenant.name}`}
                description={shareDescription}
                variant="buttons"
              />
            </div>

            <Separator />
            <ProductActions product={product} tenant={tenant} />
          </div>
        </div>

        {/* Related Products */}
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <RelatedProducts products={relatedProducts} storeSlug={slug} />
        </Suspense>

      </div>
    </>
  );
}