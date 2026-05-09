// ==========================================
// MARKETING SECTION REGISTRY
// File: src/components/marketing/registry.ts
//
// Phase 10 (May 2026 — registry pattern):
//
// Single source of truth mapping `SectionKey → React.ComponentType`.
// page.tsx iterates ACTIVE_SECTIONS (lib/marketing/data/sections.ts)
// and looks up components here.
//
// ORDER IN THIS MAP DOESN'T MATTER. Render order is driven entirely
// by the order of items in ACTIVE_SECTIONS array. The registry is a
// look-up dictionary, not a render queue.
//
// WHY React.ComponentType (not () => JSX.Element):
//   Some sections are async server components
//   (HeroSection, ProblemSection, ScaleSection, HowItWorksSection,
//    PricingSection, FaqSection, StoreBuilderSection — post Phase 8).
//   Some are sync client components
//   (AnnouncementBar, FeaturesSection, FinalCtaSection).
//
//   `() => JSX.Element` would reject async components (TS Promise
//   incompatibility). `React.ComponentType` is the right type because
//   async server components are still ComponentType under the hood
//   in Next.js's App Router type model.
//
// TYPE SAFETY NET:
//   The Record<SectionKey, ComponentType> shape forces a compile
//   error if a SectionKey union member is missing an entry. Adding
//   a new section WITHOUT adding a registry entry → TS error in
//   THIS file. Removing a section from the SectionKey union without
//   removing its registry entry → TS error here too.
//
// ADDING A NEW SECTION (when the time comes):
//   1. Create folder: components/marketing/sections/<name>/index.tsx
//   2. Add identifier to SectionKey union in @/types/marketing
//   3. Add entry here mapping the new key → its component
//   4. Add the new key to FULL_SECTIONS in lib/marketing/data/sections.ts
//      (and to ACTIVE_SECTIONS if it should render in current mode)
//
// REMOVING A SECTION:
//   1. Comment-out from ACTIVE_SECTIONS in lib/marketing/data/sections.ts
//   2. (Optional) Remove from FULL_SECTIONS too
//   No JSX edits, no registry edits required for hide-without-deleting.
//
// REORDERING SECTIONS:
//   Reorder FULL_SECTIONS / ACTIVE_SECTIONS array. Done.
//
// All section folders are imported eagerly. Next.js + Turbopack
// tree-shake unused sections at build time — if ACTIVE_SECTIONS
// excludes a key, the underlying component code still gets bundled
// (because the registry references it), but won't render. If you
// want true tree-shaking per-mode, swap the registry to lazy
// imports via React.lazy + Suspense. Out of scope for Phase 10.
// ==========================================

import type { ComponentType } from 'react';
import type { SectionKey } from '@/types/marketing';

import { AnnouncementBar } from './sections/announcement';
import { HeroSection } from './sections/hero';
import { ProblemSection } from './sections/problem';
import { FeaturesSection } from './sections/features';
import { ScaleSection } from './sections/scale';
import { HowItWorksSection } from './sections/how-it-works';
import { PricingSection } from './sections/pricing';
import { StoreBuilderSection } from './sections/store-builder';
import { FaqSection } from './sections/faq';
import { FinalCtaSection } from './sections/final-cta';

/**
 * Single source of truth: which component renders for each
 * SectionKey. Keys must exhaustively match the SectionKey union;
 * the Record<...> type signature enforces this at compile time.
 */
export const SECTION_REGISTRY: Record<SectionKey, ComponentType> = {
  announcement: AnnouncementBar,
  hero: HeroSection,
  problem: ProblemSection,
  features: FeaturesSection,
  scale: ScaleSection,
  howItWorks: HowItWorksSection,
  pricing: PricingSection,
  storeBuilder: StoreBuilderSection,
  faq: FaqSection,
  finalCta: FinalCtaSection,
};
