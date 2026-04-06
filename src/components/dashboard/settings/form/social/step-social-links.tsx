'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/shared/utils';
import type { SocialFormData, SocialLinks } from '@/types/tenant';

const SOCIAL_GROUPS: {
  group: string;
  fields: { key: keyof SocialLinks; label: string; placeholder: string }[];
}[] = [
    {
      group: 'Social Media',
      fields: [
        { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
        { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/page' },
        { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@username' },
        { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@channel' },
        { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
        { key: 'threads', label: 'Threads', placeholder: 'https://threads.net/@username' },
      ],
    },
    {
      group: 'Messaging',
      fields: [
        { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/628xxxxxxxxxx' },
        { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/username' },
      ],
    },
    {
      group: 'Creative & Professional',
      fields: [
        { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/username' },
        { key: 'behance', label: 'Behance', placeholder: 'https://behance.net/username' },
        { key: 'dribbble', label: 'Dribbble', placeholder: 'https://dribbble.com/username' },
        { key: 'vimeo', label: 'Vimeo', placeholder: 'https://vimeo.com/username' },
        { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/name' },
      ],
    },
  ];

interface StepSocialLinksProps {
  formData: SocialFormData;
  onSocialLinkChange: (key: keyof SocialLinks, value: string) => void;
  isDesktop?: boolean;
}

export function StepSocialLinks({ formData, onSocialLinkChange, isDesktop = false }: StepSocialLinksProps) {

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div id="tour-social-links" className="space-y-7">
        {SOCIAL_GROUPS.map((group) => (
          <div key={group.group} className="space-y-3">
            <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground/60 border-b pb-1.5">
              {group.group}
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {group.fields.map(({ key, label, placeholder }) => {
                const val = formData.socialLinks[key] || '';
                const filled = Boolean(val);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label
                        htmlFor={`d-${key}`}
                        className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
                      >
                        {label}
                      </Label>
                      {filled && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <Input
                      id={`d-${key}`}
                      placeholder={placeholder}
                      value={val}
                      onChange={(e) => onSocialLinkChange(key, e.target.value)}
                      className="h-9 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/40"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-l-2 border-muted-foreground/20 pl-4 py-0.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Tip:</span>{' '}
            Social links appear in your store footer. Only add active accounts — fewer well-managed links are better than many inactive ones.
          </p>
        </div>
      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div id="tour-social-links" className="space-y-5 max-w-sm mx-auto">
      {SOCIAL_GROUPS.map((group) => (
        <div key={group.group} className="space-y-3">
          <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground/60 border-b pb-1.5">
            {group.group}
          </p>
          <div className="space-y-3">
            {group.fields.map(({ key, label, placeholder }) => {
              const val = formData.socialLinks[key] || '';
              const filled = Boolean(val);
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor={`m-${key}`}
                      className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
                    >
                      {label}
                    </Label>
                    {filled && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <Input
                    id={`m-${key}`}
                    placeholder={placeholder}
                    value={val}
                    onChange={(e) => onSocialLinkChange(key, e.target.value)}
                    className="h-9 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/40"
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