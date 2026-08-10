'use client';

// ============================================================================
// KASIR PAGE HEADER
// File: src/components/dashboard/kasir/kasir-page-header.tsx
//
// Judul + subjudul + sub-nav, sama di keempat halaman kasir. Dijadikan satu
// komponen di level modul (bukan diketik ulang di tiap halaman) supaya
// posisi tab tidak bergeser saat berpindah layar — pergeseran satu piksel
// pada elemen yang selalu ada terbaca sebagai halaman yang "melompat".
// ============================================================================

import { KasirTabs } from './kasir-tabs';

export function KasirPageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <KasirTabs />
    </div>
  );
}
