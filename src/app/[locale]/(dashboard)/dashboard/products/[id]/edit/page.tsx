'use client';

// ==========================================
// EDIT PRODUCT PAGE
// File: src/app/[locale]/(dashboard)/dashboard/products/[id]/edit/page.tsx
//
// [REALTIME REFRESH FIX — May 2026]
//
// Previously this page used `useState` + `useEffect` + raw API calls
// for BOTH product detail AND categories, with duplicate fallback
// logic that mirrored `useProductCategories()`. Result:
//   - Product detail held as local state → stale after any mutation
//     elsewhere (e.g. update from another tab, refund webhook).
//   - Categories fetched once on mount, never invalidated.
//   - Duplicated fallback logic (try /categories endpoint, fall
//     back to extracting from /products) drifted from the hook
//     version.
//
// Now backed entirely by TanStack hooks:
//
//   1. `useProduct(id)` — fetches the product. Returns the same
//      cache slot used by any other consumer in the app, and is
//      invalidated by useUpdateProduct / useUpdateProductFile.
//
//   2. `useProductCategories(product?.category)` — fetches the
//      category list AND merges the current product's category in
//      if it's not already there. This preserves the original
//      "always show current category in datalist" behavior in a
//      single line, instead of an imperative `.includes()` check
//      + `.push()` + `.sort()`.
//
//   3. Loading & not-found state derived directly from useQuery —
//      no manual `isLoading` / `isNotFound` state machines.
//
// Notes on edge cases:
//   - `useProduct` retries 404s exactly zero times (see hook impl),
//     so notFound() triggers quickly when an invalid id is in the URL.
//   - Categories load lazily; the datalist may briefly show only
//     the current product's category before the full list arrives.
//     This is fine — the input is free-text anyway.
// ==========================================

import { useParams, notFound } from 'next/navigation';
import {
  useProduct,
  useProductCategories,
} from '@/hooks/dashboard/use-products';
import { ProductForm } from '@/components/dashboard/product/form/product';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiRequestError } from '@/lib/api/client';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const {
    data: product,
    isLoading: isProductLoading,
    error: productError,
  } = useProduct(id);

  // Pass the product's current category so it's guaranteed to
  // appear in the datalist even if the list endpoint hasn't
  // returned it yet (or doesn't include it for any reason).
  const { data: categories } = useProductCategories(
    product?.category ?? undefined,
  );

  // 404 → next/navigation notFound()
  if (
    productError instanceof ApiRequestError &&
    productError.isNotFound()
  ) {
    return notFound();
  }

  if (isProductLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!product) return null;

  return <ProductForm product={product} categories={categories ?? []} />;
}
