'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useTenant } from '@/hooks/dashboard/use-tenant';
import { useAuthStore } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import { THEME_COLORS } from '@/lib/constants/shared/theme-colors';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import type { HeroFormData } from '@/types/tenant';
import { StepIdentity } from './form/hero/step-identity';
import { StepStory } from './form/hero/step-story';
import { StepAppearance } from './form/hero/step-appearance';

// ============================================================================
// HERO SETTINGS SECTION
// File: src/components/dashboard/settings/hero.tsx
//
// [BACKPORT — 2026-05-28]
// Sync dengan pola terbaru dari Setup wizard:
//
//   1. OfflineAwareButton via WizardNav (sudah handle di WizardNav)
//   2. Upload-in-progress guard sebelum save (SETTINGS-N2)
//   3. ValidationDialog hard gate sebelum save (SETTINGS-N1)
//   4. setTenant() via useAuthStore setelah save agar sidebar sync (SETTINGS-N6)
//   5. useState initializer pattern, hapus isInitialized ref (SETTINGS-N3)
//
// [v4 cleanup — 2026-05-15]
//   - Removed heroCtaLink dari form init dan save payload.
// ============================================================================

interface HeroSectionProps {
  onBack?: () => void;
}

export function HeroSection({ onBack }: HeroSectionProps) {
  const t = useTranslations('settings.hero.stepsMeta');
  const tToast = useTranslations('toast.settings');
  const tErrors = useTranslations('settings.hero');
  const tAll = useTranslations();
  const { tenant, refresh } = useTenant();

  // [SETTINGS-N6] Akses setTenant untuk sync auth store setelah save
  const { setTenant } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const [isRemovingHeroBg, setIsRemovingHeroBg] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // [SETTINGS-N2] Track upload state per slot
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHeroBg, setIsUploadingHeroBg] = useState(false);

  // [SETTINGS-N1] ValidationDialog state
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  // [SETTINGS-N3] useState initializer — hapus isInitialized ref
  const [formData, setFormData] = useState<HeroFormData | null>(() => {
    if (!tenant) return null;
    const themeData = tenant.theme as { primaryColor?: string } | null;
    return {
      name: tenant.name || '',
      description: tenant.description || '',
      heroTitle: tenant.heroTitle || '',
      heroSubtitle: tenant.heroSubtitle || '',
      heroCtaText: tenant.heroCtaText || '',
      heroBackgroundImage: tenant.heroBackgroundImage || '',
      logo: tenant.logo || '',
      primaryColor: themeData?.primaryColor || THEME_COLORS[0].value,
      category: tenant.category || '',
    };
  });

  // Sync formData saat tenant pertama kali tersedia (SSR/lazy load)
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
        heroBackgroundImage: tenant.heroBackgroundImage || '',
        logo: tenant.logo || '',
        primaryColor: themeData?.primaryColor || THEME_COLORS[0].value,
        category: tenant.category || '',
      });
    }
  }, [tenant]);

  const STEPS = useMemo(
    () => [
      { title: t('identity.title'), desc: t('identity.desc') },
      { title: t('story.title'), desc: t('story.desc') },
      { title: t('appearance.title'), desc: t('appearance.desc') },
    ],
    [t],
  );

  const updateFormData = <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => {
    if (formData) setFormData({ ...formData, [key]: value });
  };

  // [SETTINGS-N1] Validasi sebelum save
  const computeValidationErrors = useCallback((): string[] => {
    if (!formData) return [];
    const errors: string[] = [];
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.push(tErrors('validation.nameRequired'));
    }
    return errors;
  }, [formData, tErrors]);

  // [SETTINGS-N2] Guard: cek upload in-progress
  const checkUploadGuard = useCallback((): boolean => {
    if (isUploadingLogo || isUploadingHeroBg) {
      setValidationItems([tErrors('validation.uploadInProgress')]);
      setValidationOpen(true);
      return false;
    }
    return true;
  }, [isUploadingLogo, isUploadingHeroBg, tErrors]);

  const handleRemoveLogo = async () => {
    if (!tenant || !formData) return;
    setIsRemovingLogo(true);
    try {
      setFormData({ ...formData, logo: '' });
      const result = await tenantsApi.update({ logo: '' });
      // [SETTINGS-N6] Sync auth store
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('logoRemoved'));
    } catch (err) {
      toast.error(tToast('logoRemoveFailed'));
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
      const result = await tenantsApi.update({ heroBackgroundImage: '' });
      // [SETTINGS-N6] Sync auth store
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('heroBgRemoved'));
    } catch (err) {
      toast.error(tToast('heroBgRemoveFailed'));
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

    // [SETTINGS-N2] Upload guard dulu
    if (!checkUploadGuard()) return;

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
        name: formData.name || undefined,
        description: formData.description || undefined,
        heroTitle: formData.heroTitle,
        heroSubtitle: formData.heroSubtitle,
        heroCtaText: formData.heroCtaText,
        heroBackgroundImage: formData.heroBackgroundImage,
        logo: formData.logo || undefined,
        theme: { primaryColor: formData.primaryColor },
      });
      // [SETTINGS-N6] Sync auth store agar sidebar/header langsung update
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('heroSaved'));
    } catch (err) {
      toast.error(tToast('heroFailed'), { description: getErrorMessage(err, tAll) });
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
          onUploadStateChange={(slot, active) => {
            if (slot === 'logo') setIsUploadingLogo(active);
            if (slot === 'heroBg') setIsUploadingHeroBg(active);
          }}
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

      {/* [SETTINGS-N1] ValidationDialog hard gate */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
    </div>
  );
}
