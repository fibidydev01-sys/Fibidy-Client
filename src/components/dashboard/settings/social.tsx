'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenant } from '@/hooks/shared/use-tenant';
import { tenantsApi } from '@/lib/api/tenants';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import type { SocialFormData, SocialLinks } from '@/types/tenant';
import { StepSocialLinks } from './form/social/step-social-links';

const DEFAULT_SOCIAL_LINKS: SocialLinks = {
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

interface SocialSectionProps {
  onBack?: () => void;
}

export function SocialSection({ onBack }: SocialSectionProps) {
  const { tenant, refresh } = useTenant();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<SocialFormData>(() => ({
    socialLinks: {
      ...DEFAULT_SOCIAL_LINKS,
      ...(tenant?.socialLinks as SocialLinks | null ?? {}),
    },
  }));

  const handleSocialLinkChange = (key: keyof SocialLinks, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const handleSave = async () => {
    if (!tenant) return;
    setIsSaving(true);
    try {
      await tenantsApi.update({ socialLinks: formData.socialLinks });
      await refresh();
      toast.success('Social links saved successfully');
    } catch {
      toast.error('Failed to save social links');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (tenant === null) {
    return (
      <div className="h-full flex flex-col max-w-2xl mx-auto w-full">
        <div className="hidden lg:flex lg:flex-col lg:h-full">
          <div className="flex-1 pb-20 min-h-[280px]">
            <div className="space-y-7">
              <div className="flex items-center gap-2">
                <Skeleton className="h-[11px] w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              {[6, 2, 5].map((count, gi) => (
                <div key={gi} className="space-y-3">
                  <Skeleton className="h-[11px] w-28 rounded-full" />
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {Array.from({ length: count }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <Skeleton className="h-[11px] w-20 rounded-full" />
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:hidden flex flex-col pb-24">
          <div className="space-y-3 max-w-sm mx-auto w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-[11px] w-20 rounded-full" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
        <WizardNav onBack={onBack} onSave={handleSave} isSaving={isSaving} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto w-full">

      {/* DESKTOP */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex-1 pb-20 min-h-[280px]">
          <StepSocialLinks formData={formData} onSocialLinkChange={handleSocialLinkChange} isDesktop />
        </div>
      </div>

      {/* MOBILE */}
      <div className="lg:hidden flex flex-col pb-24">
        <div className="min-h-[260px]">
          <StepSocialLinks formData={formData} onSocialLinkChange={handleSocialLinkChange} />
        </div>
      </div>

      <WizardNav onBack={onBack} onSave={handleSave} isSaving={isSaving} />
    </div>
  );
}