'use client';

// ============================================================================
// QTY STEPPER
// File: src/components/dashboard/kasir/qty-stepper.tsx
//
// Aturan dari guide kasir: pada qty = 1 tombol "−" BERUBAH jadi ikon tempat
// sampah. Ini sinyal visual bahwa tap berikutnya menghapus item, bukan
// menurunkan angka ke nol — kasir jadi tahu konsekuensinya sebelum menekan,
// tanpa perlu dialog konfirmasi yang memperlambat antrean.
//
// [UI/UX — Agu 2026] Tombolnya kini <Button> variant outline, bukan <button>
// dengan kelas border sendiri. Ukurannya (size-9 / size-8) datang dari design
// system, jadi stepper di baris produk, di keranjang, dan di panel mana pun
// dijamin setinggi kontrol lain di sebelahnya.
// ============================================================================

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/shared/utils';

export function QtyStepper({
  qty,
  onIncrement,
  onDecrement,
  disabled,
  size = 'default',
  className,
}: {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
  size?: 'default' | 'sm';
  className?: string;
}) {
  const t = useTranslations('dashboard.kasir.cart');
  const akanMenghapus = qty <= 1;
  const kecil = size === 'sm';
  const ikon = kecil ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const labelKurang = akanMenghapus ? t('removeItem') : t('decrease');

  return (
    <div className={cn('flex shrink-0 items-center gap-1.5', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={kecil ? 'icon-sm' : 'icon'}
            onClick={onDecrement}
            disabled={disabled}
            aria-label={labelKurang}
            className={cn(
              akanMenghapus &&
                'border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive',
            )}
          >
            {akanMenghapus ? (
              <Trash2 className={ikon} aria-hidden />
            ) : (
              <Minus className={ikon} aria-hidden />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{labelKurang}</TooltipContent>
      </Tooltip>

      <span
        className={cn(
          'text-center font-semibold tabular-nums',
          kecil ? 'w-6 text-sm' : 'w-8',
        )}
        aria-live="polite"
      >
        {qty}
      </span>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size={kecil ? 'icon-sm' : 'icon'}
            onClick={onIncrement}
            disabled={disabled}
            aria-label={t('increase')}
          >
            <Plus className={ikon} aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('increase')}</TooltipContent>
      </Tooltip>
    </div>
  );
}
