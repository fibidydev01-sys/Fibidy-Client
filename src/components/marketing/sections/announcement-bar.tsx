'use client';

// ==========================================
// ANNOUNCEMENT BAR
// File: src/components/marketing/sections/announcement-bar.tsx
//
// Thin promo strip at the very top of the page. Driven entirely
// by lib/data/marketing/announcement.ts — when `active: false`,
// this component returns null and renders nothing (zero cost
// beyond the import).
//
// Dismiss persistence: in-memory useState only. Refresh = banner
// returns. This is the deliberate Phase 1 trade-off (HANDOFF §3.13
// option A). Promote to cookie-based persist only if banner-fatigue
// is measurable.
//
// Mobile vs desktop copy: marketing.announcement.messageMobile is
// shown on narrow screens (truncated label). Desktop gets the full
// message. Both keys translatable.
//
// Why client component: useState for dismiss + the link href is
// fine in a server component, but the dismiss button needs an
// onClick handler.
// ==========================================

import { X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { announcement } from '@/lib/data/marketing/announcement';
import { Button } from '@/components/ui/button';

export function AnnouncementBar() {
  const t = useTranslations('marketing.announcement');
  const [dismissed, setDismissed] = useState(false);

  if (!announcement.active || dismissed) return null;

  const Inner = (
    <>
      <span className="hidden sm:inline">{t('messageDesktop')}</span>
      <span className="sm:hidden">{t('messageMobile')}</span>
      {announcement.href && (
        <span className="ml-2 underline underline-offset-2">
          {t('ctaLabel')} →
        </span>
      )}
    </>
  );

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container mx-auto flex items-center justify-center gap-3 px-4 py-2 text-xs font-medium sm:text-sm">
        {announcement.href ? (
          <Link
            href={announcement.href}
            className="flex items-center transition-opacity hover:opacity-90"
          >
            {Inner}
          </Link>
        ) : (
          <span className="flex items-center">{Inner}</span>
        )}

        <Button
          variant="ghost"
          size="icon"
          aria-label={t('dismissLabel')}
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
