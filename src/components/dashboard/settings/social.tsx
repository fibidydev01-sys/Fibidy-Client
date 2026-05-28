'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenant } from '@/hooks/dashboard/use-tenant';
import { useAuthStore } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { ValidationDialog } from '@/components/ui/validation-dialog';
import type { SocialFormData, SocialLinks } from '@/types/tenant';
import { StepSocialLinks } from './form/social/step-social-links';

// ============================================================================
// SOCIAL SETTINGS SECTION
// File: src/components/dashboard/settings/social.tsx
//
// [BACKPORT — 2026-05-28]
// Sync dengan pola terbaru dari Setup wizard:
//
//   1. ValidationDialog hard gate — at least 1 social link required (SETTINGS-N1)
//   2. setTenant() via useAuthStore setelah save agar auth store sync (SETTINGS-N6)
//   3. useState initializer pattern sudah benar di file ini — dipertahankan (SETTINGS-N3 ✅)
//   4. getErrorMessage(err, tAll) untuk translasi error dari BE (SETTINGS consistency)
// ============================================================================

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
  const tToast = useTranslations('toast.settings');
  const tValidation = useTranslations('settings.social');
  const tAll = useTranslations();
  const { tenant, refresh } = useTenant();

  // [SETTINGS-N6] Akses setTenant untuk sync auth store setelah save
  const { setTenant } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);

  // [SETTINGS-N1] ValidationDialog state
  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

  // useState initializer pattern — sudah benar, dipertahankan
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

  // [SETTINGS-N1] Compute validation errors
  const computeValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];
    const hasLink = Object.values(formData.socialLinks).some(
      (v) => typeof v === 'string' && v.trim().length > 0,
    );
    if (!hasLink) {
      errors.push(tValidation('validation.minOneRequired'));
    }
    return errors;
  }, [formData, tValidation]);

  const handleSave = async () => {
    if (!tenant) return;

    // [SETTINGS-N1] Validation hard gate — minimal 1 social link
    const errors = computeValidationErrors();
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const result = await tenantsApi.update({ socialLinks: formData.socialLinks });
      // [SETTINGS-N6] Sync auth store
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('socialSaved'));
    } catch (err) {
      toast.error(tToast('socialFailed'), { description: getErrorMessage(err, tAll) });
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

      {/* [SETTINGS-N1] ValidationDialog hard gate */}
      <ValidationDialog
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        items={validationItems}
      />
    </div>
  );
}
