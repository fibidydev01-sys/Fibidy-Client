'use client';

// ==========================================
// EDIT PRODUCT CLIENT
// Fetch product + categories client-side via TanStack Query
// Browser kirim cookie otomatis → tidak ada 401 di prod
// ==========================================

import { notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { queryKeys } from '@/lib/shared/query-keys';
import { ProductForm } from '@/components/dashboard/product/form/product';
import { Skeleton } from '@/components/ui/skeleton';

interface EditProductClientProps {
  id: string;
}

export function EditProductClient({ id }: EditProductClientProps) {
  const {
    data: product,
    isLoading: isLoadingProduct,
    isError,
  } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
    retry: false,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: () => productsApi.getCategories(),
  });

  if (isLoadingProduct || isLoadingCategories) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !product) return notFound();

  const mergedCategories: string[] =
    product.category && !categories.includes(product.category)
      ? [product.category, ...categories].sort()
      : categories;

  return <ProductForm product={product} categories={mergedCategories} />;
}