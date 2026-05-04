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
  /**
   * Phase 1 agreement audit — user must tick the Terms + Privacy checkbox
   * at Review step. BE computes `agreementAcceptedAt` (timestamp) and
   * stamps `agreementVersion` ('v1.0') based on this signal — the FE
   * only carries the boolean consent flag.
   *
   * Required (not optional) because BE rejects registrations where
   * agreement isn't explicitly accepted.
   */
  agreementAccepted: boolean;
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