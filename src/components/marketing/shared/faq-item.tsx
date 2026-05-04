// ==========================================
// FAQ ITEM
// File: src/components/marketing/shared/faq-item.tsx
//
// Single Q&A row inside an Accordion. Visible text in DOM (not
// hidden behind tabs/images) so it's crawlable by Google generative
// results, Perplexity, ChatGPT — the same FAQs feed FAQPage JSON-LD
// at lib/shared/marketing-schema.ts.
//
// Built on the existing shadcn Accordion primitive.
// ==========================================

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FaqItemProps {
  /** Stable id for AccordionItem value */
  id: string;
  /** Question text (translated) */
  question: string;
  /** Answer text (translated) — supports plain text only Phase 1 */
  answer: string;
}

export function FaqItem({ id, question, answer }: FaqItemProps) {
  return (
    <AccordionItem value={id} className="border-b">
      <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}
