import { api } from './client';

// ==========================================
// SUBSCRIPTION API
//
// Backend tiers: FREE | STARTER | BUSINESS
//
// [PANGKAS PRODUK DIGITAL] Tinggal satu provider:
//   Tripay → QRIS lokal, SEKALI BAYAR (tidak auto-renew), tanpa cancel
//
// Pembayaran kartu (LemonSqueezy) dan Stripe Connect sudah dicabut.
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
}

interface SubscriptionRecord {
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
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

/**
 * Fase langganan menurut WAKTU, bukan menurut label status.
 *
 * Dihitung server di `langganan-aktif.ts` supaya klien tidak pernah
 * menghitungnya sendiri — setiap tempat yang menghitungnya sendiri adalah
 * tempat yang bisa berbeda pendapat tentang penjual yang sama.
 */
export type FaseLangganan = 'BELUM' | 'AKTIF' | 'TENGGANG' | 'HABIS';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  periodEnd: string | null;
  subscription: SubscriptionRecord | null;

  /** Boleh memakai alat berbayar. AKTIF dan TENGGANG dua-duanya true. */
  isActive: boolean;
  fase: FaseLangganan;
  /** Sisa hari sampai periodEnd. Negatif berarti sudah lewat. */
  sisaHari: number | null;
  masaTenggangHari: number;

  limits: PlanLimits;
  usage: {
    products: number;
  };
  isAtLimit: {
    products: boolean;
  };
  businessQualified: boolean;
  businessThreshold?: BusinessThreshold;
  salesTrack: {
    totalAmount: number;
    totalCount: number;
  };
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


};
