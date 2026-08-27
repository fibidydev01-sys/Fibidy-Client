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
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';

// ============================================================================
// CONTACT SETTINGS SECTION
// File: src/components/dashboard/settings/contact.tsx
//
// [BACKPORT — 2026-05-28]
//   1. ValidationDialog hard gate (SETTINGS-N1)
//   2. setTenant() setelah save (SETTINGS-N6)
//   3. Map URL validation check sebelum save
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
  const { setTenant } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  const [formData, setFormData] = useState<ContactFormData | null>(null);
  const isInitialized = useRef(false);

  const STEPS = useMemo(
    () => [
      { title: t('info.title'),    desc: t('info.desc')    },
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

  const computeValidationErrors = useCallback((): string[] => {
    if (!formData) return [];
    const errors: string[] = [];
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
    <div className={cn('h-full flex flex-col', PAGE_COLUMN)}>
      {/* DESKTOP — always ≥lg (1024px), always inside WizardNav's `sticky`
          range (md+): no fixed-position pill to reserve clearance for, so
          just a small breathing-room gap instead of the mobile block's
          big reserve. */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex-1 min-h-[340px] pb-4">
          {currentStep === 0 && <StepContactInfo {...stepProps} isDesktop />}
          {currentStep === 1 && <StepLocation {...stepProps} isDesktop />}
          {currentStep === 2 && <StepSectionHeading {...stepProps} isDesktop />}
        </div>
      </div>

      {/* MOBILE — shown 0-1023px, spanning BOTH WizardNav position modes:
          pb-24 (big reserve) only applies below md, where the pill is
          `fixed`/out-of-flow and needs real clearance from scrolled
          content; md:pb-6 takes over from md up, where the pill is
          `sticky`/in-flow (tablet width already renders this "mobile"
          field layout below lg, but the pill itself is already sticky
          there) and an artificial 96px reserve was just dead space
          before the pill, not to mention the slack was long enough for
          the sticky-to-normal-flow handoff at the very end of a scroll
          to visibly shift/flick. */}
      <div className="lg:hidden flex flex-col pb-24 md:pb-6">
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

      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
    </div>
  );
}
