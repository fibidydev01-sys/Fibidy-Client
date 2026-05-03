// ==========================================
// MARKETING FOOTER
// File: src/components/marketing/marketing-footer.tsx
//
// [VERCEL VIBES — May 2026]
// Placeholder server component. Sits at the bottom of every (marketing)
// route. Intentionally minimal for the foundation pass — copyright +
// inline terms/privacy links. Future iterations can layer columns,
// social icons, language switcher, etc.
//
// i18n keys required:
//   marketing.footer.copyright   ({year} interpolation)
//   marketing.footer.terms
//   marketing.footer.privacy
// ==========================================

import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface MarketingFooterProps {
  locale: string;
}

export async function MarketingFooter({ locale }: MarketingFooterProps) {
  const t = await getTranslations({ locale, namespace: 'marketing.footer' });

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t('copyright', { year: new Date().getFullYear() })}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('terms')}
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
