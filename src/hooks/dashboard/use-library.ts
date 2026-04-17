// src/hooks/dashboard/use-library.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { libraryApi } from '@/lib/api/library';
import { getErrorMessage } from '@/lib/api/client';
import { queryKeys } from '@/lib/shared/query-keys';

export function useLibrary() {
  return useQuery({
    queryKey: queryKeys.library.list(),
    queryFn: () => libraryApi.getLibrary(),
    staleTime: 1000 * 30,    // 30 detik — library harus fresh setelah beli
    gcTime: 1000 * 60 * 5,
  });
}

export function useDownloadUrl(purchaseId: string) {
  // Tidak pakai useQuery — generate fresh setiap klik, tidak di-cache
  const getDownloadUrl = async () => {
    try {
      const result = await libraryApi.getDownloadUrl(purchaseId);
      // Trigger download langsung
      window.location.href = result.downloadUrl;
      return result;
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  return { getDownloadUrl };
}