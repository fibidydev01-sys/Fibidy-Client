import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { PublicTenant } from '@/types/tenant';
import type { Product } from '@/types/product';
import { tenantsApi } from '@/lib/api/tenants';
import { productsApi } from '@/lib/api/products';
import { StoreBreadcrumb } from '@/components/layout/store/store-breadcrumb';
import { ProductGallery } from '@/components/store/showcase/product-gallery';
import { ProductInfo } from '@/components/store/showcase/product-info';
import { ProductActions } from '@/components/store/showcase/product-actions';
import { PaymentShippingInfo } from '@/components/store/showcase/payment-shipping-info';
import { RelatedProducts } from '@/components/store/showcase/related-products';
import { ProductGridSkeleton } from '@/components/layout/store/store-skeleton';
import { ProductSchema } from '@/components/store/shared/product-schema';
import { BreadcrumbSchema } from '@/components/store/shared/breadcrumb-schema';
import { SocialShare } from '@/components/store/shared/social-share';
import { generateProductBreadcrumbs } from '@/lib/shared/seo';
import { createProductMetadata } from '@/lib/shared/seo';
import { Separator } from '@/components/ui/separator';

// ==========================================
// TYPES
// ==========================================

interface ProductPageProps {
  params: Promise<{ slug: string; id: string }>;
}

// ==========================================
// DATA FETCHING
// ==========================================

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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const [tenant, product] = await Promise.all([getTenant(slug), getProduct(slug, id)]);

  if (!tenant || !product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
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
  const { slug, id } = await params;

  const [tenant, product] = await Promise.all([getTenant(slug), getProduct(slug, id)]);

  if (!tenant || !product) notFound();

  const relatedProducts = await getRelatedProducts(slug, id, product.category);
  const productUrl = `https://www.fibidy.com/store/${tenant.slug}/products/${product.id}`;

  const breadcrumbs = generateProductBreadcrumbs(
    { name: tenant.name, slug: tenant.slug },
    { name: product.name, id: product.id, slug: product.slug, category: product.category }
  );

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
              { label: 'Products', href: `/store/${slug}/products` },
              { label: product.name },
            ]}
          />
        </div>

        {/* Product Detail */}
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="space-y-6">
            <ProductInfo product={product} />
            <PaymentShippingInfo tenant={tenant} />

            {/* Share */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Share this product:</span>
              <SocialShare
                url={productUrl}
                title={`${product.name} - ${tenant.name}`}
                description={product.description || `Buy ${product.name} at ${tenant.name}`}
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