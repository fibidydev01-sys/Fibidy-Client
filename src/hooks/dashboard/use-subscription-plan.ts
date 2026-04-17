'use client';

// ==========================================
// USE SUBSCRIPTION PLAN HOOK — Stripe Billing
//
// Tiers: FREE | STARTER | BUSINESS
//
// Backend sends 999999 for BUSINESS unlimited.
// Frontend treats >= 999 as Infinity (unlimited).
// ==========================================

import { useQuery } from '@tanstack/react-query';
import { subscriptionApi, type SubscriptionTier } from '@/lib/api/subscription';
import { queryKeys } from '@/lib/shared/query-keys';

interface SubscriptionPlanInfo {
  tier: SubscriptionTier;
  isLoading: boolean;
  isFree: boolean;
  isStarter: boolean;
  isBusiness: boolean;
  /** true if tier is STARTER or BUSINESS — has access to paid features */
  isPaid: boolean;
  /** Max images per product based on tier */
  maxImagesPerProduct: number;
  /** Max block variants for landing page */
  blockVariantLimit: number;
  /** Business unlock gate: seller already qualified? */
  businessQualified: boolean;
  /** Sales tracking for Business qualification progress */
  salesTrack: { totalAmount: number; totalCount: number };
}

/**
 * Normalize limit from API:
 * - null / undefined / 0 → Infinity (unlimited)
 * - >= 999 → Infinity (backend sends 999999 for unlimited)
 * - valid number (e.g. 3) → use as-is
 */
function normalizeLimit(raw: number | null | undefined): number {
  if (raw == null || raw === 0 || raw >= 999) return Infinity;
  return raw;
}

export function useSubscriptionPlan(): SubscriptionPlanInfo {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subscription.plan(),
    queryFn: () => subscriptionApi.getMyPlan(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
    placeholderData: {
      tier: 'FREE' as const,
      status: null,
      periodEnd: null,
      subscription: null,
      limits: {
        maxProducts: 5,
        componentBlockVariants: 1,
        maxImagesPerProduct: 2,
        maxDigitalProducts: 3,
        maxStorageGb: 0.5,
        maxFileSizeMb: 20,
        allowedFileTypes: ['pdf'],
      },
      usage: { products: 0, digitalProducts: 0, storageMb: 0 },
      isAtLimit: { products: false, digitalProducts: false },
      businessQualified: false,
      salesTrack: { totalAmount: 0, totalCount: 0 },
    },
  });

  const tier: SubscriptionTier = data?.tier ?? 'FREE';
  const blockVariantLimit = normalizeLimit(data?.limits.componentBlockVariants);
  const maxImagesPerProduct = data?.limits.maxImagesPerProduct ?? 2;

  return {
    tier,
    isLoading,
    isFree: tier === 'FREE',
    isStarter: tier === 'STARTER',
    isBusiness: tier === 'BUSINESS',
    isPaid: tier === 'STARTER' || tier === 'BUSINESS',
    maxImagesPerProduct,
    blockVariantLimit,
    businessQualified: data?.businessQualified ?? false,
    salesTrack: data?.salesTrack ?? { totalAmount: 0, totalCount: 0 },
  };
}
