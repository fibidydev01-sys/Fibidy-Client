// ==========================================
// FAQ ITEM
// File: src/components/marketing/shared/faq-item.tsx
//
// Phase 5 polish v15.3 (May 2026 — Vercel vibes everywhere):
//
// CHANGED in v15.3:
//   - `px-6 md:px-8` added to AccordionTrigger and AccordionContent.
//
// CRITICAL — WHY PADDING LIVES INSIDE THE ITEM:
//   The faq-section.tsx wrapper now wraps the Accordion in a
//   <LineGridFrame>. The dividers between FaqItems (the `border-b`
//   on each AccordionItem) MUST run flush plate-edge to plate-edge.
//
//   If we put padding on the Accordion wrapper instead (e.g.
//   `<Accordion className="px-6">`), every divider would inset
//   from the plate edges → broken visual continuity, looks like
//   the lines are "floating" inside the plate instead of dividing
//   the rows of the grid.
//
//   Solution: padding lives on the Trigger + Content (i.e. INSIDE
//   each item, NOT on the Accordion wrapper). The `border-b` on
//   AccordionItem stays flush with the plate edges, the text
//   content inside has breathing room.
//
// PRESERVED:
//   - shadcn Accordion primitive
//   - Visible text in DOM (SEO + AI agent crawling)
//   - Same items feed FAQPage JSON-LD via MarketingSchema
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
      <AccordionTrigger className="px-6 text-left text-base font-medium hover:no-underline md:px-8">
        {question}
      </AccordionTrigger>
      <AccordionContent className="px-6 leading-relaxed text-muted-foreground md:px-8">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}