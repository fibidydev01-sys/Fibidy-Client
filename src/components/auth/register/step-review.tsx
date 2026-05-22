'use client';

// ============================================================================
// STEP REVIEW
// File: src/components/auth/register/step-review.tsx
//
// [PHASE D — May 2026]
// +intent prop: 'BUYER' | 'SELLER' | 'EDU' | null
//   - BUYER: skip store info section (no slug/name/category)
//            show only email + password (masked)
//   - EDU: show store info + account + edu note badge
//   - SELLER: default — show all sections
//
// [PHASE C — May 2026]
// Agreement state lifted to parent (register.tsx).
// cameFromBuilder prop for builder badge.
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
  GraduationCap,
} from 'lucide-react';
import type { RegisterIntent } from '@/types/auth';

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
  /**
   * [PHASE D] intent determines which sections are shown:
   *   BUYER  → only account section (no store info)
   *   SELLER → all sections
   *   EDU    → all sections + EDU badge
   */
  intent: RegisterIntent | null;
  onEdit: (step: number) => void;
  isAgreed: boolean;
  onAgreementChange: (agreed: boolean) => void;
  cameFromBuilder?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StepReview({
  data,
  intent,
  onEdit,
  isAgreed,
  onAgreementChange,
  cameFromBuilder = false,
}: StepReviewProps) {
  const t = useTranslations('auth.register.review');
  const tRoot = useTranslations();

  const isBuyer = intent === 'BUYER';
  const isEdu = intent === 'EDU';

  const categoryConfig = data.category
    ? getCategoryConfig(data.category)
    : null;

  const categoryLabel = categoryConfig
    ? tRoot(getCategoryLabelKey(categoryConfig.key))
    : data.category ?? t('dash');

  const categoryDescription = categoryConfig
    ? tRoot(getCategoryDescriptionKey(categoryConfig.key))
    : null;

  // Step numbers differ per intent
  // BUYER:        1=Intent, 2=Account, 3=Review
  // SELLER/EDU:   1=Intent, 2=Category, 3=StoreInfo, 4=Account, 5=Review
  const categoryStep = 2;
  const storeInfoStep = 3;
  const accountStep = isBuyer ? 2 : 4;

  return (
    <div className="space-y-3 max-w-md">

      {/* EDU badge — hanya tampil untuk EDU intent */}
      {isEdu && (
        <div className="flex items-center gap-2 px-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden />
            {t('eduNote')}
          </div>
        </div>
      )}

      {/* Business Type — hanya untuk SELLER + EDU */}
      {!isBuyer && (
        <ReviewCard label={t('businessType')} onEdit={() => onEdit(categoryStep)}>
          <p className="text-sm font-medium">{categoryLabel}</p>
          {categoryDescription && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {categoryDescription}
            </p>
          )}
        </ReviewCard>
      )}

      {/* Store Info — hanya untuk SELLER + EDU */}
      {!isBuyer && (
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
      )}

      {/* Account */}
      <ReviewCard
        label={t('account')}
        icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
        onEdit={() => onEdit(accountStep)}
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
          {/* WhatsApp hanya tampil untuk SELLER + EDU */}
          {!isBuyer && data.whatsapp && (
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
        <div className="flex items-start gap-3">
          <Checkbox
            id="agreement"
            checked={isAgreed}
            onCheckedChange={(checked) => onAgreementChange(checked === true)}
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

// ============================================================================
// REVIEW CARD
// ============================================================================

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
