'use client';

// ============================================================================
// KASIR FILTER GROUP
// File: src/components/dashboard/kasir/kasir-filter-group.tsx
//
// Chip filter horizontal: kategori (Jual), status (Riwayat), kondisi stok
// (Stok). Ketiganya dulu tombol buatan tangan dengan kelas yang mirip tapi
// tidak sama — border-radius `rounded-full` di dua tempat, `rounded-lg` di
// tempat ketiga, dan hanya salah satunya yang menyetel `aria-pressed`.
//
// ToggleGroup mengurus roving focus dan state terpilih; ScrollArea mengurus
// baris yang lebih panjang dari layar. `overflow-x-auto` mentah menampilkan
// scrollbar tebal di Windows dan tidak sama sekali di macOS — ScrollArea
// membuat keduanya identik.
//
// Nilai "semua" ikut jadi item, bukan tombol terpisah: dengan begitu pindah
// dari "Semua" ke kategori mana pun adalah satu gerakan panah kiri/kanan.
// ============================================================================

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';

export interface KasirFilterOption {
  value: string;
  label: string;
  /** Angka kecil di kanan label — mis. jumlah kartu per kolom papan. */
  count?: number;
  icon?: React.ReactNode;
}

export function KasirFilterGroup({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'sm',
  className,
}: {
  options: KasirFilterOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  size?: 'sm' | 'default';
  className?: string;
}) {
  if (options.length <= 1) return null;

  return (
    <ScrollArea className={cn('w-full', className)}>
      <ToggleGroup
        type="single"
        value={value}
        // Radix mengirim '' saat item aktif ditekan lagi. Filter selalu punya
        // satu nilai aktif, jadi penekanan itu diabaikan — bukan dibiarkan
        // mengosongkan filter dan menampilkan daftar yang seolah tidak terfilter.
        onValueChange={(next) => next && onChange(next)}
        variant="outline"
        size={size}
        spacing={2}
        aria-label={ariaLabel}
        className="w-max"
      >
        {options.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="gap-1.5 rounded-full data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            {option.icon}
            {option.label}
            {option.count != null && (
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[11px] tabular-nums"
              >
                {option.count}
              </Badge>
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ScrollBar orientation="horizontal" className="h-1.5" />
    </ScrollArea>
  );
}
