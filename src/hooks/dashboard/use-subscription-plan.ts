'use client';

// ==========================================
// USE SUBSCRIPTION PLAN HOOK
// File: src/hooks/dashboard/use-subscription-plan.ts
//
// Infinity tidak bisa di-serialize JSON (jadi null).
// Backend kirim 999999 untuk BUSINESS.
// Frontend treat null / >= 999 sebagai Infinity (unlimited).
// ==========================================

import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription';
import { queryKeys } from '@/lib/shared/query-keys';

interface SubscriptionPlanInfo {
  plan: 'STARTER' | 'BUSINESS';
  blockVariantLimit: number;
  isLoading: boolean;
  isBusiness: boolean;
}

/**
 * Normalize limit dari API:
 * - null / undefined / 0 → Infinity (unlimited)
 * - >= 999 → Infinity (backend kirim 999999 untuk unlimited)
 * - angka valid (misal 3) → pakai apa adanya
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
    // Fallback aman: jangan lock apapun kalau fetch gagal
    placeholderData: {
      subscription: { plan: 'STARTER' } as never,
      limits: { componentBlockVariants: Infinity, maxProducts: Infinity },
      usage: { products: 0 },
      isAtLimit: { products: false },
      isOverLimit: { products: false },
    },
  });

  const plan = data?.subscription.plan ?? 'STARTER';
  const blockVariantLimit = normalizeLimit(data?.limits.componentBlockVariants);

  return {
    plan,
    blockVariantLimit,
    isLoading,
    isBusiness: plan === 'BUSINESS',
  };
}