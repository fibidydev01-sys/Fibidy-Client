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
//   • Ponsel  → satu kolom pada satu waktu, dipilih lewat tab berhitung.
//     Empat kolom Kanban berdampingan di layar 5 inci menghasilkan kartu
//     selebar 80px — terbaca sebagai kekacauan, bukan papan.
//   • Desktop → empat kolom sungguhan berdampingan, karena di sinilah nilai
//     Kanban muncul: melihat beban tiap tahap sekaligus.
//
// [UI/UX — Agu 2026] Lebar halaman ini sudah benar sejak awal dan jadi acuan
// halaman kasir lainnya. Yang diperbaiki isinya: state loading/error/kosong
// yang dulu digambar dengan div `border-dashed` buatan sendiri sekarang
// memakai Skeleton / Alert / Empty seperti empat halaman lain, kolomnya jadi
// Card dengan judul + penghitung, dan pemilih kolom di ponsel jadi Tabs.
// Tinggi kolom sengaja TIDAK dikunci — lihat catatan di dekat daftar kartu.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getErrorMessage } from '@/lib/api/client';
import { KasirPageShell } from '@/components/dashboard/kasir/kasir-page-shell';
import {
  KasirEmptySlot,
  KasirEmptyState,
  KasirErrorState,
} from '@/components/dashboard/kasir/kasir-state';
import { KasirBadge } from '@/components/dashboard/kasir/kasir-badges';
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

  if (isLoading) {
    return (
      <KasirPageShell title={t('title')} subtitle={t('subtitle')}>
        {/* Empat kolom skeleton — bentuk yang sama dengan papan sungguhan,
            jadi kolomnya tidak melompat saat data datang. */}
        <div className="grid gap-3 lg:grid-cols-4">
          {KOLOM_PAPAN.map((k) => (
            <div key={k} className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-32 w-full rounded-[var(--shape-panel)]" />
              <Skeleton className="h-32 w-full rounded-[var(--shape-panel)]" />
            </div>
          ))}
        </div>
      </KasirPageShell>
    );
  }

  if (isError || !data) {
    return (
      <KasirPageShell title={t('title')} subtitle={t('subtitle')}>
        <KasirErrorState
          title={t('errorTitle')}
          description={t('errorDescription')}
          retryLabel={t('retry')}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </KasirPageShell>
    );
  }

  const { kolom, ringkasan } = data;

  if (ringkasan.total === 0) {
    return (
      <KasirPageShell title={t('title')} subtitle={t('subtitle')}>
        <KasirEmptyState
          icon={<ClipboardList />}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        />
      </KasirPageShell>
    );
  }

  const kartuAktif = (k: PapanKartu) => isPending && variables?.itemId === k.id;

  const daftarKartu = (kolomKey: KolomPapan) =>
    kolom[kolomKey].length === 0 ? (
      <KasirEmptySlot label={t('kolomKosong')} />
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
    <KasirPageShell
      title={t('title')}
      subtitle={t('subtitle')}
      toolbar={
        // Ringkasan — dua angka yang butuh tindakan, bukan sekadar hitungan.
        // Ditampilkan hanya kalau nilainya bukan nol: baris "0 terlambat"
        // setiap hari melatih mata untuk mengabaikan baris itu.
        ringkasan.terlambat > 0 || ringkasan.belumDibayar > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {ringkasan.terlambat > 0 && (
              // Keterlambatan adalah peringatan, bukan label: ia dapat Alert,
              // bukan badge yang mudah terlewat di antara badge lain.
              <Alert variant="destructive" className="w-auto py-2">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                <AlertDescription>
                  {t('ringkasanTerlambat', { jumlah: ringkasan.terlambat })}
                </AlertDescription>
              </Alert>
            )}
            {ringkasan.belumDibayar > 0 && (
              <KasirBadge tone="warning" className="px-2.5 py-1.5 text-xs">
                {t('ringkasanBelumDibayar', { jumlah: ringkasan.belumDibayar })}
              </KasirBadge>
            )}
          </div>
        ) : undefined
      }
    >
      {/* ── Ponsel: tab pemilih kolom + satu daftar ───────────────────────── */}
      <Tabs
        value={kolomAktif}
        onValueChange={(v) => setKolomAktif(v as KolomPapan)}
        className="lg:hidden"
      >
        <TabsList aria-label={t('pilihKolom')} className="h-9 w-full">
          {KOLOM_PAPAN.map((k) => (
            <TabsTrigger key={k} value={k} className="gap-1.5 text-xs">
              {t(`status.${k}`)}
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[10px] tabular-nums"
              >
                {kolom[k].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {KOLOM_PAPAN.map((k) => (
          <TabsContent key={k} value={k} className="mt-3 space-y-2">
            {daftarKartu(k)}
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Desktop: empat kolom sungguhan ────────────────────────────────── */}
      <div className="hidden gap-3 lg:grid lg:grid-cols-4">
        {KOLOM_PAPAN.map((k) => (
          <Card key={k} className="min-w-0 gap-3 bg-muted/30 py-3">
            <CardHeader className="px-3">
              <CardTitle className="text-sm">{t(`status.${k}`)}</CardTitle>
              <CardAction>
                <Badge variant="secondary" className="tabular-nums">
                  {kolom[k].length}
                </Badge>
              </CardAction>
            </CardHeader>

            {/* Tinggi mengikuti isi, TIDAK dikunci.
                Sempat dicoba `h-[calc(100svh-22rem)]` supaya kolom padat tidak
                menarik kolom sebelahnya memanjang. Dibatalkan: angka 22rem itu
                tebakan atas tinggi header, dan pada papan yang hampir kosong
                — keadaan paling umum — hasilnya empat kotak tinggi yang
                isinya cuma satu kartu. Perilaku lama sudah benar. */}
            <div className="space-y-2 px-3 pb-1">{daftarKartu(k)}</div>
          </Card>
        ))}
      </div>
    </KasirPageShell>
  );
}
