'use client';

// ==========================================
// HERO MOTION STAGGER (framer-motion entrance choreography)
// File: src/components/marketing/sections/hero/motion-stagger.tsx
//
// [PHASE 7 SPLIT — May 2026]
// Extracted from src/components/marketing/sections/hero/index.tsx
// (was the outer <motion.div variants={stagger}> + per-child
// <motion.div variants={fadeUp}> blocks in the v10 hero).
//
// ──────────────────────────────────────────────────────────────────
//
// Why a single client wrapper instead of one client island per child?
//
// The hero entrance choreography is a coordinated stagger:
//   1. Eyebrow pill fades up
//   2. Headline fades up (80ms after eyebrow)
//   3. Subheadline fades up (160ms after eyebrow)
//   4. CTA pair fades up (240ms after eyebrow)
//   5. Trust line fades up (320ms after eyebrow)
//   6. Visual column fades up (parallel to text column on lg+)
//
// framer-motion's stagger requires a parent with `variants={stagger}`
// + `staggerChildren` transition AND children that reference the
// SAME variant tree. If we made each child its own client island,
// each would need its own motion context — stagger wouldn't propagate.
//
// Solution: ONE motion stagger wrapper at hero root. All children
// (eyebrow, headline, subheadline, CTA, trust, visual) live as
// `<motion.div variants={fadeUp}>` slots inside. The server composer
// passes pre-translated content as props, the wrapper distributes
// them to slots, framer-motion handles choreography.
//
// CONTENT STRATEGY:
//   - Static text (subheadline, trust line) → passed as string props
//   - Atomic islands (Headline with WordRotate, CtaPair with router) →
//     rendered as React nodes (slots) so the wrapper doesn't need to
//     know their internals
//   - Eyebrow (server CSS-only) → also passed as a React node slot
//   - Visual (BrowserMockup wrapping StorefrontMockup) → React node slot
//
// This keeps the wrapper focused on choreography, NOT content. Each
// concrete piece stays in its own file with its own boundary.
//
// CLIENT REQUIREMENT:
//   framer-motion's <motion.div> + Variants type need client runtime.
//   This wrapper is the motion boundary; everything below it inherits
//   the same React tree.
// ==========================================

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

// ──────────────────────────────────────────────────────────────────
// VARIANTS
// ──────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// ──────────────────────────────────────────────────────────────────
// PROPS — content slots
// ──────────────────────────────────────────────────────────────────

interface MotionStaggerProps {
  /** Eyebrow pill (server, gradient-animated CSS pill) */
  eyebrow: ReactNode;
  /** Headline (client island — WordRotate + 2-line) */
  headline: ReactNode;
  /** Subheadline plain text (pre-translated) */
  subheadline: string;
  /** CTA pair (client island — RainbowButton + outline) */
  ctaPair: ReactNode;
  /** Trust line plain text (pre-translated) */
  trustLine: string;
  /** Visual column content (mockup) */
  visual: ReactNode;
}

export function HeroMotionStagger({
  eyebrow,
  headline,
  subheadline,
  ctaPair,
  trustLine,
  visual,
}: MotionStaggerProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16"
    >
      {/* ── TEXT COLUMN ── */}
      <div className="text-center lg:text-left">
        <motion.div
          variants={fadeUp}
          className="flex justify-center lg:justify-start"
        >
          {eyebrow}
        </motion.div>

        <motion.div variants={fadeUp}>{headline}</motion.div>

        <motion.p
          variants={fadeUp}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg lg:mx-0"
        >
          {subheadline}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
        >
          {ctaPair}
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mt-5 text-xs text-muted-foreground"
        >
          {trustLine}
        </motion.p>
      </div>

      {/* ── VISUAL COLUMN ── */}
      <motion.div
        variants={fadeUp}
        className="relative mx-auto w-full max-w-[640px] lg:max-w-none"
      >
        {visual}
      </motion.div>
    </motion.div>
  );
}
