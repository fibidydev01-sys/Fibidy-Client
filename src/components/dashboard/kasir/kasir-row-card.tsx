'use client';

// ============================================================================
// KASIR ROW CARD
// File: src/components/dashboard/kasir/kasir-row-card.tsx
//
// Satu bentuk baris untuk seluruh modul kasir: produk, layanan, transaksi,
// stok, preset diskon, item keranjang. Sebelumnya pola `rounded-xl border
// px-3 py-3` diketik ulang di 11 file — 22 kemunculan — dan sudah mulai
// berbeda satu sama lain (ada yang `hover:bg-muted/50`, ada yang
// `hover:border-primary/40`, ada yang `active:scale-[0.995]`).
//
// Dibangun di atas <Card>, bukan div bergaya sendiri, supaya radius, border,
// dan warna permukaannya ikut design system.
//
// Interaksi dipisah jadi dua komponen karena barisnya punya dua keadaan:
//   • KasirRowButton  → SELURUH baris adalah target tap (belum di keranjang)
//   • KasirRowContent → baris pasif yang isinya punya kontrol sendiri
//     (stepper qty). Tanpa pemisahan ini, tap di area kosong baris akan
//     menambah qty tanpa disadari kasir.
//
// Cincin fokus ditaruh di Card lewat focus-within: yang menerima fokus adalah
// tombol di dalamnya, tapi yang harus terlihat menyala adalah kartunya.
// ============================================================================

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';

export function KasirRowCard({
  className,
  selected,
  tone,
  ...props
}: React.ComponentProps<typeof Card> & {
  /** Menyala sebagai "sudah dipilih" — mis. produk yang ada di keranjang. */
  selected?: boolean;
  /** Penanda kondisi baris. 'danger' dipakai kartu papan yang terlambat. */
  tone?: 'default' | 'danger';
}) {
  return (
    <Card
      data-selected={selected ? 'true' : undefined}
      data-tone={tone}
      className={cn(
        'gap-0 overflow-hidden py-0 shadow-none transition-colors',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        'data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/5',
        'data-[tone=danger]:border-destructive/40 data-[tone=danger]:bg-destructive/[0.03]',
        className,
      )}
      {...props}
    />
  );
}

/** Isi baris yang TIDAK bisa ditap seluruhnya. */
export function KasirRowContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      className={cn('flex items-center gap-3 px-3 py-3', className)}
      {...props}
    />
  );
}

/**
 * Seluruh baris sebagai satu tombol. Tanpa `active:scale` — transform pada
 * elemen selebar layar terbaca sebagai getaran saat kasir menekan cepat.
 */
export function KasirRowButton({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-3 px-3 py-3 text-left outline-none transition-colors',
        'hover:bg-accent/40 active:bg-accent/60',
        className,
      )}
      {...props}
    />
  );
}
