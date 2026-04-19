'use client';

// ==========================================
// SETUP STORE CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/setup-store/client.tsx
//
// Wizard upgrade BUYER → SELLER.
// Reuse step components from register wizard:
//   ✅ StepCategory — pick business type
//   ✅ StepStoreInfo — store name, proper slug, description
//   ✅ StepReview — confirmation + agree ToS
//   ❌ StepAccount — skip (already has email+password)
//   ❌ StepWelcome — skip (go straight to wizard)
//
// Flow:
//   1. Step 1: Pick category
//   2. Step 2: Store name + slug + description
//   3. Step 3: WhatsApp number (separate field, simple input)
//   4. Step 4: Review + submit
//   5. PATCH /tenants/upgrade-to-seller
//   6. Redirect /dashboard/products
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations()` calls.
// JSON keys under:
//   - `dashboard.setupStore.*` for wizard copy, steps, review, CTAs, errors
//   - `common.labels.dash` for "—" fallback
//
// The STEPS array is built with `useMemo` (same pattern as register.tsx)
// so the titles/descriptions translate at render time and the reference
// stays stable between renders.
// ==========================================

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { StepCategory } from '@/components/auth/register/step-category';
import { StepStoreInfo } from '@/components/auth/register/step-store-info';
import { StepIndicator } from '@/components/dashboard/shared/step-wizard';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { useUpgradeToSeller } from '@/hooks/user/use-upgrade-to-seller';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Store, Edit2 } from 'lucide-react';

export function SetupStoreClient() {
  const t = useTranslations('dashboard.setupStore');
  const tCommon = useTranslations('common.labels');

  const tenant = useAuthStore((s) => s.tenant);
  const router = useRouter();
  const { upgrade, isLoading, error } = useUpgradeToSeller();

  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('62');
  const [isAgreed, setIsAgreed] = useState(false);

  // i18n-aware steps — stable reference between renders via useMemo
  const STEPS = useMemo(
    () => [
      { title: t('steps.category.title'), desc: t('steps.category.desc') },
      { title: t('steps.storeInfo.title'), desc: t('steps.storeInfo.desc') },
      { title: t('steps.whatsapp.title'), desc: t('steps.whatsapp.desc') },
      { title: t('steps.review.title'), desc: t('steps.review.desc') },
    ] as const,
    [t],
  );
  const TOTAL_STEPS = STEPS.length;

  // Guard: sellers don't need setup
  if (tenant?.role === 'SELLER') {
    router.replace('/dashboard/products');
    return null;
  }

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 1:
        if (!category) { toast.error(t('errors.categoryRequired')); return false; }
        return true;
      case 2:
        if (!name.trim()) { toast.error(t('errors.nameRequired')); return false; }
        if (!slug.trim()) { toast.error(t('errors.slugRequired')); return false; }
        return true;
      case 3:
        if (!whatsapp || whatsapp === '62') { toast.error(t('errors.whatsappRequired')); return false; }
        return true;
      case 4:
        if (!isAgreed) { toast.error(t('errors.agreementRequired')); return false; }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      await upgrade({ slug, name, category, whatsapp });
    } catch {
      // Error handled in hook
    }
  };

  const handleWhatsappChange = (value: string) => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
    if (cleaned.startsWith('62')) cleaned = cleaned.slice(2);
    setWhatsapp('62' + cleaned);
  };

  const stepIndicatorIndex = currentStep - 1;

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Indicator */}
      <div className="flex items-start justify-between gap-8 pb-6 border-b mb-8">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('stepIndicator', { current: currentStep, total: TOTAL_STEPS })}
          </p>
          <h2 className="text-xl font-bold tracking-tight leading-none">
            {STEPS[stepIndicatorIndex]?.title}
          </h2>
          <p className="text-sm text-muted-foreground pt-0.5">
            {STEPS[stepIndicatorIndex]?.desc}
          </p>
        </div>
        <div className="shrink-0 pt-0.5">
          <StepIndicator
            steps={STEPS}
            currentStep={stepIndicatorIndex}
            onStepClick={(i) => setCurrentStep(i + 1)}
            size="lg"
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 min-h-[300px] pb-20">
        {/* Step 1: Category */}
        {currentStep === 1 && (
          <StepCategory
            selectedCategory={category}
            onSelectCategory={setCategory}
          />
        )}

        {/* Step 2: Store Info */}
        {currentStep === 2 && (
          <StepStoreInfo
            name={name}
            slug={slug}
            description={description}
            onUpdate={(data) => {
              if (data.name !== undefined) setName(data.name);
              if (data.slug !== undefined) setSlug(data.slug);
              if (data.description !== undefined) setDescription(data.description);
            }}
          />
        )}

        {/* Step 3: WhatsApp */}
        {currentStep === 3 && (
          <div className="space-y-5 max-w-md">
            <div className="space-y-1.5">
              <Label
                htmlFor="setup-whatsapp"
                className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
              >
                {t('steps.whatsapp.label')}
              </Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground h-11">
                  +62
                </span>
                <Input
                  id="setup-whatsapp"
                  type="tel"
                  placeholder={t('steps.whatsapp.placeholder')}
                  className="rounded-l-none h-11 text-sm placeholder:text-muted-foreground/50"
                  value={whatsapp.replace(/^62/, '')}
                  onChange={(e) => handleWhatsappChange(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('steps.whatsapp.helper')}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-3 max-w-md">
            <ReviewCard label={t('review.businessType')} onEdit={() => setCurrentStep(1)}>
              <p className="text-sm font-medium">{category || tCommon('dash')}</p>
            </ReviewCard>

            <ReviewCard label={t('review.storeInfo')} onEdit={() => setCurrentStep(2)}>
              <div className="space-y-1.5">
                <div>
                  <p className="text-xs text-muted-foreground">{t('review.storeName')}</p>
                  <p className="text-sm font-medium">{name || tCommon('dash')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('review.storeUrl')}</p>
                  <p className="text-sm font-medium text-primary">
                    {t('review.storeUrlSuffix', { slug: slug || tCommon('dash') })}
                  </p>
                </div>
                {description && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('review.description')}</p>
                    <p className="text-sm">{description}</p>
                  </div>
                )}
              </div>
            </ReviewCard>

            <ReviewCard label={t('review.whatsapp')} onEdit={() => setCurrentStep(3)}>
              <p className="text-sm font-medium">+{whatsapp}</p>
            </ReviewCard>

            {/* Agreement */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="setup-agreement"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(checked === true)}
                className="mt-0.5 shrink-0"
              />
              <label
                htmlFor="setup-agreement"
                className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
              >
                {t('review.agreementPrefix')}{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('review.termsLink')}
                </a>
                {' '}{t('review.agreementAnd')}{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('review.privacyLink')}
                </a>
                .
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Navigation */}
      <WizardNav
        steps={STEPS}
        currentStep={stepIndicatorIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        onSave={handleSubmit}
        isSaving={isLoading}
        lastStepLabel={isLoading ? t('cta.submitting') : t('cta.submit')}
        lastStepSavingLabel={t('cta.submitting')}
        onLastStep={handleSubmit}
      />
    </div>
  );
}

// ── Review Card (reuse pattern from step-review.tsx) ────────────

function ReviewCard({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
            {label}
          </p>
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