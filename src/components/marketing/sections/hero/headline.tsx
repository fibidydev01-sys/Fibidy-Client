'use client';

// ==========================================
// HERO HEADLINE (two-line layout with WordRotate)
// File: src/components/marketing/sections/hero/headline.tsx
//
// [PHASE 7 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/hero/index.tsx
// (was the inline <motion.h1> + WordRotate block in the v10 hero).
// Behavior preserved verbatim.
//
// ──────────────────────────────────────────────────────────────────
//
// Two-line headline:
//   Line 1 — static prefix in foreground color  (e.g. "Open your")
//   Line 2 — WordRotate cycling the noun BOLD   (e.g. "cafe."/"salon.")
//
// WordRotate is a framer-motion crossfade of single words. Static
// prefix anchors the headline; rotating word reads as the focal
// point because it sits isolated on its own line in primary color.
//
// SEMANTIC WRAPPER:
//   The outer <h1> wraps both spans. WordRotate's internal
//   <motion.h1> nests inside, which is technically non-strict HTML
//   (h1-in-h1) but every modern browser handles it gracefully and
//   crawlers index the outer h1's text on first paint. The cost
//   of full strict semantics here would be giving up framer-motion's
//   AnimatePresence-driven typography, which is more visible to users
//   than the technical nesting is to crawlers.
//
// CLIENT REQUIREMENT:
//   WordRotate uses motion/react's AnimatePresence + useState +
//   useEffect interval. This component MUST be a client island.
//
// PROPS:
//   - prefix: pre-translated static line 1 (e.g. "Open your")
//   - words:  array of cycling nouns (defensive cast in parent)
// ==========================================

import { WordRotate } from '@/components/ui/word-rotate';
import { cn } from '@/lib/shared/utils';

interface HeadlineProps {
  prefix: string;
  words: string[];
}

export function Headline({ prefix, words }: HeadlineProps) {
  return (
    <h1 className="mt-5 text-4xl font-bold tracking-tight leading-[1.1] md:text-5xl lg:text-6xl">
      <span className="block text-foreground">{prefix}</span>
      <span className="block">
        <WordRotate
          words={words}
          className={cn(
            // WordRotate has its own font sizing baked in;
            // override to inherit our heading scale and color.
            '!text-4xl md:!text-5xl lg:!text-6xl',
            '!font-bold !tracking-tight !leading-[1.1]',
            '!text-primary',
          )}
        />
      </span>
    </h1>
  );
}
