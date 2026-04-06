import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, Phone, ScrollText, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Info & Legal',
  description: 'FAQ, kontak, syarat layanan, dan kebijakan privasi Fibidy.',
};

const LEGAL_GROUPS = [
  {
    group: 'Informasi',
    items: [
      {
        label: 'FAQ',
        description: 'Pertanyaan yang sering ditanya',
        icon: HelpCircle,
        href: '/legal/faq',
      },
      {
        label: 'Hubungi Kami',
        description: 'Email dan media sosial Fibidy',
        icon: Phone,
        href: '/legal/contact',
      },
    ],
  },
  {
    group: 'Legal',
    items: [
      {
        label: 'Syarat Layanan',
        description: 'Ketentuan penggunaan platform',
        icon: ScrollText,
        href: '/legal/terms',
      },
      {
        label: 'Kebijakan Privasi',
        description: 'Cara kami mengelola datamu',
        icon: Shield,
        href: '/legal/privacy',
      },
    ],
  },
];

export default function LegalIndexPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Back */}
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Info & Legal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informasi platform dan dokumen hukum Fibidy.
          </p>
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {LEGAL_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
                {group.group}
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
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.description}
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
          Fibidy · PT Perorangan · NIB 1203260002022
        </p>

      </div>
    </div>
  );
}