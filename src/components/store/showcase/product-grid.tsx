// ==========================================
// PRODUCT GRID — Public Store
// ✅ Server Component — zero JS bundle
// ==========================================

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
  if (products.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <Package />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Tidak ada produk ditemukan</EmptyTitle>
          <EmptyDescription>
            Coba ubah filter atau kata kunci pencarian.
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