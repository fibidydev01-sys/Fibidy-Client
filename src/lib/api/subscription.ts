import { api } from './client';

// ==========================================
// SUBSCRIPTION API
//
// Backend tiers: FREE | STARTER | BUSINESS
//
// Subscription billing is handled exclusively by LemonSqueezy as of the
// May 2026 LS-vs-Stripe separation refactor. Stripe is no longer used
// for tier subscriptions — see docs/REFACTOR-PLAN-LS-VS-STRIPE.md.
//
// Stripe Connect (marketplace digital product transactions) is a separate
// concern and is unaffected by this — see lib/api/checkout.ts.
//
// Schema cleanup completed in Batch 4:
//   - Subscription.stripeSubId field removed from DB
//   - Subscription.billingProvider field removed from DB
//   - Tenant.stripeCustomerId field removed from DB
// ==========================================

export type SubscriptionTier = 'FREE' | 'STARTER' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

interface PlanLimits {
  maxProducts: number;
  componentBlockVariants: number;
  maxImagesPerProduct: number;
  maxDigitalProducts: number;
  maxStorageGb: number;
  maxFileSizeMb: number;
  allowedFileTypes: readonly string[];
}

interface SubscriptionRecord {
  lsSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  lsRenewsAt: string | null;
  lsEndsAt: string | null;
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  periodEnd: string | null;
  subscription: SubscriptionRecord | null;
  limits: PlanLimits;
  usage: {
    products: number;
    digitalProducts: number;
    storageMb: number;
  };
  isAtLimit: {
    products: boolean;
    digitalProducts: boolean;
  };
  businessQualified: boolean;
  salesTrack: {
    totalAmount: number;
    totalCount: number;
  };
}

interface CheckoutResponse {
  checkoutUrl: string;
}

interface CancelResponse {
  message: string;
  cancelAt?: string;
}

// ==========================================
// VERIFY RESPONSE
// ==========================================

/**
 * Response from GET /subscription/verify
 *
 * Backend reads the tenant row and returns:
 *   - 'pending'   — webhook hasn't processed yet, keep polling
 *   - 'completed' — tenant tier upgraded, safe to show success UI
 *
 * Recommended polling: every 2s, max 60s timeout.
 */
export interface VerifySubscriptionResponse {
  status: 'pending' | 'completed';
  tier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus | null;
  periodEnd?: string | null;
  source?: string;
}

// ==========================================
// API
// ==========================================

export const subscriptionApi = {
  /** GET /subscription/me — current plan + usage + business qualification */
  getMyPlan: (headers?: HeadersInit) =>
    api.get<SubscriptionInfo>('/subscription/me', { headers }),

  /**
   * POST /subscription/checkout?tier=STARTER|BUSINESS
   * Returns LemonSqueezy hosted checkout URL — frontend just redirects.
   */
  createCheckout: (tier: 'STARTER' | 'BUSINESS') =>
    api.post<CheckoutResponse>(`/subscription/checkout?tier=${tier}`),

  /**
   * POST /subscription/cancel
   * Cancel-at-period-end via LemonSqueezy API.
   * User retains access until billing period ends.
   */
  cancelSubscription: () => api.post<CancelResponse>('/subscription/cancel'),

  /**
   * GET /subscription/verify
   *
   * Polls the backend until LS webhook has processed and upgraded the
   * tenant tier. Returns 'pending' until the webhook lands, then 'completed'.
   *
   * Recommended polling: every 2s, max 60s timeout.
   */
  verify: () => api.get<VerifySubscriptionResponse>('/subscription/verify'),
};
