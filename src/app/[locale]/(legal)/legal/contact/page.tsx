import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Mail, Instagram, Music2, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.contact');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

// Channel order + icons are hardcoded. Labels, values,
// and descriptions come from i18n.
const CHANNELS = [
  { key: 'email', icon: Mail, hrefTemplate: 'mailto:{value}' },
  { key: 'instagram', icon: Instagram, hrefTemplate: 'https://instagram.com/{handle}' },
  { key: 'tiktok', icon: Music2, hrefTemplate: 'https://tiktok.com/@{handle}' },
  { key: 'twitter', icon: Twitter, hrefTemplate: 'https://twitter.com/{handle}' },
] as const;

interface ChannelContent {
  label: string;
  value: string;
  description: string;
}

interface SubjectLine {
  label: string;
  subject: string;
}

function resolveHref(template: string, value: string): string {
  // 'mailto:{value}' → 'mailto:admin@fibidy.com'
  // '{handle}' variants strip the leading '@' from the value
  if (template.includes('{value}')) {
    return template.replace('{value}', value);
  }
  if (template.includes('{handle}')) {
    const handle = value.replace(/^@/, '');
    return template.replace('{handle}', handle);
  }
  return template;
}

export default function ContactPage() {
  const t = useTranslations('legal.contact');
  const tc = useTranslations('legal.common');

  const subjects = t.raw('subjects') as SubjectLine[];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {tc('backToIndex')}
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {/* Channel list */}
        <div className="rounded-xl border divide-y overflow-hidden bg-card">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const content = t.raw(`channels.${channel.key}`) as ChannelContent;
            const href = resolveHref(channel.hrefTemplate, content.value);
            const isExternal = href.startsWith('http');

            return (
              <a
                key={channel.key}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 px-4 py-4 hover:bg-muted/50 active:bg-muted transition-colors"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
                    {content.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {content.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {content.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Subject line guide */}
        <div className="mt-8">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-3 px-1">
            {t('subjectsLabel')}
          </p>
          <div className="rounded-xl border divide-y overflow-hidden bg-card">
            {subjects.map((item) => (
              <div
                key={item.subject}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                  {item.subject}
                </code>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/60 mt-10 mb-6" />
        <p className="text-xs text-muted-foreground text-center">
          {tc('brandSignature')}
        </p>
      </div>
    </div>
  );
}
