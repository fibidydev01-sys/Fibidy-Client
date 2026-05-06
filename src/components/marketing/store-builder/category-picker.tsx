'use client';

// ==========================================
// CATEGORY PICKER (BUILDER)
// File: src/components/marketing/store-builder/category-picker.tsx
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Step 1 of the builder. Visitor taps one chip → state updates
// upstream → preview refreshes to reflect the choice.
//
// Phase 5 (Magic UI polish, May 2026 — CEO unlock):
//   - 6 specific chips (no "Other" escape hatch).
//   - 3 cols × 2 rows on all screen widths.
//   - Larger min-h tap targets, softer transitions.
//
// Phase 5 polish v3 (May 2026 — NextStep onboarding):
//   - Root container now carries `id="builder-category-picker"`.
//     This is the selector NextStep.js targets when firing the
//     'category-gate' tour from SubdomainInput's toast action.
//     The picker gets a spotlight ring + tooltip pointing at it
//     when the tour activates.
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
    <div id="builder-category-picker">
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
        'group flex flex-col items-center justify-center gap-2 rounded-xl border bg-card px-2 py-3.5 text-center transition-all duration-200',
        'min-h-[80px] sm:min-h-[92px]',
        'hover:-translate-y-0.5',
        selected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
          : 'border-border hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm',
      )}
    >
      <span
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors sm:h-8 sm:w-8',
          selected
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
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
