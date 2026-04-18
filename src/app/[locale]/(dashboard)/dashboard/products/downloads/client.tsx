'use client';

import { useState } from 'react';
import { useDownloadHistory, useProductsFlat } from '@/hooks/dashboard/use-products';
import { DownloadHistoryTable } from '@/components/dashboard/product/download-history-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const LIMIT = 20;

export function DownloadHistoryClient() {
  const [productId, setProductId] = useState('');
  const [page, setPage] = useState(1);

  const { data: products } = useProductsFlat();
  const { data, isLoading } = useDownloadHistory({
    productId: productId || undefined,
    page,
    limit: LIMIT,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const handleProductChange = (value: string) => {
    setProductId(value === 'all' ? '' : value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Download History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {meta?.total ?? 0} total downloads
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={productId || 'all'} onValueChange={handleProductChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DownloadHistoryTable logs={logs} isLoading={isLoading} />

      {/* Pagination */}
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
            {meta ? <span className="ml-1">({meta.total} downloads)</span> : null}
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