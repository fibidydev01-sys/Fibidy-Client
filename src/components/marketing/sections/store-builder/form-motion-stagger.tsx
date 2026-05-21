'use client';

// ==========================================
// STORE BUILDER MOTION STAGGER
// File: src/components/marketing/sections/store-builder/form-motion-stagger.tsx
//
// [VISUAL SYNC v4 — May 2026]
//
// Slots: eyebrow → headline → subheadline → formBody
// Same fadeUp + stagger variants as hero/motion-stagger.tsx.
// formBody = slug input + agreement + CTA (fungsi StoreBuilder utuh).
// ==========================================

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

interface FormMotionStaggerProps {
  eyebrow: ReactNode;
  headline: ReactNode;
  subheadline: string;
  formBody: ReactNode;
}

export function FormMotionStagger({
  eyebrow,
  headline,
  subheadline,
  formBody,
}: FormMotionStaggerProps) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center text-center"
    >
      {/* 1. Eyebrow pill */}
      <motion.div
        variants={fadeUp}
        className="flex justify-center"
      >
        {eyebrow}
      </motion.div>

      {/* 2. Headline — "Open your" + WordRotate */}
      <motion.div variants={fadeUp} className="mt-5">
        {headline}
      </motion.div>

      {/* 3. Subheadline */}
      <motion.p
        variants={fadeUp}
        className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
      >
        {subheadline}
      </motion.p>

      {/* 4. Form body — slug input + agreement + RainbowButton CTA */}
      <motion.div variants={fadeUp} className="w-full">
        {formBody}
      </motion.div>
    </motion.div>
  );
}