// ==========================================
// AUTH TYPES
// ==========================================

/**
 * Login request payload
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * Register (seller) request payload — wizard penuh /register
 */
export interface RegisterInput {
  slug: string;
  name: string;
  category: string;
  email: string;
  password: string;
  whatsapp: string;
  description?: string;
  phone?: string;
  address?: string;
}

/**
 * Register buyer request payload — dialog di /discover
 * Hanya email + password. Role BUYER auto-set di server.
 */
export interface RegisterBuyerInput {
  email: string;
  password: string;
}