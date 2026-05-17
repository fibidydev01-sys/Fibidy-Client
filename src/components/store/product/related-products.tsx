// ==========================================
// RELATED PRODUCTS
// ==========================================

'use client';

import { useTranslations } from 'next-intl';
import { ProductGrid } from './product-grid';
import type { Product } from '@/types/product';

interface RelatedProductsProps {
  products: Product[];
  storeSlug: string;
}

export function RelatedProducts({ products, storeSlug }: RelatedProductsProps) {
  const t = useTranslations('store.products');

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-6">{t('relatedTitle')}</h2>
      <ProductGrid
        products={products}
        storeSlug={storeSlug}
        columns={4}
      />
    </section>
  );
}