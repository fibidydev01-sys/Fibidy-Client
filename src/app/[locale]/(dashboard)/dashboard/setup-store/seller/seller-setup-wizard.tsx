'use client';

// ============================================================================
// SELLER SETUP WIZARD — Orchestrator
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-wizard.tsx
//
// [SETUP-GATE Phase A — May 2026] — 6-step wizard, full state management
// [SETUP-GATE Phase B — May 2026] — autofill hook wired + badge tracking
//
// Phase B changes vs Phase A:
//   - useSellerSetupAutofill() called at top; its result seeds useState init
//   - autofilledFields Set tracks which fields still hold autofill values
//   - set() helper removes field from Set on every edit → badge disappears
//   - isAutofilled() passed as prop to 4 step components
//   - Skip list (logo, phone, address, contactMapUrl, socialLinks) stays empty
// ============================================================================

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Store } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepIndicator } from '@/components/dashboard/shared/step-wizard';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { useCompleteSetup } from '@/hooks/dashboard/use-setup-store';
import { useAuthStore } from '@/stores/auth-store';

// ── Phase B imports ──────────────────────────────────────────────────────────
import { useSellerSetupAutofill } from './use-seller-setup-autofill';

import { StepVisual } from './step-visual';
import { StepStory } from './step-story';
import { StepHighlights } from './step-highlights';
import { StepContactLocation } from './step-contact-location';
import { StepSocial } from './step-social';
import { StepReview } from './step-review';
import { SellerSetupDone } from './seller-setup-done';

import type { FeatureItem, SocialLinks } from '@/types/tenant';

// ─── Helper ───────────────────────────────────────────────────────────────────

function checkValidUrl(value: string): boolean {
  if (!value) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  // Step 1: Visual
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  // Step 2: Story
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  // Step 3: Highlights
  aboutFeatures: FeatureItem[];
  // Step 4: Contact
  phone: string;
  address: string;
  contactMapUrl: string;
  contactTitle: string;
  contactSubtitle: string;
  // Step 5: Social
  socialLinks: SocialLinks;
}

const EMPTY_SOCIAL: SocialLinks = {
  instagram: '',
  facebook: '',
  tiktok: '',
  youtube: '',
  twitter: '',
  threads: '',
  whatsapp: '',
  telegram: '',
  pinterest: '',
  behance: '',
  dribbble: '',
  vimeo: '',
  linkedin: '',
};

// ── Phase B: names of all autofillable fields ─────────────────────────────────
// These are removed from the Set as the seller edits them.
// Skip list (logo, phone, address, contactMapUrl, socialLinks) is never here.

const AUTOFILL_FIELD_NAMES = [
  'primaryColor',
  'heroBackgroundImage',
  'heroTitle',
  'heroSubtitle',
  'heroCtaText',
  'aboutFeatures',
  'contactTitle',
  'contactSubtitle',
] as const;

type AutofillFieldName = typeof AUTOFILL_FIELD_NAMES[number];

// ─── Main Component ───────────────────────────────────────────────────────────

