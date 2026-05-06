// ==========================================
// CATEGORY REGISTRY
// File: src/lib/constants/shared/categories.ts
//
// [POLISH v15.4 — May 2026]
// SoT for category KEYS (RESTAURANT, CAFE, etc.) and grouping.
// Display strings (label + description) MOVED to i18n at
// `common.categories.items.{KEY}.{label,description}`.
//
// Why split:
//   - This registry is consumed by FE + BE code paths that need
//     stable enum-like keys.
//   - Display strings need to follow user locale (ID/EN). Hardcoding
//     EN in the registry forced ID visitors to see EN labels in the
//     register Step Review — mixed-language UI.
//
// Migration path for consumers:
//   - OLD: `getCategoryConfig('CAFE').label` → "Cafe & Coffee Shop"
//   - NEW: `t(\`common.categories.items.CAFE.label\`)` in components
//
// `getCategoryConfig()` still returns the config object but now
// without `label` / `description` fields. Both fields are also
// kept as optional for transitional compatibility — fall back to
// the key itself if i18n hasn't been wired up at the call site.
// ==========================================

interface CategoryConfig {
  key: string;
  group: string;
  /**
   * @deprecated Use `t(\`common.categories.items.${key}.label\`)` instead.
   * Kept as optional fallback for transitional compatibility.
   */
  label?: string;
  /**
   * @deprecated Use `t(\`common.categories.items.${key}.description\`)` instead.
   * Kept as optional fallback for transitional compatibility.
   */
  description?: string;
}

interface CategoryGroup {
  key: string;
  /**
   * @deprecated Use `t(\`common.categories.groups.${key}\`)` instead.
   */
  label?: string;
}

// ==========================================
// 7 CATEGORY GROUPS
// ==========================================

const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  FOOD_DRINK: { key: 'FOOD_DRINK' },
  HEALTH_BEAUTY: { key: 'HEALTH_BEAUTY' },
  RETAIL: { key: 'RETAIL' },
  HOME_SERVICES: { key: 'HOME_SERVICES' },
  AUTOMOTIVE: { key: 'AUTOMOTIVE' },
  LIFESTYLE_ENTERTAINMENT: { key: 'LIFESTYLE_ENTERTAINMENT' },
  PROFESSIONAL_SERVICES: { key: 'PROFESSIONAL_SERVICES' },
};

