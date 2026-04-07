'use client';

import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api/products';
import { ProductForm } from '@/components/dashboard/product/form/product';

export default function NewProductPage() {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetched = await productsApi.getCategories();
        setCategories(fetched);
      } catch {
        // Categories kosong, tidak blocking — user tetap bisa tambah produk
      }
    };

    fetchCategories();
  }, []);

  return <ProductForm categories={categories} />;
}