'use client';

// ============================================================================
// DISKON PICKER
// File: src/components/dashboard/kasir/diskon-picker.tsx
//
// Ditampilkan dengan TUKAR ISI di halaman keranjang, bukan modal di atas
// modal. Alur checkout sudah punya satu tumpukan navigasi (Kasir → Keranjang
// → Struk); menambah lapisan lagi membuat tombol kembali jadi ambigu.
//
// Kasir hanya MEMILIH dari preset yang sudah dibuat pemilik toko di
// Pengaturan — tidak ada pembuatan diskon dadakan di sini. Itu alasan
// halaman kelola preset tinggal di Pengaturan, bukan di alur transaksi.
// ============================================================================

import { useTranslations } from 'next-intl';
import { ArrowLeft, Check, Percent, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { useDiskonPresets } from '@/hooks/dashboard/use-kasir';
import type { DiskonPreset } from '@/types/kasir';

export function DiskonPicker({
  subtotal,
  terpilihId,
  onPilih,
  onBack,
}: {
  subtotal: number;
  terpilihId: string | null;
  onPilih: (preset: DiskonPreset | null) => void;
  onBack: () => void;
}) {
  const t = useTranslations('dashboard.kasir.diskon');
  const { data: presets, isLoading } = useDiskonPresets();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label={t('back')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Button>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Jalan keluar dari diskon apa pun — selalu di posisi pertama. */}
          <button
            type="button"
            onClick={() => onPilih(null)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
              terpilihId === null
                ? 'border-primary bg-primary/[0.06]'
                : 'hover:bg-muted/50',
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Percent className="h-4 w-4" aria-hidden />
            </span>
            <span className="flex-1 font-medium">{t('none')}</span>
            {terpilihId === null && (
              <Check className="h-4 w-4 text-primary" aria-hidden />
            )}
          </button>

          {(presets ?? []).map((preset) => {
            const aktif = preset.id === terpilihId;
            // Pratinjau dampak nominal sebelum dipilih — kasir bisa menyebut
            // angka hematnya ke pelanggan tanpa menghitung di kepala.
            const hemat = Math.round((subtotal * preset.persen) / 100);

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPilih(preset)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                  aktif ? 'border-primary bg-primary/[0.06]' : 'hover:bg-muted/50',
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {preset.persen}%
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{preset.nama}</span>
                  <span className="block text-sm text-muted-foreground">
                    {t('savePreview', { nominal: formatPriceIDR(hemat) })}
                  </span>
                </span>
                {aktif && <Check className="h-4 w-4 text-primary" aria-hidden />}
              </button>
            );
          })}

          {(presets ?? []).length === 0 && (
            <div className="rounded-xl border border-dashed px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">{t('emptyPresets')}</p>
              <Button asChild variant="outline" size="sm" className="mt-3 gap-2">
                <Link href="/dashboard/settings?section=diskon-preset">
                  <Settings2 className="h-3.5 w-3.5" aria-hidden />
                  {t('managePresets')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
