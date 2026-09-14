'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme-provider';

// ==========================================
// MAIN PROVIDERS WRAPPER
// ==========================================
//
// [THEME HYDRATION FIX — Sep 2026]
// `enableSystem` DICABUT.
//
// Root cause: dengan `enableSystem={true}`, next-themes membaca
// `window.matchMedia('(prefers-color-scheme: dark)')` secara sinkron
// di render pass client pertama untuk resolve tema "system", lalu
// melakukan re-render internal begitu nilai itu didapat — SEBELUM
// commit hidrasi pertama selesai. Re-render tambahan ini menggeser
// urutan alokasi useId() React untuk SEMUA komponen yang di-mount
// setelah ThemeProvider dalam pohon (termasuk Radix primitives yang
// tidak berkaitan sama sekali dengan tema — CommandDialog, DropdownMenu,
// Tooltip, dst di Navbar).
//
// Gejala yang muncul: hydration mismatch pada id="radix-_R_..." di
// banyak komponen jauh dan tidak berkaitan, tapi masing-masing
// konsisten secara internal — signature khas dari useId() counter
// yang shift karena jumlah render-pass berbeda antara server & client,
// BUKAN karena isi/atribut yang benar-benar berbeda.
//
// Server TIDAK PERNAH bisa tahu preferensi sistem OS pengguna (tidak
// ada window di server), jadi jalur `enableSystem` murni jalur
// client-only yang menciptakan celah render-pass tambahan itu.
//
// Fix: matikan `enableSystem`. Aman untuk UX karena Navbar sudah
// punya toggle Sun/Moon manual (lihat navbar.tsx) — dark mode tetap
// bisa diaktifkan pengguna kapan saja, hanya saja kunjungan pertama
// tidak lagi otomatis mengikuti preferensi OS. Ini menghapus sumber
// race-nya di akar (provider), bukan menutupinya di komponen anak.
//
// Kalau auto-detect preferensi sistem harus dikembalikan di masa depan,
// lakukan lewat guard `mounted` di LEVEL PROVIDER INI (bukan di Navbar
// atau komponen anak manapun) supaya seluruh subtree konsisten menunggu
// resolve tema sebelum mount, alih-alih membiarkan racing terjadi
// lagi di tempat yang tidak kelihatan.
// ==========================================

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export { toast } from './toast-provider';