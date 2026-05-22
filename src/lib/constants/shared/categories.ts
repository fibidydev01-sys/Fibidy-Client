// ==========================================
// CATEGORY REGISTRY
// File: src/lib/constants/shared/categories.ts
//
// [PHASE C — May 2026]
// Added `locationType` per category. Drives adaptive Step 4 in setup wizard:
//   PHYSICAL    → address + map MANDATORY (e.g. restaurant, salon, retail)
//   HOME_BASED  → address + map OPTIONAL (e.g. catering, laundry)
//   ONLINE      → address + map HIDDEN (digital service only)
//   HYBRID      → seller toggle (e.g. photographer, designer)
//
// [POLISH v15.4 — May 2026]
// SoT for category KEYS (RESTAURANT, CAFE, etc.) and grouping.
// Display strings (label + description) live in i18n at
// `common.categories.items.{KEY}.{label,description}`.
// ==========================================

export type LocationType = 'PHYSICAL' | 'HOME_BASED' | 'ONLINE' | 'HYBRID';

interface CategoryConfig {
  key: string;
  group: string;
  /** [PHASE C] Determines Step 4 adaptive behavior in setup wizard */
  locationType: LocationType;
  /**
   * @deprecated Use `t(\`common.categories.items.${key}.label\`)` instead.
   */
  label?: string;
  /**
   * @deprecated Use `t(\`common.categories.items.${key}.description\`)` instead.
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
// CATEGORIES (key + group + locationType — labels in i18n)
// ==========================================

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  // ── FOOD & DRINK ──────────────────────────────────────────────
  RESTAURANT:     { key: 'RESTAURANT',     group: 'FOOD_DRINK', locationType: 'PHYSICAL' },
  CAFE:           { key: 'CAFE',           group: 'FOOD_DRINK', locationType: 'PHYSICAL' },
  BAKERY:         { key: 'BAKERY',         group: 'FOOD_DRINK', locationType: 'PHYSICAL' },
  FOOD_DELIVERY:  { key: 'FOOD_DELIVERY',  group: 'FOOD_DRINK', locationType: 'HOME_BASED' },
  CATERING:       { key: 'CATERING',       group: 'FOOD_DRINK', locationType: 'HOME_BASED' },
  STREET_FOOD:    { key: 'STREET_FOOD',    group: 'FOOD_DRINK', locationType: 'HOME_BASED' },

  // ── HEALTH & BEAUTY ───────────────────────────────────────────
  HAIR_SALON:      { key: 'HAIR_SALON',      group: 'HEALTH_BEAUTY', locationType: 'PHYSICAL' },
  BARBERSHOP:      { key: 'BARBERSHOP',      group: 'HEALTH_BEAUTY', locationType: 'PHYSICAL' },
  NAIL_SALON:      { key: 'NAIL_SALON',      group: 'HEALTH_BEAUTY', locationType: 'PHYSICAL' },
  SPA_MASSAGE:     { key: 'SPA_MASSAGE',     group: 'HEALTH_BEAUTY', locationType: 'PHYSICAL' },
  SKINCARE_CLINIC: { key: 'SKINCARE_CLINIC', group: 'HEALTH_BEAUTY', locationType: 'PHYSICAL' },
  PHARMACY:        { key: 'PHARMACY',        group: 'HEALTH_BEAUTY', locationType: 'PHYSICAL' },
  GYM_FITNESS:     { key: 'GYM_FITNESS',     group: 'HEALTH_BEAUTY', locationType: 'PHYSICAL' },

  // ── RETAIL ────────────────────────────────────────────────────
  FASHION_APPAREL:     { key: 'FASHION_APPAREL',     group: 'RETAIL', locationType: 'PHYSICAL' },
  FOOTWEAR:            { key: 'FOOTWEAR',            group: 'RETAIL', locationType: 'PHYSICAL' },
  ELECTRONICS_GADGETS: { key: 'ELECTRONICS_GADGETS', group: 'RETAIL', locationType: 'PHYSICAL' },
  GROCERY_CONVENIENCE: { key: 'GROCERY_CONVENIENCE', group: 'RETAIL', locationType: 'PHYSICAL' },
  BEAUTY_COSMETICS:    { key: 'BEAUTY_COSMETICS',    group: 'RETAIL', locationType: 'PHYSICAL' },
  HOME_LIVING:         { key: 'HOME_LIVING',         group: 'RETAIL', locationType: 'PHYSICAL' },

  // ── HOME SERVICES ─────────────────────────────────────────────
  CLEANING_SERVICE:    { key: 'CLEANING_SERVICE',    group: 'HOME_SERVICES', locationType: 'HYBRID' },
  PLUMBING:            { key: 'PLUMBING',            group: 'HOME_SERVICES', locationType: 'HYBRID' },
  ELECTRICAL:          { key: 'ELECTRICAL',          group: 'HOME_SERVICES', locationType: 'HYBRID' },
  AC_APPLIANCE_REPAIR: { key: 'AC_APPLIANCE_REPAIR', group: 'HOME_SERVICES', locationType: 'HYBRID' },
  LANDSCAPING:         { key: 'LANDSCAPING',         group: 'HOME_SERVICES', locationType: 'HYBRID' },
  MOVING_SERVICE:      { key: 'MOVING_SERVICE',      group: 'HOME_SERVICES', locationType: 'HYBRID' },
  INTERIOR_DESIGN:     { key: 'INTERIOR_DESIGN',     group: 'HOME_SERVICES', locationType: 'HYBRID' },

  // ── AUTOMOTIVE ────────────────────────────────────────────────
  CAR_REPAIR:        { key: 'CAR_REPAIR',        group: 'AUTOMOTIVE', locationType: 'PHYSICAL' },
  MOTORCYCLE_REPAIR: { key: 'MOTORCYCLE_REPAIR', group: 'AUTOMOTIVE', locationType: 'PHYSICAL' },
  CAR_WASH:          { key: 'CAR_WASH',          group: 'AUTOMOTIVE', locationType: 'PHYSICAL' },
  AUTO_PARTS:        { key: 'AUTO_PARTS',        group: 'AUTOMOTIVE', locationType: 'PHYSICAL' },

  // ── LIFESTYLE & ENTERTAINMENT ─────────────────────────────────
  TRAVEL_AGENCY:      { key: 'TRAVEL_AGENCY',      group: 'LIFESTYLE_ENTERTAINMENT', locationType: 'HYBRID' },
  HOTEL_LODGING:      { key: 'HOTEL_LODGING',      group: 'LIFESTYLE_ENTERTAINMENT', locationType: 'PHYSICAL' },
  PHOTOGRAPHY:        { key: 'PHOTOGRAPHY',        group: 'LIFESTYLE_ENTERTAINMENT', locationType: 'HYBRID' },
  EVENT_VENUE:        { key: 'EVENT_VENUE',        group: 'LIFESTYLE_ENTERTAINMENT', locationType: 'PHYSICAL' },
  TUTORING_EDUCATION: { key: 'TUTORING_EDUCATION', group: 'LIFESTYLE_ENTERTAINMENT', locationType: 'HYBRID' },

  // ── PROFESSIONAL SERVICES ─────────────────────────────────────
  LAUNDRY:          { key: 'LAUNDRY',          group: 'PROFESSIONAL_SERVICES', locationType: 'HOME_BASED' },
  TAILOR:           { key: 'TAILOR',           group: 'PROFESSIONAL_SERVICES', locationType: 'HOME_BASED' },
  PET_SHOP:         { key: 'PET_SHOP',         group: 'PROFESSIONAL_SERVICES', locationType: 'PHYSICAL' },
  PET_GROOMING:     { key: 'PET_GROOMING',     group: 'PROFESSIONAL_SERVICES', locationType: 'HOME_BASED' },
  PRINT_SHOP:       { key: 'PRINT_SHOP',       group: 'PROFESSIONAL_SERVICES', locationType: 'PHYSICAL' },
  RENTAL_PROPERTY:  { key: 'RENTAL_PROPERTY',  group: 'PROFESSIONAL_SERVICES', locationType: 'PHYSICAL' },
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
 * [PHASE C] Get locationType for a category.
 * Fallback: PHYSICAL (most common, safest default).
 */
export function getCategoryLocationType(category: string): LocationType {
  return CATEGORY_CONFIG[category]?.locationType ?? 'PHYSICAL';
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
