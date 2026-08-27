'use client';

// ==========================================
// USE SUBSCRIPTION PLAN HOOK — langganan QRIS (Tripay)
//
// Tiers: FREE | STARTER | BUSINESS
//
// Backend sends 999999 for BUSINESS unlimited.
// Frontend treats >= 999 as Infinity (unlimited).
// ==========================================

import { useQuery } from '@tanstack/react-query';
import {
  subscriptionApi,
  type SubscriptionTier,
  type FaseLangganan,
} from '@/lib/api/subscription';
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

  // ── Masa aktif ────────────────────────────────────────────────────────
  // Dihitung SERVER di langganan-aktif.ts, tidak pernah dihitung ulang di
  // sini. Setiap tempat yang menghitungnya sendiri adalah tempat yang bisa
  // berbeda pendapat tentang penjual yang sama.
  /** Boleh memakai alat berbayar. AKTIF dan TENGGANG dua-duanya true. */
  isActive: boolean;
  fase: FaseLangganan;
  /** Sisa hari sampai periodEnd. Negatif berarti sudah lewat. */
  sisaHari: number | null;
  masaTenggangHari: number;
  /** ISO string, apa adanya dari server. */
  periodEnd: string | null;
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
    // Placeholder ini muncul sekejap sebelum jawaban server sampai — dan
    // sekejap itu cukup untuk menampilkan angka yang salah. Nilainya wajib
    // sama persis dengan PLAN_LIMITS.FREE di server (20 / 3 / 2); dulu di
    // sini tertulis 5 / 1 / 2, entah sisa dari mana.
    //
    // `tier: 'FREE'` adalah jebakan yang sudah beberapa kali menggigit:
    // selama isLoading, SETIAP tenant terlihat FREE. Apa pun yang mengunci
    // sesuatu berdasarkan tier WAJIB menunggu isLoading selesai dulu.
    placeholderData: {
      tier: 'FREE' as const,
      status: null,
      periodEnd: null,
      subscription: null,
      isActive: false,
      fase: 'BELUM' as const,
      sisaHari: null,
      masaTenggangHari: 3,
      limits: {
        maxProducts: 20,
        componentBlockVariants: 3,
        maxImagesPerProduct: 2,
      },
      usage: { products: 0 },
      isAtLimit: { products: false },
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
    isActive: data?.isActive ?? false,
    fase: data?.fase ?? 'BELUM',
    sisaHari: data?.sisaHari ?? null,
    masaTenggangHari: data?.masaTenggangHari ?? 3,
    periodEnd: data?.periodEnd ?? null,
  };
}
