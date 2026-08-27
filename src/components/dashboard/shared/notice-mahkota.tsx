'use client';

// ============================================================================
// NOTICE MAHKOTA — satu bentuk untuk "ini ada di paket berbayar"
// File: src/components/dashboard/shared/notice-mahkota.tsx
//
// ── KENAPA MAHKOTA, BUKAN IKON LAIN ────────────────────────────────────────
//
// Sebelum ini ajakan upgrade dipakai bergantian dengan tiga ikon berbeda:
// Sparkles di form produk, Crown di spanduk kasir, AlertTriangle di modal.
// Tiga ikon untuk satu arti membuat penjual harus belajar tiga kali.
//
// Mahkota yang dipilih karena ia sudah jadi lambang paket berbayar di
// produk ini — dipakai di kartu tier dan di tombol upgrade. Sparkles berarti
// "otomatis/ajaib" (dipakai autofill di setup toko), dan memakainya di sini
// membuat dua hal yang tidak berhubungan tampak sama.
//
// ── KENAPA BISA DIKLIK ─────────────────────────────────────────────────────
//
// Ini bukan label, ini pintu. Penjual yang membaca "tersedia di paket
// berbayar" pertanyaan berikutnya selalu "lalu bagaimana caranya" — dan
// jawabannya harus ada di benda yang sama, bukan di halaman lain yang harus
// dia cari. Menekannya membuka modal upgrade.
// ============================================================================

import { Crown } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { bukaUpgrade } from '@/stores/upgrade-modal-store';

interface NoticeMahkotaProps {
  title: string;
  description?: string;
  /**
   * Penangan sendiri. Kosong berarti membuka modal upgrade global — itu
   * yang benar untuk hampir semua tempat. Dioper hanya kalau pemanggil
   * sudah punya modalnya sendiri dengan teks yang lebih spesifik.
   */
  onClick?: () => void;
  className?: string;
}

export function NoticeMahkota({
  title,
  description,
  onClick,
  className,
}: NoticeMahkotaProps) {
  return (
    <button
      type="button"
      onClick={onClick ?? (() => bukaUpgrade({ title, description }))}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-[var(--shape-panel)] border border-dashed border-amber-300/70 bg-amber-50/50 px-3 py-2.5 text-left transition-colors hover:bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/20 dark:hover:bg-amber-950/40',
        className,
      )}
    >
      <Crown
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        {description && (
          <span className="block text-xs text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

/**
 * Mahkota kecil untuk ditempel DI DALAM tombol aksi yang perlu paket.
 *
 * Bedanya dengan NoticeMahkota: ini bukan pintu, cuma penanda. Tombolnya
 * tetap tombol aslinya — tetap terlihat, tetap bisa ditekan — dan yang
 * membuka modal adalah penangan tombol itu sendiri lewat `useKasirLock`.
 *
 * Sengaja TIDAK mematikan tombolnya. Tombol mati tidak memberi tahu apa pun:
 * penjual menekannya, tidak terjadi apa-apa, dan dia tidak tahu kenapa.
 */
export function MahkotaKecil({ className }: { className?: string }) {
  return (
    <Crown
      className={cn('h-3.5 w-3.5 shrink-0 text-amber-500', className)}
      aria-hidden
    />
  );
}
