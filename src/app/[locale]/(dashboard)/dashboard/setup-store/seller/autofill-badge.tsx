'use client';

// ============================================================================
// AUTOFILL BADGE — penanda isian yang diisikan otomatis
// File: .../setup-store/seller/autofill-badge.tsx
//
// [SETUP-GATE Phase B — May 2026]
// Muncul di isian yang sudah diisikan sistem autofill. Hilang sendiri begitu
// penjual menyuntingnya (induk mengeluarkan field dari autofilledFields Set →
// prop `visible` jadi false).
//
// ── [BERSIH] KENAPA IKON, BUKAN PIL BERTEKS ────────────────────────────────
//
// Versi sebelumnya sebuah pil hijau bertuliskan "Terisi otomatis ketuk untuk
// edit" — 27 karakter, tinggi satu baris penuh, dan ia menumpuk DI ANTARA
// judul dan isiannya. Di Langkah 1 saja ada tiga; masing-masing mendorong
// isiannya turun dan memecah hubungan judul→isian yang seharusnya rapat.
//
// Kalimatnya juga menjelaskan sesuatu yang cuma perlu dibaca SEKALI. Setelah
// penjual paham artinya, ia tinggal derau yang dibaca ulang di setiap panel.
//
// Sekarang: satu ikon di pojok kanan atas panel, kalimatnya pindah ke
// tooltip. Terlihat kalau dicari, tidak menagih perhatian kalau tidak.
//
// ── KENAPA "i", BUKAN "!" ATAU "?" ─────────────────────────────────────────
//
// Versi pertama memakai tanda seru. Salah, dan sekarang diperbaiki:
//
//   !   satu garis + titik. Terbaca jelas, TAPI artinya "ada yang salah".
//       Dipasang hijau, ia malah bertentangan dengan dirinya sendiri:
//       bentuknya bilang masalah, warnanya bilang aman.
//   ?   terbaca jelas juga, tapi menaruh kebingungan pada PENJUAL —
//       seolah dia yang tidak paham. Ini juga ikon untuk pusat bantuan,
//       jadi ia menjanjikan halaman dokumentasi yang tidak ada.
//   i   ongkos bentuk yang sama persis dengan "!" (satu garis + titik),
//       jadi sama terbacanya, tapi artinya benar: "ini keterangan".
//
// Yang dikatakan lencana ini bukan peringatan dan bukan pertanyaan — ia
// keterangan: "isian ini kami isikan, silakan ubah". Jadi "i".
//
// ── UKURAN: KENAPA 18px DAN OPASITAS PENUH ─────────────────────────────────
// Versi pertama 14px pada opasitas 70%. Terlalu samar — ikon sekecil itu
// dengan warna yang sudah dilemahkan berhenti terbaca sebagai ikon dan
// mulai terbaca sebagai kotoran render. Sekarang 18px pada warna penuh,
// di dalam sasaran sentuh 32px.
//
// ── KENAPA <button>, BUKAN <span> ──────────────────────────────────────────
// Tooltip yang cuma muncul saat hover tidak pernah terbaca di ponsel — dan
// ponsel adalah perangkat utama penjual di sini. Sebagai tombol, ia bisa
// difokus keyboard DAN disentuh, dan Radix memunculkan tooltipnya di kedua
// jalur itu. `aria-label` membawa kalimat yang sama untuk screen reader,
// jadi maknanya tidak bergantung pada tooltip muncul atau tidak.
// ============================================================================

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AutofillBadgeProps {
  /**
   * Merender ikon saat true, mengembalikan null saat false.
   * Induk yang menentukan lewat keanggotaan autofilledFields Set.
   */
  visible: boolean;
}

export function AutofillBadge({ visible }: AutofillBadgeProps) {
  const t = useTranslations('dashboard.setupStore.seller');

  if (!visible) return null;

  const label = t('autofillBadge');

  return (
    // Provider dipasang lokal, mengikuti pola yang sudah dipakai
    // step-indicator.tsx — repo ini tidak punya provider global, dan
    // Radix mengizinkan provider bersarang.
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            // Emerald dipertahankan dari versi pil: warnanya sudah berarti
            // "ini kami isikan, dan itu baik". Amber atau merah akan
            // terbaca sebagai ada yang salah.
            className="-my-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:text-emerald-400"
          >
            <Info className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[180px] text-center text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
