import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  HelpCircle,
  ScrollText,
  Shield,
  Cookie,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.index');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

// ──────────────────────────────────────────────────────────────
// Item structure — labels/descriptions come from i18n
// Only icons and hrefs are hardcoded here.
//
// Kept only the 4 pages linked from the marketing footer
// (Dukungan → Pusat Bantuan, Legal → Syarat Layanan / Privasi /
// Cookies). Removed acceptable-use, contact, copyright, fees,
// kyc, payment, payout, refund, seller-agreement — none of these
// are linked anywhere in the footer.
// ──────────────────────────────────────────────────────────────

interface Item {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const ITEMS: Item[] = [
  { key: 'faq', icon: HelpCircle, href: '/legal/faq' },
  { key: 'terms', icon: ScrollText, href: '/legal/terms' },
  { key: 'privacy', icon: Shield, href: '/legal/privacy' },
  { key: 'cookies', icon: Cookie, href: '/legal/cookies' },
];

export default async function LegalIndexPage() {
  const t = await getTranslations('legal.index');
  const tc = await getTranslations('legal.common');

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back */}
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToSettings')}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {/* Items — single flat list, no group headers needed at 5 items */}
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {t(`items.${item.key}.label`)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {t(`items.${item.key}.description`)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </Link>
            );
          })}
        </div>

        <Separator className="bg-border/60 mt-10 mb-6" />
        <p className="text-xs text-muted-foreground text-center">
          {tc('brandSignature')}
        </p>
      </div>
    </div>
  );
}