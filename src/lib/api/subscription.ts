import { api } from './client';

// ==========================================
// SUBSCRIPTION API
//
// Backend tiers: FREE | STARTER | BUSINESS
//
// DUA PROVIDER, PERAN BERBEDA:
//   LemonSqueezy → checkout hosted (redirect), auto-renew, cancel via API
//   Tripay       → QRIS lokal, SEKALI BAYAR (tidak auto-renew), tanpa cancel
//
// Stripe Connect (marketplace digital product) adalah urusan terpisah —
// lihat lib/api/checkout.ts. Tidak ada hubungannya dengan tier subscription.
//
// [IDR MIGRATION — May 2026]
// businessThreshold dikirim BE supaya FE tidak hardcode 3000000 / 20.
//
// [TRIPAY — Aug 2026]
// Ditambah createTripayCheckout() + getTripayPayment().
// ==========================================

export type SubscriptionTier = 'FREE' | 'STARTER' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

/** Status satu transaksi Tripay. Cerminan enum TripayPaymentStatus di BE. */
export type TripayPaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED';

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

/**
 * BUSINESS tier qualifier thresholds.
 * Sumber kebenaran: BE `src/subscription/subscription.constants.ts`.
 * FE baca dari respons API — JANGAN hardcode 3000000 / 20 di manapun.
 */
export interface BusinessThreshold {
  amountIdr: number;
  txCount: number;
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
  businessThreshold?: BusinessThreshold;
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

export interface VerifySubscriptionResponse {
  status: 'pending' | 'completed';
  tier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus | null;
  periodEnd?: string | null;
  source?: string;
}

// ==========================================
// TRIPAY
// ==========================================

/**
 * Respons POST /subscription/checkout/tripay
 *
 * ⚠️ `reused: true` berarti server MENGEMBALIKAN tagihan yang sudah ada —
 * entah karena Idempotency-Key sama (klik ganda) atau karena masih ada QR
 * aktif yang belum kedaluwarsa. BUKAN tagihan baru.
 *
 * UI wajib membedakannya: menampilkan QR lama seolah baru dibuat membuat
 * seller mengira nominalnya bertambah / tagihannya dobel.
 */
export interface TripayCheckoutResponse {
  paymentId: string;
  qrUrl: string | null;
  qrString: string | null;
  checkoutUrl: string | null;
  amount: number;
  status: TripayPaymentStatus;
  expiresAt: string | null;
  reused: boolean;
}

/** Respons GET /subscription/tripay/payments/:id — di-poll halaman tunggu. */
export interface TripayPaymentDetail {
  paymentId: string;
  status: TripayPaymentStatus;
  amount: number;
  tier: SubscriptionTier;
  qrUrl: string | null;
  qrString: string | null;
  checkoutUrl: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  failureReason: string | null;
  createdAt: string;
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
   * Mengembalikan URL checkout LemonSqueezy — FE cukup redirect.
   */
  createCheckout: (tier: 'STARTER' | 'BUSINESS') =>
    api.post<CheckoutResponse>(`/subscription/checkout?tier=${tier}`),

  /**
   * POST /subscription/checkout/tripay?tier=STARTER|BUSINESS
   *
   * ⚠️ HEADER `Idempotency-Key` WAJIB — request tanpa header ini ditolak 400
   * dengan code IDEMPOTENCY_KEY_REQUIRED.
   *
   * ⚠️ ATURAN PEMBUATAN KUNCI — dibaca sebelum memanggil fungsi ini:
   *
   * Kunci dibuat SEKALI PER NIAT BAYAR, bukan sekali per klik.
   *
   * Memanggil `crypto.randomUUID()` langsung di dalam handler onClick
   * menghasilkan kunci BERBEDA untuk klik kedua — server melihat dua niat
   * berbeda, dua transaksi terbit di Tripay, dan seluruh perlindungan hilang
   * persis di skenario yang ia dirancang untuk cegah (seller di sinyal lemah
   * menekan tombol dua kali).
   *
   * Yang benar: generate sekali saat dialog checkout dibuka, simpan di ref,
   * pakai ulang untuk semua percobaan. Lihat useTripayCheckout().
   */
  createTripayCheckout: (
    tier: 'STARTER' | 'BUSINESS',
    idempotencyKey: string,
  ) =>
    api.post<TripayCheckoutResponse>(
      `/subscription/checkout/tripay?tier=${tier}`,
      undefined,
      { headers: { 'Idempotency-Key': idempotencyKey } },
    ),

  /**
   * GET /subscription/tripay/payments/:id
   * Status satu tagihan Tripay — di-poll halaman tunggu QR.
   */
  getTripayPayment: (paymentId: string) =>
    api.get<TripayPaymentDetail>(`/subscription/tripay/payments/${paymentId}`),

  /**
   * POST /subscription/cancel
   *
   * ⚠️ HANYA berlaku untuk langganan LemonSqueezy.
   *
   * Tenant yang aktivasinya lewat Tripay akan menerima 400 dengan code
   * `TRIPAY_NO_AUTORENEW` — itu BUKAN error, itu jawaban: langganan QRIS
   * memang tidak diperpanjang otomatis, jadi tidak ada yang perlu
   * dibatalkan. UI wajib menampilkannya sebagai informasi, bukan kegagalan.
   */
  cancelSubscription: () => api.post<CancelResponse>('/subscription/cancel'),

  /**
   * GET /subscription/verify
   * Poll sampai webhook (LS ATAU Tripay) memproses dan menaikkan tier.
   * Tidak peduli provider mana yang mengaktifkan.
   */
  verify: () => api.get<VerifySubscriptionResponse>('/subscription/verify'),
};
