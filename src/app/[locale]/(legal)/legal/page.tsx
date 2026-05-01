import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  HelpCircle,
  Phone,
  ScrollText,
  Shield,
  Cookie,
  CreditCard,
  Receipt,
  RefreshCcw,
  UserCheck,
  Banknote,
  Handshake,
  FileWarning,
  Copyright,
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
// Group + item structure — labels/descriptions come from i18n
// Only icons and hrefs are hardcoded here.
// ──────────────────────────────────────────────────────────────

interface Item {
  key: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface Group {
  key: string;
  items: Item[];
}

const GROUPS: Group[] = [
  {
    key: 'info',
    items: [
      { key: 'faq', icon: HelpCircle, href: '/legal/faq' },
      { key: 'contact', icon: Phone, href: '/legal/contact' },
    ],
  },
  {
    key: 'payment',
    items: [
      { key: 'fees', icon: Receipt, href: '/legal/fees' },
      { key: 'payment', icon: CreditCard, href: '/legal/payment' },
      { key: 'refund', icon: RefreshCcw, href: '/legal/refund' },
    ],
  },
  {
    key: 'seller',
    items: [
      { key: 'kyc', icon: UserCheck, href: '/legal/kyc' },
      { key: 'payout', icon: Banknote, href: '/legal/payout' },
      { key: 'sellerAgreement', icon: Handshake, href: '/legal/seller-agreement' },
    ],
  },
  {
    key: 'rights',
    items: [
      { key: 'acceptableUse', icon: FileWarning, href: '/legal/acceptable-use' },
      { key: 'copyright', icon: Copyright, href: '/legal/copyright' },
    ],
  },
  {
    key: 'core',
    items: [
      { key: 'terms', icon: ScrollText, href: '/legal/terms' },
      { key: 'privacy', icon: Shield, href: '/legal/privacy' },
      { key: 'cookies', icon: Cookie, href: '/legal/cookies' },
    ],
  },
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

        {/* Groups */}
        <div className="space-y-6">
          {GROUPS.map((group) => (
            <div key={group.key}>
              <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
                {t(`groups.${group.key}`)}
              </p>
              <div className="rounded-xl border divide-y overflow-hidden bg-card">
                {group.items.map((item) => {
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
            </div>
          ))}
        </div>

        <Separator className="bg-border/60 mt-10 mb-6" />
        <p className="text-xs text-muted-foreground text-center">
          {tc('brandSignature')}
        </p>
      </div>
    </div>
  );
}
