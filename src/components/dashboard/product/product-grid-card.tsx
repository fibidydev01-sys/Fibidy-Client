'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/product';

// ==========================================
// SKELETON
// ==========================================

export function ProductGridCardSkeleton() {
  return (
    <div className="group">
      <Skeleton className="aspect-square w-full rounded-xl" />
    </div>
  );
}

// ==========================================
// PRODUCT GRID CARD
// Minimal card — foto saja, badge draft
// ==========================================

interface ProductGridCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export function ProductGridCard({ product, onClick }: ProductGridCardProps) {
  const imageUrl = product.images?.[0];

  return (
    <button
      onClick={() => onClick(product)}
      className="group block w-full text-left"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-150 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        {/* Badge draft */}
        {!product.isActive && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500/90 text-white text-xs px-2 py-0.5 rounded">
              Draft
            </span>
          </div>
        )}
      </div>
    </button>
  );
}