'use client';

// ============================================================================
// PAPAN KERJA
// File: src/app/[locale]/(dashboard)/dashboard/kasir/papan/client.tsx
//
// Layar kedua dari dua tugas yang sengaja dipisah: tab Jual dipakai saat
// pelanggan berdiri di depan meja, papan ini dipakai sepanjang hari tanpa
// pelanggan. Menggabungkannya berarti kasir yang sedang melayani antrean
// harus melihat kartu Kanban yang tidak ia butuhkan detik itu.
//
// Bentuk layarnya berbeda per lebar, bukan satu tata letak yang dipaksakan:
//   • Ponsel  → satu kolom pada satu waktu, dipilih lewat chip berhitung.
//     Empat kolom Kanban berdampingan di layar 5 inci menghasilkan kartu
//     selebar 80px — terbaca sebagai kekacauan, bukan papan.
//   • Desktop → empat kolom sungguhan berdampingan, karena di sinilah nilai
//     Kanban muncul: melihat beban tiap tahap sekaligus.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, ClipboardList, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { getErrorMessage } from '@/lib/api/client';
import { KasirPageHeader } from '@/components/dashboard/kasir/kasir-page-header';
import { PapanKartuItem } from '@/components/dashboard/kasir/papan-kartu';
import { usePapanKerja, useUpdateStatusItem } from '@/hooks/dashboard/use-kasir';
import { KOLOM_PAPAN } from '@/types/kasir';
import type { KolomPapan, PapanKartu, StatusJasa } from '@/types/kasir';

export function PapanClient() {
  const t = useTranslations('dashboard.kasir.papan');

  const { data, isLoading, isError, refetch, isFetching } = usePapanKerja();
  const { mutate: geser, isPending, variables } = useUpdateStatusItem();

  // Kolom aktif hanya berlaku di tampilan ponsel. Di desktop keempatnya
  // tampil bersamaan dan state ini diabaikan.
  const [kolomAktif, setKolomAktif] = useState<KolomPapan>('ANTRI');

  const pindah = (kartu: PapanKartu, status: StatusJasa) => {
    geser(
      { transaksiId: kartu.transaksiId, itemId: kartu.id, status },
      { onError: (err) => toast.error(getErrorMessage(err)) },
    );
  };

  const header = (
    <KasirPageHeader title={t('title')} subtitle={t('subtitle')} />
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {header}
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-xl border border-dashed py-12 text-center">
          <p className="font-medium">{t('errorTitle')}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {t('errorDescription')}
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
              aria-hidden
            />
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  const { kolom, ringkasan } = data;

  if (ringkasan.total === 0) {
    return (
      <div className="space-y-4">
        {header}
        <div className="rounded-xl border border-dashed py-16 text-center">
          <ClipboardList
            className="mx-auto h-8 w-8 text-muted-foreground/60"
            aria-hidden
          />
          <p className="mt-3 font-medium">{t('emptyTitle')}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {t('emptyDescription')}
          </p>
        </div>
      </div>
    );
  }

  const kartuAktif = (k: PapanKartu) => isPending && variables?.itemId === k.id;

  const daftarKartu = (kolomKey: KolomPapan) =>
    kolom[kolomKey].length === 0 ? (
      <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
        {t('kolomKosong')}
      </p>
    ) : (
      kolom[kolomKey].map((kartu) => (
        <PapanKartuItem
          key={kartu.id}
          kartu={kartu}
          pending={kartuAktif(kartu)}
          onMaju={(status) => pindah(kartu, status)}
          onMundur={(status) => pindah(kartu, status)}
          onSerahkan={() => pindah(kartu, 'DIAMBIL')}
        />
      ))
    );

  return (
    <div className="space-y-4">
      {header}

      {/* Ringkasan — dua angka yang butuh tindakan, bukan sekadar hitungan.
          Ditampilkan hanya kalau nilainya bukan nol: baris "0 terlambat"
          setiap hari melatih mata untuk mengabaikan baris itu. */}
      {(ringkasan.terlambat > 0 || ringkasan.belumDibayar > 0) && (
        <div className="flex flex-wrap gap-2">
          {ringkasan.terlambat > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
              {t('ringkasanTerlambat', { jumlah: ringkasan.terlambat })}
            </span>
          )}
          {ringkasan.belumDibayar > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              {t('ringkasanBelumDibayar', { jumlah: ringkasan.belumDibayar })}
            </span>
          )}
        </div>
      )}

      {/* ── Ponsel: chip pemilih kolom + satu daftar ─────────────────────── */}
      <div className="lg:hidden">
        <div
          className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
          role="tablist"
          aria-label={t('pilihKolom')}
        >
          {KOLOM_PAPAN.map((k) => {
            const aktif = kolomAktif === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={aktif}
                onClick={() => setKolomAktif(k)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  aktif
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {t(`status.${k}`)}
                <span
                  className={cn(
                    'rounded-full px-1.5 text-xs tabular-nums',
                    aktif ? 'bg-primary/15' : 'bg-muted',
                  )}
                >
                  {kolom[k].length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 space-y-2">{daftarKartu(kolomAktif)}</div>
      </div>

      {/* ── Desktop: empat kolom sungguhan ───────────────────────────────── */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-4">
        {KOLOM_PAPAN.map((k) => (
          <section key={k} className="min-w-0">
            <h2 className="mb-2 flex items-center justify-between gap-2 px-1 text-sm font-semibold">
              {t(`status.${k}`)}
              <span className="rounded-full bg-muted px-1.5 text-xs font-medium tabular-nums text-muted-foreground">
                {kolom[k].length}
              </span>
            </h2>
            <div className="space-y-2">{daftarKartu(k)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
