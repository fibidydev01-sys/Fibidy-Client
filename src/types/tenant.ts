// src/types/tenant.ts
//
// [PHASE D — May 2026]
// Tenant interface: +isEduMode?: boolean
// PublicTenant interface: +isEduMode?: boolean (needed for EduBanner in storefront)
// UpdateTenantInput: isEduMode NOT included — only admin/dedicated endpoint can change it
//
// [PHASE C v2 — May 2026]
// +hasPublishedOnce, +dismissedFirstProductDialog

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
  hasPublishedOnce?: boolean;
  dismissedFirstProductDialog?: boolean;
  // [PHASE D] EDU mode — true jika seller register sebagai Pelajar
  // Tidak ada di UpdateTenantInput — hanya BE yang bisa set
  isEduMode?: boolean;
}

// ── Storefront tenant (public access) ────────────────────────────────────────
// [PHASE D] isEduMode diperlukan storefront untuk render EduBanner
export interface PublicTenant extends BaseTenant {
  _count?: { products: number };
  isEduMode?: boolean;
}

// ── Update input ──────────────────────────────────────────────────────────────
// isEduMode TIDAK ada di sini — hanya admin atau dedicated upgrade endpoint
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
  locationLat?: number | null;
  locationLng?: number | null;
  dismissedFirstProductDialog?: boolean;
}

// ── Complete setup input (wizard submit) ──────────────────────────────────────
export interface CompleteSetupInput {
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  aboutFeatures: FeatureItem[];
  phone: string;
  contactTitle: string;
  contactSubtitle: string;
  hasPhysicalLocation: boolean;
  address?: string;
  contactMapUrl?: string;
  locationLat?: number;
  locationLng?: number;
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
