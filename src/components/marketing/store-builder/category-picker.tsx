'use client';

// ==========================================
// CATEGORY PICKER (BUILDER)
// File: src/components/marketing/store-builder/category-picker.tsx
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Step 1 of the builder. 6 specific category chips (Q5=C). Visitor
// taps one → state updates upstream → preview eyebrow swaps to the
// chosen category label.
//
// Layout: 3 cols mobile / 3 cols desktop. Six tiles, evenly distributed.
// Tile = icon + label, ~h-20, square-ish. Tap target ~80×60min.
//
// Why a button (not a real radio): radio semantics get awkward when
// the chip itself is the visible target. Manual aria-pressed gives us
// the right state announcement to AT users without semantic gymnastics.
// ==========================================

import { useTranslations } from 'next-intl';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { builderCategories } from '@/lib/data/marketing/store-builder';

interface CategoryPickerProps {
  /** Currently selected builder category id (e.g. 'restaurant'). null = none yet. */
  selectedId: string | null;
  /** Called with the picked category id */
  onSelect: (id: string) => void;
}

export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  const t = useTranslations('marketing.storeBuilder');

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {t('categoryStep.label')}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
        {builderCategories.map((cat) => (
          <CategoryChip
            key={cat.id}
            id={cat.id}
            icon={cat.icon}
            label={t(`categoryStep.categories.${cat.id}`)}
            selected={selectedId === cat.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ==========================================
// CHIP
// ==========================================

interface CategoryChipProps {
  id: string;
  icon: LucideIcon;
  label: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

function CategoryChip({
  id,
  icon: Icon,
  label,
  selected,
  onSelect,
}: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={cn(
        'group flex flex-col items-center justify-center gap-1.5 rounded-xl border bg-card px-2 py-3 text-center transition-all',
        'min-h-[76px] sm:min-h-[88px]',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <span
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors sm:h-8 sm:w-8',
          selected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
        )}
      >
        <Icon className="h-4 w-4 sm:h-4 sm:w-4" aria-hidden />
      </span>
      <span
        className={cn(
          'text-[11px] font-medium leading-tight sm:text-xs',
          selected ? 'text-foreground' : 'text-foreground/80',
        )}
      >
        {label}
      </span>
    </button>
  );
}
