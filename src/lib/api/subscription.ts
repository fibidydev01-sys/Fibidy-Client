import { api } from './client';

// ==========================================
// TYPES — Stripe Billing
//
// BE tiers: FREE | STARTER | BUSINESS
// Subscription lifecycle: Stripe Checkout → invoice.paid webhook → active
// Cancel: cancel_at_period_end → customer.subscription.deleted → FREE
//
// [TIDUR-NYENYAK FIX #3] Added verify() + reconcile() for
// subscription success page. Mirrors checkout verify pattern.
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
  stripeSubId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
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
  cancelAt: string;
}

// ==========================================
// [TIDUR-NYENYAK FIX #3] VERIFY & RECONCILE TYPES
// ==========================================

/**
 * Response from GET /subscription/verify?sessionId=xxx
 *
 * Used by subscription success page to poll after Stripe redirect.
 * `pending` = webhook hasn't processed yet, keep polling.
 * `completed` = tenant tier upgraded, safe to show success UI.
 */
export interface VerifySubscriptionResponse {
  status: 'pending' | 'completed';
  subscription?: {
    tier: 'STARTER' | 'BUSINESS';
    status: SubscriptionStatus;
    currentPeriodEnd: string;
  };
}

/**
 * Response from POST /subscription/reconcile
 *
 * Manual fallback for when webhook never arrived.
 * Backend calls Stripe API directly to sync subscription state.
 * Safe to call multiple times (idempotent).
 */
export interface ReconcileResponse {
  message: string;
  reconciled: boolean;
  tier: SubscriptionTier;
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
   * Returns Stripe Checkout URL — redirect user there
   */
  createCheckout: (tier: 'STARTER' | 'BUSINESS') =>
    api.post<CheckoutResponse>(`/subscription/checkout?tier=${tier}`),

  /**
   * POST /subscription/cancel
   * Sets cancel_at_period_end — seller stays active until period end
   */
  cancelSubscription: () =>
    api.post<CancelResponse>('/subscription/cancel'),

  /**
   * [TIDUR-NYENYAK FIX #3]
   * GET /subscription/verify?sessionId=xxx
   *
   * Poll this after Stripe Checkout redirect to confirm webhook
   * has processed and tenant tier is upgraded.
   *
   * Returns { status: 'pending' } while waiting for webhook.
   * Returns { status: 'completed', subscription: {...} } when ready.
   */
  verify: (sessionId: string) =>
    api.get<VerifySubscriptionResponse>('/subscription/verify', {
      params: { sessionId },
    }),

  /**
   * [TIDUR-NYENYAK FIX #3]
   * POST /subscription/reconcile
   *
   * Fallback when webhook never arrived (timeout > 60s).
   * Backend calls Stripe API directly to sync subscription state.
   * Idempotent — safe to retry.
   */
  reconcile: () => api.post<ReconcileResponse>('/subscription/reconcile'),
};
