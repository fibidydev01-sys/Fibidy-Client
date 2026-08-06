'use client';

// ============================================================================
// SELLER SETUP WIZARD — Orchestrator
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-wizard.tsx
//
// [SETUP HIGHLIGHT — May 2026]
// Listen CustomEvent 'setup:highlight' yang di-dispatch oleh
// dashboard-sidebar.tsx dan mobile-navbar.tsx saat user mencoba navigate
// ke halaman lain padahal setup belum selesai.
//
// Saat event diterima:
//   1. computeFieldErrorsForStep(currentStep, form) → Set<string> field keys
//   2. setFieldErrors(computed) → field merah di step saat ini
//   3. scrollToFirstFieldError() → scroll ke field error paling atas
//
// User tetap di step yang sama — tidak reset ke step 1.
// Tidak ada dialog baru — field langsung highlight.
//
// [SPRINT 5 — SCROLL FIX carry-forward]
// [SPRINT 1 — G1 FIX carry-forward]
// [SPRINT 1 — G2 FIX carry-forward]
// ============================================================================

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useCompleteSetup } from '@/hooks/dashboard/use-setup-store';
import { useSellerSetupAutofill } from './use-seller-setup-autofill';
import { useAsyncStateTracker } from '@/lib/shared/use-async-state-tracker';
import { getCategoryConfig } from '@/lib/constants/shared/categories';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import { StepVisual } from './step-visual';
import { StepStory } from './step-story';
import { StepHighlights } from './step-highlights';
import { StepContactLocation } from './step-contact-location';
import { StepSocial } from './step-social';
import { SellerSetupDone } from './seller-setup-done';
import { SetupStepIndicator } from '@/components/dashboard/setup-store/setup-step-indicator';
import { SetupWizardNav } from '@/components/dashboard/setup-store/setup-wizard-nav';
import type { CompleteSetupInput, FeatureItem, SocialLinks } from '@/types/tenant';

// ── Form State ────────────────────────────────────────────────────────────────

interface SellerWizardFormState {
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  aboutFeatures: FeatureItem[];
  phone: string;
  contactTitle: string;
  contactSubtitle: string;
  hasPhysicalLocation: boolean;
  address: string;
  contactMapUrl: string;
  locationLat?: number;
  locationLng?: number;
  socialLinks: SocialLinks;
}

// ── Autofill Snapshot ─────────────────────────────────────────────────────────

interface AutofillSnapshot {
  primaryColor: string;
  heroBackgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  contactTitle: string;
  contactSubtitle: string;
}

// ── Wizard Reducer ────────────────────────────────────────────────────────────

interface WizardState {
  form: SellerWizardFormState;
  autofilledFields: Set<string>;
}

type WizardAction =
  | { type: 'SET_FIELD'; key: keyof SellerWizardFormState; value: SellerWizardFormState[keyof SellerWizardFormState] }
  | { type: 'APPLY_AUTOFILL'; patch: Partial<SellerWizardFormState>; fields: Set<string> }
  | { type: 'CLEAR_AUTOFILL_FIELD'; field: string };

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        form: { ...state.form, [action.key]: action.value },
      };
    case 'APPLY_AUTOFILL':
      return {
        form: { ...state.form, ...action.patch },
        autofilledFields: action.fields,
      };
    case 'CLEAR_AUTOFILL_FIELD': {
      if (!state.autofilledFields.has(action.field)) return state;
      const next = new Set(state.autofilledFields);
      next.delete(action.field);
      return { ...state, autofilledFields: next };
    }
    default:
      return state;
  }
}

// ── Translation function type compatible with next-intl ───────────────────────

type TFn = (key: string, params?: Record<string, string | number | Date>) => string;

// ── Validation ────────────────────────────────────────────────────────────────

