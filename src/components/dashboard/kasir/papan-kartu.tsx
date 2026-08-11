'use client';

// ============================================================================
// KARTU PAPAN KERJA
// File: src/components/dashboard/kasir/papan-kartu.tsx
//
// Satu kartu = satu ITEM pesanan (G3), bukan satu transaksi. Struk berisi
// cuci mobil + ganti oli menghasilkan dua kartu, karena progresnya memang
// berbeda. Nomor order dicetak di setiap kartu supaya keduanya tetap bisa
// dirujuk balik ke satu pesanan.
//
// Kartu digeser lewat SATU tombol yang menyebutkan langkah berikutnya, bukan
// drag-and-drop. Alasannya lapangan, bukan selera: papan ini dipakai sambil
// berdiri, sering dengan tangan basah atau berminyak, di layar 5 inci. Drag
// pada layar sekecil itu salah sasaran jauh lebih sering daripada tap, dan
// setiap kesalahannya memindahkan pekerjaan orang lain.
// ============================================================================

import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Clock, Loader2, Undo2, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { formatJarakWaktu } from '@/lib/shared/format';
import { KasirBadge } from './kasir-badges';
import type { PapanKartu as Kartu, StatusJasa } from '@/types/kasir';

/// Urutan maju papan. DIAMBIL tidak ada di sini — ia hanya dicapai lewat
/// tombol khusus di kolom Siap Ambil, dan lewat pelunasan (G4).
const URUTAN: StatusJasa[] = ['ANTRI', 'PROSES', 'SELESAI', 'SIAP_AMBIL'];

export function statusBerikutnya(status: StatusJasa | null): StatusJasa | null {
  if (!status) return null;
  const i = URUTAN.indexOf(status);
  if (i === -1 || i === URUTAN.length - 1) return null;
  return URUTAN[i + 1];
}

export function statusSebelumnya(status: StatusJasa | null): StatusJasa | null {
  if (!status) return null;
  const i = URUTAN.indexOf(status);
  if (i <= 0) return null;
  return URUTAN[i - 1];
}

export function PapanKartuItem({
  kartu,
  pending,
  onMaju,
  onMundur,
  onSerahkan,
}: {
  kartu: Kartu;
  pending: boolean;
  onMaju: (status: StatusJasa) => void;
  onMundur: (status: StatusJasa) => void;
  /** Hanya tersedia di kolom Siap Ambil, dan hanya kalau sudah dibayar. */
  onSerahkan: () => void;
}) {
  const t = useTranslations('dashboard.kasir.papan');
  // Locale next-intl ('id'/'en') dipakai apa adanya oleh Intl — keduanya tag
  // BCP 47 yang sah.
  const locale = useLocale();

  const maju = statusBerikutnya(kartu.statusPengerjaan);
  const mundur = statusSebelumnya(kartu.statusPengerjaan);
  const belumDibayar = kartu.statusPembayaran === 'BELUM_BAYAR';
  const siapAmbil = kartu.statusPengerjaan === 'SIAP_AMBIL';

  // Keterlambatan datang dari server, bukan dihitung di sini. Selain menjaga
  // komponen ini tetap murni, itu membuat penanda merah pada kartu dan angka
  // "N lewat estimasi" di ringkasan mustahil berselisih.
  const adaEstimasi = kartu.selisihMenit != null;
  const terlambat = kartu.terlambat;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-3 shadow-sm transition-colors',
        terlambat && 'border-destructive/40 bg-destructive/[0.03]',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium leading-tight">
            {kartu.namaProduk}
            {kartu.qty > 1 && (
              <span className="ml-1 text-muted-foreground">×{kartu.qty}</span>
            )}
          </p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            {kartu.nomorOrder}
          </p>
        </div>

        {belumDibayar && (
          <KasirBadge tone="warning" className="shrink-0">
            {t('belumDibayar')}
          </KasirBadge>
        )}
      </div>

      {/* Baris keterangan — hanya yang ada isinya yang dicetak, supaya kartu
          tidak penuh label kosong. */}
      {(adaEstimasi || kartu.picNama || kartu.estimasiDurasi) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {adaEstimasi && (
            <span
              className={cn(
                'inline-flex items-center gap-1',
                terlambat && 'font-medium text-destructive',
              )}
            >
              <Clock className="h-3 w-3" aria-hidden />
              {terlambat
                ? t('terlambatSejak', {
                    durasi: formatJarakWaktu(kartu.selisihMenit, locale),
                  })
                : t('estimasiDalam', {
                    durasi: formatJarakWaktu(kartu.selisihMenit, locale),
                  })}
            </span>
          )}
          {kartu.picNama && (
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-3 w-3" aria-hidden />
              {kartu.picNama}
            </span>
          )}
          {kartu.estimasiDurasi && <span>{kartu.estimasiDurasi}</span>}
        </div>
      )}

      {/* Aksi */}
      <div className="mt-3 flex items-center gap-2">
        {mundur && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground"
            onClick={() => onMundur(mundur)}
            disabled={pending}
            aria-label={t('mundurKe', { status: t(`status.${mundur}`) })}
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        )}

        {siapAmbil ? (
          // Langkah terakhir. Kalau pesanannya belum dibayar, tombol ini
          // tidak ditawarkan sama sekali — bukan ditawarkan lalu ditolak
          // server. Yang muncul justru penunjuk ke jalur yang benar.
          belumDibayar ? (
            <p className="flex-1 text-xs leading-snug text-muted-foreground">
              {t('perluDibayarDulu')}
            </p>
          ) : (
            <Button
              size="sm"
              className="flex-1 gap-1.5"
              onClick={onSerahkan}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              )}
              {t('serahkan')}
            </Button>
          )
        ) : (
          maju && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => onMaju(maju)}
              disabled={pending}
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              )}
              {t(`aksi.${maju}`)}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
