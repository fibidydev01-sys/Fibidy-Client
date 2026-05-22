'use client';

// ============================================================================
// SELLER SETUP WIZARD — Orchestrator
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-wizard.tsx
//
// [PHASE C v2 — May 2026]
// DIALOG STRATEGY:
//   - Next/Submit: SELALU ENABLED
//   - Klik dengan invalid → ValidationDialog (list errors)
//   - Tidak ada toast, tidak ada silent disabled button
//
// Soft alerts tetap inline:
//   - Char counters di step-story.tsx
//   - Icon URL hint di step-highlights.tsx
//   - Map URL invalid hint di step-contact-location.tsx
//   - Geolocation error di step-contact-location.tsx
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useCompleteSetup } from '@/hooks/dashboard/use-setup-store';
import { useSellerSetupAutofill } from './use-seller-setup-autofill';
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

// ── Validation — returns array of error strings (empty = valid) ───────────────

function getStepErrors(step: number, form: SellerWizardFormState): string[] {
  const errors: string[] = [];

  switch (step) {
    case 1:
      if (!form.logo) errors.push('Upload atau generate logo toko dulu');
      if (!form.primaryColor) errors.push('Pilih warna brand');
      if (!form.heroBackgroundImage) errors.push('Upload gambar hero dulu');
      break;
    case 2:
      if (form.heroTitle.trim().length < 5) errors.push('Headline minimal 5 karakter');
      if (form.heroSubtitle.trim().length < 10) errors.push('Tagline minimal 10 karakter');
      if (form.heroCtaText.trim().length < 2) errors.push('Teks tombol minimal 2 karakter');
      break;
    case 3:
      if (form.aboutFeatures.length !== 3) errors.push('Isi tepat 3 highlight');
      form.aboutFeatures.forEach((f, i) => {
        if (!f.icon) errors.push(`Highlight ${i + 1}: icon URL wajib diisi`);
        if (f.title.trim().length < 2) errors.push(`Highlight ${i + 1}: judul minimal 2 karakter`);
        if ((f.description ?? '').trim().length < 10)
          errors.push(`Highlight ${i + 1}: deskripsi minimal 10 karakter`);
      });
      break;
    case 4:
      if (!form.phone.trim()) errors.push('Nomor telepon wajib diisi');
      if (form.contactTitle.trim().length < 3) errors.push('Judul section minimal 3 karakter');
      if (form.contactSubtitle.trim().length < 5) errors.push('Subjudul section minimal 5 karakter');
      if (form.hasPhysicalLocation) {
        if (form.address.trim().length < 10) errors.push('Alamat minimal 10 karakter');
        const hasMap =
          form.contactMapUrl.trim().length > 0 ||
          (form.locationLat !== undefined && form.locationLng !== undefined);
        if (!hasMap) errors.push('Pin lokasi atau paste URL peta');
      }
      break;
    case 5: {
      const hasLink = Object.values(form.socialLinks).some(
        (v) => typeof v === 'string' && v.trim().length > 0,
      );
      if (!hasLink) errors.push('Minimal 1 link sosial wajib diisi');
      break;
    }
  }

  return errors;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SellerSetupWizard() {
  const t = useTranslations('dashboard.setupStore.seller');
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);
  const { completeSetup, isLoading, isDone } = useCompleteSetup();

  const locationType = useMemo(
    () => getCategoryConfig(tenant?.category ?? '')?.locationType ?? 'PHYSICAL',
    [tenant?.category],
  );

  const defaultHasPhysicalLocation = locationType !== 'ONLINE';

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<SellerWizardFormState>({
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
  });

  // Validation dialog
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  // ── Autofill ────────────────────────────────────────────────────────────
  const autofill = useSellerSetupAutofill(tenant?.category ?? '', tenant?.name ?? '');
  const [autofilledFields, setAutofilledFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!tenant?.category) return;
    const fields = new Set<string>();

    setForm((prev) => {
      const next = { ...prev };

      if (!prev.primaryColor || prev.primaryColor === '#8B4513') {
        next.primaryColor = autofill.primaryColor;
        fields.add('primaryColor');
      }
      if (!prev.heroBackgroundImage) {
        next.heroBackgroundImage = autofill.heroBackgroundImage;
        fields.add('heroBackgroundImage');
      }
      if (!prev.heroTitle) {
        next.heroTitle = autofill.heroTitle;
        fields.add('heroTitle');
      }
      if (!prev.heroSubtitle) {
        next.heroSubtitle = autofill.heroSubtitle;
        fields.add('heroSubtitle');
      }
      if (!prev.heroCtaText) {
        next.heroCtaText = autofill.heroCtaText;
        fields.add('heroCtaText');
      }
      if (prev.aboutFeatures.length !== 3) {
        next.aboutFeatures = autofill.aboutFeatures;
        fields.add('aboutFeatures');
      }
      if (!prev.contactTitle) {
        next.contactTitle = autofill.contactTitle;
        fields.add('contactTitle');
      }
      if (!prev.contactSubtitle) {
        next.contactSubtitle = autofill.contactSubtitle;
        fields.add('contactSubtitle');
      }

      return next;
    });

    setAutofilledFields(fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.category]);

  const isAutofilled = (field: string) => autofilledFields.has(field);

  // ── Field updater ────────────────────────────────────────────────────────
  const update = <K extends keyof SellerWizardFormState>(
    key: K,
    value: SellerWizardFormState[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  // ── Navigation — show dialog if invalid ─────────────────────────────────
  const handleNext = () => {
    const errors = getStepErrors(currentStep, form);
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }
    if (currentStep < 5) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errors = getStepErrors(currentStep, form);
    if (errors.length > 0) {
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
  };

  // ── Done screen ──────────────────────────────────────────────────────────
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
    <div className="max-w-3xl mx-auto pb-32">
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
            onLogoChange={(v: string) => update('logo', v)}
            onColorChange={(v: string) => update('primaryColor', v)}
            onHeroBgChange={(v: string) => update('heroBackgroundImage', v)}
            isAutofilled={isAutofilled}
          />
        )}
        {currentStep === 2 && (
          <StepStory
            heroTitle={form.heroTitle}
            heroSubtitle={form.heroSubtitle}
            heroCtaText={form.heroCtaText}
            onHeroTitleChange={(v: string) => update('heroTitle', v)}
            onHeroSubtitleChange={(v: string) => update('heroSubtitle', v)}
            onHeroCtaTextChange={(v: string) => update('heroCtaText', v)}
            isAutofilled={isAutofilled}
          />
        )}
        {currentStep === 3 && (
          <StepHighlights
            items={form.aboutFeatures}
            onChange={(v: FeatureItem[]) => update('aboutFeatures', v)}
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
            hasPhysicalLocation={form.hasPhysicalLocation}
            locationLat={form.locationLat}
            locationLng={form.locationLng}
            locationType={locationType}
            onContactTitleChange={(v: string) => update('contactTitle', v)}
            onContactSubtitleChange={(v: string) => update('contactSubtitle', v)}
            onPhoneChange={(v: string) => update('phone', v)}
            onAddressChange={(v: string) => update('address', v)}
            onContactMapUrlChange={(v: string) => update('contactMapUrl', v)}
            onHasPhysicalLocationChange={(v: boolean) => update('hasPhysicalLocation', v)}
            onLocationCoordsChange={(lat: number | undefined, lng: number | undefined) => {
              setForm((p) => ({ ...p, locationLat: lat, locationLng: lng }));
            }}
            isAutofilled={isAutofilled}
          />
        )}
        {currentStep === 5 && (
          <StepSocial
            socialLinks={form.socialLinks}
            onUpdate={(v: SocialLinks) => update('socialLinks', v)}
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

      {/* Validation Dialog */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
    </div>
  );
}
