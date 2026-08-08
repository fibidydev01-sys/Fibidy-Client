import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.about');
  return {
    title: t('title'),
    description: t('tagline'),
  };
}

// ──────────────────────────────────────────────────────────────
// Shape of a section as defined in the i18n JSON.
// ──────────────────────────────────────────────────────────────
interface Section {
  number: string;
  title: string;
  content: string[];
}

export default async function LegalAboutPage() {
  const t = await getTranslations('legal.about');
  const tc = await getTranslations('legal.common');

  // Retrieve sections array from i18n
  // next-intl exposes arrays as raw(); adjust if your setup differs.
  const sections = t.raw('sections') as Section[];
  const summary = t.raw('summary') as string[];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* Back */}
        <Link
          href="/legal"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {tc('backToIndex')}
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{tc('effectiveSince')}</p>
        </div>

        {/* Summary card — pola sama dengan terms/privacy/cookies */}
        <div className="rounded-xl border bg-muted/40 px-5 py-4 mb-8 space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {tc('summaryLabel')}
          </p>
          {summary.map((line, i) => (
            <p key={i} className="text-sm text-foreground leading-relaxed">
              · {line}
            </p>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.number}>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-xs font-mono text-muted-foreground/60 shrink-0">
                  {section.number}
                </span>
                <h2 className="text-base font-semibold text-foreground">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-3 pl-7">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-border/60 mt-10 mb-6" />

        {/* Questions prompt */}
        <p className="text-sm text-muted-foreground text-center">
          {tc('questionsLabel')}{' '}
          <a
            href={`mailto:${tc('supportEmail')}`}
            className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
          >
            {tc('supportEmail')}
          </a>
        </p>

        <p className="text-xs text-muted-foreground text-center mt-4">
          {tc('brandSignature')}
        </p>

      </div>
    </div>
  );
}