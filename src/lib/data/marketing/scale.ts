// ==========================================
// SCALE SECTION DATA
// File: src/lib/data/marketing/scale.ts
//
// Phase 5 polish v15 (May 2026 — multi-tenant proof point):
//
// Two pieces of static data feed the ScaleSection:
//
//   1. scaleDomains — URLs shown in the stacked browser visual.
//      Order is top → bottom of the stack: array[0] is the most
//      faded bar at the top, array[length−1] is the focused bar
//      at the bottom.
//
//      The mix of fibidy subdomains (slug.fibidy.com) and custom
//      domains (.id, .com) is deliberate — it tells the multi-
//      tenant + BYO-domain story in one visual, without needing
//      a label or explanation.
//
//      To add or rotate domains, edit this array. The visual
//      auto-scales its container height. Sweet spot is 5–7 bars;
//      past 8, top bars get too narrow to read on mobile.
//
//   2. scaleFeatures — the three columns under the visual.
//      Same trio Vercel uses (infinite domains / instant SSL /
//      zero maintenance), reframed for Fibidy's voice. Copy
//      lives at marketing.scale.features.{id}.* in marketing.json.
// ==========================================

export interface ScaleDomain {
  /** URL string shown in the browser address bar */
  url: string;
}

export const scaleDomains: readonly ScaleDomain[] = [
  { url: 'tokokopi.fibidy.com' },
  { url: 'kopisenja.id' },
  { url: 'imelda.fibidy.com' },
  { url: 'imeldahandmade.com' },
  { url: 'raditya.fibidy.com' },
  { url: 'radityastudio.id' },
] as const;

export interface ScaleFeature {
  /** i18n key suffix under marketing.scale.features.{id} */
  id: 'infiniteDomains' | 'instantSsl' | 'zeroMaintenance';
}

export const scaleFeatures: readonly ScaleFeature[] = [
  { id: 'infiniteDomains' },
  { id: 'instantSsl' },
  { id: 'zeroMaintenance' },
] as const;
