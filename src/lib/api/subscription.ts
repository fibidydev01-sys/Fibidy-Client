import { api } from './client';

// ==========================================
// SUBSCRIPTION API
//
// BE tiers: FREE | STARTER | BUSINESS
// Subscription lifecycle (provider-agnostic):
//   - Stripe Checkout (legacy) OR LemonSqueezy Checkout (active for ID payouts)
//   - Webhook updates DB → tier active
//   - Cancel: cancel-at-period-end → user retains access until ends_at
//
// [TIDUR-NYENYAK FIX #3] Added verify() + reconcile() for
// subscription success page. Mirrors checkout verify pattern.
//
// [PHASE 3 — LEMONSQUEEZY MIGRATION]
//   1. `verify()` now accepts `sessionId?` (optional) — LS path doesn't have
//      a sessionId in the redirect URL, so verify polls DB directly.
//   2. `subscription.billingProvider` exposed in `SubscriptionInfo` so FE
//      can detect whether to offer Stripe-only reconcile UI.
// ==========================================

export type SubscriptionTier = 'FREE' | 'STARTER' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

/**
 * [PHASE 3] Backend exposes which provider is fronting this subscription.
 * - 'STRIPE'         — legacy / future when Stripe supports ID payouts
 * - 'LEMON_SQUEEZY'  — current default (Merchant of Record for Indonesia)
 *
 * FE uses this to decide whether to show the Stripe-only "Force re-check"
 * (reconcile) button on the failed-verification banner.
 */
export type BillingProvider = 'STRIPE' | 'LEMON_SQUEEZY';

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
  /** [PHASE 3] LemonSqueezy subscription identifier */
  lsSubscriptionId?: string | null;
  /** [PHASE 3] Which provider is fronting this subscription */
  billingProvider?: BillingProvider;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  /** [PHASE 3] LS-equivalent of currentPeriodEnd (provider-specific) */
  lsRenewsAt?: string | null;
  lsEndsAt?: string | null;
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
// VERIFY & RECONCILE TYPES
// ==========================================

/**
 * Response from GET /subscription/verify (with or without sessionId)
 *
 * Stripe path: pass sessionId, backend reconciles via Stripe API
 * LS path:     omit sessionId, backend polls Subscription table
 *
 * `pending` = webhook hasn't processed yet, keep polling.
 * `completed` = tenant tier upgraded, safe to show success UI.
 */
export interface VerifySubscriptionResponse {
  status: 'pending' | 'completed';
  tier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus | null;
  periodEnd?: string | null;
  source?: string;
  /** Stripe-specific: present when path went through verify-with-sessionId */
  subscription?: {
    tier: 'STARTER' | 'BUSINESS';
    status: SubscriptionStatus;
    currentPeriodEnd: string;
  };
}

/**
 * Response from POST /subscription/reconcile
 *
 * Stripe-only fallback when webhook never arrived.
 * For LS subscriptions backend returns `reconciled: false, reason: 'no_customer'`
 * (no Stripe customer ID exists). Safe to call regardless — idempotent.
 */
export interface ReconcileResponse {
  message?: string;
  reconciled: boolean;
  tier?: SubscriptionTier;
  reason?: string;
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
   * Returns checkout URL — backend routes to LS or Stripe based on env flags.
   * Frontend just redirects.
   */
  createCheckout: (tier: 'STARTER' | 'BUSINESS') =>
    api.post<CheckoutResponse>(`/subscription/checkout?tier=${tier}`),

  /**
   * POST /subscription/cancel
   * Cancels at period end. User retains access until billing period ends.
   * Backend routes to LS or Stripe based on subscription.billingProvider.
   */
  cancelSubscription: () =>
    api.post<CancelResponse>('/subscription/cancel'),

  /**
   * GET /subscription/verify
   * GET /subscription/verify?sessionId=xxx
   *
   * Dual-mode endpoint:
   *   - Stripe path: pass sessionId from query string after Stripe redirect.
   *     Backend reconciles via Stripe API if webhook is late.
   *   - LS path:     omit sessionId. Backend just polls the DB until tier
   *                  changes (LS webhook updates DB asynchronously).
   *
   * [PHASE 3] sessionId is optional. When omitted (LS path), the backend
   * returns `{ status: 'pending' }` until the LS webhook updates DB,
   * then returns `{ status: 'completed', tier, ... }`.
   *
   * Recommended polling: every 2s, max 60s timeout.
   */
  verify: (sessionId?: string) =>
    api.get<VerifySubscriptionResponse>('/subscription/verify', {
      params: sessionId ? { sessionId } : undefined,
    }),

  /**
   * POST /subscription/reconcile
   *
   * Stripe-specific fallback when checkout webhook never arrived.
   * For LS-only tenants, returns `{ reconciled: false, reason: 'no_customer' }`
   * — call site should check `result.reconciled` before showing success.
   *
   * Idempotent — safe to retry.
   */
  reconcile: () => api.post<ReconcileResponse>('/subscription/reconcile'),
};
