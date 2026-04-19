import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Product } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';
import { productsApi } from '@/lib/api/products';
import { CategoryList } from '@/components/store/showcase/category-list';
import { ProductFilters } from '@/components/store/showcase/product-filters';
import { ProductGrid } from '@/components/store/showcase/product-grid';
import { ProductPagination } from '@/components/store/showcase/product-pagination';
import { ProductGridSkeleton } from '@/components/layout/store/store-skeleton';

// ==========================================
// STORE PRODUCTS LIST PAGE
// File: src/app/[locale]/store/[slug]/products/page.tsx
//
// [i18n FIX — 2026-04-19]
// Two pieces translated:
//
//   - `metadata.title` — was static "All Products". Now resolved via
//     `store.metadata.productsTitle` in async `generateMetadata`.
//
//   - h1 "All Products" inside the page body — now uses
//     `store.products.title`.
//
// The page is a server component, so we `await getTranslations` once at
// the top of the default export.
//
// `ProductFilters`, `CategoryList`, `ProductGrid`, `ProductPagination`
// are separate components outside this audit scope; they manage their
// own copy through `useTranslations` internally.
// ==========================================

interface ProductsPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'store.metadata' });
  return {
    title: t('productsTitle'),
  };
}

async function getProducts(
  slug: string,
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<PaginatedResponse<Product>> {
  const page = Number(searchParams.page) || 1;
  const search = searchParams.search as string | undefined;
  const category = searchParams.category as string | undefined;

  try {
    return await productsApi.getByStore(slug, {
      page,
      limit: 12,
      search,
      category,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isActive: true,
    });
  } catch {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 12, totalPages: 0 },
    };
  }
}

// ✅ Extract categories from getProducts result — no extra API call
function extractCategories(products: Product[]): string[] {
  const categories = new Set<string>();
  products.forEach((p) => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories).sort();
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale, slug } = await params;
  const resolvedSearchParams = await searchParams;

  const t = await getTranslations({ locale, namespace: 'store.products' });

  const productsResponse = await getProducts(slug, resolvedSearchParams);
  const { data: products, meta } = productsResponse;

  // ✅ Categories derived from existing data — zero extra API call
  const categories = extractCategories(products);
  const currentCategory = resolvedSearchParams.category as string | undefined;

  return (
    <div className="container px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
      </div>

      {/* Search */}
      <div className="mb-4">
        <ProductFilters storeSlug={slug} />
      </div>

      {/* Category List */}
      {categories.length > 0 && (
        <div className="mb-6">
          <CategoryList
            categories={categories}
            storeSlug={slug}
            currentCategory={currentCategory}
          />
        </div>
      )}

      <Suspense fallback={<ProductGridSkeleton count={12} />}>
        <ProductGrid
          products={products}
          storeSlug={slug}
        />
      </Suspense>

      {/* Pagination */}
      <ProductPagination
        storeSlug={slug}
        currentPage={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
      />
    </div>
  );
}