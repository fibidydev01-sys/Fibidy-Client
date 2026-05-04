// ==========================================
// FEATURES BENTO DATA
// File: src/lib/data/marketing/features.ts
//
// Phase 2 (Marketing rewrite, May 2026):
//
// Six tiles in an asymmetric bento. Studio is the flagship (large
// span — 2x2 on desktop, per Q3 = Studio LIVE).
//
// DROPPED (Phase 1 reality — see HANDOFF #2 §2):
//   - 'stripe'    → Stripe Connect DORMANT, mention = over-claim
//   - 'storage'   → R2 DORMANT (digital file storage)
//   - 'analytics' → Per Q4: dashboard analytics not built yet
//
// ADDED (all confirmed live in Phase 1):
//   - 'theme'     → tenant.theme.primaryColor used in storefront
//   - 'seo'       → sitemap, OG image, JSON-LD LocalBusiness/Product
//   - 'mobile'    → Tailwind responsive baseline tested
//
// Layout (4-col desktop grid, auto-rows-fr):
//   Row 1: [studio  studio] [multiTenant ─]
//   Row 2: [studio  studio] [whatsapp    ─]
//   Row 3: [theme] [seo] [mobile] (gap)
//
// 11 cells total → 1-cell gap on row 3 col 4. Same gap pattern as
// the original 6-tile layout, just with honest tile content.
//
// Why six and not twelve: HANDOFF §5 anti-pattern #6 — feature dump.
// Six well-described features beat twelve icon-only ones.
//
// Copy lives at `marketing.features.items.{id}.*` in marketing.json.
// Icon + span are non-translatable, so they live here.
// ==========================================

import {
  Sparkles,
  Globe,
  MessageCircle,
  Palette,
  Search,
  Smartphone,
} from 'lucide-react';
import type { FeatureTileData } from '@/types/marketing';

export const featureTiles: readonly FeatureTileData[] = [
  // Flagship — Studio drag-drop landing builder (LIVE per Q3)
  { id: 'studio', icon: Sparkles, span: 'large' },

  // Trust pillar — Multi-tenant subdomain + custom domain
  { id: 'multiTenant', icon: Globe, span: 'wide' },

  // WhatsApp-first ordering — Phase 1 differentiator (promoted to wide)
  { id: 'whatsapp', icon: MessageCircle, span: 'wide' },

  // Brand customization — tenant.theme.primaryColor
  { id: 'theme', icon: Palette, span: 'normal' },

  // SEO — sitemap, OG image, JSON-LD already shipped
  { id: 'seo', icon: Search, span: 'normal' },

  // Mobile-first — Tailwind responsive baseline
  { id: 'mobile', icon: Smartphone, span: 'normal' },
] as const;
