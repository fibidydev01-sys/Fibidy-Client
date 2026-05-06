// ==========================================
// FEATURES BENTO DATA
// File: src/lib/data/marketing/features.ts
//
// Phase 5 polish v6 (May 2026 — official Magic UI bento parity):
//
// 4-tile layout mirroring the official Magic UI bento-grid demo
// (https://magicui.design/docs/components/bento-grid). The visual
// signature — small tile + wide tile on the top row, wide tile +
// small tile on the bottom row — gives the bento its distinctive
// asymmetric rhythm. Each tile is reframed for Fibidy's UMKM voice.
//
// Layout (3-col grid, equal-height rows):
//
//   ┌──────────┬──────────────────────────┐
//   │ STUDIO   │  ORDERS                  │
//   │ (small)  │  (wide)                  │
//   ├──────────┴──────────────┬───────────┤
//   │  CHANNELS               │ SAVE TIME │
//   │  (wide)                 │ (small)   │
//   └─────────────────────────┴───────────┘
//
// Mobile (<lg): each tile becomes col-span-3 → full width single
// column stack in source order.
//
// Mapping to the official demo:
//   - Studio   ↔ Save your files (Marquee)
//   - Orders   ↔ Notifications (AnimatedList)
//   - Channels ↔ Integrations (AnimatedBeam) — visualises Fibidy
//                fanning out to WhatsApp / Instagram / TikTok /
//                custom domain / subdomain. Brings back the
//                multi-tenant + WhatsApp narrative dropped in v5.
//   - SaveTime ↔ Calendar — anchors "5 menit bukan 5 minggu".
//
// Copy at `marketing.features.items.{id}.*` in marketing.json.
// ==========================================

import type { FeatureTileData } from '@/types/marketing';

export const featureTiles: readonly FeatureTileData[] = [
  // Top-left — small tile — Studio Marquee of curated templates
  {
    id: 'studio',
    className: 'col-span-3 lg:col-span-1',
    visualKey: 'studio',
  },

  // Top-right — wide tile — Order Notifications AnimatedList
  {
    id: 'orders',
    className: 'col-span-3 lg:col-span-2',
    visualKey: 'orders',
  },

  // Bottom-left — wide tile — Multi-channel reach AnimatedBeam
  {
    id: 'channels',
    className: 'col-span-3 lg:col-span-2',
    visualKey: 'channels',
  },

  // Bottom-right — small tile — Save Your Time Calendar
  {
    id: 'saveTime',
    className: 'col-span-3 lg:col-span-1',
    visualKey: 'saveTime',
  },
] as const;
