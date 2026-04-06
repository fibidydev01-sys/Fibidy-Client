
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
 * Register request payload
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

