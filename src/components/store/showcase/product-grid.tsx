// ==========================================
// PRODUCT GRID — Public Store
//
// Note: Uses 'use client' karena pakai useTranslations.
// (Sebelumnya server component — sekarang jadi client karena i18n.)
// ==========================================

'use client';

import { useTranslations } from 'next-intl';
import { ProductCard } from './product-card';
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Package } from 'lucide-react';
import { GRID_COLS } from '@/lib/constants/shared/constants';
import type { Product } from '@/types/product';

interface ProductGridProps {
  products: Product[];
  storeSlug: string;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({
  products,
  storeSlug,
  columns = 4,
}: ProductGridProps) {
  const t = useTranslations('store.products');

  if (products.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Package />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>{t('empty')}</EmptyTitle>
          <EmptyDescription>
            {t('emptyHint')}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className={`grid ${GRID_COLS[columns]} gap-4`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          storeSlug={storeSlug}
        />
      ))}
    </div>
  );
}