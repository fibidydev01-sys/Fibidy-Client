// ==========================================
// FEATURE VISUALS — REGISTRY (BARREL)
// File: src/components/marketing/sections/features/visuals/index.ts
//
// [PHASE 4 SPLIT — May 2026]
// Was a monolithic .tsx file (396 lines) with all 4 visual
// components + icon record + registries inline. Phase 4 split:
//   - StudioVisual            → ./studio-marquee.tsx
//   - OrdersVisual            → ./orders-list.tsx
//   - ChannelsVisual + Circle → ./channels-beam.tsx
//   - SosmedIcon record       → ./channels-icons.tsx
//   - SaveTimeVisual          → ./save-time-calendar.tsx
//
// This file (now `index.ts`, NOT `index.tsx`) holds ONLY the two
// registries the section consumer needs: FEATURE_VISUALS (background
// renderer) and FEATURE_ICONS (BentoCard header icon).
//
// Why .ts and not .tsx:
//   No JSX in this file anymore. The helper components live in
//   sibling files. Keeping .ts makes the boundary obvious — a quick
//   `grep .tsx` won't surface this barrel as if it owned UI.
//
// Why a barrel:
//   features-section.tsx imports `{ FEATURE_VISUALS, FEATURE_ICONS }`
//   verbatim. Keeping the import path stable (`'./visuals'`)
//   avoids touching the section file and lets TypeScript resolve
//   `./visuals/index.ts` automatically.
//
// Behavior preserved verbatim. Same registry shape, same keys, same
// component identities (just sourced from sibling files).
// ==========================================

import {
  CalendarIcon,
  BellIcon,
  Share2Icon,
  Palette,
} from 'lucide-react';
import type { FeatureVisualKey } from '@/types/marketing';

import { StudioVisual } from './studio-marquee';
import { OrdersVisual } from './orders-list';
import { ChannelsVisual } from './channels-beam';
import { SaveTimeVisual } from './save-time-calendar';

// ==========================================
// REGISTRIES — keyed by FeatureVisualKey
// ==========================================

export const FEATURE_VISUALS: Record<FeatureVisualKey, React.ComponentType> = {
  studio: StudioVisual,
  orders: OrdersVisual,
  channels: ChannelsVisual,
  saveTime: SaveTimeVisual,
};

export const FEATURE_ICONS: Record<
  FeatureVisualKey,
  React.ComponentType<{ className?: string }>
> = {
  studio: Palette,
  orders: BellIcon,
  channels: Share2Icon,
  saveTime: CalendarIcon,
};
