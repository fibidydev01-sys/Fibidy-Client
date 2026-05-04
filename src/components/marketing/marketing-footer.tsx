// ==========================================
// MARKETING FOOTER
// File: src/components/marketing/marketing-footer.tsx
//
// [VERCEL-STYLE — May 2026 REBUILD]
// Footer composition:
//
//   ┌────────────────────────────────────────────────┐
//   │ [Brand+tagline]  [Product]  [Resources]  [Legal]│
//   │                                                │
//   ├────────────────────────────────────────────────┤
//   │ © 2026 Fibidy.    [LocaleSwitcher][Theme][Social]│
//   └────────────────────────────────────────────────┘
//
// Locale switcher + theme toggle live HERE, not in the header.
// Same convention as Vercel/Linear/Stripe — meta-actions in the
// foot, primary CTA in the head.
//
// Server component shell; the locale switcher and theme toggle are
// client islands inside it (smallest possible client boundary).
// ==========================================

import { Instagram } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AuthLogo } from '@/components/layout/auth/auth-logo';
import { LocaleSwitcher } from '@/components/marketing/shared/locale-switcher';
import { ThemeToggle } from '@/components/marketing/shared/theme-toggle';
import { footerColumns } from '@/lib/data/marketing/footer';
import { siteConfig } from '@/lib/constants/shared/site';

// TikTok / X (Twitter) don't ship in lucide-react — use simple
// inline svgs. Logos are simple enough to inline.
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface MarketingFooterProps {
  locale: string;
}

export async function MarketingFooter({ locale }: MarketingFooterProps) {
  const t = await getTranslations({ locale, namespace: 'marketing.footer' });

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Top — brand + 3 columns */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <AuthLogo size="sm" />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {t('tagline')}
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <div key={column.id}>
              <h3 className="text-sm font-semibold text-foreground">
                {t(`columns.${column.id}.title`)}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      {...(link.external && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      })}
                    >
                      {t(`columns.${column.id}.links.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom-bar */}
        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>

          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />

            <span className="mx-2 hidden h-4 w-px bg-border sm:block" />

            <a
              href={siteConfig.links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-3.5 w-3.5" aria-hidden />
            </a>
            <a
              href={siteConfig.links.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
              <TikTokIcon className="h-3.5 w-3.5" />
            </a>
            <a
              href={siteConfig.links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
