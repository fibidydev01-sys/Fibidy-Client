'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { productsApi } from '@/lib/api/products';
import { getErrorMessage } from '@/lib/api/client';
import { ProductForm } from '@/components/dashboard/product/form/product';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/product';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Product dulu — blocking
        const productData = await productsApi.getById(id);
        setProduct(productData);

        // Categories — non-blocking, best effort
        let fetched: string[] = [];
        try {
          fetched = await productsApi.getCategories();
        } catch {
          // Fallback: ekstrak dari semua produk
          try {
            const all = await productsApi.getAll({ limit: 200 });
            const unique = new Set<string>();
            all.data.forEach((p) => { if (p.category) unique.add(p.category); });
            fetched = Array.from(unique).sort();
          } catch {
            // Categories tetap kosong, tidak blocking
          }
        }

        // Pastikan kategori produk ini selalu ada di list
        if (productData.category && !fetched.includes(productData.category)) {
          fetched = [productData.category, ...fetched].sort();
        }

        setCategories(fetched);
      } catch (err) {
        console.error('Failed to fetch product:', getErrorMessage(err));
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isNotFound) return notFound();

  if (isLoading) {
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

  return <ProductForm product={product} categories={categories} />;
}