// ==========================================
// CATEGORIES (key + group only — labels in i18n)
// ==========================================

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // ── FOOD & DRINK ──────────────────────────────────────────────
  RESTAURANT: { key: 'RESTAURANT', group: 'FOOD_DRINK' },
  CAFE: { key: 'CAFE', group: 'FOOD_DRINK' },
  BAKERY: { key: 'BAKERY', group: 'FOOD_DRINK' },
  FOOD_DELIVERY: { key: 'FOOD_DELIVERY', group: 'FOOD_DRINK' },
  CATERING: { key: 'CATERING', group: 'FOOD_DRINK' },
  STREET_FOOD: { key: 'STREET_FOOD', group: 'FOOD_DRINK' },

  // ── HEALTH & BEAUTY ───────────────────────────────────────────
  HAIR_SALON: { key: 'HAIR_SALON', group: 'HEALTH_BEAUTY' },
  BARBERSHOP: { key: 'BARBERSHOP', group: 'HEALTH_BEAUTY' },
  NAIL_SALON: { key: 'NAIL_SALON', group: 'HEALTH_BEAUTY' },
  SPA_MASSAGE: { key: 'SPA_MASSAGE', group: 'HEALTH_BEAUTY' },
  SKINCARE_CLINIC: { key: 'SKINCARE_CLINIC', group: 'HEALTH_BEAUTY' },
  PHARMACY: { key: 'PHARMACY', group: 'HEALTH_BEAUTY' },
  GYM_FITNESS: { key: 'GYM_FITNESS', group: 'HEALTH_BEAUTY' },

  // ── RETAIL ────────────────────────────────────────────────────
  FASHION_APPAREL: { key: 'FASHION_APPAREL', group: 'RETAIL' },
  FOOTWEAR: { key: 'FOOTWEAR', group: 'RETAIL' },
  ELECTRONICS_GADGETS: { key: 'ELECTRONICS_GADGETS', group: 'RETAIL' },
  GROCERY_CONVENIENCE: { key: 'GROCERY_CONVENIENCE', group: 'RETAIL' },
  BEAUTY_COSMETICS: { key: 'BEAUTY_COSMETICS', group: 'RETAIL' },
  HOME_LIVING: { key: 'HOME_LIVING', group: 'RETAIL' },

  // ── HOME SERVICES ─────────────────────────────────────────────
  CLEANING_SERVICE: { key: 'CLEANING_SERVICE', group: 'HOME_SERVICES' },
  PLUMBING: { key: 'PLUMBING', group: 'HOME_SERVICES' },
  ELECTRICAL: { key: 'ELECTRICAL', group: 'HOME_SERVICES' },
  AC_APPLIANCE_REPAIR: { key: 'AC_APPLIANCE_REPAIR', group: 'HOME_SERVICES' },
  LANDSCAPING: { key: 'LANDSCAPING', group: 'HOME_SERVICES' },
  MOVING_SERVICE: { key: 'MOVING_SERVICE', group: 'HOME_SERVICES' },
  INTERIOR_DESIGN: { key: 'INTERIOR_DESIGN', group: 'HOME_SERVICES' },

  // ── AUTOMOTIVE ────────────────────────────────────────────────
  CAR_REPAIR: { key: 'CAR_REPAIR', group: 'AUTOMOTIVE' },
  MOTORCYCLE_REPAIR: { key: 'MOTORCYCLE_REPAIR', group: 'AUTOMOTIVE' },
  CAR_WASH: { key: 'CAR_WASH', group: 'AUTOMOTIVE' },
  AUTO_PARTS: { key: 'AUTO_PARTS', group: 'AUTOMOTIVE' },

  // ── LIFESTYLE & ENTERTAINMENT ─────────────────────────────────
  TRAVEL_AGENCY: { key: 'TRAVEL_AGENCY', group: 'LIFESTYLE_ENTERTAINMENT' },
  HOTEL_LODGING: { key: 'HOTEL_LODGING', group: 'LIFESTYLE_ENTERTAINMENT' },
  PHOTOGRAPHY: { key: 'PHOTOGRAPHY', group: 'LIFESTYLE_ENTERTAINMENT' },
  EVENT_VENUE: { key: 'EVENT_VENUE', group: 'LIFESTYLE_ENTERTAINMENT' },
  TUTORING_EDUCATION: { key: 'TUTORING_EDUCATION', group: 'LIFESTYLE_ENTERTAINMENT' },

  // ── PROFESSIONAL SERVICES ─────────────────────────────────────
  LAUNDRY: { key: 'LAUNDRY', group: 'PROFESSIONAL_SERVICES' },
  TAILOR: { key: 'TAILOR', group: 'PROFESSIONAL_SERVICES' },
  PET_SHOP: { key: 'PET_SHOP', group: 'PROFESSIONAL_SERVICES' },
  PET_GROOMING: { key: 'PET_GROOMING', group: 'PROFESSIONAL_SERVICES' },
  PRINT_SHOP: { key: 'PRINT_SHOP', group: 'PROFESSIONAL_SERVICES' },
  RENTAL_PROPERTY: { key: 'RENTAL_PROPERTY', group: 'PROFESSIONAL_SERVICES' },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getCategoryConfig(category: string): CategoryConfig | null {
  return CATEGORY_CONFIG[category] || null;
}

export function getCategoryList(): CategoryConfig[] {
  return Object.values(CATEGORY_CONFIG);
}

export function getCategoriesByGroup(groupKey: string): CategoryConfig[] {
  return Object.values(CATEGORY_CONFIG).filter((cat) => cat.group === groupKey);
}

export function getCategoryGroupList(): CategoryGroup[] {
  return Object.values(CATEGORY_GROUPS);
}

/**
 * Get the i18n key path for a category's label.
 * Use as: `t(getCategoryLabelKey('CAFE'))` → 'common.categories.items.CAFE.label'
 */
export function getCategoryLabelKey(categoryKey: string): string {
  return `common.categories.items.${categoryKey}.label`;
}

/**
 * Get the i18n key path for a category's description.
 */
export function getCategoryDescriptionKey(categoryKey: string): string {
  return `common.categories.items.${categoryKey}.description`;
}

/**
 * Get the i18n key path for a category group's label.
 */
export function getCategoryGroupLabelKey(groupKey: string): string {
  return `common.categories.groups.${groupKey}`;
}
