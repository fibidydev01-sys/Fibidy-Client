'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/shared/use-tenant';
import { tenantsApi } from '@/lib/api/tenants';
import { THEME_COLORS } from '@/lib/constants/shared/theme-colors';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import type { HeroFormData } from '@/types/tenant';
import { StepIdentity } from './form/hero/step-identity';
import { StepStory } from './form/hero/step-story';
import { StepAppearance } from './form/hero/step-appearance';

const STEPS = [
  { title: 'Brand Identity', desc: 'Name, category & CTA button' },
  { title: 'Brand Story', desc: 'Headline & description' },
  { title: 'Appearance', desc: 'Colors, logo & background' },
] as const;

interface HeroSectionProps {
  onBack?: () => void;
}

export function HeroSection({ onBack }: HeroSectionProps) {
  const { tenant, refresh } = useTenant();
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const [isRemovingHeroBg, setIsRemovingHeroBg] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<HeroFormData | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (tenant && !isInitialized.current) {
      isInitialized.current = true;
      const themeData = tenant.theme as { primaryColor?: string } | null;
      setFormData({
        name: tenant.name || '',
        description: tenant.description || '',
        heroTitle: tenant.heroTitle || '',
        heroSubtitle: tenant.heroSubtitle || '',
        heroCtaText: tenant.heroCtaText || '',
        heroCtaLink: tenant.heroCtaLink || '/products',
        heroBackgroundImage: tenant.heroBackgroundImage || '',
        logo: tenant.logo || '',
        primaryColor: themeData?.primaryColor || THEME_COLORS[0].value,
        category: tenant.category || '',
      });
    }
  }, [tenant]);

  const updateFormData = <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => {
    if (formData) setFormData({ ...formData, [key]: value });
  };

  const handleRemoveLogo = async () => {
    if (!tenant || !formData) return;
    setIsRemovingLogo(true);
    try {
      setFormData({ ...formData, logo: '' });
      await tenantsApi.update({ logo: '' });
      await refresh();
      toast.success('Logo removed successfully');
    } catch {
      toast.error('Failed to remove logo');
      setFormData({ ...formData, logo: tenant.logo || '' });
    } finally {
      setIsRemovingLogo(false);
    }
  };

  const handleRemoveHeroBg = async () => {
    if (!tenant || !formData) return;
    setIsRemovingHeroBg(true);
    try {
      setFormData({ ...formData, heroBackgroundImage: '' });
      await tenantsApi.update({ heroBackgroundImage: '' });
      await refresh();
      toast.success('Background image removed successfully');
    } catch {
      toast.error('Failed to remove background image');
      setFormData({ ...formData, heroBackgroundImage: tenant.heroBackgroundImage || '' });
    } finally {
      setIsRemovingHeroBg(false);
    }
  };

  const handleCtaTextChange = (value: string) => {
    if (value.length > 15) return;
    if (value.split(/\s+/).filter(Boolean).length > 2) return;
    updateFormData('heroCtaText', value);
  };

  const handleSave = async () => {
    if (!tenant || !formData) return;
    setIsSaving(true);
    try {
      await tenantsApi.update({
        name: formData.name || undefined,
        description: formData.description || undefined,
        heroTitle: formData.heroTitle,
        heroSubtitle: formData.heroSubtitle,
        heroCtaText: formData.heroCtaText,
        heroCtaLink: formData.heroCtaLink || '/products',
        heroBackgroundImage: formData.heroBackgroundImage,
        logo: formData.logo || undefined,
        theme: { primaryColor: formData.primaryColor },
      });
      await refresh();
      toast.success('Hero section saved successfully');
    } catch {
      toast.error('Failed to save hero section');
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant || !formData) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <StepIdentity
          formData={formData}
          updateFormData={updateFormData}
          tenantEmail={tenant.email || ''}
          tenantSlug={tenant.slug || ''}
          onCtaTextChange={handleCtaTextChange}
        />
      );
      case 1: return <StepStory formData={formData} updateFormData={updateFormData} />;
      case 2: return (
        <StepAppearance
          formData={formData}
          updateFormData={updateFormData}
          onRemoveHeroBg={handleRemoveHeroBg}
          isRemovingHeroBg={isRemovingHeroBg}
          onRemoveLogo={handleRemoveLogo}
          isRemovingLogo={isRemovingLogo}
        />
      );
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-[300px] pb-20">
        {renderStep()}
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