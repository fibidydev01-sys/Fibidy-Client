'use client';

// ============================================================================
// STEP SOCIAL — Setup Wizard Step 5
// File: src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-social.tsx
//
// Fields: socialLinks — at least 1 of 13 platforms required.
// Individual platforms are optional, but at least 1 must be filled.
// Shows active count indicator to guide seller.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SocialLinks } from '@/types/tenant';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepSocialProps {
  socialLinks: SocialLinks;
  onSocialLinkChange: (key: keyof SocialLinks, value: string) => void;
}

// ─── Platform Groups ──────────────────────────────────────────────────────────

interface FieldDef {
  key: keyof SocialLinks;
  i18nKey: string;
}

const SOCIAL_GROUPS: Array<{
  groupKey: 'socialMedia' | 'messaging' | 'creative';
  fields: FieldDef[];
}> = [
  {
    groupKey: 'socialMedia',
    fields: [
      { key: 'instagram', i18nKey: 'instagram' },
      { key: 'facebook', i18nKey: 'facebook' },
      { key: 'tiktok', i18nKey: 'tiktok' },
      { key: 'youtube', i18nKey: 'youtube' },
      { key: 'twitter', i18nKey: 'twitter' },
      { key: 'threads', i18nKey: 'threads' },
    ],
  },
  {
    groupKey: 'messaging',
    fields: [
      { key: 'whatsapp', i18nKey: 'whatsapp' },
      { key: 'telegram', i18nKey: 'telegram' },
    ],
  },
  {
    groupKey: 'creative',
    fields: [
      { key: 'pinterest', i18nKey: 'pinterest' },
      { key: 'behance', i18nKey: 'behance' },
      { key: 'dribbble', i18nKey: 'dribbble' },
      { key: 'vimeo', i18nKey: 'vimeo' },
      { key: 'linkedin', i18nKey: 'linkedin' },
    ],
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepSocial({
  socialLinks,
  onSocialLinkChange,
}: StepSocialProps) {
  const t = useTranslations('dashboard.setupStore.seller.social');
  const tFields = useTranslations('settings.social.fields');
  const tGroups = useTranslations('settings.social');

  const filledCount = Object.values(socialLinks).filter(
    (v) => typeof v === 'string' && v.trim().length > 0,
  ).length;

  const hasAtLeastOne = filledCount > 0;

  return (
    <div className="space-y-6 max-w-lg mx-auto">

      {/* Intro + Status */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {t('intro')}
        </p>

        {/* Filled count indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              hasAtLeastOne
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {hasAtLeastOne ? '✓' : '○'}{' '}
            {hasAtLeastOne
              ? t('statusFilled', { count: filledCount })
              : t('statusEmpty')}
          </div>
        </div>
      </div>

      {/* Platform Groups */}
      {SOCIAL_GROUPS.map((group) => (
        <div key={group.groupKey} className="space-y-3">
          <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground/60 border-b pb-1.5">
            {tGroups(`groups.${group.groupKey}`)}
          </p>

          <div className="space-y-3">
            {group.fields.map(({ key, i18nKey }) => {
              const val = socialLinks[key] || '';
              const filled = Boolean(val.trim());
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor={`wizard-social-${key}`}
                      className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
                    >
                      {tFields(`${i18nKey}.label`)}
                    </Label>
                    {filled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <Input
                    id={`wizard-social-${key}`}
                    placeholder={tFields(`${i18nKey}.placeholder`)}
                    value={val}
                    onChange={(e) => onSocialLinkChange(key, e.target.value)}
                    className="h-9 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/40"
                    type="url"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bottom reminder if empty */}
      {!hasAtLeastOne && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {t('emptyReminder')}
          </p>
        </div>
      )}

    </div>
  );
}
