'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/shared/use-tenant';
import { tenantsApi } from '@/lib/api/tenants';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import type { ContactFormData } from '@/types/tenant';
import { StepContactInfo } from './form/contact/step-contact-info';
import { StepLocation } from './form/contact/step-location';
import { StepSectionHeading } from './form/contact/step-section-heading';

const STEPS = [
  { title: 'Contact Info', desc: 'WhatsApp, phone & address' },
  { title: 'Location & Map', desc: 'Google Maps embed for your store' },
  { title: 'Section Heading', desc: 'Title & subheading for contact section' },
] as const;

interface ContactSectionProps {
  onBack?: () => void;
}

export function ContactSection({ onBack }: ContactSectionProps) {
  const { tenant, refresh } = useTenant();
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ContactFormData | null>(null);
  const isInitialized = useRef(false);

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

  const handleSave = async () => {
    if (!tenant || !formData) return;
    setIsSaving(true);
    try {
      await tenantsApi.update({
        contactTitle: formData.contactTitle,
        contactSubtitle: formData.contactSubtitle,
        contactMapUrl: formData.contactMapUrl,
        contactShowMap: formData.contactShowMap,
        contactShowForm: formData.contactShowForm,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        address: formData.address || undefined,
      });
      await refresh();
      toast.success('Contact section saved successfully');
    } catch {
      toast.error('Failed to save contact section');
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
    </div>
  );
}