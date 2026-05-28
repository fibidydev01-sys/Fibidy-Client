'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useTenant } from '@/hooks/dashboard/use-tenant';
import { useAuthStore } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import type { ContactFormData } from '@/types/tenant';
import { StepContactInfo } from './form/contact/step-contact-info';
import { StepLocation } from './form/contact/step-location';
import { StepSectionHeading } from './form/contact/step-section-heading';

// ============================================================================
// CONTACT SETTINGS SECTION
// File: src/components/dashboard/settings/contact.tsx
//
// [BACKPORT — 2026-05-28]
// Sync dengan pola terbaru dari Setup wizard:
//
//   1. ValidationDialog hard gate menggantikan inline toast (SETTINGS-N1)
//   2. setTenant() via useAuthStore setelah save agar auth store sync (SETTINGS-N6)
//   3. Tidak ada upload di Contact, jadi tidak perlu upload guard (SETTINGS-N2 N/A)
// ============================================================================

interface ContactSectionProps {
  onBack?: () => void;
}

export function ContactSection({ onBack }: ContactSectionProps) {
  const t = useTranslations('settings.contact.stepsMeta');
  const tValidation = useTranslations('settings.contact');
  const tToast = useTranslations('toast.settings');
  const tAll = useTranslations();
  const { tenant, refresh } = useTenant();

  // [SETTINGS-N6] Akses setTenant untuk sync auth store setelah save
  const { setTenant } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // [SETTINGS-N1] ValidationDialog state
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  const [formData, setFormData] = useState<ContactFormData | null>(null);
  const isInitialized = useRef(false);

  const STEPS = useMemo(
    () => [
      { title: t('info.title'), desc: t('info.desc') },
      { title: t('location.title'), desc: t('location.desc') },
      { title: t('heading.title'), desc: t('heading.desc') },
    ],
    [t],
  );

  useEffect(() => {
    if (tenant && !isInitialized.current) {
      isInitialized.current = true;
      setFormData({
        contactTitle: tenant.contactTitle || '',
        contactSubtitle: tenant.contactSubtitle || '',
        contactMapUrl: tenant.contactMapUrl || '',
        contactShowMap: tenant.contactShowMap ?? false,
        contactShowForm: tenant.contactShowForm ?? true,
        phone: tenant.phone || '',
        whatsapp: tenant.whatsapp || '',
        address: tenant.address || '',
      });
    }
  }, [tenant]);

  const updateFormData = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    if (formData) setFormData({ ...formData, [key]: value });
  };

  // [SETTINGS-N1] Compute validation errors — minimal check untuk contact
  const computeValidationErrors = useCallback((): string[] => {
    if (!formData) return [];
    const errors: string[] = [];
    // Map URL: jika diisi harus format embed yang valid
    if (
      formData.contactMapUrl.trim().length > 0 &&
      !formData.contactMapUrl.startsWith('https://www.google.com/maps/embed')
    ) {
      errors.push(tValidation('validation.mapUrlInvalid'));
    }
    return errors;
  }, [formData, tValidation]);

  const handleSave = async () => {
    if (!tenant || !formData) return;

    // [SETTINGS-N1] Validation hard gate
    const errors = computeValidationErrors();
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const result = await tenantsApi.update({
        contactTitle: formData.contactTitle,
        contactSubtitle: formData.contactSubtitle,
        contactMapUrl: formData.contactMapUrl,
        contactShowMap: formData.contactShowMap,
        contactShowForm: formData.contactShowForm,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        address: formData.address || undefined,
      });
      // [SETTINGS-N6] Sync auth store
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('contactSaved'));
    } catch (err) {
      toast.error(tToast('contactFailed'), { description: getErrorMessage(err, tAll) });
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant || !formData) return null;

  const stepProps = { formData: formData!, updateFormData };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto w-full">

      {/* DESKTOP */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex-1 min-h-[340px] pb-20">
          {currentStep === 0 && <StepContactInfo {...stepProps} isDesktop />}
          {currentStep === 1 && <StepLocation {...stepProps} isDesktop />}
          {currentStep === 2 && <StepSectionHeading {...stepProps} isDesktop />}
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col pb-24">
        <div className="min-h-[300px]">
          {currentStep === 0 && <StepContactInfo {...stepProps} />}
          {currentStep === 1 && <StepLocation {...stepProps} />}
          {currentStep === 2 && <StepSectionHeading {...stepProps} />}
        </div>
      </div>

      <WizardNav
        steps={STEPS}
        currentStep={currentStep}
        onBack={onBack}
        onPrev={() => setCurrentStep((p) => p - 1)}
        onNext={() => setCurrentStep((p) => p + 1)}
        onSave={handleSave}
        isSaving={isSaving}
      />

      {/* [SETTINGS-N1] ValidationDialog hard gate */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
    </div>
  );
}
