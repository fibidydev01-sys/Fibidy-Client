'use client';

// ==========================================
// COMING SOON PAGE
// File: src/components/shared/coming-soon-page.tsx
//
// Reusable page shown when a feature is disabled via FEATURES flag.
// Rendered server-side from page.tsx so users see this immediately
// instead of a flash of broken content.
//
// Used at:
//   - /dashboard/library/page.tsx
//   - /dashboard/products/downloads/page.tsx
//   - /discover/layout.tsx
//
// i18n keys live under `dashboard.comingSoon.*` — see messages/en|id/dashboard.json.
// ==========================================

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComingSoonPageProps {
  /** Which feature this page represents — picks the right copy from i18n */
  feature: 'digitalProducts' | 'discover' | 'library';
  /** Optional CTA destination. Defaults to /dashboard/products. */
  ctaHref?: string;
  /** Optional override for CTA label (translation key under `dashboard.comingSoon.cta.*`) */
  ctaLabelKey?: 'backToProducts' | 'backToDashboard' | 'backToHome';
}

export function ComingSoonPage({
  feature,
  ctaHref = '/dashboard/products',
  ctaLabelKey = 'backToProducts',
}: ComingSoonPageProps) {
  const t = useTranslations('dashboard.comingSoon');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t(`${feature}.title`)}</h1>
          <p className="text-muted-foreground">
            {t(`${feature}.description`)}
          </p>
        </div>

        <Button asChild size="lg">
          <Link href={ctaHref}>{t(`cta.${ctaLabelKey}`)}</Link>
        </Button>
      </div>
    </div>
  );
}
