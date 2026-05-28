'use client';

// ============================================================================
// STEP INTENT
// File: src/components/auth/register/step-intent.tsx
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// - fieldErrors prop: highlight container saat intent tidak dipilih
// - Ring merah di sekeliling radiogroup container
// - Merah hilang saat user pilih salah satu role
// ============================================================================

import { useTranslations } from 'next-intl';
import { ShoppingBag, Store, GraduationCap, Check } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import type { RegisterIntent } from '@/types/auth';

interface StepIntentProps {
  selected: RegisterIntent | null;
  onSelect: (intent: RegisterIntent) => void;
  // [SPRINT 5]
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

interface IntentOption {
  intent: RegisterIntent;
  icon: React.ElementType;
  labelKey: 'buyer' | 'seller' | 'edu';
  iconColor: string;
  iconBg: string;
}

const INTENT_OPTIONS: IntentOption[] = [
  {
    intent: 'BUYER',
    icon: ShoppingBag,
    labelKey: 'buyer',
    iconColor: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-950/40',
  },
  {
    intent: 'SELLER',
    icon: Store,
    labelKey: 'seller',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40',
  },
  {
    intent: 'EDU',
    icon: GraduationCap,
    labelKey: 'edu',
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-950/40',
  },
];

export function StepIntent({
  selected,
  onSelect,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepIntentProps) {
  const t = useTranslations('auth.register.intent');

  const hasIntentError = fieldErrors.has('intent');

  return (
    <div className="space-y-3">
      {/* [SPRINT 5] Ring merah saat belum pilih role */}
      <div
        role="radiogroup"
        aria-label={t('groupLabel')}
        className={cn(
          'space-y-3 rounded-xl transition-all',
          hasIntentError && 'outline outline-2 outline-destructive outline-offset-2',
        )}
      >
        {INTENT_OPTIONS.map(({ intent, icon: Icon, labelKey, iconColor, iconBg }) => {
          const isSelected = selected === intent;
          return (
            <button
              key={intent}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                onSelect(intent);
                if (hasIntentError) onClearFieldError?.('intent');
              }}
              className={cn(
                'w-full text-left rounded-xl border-2 p-4 transition-all duration-150',
                'flex items-center gap-4',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-muted/40',
              )}
            >
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
                <Icon className={cn('h-5 w-5', iconColor)} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {t(`${labelKey}.label`)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t(`${labelKey}.description`)}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'border-2 border-muted-foreground/30',
                )}
                aria-hidden
              >
                {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Error text */}
      {hasIntentError && (
        <p className="text-xs text-destructive font-medium px-1">
          {t('groupLabel')}
        </p>
      )}
    </div>
  );
}
