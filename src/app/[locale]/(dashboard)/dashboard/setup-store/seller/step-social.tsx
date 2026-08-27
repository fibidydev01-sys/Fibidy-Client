'use client';

// ============================================================================
// STEP SOCIAL — Setup Wizard Step 5
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-social.tsx
//
// [SPRINT 5 — SCROLL FIX]
// Tambah data-field-error="true" ke social links container saat error.
// scrollToFirstFieldError() akan scroll ke container ini jika semua
// social links kosong.
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// [PHASE C FIX] Prop normalized: onChange → onUpdate
// ============================================================================

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/shared/utils';
import type { SocialLinks } from '@/types/tenant';
import {
  FormSection,
  FormPanel,
  PANEL_FIELDS_2,
} from '@/components/dashboard/shared/form-panel';

interface StepSocialProps {
  socialLinks: SocialLinks;
  onUpdate: (links: SocialLinks) => void;
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

const SOCIAL_FIELDS: Array<{ key: keyof SocialLinks; label: string; placeholder: string }> = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourstore' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourstore' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourstore' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/628123456789' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourstore' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/yourstore' },
  { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/yourstore' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourstore' },
];

export function StepSocial({
  socialLinks,
  onUpdate,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepSocialProps) {
  const t = useTranslations('dashboard.setupStore.seller.social');

  const hasSocialError = fieldErrors.has('socialLinks');

  const filledCount = Object.values(socialLinks).filter(
    (v) => typeof v === 'string' && v.trim().length > 0,
  ).length;

  const handleChange = (key: keyof SocialLinks, value: string) => {
    const updated = { ...socialLinks, [key]: value || undefined };
    onUpdate(updated);
    if (hasSocialError && value.trim().length > 0) {
      onClearFieldError?.('socialLinks');
    }
  };

  return (
    // [PRESISI] Dulu intro, pil status, dan dua paragraf pengingat semuanya
    // ANAK LANGSUNG grid dua kolom — empat sel terpakai sebelum satu pun
    // isian muncul. Sekarang intro dan pil naik ke kepala langkah, dan
    // kedelapan tautan tinggal di satu panel dengan grid seragam di dalamnya.
    <FormSection
      intro={t('intro')}
      badge={
        <span
          className={cn(
            'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            hasSocialError && 'border-destructive/50 bg-destructive/5',
          )}
        >
          {filledCount > 0 ? (
            <span className="text-emerald-600">
              {t('statusFilled', { count: filledCount })}
            </span>
          ) : (
            <span className="text-destructive">{t('statusEmpty')}</span>
          )}
        </span>
      }
    >
      <FormPanel
        wide
        title={t('linksTitle')}
        description={
          filledCount === 0 ? (
            <span className="font-medium text-destructive">
              {t('emptyReminder')}
            </span>
          ) : undefined
        }
      >
        {/*
          [SCROLL FIX] data-field-error di wadah tautan.
          scrollToFirstFieldError() mendarat di sini saat semuanya kosong.
        */}
        <div
          className={cn(
            PANEL_FIELDS_2,
            'rounded-lg transition-all',
            hasSocialError && 'ring-2 ring-destructive ring-offset-2',
          )}
          data-field-error={hasSocialError ? 'true' : undefined}
        >
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label
                htmlFor={`social-${key}`}
              >
                {label}
              </Label>
              <Input
                id={`social-${key}`}
                type="url"
                placeholder={placeholder}
                value={socialLinks[key] ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </FormPanel>
    </FormSection>
  );
}
