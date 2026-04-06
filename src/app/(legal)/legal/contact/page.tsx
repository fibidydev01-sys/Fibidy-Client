import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, Instagram, Music2, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Kontak Fibidy. Email dan media sosial.',
};

const CONTACTS = [
  {
    label: 'Email',
    value: 'admin@fibidy.com',
    description: 'Untuk semua pertanyaan. Respons dalam 1x24 jam kerja.',
    href: 'mailto:admin@fibidy.com',
    icon: Mail,
  },
  {
    label: 'Instagram',
    value: '@fibidy_com',
    description: 'Update fitur dan inspirasi toko.',
    href: 'https://instagram.com/fibidy_com',
    icon: Instagram,
  },
  {
    label: 'TikTok',
    value: '@fibidy.com',
    description: 'Tips jualan online untuk UMKM.',
    href: 'https://tiktok.com/@fibidy.com',
    icon: Music2,
  },
  {
    label: 'X / Twitter',
    value: '@fibidy42581',
    description: 'Pengumuman dan update platform.',
    href: 'https://twitter.com/fibidy42581',
    icon: Twitter,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Back */}
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Info & Legal
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Hubungi Kami</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ada pertanyaan atau butuh bantuan? Hubungi kami di sini.
          </p>
        </div>

        {/* Contact list */}
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          {CONTACTS.map((contact) => {
            const Icon = contact.icon;
            return (
              <a
                key={contact.label}
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 px-4 py-4 hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
                    {contact.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {contact.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {contact.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        <Separator className="bg-border/60 mt-10 mb-6" />
        <p className="text-xs text-muted-foreground text-center">
          Fibidy · PT Perorangan · NIB 1203260002022
        </p>

      </div>
    </div>
  );
}