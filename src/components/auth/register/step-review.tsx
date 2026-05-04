'use client';

// ==========================================
// STEP REVIEW
// File: src/components/auth/register/step-review.tsx
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// 🔵 Agreement state LIFTED to parent (register.tsx).
//   Was: local `useState` here. Now: `isAgreed` + `onAgreementChange`
//   come in as props. Parent controls because it needs to read the
//   value to enable submit AND to pre-check from useRegisterWizard's
//   cameFromBuilder flag (R1 = pre-checked + visible).
//
// 🔵 NEW prop `cameFromBuilder`
//   When true, renders a small badge next to the checkbox: "✅ Disetujui
//   di halaman builder" — gives the user clear feedback their earlier
//   acceptance carried over. They can still untick if they change their
//   mind, in which case the badge stays as historical context (the
//   acceptance still happened, even if they're walking it back now).
//
// All other behavior unchanged from Phase 2.
// ==========================================

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getCategoryConfig } from '@/lib/constants/shared/categories';
import { Store, Mail, Lock, Phone, Edit2, CheckCircle2 } from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

interface StepReviewProps {
  data: {
    category?: string;
    name?: string;
    slug?: string;
    description?: string;
    email?: string;
    password?: string;
    whatsapp?: string;
  };
  onEdit: (step: number) => void;
  /** Controlled — agreement state lifted to parent (register.tsx) */
  isAgreed: boolean;
  /** Controlled — agreement state setter lifted to parent (register.tsx) */
  onAgreementChange: (agreed: boolean) => void;
  /** True when user arrived from the marketing Interactive Store Builder */
  cameFromBuilder?: boolean;
}

// ==========================================
// COMPONENT
// ==========================================

export function StepReview({
  data,
  onEdit,
  isAgreed,
  onAgreementChange,
  cameFromBuilder = false,
}: StepReviewProps) {
  const t = useTranslations('auth.register.review');
  const categoryConfig = data.category
    ? getCategoryConfig(data.category)
    : null;

  return (
    <div className="space-y-3 max-w-md">
      {/* Business Type */}
      <ReviewCard label={t('businessType')} onEdit={() => onEdit(2)}>
        <p className="text-sm font-medium">
          {categoryConfig?.label ?? data.category ?? t('dash')}
        </p>
        {categoryConfig?.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {categoryConfig.description}
          </p>
        )}
      </ReviewCard>

      {/* Store Info */}
      <ReviewCard
        label={t('storeInfo')}
        icon={<Store className="h-3.5 w-3.5 text-muted-foreground" />}
        onEdit={() => onEdit(3)}
      >
        <div className="space-y-1.5">
          <div>
            <p className="text-xs text-muted-foreground">{t('storeName')}</p>
            <p className="text-sm font-medium">{data.name || t('dash')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('storeUrl')}</p>
            <p className="text-sm font-medium text-primary">
              {t('storeUrlSuffix', { slug: data.slug || t('dash') })}
            </p>
          </div>
          {data.description && (
            <div>
              <p className="text-xs text-muted-foreground">
                {t('description')}
              </p>
              <p className="text-sm">{data.description}</p>
            </div>
          )}
        </div>
      </ReviewCard>

      {/* Account */}
      <ReviewCard
        label={t('account')}
        icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
        onEdit={() => onEdit(4)}
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">{data.email || t('dash')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">••••••••</p>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">+{data.whatsapp || t('dash')}</p>
          </div>
        </div>
      </ReviewCard>

      {/* Agreement */}
      <div className="space-y-2 pt-2">
        {cameFromBuilder && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" aria-hidden />
            {t('agreementBuilderBadge')}
          </div>
        )}
        <div className="flex items-start gap-3">
          <Checkbox
            id="agreement"
            checked={isAgreed}
            onCheckedChange={(checked) =>
              onAgreementChange(checked === true)
            }
            className="mt-0.5 shrink-0"
          />
          <label
            htmlFor="agreement"
            className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
          >
            {t('agreementPrefix')}{' '}
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {t('termsLink')}
            </a>{' '}
            {t('agreementAnd')}{' '}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {t('privacyLink')}
            </a>
            .
          </label>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// REVIEW CARD
// ==========================================

function ReviewCard({
  label,
  icon,
  onEdit,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-1.5">
            {icon}
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              {label}
            </p>
          </div>
          {children}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="shrink-0 h-7 w-7 p-0"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
