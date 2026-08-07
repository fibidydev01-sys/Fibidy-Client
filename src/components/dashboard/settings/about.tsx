'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useTenant } from '@/hooks/dashboard/use-tenant';
import { useAuthStore } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import type { AboutFormData, FeatureItem } from '@/types/tenant';
import { StepHighlights } from './form/about/step-highlights';

// ============================================================================
// ABOUT SETTINGS SECTION
// File: src/components/dashboard/settings/about.tsx
//
// [BACKPORT — 2026-05-28]
//   1. Upload guard via onUploadStateChange dari StepHighlights (SETTINGS-N2)
//   2. ValidationDialog hard gate (SETTINGS-N1)
//   3. setTenant() setelah save (SETTINGS-N6)
// ============================================================================

interface AboutSectionProps {
  onBack?: () => void;
}

export function AboutSection({ onBack }: AboutSectionProps) {
  const t = useTranslations('settings.about');
  const tToast = useTranslations('toast.settings');
  const tAll = useTranslations();
  const { tenant, refresh } = useTenant();
  const { setTenant } = useAuthStore();
  const { isBusiness } = useSubscriptionPlan();

  const [isSaving, setIsSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Upload guard — track semua slot aktif dari StepHighlights
  const activeUploadsRef = useRef<Set<string>>(new Set());
  const [hasActiveUploads, setHasActiveUploads] = useState(false);

  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  const [formData, setFormData] = useState<AboutFormData | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (tenant && !isInitialized.current) {
      isInitialized.current = true;
      const features = (tenant.aboutFeatures as FeatureItem[]) || [];
      setFormData({
        aboutFeatures: features.filter(
          (f) => f && typeof f === 'object' && !Array.isArray(f),
        ),
      });
    }
  }, [tenant]);

  const updateFormData = <K extends keyof AboutFormData>(key: K, value: AboutFormData[K]) => {
    if (formData) setFormData({ ...formData, [key]: value });
  };

  const handleUploadStateChange = useCallback((slotId: string, active: boolean) => {
    if (active) {
      activeUploadsRef.current.add(slotId);
    } else {
      activeUploadsRef.current.delete(slotId);
    }
    setHasActiveUploads(activeUploadsRef.current.size > 0);
  }, []);

  const computeValidationErrors = useCallback((): string[] => {
    if (!formData) return [];
    const errors: string[] = [];
    const features = formData.aboutFeatures;
    if (features.length === 0) return errors;
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      if (!f.title?.trim()) {
        errors.push(t('validation.titleRequired', { index: i + 1 }));
      }
      if (!f.description?.trim()) {
        errors.push(t('validation.descriptionRequired', { index: i + 1 }));
      }
    }
    return errors;
  }, [formData, t]);

  const handleSave = async () => {
    if (!tenant || !formData) return;

    if (hasActiveUploads) {
      setValidationItems([t('validation.uploadInProgress')]);
      setValidationOpen(true);
      return;
    }

    const errors = computeValidationErrors();
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const result = await tenantsApi.update({ aboutFeatures: formData.aboutFeatures });
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('aboutSaved'));
    } catch (err) {
      toast.error(tToast('aboutFailed'), { description: getErrorMessage(err, tAll) });
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant || !formData) return null;

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto w-full">
      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        title={t('upgradePrompt.title')}
        description={t('upgradePrompt.description')}
      />

      {/* pb-20 (fixed-pill clearance) only matters below md; md:pb-6
          takes over from md up where WizardNav is `sticky`/in-flow and
          doesn't need an artificial reserve — see wizard-nav.tsx's v6
          note and contact.tsx's equivalent comment for the full story. */}
      <div className="flex-1 pb-20 md:pb-6">
        <StepHighlights
          formData={formData}
          updateFormData={updateFormData}
          isBusiness={isBusiness}
          onUpgrade={() => setUpgradeModalOpen(true)}
          onUploadStateChange={handleUploadStateChange}
        />
      </div>

      <WizardNav onBack={onBack} onSave={handleSave} isSaving={isSaving} />

      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
    </div>
  );
}
