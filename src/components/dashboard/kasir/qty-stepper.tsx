'use client';

// ============================================================================
// QTY STEPPER
// File: src/components/dashboard/kasir/qty-stepper.tsx
//
// Aturan dari guide kasir: pada qty = 1 tombol "−" BERUBAH jadi ikon tempat
// sampah. Ini sinyal visual bahwa tap berikutnya menghapus item, bukan
// menurunkan angka ke nol — kasir jadi tahu konsekuensinya sebelum menekan,
// tanpa perlu dialog konfirmasi yang memperlambat antrean.
// ============================================================================

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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

  const tombol = cn(
    'flex items-center justify-center rounded-md border transition-colors',
    'disabled:opacity-40 disabled:pointer-events-none',
    size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
  );

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={onDecrement}
        disabled={disabled}
        aria-label={akanMenghapus ? t('removeItem') : t('decrease')}
        className={cn(
          tombol,
          akanMenghapus
            ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
            : 'hover:bg-muted',
        )}
      >
        {akanMenghapus ? (
          <Trash2 className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        ) : (
          <Minus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        )}
      </button>

      <span
        className={cn(
          'text-center font-semibold tabular-nums',
          size === 'sm' ? 'w-6 text-sm' : 'w-8',
        )}
        aria-live="polite"
      >
        {qty}
      </span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={disabled}
        aria-label={t('increase')}
        className={cn(tombol, 'hover:bg-muted')}
      >
        <Plus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
    </div>
  );
}
