import { Skeleton } from '@/components/ui/skeleton';

// ==========================================
// STORE LOADING SKELETONS
// File: src/components/layout/store/store-skeleton.tsx
//
// [SKELETON SIMPLIFIKASI — Agu 2026]
// ProductCardSkeleton sebelumnya menggambar 4 block terpisah (gambar +
// kategori + 2 baris nama + harga) meniru struktur ProductCard asli persis.
// Diubah jadi SATU block polos seukuran kartu — konsisten dengan
// penyederhanaan yang sama di ProductGridCardSkeleton (dashboard) dan
// KatalogCardSkeleton (kasir). StoreHeaderSkeleton dan ProductDetailSkeleton
// TIDAK diubah — keduanya bukan skeleton kartu produk, jadi di luar
// perubahan ini.
// ==========================================

export function StoreHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="hidden sm:block">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-[var(--shape-control)]" />
          <Skeleton className="h-10 w-10 rounded-[var(--shape-control)]" />
        </div>
      </div>
    </header>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="aspect-square w-full overflow-hidden rounded-[var(--shape-panel)] bg-card">
      <Skeleton className="h-full w-full rounded-[var(--shape-panel)]" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="container px-4 py-8">
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-64 mb-6" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-[var(--shape-panel)]" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-[var(--shape-panel)]" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-px w-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}