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

export default function FAQPage() {
  const t = useTranslations('legal.faq');
  const tc = useTranslations('legal.common');
  const groups = t.raw('groups') as FaqGroup[];

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

        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.category}>
              <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2 px-1">
                {group.category}
              </p>
              <div className="rounded-xl border overflow-hidden bg-card px-4">
                <Accordion type="single" collapsible className="w-full">
                  {group.items.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${group.category}-${index}`}
                      className="border-b border-border/60 last:border-b-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4 text-sm font-semibold hover:text-primary transition-colors duration-200">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
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
            className="text-foreground font-semibold hover:text-primary transition-colors"
          >
            {t('stillQuestionLinkText')}
          </Link>
        </p>
      </div>
    </div>
  );
}
