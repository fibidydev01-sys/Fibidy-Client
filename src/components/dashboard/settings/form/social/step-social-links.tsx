'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SocialFormData, SocialLinks } from '@/types/tenant';

// Field mapping — uses settings.social.fields.* keys for label/placeholder
interface FieldDef {
  key: keyof SocialLinks;
  // translation key suffix under settings.social.fields.<key>.{label,placeholder}
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

interface StepSocialLinksProps {
  formData: SocialFormData;
  onSocialLinkChange: (key: keyof SocialLinks, value: string) => void;
  isDesktop?: boolean;
}

export function StepSocialLinks({ formData, onSocialLinkChange, isDesktop = false }: StepSocialLinksProps) {
  const t = useTranslations('settings.social');
  const tFields = useTranslations('settings.social.fields');

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div id="tour-social-links" className="space-y-7">
        {SOCIAL_GROUPS.map((group) => (
          <div key={group.groupKey} className="space-y-3">
            <p className="text-caption-uppercase caption-uppercase text-muted-foreground/60 border-b pb-1.5">
              {t(`groups.${group.groupKey}`)}
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {group.fields.map(({ key, i18nKey }) => {
                const val = formData.socialLinks[key] || '';
                const filled = Boolean(val);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor={`d-${key}`}
                      >
                        {tFields(`${i18nKey}.label`)}
                      </Label>
                      {filled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <Input
                      id={`d-${key}`}
                      placeholder={tFields(`${i18nKey}.placeholder`)}
                      value={val}
                      onChange={(e) => onSocialLinkChange(key, e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-l-2 border-muted-foreground/20 pl-4 py-0.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{t('tipLabel')}</span>{' '}
            {t('tipBody')}
          </p>
        </div>
      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    // [LEBAR KONSISTEN] `max-w-sm mx-auto` dilepas. Varian ini tampil
    // 0–1023px, jadi ia juga yang dipakai TABLET — dan di sana 384px itu
    // duduk di tengah kolom 672px, meleset 144px dari pill WizardNav di
    // bawahnya. Di ponsel tidak ada bedanya (358px < 384px), jadi yang
    // diperbaiki cuma tablet.
    <div id="tour-social-links" className="space-y-5">
      {SOCIAL_GROUPS.map((group) => (
        <div key={group.groupKey} className="space-y-3">
          <p className="text-caption-uppercase caption-uppercase text-muted-foreground/60 border-b pb-1.5">
            {t(`groups.${group.groupKey}`)}
          </p>
          {/* gap-3 == space-y-3 saat satu kolom, jadi tampilan ponsel persis
              seperti sebelumnya; dua kolom baru muncul dari md ke atas. */}
          <div className="grid gap-3 md:grid-cols-2">
            {group.fields.map(({ key, i18nKey }) => {
              const val = formData.socialLinks[key] || '';
              const filled = Boolean(val);
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor={`m-${key}`}
                    >
                      {tFields(`${i18nKey}.label`)}
                    </Label>
                    {filled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <Input
                    id={`m-${key}`}
                    placeholder={tFields(`${i18nKey}.placeholder`)}
                    value={val}
                    onChange={(e) => onSocialLinkChange(key, e.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
