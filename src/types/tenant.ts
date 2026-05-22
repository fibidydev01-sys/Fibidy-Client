// ============================================================================
// FILE: src/types/tenant.ts — FULL FILE REPLACEMENT
//
// [SETUP-GATE Phase A — May 2026]
// CompleteSetupInput interface rewritten — 14 mandatory fields.
// FeatureItem dan SocialLinks sudah ada di file ini, tidak perlu import baru.
//
// PERUBAHAN vs versi lama:
//   LAMA: logo?, name, description, whatsapp, address?  (5 field)
//   BARU: 14 field mandatory (visual, story, highlights, contact, social)
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
// BASE TENANT
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
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

// ==========================================
// TENANT (dashboard - full access)
// ==========================================

export interface Tenant extends BaseTenant {
  updatedAt?: string;
  isSetupComplete: boolean;
  setupCompletedAt?: string | null;
}

// ==========================================
// PUBLIC TENANT (storefront)
// ==========================================

export interface PublicTenant extends BaseTenant {
  _count?: { products: number };
}

// ==========================================
// UPDATE TENANT INPUT
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
  heroBackgroundImage?: string;
  aboutFeatures?: FeatureItem[];
  contactTitle?: string;
  contactSubtitle?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;
}

// ==========================================
// COMPLETE SETUP INPUT
// [SETUP-GATE Phase A] — 14 mandatory fields
// ==========================================

export interface CompleteSetupInput {
  // ── Step 1: Visual Identity ───────────────────────────────────────────────
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;

  // ── Step 2: Store Story ───────────────────────────────────────────────────
  heroTitle: string;
  heroSubtitle: string;
  /** Max 2 words, 15 chars */
  heroCtaText: string;

  // ── Step 3: Featured Highlights (exactly 3) ───────────────────────────────
  aboutFeatures: FeatureItem[];

  // ── Step 4: Contact & Location ────────────────────────────────────────────
  phone: string;
  address: string;
  contactMapUrl: string;
  contactTitle: string;
  contactSubtitle: string;

  // ── Step 5: Social Presence (at least 1) ─────────────────────────────────
  socialLinks: SocialLinks;
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
// FORM DATA TYPES (Settings pages)
// ==========================================

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