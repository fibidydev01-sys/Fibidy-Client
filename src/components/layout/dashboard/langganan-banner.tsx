'use client';

// ============================================================================
// SPANDUK MASA AKTIF LANGGANAN
// File: src/components/layout/dashboard/langganan-banner.tsx
//
// Satu-satunya pengingat yang kita punya. Tidak ada layanan email di produk
// ini, dan mengirim WhatsApp butuh API berbayar plus persetujuan template —
// jadi tidak ada kanal keluar sama sekali. Satu-satunya cara penjual tahu
// masa aktifnya hampir habis adalah membuka dasbor dan melihat baris ini.
//
// Batasnya jujur dan tidak bisa didesain hilang: PENJUAL YANG TIDAK MEMBUKA
// DASBOR TIDAK MELIHAT APA-APA. Masa tenggang tiga hari adalah bantalan
// untuk persis kasus itu — lihat BILLING_DAN_MODEL_BISNIS.md §3.1.
//
// ── KENAPA DI SHELL, BUKAN DI HALAMAN LANGGANAN ─────────────────────────
//
// Penjual yang sudah membuka halaman langganan tidak perlu diingatkan — dia
// sudah di sana. Yang perlu diingatkan justru yang sedang sibuk di Produk
// atau Kasir dan tidak punya alasan membuka halaman langganan sampai
// paketnya sudah telanjur habis.
//
// ── KENAPA TIDAK BISA DITUTUP ───────────────────────────────────────────
//
// Tombol tutup akan membuatnya hilang persis untuk orang yang paling butuh
// melihatnya: yang menutupnya di H-7 tidak akan melihat apa pun di H-1.
// Sebagai gantinya spanduk ini dibuat setipis mungkin dan baru menajam saat
// waktunya benar-benar dekat.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { cn } from '@/lib/shared/utils';

/**
 * Ambang peringatan, dari yang paling jauh ke yang paling dekat.
 *
 * Kenapa 7 / 3 / 1 dan bukan setiap hari: peringatan yang muncul tiap hari
 * berhenti dibaca sebelum hari yang penting tiba. Tiga tingkat memberi
 * bentuk yang bisa dikenali — pemberitahuan, dorongan, lalu mendesak.
 */
const AMBANG = [7, 3, 1] as const;

type Nada = 'info' | 'dorong' | 'mendesak' | 'tenggang';

const GAYA: Record<Nada, string> = {
  info: 'border-b border-border bg-muted/60 text-foreground',
  dorong:
    'border-b border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100',
  mendesak:
    'border-b border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-100',
  tenggang:
    'border-b border-destructive/40 bg-destructive/10 text-destructive dark:text-destructive-foreground',
};

const IKON: Record<Nada, typeof Clock> = {
  info: Clock,
  dorong: Clock,
  mendesak: AlertTriangle,
  tenggang: AlertTriangle,
};

export function LanggananBanner({ className }: { className?: string }) {
  const t = useTranslations('dashboard.subscription.spanduk');
  const { isLoading, fase, sisaHari, masaTenggangHari } = useSubscriptionPlan();

  // Placeholder query memakai tier FREE dan fase BELUM. Merender apa pun
  // sebelum jawaban server sampai berarti spanduk bisa berkedip untuk orang
  // yang langganannya baik-baik saja.
  if (isLoading) return null;

  // Tidak berlangganan, atau sudah lewat masa tenggang. Dua-duanya bukan
  // urusan spanduk ini: yang pertama tidak punya apa-apa untuk kedaluwarsa,
  // yang kedua sudah terlanjur dan ditangani halaman langganan.
  if (fase === 'BELUM' || fase === 'HABIS') return null;

  let nada: Nada;
  let pesan: string;

  if (fase === 'TENGGANG') {
    // Kalimatnya harus menyampaikan dua hal sekaligus, dan urutannya
    // penting: alatnya MASIH hidup (supaya penjual tidak panik dan mengira
    // datanya hilang), tapi ada tenggat (supaya dia tidak menunda).
    nada = 'tenggang';
    const sisaTenggang = masaTenggangHari + (sisaHari ?? 0);
    pesan = t('tenggang', { hari: Math.max(sisaTenggang, 1) });
  } else {
    const sisa = sisaHari ?? 0;
    const ambang = AMBANG.find((a) => sisa <= a);
    if (ambang === undefined) return null; // masih jauh — diam saja

    nada = ambang === 7 ? 'info' : ambang === 3 ? 'dorong' : 'mendesak';

    // `sisa` di cabang ini selalu >= 1: sisaHari dibulatkan KE ATAS, jadi
    // sisa waktu sekecil apa pun tetap terbaca "1 hari lagi". Begitu
    // periodEnd benar-benar lewat, fasenya sudah TENGGANG dan ditangani di
    // atas. Tidak ada celah di antaranya, jadi tidak ada kalimat "habis hari
    // ini" — ia tidak akan pernah terpakai.
    pesan = t('sisaHari', { hari: sisa });
  }

  const Ikon = IKON[nada];

  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-sm',
        GAYA[nada],
        className,
      )}
    >
      <span className="flex items-center gap-2">
        <Ikon className="h-4 w-4 shrink-0" />
        <span>{pesan}</span>
      </span>

      <Link
        href="/dashboard/subscription"
        className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4 hover:no-underline"
      >
        <CreditCard className="h-3.5 w-3.5" />
        {t('aksi')}
      </Link>
    </div>
  );
}
