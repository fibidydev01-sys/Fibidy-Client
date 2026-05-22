'use client';

// ============================================================================
// STEP INTENT — Register Wizard Step 1 (NEW Phase D)
// File: src/components/auth/register/step-intent.tsx
//
// Menggantikan StepWelcome. User memilih intent mereka sebelum apapun:
//   🛍️  Pembeli  → register BUYER, flow diperpendek
//   🏪  Penjual  → register SELLER, full wizard
//   🎓  Pelajar  → register SELLER + isEduMode = true
//
// Klik card = langsung select (tidak perlu tombol confirm terpisah).
// Selected state: border-primary + bg-primary/5 + check icon.
// ============================================================================

import { useTranslations } from 'next-intl';
import { ShoppingBag, Store, GraduationCap, Check } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import type { RegisterIntent } from '@/types/auth';

interface StepIntentProps {
  selected: RegisterIntent | null;
  onSelect: (intent: RegisterIntent) => void;
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

export function StepIntent({ selected, onSelect }: StepIntentProps) {
  const t = useTranslations('auth.register.intent');

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Heading */}
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight">{t('heading')}</h2>
        <p className="text-sm text-muted-foreground">{t('subheading')}</p>
      </div>

      {/* Intent cards */}
      <div className="space-y-3">
        {INTENT_OPTIONS.map(({ intent, icon: Icon, labelKey, iconColor, iconBg }) => {
          const isSelected = selected === intent;
          return (
            <button
              key={intent}
              type="button"
              onClick={() => onSelect(intent)}
              className={cn(
                'w-full text-left rounded-xl border-2 p-4 transition-all duration-150',
                'flex items-center gap-4',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-muted/40',
              )}
            >
              {/* Icon */}
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
                <Icon className={cn('h-5 w-5', iconColor)} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {t(`${labelKey}.label`)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t(`${labelKey}.description`)}
                </p>
              </div>

              {/* Check indicator */}
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'border-2 border-muted-foreground/30',
                )}
              >
                {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
