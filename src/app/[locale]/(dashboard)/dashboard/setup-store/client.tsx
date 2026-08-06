'use client';

// ============================================================================
// SETUP STORE CLIENT — Dispatcher + BuyerUpgradeWizard
// File: src/app/[locale]/(dashboard)/dashboard/setup-store/client.tsx
//
// [SPRINT 1 — S-X1 FIX: BuyerUpgradeWizard slug conflict dialog]
// BuyerUpgradeWizard sekarang punya SlugConflictDialog saat BE return
// 409 SLUG_CONFLICT. Sebelumnya hanya generic toast.error — user tidak
// tahu slug mereka sudah diambil dan tidak ada saran alternatif.
//
// Fix pattern sama dengan register wizard:
//   - Catch ApiRequestError + cek .isConflict() atau status 409
//   - Generate slug suggestions via generateSlugSuggestions()
//   - Tampilkan SlugConflictDialog dengan suggestions
//   - User bisa pilih suggestion atau edit manual ke step 2
//
// [PHASE D · POST-AUDIT — May 2026]
// BuyerUpgradeWizard: implementasi working 4-step wizard.
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { SellerSetupWizard } from './seller/seller-setup-wizard';

import { tenantsApi } from '@/lib/api/tenants';
import { authApi } from '@/lib/api/auth';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { toast } from '@/lib/providers/root-provider';
import { useDebounce } from '@/hooks/shared/use-debounce';
import { useCheckSlug } from '@/hooks/auth/use-auth';
import { validateSlugFormat } from '@/lib/constants/shared/slug.constants';
import { generateSlugSuggestions } from '@/lib/utils/slug-suggestions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import { SlugConflictDialog } from '@/components/auth/register/slug-conflict-dialog';

import { StepCategory } from '@/components/auth/register/step-category';
import { StepStoreInfo } from '@/components/auth/register/step-store-info';
import { RegisterStepIndicator } from '@/components/auth/register/register-step-indicator';
import { RegisterNav } from '@/components/auth/register/register-nav';

import { Store, Edit2 } from 'lucide-react';
import { getCategoryConfig } from '@/lib/constants/shared/categories';

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function SetupStoreClient() {
  const tenant = useAuthStore((s) => s.tenant);
  const router = useRouter();

  if (!tenant) return null;

  if (tenant.role === 'SELLER' && tenant.isSetupComplete) {
    router.replace('/dashboard/studio');
    return null;
  }

  if (tenant.role === 'SELLER' && !tenant.isSetupComplete) {
    return <SellerSetupWizard />;
  }

  return <BuyerUpgradeWizard />;
}

// ============================================================================
// BUYER UPGRADE WIZARD
// ============================================================================

interface BuyerWizardState {
  currentStep: number;
  category: string;
  name: string;
  slug: string;
  description: string;
  whatsapp: string;
}

const BUYER_TOTAL_STEPS = 4;

function isPhoneValid(whatsapp: string): boolean {
  return /^62[0-9]{9,13}$/.test(whatsapp.replace(/\D/g, ''));
}

