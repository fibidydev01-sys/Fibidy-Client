// ============================================================================
// FILE: src/types/tenant.ts
// PURPOSE: Tenant type definitions
// ============================================================================

import type { TenantLandingConfig } from './landing';

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
// PAYMENT SETTINGS
// ==========================================

export type BankName =
  | 'BCA' | 'Mandiri' | 'BRI' | 'BNI' | 'BSI' | 'BTN'
  | 'CIMB Niaga' | 'Permata' | 'Danamon' | 'Maybank ID'
  | 'Panin' | 'Jenius' | 'SeaBank' | 'Blu by BCA'
  | 'Bank Jago' | 'Allo Bank' | 'OCBC Indonesia' | 'Other';

export type EWalletProvider =
  | 'GoPay' | 'OVO' | 'DANA' | 'ShopeePay'
  | 'LinkAja' | 'QRIS' | 'Other';

export type CourierName =
  | 'JNE' | 'J&T Express' | 'SiCepat' | 'SPX Express'
  | 'Ninja Express' | 'Paxel' | 'Lion Parcel' | 'Pos Indonesia'
  | 'TIKI' | 'Pos Laju' | 'GDEX' | 'City-Link Express'
  | 'Thailand Post' | 'Flash Express' | 'Kerry Express'
  | 'SingPost' | 'Lalamove' | 'LBC Express' | '2GO Express'
  | 'JRS Express' | 'GHN' | 'GHTK' | 'Viettel Post'
  | 'Pos Brunei' | 'Ninja Van' | 'DHL Express' | 'Other';

export interface BankAccount {
  id: string;
  bank: BankName;
  enabled: boolean;
}

export interface EWallet {
  id: string;
  provider: EWalletProvider;
  enabled: boolean;
}

interface CodSettings {
  enabled: boolean;
  note?: string;
}

export interface PaymentMethods {
  bankAccounts: BankAccount[];
  eWallets: EWallet[];
  cod: CodSettings;
}

// ==========================================
// SHIPPING SETTINGS
// ==========================================

export interface Courier {
  id: string;
  name: CourierName;
  enabled: boolean;
  note?: string;
}

export interface ShippingMethods {
  couriers: Courier[];
}

// ==========================================
// BASE TENANT (shared between Tenant & PublicTenant)
// ==========================================

interface BaseTenant {
  id: string;
  slug: string;
  name: string;
  email: string;
  category: string;
  description?: string;
  whatsapp?: string;
  phone?: string;
  address?: string;
  logo?: string;
  theme?: { primaryColor?: string };
  landingConfig?: TenantLandingConfig;
  socialLinks?: SocialLinks;
  // Payment & Shipping
  currency: string;
  paymentMethods?: PaymentMethods;
  shippingMethods?: ShippingMethods;
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
  paymentMethods?: PaymentMethods;
  shippingMethods?: ShippingMethods;
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

export interface PembayaranFormData {
  paymentMethods: PaymentMethods;
}

export interface PengirimanFormData {
  shippingMethods: ShippingMethods;
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