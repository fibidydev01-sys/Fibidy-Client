'use client';

// discover/client.tsx
//
// Changes from previous version:
//   1. discoverApi.getAll() response is now { data, meta } — not an array
//   2. Added page state for pagination
//   3. Added Prev/Next navigation

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

  // Debounce search — reset to page 1 when search changes
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

  // Reset to page 1 when filter changes
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

      {/* Pagination — only shown when more than 1 page */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
            {meta ? (
              <span className="ml-1">
                ({meta.total} products)
              </span>
            ) : null}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}