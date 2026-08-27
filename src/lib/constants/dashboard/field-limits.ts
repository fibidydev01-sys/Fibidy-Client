// ============================================================================
// FIELD LIMITS — satu daftar batas karakter untuk SELURUH dasbor
// File: src/lib/constants/dashboard/field-limits.ts
//
// ── KENAPA BERKAS INI ADA ──────────────────────────────────────────────────
//
// Sebelum berkas ini, batas karakter ditulis di SEMBILAN tempat, dan
// beberapa di antaranya tidak sepakat:
//
//   setup-store/seller/step-story.tsx      MAX_TITLE = 200, MAX_CTA = 15
//   settings/form/hero/step-identity.tsx   maxLength={15}     (ditulis inline)
//   settings/form/about/step-highlights.tsx MAX_TITLE = 15, MAX_DESC = 100
//   product/form/step-details.tsx          NAME_MAX_LENGTH = 200
//   settings/kasir-mode-dagang.tsx         maxLength={60|120|20|80}
//   settings/kasir-diskon-preset.tsx       maxLength={50}
//   ...dan tiga isian Pengaturan yang TIDAK punya batas sama sekali
//   (Headline, Subheading, Tagline) padahal servernya membatasi ketiganya.
//
// Yang terakhir itu cacat yang sebenarnya: penjual mengetik 400 karakter di
// Tagline, menekan Simpan, dan server menolak dengan pesan berbahasa Inggris
// dari class-validator. Tidak ada penghitung yang memperingatkan, tidak ada
// `maxLength` yang menahan.
//
// ── ATURAN NILAINYA ────────────────────────────────────────────────────────
//
// Angka di sini adalah CERMIN DTO umkm-server, bukan selera. Aturannya satu:
//
//   Batas klien = angka TERKETAT yang bisa dipakai jalur server mana pun.
//
// Itu penting karena beberapa medan punya DUA jalur dengan batas berbeda:
//
//   heroCtaText           complete-setup 15  ·  update-tenant 50   → 15
//   aboutFeature.title    complete-setup 15  ·  update-tenant 100  → 15
//   aboutFeature.desc     complete-setup 100 ·  update-tenant 500  → 100
//
// Memakai angka yang lebih longgar berarti penghitung menjanjikan ruang yang
// akan ditolak server — persis kegagalan yang berkas ini ada untuk mencegah.
// Kalau server melonggarkan batasnya nanti, ubah DI SINI, satu kali.
//
// Nilai `min` ikut dicatat untuk medan yang servernya memakai @MinLength.
// Ia belum dipakai penghitung mana pun; ia ada supaya validasi klien
// berikutnya tidak perlu menebak lagi.
// ============================================================================

export interface FieldLimit {
  /** Batas keras. Dipasang sebagai `maxLength` DAN dipakai penghitung. */
  max: number;
  /** Panjang minimum yang divalidasi server, kalau ada. */
  min?: number;
}

/**
 * Ambang peringatan: penghitung berubah kuning mulai 90% dari batas.
 *
 * SATU rumus untuk semua medan, bukan sembilan angka ajaib. Sebelumnya tiap
 * pemanggil memilih ambangnya sendiri — `max - 2`, `max - 10`, `max - 20`,
 * dan `ratio >= 0.9` — sehingga peringatan muncul di titik yang berbeda-beda
 * tanpa alasan yang bisa dijelaskan ke penjual.
 *
 * 90% dipilih karena ia menghasilkan angka yang masuk akal di kedua ujung
 * skala: 14 dari 15 (satu kata terakhir) dan 900 dari 1000 (satu kalimat
 * terakhir). Ambang tetap seperti `max - 10` akan menyala terlalu dini pada
 * medan pendek dan terlalu telat pada medan panjang.
 */
export function warnThreshold(max: number): number {
  return Math.ceil(max * 0.9);
}

// ─── Toko / Tenant ──────────────────────────────────────────────────────────
// Sumber: umkm-server src/tenants/dto/{update-tenant,complete-setup}.dto.ts

export const TENANT_LIMITS = {
  /** @MinLength(3) @MaxLength(100) */
  name: { max: 100, min: 3 },
  /** @MaxLength(500) — "Tagline Toko" di Pengaturan → Hero. */
  description: { max: 500 },

  /** @MinLength(5) @MaxLength(200) */
  heroTitle: { max: 200, min: 5 },
  /** @MinLength(10) @MaxLength(300) */
  heroSubtitle: { max: 300, min: 10 },
  /**
   * complete-setup 15 · update-tenant 50 → 15.
   *
   * 15 juga batas yang benar secara visual, bukan cuma kompromi antar DTO:
   * tombol CTA di storefront satu baris, dan label 50 karakter memaksanya
   * membungkus atau menyusut sampai tidak terbaca.
   */
  heroCtaText: { max: 15, min: 2 },

  /** @MinLength(3) @MaxLength(200) */
  contactTitle: { max: 200, min: 3 },
  /** @MinLength(5) @MaxLength(300) */
  contactSubtitle: { max: 300, min: 5 },
  /** @MinLength(10) @MaxLength(300) */
  address: { max: 300, min: 10 },

  /** complete-setup 15 · update-tenant 100 → 15. */
  aboutFeatureTitle: { max: 15, min: 2 },
  /** complete-setup 100 · update-tenant 500 → 100. */
  aboutFeatureDescription: { max: 100, min: 10 },
} as const satisfies Record<string, FieldLimit>;

// ─── Produk ─────────────────────────────────────────────────────────────────
// Sumber: umkm-server src/products/dto/create-product.dto.ts

export const PRODUCT_LIMITS = {
  /** @MaxLength(200) */
  name: { max: 200 },
  /**
   * @MaxLength(1000) — dihitung pada STRING MARKDOWN yang disimpan, bukan
   * teks yang terlihat di editor. Lihat catatan di char-counter lama:
   * yang divalidasi server persis string yang sama.
   */
  description: { max: 1000 },
  /** @MaxLength(100) */
  category: { max: 100 },
  /** @MaxLength(50) */
  durasiLabel: { max: 50 },
} as const satisfies Record<string, FieldLimit>;

// ─── Kasir ──────────────────────────────────────────────────────────────────
// Sumber: umkm-server src/kasir/**/dto/*.dto.ts + nilai yang sudah dipakai
// kasir-mode-dagang.tsx dan kasir-diskon-preset.tsx.

export const KASIR_LIMITS = {
  labelMeja: { max: 60 },
  catatanMeja: { max: 120 },
  labelAntrian: { max: 20 },
  catatanAntrian: { max: 80 },
  namaPreset: { max: 50 },
  picNama: { max: 60 },
  alasanVoid: { max: 200 },
} as const satisfies Record<string, FieldLimit>;

/**
 * Seluruh batas dalam satu objek — memudahkan pengukuran dan pengujian
 * ("apakah setiap medan berbatas punya penghitung?") tanpa mengimpor tiga
 * konstanta terpisah.
 */
export const FIELD_LIMITS = {
  tenant: TENANT_LIMITS,
  product: PRODUCT_LIMITS,
  kasir: KASIR_LIMITS,
} as const;
