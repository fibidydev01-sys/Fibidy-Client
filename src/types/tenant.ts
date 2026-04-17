// ============================================================================
// FILE: src/types/tenant.ts
// PURPOSE: Tenant type definitions — v3 unified
// v3: paymentMethods + shippingMethods REMOVED from schema
// ============================================================================

import type { TenantLandingConfig } from './landing';

// ==========================================
// TENANT ROLE
// ==========================================

export type TenantRole = 'BUYER' | 'SELLER';

// ==========================================
// SOCIAL LINKS
// ==========================================

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

// ==========================================
// FEATURE ITEM (About section)
// ==========================================

export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

// ==========================================
// BASE TENANT (shared between Tenant & PublicTenant)
// v3: paymentMethods + shippingMethods REMOVED
// ==========================================

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
  // Currency (display only)
  currency: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  // Hero Section
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaLink?: string;
  heroBackgroundImage?: string;
  // About Section
  aboutFeatures?: FeatureItem[];
  // Contact Section
  contactTitle?: string;
  contactSubtitle?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;
  // Status
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

// ==========================================
// TENANT (dashboard - full access)
// ==========================================

export interface Tenant extends BaseTenant {
  updatedAt?: string;
}

// ==========================================
// PUBLIC TENANT (storefront - public access)
// ==========================================

export interface PublicTenant extends BaseTenant {
  _count?: { products: number };
}

// ==========================================
// UPDATE TENANT INPUT
// v3: paymentMethods + shippingMethods REMOVED
// ==========================================

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
  heroCtaLink?: string;
  heroBackgroundImage?: string;
  aboutFeatures?: FeatureItem[];
  contactTitle?: string;
  contactSubtitle?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;
}

// ==========================================
// UPGRADE TO SELLER INPUT
// ==========================================

export interface UpgradeToSellerInput {
  slug: string;
  name: string;
  category: string;
  whatsapp: string;
}

// ==========================================
// FORM DATA TYPES
// ==========================================

export interface HeroFormData {
  name: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
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
}

export interface SocialFormData {
  socialLinks: SocialLinks;
}

// ==========================================
// DASHBOARD STATS
// ==========================================

export interface DashboardStats {
  products: {
    total: number;
    active: number;
  };
}
