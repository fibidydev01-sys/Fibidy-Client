// ==========================================
// ANNOUNCEMENT BAR DATA
// File: src/lib/data/marketing/announcement.ts
//
// The thin promo banner at the top of the marketing page.
// Toggle `active: false` to hide site-wide. When inactive, the
// component returns null — zero render cost.
//
// Per HANDOFF §5 anti-pattern: dismiss state is in-memory (useState)
// only. Refresh = banner returns. This is intentional — Phase 1 keeps
// state simple. Promote to cookie-based persistence only when banner
// fatigue becomes measurable.
//
// Dates / promos are managed here, not in i18n keys, so non-translated
// content (links, expiry) stays close to the toggle. Copy keys still
// live in messages/{en,id}/marketing.json.
// ==========================================

export interface AnnouncementData {
  /** Master kill switch — false = banner not rendered at all */
  active: boolean;
  /** Optional URL the banner links to. null = banner is text-only */
  href: string | null;
  /** ISO date — for the team's own reference, not enforced at runtime */
  expiresAt: string | null;
}

export const announcement: AnnouncementData = {
  active: false,
  href: null,
  expiresAt: null,
};
