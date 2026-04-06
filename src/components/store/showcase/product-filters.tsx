'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { cn } from '@/lib/shared/utils';
import { productsUrl } from '@/lib/public/store-url';

// ==========================================
// PRODUCT FILTERS COMPONENT
// - Search bar only
// - No sort, no sheet, no category dropdown
// ==========================================

interface ProductFiltersProps {
  storeSlug: string;
  categories?: string[];
  className?: string;
}

export function ProductFilters({
  storeSlug,
  className,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearch === currentSearch) return;

    const params: Record<string, string> = {};
    const currentCategory = searchParams.get('category');
    if (debouncedSearch) params.search = debouncedSearch;
    if (currentCategory) params.category = currentCategory;

    router.push(productsUrl(storeSlug, params));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleClear = () => {
    setSearch('');
    const params: Record<string, string> = {};
    const currentCategory = searchParams.get('category');
    if (currentCategory) params.category = currentCategory;
    router.push(productsUrl(storeSlug, params));
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Cari produk..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-8"
      />
      {search && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}