function BuyerUpgradeWizard() {
  const t = useTranslations('auth.register');
  const tToast = useTranslations('toast.upgrade');
  // [S-X1 FIX] useTranslations untuk getErrorMessage
  const tAll = useTranslations();
  const { setTenant } = useAuthStore();
  const router = useRouter();

  const [state, setState] = useState<BuyerWizardState>({
    currentStep: 1,
    category: '',
    name: '',
    slug: '',
    description: '',
    whatsapp: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  // [S-X1 FIX] State untuk SlugConflictDialog
  const [slugConflictOpen, setSlugConflictOpen] = useState(false);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  const { checkSlug, isChecking, isAvailable, reset: resetSlug } = useCheckSlug();
  const debouncedSlug = useDebounce(state.slug, 500);

  useEffect(() => {
    if (debouncedSlug && debouncedSlug.length >= 3) {
      checkSlug(debouncedSlug);
    } else {
      resetSlug();
    }
  }, [debouncedSlug, checkSlug, resetSlug]);

  const update = (patch: Partial<BuyerWizardState>) => {
    setState((p) => ({ ...p, ...patch }));
  };

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];
    switch (step) {
      case 1:
        if (!state.category.trim()) errors.push(t('errors.categoryRequired'));
        break;
      case 2:
        if (!state.name || state.name.trim().length < 3) errors.push(t('errors.nameRequired'));
        if (!state.slug || state.slug.length < 3 || !validateSlugFormat(state.slug).valid)
          errors.push(t('errors.slugRequired'));
        if (isChecking) errors.push(t('errors.slugChecking'));
        if (isAvailable === false) errors.push(t('errors.slugTaken'));
        break;
      case 3:
        if (!isPhoneValid(state.whatsapp)) errors.push(t('errors.whatsappRequired'));
        break;
      case 4:
        break;
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(state.currentStep);
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }
    if (state.currentStep < BUYER_TOTAL_STEPS) {
      setState((p) => ({ ...p, currentStep: p.currentStep + 1 }));
    }
  };

  const handlePrev = () => {
    if (state.currentStep > 1) {
      setState((p) => ({ ...p, currentStep: p.currentStep - 1 }));
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= BUYER_TOTAL_STEPS) {
      setState((p) => ({ ...p, currentStep: step }));
    }
  };

  const handleSubmit = async () => {
    const allErrors = [...validateStep(1), ...validateStep(2), ...validateStep(3)];
    if (allErrors.length > 0) {
      setValidationItems(allErrors);
      setValidationOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await tenantsApi.upgradeTenantToSeller({
        slug: state.slug.toLowerCase(),
        name: state.name.trim(),
        category: state.category,
        whatsapp: state.whatsapp.replace(/\D/g, ''),
      });

      setTenant(response.tenant);
      try {
        const me = await authApi.me();
        setTenant(me);
      } catch {
        // Fallback ke response yang sudah di-set
      }

      toast.success(tToast('success'), tToast('successDetail'));
      router.push('/dashboard/setup-store');
    } catch (err) {
      // [S-X1 FIX] Detect slug conflict dan tampilkan dialog khusus
      const isSlugConflict =
        err instanceof ApiRequestError && (err.isConflict() || err.code === 'SLUG_CONFLICT');

      if (isSlugConflict) {
        // Generate slug suggestions dan tampilkan dialog
        const suggestions = state.slug ? generateSlugSuggestions(state.slug) : [];
        setSlugSuggestions(suggestions);
        setSlugConflictOpen(true);
        // Jangan tampilkan toast.error untuk kasus slug conflict
      } else {
        // Error lain → generic toast
        toast.error(tToast('failed'), getErrorMessage(err, tAll));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // [S-X1 FIX] Handler untuk SlugConflictDialog
  const handlePickSuggestion = (suggestion: string) => {
    update({ slug: suggestion });
    setSlugConflictOpen(false);
    setSlugSuggestions([]);
    // Kembali ke step 2 agar user bisa review slug baru
    goToStep(2);
  };

  const handleEditManually = () => {
    setSlugConflictOpen(false);
    goToStep(2);
  };

  const handleSlugConflictClose = () => {
    setSlugConflictOpen(false);
    setSlugSuggestions([]);
  };

  const STEPS = useMemo(
    () => [
      { title: t('stepsMeta.businessType.title'), desc: t('stepsMeta.businessType.desc') },
      { title: t('stepsMeta.storeDetails.title'), desc: t('stepsMeta.storeDetails.desc') },
      { title: 'WhatsApp', desc: t('account.whatsappHelper') },
      { title: t('stepsMeta.review.title'), desc: t('stepsMeta.review.desc') },
    ],
    [t],
  );

  const indicatorStep = state.currentStep - 1;

  return (
    // h-full flex flex-col — RegisterNav is now a self-contained sticky
    // pill (see register-nav.tsx). Without a definite-height flex
    // ancestor here, a plain block div only ever sizes to its own short
    // content, and the sticky pill just sits right after it instead of
    // bottoming out at the real viewport edge — same bug already fixed
    // for the dashboard's other short wizard pages (see
    // dashboard-shell.tsx / settings/client.tsx).
    <div className="mx-auto flex h-full max-w-2xl flex-col px-4 py-8">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mb-8">
          <RegisterStepIndicator
            steps={STEPS}
            currentStep={indicatorStep}
            onStepClick={(i) => goToStep(i + 1)}
            size="lg"
          />
        </div>

        {/* Step header */}
        <div className="text-center mb-6">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('stepCounter', { current: state.currentStep, total: BUYER_TOTAL_STEPS })}
          </p>
          <h2 className="text-lg font-bold tracking-tight mt-1">{STEPS[indicatorStep].title}</h2>
          <p className="text-sm text-muted-foreground">{STEPS[indicatorStep].desc}</p>
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {state.currentStep === 1 && (
            <StepCategory
              selectedCategory={state.category}
              onSelectCategory={(category) => update({ category })}
            />
          )}
          {state.currentStep === 2 && (
            <StepStoreInfo
              name={state.name}
              slug={state.slug}
              description={state.description}
              onUpdate={(patch) => update(patch)}
              isChecking={isChecking}
              isAvailable={isAvailable}
            />
          )}
          {state.currentStep === 3 && (
            <BuyerWhatsAppStep
              whatsapp={state.whatsapp}
              onChange={(whatsapp) => update({ whatsapp })}
            />
          )}
          {state.currentStep === 4 && (
            <BuyerReviewStep data={state} onEdit={(step) => goToStep(step)} />
          )}
        </div>
      </div>

      {/* Nav */}
      <RegisterNav
        steps={STEPS}
        currentStep={indicatorStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onLastStep={handleSubmit}
        isSaving={isSubmitting}
        lastStepLabel={t('review.submitButton')}
        lastStepSavingLabel={t('review.submittingButton')}
      />

      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />

      {/* [S-X1 FIX] Slug conflict dialog — sama dengan register wizard */}
      <SlugConflictDialog
        open={slugConflictOpen}
        conflictingSlug={state.slug}
        suggestions={slugSuggestions}
        onClose={handleSlugConflictClose}
        onPickSuggestion={handlePickSuggestion}
        onEditManually={handleEditManually}
      />
    </div>
  );
}

// ─── BuyerWhatsAppStep ────────────────────────────────────────────────────────

function BuyerWhatsAppStep({
  whatsapp,
  onChange,
}: {
  whatsapp: string;
  onChange: (whatsapp: string) => void;
}) {
  const t = useTranslations('auth.register.account');
  const localPhone = whatsapp.startsWith('62') ? whatsapp.slice(2) : whatsapp;

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-1.5">
        <Label
          htmlFor="buyer-whatsapp"
          className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
        >
          {t('whatsappLabel')}{' '}
          <span className="text-destructive normal-case font-normal">*</span>
        </Label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 h-11 bg-muted/40 border rounded-md text-sm font-mono text-muted-foreground">
            🇮🇩 +62
          </div>
          <Input
            id="buyer-whatsapp"
            type="tel"
            inputMode="numeric"
            placeholder={t('whatsappPlaceholder')}
            value={localPhone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              onChange('62' + digits);
            }}
            className="h-11 flex-1 text-sm placeholder:text-muted-foreground/50"
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('whatsappHelper')}</p>
      </div>
    </div>
  );
}

// ─── BuyerReviewStep ──────────────────────────────────────────────────────────

function BuyerReviewStep({
  data,
  onEdit,
}: {
  data: BuyerWizardState;
  onEdit: (step: number) => void;
}) {
  const t = useTranslations('auth.register.review');
  const tRoot = useTranslations();

  const categoryConfig = data.category ? getCategoryConfig(data.category) : null;
  const categoryLabel = categoryConfig
    ? tRoot(`common.categories.items.${categoryConfig.key}.label`)
    : data.category || t('dash');

  return (
    <div className="space-y-3 max-w-md mx-auto">
      <ReviewCard label={t('businessType')} onEdit={() => onEdit(1)}>
        <p className="text-sm font-medium">{categoryLabel}</p>
      </ReviewCard>

      <ReviewCard
        label={t('storeInfo')}
        icon={<Store className="h-3.5 w-3.5 text-muted-foreground" />}
        onEdit={() => onEdit(2)}
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

      <ReviewCard label="WhatsApp" onEdit={() => onEdit(3)}>
        <p className="text-sm font-medium">+{data.whatsapp}</p>
      </ReviewCard>
    </div>
  );
}

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
          aria-label="Edit"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
