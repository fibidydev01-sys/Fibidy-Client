'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/shared/use-tenant';
import { tenantsApi } from '@/lib/api/tenants';
import { useSubscriptionPlan } from '@/hooks/dashboard/use-subscription-plan';
import { UpgradeModal } from '@/components/dashboard/shared/upgrade-modal';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import type { AboutFormData, FeatureItem } from '@/types/tenant';
import { StepHighlights } from './form/about/step-highlights';

interface AboutSectionProps {
  onBack?: () => void;
}

export function AboutSection({ onBack }: AboutSectionProps) {
  const { tenant, refresh } = useTenant();
  const { isBusiness } = useSubscriptionPlan();
  const [isSaving, setIsSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [formData, setFormData] = useState<AboutFormData | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (tenant && !isInitialized.current) {
      isInitialized.current = true;
      const features = (tenant.aboutFeatures as FeatureItem[]) || [];
      setFormData({
        aboutFeatures: features.filter(
          (f) => f && typeof f === 'object' && !Array.isArray(f)
        ),
      });
    }
  }, [tenant]);

  const updateFormData = <K extends keyof AboutFormData>(key: K, value: AboutFormData[K]) => {
    if (formData) setFormData({ ...formData, [key]: value });
  };

  const validate = (): boolean => {
    if (!formData) return false;
    const features = formData.aboutFeatures;
    if (features.length === 0) return true;
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      const num = `#${i + 1}`;
      if (!f.title?.trim()) {
        toast.error(`Highlight ${num}: Title is required`);
        return false;
      }
      if (!f.description?.trim()) {
        toast.error(`Highlight ${num}: Description is required`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!tenant || !formData || !validate()) return;
    setIsSaving(true);
    try {
      await tenantsApi.update({ aboutFeatures: formData.aboutFeatures });
      await refresh();
      toast.success('Highlights saved successfully');
    } catch {
      toast.error('Failed to save highlights');
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
        title="Upgrade untuk lebih banyak highlights"
        description="Business Plan memungkinkan hingga 7 highlights. Tampilkan lebih banyak keunggulan toko kamu."
      />

      <div className="flex-1 pb-20">
        <StepHighlights
          formData={formData}
          updateFormData={updateFormData}
          isBusiness={isBusiness}
          onUpgrade={() => setUpgradeModalOpen(true)}
        />
      </div>

      <WizardNav onBack={onBack} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}