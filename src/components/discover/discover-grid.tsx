import { DiscoverCard } from './discover-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { PublicProduct } from '@/types/product';

interface DiscoverGridProps {
  products: PublicProduct[];
  isLoading: boolean;
}

export function DiscoverGrid({ products, isLoading }: DiscoverGridProps) {
  if (isLoading) return <DiscoverGridSkeleton />;

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Tidak ada produk ditemukan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <DiscoverCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function DiscoverGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-xl" />
      ))}
    </div>
  );
}