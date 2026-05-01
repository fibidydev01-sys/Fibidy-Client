import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.refund');
  const ti = await getTranslations('legal.index.items.refund');
  return {
    title: t('title'),
    description: ti('description'),
  };
}

interface Section {
  number: string;
  title: string;
  content: string[];
}

export default function Page() {
  const t = useTranslations('legal.refund');
  const tc = useTranslations('legal.common');

  // useTranslations returns structured translations via t.raw()
  // for arrays/objects nested in the JSON.
  const summary = t.raw('summary') as string[];
  const sections = t.raw('sections') as Section[];

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
          <p className="text-sm text-muted-foreground mt-1">
            {tc('effectiveSince')}
          </p>
        </div>

        <div className="rounded-xl border bg-muted/30 p-5 mb-8">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-3">
            {tc('summaryLabel')}
          </p>
          <ul className="space-y-2">
            {summary.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator className="bg-border/60 mb-8" />

        <div className="space-y-0">
          {sections.map((s) => (
            <div key={s.number}>
              <Separator className="bg-border/60" />
              <div className="grid grid-cols-[48px_1fr] gap-5 py-7">
                <span className="text-4xl font-black text-muted-foreground/20 select-none leading-none tabular-nums pt-0.5">
                  {s.number}
                </span>
                <div>
                  <h2 className="text-base font-bold tracking-tight mb-3">
                    {s.title}
                  </h2>
                  <div className="space-y-2">
                    {s.content.map((p, i) => (
                      <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Separator className="bg-border/60" />
        </div>

        <div className="mt-8 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">
            {tc('questionsLabel')}{' '}
            <a
              href={`mailto:${tc('supportEmail')}`}
              className="text-foreground font-semibold hover:text-primary transition-colors"
            >
              {tc('supportEmail')}
            </a>
          </p>
          <p className="text-xs text-muted-foreground">{tc('brandSignature')}</p>
        </div>
      </div>
    </div>
  );
}
