'use client';

// ==========================================
// EDIT PRODUCT CLIENT
// Terima initialData dari server → tidak ada 401 saat pertama load
// TanStack Query handle refetch setelah interaksi (create/update/delete)
// ==========================================

import { notFound } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { queryKeys } from '@/lib/shared/query-keys';
import { ProductForm } from '@/components/dashboard/product/form/product';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/product';

interface EditProductClientProps {
  id: string;
  initialProduct: Product | null;
  initialCategories: string[];
}

export function EditProductClient({
  id,
  initialProduct,
  initialCategories,
}: EditProductClientProps) {
  const {
    data: product,
    isLoading: isLoadingProduct,
    isError,
  } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productsApi.getById(id),
    initialData: initialProduct ?? undefined,
    enabled: !initialProduct,
  });

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.products.categories(),
    queryFn: () => productsApi.getCategories(),
    initialData: initialCategories,
    enabled: initialCategories.length === 0,
  });

  if (isLoadingProduct) {
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