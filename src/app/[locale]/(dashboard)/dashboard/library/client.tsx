'use client';

import { useLibrary } from '@/hooks/dashboard/use-library';
import { LibraryGrid } from '@/components/library/library-grid';

export function LibraryClient() {
  const { data: purchases, isLoading } = useLibrary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {purchases?.length ?? 0} products owned
        </p>
      </div>
      <LibraryGrid purchases={purchases ?? []} isLoading={isLoading} />
    </div>
  );
}