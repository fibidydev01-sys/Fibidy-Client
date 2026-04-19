'use client';

// ==========================================
// DISCOVER CLIENT — List page
// File: src/app/[locale]/discover/client.tsx
//
// Changes from previous version:
//   1. discoverApi.getAll() response is now { data, meta } — not an array
//   2. Added page state for pagination
//   3. Added Prev/Next navigation
//
// [i18n FIX — 2026-04-19]
// Replaced hardcoded Previous/Next button labels and the pagination
// counter text with `useTranslations()` lookups. Keys used:
//   - common.actions.previous / next
//   - common.pagination.pageShort
//   - common.pagination.countSuffix
//
// The `countSuffix` key renders as "({count} products)" and expects a
// `count` interpolation — consistent with how the dashboard downloads
// page uses `downloadsSuffix` (same common.pagination namespace).
// ==========================================

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { discoverApi } from '@/lib/api/discover';
import { queryKeys } from '@/lib/shared/query-keys';
import { DiscoverGrid } from '@/components/discover/discover-grid';
import { DiscoverFilters } from '@/components/discover/discover-filters';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/shared/use-debounce';

const LIMIT = 20;

export function DiscoverClient() {
  const tActions = useTranslations('common.actions');
  const tPagination = useTranslations('common.pagination');

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
            {tActions('previous')}
          </Button>

          <span className="text-sm text-muted-foreground">
            {tPagination('pageShort', { current: page, total: totalPages })}
            {meta ? (
              <span className="ml-1">
                {tPagination('countSuffix', { count: meta.total })}
              </span>
            ) : null}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            {tActions('next')}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}