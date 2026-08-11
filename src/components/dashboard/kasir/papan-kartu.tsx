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
//
// [UI/UX — Agu 2026]
//   • Dibangun dari <Card> lengkap (Header → Content → Footer), bukan div
//     `rounded-xl border p-3`. Aksi pindah ke CardFooter, jadi posisinya sama
//     di setiap kartu berapa pun panjang nama layanannya.
//   • <Progress> menunjukkan tahap keberapa kartu ini berada. Di papan dengan
//     empat kolom, batang itu tetap terbaca saat kartu dilihat sendirian di
//     tampilan ponsel yang cuma menampilkan satu kolom.
//   • Nama petugas jadi <Avatar> berinisial — lebih cepat dikenali daripada
//     teks kecil, dan tidak melebar mengikuti panjang nama.
//   • Tombol mundur yang cuma ikon kini punya <Tooltip>.
// ============================================================================

import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, Clock, Undo2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

function inisial(nama: string): string {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? '')
    .join('');
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

  const tahap = kartu.statusPengerjaan
    ? URUTAN.indexOf(kartu.statusPengerjaan) + 1
    : 0;

  return (
    <Card
      className={cn(
        'gap-3 py-3 shadow-sm transition-colors',
        terlambat && 'border-destructive/40 bg-destructive/[0.03]',
      )}
    >
      <CardHeader className="gap-1 px-3">
        <HoverCard openDelay={300}>
          <HoverCardTrigger asChild>
            <CardTitle className="truncate text-sm leading-tight">
              {kartu.namaProduk}
              {kartu.qty > 1 && (
                <span className="ml-1 font-normal text-muted-foreground">
                  ×{kartu.qty}
                </span>
              )}
            </CardTitle>
          </HoverCardTrigger>

          {/* Nama layanan sering lebih panjang dari lebar kolom Kanban.
              Di desktop, mengarahkan kursor menampilkannya utuh tanpa
              perlu membuka apa pun. */}
          <HoverCardContent className="w-64 text-sm" align="start">
            <p className="font-medium">{kartu.namaProduk}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {kartu.nomorOrder}
            </p>
            {kartu.picNama && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t('picLabel')}: {kartu.picNama}
              </p>
            )}
            {kartu.estimasiDurasi && (
              <p className="text-xs text-muted-foreground">
                {kartu.estimasiDurasi}
              </p>
            )}
          </HoverCardContent>
        </HoverCard>

        <p className="font-mono text-xs text-muted-foreground">
          {kartu.nomorOrder}
        </p>

        {belumDibayar && (
          <CardAction>
            <KasirBadge tone="warning">{t('belumDibayar')}</KasirBadge>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-2 px-3">
        {tahap > 0 && (
          <Progress
            value={(tahap / URUTAN.length) * 100}
            aria-label={t('progressAria', {
              sekarang: tahap,
              total: URUTAN.length,
            })}
            className="h-1"
          />
        )}

        {/* Baris keterangan — hanya yang ada isinya yang dicetak, supaya kartu
            tidak penuh label kosong. */}
        {(adaEstimasi || kartu.picNama || kartu.estimasiDurasi) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1.5">
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[9px] font-semibold">
                        {inisial(kartu.picNama)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-24 truncate">{kartu.picNama}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {t('picLabel')}: {kartu.picNama}
                </TooltipContent>
              </Tooltip>
            )}

            {kartu.estimasiDurasi && <span>{kartu.estimasiDurasi}</span>}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 px-3">
        {mundur && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground"
                onClick={() => onMundur(mundur)}
                disabled={pending}
                aria-label={t('mundurKe', { status: t(`status.${mundur}`) })}
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t('mundurKe', { status: t(`status.${mundur}`) })}
            </TooltipContent>
          </Tooltip>
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
                <Spinner className="size-3.5" />
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
                <Spinner className="size-3.5" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              )}
              {t(`aksi.${maju}`)}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
}
