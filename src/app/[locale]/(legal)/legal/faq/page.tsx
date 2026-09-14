import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// ============================================================================
// LEGAL FAQ — /legal/faq
// File: src/app/[locale]/(legal)/legal/faq/page.tsx
//
// [UPGRADE — Sep 2026]
// - Container max-w-6xl (sejajar navbar pill + halaman lain)
// - Konten dalam max-w-3xl mx-auto (readability optimal)
// - Accordion group card: shadow bento
// - Body text accordion: text-justify
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.faq');
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqGroup {
  category: string;
  items: FaqItem[];
}

// ── Shadow signature — sama dengan homepage ────────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

export default function FAQPage() {
  const t = useTranslations('legal.faq');
  const tc = useTranslations('legal.common');
  const groups = t.raw('groups') as FaqGroup[];

  return (
    <div className="min-h-screen">
      {/* Container max-w-6xl (sejajar navbar pill) */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Konten dalam max-w-3xl mx-auto — readability */}
        <div className="max-w-3xl mx-auto">
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

          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.category}>
                <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
                  {group.category}
                </p>
                <div
                  className={`rounded-xl border overflow-hidden bg-card px-4 ${CARD_SHADOW}`}
                >
                  <Accordion type="single" collapsible className="w-full">
                    {group.items.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${group.category}-${index}`}
                        className="border-b border-border/60 last:border-b-0"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4 text-sm font-semibold hover:text-link transition-colors duration-200">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed text-justify">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-border/60 mt-10 mb-6" />
          <p className="text-xs text-muted-foreground text-center">
            {t('stillQuestionPrefix')}{' '}
            <Link
              href="/legal/contact"
              className="text-foreground font-semibold hover:text-link transition-colors"
            >
              {t('stillQuestionLinkText')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}