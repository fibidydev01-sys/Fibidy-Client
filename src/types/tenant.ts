// ============================================================================
// FILE: src/types/tenant.ts
//
// [PHASE C — May 2026]
// CompleteSetupInput: address/contactMapUrl made optional + added
//   hasPhysicalLocation, locationLat, locationLng
// Tenant + UpdateTenantInput: added locationLat/Lng for storefront fallback
//
// [PHASE C v2 — May 2026]
// Tenant: + hasPublishedOnce + dismissedFirstProductDialog
// UpdateTenantInput: + dismissedFirstProductDialog
// NOTE: hasPublishedOnce NOT in UpdateTenantInput — only BE sets it
// ============================================================================

import type { TenantLandingConfig } from './landing';

export type TenantRole = 'BUYER' | 'SELLER';

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  twitter?: string;
  whatsapp?: string;
  telegram?: string;
  pinterest?: string;
  linkedin?: string;
  behance?: string;
  dribbble?: string;
  threads?: string;
  vimeo?: string;
}

export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

interface BaseTenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  role: TenantRole;
  category: string;
  description?: string;
  whatsapp?: string;
  phone?: string;
  address?: string;
  logo?: string;
  theme?: { primaryColor?: string };
  landingConfig?: TenantLandingConfig;
  socialLinks?: SocialLinks;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroBackgroundImage?: string;
  aboutFeatures?: FeatureItem[];
  contactTitle?: string;
  contactSubtitle?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;
  // [PHASE C] Location quickstart coordinates
  locationLat?: number | null;
  locationLng?: number | null;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

// ── Dashboard tenant (full private access) ────────────────────────────────────
export interface Tenant extends BaseTenant {
  updatedAt?: string;
  isSetupComplete: boolean;
  setupCompletedAt?: string | null;
  // [PHASE C v2] Onboarding state — persisted in DB
  // hasPublishedOnce: true setelah seller publish di Studio minimal 1x
  // dismissedFirstProductDialog: true setelah seller dismiss dialog di /products
  hasPublishedOnce?: boolean;
  dismissedFirstProductDialog?: boolean;
}

// ── Storefront tenant (public access) ────────────────────────────────────────
export interface PublicTenant extends BaseTenant {
  _count?: { products: number };
}

// ── Update input ──────────────────────────────────────────────────────────────
export interface UpdateTenantInput {
  name?: string;
  description?: string;
  whatsapp?: string;
  phone?: string;
  address?: string;
  logo?: string;
  theme?: { primaryColor?: string };
  landingConfig?: TenantLandingConfig;
  socialLinks?: SocialLinks;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroBackgroundImage?: string;
  aboutFeatures?: FeatureItem[];
  contactTitle?: string;
  contactSubtitle?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;
  // [PHASE C] Location coordinates
  locationLat?: number | null;
  locationLng?: number | null;
  // [PHASE C v2] FE-settable onboarding flag
  // dismissedFirstProductDialog: seller klik "Nanti Saja" di FirstProductDialog
  // hasPublishedOnce: TIDAK ada di sini — hanya BE yang set via publishLandingConfig
  dismissedFirstProductDialog?: boolean;
}

// ── Complete setup input (wizard submit) ──────────────────────────────────────
export interface CompleteSetupInput {
  // Step 1: Visual Identity
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  // Step 2: Store Story
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  // Step 3: Featured Highlights (exactly 3)
  aboutFeatures: FeatureItem[];
  // Step 4: Contact (always mandatory)
  phone: string;
  contactTitle: string;
  contactSubtitle: string;
  // Step 4: Location (CONDITIONAL on hasPhysicalLocation)
  hasPhysicalLocation: boolean;
  address?: string;
  contactMapUrl?: string;
  locationLat?: number;
  locationLng?: number;
  // Step 5: Social Presence (at least 1)
  socialLinks: SocialLinks;
}

export interface UpgradeToSellerInput {
  slug: string;
  name: string;
  category: string;
  whatsapp: string;
}

// ── Settings form data shapes ─────────────────────────────────────────────────
export interface HeroFormData {
  name: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroBackgroundImage: string;
  logo: string;
  primaryColor: string;
  category: string;
}

export interface AboutFormData {
  aboutFeatures: FeatureItem[];
}

export interface ContactFormData {
  contactTitle: string;
  contactSubtitle: string;
  contactMapUrl: string;
  contactShowMap: boolean;
  contactShowForm: boolean;
  phone: string;
  whatsapp: string;
  address: string;
  locationLat?: number | null;
  locationLng?: number | null;
}

export interface SocialFormData {
  socialLinks: SocialLinks;
}

export interface DashboardStats {
  products: {
    total: number;
    active: number;
  };
}
