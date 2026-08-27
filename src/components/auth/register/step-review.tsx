'use client';

// ============================================================================
// STEP REVIEW
// File: src/components/auth/register/step-review.tsx
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// - Tambah props fieldErrors + onClearFieldError
// - Checkbox agreement highlight merah saat belum dicentang
// - Merah hilang saat user centang checkbox
//
// [PHASE D — May 2026]
// [PHASE C — May 2026]
// ============================================================================

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getCategoryConfig,
  getCategoryLabelKey,
  getCategoryDescriptionKey,
} from '@/lib/constants/shared/categories';
import {
  Store,
  Mail,
  Lock,
  Phone,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/shared/utils';

// ============================================================================
// TYPES
// ============================================================================

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
  isAgreed: boolean;
  onAgreementChange: (agreed: boolean) => void;
  cameFromBuilder?: boolean;
  // [SPRINT 5]
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepReview({
  data,
  onEdit,
  isAgreed,
  onAgreementChange,
  cameFromBuilder = false,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepReviewProps) {
  const t = useTranslations('auth.register.review');
  const tRoot = useTranslations();

  const hasAgreementError = fieldErrors.has('agreement');

  const categoryConfig = data.category
    ? getCategoryConfig(data.category)
    : null;

  const categoryLabel = categoryConfig
    ? tRoot(getCategoryLabelKey(categoryConfig.key))
    : data.category ?? t('dash');

  const categoryDescription = categoryConfig
    ? tRoot(getCategoryDescriptionKey(categoryConfig.key))
    : null;

  const categoryStep = 2;
  const storeInfoStep = 3;
  const accountStep = 4;

  return (
    <div className="space-y-3 max-w-md">

      <ReviewCard label={t('businessType')} onEdit={() => onEdit(categoryStep)}>
        <p className="text-sm font-medium">{categoryLabel}</p>
        {categoryDescription && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {categoryDescription}
          </p>
        )}
      </ReviewCard>

      {/* Store Info */}
      <ReviewCard
        label={t('storeInfo')}
        icon={<Store className="h-3.5 w-3.5 text-muted-foreground" />}
        onEdit={() => onEdit(storeInfoStep)}
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
              <p className="text-xs text-muted-foreground">{t('description')}</p>
              <p className="text-sm">{data.description}</p>
            </div>
          )}
        </div>
      </ReviewCard>

      {/* Account */}
      <ReviewCard onEdit={() => onEdit(accountStep)}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">{data.email || t('dash')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-sm">••••••••</p>
          </div>
          {data.whatsapp && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-sm">+{data.whatsapp}</p>
            </div>
          )}
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
        <div
          className={cn(
            'flex items-start gap-3 rounded-lg p-3 transition-colors',
            hasAgreementError && 'bg-destructive/5 border border-destructive/30',
          )}
        >
          <Checkbox
            id="agreement"
            checked={isAgreed}
            onCheckedChange={(checked) => {
              onAgreementChange(checked === true);
              if (checked && hasAgreementError) {
                onClearFieldError?.('agreement');
              }
            }}
            className={cn(
              'mt-0.5 shrink-0',
              hasAgreementError && 'border-destructive',
            )}
          />
          <label
            htmlFor="agreement"
            className={cn(
              'text-xs leading-relaxed cursor-pointer select-none',
              hasAgreementError ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {t('agreementPrefix')}{' '}
            <a
              href="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {t('termsLink')}
            </a>{' '}
            {t('agreementAnd')}{' '}
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {t('privacyLink')}
            </a>
            .
          </label>
        </div>
        {hasAgreementError && (
          <p className="text-xs text-destructive font-medium pl-1">
            {t('agreementRequired')}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// REVIEW CARD
// ============================================================================

function ReviewCard({
  label,
  icon,
  onEdit,
  children,
}: {
  label?: string;
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
            {label && (
              <p className="text-caption-uppercase caption-uppercase text-muted-foreground">
                {label}
              </p>
            )}
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
