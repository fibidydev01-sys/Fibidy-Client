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
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';

// ============================================================================
// SOCIAL SETTINGS SECTION
// File: src/components/dashboard/settings/social.tsx
//
// [BACKPORT — 2026-05-28]
//   1. ValidationDialog hard gate — min 1 social link (SETTINGS-N1)
//   2. setTenant() setelah save (SETTINGS-N6)
//   3. getErrorMessage(err, tAll)
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
  const { setTenant } = useAuthStore();

  const [isSaving, setIsSaving] = useState(false);

  const [validationOpen, setValidationOpen] = useState(false);
  const [validationItems, setValidationItems] = useState<string[]>([]);

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

    const errors = computeValidationErrors();
    if (errors.length > 0) {
      setValidationItems(errors);
      setValidationOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const result = await tenantsApi.update({ socialLinks: formData.socialLinks });
      setTenant(result.tenant);
      await refresh();
      toast.success(tToast('socialSaved'));
    } catch (err) {
      toast.error(tToast('socialFailed'), { description: getErrorMessage(err, tAll) });
    } finally {
      setIsSaving(false);
    }
  };

  if (tenant === null) {
    return (
      <div className={cn('h-full flex flex-col', PAGE_COLUMN)}>
        <div className="hidden lg:flex lg:flex-col lg:h-full">
          <div className="flex-1 pb-4 min-h-[280px]">
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
                        <Skeleton className="h-[var(--field-height)] w-full rounded-[var(--shape-field)]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:hidden flex flex-col pb-24 md:pb-6">
          {/* [LEBAR KONSISTEN] `max-w-sm mx-auto` dilepas: di tablet skeleton
              ini 384px sementara isi aslinya 672px, jadi kerangkanya
              melompat begitu data datang. Cabang loading dan cabang isi
              harus punya kotak yang sama — alasan yang sama dipakai
              KasirPageShell saat menyatukan wrapper tiap cabangnya. */}
          <div className="space-y-3 w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-[11px] w-20 rounded-full" />
                <Skeleton className="h-[var(--field-height)] w-full rounded-[var(--shape-field)]" />
              </div>
            ))}
          </div>
        </div>
        <WizardNav onBack={onBack} onSave={handleSave} isSaving={isSaving} />
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col', PAGE_COLUMN)}>
      {/* DESKTOP — always ≥lg, always within WizardNav's `sticky` range:
          small breathing-room gap, no fixed-pill clearance needed. */}
      <div className="hidden lg:flex lg:flex-col lg:h-full">
        <div className="flex-1 pb-4 min-h-[280px]">
          <StepSocialLinks formData={formData} onSocialLinkChange={handleSocialLinkChange} isDesktop />
        </div>
      </div>

      {/* MOBILE — shown 0-1023px, spans both WizardNav position modes.
          pb-24 (fixed-pill clearance) only matters below md; md:pb-6
          takes over from md up (sticky, in-flow — the old unconditional
          pb-24 was 96px of dead space before the pill on tablet width,
          slack long enough that the sticky-to-flow handoff at the very
          end of a scroll visibly shifted). */}
      <div className="lg:hidden flex flex-col pb-24 md:pb-6">
        <div className="min-h-[260px]">
          <StepSocialLinks formData={formData} onSocialLinkChange={handleSocialLinkChange} />
        </div>
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
