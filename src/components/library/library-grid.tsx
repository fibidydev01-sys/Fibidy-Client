// src/components/library/library-grid.tsx
//
// [TIDUR-NYENYAK v3 FIX]
// Replaced <a href="/discover"> with <Link href="/discover"> from next/link.
// The <a> tag triggers full page reload + misses Next.js prefetching.

import Link from 'next/link';
import { LibraryCard } from './library-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Purchase } from '@/types/product';

interface LibraryGridProps {
  purchases: Purchase[];
  isLoading: boolean;
}

export function LibraryGrid({ purchases, isLoading }: LibraryGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Library kamu masih kosong.</p>
        <p className="text-sm mt-1">
          Beli produk digital di{' '}
          {/* [v3 FIX] was <a href="/discover"> */}
          <Link href="/discover" className="text-primary hover:underline">
            Discover
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {purchases.map((purchase) => (
        <LibraryCard key={purchase.purchaseId} purchase={purchase} />
      ))}
    </div>
  );
}