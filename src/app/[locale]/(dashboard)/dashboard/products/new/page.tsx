'use client';

// ==========================================
// NEW PRODUCT PAGE
// File: src/app/[locale]/(dashboard)/dashboard/products/new/page.tsx
//
// [REALTIME REFRESH FIX — May 2026]
//
// Previously this page used `useState` + `useEffect` + raw
// productsApi.getCategories() — bypassing TanStack Query entirely.
// That meant:
//   - Categories were fetched once on mount and never refreshed.
//   - If the seller created a product with a new category, the next
//     visit to /new wouldn't see it without a full page reload.
//   - Mutation invalidations had zero effect on this page.
//
// Now the page is a thin wrapper around `useProductCategories()`
// from the products hook. TanStack handles caching, refetching, and
// invalidation. When a mutation in `use-products.ts` invalidates
// `queryKeys.products.categories()`, this page receives fresh data
// automatically on next mount or when stale.
//
// `categories ?? []` falls back to empty array during the brief
// initial fetch — the form renders normally, just without typeahead
// suggestions for the first ~100ms. This is intentional: blocking
// the form on a non-critical typeahead would feel worse than
// letting it render immediately.
// ==========================================

import { useProductCategories } from '@/hooks/dashboard/use-products';
import { ProductForm } from '@/components/dashboard/product/form/product';

export default function NewProductPage() {
  const { data: categories } = useProductCategories();

  return <ProductForm categories={categories ?? []} />;
}