function getStepErrors(
  step: number,
  form: SellerWizardFormState,
  t: TFn,
): string[] {
  const errors: string[] = [];

  switch (step) {
    case 1:
      if (!form.logo) errors.push(t('errors.logoRequired'));
      if (!form.primaryColor) errors.push(t('errors.colorRequired'));
      if (!form.heroBackgroundImage) errors.push(t('errors.heroBgRequired'));
      break;
    case 2:
      if (form.heroTitle.trim().length < 5) errors.push(t('errors.heroTitleMin'));
      if (form.heroSubtitle.trim().length < 10) errors.push(t('errors.heroSubtitleMin'));
      if (form.heroCtaText.trim().length < 2) errors.push(t('errors.heroCtaMin'));
      break;
    case 3:
      if (form.aboutFeatures.length !== 3) errors.push(t('errors.exactly3Highlights'));
      form.aboutFeatures.forEach((f, i) => {
        if (!f.image) errors.push(`Highlight ${i + 1}: ${t('highlights.imageRequired')}`);
        if (f.title.trim().length < 2) errors.push(`Highlight ${i + 1}: ${t('highlights.titleRequired')}`);
        if ((f.description ?? '').trim().length < 10)
          errors.push(`Highlight ${i + 1}: ${t('highlights.descriptionRequired')}`);
      });
      break;
    case 4:
      if (!form.phone.trim()) errors.push(t('contact.phoneRequired'));
      if (form.contactTitle.trim().length < 3) errors.push(t('contact.contactTitleRequired'));
      if (form.contactSubtitle.trim().length < 5) errors.push(t('contact.contactSubtitleRequired'));
      if (form.hasPhysicalLocation) {
        if (form.address.trim().length < 10) errors.push(t('contact.addressRequired'));
        const hasMap =
          form.contactMapUrl.trim().length > 0 ||
          (form.locationLat !== undefined && form.locationLng !== undefined);
        if (!hasMap) errors.push(t('contact.mapRequired'));
      }
      break;
    case 5: {
      const hasLink = Object.values(form.socialLinks).some(
        (v) => typeof v === 'string' && v.trim().length > 0,
      );
      if (!hasLink) errors.push(t('social.emptyReminder'));
      break;
    }
  }

  return errors;
}

// ── Compute field errors per step ─────────────────────────────────────────────

function computeFieldErrorsForStep(
  step: number,
  form: SellerWizardFormState,
): Set<string> {
  const fields = new Set<string>();

  switch (step) {
    case 1:
      if (!form.logo) fields.add('logo');
      if (!form.primaryColor) fields.add('primaryColor');
      if (!form.heroBackgroundImage) fields.add('heroBackgroundImage');
      break;
    case 2:
      if (form.heroTitle.trim().length < 5) fields.add('heroTitle');
      if (form.heroSubtitle.trim().length < 10) fields.add('heroSubtitle');
      if (form.heroCtaText.trim().length < 2) fields.add('heroCtaText');
      break;
    case 3:
      form.aboutFeatures.forEach((f, i) => {
        if (!f.image) fields.add(`highlight-${i}-image`);
        if (f.title.trim().length < 2) fields.add(`highlight-${i}-title`);
        if ((f.description ?? '').trim().length < 10) fields.add(`highlight-${i}-desc`);
      });
      break;
    case 4:
      if (!form.phone.trim()) fields.add('phone');
      if (form.contactTitle.trim().length < 3) fields.add('contactTitle');
      if (form.contactSubtitle.trim().length < 5) fields.add('contactSubtitle');
      if (form.hasPhysicalLocation) {
        if (form.address.trim().length < 10) fields.add('address');
        const hasMap =
          form.contactMapUrl.trim().length > 0 ||
          (form.locationLat !== undefined && form.locationLng !== undefined);
        if (!hasMap) fields.add('map');
      }
      break;
    case 5: {
      const hasLink = Object.values(form.socialLinks).some(
        (v) => typeof v === 'string' && v.trim().length > 0,
      );
      if (!hasLink) fields.add('socialLinks');
      break;
    }
  }

  return fields;
}

// ── Initial form state ────────────────────────────────────────────────────────

function makeInitialForm(defaultHasPhysicalLocation: boolean): SellerWizardFormState {
  return {
    logo: '',
    primaryColor: '#8B4513',
    heroBackgroundImage: '',
    heroTitle: '',
    heroSubtitle: '',
    heroCtaText: '',
    aboutFeatures: [],
    phone: '',
    contactTitle: '',
    contactSubtitle: '',
    hasPhysicalLocation: defaultHasPhysicalLocation,
    address: '',
    contactMapUrl: '',
    locationLat: undefined,
    locationLng: undefined,
    socialLinks: {},
  };
}

// ── Scroll to first field error ───────────────────────────────────────────────