export function SellerSetupWizard() {
  const t = useTranslations('dashboard.setupStore.seller');
  const tenant = useAuthStore((s) => s.tenant);
  const { completeSetup, isLoading, error, isDone } = useCompleteSetup();

  const [currentStep, setCurrentStep] = useState(1);

  // ── Phase B: autofill hook ────────────────────────────────────────────────
  // Runs once on mount (useMemo — only recalcs if category/name change).
  // Falls back to __default__ if category is unknown.
  const autofill = useSellerSetupAutofill(
    tenant?.category ?? '__default__',
    tenant?.name ?? '',
  );

  // ── State — seeded from autofill (Phase B) ────────────────────────────────
  // Skip list fields (logo, phone, address, contactMapUrl, socialLinks) are
  // intentionally left empty — seller must fill these manually.
  const [form, setForm] = useState<FormState>({
    // ── SKIP LIST — always empty on mount ──────────────────────────────────
    logo: '',
    phone: '',
    address: '',
    contactMapUrl: '',
    socialLinks: { ...EMPTY_SOCIAL },

    // ── AUTOFILLED — pre-populated from category dataset ──────────────────
    primaryColor: autofill.primaryColor,
    heroBackgroundImage: autofill.heroBackgroundImage,
    heroTitle: autofill.heroTitle,
    heroSubtitle: autofill.heroSubtitle,
    heroCtaText: autofill.heroCtaText,
    aboutFeatures: autofill.aboutFeatures,
    contactTitle: autofill.contactTitle,
    contactSubtitle: autofill.contactSubtitle,
  });

  // ── Phase B: track which fields still hold autofill values ───────────────
  // Seller editing a field removes it from this Set → badge disappears.
  // Submitting with a field still in the Set is valid — seller chose the default.
  const [autofilledFields, setAutofilledFields] = useState<Set<string>>(
    () => new Set<string>(AUTOFILL_FIELD_NAMES),
  );

  const STEPS = useMemo(
    () => [
      { title: t('steps.visual.title'), desc: t('steps.visual.desc') },
      { title: t('steps.story.title'), desc: t('steps.story.desc') },
      { title: t('steps.highlights.title'), desc: t('steps.highlights.desc') },
      { title: t('steps.contact.title'), desc: t('steps.contact.desc') },
      { title: t('steps.social.title'), desc: t('steps.social.desc') },
      { title: t('steps.review.title'), desc: t('steps.review.desc') },
    ] as const,
    [t],
  );

  const TOTAL_STEPS = STEPS.length;
  const stepIndex = currentStep - 1;

  // ── Updaters ──────────────────────────────────────────────────────────────
  //
  // Phase B: set() also removes the key from autofilledFields so the badge
  // disappears as soon as the seller touches the field.

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Remove from autofilled set — badge hides
    setAutofilledFields((prev) => {
      const next = new Set(prev);
      next.delete(key as string);
      return next;
    });
  };

  const setSocialLink = (key: keyof SocialLinks, value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
    // socialLinks is in the skip list — never in autofilledFields — no-op delete is fine
  };

  // ── Phase B: badge helper — passed as prop to step components ─────────────
  const isAutofilled = (field: string): boolean => autofilledFields.has(field);

  // ── Validation — mirrors BE exactly ──────────────────────────────────────

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: {
        if (!form.logo) {
          toast.error(t('errors.logoRequired'));
          return false;
        }
        if (!form.primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(form.primaryColor)) {
          toast.error(t('errors.colorRequired'));
          return false;
        }
        if (!form.heroBackgroundImage) {
          toast.error(t('errors.heroBgRequired'));
          return false;
        }
        return true;
      }
      case 2: {
        if (form.heroTitle.trim().length < 5) {
          toast.error(t('errors.heroTitleMin'));
          return false;
        }
        if (form.heroSubtitle.trim().length < 10) {
          toast.error(t('errors.heroSubtitleMin'));
          return false;
        }
        if (form.heroCtaText.trim().length < 2) {
          toast.error(t('errors.heroCtaMin'));
          return false;
        }
        if (form.heroCtaText.trim().split(/\s+/).filter(Boolean).length > 2) {
          toast.error(t('errors.heroCtaTooManyWords'));
          return false;
        }
        return true;
      }
      case 3: {
        if (form.aboutFeatures.length !== 3) {
          toast.error(t('errors.exactly3Highlights'));
          return false;
        }
        const allValid = form.aboutFeatures.every(
          (f) =>
            f.icon &&
            (f.title ?? '').trim().length >= 2 &&
            (f.description ?? '').trim().length >= 10,
        );
        if (!allValid) {
          toast.error(t('errors.allHighlightsRequired'));
          return false;
        }
        return true;
      }
      case 4: {
        if (!form.phone.trim()) {
          toast.error(t('errors.phoneRequired'));
          return false;
        }
        if (form.address.trim().length < 10) {
          toast.error(t('errors.addressMin'));
          return false;
        }
        if (!checkValidUrl(form.contactMapUrl)) {
          toast.error(t('errors.mapUrlInvalid'));
          return false;
        }
        if (form.contactTitle.trim().length < 3) {
          toast.error(t('errors.contactTitleMin'));
          return false;
        }
        if (form.contactSubtitle.trim().length < 5) {
          toast.error(t('errors.contactSubtitleMin'));
          return false;
        }
        return true;
      }
      case 5: {
        const hasOne = Object.values(form.socialLinks).some(
          (v) => typeof v === 'string' && v.trim().length > 0,
        );
        if (!hasOne) {
          toast.error(t('errors.atLeastOneSocial'));
          return false;
        }
        return true;
      }
      case 6:
        return true;
      default:
        return true;
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleGoToStep = (step: number) => {
    if (step < currentStep) setCurrentStep(step);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    for (let s = 1; s <= TOTAL_STEPS - 1; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }
    try {
      await completeSetup({
        logo: form.logo,
        primaryColor: form.primaryColor,
        heroBackgroundImage: form.heroBackgroundImage,
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        heroCtaText: form.heroCtaText,
        aboutFeatures: form.aboutFeatures,
        phone: form.phone,
        address: form.address,
        contactMapUrl: form.contactMapUrl,
        contactTitle: form.contactTitle,
        contactSubtitle: form.contactSubtitle,
        socialLinks: form.socialLinks,
      });
    } catch {
      // Error handled in hook + toast
    }
  };

  // ── Done screen ───────────────────────────────────────────────────────────

  if (isDone) {
    return <SellerSetupDone />;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step indicator */}
      <div className="flex items-start justify-between gap-8 pb-6 border-b mb-8">
        <div className="space-y-1">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('stepIndicator', { current: currentStep, total: TOTAL_STEPS })}
          </p>
          <h2 className="text-xl font-bold tracking-tight leading-none">
            {STEPS[stepIndex]?.title}
          </h2>
          <p className="text-sm text-muted-foreground pt-0.5">
            {STEPS[stepIndex]?.desc}
          </p>
        </div>
        <div className="shrink-0 pt-0.5">
          <StepIndicator
            steps={STEPS}
            currentStep={stepIndex}
            onStepClick={(i) => handleGoToStep(i + 1)}
            size="lg"
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 min-h-[300px] pb-24">
        {currentStep === 1 && (
          <StepVisual
            logo={form.logo}
            primaryColor={form.primaryColor}
            heroBackgroundImage={form.heroBackgroundImage}
            onLogoChange={(v) => set('logo', v)}
            onColorChange={(v) => set('primaryColor', v)}
            onHeroBgChange={(v) => set('heroBackgroundImage', v)}
            // Phase B: badge visibility
            isAutofilled={isAutofilled}
          />
        )}
        {currentStep === 2 && (
          <StepStory
            heroTitle={form.heroTitle}
            heroSubtitle={form.heroSubtitle}
            heroCtaText={form.heroCtaText}
            onHeroTitleChange={(v) => set('heroTitle', v)}
            onHeroSubtitleChange={(v) => set('heroSubtitle', v)}
            onHeroCtaTextChange={(v) => set('heroCtaText', v)}
            // Phase B: badge visibility
            isAutofilled={isAutofilled}
          />
        )}
        {currentStep === 3 && (
          <StepHighlights
            aboutFeatures={form.aboutFeatures}
            onFeaturesChange={(v) => set('aboutFeatures', v)}
            // Phase B: badge visibility
            isAutofilled={isAutofilled}
          />
        )}
        {currentStep === 4 && (
          <StepContactLocation
            contactTitle={form.contactTitle}
            contactSubtitle={form.contactSubtitle}
            phone={form.phone}
            address={form.address}
            contactMapUrl={form.contactMapUrl}
            whatsappReadonly={tenant?.whatsapp}
            onContactTitleChange={(v) => set('contactTitle', v)}
            onContactSubtitleChange={(v) => set('contactSubtitle', v)}
            onPhoneChange={(v) => set('phone', v)}
            onAddressChange={(v) => set('address', v)}
            onContactMapUrlChange={(v) => set('contactMapUrl', v)}
            // Phase B: badge visibility
            isAutofilled={isAutofilled}
          />
        )}
        {currentStep === 5 && (
          <StepSocial
            socialLinks={form.socialLinks}
            onSocialLinkChange={setSocialLink}
          />
        )}
        {currentStep === 6 && (
          <StepReview
            logo={form.logo}
            primaryColor={form.primaryColor}
            heroBackgroundImage={form.heroBackgroundImage}
            heroTitle={form.heroTitle}
            heroSubtitle={form.heroSubtitle}
            heroCtaText={form.heroCtaText}
            aboutFeatures={form.aboutFeatures}
            phone={form.phone}
            address={form.address}
            contactMapUrl={form.contactMapUrl}
            contactTitle={form.contactTitle}
            contactSubtitle={form.contactSubtitle}
            socialLinks={form.socialLinks}
            onEditStep={handleGoToStep}
          />
        )}
      </div>

      {/* Nav */}
      <WizardNav
        steps={STEPS}
        currentStep={stepIndex}
        onPrev={handlePrev}
        onNext={handleNext}
        onSave={handleSubmit}
        isSaving={isLoading}
        lastStepLabel={t('cta.submit')}
        lastStepSavingLabel={t('cta.submitting')}
        onLastStep={handleSubmit}
      />

    </div>
  );
}
