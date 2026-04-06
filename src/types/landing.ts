// ============================================================================
// FILE: src/types/landing.ts
// PURPOSE: Landing page type definitions (storefront-verified fields only)
// ============================================================================

// ==========================================
// BLOCK TYPES
// ==========================================

type HeroBlock = `hero${number}`;
type ProductsBlock = `products${number}`;

// ==========================================
// SECTION CONFIG INTERFACES
// ==========================================

interface HeroSectionConfig {
  ctaText?: string;
  ctaLink?: string;
}

interface ProductsSectionConfig {
  limit?: number;
  showViewAll?: boolean;
}

// ==========================================
// SECTION INTERFACES
// ==========================================

export interface HeroSection {
  enabled?: boolean;
  title?: string;
  subtitle?: string;
  block?: HeroBlock;
  config?: HeroSectionConfig;
}

interface ProductsSection {
  enabled?: boolean;
  block?: ProductsBlock;
  config?: ProductsSectionConfig;
}

// ==========================================
// MAIN CONFIG
// ==========================================

export interface TenantLandingConfig {
  enabled: boolean;
  hero?: HeroSection;
  products?: ProductsSection;
}