function scrollToFirstFieldError(): void {
  const errorEls = document.querySelectorAll<HTMLElement>('[data-field-error="true"]');
  if (errorEls.length === 0) return;

  let topEl: HTMLElement = errorEls[0];
  let topValue = errorEls[0].getBoundingClientRect().top;

  errorEls.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < topValue) {
      topValue = top;
      topEl = el;
    }
  });

  topEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SellerSetupWizard() {
  const t = useTranslations('dashboard.setupStore.seller');
  const tenant = useAuthStore((s) => s.tenant);
  const { completeSetup, isLoading, isDone } = useCompleteSetup();

  const uploadTracker = useAsyncStateTracker();

  const locationType = useMemo(
    () => getCategoryConfig(tenant?.category ?? '')?.locationType ?? 'PHYSICAL',
    [tenant?.category],
  );

  const defaultHasPhysicalLocation = locationType !== 'ONLINE';

  const [wizardState, dispatch] = useReducer(wizardReducer, {
    form: makeInitialForm(defaultHasPhysicalLocation),
    autofilledFields: new Set<string>(),
  });

  const { form, autofilledFields } = wizardState;

  const [currentStep, setCurrentStep] = useState(1);

  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);
  const [uploadGuardOpen, setUploadGuardOpen] = useState(false);
  const [uploadGuardMessage, setUploadGuardMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  // [UPLOAD GUARD] Auto-close upload guard saat semua upload selesai
  useEffect(() => {
    if (!uploadTracker.isAnyActive && uploadGuardOpen) {
      setUploadGuardOpen(false);
    }
  }, [uploadTracker.isAnyActive, uploadGuardOpen]);

  // ── [SETUP HIGHLIGHT] Listen event dari sidebar/mobile-navbar ─────────────
  //
  // Saat user coba navigate padahal setup belum selesai:
  //   sidebar/navbar dispatch 'setup:highlight'
  //   → wizard compute field errors step saat ini
  //   → setFieldErrors → field merah langsung
  //   → scrollToFirstFieldError → scroll ke field paling atas
  //
  // Tidak ada dialog — langsung highlight. User tahu persis apa yang kurang.
  // currentStepRef dipakai agar closure event listener selalu baca step terkini.

  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  const formRef = useRef(form);
  formRef.current = form;

  useEffect(() => {
    const handleHighlight = () => {
      const step = currentStepRef.current;
      const currentForm = formRef.current;

      // Compute field errors untuk step saat ini
      const computed = computeFieldErrorsForStep(step, currentForm);
      setFieldErrors(computed);

      // Scroll ke field error paling atas setelah 100ms
      // (delay kecil agar React render field merah dulu sebelum scroll)
      setTimeout(() => {
        scrollToFirstFieldError();
      }, 100);
    };

    window.addEventListener('setup:highlight', handleHighlight);
    return () => window.removeEventListener('setup:highlight', handleHighlight);
  }, []); // deps kosong — pakai ref untuk baca state terkini

  // ── Autofill ────────────────────────────────────────────────────────────

  const autofill = useSellerSetupAutofill(tenant?.category ?? '', tenant?.name ?? '');
  const autofillSnapshotRef = useRef<AutofillSnapshot | null>(null);

  useEffect(() => {
    if (!tenant?.category) return;

    const patch: Partial<SellerWizardFormState> = {};
    const fields = new Set<string>();

    if (!form.primaryColor || form.primaryColor === '#8B4513') {
      patch.primaryColor = autofill.primaryColor;
      fields.add('primaryColor');
    }
    if (!form.heroBackgroundImage) {
      patch.heroBackgroundImage = autofill.heroBackgroundImage;
      fields.add('heroBackgroundImage');
    }
    if (!form.heroTitle) {
      patch.heroTitle = autofill.heroTitle;
      fields.add('heroTitle');
    }
    if (!form.heroSubtitle) {
      patch.heroSubtitle = autofill.heroSubtitle;
      fields.add('heroSubtitle');
    }
    if (!form.heroCtaText) {
      patch.heroCtaText = autofill.heroCtaText;
      fields.add('heroCtaText');
    }
    if (form.aboutFeatures.length !== 3) {
      patch.aboutFeatures = autofill.aboutFeatures;
      fields.add('aboutFeatures');
    }
    if (!form.contactTitle) {
      patch.contactTitle = autofill.contactTitle;
      fields.add('contactTitle');
    }
    if (!form.contactSubtitle) {
      patch.contactSubtitle = autofill.contactSubtitle;
      fields.add('contactSubtitle');
    }

    dispatch({ type: 'APPLY_AUTOFILL', patch, fields });

    autofillSnapshotRef.current = {
      primaryColor: autofill.primaryColor,
      heroBackgroundImage: autofill.heroBackgroundImage,
      heroTitle: autofill.heroTitle,
      heroSubtitle: autofill.heroSubtitle,
      heroCtaText: autofill.heroCtaText,
      contactTitle: autofill.contactTitle,
      contactSubtitle: autofill.contactSubtitle,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.category]);

  const clearAutofillIfChanged = useCallback(
    (fieldName: keyof AutofillSnapshot, newValue: string) => {
      const snapshot = autofillSnapshotRef.current;
      if (!snapshot) return;
      if (newValue !== snapshot[fieldName]) {
        dispatch({ type: 'CLEAR_AUTOFILL_FIELD', field: fieldName });
      }
    },
    [],
  );

  const isAutofilled = useCallback(
    (field: string) => autofilledFields.has(field),
    [autofilledFields],
  );

  // ── Field error helpers ───────────────────────────────────────────────────

  const handleClearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  // ── Update helpers ────────────────────────────────────────────────────────

  const update = useCallback(<K extends keyof SellerWizardFormState>(
    key: K,
    value: SellerWizardFormState[K],
  ) => {
    dispatch({ type: 'SET_FIELD', key, value });
  }, []);

  const handleHeroTitleChange = useCallback((v: string) => {
    update('heroTitle', v);
    clearAutofillIfChanged('heroTitle', v);
    handleClearFieldError('heroTitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleHeroSubtitleChange = useCallback((v: string) => {
    update('heroSubtitle', v);
    clearAutofillIfChanged('heroSubtitle', v);
    handleClearFieldError('heroSubtitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleHeroCtaTextChange = useCallback((v: string) => {
    update('heroCtaText', v);
    clearAutofillIfChanged('heroCtaText', v);
    handleClearFieldError('heroCtaText');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleContactTitleChange = useCallback((v: string) => {
    update('contactTitle', v);
    clearAutofillIfChanged('contactTitle', v);
    handleClearFieldError('contactTitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleContactSubtitleChange = useCallback((v: string) => {
    update('contactSubtitle', v);
    clearAutofillIfChanged('contactSubtitle', v);
    handleClearFieldError('contactSubtitle');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleColorChange = useCallback((v: string) => {
    update('primaryColor', v);
    clearAutofillIfChanged('primaryColor', v);
    handleClearFieldError('primaryColor');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleHeroBgChange = useCallback((v: string) => {
    update('heroBackgroundImage', v);
    clearAutofillIfChanged('heroBackgroundImage', v);
    handleClearFieldError('heroBackgroundImage');
  }, [update, clearAutofillIfChanged, handleClearFieldError]);

  const handleLogoChange = useCallback((v: string) => {
    update('logo', v);
    handleClearFieldError('logo');
  }, [update, handleClearFieldError]);

  // ── Upload Guard ──────────────────────────────────────────────────────────

  const checkUploadGuard = useCallback((): boolean => {
    if (!uploadTracker.isAnyActive) return true;

    const count = uploadTracker.count;
    const msg =
      count === 1
        ? t('errors.uploadInProgress')
        : t('errors.uploadInProgressCount', { count });

    setUploadGuardMessage(msg);
    setUploadGuardOpen(true);
    return false;
  }, [uploadTracker, t]);

  // ── onAfterClose — scroll to first field error ────────────────────────────

  const handleValidationAfterClose = useCallback(() => {
    scrollToFirstFieldError();
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────

  const handleNext = useCallback(() => {
    if (!checkUploadGuard()) return;

    const errors = getStepErrors(currentStep, form, t as unknown as TFn);
    if (errors.length > 0) {
      const computed = computeFieldErrorsForStep(currentStep, form);
      setFieldErrors(computed);
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }
    setFieldErrors(new Set());
    if (currentStep < 5) setCurrentStep((s) => s + 1);
  }, [checkUploadGuard, currentStep, form, t]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!checkUploadGuard()) return;

    const errors = getStepErrors(currentStep, form, t as unknown as TFn);
    if (errors.length > 0) {
      const computed = computeFieldErrorsForStep(currentStep, form);
      setFieldErrors(computed);
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    const payload: CompleteSetupInput = {
      logo: form.logo,
      primaryColor: form.primaryColor,
      heroBackgroundImage: form.heroBackgroundImage,
      heroTitle: form.heroTitle.trim(),
      heroSubtitle: form.heroSubtitle.trim(),
      heroCtaText: form.heroCtaText.trim(),
      aboutFeatures: form.aboutFeatures,
      phone: form.phone.trim(),
      contactTitle: form.contactTitle.trim(),
      contactSubtitle: form.contactSubtitle.trim(),
      hasPhysicalLocation: form.hasPhysicalLocation,
      ...(form.hasPhysicalLocation && {
        address: form.address.trim(),
        ...(form.contactMapUrl.trim() && { contactMapUrl: form.contactMapUrl.trim() }),
        ...(form.locationLat !== undefined && { locationLat: form.locationLat }),
        ...(form.locationLng !== undefined && { locationLng: form.locationLng }),
      }),
      socialLinks: form.socialLinks,
    };

    try {
      await completeSetup(payload);
    } catch {
      // Toast handled inside hook
    }
  }, [checkUploadGuard, currentStep, form, completeSetup, t]);

  if (isDone) {
    return <SellerSetupDone />;
  }

  const STEPS = [
    { title: t('steps.visual.title'), desc: t('steps.visual.desc') },
    { title: t('steps.story.title'), desc: t('steps.story.desc') },
    { title: t('steps.highlights.title'), desc: t('steps.highlights.desc') },
    { title: t('steps.contact.title'), desc: t('steps.contact.desc') },
    { title: t('steps.social.title'), desc: t('steps.social.desc') },
  ];

  return (
    // pb-32 → pb-40 md:pb-8 — SetupWizardNav's mobile variant is now
    // `fixed`, floating bottom-20 above the viewport edge with its own
    // ~62px height (no MobileNavbar to also clear here — setup-store
    // hides it — but the pill itself still needs clearance). At md+ it
    // reverts to `sticky` (in-flow), so the large reserve isn't needed.
    <div className="max-w-3xl mx-auto pb-40 md:pb-8">
      <div className="mb-8">
        <SetupStepIndicator
          steps={STEPS}
          currentStep={currentStep - 1}
          onStepClick={(idx: number) => setCurrentStep(idx + 1)}
        />
      </div>

      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <StepVisual
            logo={form.logo}
            primaryColor={form.primaryColor}
            heroBackgroundImage={form.heroBackgroundImage}
            storeName={tenant?.name ?? ''}
            onLogoChange={handleLogoChange}
            onColorChange={handleColorChange}
            onHeroBgChange={handleHeroBgChange}
            isAutofilled={isAutofilled}
            onUploadStateChange={uploadTracker.trackOp}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
        {currentStep === 2 && (
          <StepStory
            heroTitle={form.heroTitle}
            heroSubtitle={form.heroSubtitle}
            heroCtaText={form.heroCtaText}
            onHeroTitleChange={handleHeroTitleChange}
            onHeroSubtitleChange={handleHeroSubtitleChange}
            onHeroCtaTextChange={handleHeroCtaTextChange}
            isAutofilled={isAutofilled}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
        {currentStep === 3 && (
          <StepHighlights
            items={form.aboutFeatures}
            onChange={(v: FeatureItem[]) => update('aboutFeatures', v)}
            isAutofilled={isAutofilled}
            onUploadStateChange={uploadTracker.trackOp}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
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
            hasPhysicalLocation={form.hasPhysicalLocation}
            locationLat={form.locationLat}
            locationLng={form.locationLng}
            locationType={locationType}
            onContactTitleChange={handleContactTitleChange}
            onContactSubtitleChange={handleContactSubtitleChange}
            onPhoneChange={(v: string) => {
              update('phone', v);
              handleClearFieldError('phone');
            }}
            onAddressChange={(v: string) => {
              update('address', v);
              handleClearFieldError('address');
            }}
            onContactMapUrlChange={(v: string) => {
              update('contactMapUrl', v);
              handleClearFieldError('map');
            }}
            onHasPhysicalLocationChange={(v: boolean) => update('hasPhysicalLocation', v)}
            onLocationCoordsChange={(lat: number | undefined, lng: number | undefined) => {
              update('locationLat', lat);
              update('locationLng', lng);
              if (lat !== undefined && lng !== undefined) {
                handleClearFieldError('map');
              }
            }}
            isAutofilled={isAutofilled}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
        {currentStep === 5 && (
          <StepSocial
            socialLinks={form.socialLinks}
            onUpdate={(v: SocialLinks) => {
              update('socialLinks', v);
              handleClearFieldError('socialLinks');
            }}
            fieldErrors={fieldErrors}
            onClearFieldError={handleClearFieldError}
          />
        )}
      </div>

      <SetupWizardNav
        currentStep={currentStep - 1}
        totalSteps={5}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSaving={isLoading}
      />

      {/* Dialog validasi step — onAfterClose trigger scroll */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
        onAfterClose={handleValidationAfterClose}
      />

      {/* Upload guard dialog */}
      <ValidationDialog
        open={uploadGuardOpen}
        onClose={() => setUploadGuardOpen(false)}
        items={uploadGuardMessage ? [uploadGuardMessage] : []}
      />
    </div>
  );
}