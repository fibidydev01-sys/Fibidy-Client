// ============================================================================
// FEATURE FLAGS
// File: src/lib/config/features.ts
//
// Satu tempat untuk semua feature flag runtime.
// Dibaca dari env vars NEXT_PUBLIC_* — aman di client bundle.
//
// ── CARA KERJA ────────────────────────────────────────────────────────────
//
// Flag diaktifkan/dinonaktifkan lewat env var di Railway (atau .env.local).
// Tidak perlu deploy ulang kalau Railway env var diubah — cukup restart
// service (Next.js membaca NEXT_PUBLIC_* saat build, jadi untuk perubahan
// permanen tetap perlu rebuild).
//
// ── FLAG YANG ADA ─────────────────────────────────────────────────────────
//
// digitalProducts:
//   Master switch untuk seluruh stack Digital Products (Discover, Library,
//   KYC, storage bar, download history). Default: false.
//   Target reaktivasi: ~2027.
//
// cardPayment:
//   Switch untuk metode pembayaran Kartu (LemonSqueezy) di checkout tier.
//   Saat false → PaymentMethodDialog hanya menampilkan QRIS (Tripay).
//   Saat true  → kedua metode tersedia (QRIS + Kartu).
//   Default: false.
//   Target reaktivasi: ~2026.
//
//   ⚠️ Pastikan backend LEMON_SQUEEZY_API_KEY + LEMON_SQUEEZY_STORE_ID
//   sudah terisi sebelum mengaktifkan flag ini — kalau FE flag true tapi
//   BE credentials kosong, createCheckout() akan 500.
// ============================================================================

export const FEATURES = {
  /**
   * Digital Products feature stack.
   * Controls: Discover, Library, KYC, storage bar, download history.
   * Sync with backend: DIGITAL_PRODUCTS_ENABLED
   */
  digitalProducts:
    process.env.NEXT_PUBLIC_DIGITAL_PRODUCTS_ENABLED === 'true',

  /**
   * Card Payment (LemonSqueezy) checkout.
   * Controls: Credit/Debit Card option in PaymentMethodDialog.
   * Sync with backend: LEMON_SQUEEZY_API_KEY must be configured.
   */
  cardPayment:
    process.env.NEXT_PUBLIC_CARD_PAYMENT_ENABLED === 'true',
} as const;