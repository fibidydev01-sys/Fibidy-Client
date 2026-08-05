// ============================================================================
// FORMAT RUPIAH
// File: src/lib/constants/dashboard/pricing.ts
// ============================================================================
//
// ⚠️ TIDAK ADA KONSTANTA HARGA DI FILE INI, DAN ITU DISENGAJA.
//
// Ada TIGA tempat yang berurusan dengan harga tier, masing-masing punya
// peran yang tidak boleh tertukar:
//
//   1. server/src/subscription/subscription.constants.ts → TIER_PRICE_IDR
//      SATU-SATUNYA angka yang menentukan berapa yang benar-benar ditagih.
//      Endpoint checkout tidak punya parameter `amount` sama sekali.
//
//   2. messages/{id,en}/dashboard.json → subscription.plans.{TIER}.price
//      Label harga untuk DITAMPILKAN di kartu tier. Sudah ada sejak lama
//      ("Rp 35.000", "Rp 149.000") — dipakai apa adanya, jangan diduplikat.
//
//   3. Respons API (TripayPaymentDetail.amount)
//      Nominal SEBENARNYA dari tagihan yang sedang berjalan. Ini yang
//      ditampilkan di halaman tunggu QR — bukan label statis, karena
//      seller berhak melihat angka yang persis akan dia bayar.
//
// Karena itu file ini cuma menyediakan formatter. Menambahkan konstanta
// harga di sini akan membuat tempat keempat yang harus disamakan manual.
//
// ── 🔴 YANG PERLU DICEK SEKARANG ──────────────────────────────────────────
//
// `TIER_PRICE_IDR` di BACKEND masih 0 / 0. Nilai yang benar sudah terbaca
// dari i18n yang ada:
//
//     STARTER  → 35000
//     BUSINESS → 149000
//
// Isi kedua angka itu di backend sebelum checkout Tripay bisa dipakai —
// ada guard di BE yang menolak checkout kalau harganya nol.
//
// ── ⚠️ RISIKO YANG SUDAH ADA (bukan dibuat patch ini) ─────────────────────
//
// Label harga hidup di file i18n PER-LOCALE. Artinya `id/dashboard.json`
// dan `en/dashboard.json` bisa menampilkan angka BERBEDA untuk paket yang
// sama tanpa ada yang gagal di build. Setiap perubahan harga wajib
// menyentuh: backend + id + en, bertiga sekaligus.
//
// Perbaikan yang disarankan kalau nanti sempat: BE mengirim `tierPrices`
// di respons /subscription/me, i18n hanya menyimpan format ("{price}/bulan"),
// dan angkanya satu sumber.
// ============================================================================

/** Rp 35.000 — tanpa desimal, sesuai konvensi harga Rupiah. */
export function formatIdr(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
