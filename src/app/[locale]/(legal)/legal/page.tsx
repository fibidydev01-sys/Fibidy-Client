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
  Info,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// ============================================================================
// LEGAL INDEX — /legal
// File: src/app/[locale]/(legal)/legal/page.tsx
//
// [UPGRADE — Sep 2026]
// - Container max-w-6xl (sejajar navbar pill + halaman lain)
// - Konten dalam max-w-3xl mx-auto (readability optimal)
// - Items list card: shadow bento (konsisten dengan marketing)
// ============================================================================

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
// ──────────────────────────────────────────────────────────────

interface Item {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const ITEMS: Item[] = [
  { key: 'about', icon: Info, href: '/legal/about' },
  { key: 'faq', icon: HelpCircle, href: '/legal/faq' },
  { key: 'terms', icon: ScrollText, href: '/legal/terms' },
  { key: 'privacy', icon: Shield, href: '/legal/privacy' },
  { key: 'cookies', icon: Cookie, href: '/legal/cookies' },
];

// ── Shadow signature — sama dengan homepage ────────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export default async function LegalIndexPage() {
  const t = await getTranslations('legal.index');
  const tc = await getTranslations('legal.common');

  return (
    <div className="min-h-screen">
      {/* Container max-w-6xl (sejajar navbar pill) */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Konten dalam max-w-3xl mx-auto — readability */}
        <div className="max-w-3xl mx-auto">
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

          {/* Items — rounded-xl + shadow bento */}
          <div
            className={`rounded-xl border divide-y overflow-hidden bg-card ${CARD_SHADOW}`}
          >
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
    </div>
  );
}