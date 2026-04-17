'use client';

// discover/client.tsx
//
// Perubahan dari versi sebelumnya:
//   1. Response discoverApi.getAll() sekarang { data, meta } — bukan array langsung
//   2. Tambah state page untuk pagination
//   3. Tambah Prev/Next navigation

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { discoverApi } from '@/lib/api/discover';
import { queryKeys } from '@/lib/shared/query-keys';
import { DiscoverGrid } from '@/components/discover/discover-grid';
import { DiscoverFilters } from '@/components/discover/discover-filters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '@/hooks/shared/use-debounce';

const LIMIT = 20;

export function DiscoverClient() {
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search — reset ke page 1 saat search berubah
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.discover.list({
      search: debouncedSearch,
      fileType,
      page,
    }),
    queryFn: () =>
      discoverApi.getAll({
        search: debouncedSearch,
        fileType,
        page,
        limit: LIMIT,
      }),
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  // Reset ke page 1 saat filter berubah
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFileTypeChange = (value: string) => {
    setFileType(value);
    setPage(1);
  };

  return (
    <div className="container px-4 py-8 space-y-6">
      <DiscoverFilters
        search={search}
        fileType={fileType}
        onSearchChange={handleSearchChange}
        onFileTypeChange={handleFileTypeChange}
      />

      <DiscoverGrid products={products} isLoading={isLoading} />

      {/* Pagination — hanya tampil kalau lebih dari 1 halaman */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>

          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
            {meta ? (
              <span className="ml-1">
                ({meta.total} produk)
              </span>
            ) : null}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}